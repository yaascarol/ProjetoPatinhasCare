import { useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function PasswordResetPage({ redefinir = false }) {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const tokenValido = /^[a-f0-9]{64}$/.test(token);
  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;
    if (redefinir && senha !== confirmacao) return setMensagem("As senhas precisam ser iguais.");
    if (redefinir && (senha.length < 12 || new TextEncoder().encode(senha).length > 72)) {
      return setMensagem("Use pelo menos 12 caracteres e no máximo 72 bytes na senha.");
    }
    setEnviando(true);
    setMensagem("");
    try {
      const dados = await api(redefinir ? "/auth/reset-password" : "/auth/forgot-password", {
        method: "POST", body: JSON.stringify(redefinir ? {token, senha} : {email: email.trim()})
      });
      setMensagem(dados.mensagem);
      setConcluido(true);
      setSenha(""); setConfirmacao("");
      if (redefinir) window.history.replaceState(null, "", window.location.pathname);
    } catch (erro) {
      setMensagem(erro instanceof TypeError ? "Não foi possível conectar à API. Confira se o backend está ligado." : erro.message);
    } finally { setEnviando(false); }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-creme p-4">
      <section className="w-full max-w-xl rounded-3xl border border-lima px-6 py-10 sm:px-16 sm:py-12">
        <img src="/imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare" className="mx-auto h-auto w-50" />
        <h1 className="mt-8 text-center text-2xl font-semibold">{redefinir ? "Definir nova senha" : "Recuperar senha"}</h1>
        <p className="mt-3 text-center text-sm text-stone-600">{redefinir ? "Escolha uma senha com pelo menos 12 caracteres." : "Informe o e-mail usado para acessar o PatinhasCare."}</p>
        {redefinir && !tokenValido ? <p role="alert" className="mt-6">Link inválido. Solicite uma nova recuperação.</p> : !concluido && (
          <form onSubmit={enviar} className="mt-8 space-y-5">
            {redefinir ? <>
              <Input id="nova-senha" label="Nova senha" type="password" autoComplete="new-password" required minLength={12} value={senha} onChange={e => setSenha(e.target.value)} />
              <Input id="confirmar-senha" label="Confirmar nova senha" type="password" autoComplete="new-password" required minLength={12} value={confirmacao} onChange={e => setConfirmacao(e.target.value)} />
            </> : <Input id="email" label="E-mail" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />}
            <Button type="submit" disabled={enviando} className="w-full">{enviando ? "Aguarde..." : redefinir ? "Salvar nova senha" : "Solicitar recuperação"}</Button>
          </form>
        )}
        <p role="status" aria-live="polite" className="mt-5 text-center text-sm text-stone-700">{mensagem}</p>
        {redefinir && !concluido && <Link to="/recuperar-senha" className="mt-5 block text-center underline">Solicitar novo link</Link>}
        <Link to="/login" className="mt-6 block text-center text-sm underline">Voltar para o login</Link>
      </section>
    </main>
  );
}
