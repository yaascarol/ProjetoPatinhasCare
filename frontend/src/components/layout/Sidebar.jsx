import { NavLink } from "react-router";

const links = [
    { to: "/", label: "Home", icon: "/imagens/icones-patinhascare/HOME.png"},
    { to: "/gatinhos", label: "Gatinhos", icon: "/imagens/icones-patinhascare/GATINHOS.png" },
];

const proximasSecoes = [
    "Saúde",
    "Alertas",
    "Mural de Histórias",
    "Equipe",
];

export default function Sidebar() {
    return (
        <aside className="border-b-2 border-roxo p-4 md:w-56 md:shrink-0 md:border-b-0 md:border-r-4">
            <nav aria-label="Menu principal">
                <ul className="flex flex-wrap gap-2 md:flex-col">
                    {links.map((link) => (
                        <li key={link.to}>
                            <NavLink to={link.to} end={link.to === "/"} className={({ isActive }) =>
                            `flex items-center gap-3 rounded-full px-4 py-3
                            ${isActive ? "bg-lilas font-semibold" : "hover:bg-lilas/30"}`
                            }
                            >
                                <img src={link.icon} alt="" aria-hidden="true" className="h-7 w-7 object-contain"/>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <ul className="mt-5 hidden space-y-4 md:block">
                    {proximasSecoes.map((nome) => (
                        <li key={nome} className="px-4 text-stone-600">
                            <span className="block">{nome}</span>
                            <span className="text-xs">Em breve</span>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}