import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { HealthContext } from "./health-context";
import {
  cadastrarRegistro,
  editarRegistro,
  excluirRegistro as excluirRegistroApi,
  listarRegistros,
  listarTipos,
} from "../services/healthService";

const tiposVazios = { vacina: [], exame: [], procedimento: [] };

export default function HealthProvider({ children }) {
  const [registros, setRegistros] = useState([]);
  const [tipos, setTipos] = useState(tiposVazios);
  const [estado, setEstado] = useState("carregando");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const [lista, opcoes] = await Promise.all([
          listarRegistros(controller.signal),
          listarTipos(controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setRegistros(lista);
        setTipos({ ...tiposVazios, ...opcoes });
        setEstado("pronto");
      } catch (falha) {
        if (controller.signal.aborted) return;

        setEstado(falha.status === 401 ? "sem_sessao" : "erro");
      }
    }

    carregar();

    return () => controller.abort();
  }, [tentativa]);

  // Um nome novo digitado em "Outro" vira opção no servidor;
  // recarrega a lista para ele aparecer no próximo registro.
  async function atualizarTipos() {
    try {
      const opcoes = await listarTipos();
      setTipos({ ...tiposVazios, ...opcoes });
    } catch {
      // A lista antiga continua válida; o registro já foi salvo.
    }
  }

  async function adicionarRegistro(dados) {
    const novo = await cadastrarRegistro(dados);

    setRegistros((atuais) => [novo, ...atuais]);
    await atualizarTipos();

    return novo;
  }

  async function atualizarRegistro(id, dados) {
    const atualizado = await editarRegistro(id, dados);

    setRegistros((atuais) =>
      atuais.map((registro) => (registro.id === id ? atualizado : registro))
    );
    await atualizarTipos();

    return atualizado;
  }

  async function excluirRegistro(id) {
    await excluirRegistroApi(id);

    setRegistros((atuais) => atuais.filter((registro) => registro.id !== id));
  }

  if (estado === "carregando") {
    return <p className="p-6">Carregando os registros de saúde...</p>;
  }

  if (estado === "sem_sessao") {
    return <Navigate to="/login" replace />;
  }

  if (estado === "erro") {
    return (
      <div className="space-y-4 p-6">
        <p role="alert">
          Não foi possível carregar os registros de saúde. Tente novamente.
        </p>

        <button
          type="button"
          onClick={() => {
            setEstado("carregando");
            setTentativa((valor) => valor + 1);
          }}
          className="rounded-xl bg-roxo px-4 py-2 text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <HealthContext.Provider
      value={{
        registros,
        tipos,
        adicionarRegistro,
        atualizarRegistro,
        excluirRegistro,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}
