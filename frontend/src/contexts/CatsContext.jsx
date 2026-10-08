import { useState } from "react";

import { CatsContext } from "./cats-context";
import { gatosMock } from "../mocks/cats";

export default function CatsProvider({ children }) {
    const [gatos, setGatos] = useState(gatosMock);

    function criarGato(dados) {
        const novoGato = {
            ...dados,
            id: crypto.randomUUID(),
            criadoEm: new Date().toISOString(),
        };

        setGatos((atuais) => [novoGato, ...atuais]);
    }

    function atualizarGato(id, dados) {
        setGatos((atuais) => 
        atuais.map((gato) =>
            gato.id === id
        ? {
            ...gato,
            ...dados,
            id: gato.id,
            atualizadoEm: new Date().toISOString(),
        }
        : gato
        )
    );
    }

    return (
        <CatsContext.Provider
        value={{ gatos, criarGato, atualizarGato }}
        >
            {children}  
        </CatsContext.Provider>
    );
}