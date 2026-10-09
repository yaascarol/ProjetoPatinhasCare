import { useContext } from "react";
import { Link, useNavigate } from "react-router";

import { CatsContext } from "../contexts/cats-context";
import CatForm from "../components/cats/CatForm";

export default function CreateCatPage() {
    const { criarGato } = useContext(CatsContext);
    const navigate = useNavigate();

    function handleCriar(dados){
        criarGato(dados);
        navigate("/gatinhos");
    }

    return(
        <section>
            <Link to="/gatinhos" className="text-sm underline">
            Voltar para gatinhos
            </Link>

            <h1 className="mt-4 text-2xl font-semibold">
                Cadastrar gato
            </h1>

            <CatForm onSubmit={handleCriar}/>
        </section>
    );
}