import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { CatsContext } from "./cats-context";
import {
  listarGatos,
  cadastrarGato,
  editarGato,
} from "../services/catService";

export default function CatsProvider({ children }) {
  const [gatos, setGatos] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        const lista = await listarGatos(controller.signal);

        if (controller.signal.aborted) return;

        setGatos(lista);
        setEstado("pronto");
      } catch (falha) {
        if (controller.signal.aborted) return;

        if (falha.status === 401) {
          setEstado("sem_sessao");
          return;
        }

        setErro("Não foi possível carregar os gatinhos. Tente novamente.");
        setEstado("erro");
      }
    }

    carregar();

    return () => controller.abort();
  }, [tentativa]);

  async function criarGato(dados) {
    const novoGato = await cadastrarGato(dados);

    setGatos((atuais) => [novoGato, ...atuais]);

    return novoGato;
  }

  async function atualizarGato(id, dados) {
    const gatoAtualizado = await editarGato(id, dados);

    setGatos((atuais) =>
      atuais.map((gato) =>
        gato.id === id ? gatoAtualizado : gato
      )
    );

    return gatoAtualizado;
  }

  function tentarNovamente() {
    setErro("");
    setEstado("carregando");
    setTentativa((valor) => valor + 1);
  }

  if (estado === "carregando") {
    return <p className="p-6">Carregando os cadastros...</p>;
  }

  if (estado === "sem_sessao") {
    return <Navigate to="/login" replace />;
  }

  if (estado === "erro") {
    return (
      <div className="space-y-4 p-6">
        <p role="alert">{erro}</p>

        <button
          type="button"
          onClick={tentarNovamente}
          className="rounded-xl bg-roxo px-4 py-2 text-white"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <CatsContext.Provider
      value={{ gatos, criarGato, atualizarGato }}
    >
      {children}
    </CatsContext.Provider>
  );
}