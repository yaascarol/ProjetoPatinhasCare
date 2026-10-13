import { useContext, useState } from "react";
import { useNavigate } from "react-router";

import { HealthContext } from "../../contexts/health-context";
import { dataHoje, tiposRegistro } from "../../utils/health";

import Input from "../ui/Input";
import Button from "../ui/Button";

export default function HealthForm({ gatoId, tipo }) {
  const config = tiposRegistro[tipo];

  const { adicionarRegistro } = useContext(HealthContext);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [proximaData, setProximaData] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [anexo, setAnexo] = useState(null);
  const [erro, setErro] = useState("");

  const campo =
    "min-h-11 w-full rounded-xl border border-lima bg-creme px-3 py-2";

  function selecionarAnexo(event) {
    const arquivo = event.target.files?.[0];

    setErro("");
    setAnexo(null);

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

    setAnexo(arquivo);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!titulo.trim() || !data) {
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

    adicionarRegistro({
      gatoId,
      tipo,
      titulo: titulo.trim(),
      data,
      proximaData: config.proxima ? proximaData : "",
      observacoes: observacoes.trim(),
      anexo,
    });

    navigate(`/saude/${gatoId}/historico`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold">
        Registrar {config.label.toLocaleLowerCase("pt-BR")}
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
          <label htmlFor="anexo">Anexo opcional</label>

          <input
            id="anexo"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={selecionarAnexo}
            className={campo}
          />

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

      {erro && <p role="alert" className="text-red-700">{erro}</p>}

      <Button type="submit">
        Salvar {config.label.toLocaleLowerCase("pt-BR")}
      </Button>
    </form>
  );
}