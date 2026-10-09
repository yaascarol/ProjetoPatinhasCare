import { Link } from "react-router";

export default function Header() {
    return (
        <header className="border-b-4 border-roxo px-5 py-2">
            <Link to="/" className="inline-flex items-center"
            >
                    <img src="/imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare" className="block h-20 w-auto object-contain"/>
            </Link>
        </header>
    );
}