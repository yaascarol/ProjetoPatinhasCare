import { NavLink } from "react-router";

const links = [
    { to: "/", label: "Home", icon: "/imagens/icones-patinhascare/HOME.png" },
    { to: "/gatinhos", label: "Gatinhos", icon: "/imagens/icones-patinhascare/GATINHOS.png" },
    {
        to: "/saude",
        label: "Saúde",
        icon: "/imagens/icones-patinhascare/SAÚDE.png",
    },
    {
        to: "/alertas",
        label: "Alertas",
        icon: "/imagens/icones-patinhascare/ALERTAS.png",
    },
    {
        to: "/historias",
        label: "Mural de Histórias",
        icon: "/imagens/icones-patinhascare/MURAL.png",
    },
    {
        to: "/equipe",
        label: "Equipe",
        icon: "/imagens/icones-patinhascare/EQUIPE.png",
    },
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
                                <img src={link.icon} alt="" aria-hidden="true" className="h-7 w-7 object-contain" />
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

            </nav>
        </aside>
    );
}