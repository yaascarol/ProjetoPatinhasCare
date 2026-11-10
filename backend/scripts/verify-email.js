import "dotenv/config";
import { configuracaoEmail, criarTransporte } from "../src/services/password-email.js";
let transporte;
try {
  const config = configuracaoEmail({ ...process.env, RECUPERACAO_LOCAL: "false" });
  transporte = criarTransporte(config);
  await transporte.verify();
  console.log("Conexão e autenticação com o Gmail confirmadas. Nenhum e-mail foi enviado.");
} catch (error) {
  const mensagens = {
    EAUTH: "Gmail recusou o acesso. Confira SMTP_USER e a senha de app em SMTP_PASSWORD.",
    ETIMEDOUT: "A conexão expirou. Confira a internet e o acesso à porta 465.",
    EDNS: "Não foi possível localizar o Gmail. Confira sua conexão.",
    ESOCKET: "Falha na conexão segura com o Gmail. Confira a rede e o antivírus.",
  };
  console.error(mensagens[error.code] || "Não foi possível verificar o envio. Confira SMTP_USER, SMTP_PASSWORD e FRONTEND_ORIGIN no .env.");
  process.exitCode = 1;
} finally { transporte?.close(); }
