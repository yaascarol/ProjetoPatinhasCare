import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { configuracaoEmail, mensagemRecuperacao, criarTransporte } from "../src/services/password-email.js";
const env = { FRONTEND_ORIGIN: "http://localhost:5173", SMTP_USER: "test@example.com", SMTP_PASSWORD: "abcd efgh ijkl mnop" };
test("SMTP exige credenciais e aceita senha de app formatada", () => {
  assert.throws(() => configuracaoEmail({ FRONTEND_ORIGIN: env.FRONTEND_ORIGIN }));
  assert.equal(configuracaoEmail(env).password, "abcdefghijklmnop");
});
test("produção bloqueia modo local e exige origem pública HTTPS", () => {
  assert.throws(() => configuracaoEmail({ ...env, NODE_ENV: "production", RECUPERACAO_LOCAL: "true" }));
  assert.throws(() => configuracaoEmail({ ...env, NODE_ENV: "production" }));
  assert.equal(configuracaoEmail({ ...env, NODE_ENV: "production", FRONTEND_ORIGIN: "https://patinhas.example" }).local, false);
});
test("SMTP usa TLS, porta do Gmail e não habilita logs sensíveis", () => {
  const transport = criarTransporte(configuracaoEmail(env));
  assert.equal(transport.options.secure, true);
  assert.equal(transport.options.port, 465);
  assert.equal(transport.options.debug, false);
  transport.close();
});
test("mensagem contém destinatário único, link completo e validade, sem senha de app", async () => {
  const link = "http://localhost:5173/redefinir-senha#token=" + "a".repeat(64);
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const result = await transport.sendMail(mensagemRecuperacao(env.SMTP_USER, "destino@example.com", link));
  const message = JSON.parse(result.message);
  assert.equal(message.to.length, 1);
  assert.equal(message.to[0].address, "destino@example.com");
  assert.ok(message.text.includes(link));
  assert.ok(message.text.includes("15 minutos"));
  assert.ok(!message.text.includes(env.SMTP_PASSWORD));
});
