import { api, API_URL } from "./api";

function prepararHistoria(historia) {
  return {
    ...historia,
    fotoUrl: historia.fotoUrl
      ? new URL(historia.fotoUrl, API_URL).href
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

export async function listarHistorias(signal) {
  const resposta = await api("/historias", { signal });

  return resposta.historias.map(prepararHistoria);
}

export async function cadastrarHistoria(dados) {
  const resposta = await api("/historias", {
    method: "POST",
    body: montarFormulario(dados),
  });

  return prepararHistoria(resposta.historia);
}

export async function editarHistoria(id, dados) {
  const resposta = await api(`/historias/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: montarFormulario(dados),
  });

  return prepararHistoria(resposta.historia);
}

export async function excluirHistoria(id) {
  await api(`/historias/${encodeURIComponent(id)}`, { method: "DELETE" });
}