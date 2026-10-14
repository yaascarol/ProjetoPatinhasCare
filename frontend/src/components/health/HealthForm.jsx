import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { HealthContext } from "../../contexts/health-context";
import { dataHoje, tiposRegistro } from "../../utils/health";

import Input from "../ui/Input";
import Button from "../ui/Button";

export default function HealthForm({
  gatoId,
  tipo,
  registroInicial,
  onSaved,
  onCancel,
}) {
  const config = tiposRegistro[tipo];
  const editando = Boolean(registroInicial);

  const { adicionarRegistro, atualizarRegistro } =
    useContext(HealthContext);

  const navigate = useNavigate();
  const inputArquivo = useRef(null);

  const opcaoOutro = config.opcoes?.find(
    (opcao) => opcao === "Outro" || opcao === "Outra"
  );

  const tituloInicial = registroInicial?.titulo ?? "";

  const selecaoInicial = config.opcoes
    ? registroInicial?.opcao ??
      (config.opcoes.includes(tituloInicial)
        ? tituloInicial
        : tituloInicial
          ? opcaoOutro
          : "")
    : tituloInicial;

  const [titulo, setTitulo] = useState(selecaoInicial);

  const [outroTitulo, setOutroTitulo] = useState(
    selecaoInicial === opcaoOutro && tituloInicial !== opcaoOutro
      ? tituloInicial
      : ""
  );

  const [data, setData] = useState(registroInicial?.data ?? "");
  const [proximaData, setProximaData] = useState(
    registroInicial?.proximaData ?? ""
  );
  const [observacoes, setObservacoes] = useState(
    registroInicial?.observacoes ?? ""
  );
  const [anexo, setAnexo] = useState(
    registroInicial?.anexo ?? null
  );
  const [erro, setErro] = useState("");

  const mostrarOutro = Boolean(opcaoOutro) && titulo === opcaoOutro;

  const campoOutro = {
    vacina: "Informe qual vacina",
    exame: "Informe qual exame",
    procedimento: "Informe qual procedimento",
  };

  const campo =
    "min-h-11 w-full rounded-xl border border-lima bg-creme px-3 py-2";

  function selecionarAnexo(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    const tiposPermitidos = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (
      !tiposPermitidos.includes(arquivo.type) ||
      arquivo.size > 5 * 1024 * 1024
    ) {
      setErro("Selecione um PDF, JPG ou PNG de até 5 MB.");
      event.target.value = "";
      return;
    }

    setErro("");
    setAnexo(arquivo);
  }

  function removerAnexo() {
    setAnexo(null);

    if (inputArquivo.current) {
      inputArquivo.current.value = "";
    }
  }

  function cancelar() {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/saude/${gatoId}/historico`);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const tituloFinal = (
      mostrarOutro ? outroTitulo : titulo
    ).trim();

    if (!tituloFinal || !data) {
      setErro("Preencha a identificação e a data do registro.");
      return;
    }

    if (data > dataHoje()) {
      setErro("A data do atendimento não pode estar no futuro.");
      return;
    }

    if (proximaData && proximaData < data) {
      setErro("A próxima data não pode ser anterior ao atendimento.");
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
      opcao: config.opcoes ? titulo : "",
      data,
      proximaData: config.proxima ? proximaData : "",
      observacoes: observacoes.trim(),
      anexo,
    };

    if (editando) {
      atualizarRegistro(registroInicial.id, dados);
    } else {
      adicionarRegistro(dados);
    }

    if (onSaved) {
      onSaved();
    } else {
      navigate(`/saude/${gatoId}/historico`);
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

          {config.opcoes ? (
            <select
              id="identificacao"
              required
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className={campo}
            >
              <option value="">Selecione</option>

              {config.opcoes.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="identificacao"
              required
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              className={campo}
            />
          )}

          {mostrarOutro && (
            <Input
              id="outro-titulo"
              label={campoOutro[tipo] ?? "Especifique"}
              required
              maxLength={120}
              value={outroTitulo}
              onChange={(event) => setOutroTitulo(event.target.value)}
            />
          )}
        </div>

        <Input
          id="data-registro"
          label="Data do atendimento / aplicação"
          type="date"
          required
          max={dataHoje()}
          value={data}
          onChange={(event) => setData(event.target.value)}
        />

        {config.proxima && (
          <Input
            id="proxima-data"
            label={`${config.proxima} — se informada`}
            type="date"
            min={data || undefined}
            value={proximaData}
            onChange={(event) => setProximaData(event.target.value)}
          />
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="anexo">
            {anexo ? "Substituir anexo" : "Anexo opcional"}
          </label>

          <input
            ref={inputArquivo}
            id="anexo"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={selecionarAnexo}
            className={campo}
          />

          {anexo && (
            <div className="text-sm">
              <p>Arquivo: {anexo.name}</p>

              <button
                type="button"
                onClick={removerAnexo}
                className="mt-1 text-red-700 underline"
              >
                Remover anexo
              </button>
            </div>
          )}

          <p className="text-xs text-stone-600">
            PDF, JPG ou PNG, até 5 MB. Disponível somente nesta sessão.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="observacoes">
          {config.observacao ?? "Observações"}
        </label>

        <textarea
          id="observacoes"
          rows={4}
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
          onClick={cancelar}
          className="rounded-xl border border-lima px-6 py-3"
        >
          Cancelar
        </button>

        <Button type="submit">
          {editando
            ? "Salvar alteração"
            : `Salvar ${config.label.toLocaleLowerCase("pt-BR")}`}
        </Button>
      </div>
    </form>
  );
}