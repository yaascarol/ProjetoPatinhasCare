import { useContext } from "react";
import { Link } from "react-router";

import { CatsContext } from "../contexts/cats-context.js"
import { HealthContext } from "../contexts/health-context";

import { listarAlertas } from "../utils/alerts";

function tempoDesde(valor) {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "Data não informada";
    const hoje = new Date();
    const dia = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    const dias = Math.max(0, Math.floor((dia(hoje) - dia(data)) / 86400000));
    if (dias === 0) return "hoje";
    if (dias < 30) return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;
    const anos = Math.floor(dias / 365);
    return anos < 1 ? "há 11 meses" : `há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}

function Aviso() {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 text-stone-600" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 3 2 21h20L12 3Z" strokeLinejoin="round" /><path d="M12 9v5m0 3v1" /></svg>;
}

export default function HomePage() {
    const { gatos } = useContext(CatsContext);

    const noAbrigo = gatos.filter((gato) =>
        ["disponivel", "indisponivel", "em_observacao", "nao_informado"].includes(
            gato.status
        )
    ).length;

    const adotados = gatos.filter(
        (gato) => gato.status === "adotado(a)"
    ).length;

    const { registros } = useContext(HealthContext);

    const alertasAtivos = listarAlertas(gatos, registros);

    const fichasIncompletas = gatos.filter(
        (gato) => !gato.dataNascimento || gato.sexo === "nao_informado"
    );

    const ultimosCadastros = [...gatos]
        .sort(
            (a, b) =>
                new Date(b.criadoEm).getTime() -
                new Date(a.criadoEm).getTime()
        )
        .slice(0, 5);

    const indicadores = [
        {
            label: "Gatos no abrigo",
            valor: noAbrigo,
            icone: "/imagens/icones-patinhascare/GATOS COUNT.png",
        },
        {
            label: "Gatos adotados",
            valor: adotados,
            icone: "/imagens/icones-patinhascare/GATOS ADOTADOS.png",
        },
        {
            label: "Alertas ativos",
            valor: alertasAtivos.length,
            icone: "/imagens/icones-patinhascare/ALERTAS COUNT.png",
        },
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
                        className="flex items-center gap-4 rounded-2xl border border-lima p-6"
                    >
                        <div
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-roxo p-2"
                        >
                            <img
                                src={indicador.icone}
                                alt=""
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div>
                            <p className="text-4xl font-semibold">
                                {indicador.valor}
                            </p>
                            <h2 className="mt-2 text-stone-700">
                                {indicador.label}
                            </h2>
                        </div>
                    </article>
                ))}
            </section>

            <section aria-labelledby="home-alertas" className="rounded-3xl border border-lima p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 id="home-alertas" className="flex items-center gap-2 text-xl font-medium">Alertas de saúde <Aviso /></h2>
                    <Link to="/alertas" className="rounded text-sm text-purple-800 hover:underline focus-visible:outline-2 focus-visible:outline-roxo">Ver todos <span aria-hidden="true">→</span></Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-80 border-collapse text-center text-sm">
                        <caption className="sr-only">Até cinco alertas, em ordem de vencimento</caption>
                        <thead><tr>
                            {["Nome", "Procedimento", "Status"].map(titulo => <th key={titulo} scope="col" className="border border-stone-400 px-3 py-2 font-medium">{titulo}</th>)}
                        </tr></thead>
                        <tbody>
                            {alertasAtivos.slice(0, 5).map(alerta => (
                                <tr key={alerta.id} className="transition-colors hover:bg-lilas/60 focus-within:bg-lilas/60">
                                    <td className="border border-stone-400 px-3 py-2"><Link to={`/saude/${alerta.gatoId}/historico`} className="block rounded hover:underline focus-visible:outline-2 focus-visible:outline-roxo">{alerta.nomeGato}</Link></td>
                                    <td className="border border-stone-400 px-3 py-2">{alerta.titulo}</td>
                                    <td className="border border-stone-400 px-3 py-2"><span className={`inline-block min-w-20 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-medium ${alerta.status === "vencido" ? "bg-red-200 text-red-900" : "bg-amber-200 text-amber-950"}`}>{alerta.status === "vencido" ? "Vencido" : "A vencer"}</span></td>
                                </tr>
                            ))}
                            {!alertasAtivos.length && <tr><td colSpan={3} className="border border-stone-400 px-4 py-6 text-stone-600">Nenhum prazo vencido ou a vencer.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-[1.25fr_1fr]">
                <section aria-labelledby="home-fichas" className="min-w-0 rounded-3xl border border-lima p-4 sm:min-h-64 sm:p-5">
                    <h2 id="home-fichas" className="flex items-center gap-2 text-xl font-medium">Fichas incompletas <Aviso /></h2>
                    {!fichasIncompletas.length ? <p className="mt-6 text-sm text-stone-600">Nenhuma pendência de nascimento ou sexo.</p> : (
                        <ul className="mt-6 text-sm">
                            {fichasIncompletas.map(gato => (
                                <li key={gato.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                                    <Link to={`/gatinhos/${gato.id}/editar`} className="break-words py-2 pr-4 hover:underline focus-visible:outline-roxo">{gato.nome}</Link>
                                    <span className="border-l border-stone-400 py-2 pl-4 text-stone-700">{[!gato.dataNascimento && "Nascimento não informado", gato.sexo === "nao_informado" && "Sexo não informado"].filter(Boolean).join(" · ")}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <section aria-labelledby="home-cadastros" className="min-w-0 rounded-3xl border border-lima p-4 sm:min-h-64 sm:p-5">
                    <h2 id="home-cadastros" className="text-xl font-medium">Últimos cadastros</h2>
                    {!ultimosCadastros.length ? <p className="mt-6 text-sm text-stone-600">Nenhum gatinho cadastrado.</p> : (
                        <ul className="mt-6 text-sm">
                            {ultimosCadastros.map(gato => (
                                <li key={gato.id} className="grid grid-cols-2">
                                    <Link to={`/gatinhos/${gato.id}/editar`} className="break-words py-2 pr-4 hover:underline focus-visible:outline-roxo">{gato.nome}</Link>
                                    <span title={new Date(gato.criadoEm).toLocaleDateString("pt-BR")} className="border-l border-stone-400 py-2 pl-4 text-stone-700">{tempoDesde(gato.criadoEm)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
