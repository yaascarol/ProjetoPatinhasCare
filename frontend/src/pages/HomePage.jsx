import { Link } from "react-router";

export default function HomePage() {

    return (
        <main className="min-h-screen bg-creme p-8 sm:p-10">
            <section className="mx-auto max-w-5xl">
                <p className="text-sm text-stone-600">
                    PatinhasCare
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Visão geral do abrigo
                </h1>

                <div className="mt-6 rounded-2xl border border-lima p-6">
                    <h2 className="text-lg font-medium">
                        Navegação funcionando
                    </h2>

                    <p className="mt-2 text-stone-600">
                        na proxima etapa, acrescentaremos o menu lateral, indicadores e alertas do abrigo.
                    </p>
                </div>

                <Link to="/login" className="mt-6 inline-block rounded text-texto underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-roxo">
                Voltar ao login
                </Link>
            </section>
        </main>
    );
}