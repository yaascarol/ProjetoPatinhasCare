import { useContext } from "react";
import { Link } from "react-router";

import {CatsContext } from "../contexts/cats-context.js"
import { alertsMock } from "../mocks/alerts.js";

export default function HomePage() {
    const { gatos } = useContext(CatsContext);

    const noAbrigo = gatos.filter((gato) =>
    ["disponivel", "indisponivel", "em_observacao", "nao_informado"].includes(
        gato.status
    )
).length;

const adotados = gatos.filter(
    (gato) => gato.status === "adotado"
).length;

const alertasAtivos = alertsMock.filter(
    (alerta) => !alerta.resolvido
);

const fichasIncompletas = gatos.filter(
    (gato) => !gato.dataNascimento || gato.sexo === "nao_informado"
);

const ultimosCadastros = [...gatos]
.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
.slice(0, 5)

const indicadores = [
    { label: "Gatos no abrigo", valor: noAbrigo },
    { label: "Gatos adotados", valor: adotados },
    { label: "Alertas ativos", valor: alertasAtivos.length },
];

    return (

        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">
                Visão geral
            </h1>

            <section
            aria-label="Indicadores"
            className="grid gap-4 sm:grid-cols-3"
            >
                {indicadores.map((indicador) => (
                    <article
                    key={indicador.label}
                    className="rounded-2xl border border-lima p-6"
                    >
                        <p className="text-4xl font-semibold">
                            {indicador.valor}
                        </p>
                        <h2 className="mt-2 text-stone-700">
                            {indicador.label}
                        </h2>
                    </article>
                ))}
            </section>

            <section className="rounded-2xl border border-lima p-5">
                <h2 className="text-lg font-semibold">
                    Alertas de saúde
                </h2>

                <p className="mt-3 text-stone-600">
                    Módulo de saúde ainda em implantação.
                    Sem alertas para demonstração cadastrados.
                </p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-2xl border border-lima p-5">
                    <h2 className="text-lg font-semibold">
                        Fichas com informações pendentes
                    </h2>

                    {fichasIncompletas.length === 0 ? (
                        <p className="mt-3 text-stone-600">
                            Nenhuma pendência de nascimento ou sexo.
                        </p>
                    ) : (
                        <ul className="mt-3 space-y-3">
                            {fichasIncompletas.map((gato) => (
                                <li key={gato.id}>
                                    <Link to={`/gatinhos/${gato.id}/editar`}
                                    className="font-medium underline"
                                    >
                                        {gato.nome}
                                    </Link>

                                    <p className="text-sm text-stone-60">
                                        {[
                                            !gato.dataNascimento && "Nascimento não informado",
                                            gato.sexo === "nao_informado" && "Sexo não informado",
                                        ]
                                        .filter(Boolean)
                                        .join(" . ")
                                        }
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded-2xl border border-lima p-5">
                    <h2 className="text-lg font-semibold">
                        Últimos cadastros
                    </h2>

                    {ultimosCadastros.length === 0 && (
                        <p className="mt-3 text-stone-600">
                            Nenhum gatinho cadastrado
                        </p>
                    )}

                    <ul className="mt-3 space-y-3">
                        {ultimosCadastros.map((gato) => (
                            <li key={gato.id}
                            className="flex justify-between gap-4"
                            >
                                <Link to={`/gatinhos/${gato.id}/editar`}
                                className="underline"
                                >
                                    {gato.nome}
                                </Link>

                                <span className="text-sm text-stone-600">
                                    {new Date(gato.criadoEm).toLocaleDateString("pt-BR")}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}