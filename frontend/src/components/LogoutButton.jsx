import { useState } from "react";

import { api } from "../services/api";

export default function LogoutButton() {
    const [saindo, setSaindo] = useState(false);
    const [erro, setErro] = useState("");

    async function sair() {
        setSaindo(true);
        setErro("");

        try {
            await api("/auth/logout", { method: "POST" });
            window.location.assign("/login");
        } catch {
            setErro("Nãpo foi possível sair. Tente de novo.")
            setSaindo(false);
        }

    }

    return (
        <div className="mt-6">
            <button
                type="button"
                onClick={sair}
                disabled={saindo}
                className="rounded-xl border border-lima px-4 py-2 disabled:opacity-50"
            >
                {saindo ? "Saindo..." : "Sair"}
            </button>

            {erro && <p role="alerta" className="mt-2 text-sm">{erro}</p>}
        </div>
    );
}