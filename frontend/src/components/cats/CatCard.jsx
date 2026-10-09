import { Link } from "react-router";

import { obterNomeStatus } from "../../utils/catOptions";

const coresStatus = {
    disponivel: "bg-green-200 text-green-900",
    indisponivel: "bg-red-100 text-red-900",
    em_observacao: "bg-amber-100 text-amber-900",
    adotado: "bg-purple-100 text-purple-900",
    nao_informado: "bg-gray-200 text-gray-900",
};

export default function CatCard({gato}) {
    return (
        <article className="rounded-2xl border border-lima p-4">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-lilas/30">
                {gato.fotoUrl ? (
                    <img
                    src={gato.fotoUrl}
                    alt={`Foto de ${gato.nome}`}
                    className="h-full w-full object-cover"
                    />
                ) : (
                    <img src="../../public/imagens/icones-patinhascare/GATO SEM FOTO.png"/>
                    )}
            </div>

            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${coresStatus[gato.status] ?? "bg-stone-100 text-stone-700"}`}
            >
                {obterNomeStatus(gato.status)}
            </span>

            <h2 className="mt-3 text-xl font-semibold">
                {gato.nome}
            </h2>

            <p className="mt-1 text-sm text-stone-600">
                {gato.sexo === "nao_informado"
                ? "Sexo não informado"
            : gato.sexo === "femea"
                ? "Fêmea"
                : "Macho"}
            </p>

            <p className="mt-2 min-h-5 text-sm text-stone-600">
                {gato.personalidade.map((tag) => `#${tag}`).join(" ")}
            </p>

            <Link to={`/gatinhos/${gato.id}/editar`}
            aria-label={`Editar ${gato.nome}`}
            className="mt-4 inline-block rounded-lg bg-lilas px-4 py-2 font-medium"
            >
                Editar
            </Link>
        </article>
    )
}