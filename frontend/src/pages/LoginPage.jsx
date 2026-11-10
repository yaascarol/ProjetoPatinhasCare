import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from "../services/api";

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LegalLinks from '../components/LegalLinks';

export default function LoginPage() {
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
        navigate("/recuperar-senha");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-creme p-4">
            <section aria-label="Login" className="w-full max-w-xl rounded-3xl border border-lima px-6 py-10 sm:px-16 sm:py-12">
                <header className="text-center">
                    <div className="flex items-center justify-center gap-3">
                        <img src="/imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare" className="h-auto w-50" />
                    </div>

                    <p className="mt-2 text-sm text-stone-600">
                        Protótipo acadêmico de gestão de abrigos
                    </p>
                </header>

                <p className="mt-8 text-center text-sm text-stone-600">
                    Acesso restrito à equipe do projeto e convidados para testes.
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
                        type="password"
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
                    PatinhasCare · Versão acadêmica para testes.
                </p>
                <LegalLinks />

            </section>
        </main>
    );
}
