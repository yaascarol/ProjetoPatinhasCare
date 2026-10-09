import { useState } from "react";

import { HealthContext } from "./health-context";

export default function HealthProvider({ children }){
    const [registros, setRegistros] = useState([]);

    function adicionarRegistro(dados){
        const novoRegistro = {
            ...dados,
            id: crypto.randomUUID(),
            criadoEm: new Date().toISOString(),
        };

        setRegistros((atuais) => [novoRegistro, ...atuais]);
    }

    return (
        <HealthContext.Provider value={{ registros, adicionarRegistro }}>
            {children}
        </HealthContext.Provider>
    );
}