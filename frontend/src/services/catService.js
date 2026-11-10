import { api, API_URL } from "./api";

export async function excluirGato(id) {
  await api(`/gatos/${encodeURIComponent(id)}`, { method: "DELETE" });
}

function prepararGato(gato) {
  return {
    ...gato,
    fotoUrl: gato.fotoUrl
      ? new URL(gato.fotoUrl, API_URL).href
      : "",
  };
}

function montarFormulario(dados) {
  const { foto, ...campos } = dados;

  const formulario = new FormData();

  formulario.append("dados", JSON.stringify(campos));

  if (foto) {
    formulario.append("foto", foto);
  }

  return formulario;
}

export async function listarGatos(signal) {
  const resposta = await api("/gatos", { signal });

  return resposta.gatos.map(prepararGato);
}

export async function consultarGato(id) {
  const resposta = await api(`/gatos/${encodeURIComponent(id)}`);

  return prepararGato(resposta.gato);
}

export async function cadastrarGato(dados) {
  const resposta = await api("/gatos", {
    method: "POST",
    body: montarFormulario(dados),
  });

  return prepararGato(resposta.gato);
}

export async function editarGato(id, dados) {
  const resposta = await api(`/gatos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: montarFormulario(dados),
  });

  return prepararGato(resposta.gato);
}
