import { useContext, useEffect, useState } from "react";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { CatsContext } from "../contexts/cats-context";
import { SessionContext } from "../contexts/session-context";
import {
  listarHistorias,
  cadastrarHistoria,
  editarHistoria,
  excluirHistoria,
} from "../services/storyService";
import { formatarData } from "../utils/health";

const TITULO_MIN = 3;
const TEXTO_MIN = 20;

const campoClasses =
  "min-h-11 w-full rounded-xl border border-lima bg-transparent px-3 py-2 outline-none focus:border-roxo focus:ring-2 focus:ring-roxo/20";

const hoje = () => new Date().toLocaleDateString("sv-SE");

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function FormularioHistoria({
  historia,
  gatos,
  podePublicar,
  salvando,
  erro,
  onSalvar,
  onCancelar,
}) {
  const [titulo, setTitulo] = useState(historia?.titulo ?? "");
  const [texto, setTexto] = useState(historia?.texto ?? "");
  const [data, setData] = useState(historia?.data ?? hoje());
  const [gatoId, setGatoId] = useState(historia?.gatoId ?? "");
  const [status, setStatus] = useState(historia?.status ?? "rascunho");
  const [foto, setFoto] = useState(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const [erroLocal, setErroLocal] = useState("");

  function escolherFoto(event) {
    const arquivo = event.target.files?.[0] ?? null;

    if (arquivo && !["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setErroFoto("Use uma foto JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }

    if (arquivo && arquivo.size > 5 * 1024 * 1024) {
      setErroFoto("A foto não pode ultrapassar 5 MB.");
      event.target.value = "";
      return;
    }

    setErroFoto("");
    setFoto(arquivo);

    if (arquivo) setRemoverFoto(false);
  }

  function enviar(event) {
    event.preventDefault();

    if (titulo.trim().length < TITULO_MIN) {
      setErroLocal(`O título deve ter pelo menos ${TITULO_MIN} caracteres.`);
      return;
    }

    if (texto.trim().length < TEXTO_MIN) {
      setErroLocal(`A história deve ter pelo menos ${TEXTO_MIN} caracteres.`);
      return;
    }

    setErroLocal("");

    onSalvar({
      titulo,
      texto,
      data,
      gatoId,
      status: podePublicar ? status : "rascunho",
      foto,
      removerFoto,
    });
  }

  return (
    <form
      onSubmit={enviar}
      className="space-y-4 rounded-2xl border border-lima p-5"
    >
      <h2 className="text-lg font-semibold">
        {historia ? "Editar história" : "Nova história"}
      </h2>

      <Input
        id="historia-titulo"
        label="Título"
        value={titulo}
        minLength={TITULO_MIN}
        maxLength={120}
        required
        onChange={(event) => setTitulo(event.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="historia-gato" className="text-sm font-medium">
            Gatinho (opcional)
          </label>

          <select
            id="historia-gato"
            value={gatoId}
            onChange={(event) => setGatoId(event.target.value)}
            className={campoClasses}
          >
            <option value="">Sem gatinho específico</option>

            {gatos.map((gato) => (
              <option key={gato.id} value={gato.id}>
                {gato.nome}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="historia-data"
          label="Data"
          type="date"
          value={data}
          max={hoje()}
          required
          onChange={(event) => setData(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="historia-texto" className="text-sm font-medium">
          História
        </label>

        <textarea
          id="historia-texto"
          value={texto}
          rows={6}
          minLength={TEXTO_MIN}
          maxLength={5000}
          required
          onChange={(event) => setTexto(event.target.value)}
          className={campoClasses}
        />

        <p className="text-sm text-stone-600">
          {texto.trim().length} caracteres (mínimo {TEXTO_MIN})
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="historia-foto" className="text-sm font-medium">
          Foto (JPG, PNG ou WebP, até 5 MB)
        </label>

        <input
          id="historia-foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={escolherFoto}
        />

        {historia?.fotoUrl && !foto && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removerFoto}
              onChange={(event) => setRemoverFoto(event.target.checked)}
            />
            Remover a foto atual
          </label>
        )}
      </div>

      {podePublicar ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="historia-status" className="text-sm font-medium">
            Situação
          </label>

          <select
            id="historia-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={campoClasses}
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicada">Publicada</option>
          </select>
        </div>
      ) : (
        <p className="text-sm text-stone-600">
          A história será salva como rascunho. Uma responsável pode publicá-la.
        </p>
      )}

      {(erroFoto || erroLocal || erro) && (
        <p role="alert" className="text-sm text-red-700">
          {erroFoto || erroLocal || erro}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>

        <Button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar história"}
        </Button>
      </div>
    </form>
  );
}

export default function StoriesPage() {
  const { gatos } = useContext(CatsContext);

  const usuario = useContext(SessionContext);
  const [lista, setLista] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [erroCarga, setErroCarga] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [formulario, setFormulario] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [busca, setBusca] = useState("");
  const [termoAplicado, setTermoAplicado] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    listarHistorias(controller.signal)
      .then((historias) => {
        setLista(historias);
        setEstado("pronto");
      })
      .catch((erro) => {
        if (controller.signal.aborted) return;

        setErroCarga(erro.message);
        setEstado("erro");
      });

    return () => controller.abort();
  }, []);

  const responsavel = usuario?.papel === "responsavel";

  const podeEditar = (historia) =>
    responsavel || historia.status === "rascunho";

  const podeExcluir = (historia) =>
    responsavel ||
    (historia.autorId === usuario?.id && historia.status === "rascunho");

  async function salvar(dados) {
    setSalvando(true);
    setErroForm("");

    try {
      if (formulario === "nova") {
        const criada = await cadastrarHistoria(dados);

        setLista((atual) => [criada, ...atual]);
        setMensagem("História cadastrada.");
      } else {
        const editada = await editarHistoria(formulario.id, dados);

        setLista((atual) =>
          atual.map((item) => (item.id === editada.id ? editada : item))
        );
        setMensagem("História atualizada.");
      }

      setFormulario(null);
    } catch (erro) {
      setErroForm(erro.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(historia) {
    if (!window.confirm(`Excluir a história "${historia.titulo}"?`)) return;

    try {
      await excluirHistoria(historia.id);

      setLista((atual) => atual.filter((item) => item.id !== historia.id));
      setMensagem("História excluída.");
    } catch (erro) {
      setMensagem(erro.message);
    }
  }

  const historias = [...lista]
    .filter((historia) =>
      normalizarTexto(historia.nomeGato ?? "").includes(
        normalizarTexto(termoAplicado)
      )
    )
    .sort((a, b) => b.data.localeCompare(a.data));

  function buscar(event) {
    event.preventDefault();
    setTermoAplicado(busca);
  }

  function limparBusca() {
    setBusca("");
    setTermoAplicado("");
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Mural de histórias
        </h1>

        <p className="mt-2 text-stone-600">
          Histórias de como chegaram ao abrigo e como estão agora.
        </p>
      </header>

      {!formulario && (
        <div>
          <Button
            onClick={() => {
              setFormulario("nova");
              setErroForm("");
              setMensagem("");
            }}
          >
            Nova história
          </Button>
        </div>
      )}

      {formulario && (
        <FormularioHistoria
          key={formulario === "nova" ? "nova" : formulario.id}
          historia={formulario === "nova" ? null : formulario}
          gatos={gatos}
          podePublicar={responsavel}
          salvando={salvando}
          erro={erroForm}
          onSalvar={salvar}
          onCancelar={() => setFormulario(null)}
        />
      )}

      <p role="status" className="min-h-6 text-sm text-stone-700">
        {mensagem}
      </p>

      <form
        onSubmit={buscar}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            id="buscar-historia"
            label="Buscar pelo nome do gatinho"
            placeholder="Ex.: Luna"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </div>

        <Button type="submit">Buscar</Button>

        <Button variant="secondary" onClick={limparBusca}>
          Limpar
        </Button>
      </form>

      {estado === "carregando" && (
        <p role="status">Carregando histórias...</p>
      )}

      {estado === "erro" && (
        <p role="alert" className="rounded-2xl border border-lima p-6">
          {erroCarga || "Não foi possível carregar as histórias."}
        </p>
      )}

      {estado === "pronto" && (
        <>
          <p role="status" className="text-sm text-stone-600">
            {historias.length} história(s) encontrada(s)
          </p>

          {historias.length === 0 ? (
            <p className="rounded-2xl border border-lima p-6">
              {termoAplicado.trim()
                ? "Nenhuma história encontrada para esse gatinho."
                : "Nenhuma história cadastrada."}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {historias.map((historia) => (
                <article
                  key={historia.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-lima"
                >
                  <img
                    src={
                      historia.fotoUrl ||
                      "/imagens/icones-patinhascare/GATO SEM FOTO.png"
                    }
                    alt=""
                    className={`h-48 w-full bg-lilas/20 ${historia.fotoUrl ? "object-cover" : "object-contain"
                      }`}
                  />

                  <div className="flex flex-1 flex-col p-5">
                    {historia.nomeGato && (
                      <p className="text-sm text-stone-600">
                        {historia.nomeGato}
                      </p>
                    )}

                    <h2 className="text-lg font-semibold">
                      {historia.titulo}
                    </h2>

                    <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">
                      {historia.texto}
                    </p>

                    <footer className="mt-auto flex items-center justify-between gap-3 pt-6">
                      <time
                        dateTime={historia.data}
                        className="text-sm text-stone-600"
                      >
                        {formatarData(historia.data)}
                      </time>

                      <span className="rounded-full bg-stone-200 px-3 py-1 text-xs">
                        {historia.status === "rascunho"
                          ? "Rascunho"
                          : "Publicada"}
                      </span>
                    </footer>

                    {(podeEditar(historia) || podeExcluir(historia)) && (
                      <div className="mt-4 flex gap-4 text-sm">
                        {podeEditar(historia) && (
                          <button
                            type="button"
                            className="underline"
                            onClick={() => {
                              setFormulario(historia);
                              setErroForm("");
                              setMensagem("");
                            }}
                          >
                            Editar
                          </button>
                        )}

                        {podeExcluir(historia) && (
                          <button
                            type="button"
                            className="text-red-700 underline"
                            onClick={() => excluir(historia)}
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}