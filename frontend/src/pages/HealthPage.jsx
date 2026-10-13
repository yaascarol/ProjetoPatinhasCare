import { useContext, useState } from "react";
import { Link } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import { HealthContext } from "../contexts/health-context";
import Input from "../components/ui/Input";

import {
  acompanhamentosAtuais,
  coresStatus,
  nomeStatus,
  statusDoPrazo,
  statusGeral,
} from "../utils/health";

export default function HealthPage() {
  const { gatos } = useContext(CatsContext);
  const { registros } = useContext(HealthContext);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");

  const fichas = gatos.map((gato) => {
    const registrosDoGato = registros.filter(
      (registro) => registro.gatoId === gato.id
    );

    return {
      gato,
      status: statusGeral(registrosDoGato),
      acompanhamentos: acompanhamentosAtuais(registrosDoGato),
    };
  });

  const filtradas = fichas.filter(({ gato, status }) => {
    const correspondeNome = gato.nome
      .toLocaleLowerCase("pt-BR")
      .includes(busca.trim().toLocaleLowerCase("pt-BR"));

    return correspondeNome && (!filtro || status === filtro);
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Saúde</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="busca-saude"
          label="Buscar gato"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="status-saude">Status dos prazos</label>

          <select
            id="status-saude"
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            className="min-h-11 rounded-xl border border-lima bg-creme px-3"
          >
            <option value="">Todos</option>

            {Object.entries(nomeStatus).map(([valor, nome]) => (
              <option key={valor} value={valor}>
                {nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" className="text-sm text-stone-600">
        {filtradas.length} gatinho(s) encontrado(s)
      </p>

      <div className="grid gap-5 lg:grid-cols-2">
        {filtradas.map(({ gato, status, acompanhamentos }) => (
          <article
            key={gato.id}
            className="flex flex-col rounded-2xl border border-lilas p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{gato.nome}</h2>

              <span
                className={`rounded-lg px-2 py-1 text-xs ${coresStatus[status]}`}
              >
                {nomeStatus[status]}
              </span>
            </div>

            <div className="my-5 flex flex-wrap gap-2">
              {acompanhamentos.length === 0 ? (
                <p className="text-sm text-stone-600">
                  Sem registros de vacina ou vermífugo.
                </p>
              ) : (
                acompanhamentos.map((registro) => {
                  const estado = statusDoPrazo(registro);

                  return (
                    <span
                      key={registro.id}
                      className={`rounded-lg px-3 py-1 text-sm ${coresStatus[estado]}`}
                    >
                      {registro.titulo} · {nomeStatus[estado]}
                    </span>
                  );
                })
              )}
            </div>

            <Link
              to={`/saude/${gato.id}/sobre`}
              className="mt-auto self-end rounded-lg bg-lilas px-4 py-2"
            >
              Abrir ficha
            </Link>
          </article>
        ))}
      </div>

      {filtradas.length === 0 && (
        <p>Nenhum gatinho corresponde aos filtros.</p>
      )}
    </section>
  );
}