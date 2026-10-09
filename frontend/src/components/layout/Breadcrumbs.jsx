import { Link, useLocation } from "react-router";

const nomes = {
    sobre: "Sobre",
    registro: "Registro",
    consulta: "Consulta",
    vacina: "Vacina",
    varmifugo: "Vermífugo",
    exame: "Exame",
    procedimento: "Procedimento",
};

export default function Breadcrumbs() {
    const { pathname } = useLocation();
    const partes = pathname.split("/").filter(Boolean);

    const itens = [{ label: "Home", to: "/" }];

    if (partes[0] === "gatinhos") {
        itens.push({ label: "Gatinhos", to: "/gatinhos" });

        if (partes[1] === "novo") {
            itens.push({ label: "Cadastrar" });
        } else if (partes[2] === "editar") {
            itens.puch({ label: "Editar" });
        }

        else if (partes[0] === "saude") {
            itens.push({ label: "Saúde", to: "/saude" });

            if (partes[1]) {
                const base = `/saude/${partes[1]}`;

                itens.push({
                    label: "Ficha",
                    to: `${base}/sobre`,
                });

                if (nomes[partes[2]]) {
                    itens.push({
                        label: nomes[partes[2]],
                        to: `${base}/${partes[2]}`,
                    });
                }

                if (nomes[partes[3]]) {
                    itens.push({ label: nomes[partes[3]] });
                }
            }
        } else if (partes.length > 0) {
            itens.push({ label: "Página" });
        }

        return (
            <nav aria-label="Caminho da página" className="mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-sm">
                    {itens.map((item, index) => {
                        const ultimo = index === itens.length - 1;

                        return (
                            <li
                                key={`${item.label}-${index}`}
                                className="flex items-center gap-2"
                            >
                                {index > 0 && <span aria-hidden="true">›</span>}

                                {ultimo ? (
                                    <span aria-current="page" className="font-medium">
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link to={item.to} className="underline">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        )
    }
}