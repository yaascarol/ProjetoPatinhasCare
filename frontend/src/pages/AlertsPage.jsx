import { useContext, useState } from "react";
import { Link } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import { HealthContext } from "../contexts/health-context";
import { listarAlertas } from "../utils/alerts";
import { coresStatus, formatarData } from "../utils/health";

const filtros = [
  { valor: "", label: "Todos" },
  { valor: "vencido", label: "Vencidos" },
  { valor: "a_vencer", label: "A vencer" },
];

export default function AlertsPage() {
  const { gatos } = useContext(CatsContext);
  const { registros } = useContext(HealthContext);

  const [filtro, setFiltro] = useState("");

  const alertas = listarAlertas(gatos, registros);

  const filtrados = alertas.filter(
    (alerta) => !filtro || alerta.status === filtro
  );

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Alertas de saúde
        </h1>

        <p className="mt-2 text-stone-600">
          Prazos vencidos ou com vencimento nos próximos 30 dias.
        </p>
      </header>

      <div
        role="group"
        aria-label="Filtrar alertas"
        className="flex flex-wrap gap-3"
      >
        {filtros.map((item) => (
          <button
            key={item.valor}
            type="button"
            aria-pressed={filtro === item.valor}
            onClick={() => setFiltro(item.valor)}
            className={`rounded-xl border border-lilas px-6 py-2 ${
              filtro === item.valor
                ? "bg-roxo text-white"
                : "hover:bg-lilas/30"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <p role="status" className="text-sm text-stone-600">
        {filtrados.length} alerta(s) encontrado(s)
      </p>

      <div className="rounded-2xl border border-lima p-4">
        {filtrados.length === 0 ? (
          <p className="py-8 text-center text-stone-600">
            Nenhum alerta corresponde a este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Alertas de saúde dos gatos
              </caption>

              <thead>
                <tr className="border-b border-lima">
                  <th scope="col" className="p-3">Nome</th>
                  <th scope="col" className="p-3">Acompanhamento</th>
                  <th scope="col" className="p-3">Vencimento</th>
                  <th scope="col" className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtrados.map((alerta) => (
                  <tr
                    key={alerta.id}
                    className="border-b border-lima/50 hover:bg-lilas/20"
                  >
                    <td className="p-3">
                      <Link
                        to={`/saude/${alerta.gatoId}/historico`}
                        className="font-medium underline"
                      >
                        {alerta.nomeGato}
                      </Link>
                    </td>

                    <td className="p-3">{alerta.titulo}</td>

                    <td className="whitespace-nowrap p-3">
                      {formatarData(alerta.proximaData)}
                    </td>

                    <td className="p-3">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 ${
                          coresStatus[alerta.status]
                        }`}
                      >
                        {alerta.status === "vencido"
                          ? "Vencido"
                          : "A vencer"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}