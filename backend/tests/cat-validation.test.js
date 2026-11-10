import test from "node:test";
import assert from "node:assert/strict";
import { validarGato } from "../src/validators/cat.js";

const valido = { nome: "Luna", personalidade: ["Carinhosa"], sexo: "femea", status: "disponivel" };

test("aceita cadastro sem data de nascimento nem descrição", () => {
  const resultado = validarGato(valido);
  assert.equal(resultado.erro, undefined);
  assert.equal(resultado.dados.dataNascimento, null);
  assert.equal(resultado.dados.descricao, "");
});

for (const campo of ["nome", "personalidade", "sexo", "status"]) {
  test(`rejeita ${campo} ausente`, () => {
    const dados = { ...valido };
    delete dados[campo];
    assert.ok(validarGato(dados).erro);
  });
}

test("rejeita campos vazios e opções antigas não informadas", () => {
  for (const alteracao of [
    { nome: "   " }, { personalidade: [] }, { personalidade: ["   "] },
    { sexo: "" }, { sexo: "nao_informado" },
    { status: "" }, { status: "nao_informado" },
  ]) assert.ok(validarGato({ ...valido, ...alteracao }).erro);
});

test("aceita todos os status válidos e normaliza personalidade", () => {
  for (const status of ["disponivel", "indisponivel", "em_observacao", "adotado(a)"]) {
    const resultado = validarGato({ ...valido, status, personalidade: [" Calma ", "Calma"], dataNascimento: "", descricao: "" });
    assert.equal(resultado.erro, undefined);
    assert.deepEqual(resultado.dados.personalidade, ["Calma"]);
  }
});
