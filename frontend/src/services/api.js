const API_URL = "http://localhost:4000/api";

export async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    credentials: "include",
    headers: {
      ...opcoes.headers,
      ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
    },
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