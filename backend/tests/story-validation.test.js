import test from "node:test";
import assert from "node:assert/strict";
import { validarHistoria } from "../src/validators/story.js";

const valida = {
  titulo: "Luna se recuperou",
  texto: "Luna chegou fraquinha e hoje já brinca com todos.",
};

test("aceita só título e texto: vira rascunho de hoje, sem gatinho", () => {
  const r = validarHistoria(valida);
  assert.equal(r.erro, undefined);
  assert.equal(r.dados.status, "rascunho");
  assert.equal(r.dados.gatoId, null);
  assert.match(r.dados.data, /^\d{4}-\d{2}-\d{2}$/);
});

test("remove espaços das pontas do título e do texto", () => {
  const r = validarHistoria({ ...valida, titulo: "  Luna  ", texto: `  ${valida.texto}  ` });
  assert.equal(r.dados.titulo, "Luna");
  assert.equal(r.dados.texto, valida.texto);
});

test("título: mínimo de 3 e máximo de 120 caracteres", () => {
  assert.ok(validarHistoria({ ...valida, titulo: "Oi" }).erro);
  assert.ok(validarHistoria({ ...valida, titulo: "  ab  " }).erro);
  assert.equal(validarHistoria({ ...valida, titulo: "Oi!" }).erro, undefined);
  assert.ok(validarHistoria({ ...valida, titulo: "a".repeat(121) }).erro);
});

test("história: mínimo de 20 e máximo de 5000 caracteres", () => {
  assert.ok(validarHistoria({ ...valida, texto: "curto demais" }).erro);
  assert.ok(validarHistoria({ ...valida, texto: "a".repeat(19) }).erro);
  assert.equal(validarHistoria({ ...valida, texto: "a".repeat(20) }).erro, undefined);
  assert.ok(validarHistoria({ ...valida, texto: "a".repeat(5001) }).erro);
});

test("rejeita título ou texto ausentes, vazios ou que não são texto", () => {
  for (const alteracao of [
    { titulo: undefined }, { titulo: "   " }, { titulo: 5 },
    { texto: undefined }, { texto: "     " }, { texto: 5 },
  ]) {
    assert.ok(validarHistoria({ ...valida, ...alteracao }).erro, JSON.stringify(alteracao));
  }
});

test("rejeita data inválida ou futura", () => {
  assert.ok(validarHistoria({ ...valida, data: "2026-02-30" }).erro);
  assert.ok(validarHistoria({ ...valida, data: "amanhã" }).erro);
  assert.ok(validarHistoria({ ...valida, data: "2999-01-01" }).erro);
});

test("rejeita status e gatoId inválidos; gatoId vazio vira nulo", () => {
  assert.ok(validarHistoria({ ...valida, status: "outro" }).erro);
  assert.ok(validarHistoria({ ...valida, gatoId: "123" }).erro);
  assert.equal(validarHistoria({ ...valida, gatoId: "" }).dados.gatoId, null);
});

test("rejeita corpo que não é objeto", () => {
  for (const corpo of [null, "texto", [], 5]) assert.ok(validarHistoria(corpo).erro);
});