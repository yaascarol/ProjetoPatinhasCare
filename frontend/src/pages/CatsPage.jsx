import { useContext } from "react";
import { Link } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import CatCard from "../components/cats/CatCard";
import Input from "../components/ui/Input";
import { statusOptions } from "../utils/catOptions";

export default function CatsPage() {
    const { gatos } = useContext(CatsContext);

    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("");

    const gatosFiltrados = gatos.filter((gato) => {
        const correspondeNome = gato.nome
        .toLocateLowerCase("pt-BR")
        .includes(busca.trim().toLocaleLowerCase("pt-BR"));

        const correspondeStatus = !status || gato.status === status;

        return correspondeNome && correspondeStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify between gap-4">
                <h1 className="text-2xl font-semibold">
                    Gatinhos
                </h1>

                <Link to="/gatinhos/novo"
                className="rounded-xl bg-roxo px-5 py-3 font-semibold text-white"
                >
                    Cadastrar gato
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                id="busca"
                label="Buscar pelo nome"
                placeholder="Ex: Mimo"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                />

                <div className="flex flex-col gap-2">
                    <label htmlFor="filtro-status" className="text-sm font-medium">
                        Status
                    </label>

                    <select
                    id="filtro-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="min-h-11 rounded-xl border border-lima bg-creme px-3"
                    >
                        <option value="">Todos os status</option>

                        {statusOptions.map((opcao) => (
                            <option key={opcao.value} value={opcao.value}>
                                {opcao.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <p role="status" className="text-sm text-stone-600">
                {gatosFiltrados.length} gatinho(s) encontrado(s)
            </p>

            {gatosFiltrados.length === 0 ? (
                <p className="rounded-2xl border border-lima p-6">
            Nenhum gatinho corresponde à busca.
        </p>
        ) : ( <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {gatosFiltrados.map((gato) => (
                <CatCard key={gato.id} gato={gato} />
            ))}
              </div>
    
        )}
        </div>
    );
}