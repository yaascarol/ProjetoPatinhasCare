import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { HealthContext } from "../../contexts/health-context";
import { dataHoje, normalizarNome, tiposRegistro } from "../../utils/health";

import Input from "../ui/Input";
import Button from "../ui/Button";

// Valor interno da opção "Outro/Outra" no select. Não colide com nomes reais.
const OUTRO = "__outro__";

const tiposAnexoPermitidos = ["application/pdf", "image/jpeg", "image/png"];

export default function HealthForm({
  gatoId,
  tipo,
  registroInicial,
  onSaved,
  onCancel,
}) {
  const config = tiposRegistro[tipo];
  const editando = Boolean(registroInicial);
  const temOpcoes = Boolean(config.outro);

  const { tipos, adicionarRegistro, atualizarRegistro } =
    useContext(HealthContext);

  const navigate = useNavigate();
  const inputArquivo = useRef(null);

  const opcoes = tipos[tipo] ?? [];
  const tituloInicial = registroInicial?.titulo ?? "";

  // Em edição: se o título salvo estiver na lista, seleciona-o;
  // caso contrário, abre "Outro" já preenchido.
  const selecaoInicial = !temOpcoes
    ? tituloInicial
    : !tituloInicial
      ? ""
      : opcoes.includes(tituloInicial)
        ? tituloInicial
        : OUTRO;

  const [titulo, setTitulo] = useState(selecaoInicial);
  const [outroTitulo, setOutroTitulo] = useState(
    selecaoInicial === OUTRO ? tituloInicial : ""
  );
  const [data, setData] = useState(registroInicial?.data ?? "");
  const [proximaData, setProximaData] = useState(
    registroInicial?.proximaData ?? ""
  );
  const [observacoes, setObservacoes] = useState(
    registroInicial?.observacoes ?? ""
  );
  const [novoAnexo, setNovoAnexo] = useState(null);
  const [removerAnexoAtual, setRemoverAnexoAtual] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const mostrarOutro = temOpcoes && titulo === OUTRO;

  // Avisa quando o nome digitado já existe com outra grafia.
  const opcaoExistente =
    mostrarOutro && outroTitulo.trim()
      ? opcoes.find(
        (opcao) => normalizarNome(opcao) === normalizarNome(outroTitulo)
      )
      : undefined;

  const anexoAtual =
    editando && registroInicial.anexoUrl && !removerAnexoAtual
      ? registroInicial.anexoNome
      : "";

  const campo =
    "min-h-11 w-full rounded-xl border border-lima bg-creme px-3 py-2";

  function selecionarAnexo(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (
      !tiposAnexoPermitidos.includes(arquivo.type) ||
      arquivo.size > 5 * 1024 * 1024
    ) {
      setErro("Selecione um PDF, JPG ou PNG de até 5 MB.");
      event.target.value = "";
      return;
    }

    setErro("");
    setNovoAnexo(arquivo);
  }

  function descartarNovoAnexo() {
    setNovoAnexo(null);

    if (inputArquivo.current) {
      inputArquivo.current.value = "";
    }
  }

  function voltar() {
    navigate(`/saude/${gatoId}/historico`);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (salvando) return;

    const tituloFinal = (mostrarOutro ? outroTitulo : titulo).trim();

    if (!tituloFinal || !data) {
      setErro("Preencha a identificação e a data do registro.");
      return;
    }

    if (data > dataHoje()) {
      setErro("A data do registro não pode estar no futuro.");
      return;
    }

    if (proximaData && proximaData < data) {
      setErro("A próxima data não pode ser anterior à data do registro.");
      return;
    }

    if (tipo === "consulta" && !observacoes.trim()) {
      setErro("Informe o motivo da consulta.");
      return;
    }

    const dados = {
      gatoId,
      tipo,
      titulo: tituloFinal,
      data,
      proximaData: config.proxima ? proximaData : "",
      observacoes: observacoes.trim(),
      removerAnexo: editando && removerAnexoAtual && !novoAnexo,
      anexo: novoAnexo,
    };

    setErro("");
    setSalvando(true);

    try {
      if (editando) {
        await atualizarRegistro(registroInicial.id, dados);
      } else {
        await adicionarRegistro(dados);
      }
    } catch (falha) {
      setErro(falha.message);
      setSalvando(false);
      return;
    }

    if (onSaved) {
      onSaved();
    } else {
      voltar();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold">
        {editando ? "Editar" : "Registrar"}{" "}
        {config.label.toLocaleLowerCase("pt-BR")}
      </h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="identificacao">{config.campo}</label>

          {temOpcoes ? (
            <select
              id="identificacao"
              required
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className={campo}
            >
              <option value="">Selecione</option>

              {opcoes.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}

              <option value={OUTRO}>{config.outro}</option>
            </select>
          ) : (
            <input
              id="identificacao"
              required
              maxLength={120}
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className={campo}
            />
          )}

          {mostrarOutro && (
            <>
              <Input
                id="outro-titulo"
                label={config.campoOutro}
                required
                maxLength={120}
                value={outroTitulo}
                onChange={(event) => setOutroTitulo(event.target.value)}
                aria-describedby="outro-titulo-ajuda"
              />

              <p id="outro-titulo-ajuda" className="text-xs text-stone-600">
                {opcaoExistente
                  ? `Já existe a opção "${opcaoExistente}". Ela será usada.`
                  : "O nome informado vira uma opção para os próximos registros."}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="anexo">{config.anexo}</label>

          <input
            ref={inputArquivo}
            id="anexo"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={selecionarAnexo}
            aria-describedby="anexo-ajuda"
            className={campo}
          />

          {novoAnexo && (
            <div className="text-sm">
              <p>Novo arquivo: {novoAnexo.name}</p>

              <button
                type="button"
                onClick={descartarNovoAnexo}
                className="mt-1 text-red-700 underline"
              >
                Descartar arquivo selecionado
              </button>
            </div>
          )}

          {!novoAnexo && anexoAtual && (
            <div className="text-sm">
              <p>
                Arquivo atual:{" "}
                <a
                  href={registroInicial.anexoUrl}
                  className="underline"
                  rel="noopener"
                >
                  {anexoAtual}
                </a>
              </p>

              <button
                type="button"
                onClick={() => setRemoverAnexoAtual(true)}
                className="mt-1 text-red-700 underline"
              >
                Remover anexo
              </button>
            </div>
          )}

          {!novoAnexo && editando && removerAnexoAtual && (
            <div className="text-sm">
              <p>O anexo será removido ao salvar.</p>

              <button
                type="button"
                onClick={() => setRemoverAnexoAtual(false)}
                className="mt-1 underline"
              >
                Manter anexo
              </button>
            </div>
          )}

          <p id="anexo-ajuda" className="text-xs text-stone-600">
            Opcional. PDF, JPG ou PNG, até 5 MB.
            {anexoAtual && " Selecionar outro arquivo substitui o atual."}
          </p>
        </div>

        <Input
          id="data-registro"
          label={config.data}
          type="date"
          required
          max={dataHoje()}
          value={data}
          onChange={(event) => setData(event.target.value)}
        />

        {config.proxima && (
          <Input
            id="proxima-data"
            label={`${config.proxima} (opcional)`}
            type="date"
            min={data || undefined}
            value={proximaData}
            onChange={(event) => setProximaData(event.target.value)}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="observacoes">
          {config.observacao ?? "Observações (opcional)"}
        </label>

        <textarea
          id="observacoes"
          rows={4}
          maxLength={2000}
          required={tipo === "consulta"}
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
          className={campo}
        />
      </div>

      {erro && (
        <p role="alert" className="text-red-700">
          {erro}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancel ?? voltar}
          disabled={salvando}
          className="rounded-xl border border-lima px-6 py-3 disabled:opacity-50"
        >
          Cancelar
        </button>

        <Button type="submit" disabled={salvando}>
          {salvando
            ? "Salvando..."
            : editando
              ? "Salvar alteração"
              : `Salvar ${config.label.toLocaleLowerCase("pt-BR")}`}
        </Button>
      </div>
    </form>
  );
}
