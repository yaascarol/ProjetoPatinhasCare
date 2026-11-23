import { dataValida, hojeNoBrasil } from "./cat.js";

const TITULO_MIN = 3;
const TEXTO_MIN = 20;

const statusPermitidos = ["rascunho", "publicada"];
const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validarHistoria(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { erro: "Envie os dados da história." };
  }

  if (typeof body.titulo !== "string" || !body.titulo.trim()) {
    return { erro: "Informe o título da história." };
  }
  const titulo = body.titulo.trim();
  if (titulo.length < TITULO_MIN) {
    return { erro: `O título deve ter pelo menos ${TITULO_MIN} caracteres.` };
  }
  if (titulo.length > 120) return { erro: "O título deve ter até 120 caracteres." };

  if (typeof body.texto !== "string" || !body.texto.trim()) {
    return { erro: "Escreva o texto da história." };
  }
  const texto = body.texto.trim();
  if (texto.length < TEXTO_MIN) {
    return { erro: `A história deve ter pelo menos ${TEXTO_MIN} caracteres.` };
  }
  if (texto.length > 5000) return { erro: "O texto deve ter até 5 mil caracteres." };

  let data = hojeNoBrasil();
  if (body.data !== undefined && body.data !== "" && body.data !== null) {
    if (typeof body.data !== "string" || !dataValida(body.data)) {
      return { erro: "Informe uma data válida." };
    }
    if (body.data > hojeNoBrasil()) {
      return { erro: "A data da história não pode ser futura." };
    }
    data = body.data;
  }

  let gatoId = null;
  if (body.gatoId !== undefined && body.gatoId !== "" && body.gatoId !== null) {
    if (typeof body.gatoId !== "string" || !formatoUuid.test(body.gatoId)) {
      return { erro: "Gatinho inválido." };
    }
    gatoId = body.gatoId;
  }

  const status = body.status ?? "rascunho";
  if (!statusPermitidos.includes(status)) {
    return { erro: "Escolha rascunho ou publicada." };
  }

  return { dados: { titulo, texto, data, gatoId, status } };
}