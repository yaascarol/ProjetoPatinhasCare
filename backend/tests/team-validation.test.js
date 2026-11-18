import test from "node:test";
import assert from "node:assert/strict";
import { validarIntegrante, validarAlteracao } from "../src/validators/team.js";

test("normaliza nome e e-mail sem aceitar papéis desconhecidos", () => {
  assert.deepEqual(validarIntegrante({ nome: " Ana ", email: " ANA@example.com ", papel: "voluntario" }).dados, { nome: "Ana", email: "ana@example.com", papel: "voluntario" });
  assert.ok(validarIntegrante({ nome: "Ana", email: "ana@example.com", papel: "admin" }).erro);
});
test("rejeita entradas vazias, tipos incorretos e limites excedidos", () => {
  for (const dados of [null, [], {}, { nome: " " }, { nome: "a".repeat(121) }, { nome: "Ana", email: "invalido", papel: "voluntario" }]) assert.ok(validarIntegrante(dados).erro);
});
test("alteração permite somente papel válido e ativo booleano", () => {
  for (const dados of [{ ativo: false }, { ativo: true, papel: "responsavel" }, { papel: "voluntario" }]) assert.equal(validarAlteracao(dados), null);
  for (const dados of [{}, [], null, { ativo: "false" }, { papel: "admin" }, { senha_hash: "x" }, { email: "novo@example.com" }]) assert.ok(validarAlteracao(dados));
});
