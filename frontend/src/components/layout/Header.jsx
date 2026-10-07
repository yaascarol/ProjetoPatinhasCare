import { Link } from "react-router";

export default function Header() {
    return (
        <header className="border-b-4 border-roxo px-5 py-5">
            <Link to="/" className="inline-flex items-center gap-3"
            >
                    <img src="/imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare" className="h-auto w-50"/>
            </Link>
        </header>
    );
}