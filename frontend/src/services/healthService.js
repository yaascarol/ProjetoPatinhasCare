import { api, API_URL } from "./api";

function prepararRegistro(registro) {
  return {
    ...registro,
    anexoUrl: registro.anexoUrl
      ? new URL(registro.anexoUrl, API_URL).href
      : "",
  };
}

// Envia os campos como JSON no campo "dados" e o arquivo em "anexo".
function montarFormulario(dados) {
  const { anexo, ...campos } = dados;

  const formulario = new FormData();

  formulario.append("dados", JSON.stringify(campos));

  if (anexo) {
    formulario.append("anexo", anexo);
  }

  return formulario;
}

export async function listarRegistros(signal) {
  const resposta = await api("/saude/registros", { signal });

  return resposta.registros.map(prepararRegistro);
}

export async function listarTipos(signal) {
  const resposta = await api("/saude/tipos", { signal });

  return resposta.tipos;
}

export async function cadastrarRegistro(dados) {
  const resposta = await api("/saude/registros", {
    method: "POST",
    body: montarFormulario(dados),
  });

  return prepararRegistro(resposta.registro);
}

export async function editarRegistro(id, dados) {
  const resposta = await api(`/saude/registros/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: montarFormulario(dados),
  });

  return prepararRegistro(resposta.registro);
}

export async function excluirRegistro(id) {
  await api(`/saude/registros/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
