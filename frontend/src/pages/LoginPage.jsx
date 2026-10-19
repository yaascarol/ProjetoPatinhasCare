import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from "../services/api";

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPace() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (enviando) return;

        setMensagem("");
        setEnviando(true);

        try {
            await api("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: email.trim(),
                    senha,
                }),
            });

            navigate("/", { replace: true });
        } catch (erro) {
            setMensagem(
                erro instanceof TypeError
                    ? "Não foi possível conectar à API. Confira se o backend está ligado."
                    : erro.message
            );
        } finally {
            setEnviando(false);
        }
    }

    function handleRecuperarSenha() {
        setMensagem("A recuperação de senha está indisponível ainda, estamos conectando a autenticação.");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-creme p-4">
            <section aria-label="titulo-login" className="w-full max-w-xl rounded 3xl border border-lima px-6 py-10 sm:px-16 sm:py-12">
                <header className="text-center">
                    <div className="flex items-center justify-center gap-3">
                        <img src="../imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare" aria-hidden="true" className="h-auto w-50" />
                    </div>

                    <p className="mt-2 text-sm text-stone-600">
                        Sistema de gestão integrada para seu abrigo
                    </p>
                </header>

                <p className="mt-8 text-center text-sm text-stone-600">
                    Acesso restrito à equipe do abrigo.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <Input
                        id="email"
                        name="email"
                        label="E-mail"
                        type="email"
                        autoComplete="username"
                        placeholder="voce@exemplo.com"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <Input
                        id="senha"
                        name="senha"
                        label="Senha"
                        type="Password"
                        autoComplete="current-password"
                        required
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                    />

                    <div className="text-right">
                        <button
                            type="button"
                            onClick={handleRecuperarSenha}
                            className="rounded text-sm text-stone-600
                    hover:underline
                    focus-visible:outline-2
                    focus-visible:outline-offset-4
                    focus-visible:outline-roxo"
                        >
                            Esqueci minha senha
                        </button>
                    </div>

                    <p role="status" className="min-h-5 text-center text-sm text-stone-700">
                        {mensagem}
                    </p>

                    <div className="flex justify-center pt-2">
                        <Button type="submit" disabled={enviando}>
                            {enviando ? "Entrando..." : "Entrar"}
                        </Button>
                    </div>
                </form>

                <p className="mt-6 text-center text-xs text-stone-600">
                    Acesso exclusivo aos integrantes autorizados do abrigo.
                </p>

            </section>
        </main>
    );
}