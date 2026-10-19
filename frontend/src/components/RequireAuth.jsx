import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

import { api } from "../services/api";

export default function RequireAuth() {
    const [estado, setEstado] = useState("carregando");

    useEffect(() => {
        let ativo = requestAnimationFrame;

        api("/auth/me")
        .then(() => {
            if(ativo) setEstado("autorizado");
        })
        .catch((erro) => {
            if (!ativo) return;

            setEstado(
                erro.status === 401 ? "sem_sessao" : "erro"
            );
        });

        return() => {
            ativo=false;
        };
    }, []);

    if (estado === "carregando") {
        return <p className="p-6">Verificando acesso...</p>;
    }

    if (estado === "sem_sessao") {
        return <Navigate to="/login" replace />
    }

    if (estado === "erro") {
        return (
            <div className="p-6">
                <p>Não foi possível verificar o acesso. Confira o backend.</p>

                <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 unferline"
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return <Outlet />;
}
