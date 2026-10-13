import { useContext } from "react";

import { HealthContext } from "../../contexts/health-context";
import { formatarData, tiposRegistro } from "../../utils/health";

function baixarAnexo(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = arquivo.name;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function HealthHistory({ gatoId }) {
  const { registros } = useContext(HealthContext);

  const historico = registros
    .filter((registro) => registro.gatoId === gatoId)
    .sort(
      (a, b) =>
        b.data.localeCompare(a.data) ||
        b.criadoEm.localeCompare(a.criadoEm)
    );

  if (historico.length === 0) {
    return <p>Nenhum registro de saúde cadastrado para este gato.</p>;
  }

  return (
    <div className="space-y-7">
      {Object.entries(tiposRegistro).map(([tipo, config]) => {
        const grupo = historico.filter(
          (registro) => registro.tipo === tipo
        );

        if (grupo.length === 0) return null;

        return (
          <section key={tipo}>
            <h2 className="mb-3 text-lg font-semibold">
              {config.label}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Registros de {config.label}
                </caption>

                <thead>
                  <tr className="border-b border-lima">
                    <th scope="col" className="p-2">Descrição</th>
                    <th scope="col" className="p-2">Data</th>
                    {config.proxima && (
                      <th scope="col" className="p-2">Próxima</th>
                    )}
                    <th scope="col" className="p-2">Anexo</th>
                  </tr>
                </thead>

                <tbody>
                  {grupo.map((registro) => (
                    <tr key={registro.id} className="border-b border-lima/50">
                      <td className="p-2">
                        <p className="font-medium">{registro.titulo}</p>
                        <p className="whitespace-pre-wrap text-stone-600">
                          {registro.observacoes}
                        </p>
                      </td>

                      <td className="whitespace-nowrap p-2">
                        {formatarData(registro.data)}
                      </td>

                      {config.proxima && (
                        <td className="whitespace-nowrap p-2">
                          {formatarData(registro.proximaData)}
                        </td>
                      )}

                      <td className="p-2">
                        {registro.anexo ? (
                          <button
                            type="button"
                            onClick={() => baixarAnexo(registro.anexo)}
                            className="underline"
                          >
                            {registro.anexo.name}
                          </button>
                        ) : (
                          "Sem anexo"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}