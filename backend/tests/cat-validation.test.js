import test from "node:test";

import assert from "node:assert/strict";
import { validarGato, nascimentoMinimo } from "../src/validators/cat.js";

const valido = { nome: "Luna", personalidade: ["Carinhosa"], sexo: "femea", status: "disponivel" };

test("nascimento limita os últimos 30 anos sem exigir preenchimento", () => {
  const hoje = "2026-11-24";
  for (const dataNascimento of ["1996-11-24", "2005-09-15", hoje, "", null]) {
    assert.equal(validarGato({ ...valido, dataNascimento }, hoje).erro, undefined);
  }
  for (const dataNascimento of ["1900-01-01", "1996-11-23", "2026-11-25", "2026-02-30", "invalida"]) {
    assert.ok(validarGato({ ...valido, dataNascimento }, hoje).erro);
  }
});

test("limite de nascimento trata ano bissexto sem gerar data inexistente", () => {
  assert.equal(nascimentoMinimo("2028-02-29"), "1998-02-28");
  assert.equal(nascimentoMinimo("2026-11-24"), "1996-11-24");
});

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
