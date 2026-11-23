import "dotenv/config";
import { configuracaoEmail, criarTransporte } from "../src/services/password-email.js";
let transporte;
try {
  const config = configuracaoEmail({ ...process.env, RECUPERACAO_LOCAL: "false" });
  if (config.provider === "brevo") {
    const resposta = await fetch("https://api.brevo.com/v3/senders", {
      headers: { "api-key": config.apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!resposta.ok) throw new Error("Falha na autenticação da API de email.");
    const dados = await resposta.json();
    if (!dados.senders?.some(item => item.email?.toLowerCase() === config.user.toLowerCase() && item.active)) {
      throw new Error("Remetente não está ativo/verificado na Brevo.");
    }
    console.log("API e remetente verificados. Nenhum email enviado; entrega real ainda precisa ser testada.");
  } else {
    transporte = criarTransporte(config);
    await transporte.verify();
    console.log("Conexão e autenticação com o Gmail confirmadas. Nenhum e-mail foi enviado.");
  }
} catch (error) {
  const mensagens = {
    EAUTH: "Gmail recusou o acesso. Confira SMTP_USER e a senha de app em SMTP_PASSWORD.",
    ETIMEDOUT: "A conexão expirou. Confira a internet e o acesso à porta 465.",
    EDNS: "Não foi possível localizar o Gmail. Confira sua conexão.",
    ESOCKET: "Falha na conexão segura com o Gmail. Confira a rede e o antivírus.",
  };
  console.error(mensagens[error.code] || "Não foi possível verificar o envio. Confira o provedor, as credenciais, o remetente verificado e a origem pública configurados.");
  process.exitCode = 1;
} finally { transporte?.close(); }
