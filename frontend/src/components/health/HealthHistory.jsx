import { useContext, useState } from "react";

import { CatsContext } from "../../contexts/cats-context";
import { HealthContext } from "../../contexts/health-context";
import { formatarData, tiposRegistro } from "../../utils/health";
import HealthForm from "./HealthForm";

const secoes = [
  {
    titulo: "Vacinas",
    tipos: ["vacina"],
    vazio: "Nenhuma vacina cadastrada.",
    proxima: true,
  },
  {
    titulo: "Vermifugação",
    tipos: ["vermifugo"],
    vazio: "Nenhuma vermifugação cadastrada.",
    proxima: true,
  },
  {
    titulo: "Histórico médico",
    tipos: ["consulta", "procedimento"],
    vazio: "Nenhum atendimento cadastrado.",
    proxima: false,
  },
  {
    titulo: "Exames",
    tipos: ["exame"],
    vazio: "Nenhum exame cadastrado.",
    proxima: false,
  },
];

export default function HealthHistory({ gatoId }) {
  const { registros, excluirRegistro } = useContext(HealthContext);
  const { gatos } = useContext(CatsContext);

  const [editandoId, setEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [excluindoId, setExcluindoId] = useState(null);

  const gato = gatos.find((item) => item.id === gatoId);

  const historico = registros
    .filter((registro) => registro.gatoId === gatoId)
    .sort(
      (a, b) =>
        b.data.localeCompare(a.data) ||
        b.criadoEm.localeCompare(a.criadoEm)
    );

  const registroEmEdicao = historico.find(
    (registro) => registro.id === editandoId
  );

  async function confirmarExclusao(registro) {
    const confirmado = window.confirm(
      `Excluir "${registro.titulo}", de ${formatarData(registro.data)}, ` +
      `da ficha de ${gato?.nome ?? "este gato"}?`
    );

    if (!confirmado) return;

    setMensagem("");
    setErro("");
    setExcluindoId(registro.id);

    try {
      await excluirRegistro(registro.id);
      setMensagem("Registro excluído.");
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setExcluindoId(null);
    }
  }

  if (registroEmEdicao) {
    return (
      <HealthForm
        key={registroEmEdicao.id}
        gatoId={gatoId}
        tipo={registroEmEdicao.tipo}
        registroInicial={registroEmEdicao}
        onCancel={() => setEditandoId(null)}
        onSaved={() => {
          setEditandoId(null);
          setMensagem("Registro atualizado.");
        }}
      />
    );
  }

  return (
    <div className="space-y-7">
      <p role="status" className="text-sm text-stone-700">
        {mensagem}
      </p>

      {erro && (
        <p role="alert" className="text-red-700">
          {erro}
        </p>
      )}

      {secoes.map((secao) => {
        const grupo = historico.filter((registro) =>
          secao.tipos.includes(registro.tipo)
        );

        return (
          <section key={secao.titulo}>
            <h2 className="mb-3 text-lg font-semibold">
              {secao.titulo}
            </h2>

            {grupo.length === 0 ? (
              <p className="rounded-xl bg-lilas/15 p-4 text-stone-600">
                {secao.vazio}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    {secao.titulo}
                  </caption>

                  <thead>
                    <tr className="border-b border-lima">
                      <th scope="col" className="p-2">Descrição</th>
                      <th scope="col" className="p-2">Data</th>

                      {secao.proxima && (
                        <th scope="col" className="p-2">Próxima</th>
                      )}

                      <th scope="col" className="p-2">Anexo</th>
                      <th scope="col" className="p-2">Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {grupo.map((registro) => (
                      <tr
                        key={registro.id}
                        className="border-b border-lima/50"
                      >
                        <td className="p-2">
                          <p className="text-xs text-stone-600">
                            {tiposRegistro[registro.tipo].label}
                          </p>

                          <p className="font-medium">
                            {registro.titulo}
                          </p>

                          <p className="whitespace-pre-wrap text-stone-600">
                            {registro.observacoes}
                          </p>
                        </td>

                        <td className="whitespace-nowrap p-2">
                          {formatarData(registro.data)}
                        </td>

                        {secao.proxima && (
                          <td className="whitespace-nowrap p-2">
                            {formatarData(registro.proximaData)}
                          </td>
                        )}

                        <td className="p-2">
                          {registro.anexoUrl ? (
                            <a
                              href={registro.anexoUrl}
                              className="break-all underline"
                              rel="noopener"
                              aria-label={`Baixar anexo ${registro.anexoNome}`}
                            >
                              {registro.anexoNome}
                            </a>
                          ) : (
                            "Sem anexo"
                          )}
                        </td>

                        <td className="p-2">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setMensagem("");
                                setErro("");
                                setEditandoId(registro.id);
                              }}
                              aria-label={`Editar ${registro.titulo}`}
                              className="rounded-lg bg-lilas px-3 py-2"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => confirmarExclusao(registro)}
                              disabled={excluindoId === registro.id}
                              aria-label={`Excluir ${registro.titulo}`}
                              className="rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-50"
                            >
                              {excluindoId === registro.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}