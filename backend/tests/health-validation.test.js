import test from "node:test";
import assert from "node:assert/strict";

import {
  detectarTipoAnexo,
  limparNomeArquivo,
  normalizarNome,
  validarRegistro,
} from "../src/validators/health.js";

const vacina = { tipo: "vacina", titulo: " V4 ", data: "2024-01-10", proximaData: "2025-01-10" };

test("aceita vacina válida e normaliza o título", () => {
  const { erro, dados } = validarRegistro(vacina);
  assert.equal(erro, undefined);
  assert.equal(dados.titulo, "V4");
  assert.equal(dados.proximaData, "2025-01-10");
  assert.equal(dados.removerAnexo, false);
});

test("rejeita tipo, título e data inválidos", () => {
  for (const alteracao of [
    { tipo: "banho" }, { titulo: "   " }, { titulo: "x".repeat(121) },
    { data: "" }, { data: "2024-02-30" }, { data: "3000-01-01" },
  ]) assert.ok(validarRegistro({ ...vacina, ...alteracao }).erro, JSON.stringify(alteracao));
});

test("rejeita próxima data anterior à data do registro", () => {
  assert.ok(validarRegistro({ ...vacina, proximaData: "2023-12-31" }).erro);
});

test("ignora próxima data em tipos que não a usam", () => {
  const { dados } = validarRegistro({ tipo: "exame", titulo: "Hemograma", data: "2024-01-10", proximaData: "2025-01-10" });
  assert.equal(dados.proximaData, null);
});

test("consulta exige motivo", () => {
  const consulta = { tipo: "consulta", titulo: "Dra. Ana", data: "2024-01-10" };
  assert.ok(validarRegistro(consulta).erro);
  assert.equal(validarRegistro({ ...consulta, observacoes: "Check-up" }).erro, undefined);
});

test("em edição usa o tipo existente", () => {
  const { dados } = validarRegistro({ ...vacina, tipo: "exame" }, { tipo: "vacina" });
  assert.equal(dados.tipo, "vacina");
});

test("normaliza nomes ignorando acento, caixa e espaços", () => {
  for (const nome of ["antirrabica", "Antirrábica", "  ANTIRRÁBICA "]) {
    assert.equal(normalizarNome(nome), "antirrabica");
  }
  assert.equal(normalizarNome("Castração"), normalizarNome("CASTRACAO"));
  assert.equal(normalizarNome("Ultra   som"), "ultra som");
});

test("detecta PDF, JPEG e PNG pelo conteúdo", () => {
  assert.equal(detectarTipoAnexo(Buffer.from("%PDF-1.7\n....")), "application/pdf");
  assert.equal(detectarTipoAnexo(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0])), "image/jpeg");
  assert.equal(detectarTipoAnexo(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  assert.equal(detectarTipoAnexo(Buffer.from("<html><script>")), null);
});

test("limpa o nome do arquivo", () => {
  assert.equal(limparNomeArquivo("../../etc/passwd"), "passwd");
  assert.equal(limparNomeArquivo('C:\\docs\\exa"me.pdf'), "exame.pdf");
  assert.equal(limparNomeArquivo(""), "anexo");
});
