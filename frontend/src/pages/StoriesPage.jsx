import { useState } from "react";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { historiasMock } from "../mocks/stories";
import { formatarData } from "../utils/health";

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export default function StoriesPage() {
  const [busca, setBusca] = useState("");
  const [termoAplicado, setTermoAplicado] = useState("");

  const historias = [...historiasMock]
    .filter((historia) =>
      normalizarTexto(historia.nomeGato ?? "").includes(
        normalizarTexto(termoAplicado)
      )
    )
    .sort((a, b) => b.data.localeCompare(a.data));

  function buscar(event) {
    event.preventDefault();
    setTermoAplicado(busca);
  }

  function limparBusca() {
    setBusca("");
    setTermoAplicado("");
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Mural de histórias
        </h1>

        <p className="mt-2 text-stone-600">
          Histórias de como chegaram ao abrigo e como estão agora.
        </p>

        <p className="mt-2 text-sm text-stone-600">
          Conteúdo fictício para demonstração.
        </p>
      </header>

      <form
        onSubmit={buscar}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            id="buscar-historia"
            label="Buscar pelo nome do gatinho"
            placeholder="Ex.: Luna"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <Button type="submit">Buscar</Button>

        <Button variant="secondary" onClick={limparBusca}>
          Limpar
        </Button>
      </form>

      <p role="status" className="text-sm text-stone-600">
        {historias.length} história(s) encontrada(s)
      </p>

      {historias.length === 0 ? (
        <p className="rounded-2xl border border-lima p-6">
          {termoAplicado.trim()
            ? "Nenhuma história encontrada para esse gatinho."
            : "Nenhuma história cadastrada."}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {historias.map((historia) => (
            <article
              key={historia.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-lima"
            >
              <img
                src={
                  historia.fotoUrl ||
                  "/imagens/icones-patinhascare/GATO SEM FOTO.png"
                }
                alt=""
                className={`h-48 w-full bg-lilas/20 ${historia.fotoUrl ? "object-cover" : "object-contain"
                  }`}
              />

              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-semibold">
                  {historia.titulo}
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
                  {historia.texto}
                </p>

                <footer className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <time
                    dateTime={historia.data}
                    className="text-sm text-stone-600"
                  >
                    {formatarData(historia.data)}
                  </time>

                  <span className="rounded-full bg-stone-200 px-3 py-1 text-xs">
                    {historia.status === "rascunho"
                      ? "Rascunho"
                      : "Publicada"}
                  </span>
                </footer>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}