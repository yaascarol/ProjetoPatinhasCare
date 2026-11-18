import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { SessionContext } from "../contexts/session-context";
import { api } from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function TeamPage() {
  const usuario = useContext(SessionContext);
  const navigate = useNavigate();
  const [equipe, setEquipe] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [tentativa, setTentativa] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("voluntario");
  const [editando, setEditando] = useState(null);
  const [novoPapel, setNovoPapel] = useState("voluntario");
  const autorizado = usuario?.papel === "responsavel";

  useEffect(() => {
    if (!autorizado) return;
    const controller = new AbortController();
    api("/equipe", { signal: controller.signal }).then(dados => {
      if (controller.signal.aborted) return;
      setEquipe(dados.integrantes);
      setEstado("pronto");
    }).catch(falha => {
      if (controller.signal.aborted) return;
      if (falha.status === 401) { navigate("/login", { replace: true }); return; }
      setEstado(falha.status === 403 ? "negado" : "erro");
    });
    return () => controller.abort();
  }, [autorizado, tentativa, navigate]);

  async function executar(acao) {
    if (ocupado) return;
    setOcupado(true); setErro(""); setMensagem("");
    try { await acao(); }
    catch (falha) {
      if (falha.status === 401) navigate("/login", { replace: true });
      else if (falha.status === 403) setEstado("negado");
      else setErro(falha instanceof TypeError ? "Não foi possível conectar à API. Confira o backend e tente novamente." : falha.message);
    } finally { setOcupado(false); }
  }

  function cadastrar(event) {
    event.preventDefault();
    if (!nome.trim()) { setErro("Informe o nome do integrante."); return; }
    executar(async () => {
      const dados = await api("/equipe", { method: "POST", body: JSON.stringify({ nome, email, papel }) });
      setEquipe(atuais => [...atuais, dados.integrante].sort((a,b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setNovo(false); setNome(""); setEmail(""); setPapel("voluntario");
      setMensagem("Integrante cadastrado. Clique em Enviar acesso na linha dele para enviar o link de definição de senha.");
    });
  }

  function ultimoResponsavel(pessoa) {
    return pessoa.ativo && pessoa.senhaDefinida && pessoa.papel === "responsavel" && equipe.filter(item => item.ativo && item.senhaDefinida && item.papel === "responsavel").length === 1;
  }

  function atualizar(pessoa, alteracao) {
    return executar(async () => {
      const dados = await api(`/equipe/${pessoa.id}`, { method: "PATCH", body: JSON.stringify(alteracao) });
      setEquipe(atuais => atuais.map(item => item.id === pessoa.id ? dados.integrante : item));
      setEditando(null);
      if (pessoa.id === usuario.id && (dados.integrante.papel !== pessoa.papel || dados.integrante.ativo !== pessoa.ativo)) {
        navigate("/login", { replace: true }); return;
      }
      setMensagem("Acesso atualizado. Se houve mudança, o integrante precisará entrar novamente.");
    });
  }

  function salvarPapel(event) {
    event.preventDefault();
    const pessoa = equipe.find(item => item.id === editando);
    if (!pessoa) return;
    if (pessoa.id === usuario.id && novoPapel !== pessoa.papel && !window.confirm("Alterar seu próprio papel encerrará seu acesso atual à administração. Continuar?")) return;
    atualizar(pessoa, { papel: novoPapel });
  }

  function alternarAcesso(pessoa) {
    if (!window.confirm(`${pessoa.ativo ? "Desativar" : "Reativar"} o acesso de ${pessoa.nome}?${pessoa.id === usuario.id ? " Você será desconectado." : ""}`)) return;
    atualizar(pessoa, { ativo: !pessoa.ativo });
  }

  function excluirIntegrante(pessoa) {
    if (!window.confirm(`Excluir permanentemente ${pessoa.nome} (${pessoa.email}) da equipe? A conta, as sessões e os links de recuperação serão removidos. Os registros de Saúde serão preservados. Essa ação não pode ser desfeita; um novo cadastro exigirá definir outra senha.${pessoa.id === usuario.id ? " Você será desconectado." : ""}`)) return;
    executar(async () => {
      await api(`/equipe/${pessoa.id}`, { method: "DELETE" });
      setEquipe(atuais => atuais.filter(item => item.id !== pessoa.id));
      if (editando === pessoa.id) setEditando(null);
      if (pessoa.id === usuario.id) { navigate("/login", { replace: true }); return; }
      setMensagem("Integrante excluído. O e-mail está disponível para um novo cadastro.");
    });
  }

  function enviarLink(pessoa) {
    if (!window.confirm(`Enviar um link de definição de senha para ${pessoa.email}? Ele será válido por 15 minutos e substituirá qualquer link anterior.`)) return;
    executar(async () => {
      const dados = await api(`/equipe/${pessoa.id}/recuperacao`, { method: "POST" });
      setMensagem(dados.mensagem);
    });
  }

  if (!autorizado || estado === "negado") return <section className="space-y-4"><h1 className="text-2xl font-semibold">Equipe</h1><p role="alert">Somente responsáveis podem administrar a equipe.</p><Link to="/" className="underline">Voltar para Home</Link></section>;
  if (estado === "carregando") return <p role="status">Carregando integrantes...</p>;
  if (estado === "erro") return <section className="space-y-4"><p role="alert">Não foi possível carregar a equipe.</p><Button onClick={() => { setEstado("carregando"); setTentativa(valor => valor + 1); }}>Tentar novamente</Button></section>;

  return (
    <section className="space-y-6" aria-busy={ocupado}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Equipe</h1><p className="mt-2 text-stone-600">Gerencie os integrantes e seus acessos ao PatinhasCare.</p></div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={ocupado} onClick={() => { setEstado("carregando"); setTentativa(valor => valor + 1); }}>Atualizar lista</Button>
          <Button disabled={ocupado} onClick={() => { setNovo(true); setEditando(null); setErro(""); setMensagem(""); }}>Adicionar integrante</Button>
        </div>
      </header>
      <p className="text-sm text-stone-600">Voluntários podem consultar, cadastrar e editar gatinhos e registros de saúde. Somente responsáveis podem excluir esses registros e administrar os acessos da equipe.</p>
      {mensagem && <p role="status" className="rounded-xl bg-lilas/20 p-4">{mensagem}</p>}
      {erro && <p role="alert" className="text-red-700">{erro}</p>}

      {novo && <form onSubmit={cadastrar} className="rounded-2xl border border-lima p-5">
        <fieldset disabled={ocupado} className="space-y-4">
          <legend className="text-lg font-semibold">Adicionar integrante</legend>
          <p className="text-sm text-stone-600">Após cadastrar, envie o acesso para que o integrante defina a própria senha.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="integrante-nome" label="Nome (obrigatório)" required maxLength={120} value={nome} onChange={event => setNome(event.target.value)} />
            <Input id="integrante-email" label="E-mail (obrigatório)" type="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
          </div>
          <label className="flex max-w-sm flex-col gap-2" htmlFor="integrante-papel">Papel
            <select id="integrante-papel" value={papel} onChange={event => setPapel(event.target.value)} className="min-h-11 rounded-xl border border-lima bg-creme px-3"><option value="voluntario">Voluntário</option><option value="responsavel">Responsável</option></select>
          </label>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => setNovo(false)}>Cancelar</Button><Button type="submit">{ocupado ? "Cadastrando..." : "Cadastrar integrante"}</Button></div>
        </fieldset>
      </form>}

      {editando && <form onSubmit={salvarPapel} className="rounded-2xl border border-lima p-5">
        <fieldset disabled={ocupado} className="space-y-4">
          <legend className="text-lg font-semibold">Editar papel de {equipe.find(item => item.id === editando)?.nome}</legend>
          <label htmlFor="editar-papel" className="block">Papel</label>
          <select id="editar-papel" value={novoPapel} onChange={event => setNovoPapel(event.target.value)} className="min-h-11 rounded-xl border border-lima bg-creme px-3"><option value="voluntario">Voluntário</option><option value="responsavel">Responsável</option></select>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => setEditando(null)}>Cancelar</Button><Button type="submit">{ocupado ? "Salvando..." : "Salvar papel"}</Button></div>
        </fieldset>
      </form>}

      <div className="overflow-x-auto rounded-2xl border border-lima p-4">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Integrantes cadastrados no PatinhasCare</caption>
          <thead><tr className="border-b border-lima"><th scope="col" className="p-3">Nome</th><th scope="col" className="p-3">E-mail</th><th scope="col" className="p-3">Papel</th><th scope="col" className="p-3">Situação</th><th scope="col" className="p-3">Ações</th></tr></thead>
          <tbody>{equipe.map(pessoa => <tr key={pessoa.id} className="border-b border-lima/50 align-top">
            <td className="p-3">{pessoa.nome}{pessoa.id === usuario.id && <span className="ml-2 text-xs text-stone-600">(você)</span>}</td>
            <td className="break-all p-3">{pessoa.email}</td>
            <td className="p-3">{pessoa.papel === "responsavel" ? "Responsável" : "Voluntário"}</td>
            <td className="p-3"><span className="whitespace-nowrap">{!pessoa.ativo ? "Desativado" : !pessoa.senhaDefinida ? "Senha pendente" : "Ativo"}</span></td>
            <td className="p-3"><div className="flex min-w-40 flex-col items-start gap-3">
              <button type="button" disabled={ocupado} className="rounded underline disabled:opacity-50" onClick={() => { setEditando(pessoa.id); setNovoPapel(pessoa.papel); setNovo(false); setErro(""); setMensagem(""); }}>Editar papel</button>
              <button type="button" disabled={ocupado || !pessoa.ativo} className="rounded underline disabled:opacity-50" onClick={() => enviarLink(pessoa)}>{pessoa.senhaDefinida ? "Redefinir senha" : "Enviar acesso"}</button>
              <button type="button" disabled={ocupado || ultimoResponsavel(pessoa)} className="rounded text-red-700 underline disabled:opacity-50" onClick={() => alternarAcesso(pessoa)}>{pessoa.ativo ? "Desativar acesso" : "Reativar acesso"}</button>
              <button type="button" disabled={ocupado || ultimoResponsavel(pessoa)} className="rounded text-red-700 underline disabled:opacity-50" onClick={() => excluirIntegrante(pessoa)}>Excluir integrante</button>
              {ultimoResponsavel(pessoa) && <span className="text-xs text-stone-600">Último responsável com acesso configurado.</span>}
            </div></td>
          </tr>)}</tbody>
        </table>
        {!equipe.length && <p className="p-4">Nenhum integrante encontrado.</p>}
      </div>
    </section>
  );
}
