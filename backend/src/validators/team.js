export function validarIntegrante(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { erro: "Informe os dados do integrante." };
  if (typeof body.nome !== "string" || !body.nome.trim() || body.nome.trim().length > 120) return { erro: "Informe um nome com até 120 caracteres." };
  if (typeof body.email !== "string" || body.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return { erro: "Informe um e-mail válido." };
  if (!["responsavel", "voluntario"].includes(body.papel)) return { erro: "Selecione um papel válido." };
  return { dados: { nome: body.nome.trim(), email: body.email.trim().toLowerCase(), papel: body.papel } };
}

export function validarAlteracao(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Informe a alteração.";
  const campos = Object.keys(body);
  if (!campos.length || campos.some(campo => !["papel", "ativo"].includes(campo))) return "Altere apenas papel ou situação de acesso.";
  if (Object.hasOwn(body, "papel") && !["responsavel", "voluntario"].includes(body.papel)) return "Selecione um papel válido.";
  if (Object.hasOwn(body, "ativo") && typeof body.ativo !== "boolean") return "Situação de acesso inválida.";
  return null;
}
