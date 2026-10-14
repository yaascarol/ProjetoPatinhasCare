import {
  acompanhamentosAtuais,
  statusDoPrazo,
} from "./health";

export function listarAlertas(gatos, registros) {
  return gatos
    .flatMap((gato) => {
      const registrosDoGato = registros.filter(
        (registro) => registro.gatoId === gato.id
      );

      return acompanhamentosAtuais(registrosDoGato)
        .map((registro) => ({
          ...registro,
          nomeGato: gato.nome,
          status: statusDoPrazo(registro),
        }))
        .filter((registro) =>
          ["vencido", "a_vencer"].includes(registro.status)
        );
    })
    .sort((a, b) => a.proximaData.localeCompare(b.proximaData));
}