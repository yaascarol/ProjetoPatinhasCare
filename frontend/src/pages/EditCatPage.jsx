import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import CatForm from "../components/cats/CatForm"

export default function EditCatPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { gatos, atualizarGato } = useContext(CatsContext);

    const gato = gatos.find((item) => item.id === id);

    function handleAtualizar(dados) {
        atualizarGato(id, dados);
        navigate("/gatinhos");
    }

    if(!gato){
        return (
            <section>
                <h1 className="text-2xl font-semibold">
                    Gatinho não encontrado
                </h1>

                <Link to="/gatinhos" className="mt-4 inline-block underline">
                Voltar para a aba de gatinhos
                </Link>
            </section>
        );
    }

    return (
        <section>
            <Link to="/gatinhos" className="text-sm underline">
                Voltar para a aba de gatinhos
            </Link>

            <h1 className="mt-4 text-2xl font-semibold">
                Editar {gato.nome}
            </h1>

            <CatForm
            key={gato.id}
            initialValues={gato}
            onSubmit={handleAtualizar}
            submitLabel="Salvar alterações"
            />
        </section>
    );
}