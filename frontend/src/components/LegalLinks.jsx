import { Link } from "react-router";

export default function LegalLinks() {
  return (
    <nav aria-label="Documentos do projeto" className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-lima pt-5 text-center text-sm text-stone-700">
      <Link to="/termos-de-uso" className="rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-roxo">Termos de Uso</Link>
      <Link to="/politica-de-privacidade" className="rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-roxo">Política de Privacidade</Link>
    </nav>
  );
}
