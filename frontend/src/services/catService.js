import { api } from "./api";

export async function listarGatos(signal) {
  const resposta = await api("/gatos", { signal });
  return resposta.gatos;
}

export async function consultarGato(id) {
  const resposta = await api(`/gatos/${encodeURIComponent(id)}`);
  return resposta.gato;
}

export async function cadastrarGato(dados) {
  const resposta = await api("/gatos", {
    method: "POST",
    body: JSON.stringify(dados),
  });

  return resposta.gato;
}

export async function editarGato(id, dados) {
  const resposta = await api(`/gatos/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });

  return resposta.gato;
}