import test from "node:test";
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { configuracaoEmail, mensagemRecuperacao, criarTransporte, enviarRecuperacao } from "../src/services/password-email.js";
const env = { FRONTEND_ORIGIN: "http://localhost:5173", SMTP_USER: "test@example.com", SMTP_PASSWORD: "abcd efgh ijkl mnop" };
const brevo = {
  NODE_ENV: "production", RENDER_EXTERNAL_URL: "https://patinhas.example",
  EMAIL_PROVIDER: "brevo", EMAIL_FROM: "abrigo@example.com", BREVO_API_KEY: "chave-ficticia",
};
test("Brevo exige chave e remetente e aceita origem do Render", () => {
  assert.throws(() => configuracaoEmail({ ...brevo, BREVO_API_KEY: "" }));
  assert.throws(() => configuracaoEmail({ ...brevo, EMAIL_FROM: "inválido" }));
  assert.equal(configuracaoEmail(brevo).origin.origin, brevo.RENDER_EXTERNAL_URL);
});
test("API envia recuperação ao destinatário solicitado e primeiro acesso com assunto próprio", async () => {
  const link = "https://patinhas.example/redefinir-senha#token=ficticio";
  for (const primeiroAcesso of [false, true]) {
    await enviarRecuperacao(configuracaoEmail(brevo), "voluntario@hotmail.com", link, primeiroAcesso, async (url, opcoes) => {
      assert.equal(url, "https://api.brevo.com/v3/smtp/email");
      assert.equal(opcoes.headers["api-key"], brevo.BREVO_API_KEY);
      const corpo = JSON.parse(opcoes.body);
      assert.deepEqual(corpo.to, [{ email: "voluntario@hotmail.com" }]);
      assert.equal(corpo.sender.email, brevo.EMAIL_FROM);
      assert.ok(corpo.textContent.includes(link));
      assert.equal(corpo.subject.startsWith("Defina"), primeiroAcesso);
      return { ok: true };
    });
  }
});
test("falha da API não é reportada como envio concluído", async () => {
  await assert.rejects(enviarRecuperacao(configuracaoEmail(brevo), "destino@example.com", "https://patinhas.example", false,
    async () => ({ ok: false, status: 401 })), /HTTP 401/);
});
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
