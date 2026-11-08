export const API_URL = "http://localhost:4000/api";

export async function api(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers);

  const enviandoArquivo = opcoes.body instanceof FormData;

  if (enviandoArquivo) {
    headers.delete("Content-Type");
  } else if (opcoes.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    credentials: "include",
    headers,
  });

  const dados =
    resposta.status === 204 ? null : await resposta.json();

  if (!resposta.ok) {
    const erro = new Error(
      dados?.mensagem || "Não foi possível concluir a solicitação."
    );

    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}