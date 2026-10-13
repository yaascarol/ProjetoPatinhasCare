import { useContext } from "react";
import { Link, useParams } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import HealthForm from "../components/health/HealthForm";
import HealthHistory from "../components/health/HealthHistory";

import { formatarData, tiposRegistro } from "../utils/health";

const abas = [
  { valor: "sobre", label: "Sobre" },
  { valor: "registro", label: "Registro" },
  { valor: "historico", label: "Histórico" },
];

export default function HealthDetailPage() {
  const { id, aba, tipo = "consulta" } = useParams();
  const { gatos } = useContext(CatsContext);

  const gato = gatos.find((item) => item.id === id);
  const abaValida = abas.some((item) => item.valor === aba);

  if (
    !gato ||
    !abaValida ||
    (aba === "registro" && !Object.hasOwn(tiposRegistro, tipo))
  ) {
    return (
      <section>
        <h1 className="text-xl font-semibold">Ficha não encontrada</h1>
        <Link to="/saude" className="mt-4 inline-block underline">
          Voltar para saúde
        </Link>
      </section>
    );
  }

  const base = `/saude/${gato.id}`;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center gap-4">
        <img
          src={
            gato.fotoUrl ||
            "/imagens/icones-patinhascare/GATO SEM FOTO.png"
          }
          alt=""
          className="h-20 w-20 rounded-2xl bg-lilas object-cover"
        />

        <div>
          <h1 className="text-2xl font-semibold">{gato.nome}</h1>
          <p className="text-stone-600">
            Nascimento: {formatarData(gato.dataNascimento)}
          </p>
        </div>

        <Link
          to={`/gatinhos/${gato.id}/editar`}
          className="ml-auto rounded-xl bg-roxo px-4 py-2 text-white"
        >
          Editar cadastro
        </Link>
      </header>

      <nav aria-label="Seções da ficha" className="flex flex-wrap gap-6">
        {abas.map((item) => (
          <Link
            key={item.valor}
            to={`${base}/${item.valor}`}
            aria-current={aba === item.valor ? "page" : undefined}
            className={
              aba === item.valor
                ? "border-b-2 border-lima pb-2 font-semibold"
                : "pb-2"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl border border-lima p-5">
        {aba === "sobre" && (
          <div className="space-y-5">
            <div>
              <h2 className="font-semibold">História</h2>
              <p className="mt-2 whitespace-pre-wrap">
                {gato.descricao || "História não informada."}
              </p>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Nascimento</dt>
                <dd>{formatarData(gato.dataNascimento)}</dd>
              </div>

              <div>
                <dt className="font-semibold">Data de entrada</dt>
                <dd>{formatarData(gato.dataEntrada)}</dd>
              </div>

              <div>
                <dt className="font-semibold">Sexo</dt>
                <dd>
                  {gato.sexo === "femea"
                    ? "Fêmea"
                    : gato.sexo === "macho"
                      ? "Macho"
                      : "Não informado"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">Status</dt>
                <dd>{gato.status.replaceAll("_", " ")}</dd>
              </div>
            </dl>

            <div>
              <h2 className="font-semibold">Personalidade</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {gato.personalidade.length > 0
                  ? gato.personalidade.map((tag) => (
                      <span key={tag} className="rounded bg-lilas px-3 py-1">
                        {tag}
                      </span>
                    ))
                  : "Não informada"}
              </div>
            </div>
          </div>
        )}

        {aba === "registro" && (
          <div className="space-y-6">
            <nav
              aria-label="Tipos de registro"
              className="flex flex-wrap gap-2"
            >
              {Object.entries(tiposRegistro).map(([valor, config]) => (
                <Link
                  key={valor}
                  to={`${base}/registro/${valor}`}
                  aria-current={tipo === valor ? "page" : undefined}
                  className={`rounded-lg border border-lima px-3 py-2 ${
                    tipo === valor ? "bg-lilas" : ""
                  }`}
                >
                  {config.label}
                </Link>
              ))}
            </nav>

            <HealthForm
              key={`${gato.id}-${tipo}`}
              gatoId={gato.id}
              tipo={tipo}
            />
          </div>
        )}

        {aba === "historico" && <HealthHistory gatoId={gato.id} />}
      </div>

      <Link to="/saude" className="inline-block underline">
        Voltar para saúde
      </Link>
    </section>
  );
}