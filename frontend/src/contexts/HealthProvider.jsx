import { useState } from "react";

import { HealthContext } from "./health-context";

export default function HealthProvider({ children }) {
    const [todosRegistros, setTodosRegistros] = useState([]);

    const registros = todosRegistros.filter(
        (registro) => !registro.excluidoEm
    );

    function adicionarRegistro(dados) {
        const novoRegistro = {
            ...dados,
            id: crypto.randomUUID(),
            criadoEm: new Date().toISOString(),
            excluidoEm: null,
        };

        setTodosRegistros((atuais) => [novoRegistro, ...atuais]);
    }

    function atualizarRegistro(id, dados) {
        const atualizadoEm = new Date().toISOString();

        setTodosRegistros((atuais) =>
            atuais.map((registro) => {
                if (registro.id !== id || registro.excluidoEm) {
                    return registro;
                }

                return {
                    ...registro,
                    ...dados,
                    id: registro.id,
                    gatoId: registro.gatoId,
                    tipo: registro.tipo,
                    criadoEm: registro.criadoEm,
                    excluidoEm: registro.excluidoEm,
                    atualizadoEm,
                };
            })
        );
    }

    return (
        <HealthContext.Provider value={{ registros, adicionarRegistro }}>
            {children}
        </HealthContext.Provider>
    );
}