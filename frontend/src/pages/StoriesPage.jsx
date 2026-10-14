import { historiasMock } from "../mocks/stories";
import { formatarData } from "../utils/health";

export default function StoriesPage() {
  const historias = [...historiasMock].sort(
    (a, b) => b.data.localeCompare(a.data)
  );

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

      {historias.length === 0 ? (
        <p className="rounded-2xl border border-lima p-6">
          Nenhuma história cadastrada.
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
                className={`h-48 w-full bg-lilas/20 ${
                  historia.fotoUrl ? "object-cover" : "object-contain"
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