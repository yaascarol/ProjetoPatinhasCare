import nodemailer from "nodemailer";

export function configuracaoEmail(env = process.env) {
  const origin = new URL(env.FRONTEND_ORIGIN || (env.NODE_ENV === "production" ? env.RENDER_EXTERNAL_URL : undefined));
  const local = env.RECUPERACAO_LOCAL === "true";
  if (local) {
    if (env.NODE_ENV === "production" || !["localhost","127.0.0.1"].includes(origin.hostname)) {
      throw new Error("Modo local não permitido neste ambiente.");
    }
    return { local: true, origin };
  }
  if (env.NODE_ENV === "production" && (origin.protocol !== "https:" || ["localhost","127.0.0.1"].includes(origin.hostname))) {
    throw new Error("Configure FRONTEND_ORIGIN com o endereço público HTTPS.");
  }
  if (env.EMAIL_PROVIDER === "brevo") {
    if (!env.BREVO_API_KEY?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.EMAIL_FROM?.trim() || "")) {
      throw new Error("Configure BREVO_API_KEY e EMAIL_FROM.");
    }
    return { local: false, provider: "brevo", origin, apiKey: env.BREVO_API_KEY.trim(), user: env.EMAIL_FROM.trim() };
  }
  if (env.EMAIL_PROVIDER && env.EMAIL_PROVIDER !== "gmail") throw new Error("Provedor de email inválido.");
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) throw new Error("Configure SMTP_USER e SMTP_PASSWORD no .env.");
  return { local: false, origin, user: env.SMTP_USER.trim(), password: env.SMTP_PASSWORD.replace(/\s/g, "") };
}

export function criarTransporte(config) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
    disableFileAccess: true, disableUrlAccess: true,
    logger: false, debug: false,
  });
}

export function mensagemRecuperacao(user, destinatario, link, primeiroAcesso = false) {
  return {
    from: { name: "PatinhasCare", address: user },
    to: { address: destinatario },
    subject: primeiroAcesso ? "Defina sua senha de acesso — PatinhasCare" : "Redefina sua senha — PatinhasCare",
    text: [
      primeiroAcesso ? "Olá! Você foi cadastrado na equipe do PatinhasCare. Defina sua senha para acessar o sistema." : "Olá! Recebemos uma solicitação para redefinir sua senha no PatinhasCare.",
      "Abra o link abaixo para escolher uma nova senha:", link,
      "O link vale por 15 minutos e só pode ser usado uma vez.",
      primeiroAcesso ? "Se você não reconhece este convite, ignore a mensagem e contate quem o convidou." : "Se você não solicitou a recuperação, ignore este e-mail. Sua senha continua a mesma.",
      "Equipe PatinhasCare",
    ].join("\n\n"),
  };
}

export async function enviarRecuperacao(config, email, link, primeiroAcesso = false, requisitar = fetch) {
  if (config.local) {
    console.log("[RECUPERAÇÃO LOCAL — válido por 15 minutos] " + link);
    return;
  }
  if (config.provider === "brevo") {
    const mensagem = mensagemRecuperacao(config.user, email, link, primeiroAcesso);
    const resposta = await requisitar("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": config.apiKey, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: "PatinhasCare", email: config.user },
        to: [{ email }], subject: mensagem.subject, textContent: mensagem.text,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!resposta.ok) throw new Error(`Provedor recusou envio (HTTP ${resposta.status}).`);
    console.log("[RECUPERAÇÃO] E-mail aceito pela API de envio.");
    return;
  }
  const transporter = criarTransporte(config);
  try {
    const info = await transporter.sendMail(mensagemRecuperacao(config.user, email, link, primeiroAcesso));
    if (!info.accepted?.length) throw new Error("Destinatário não aceito.");
    console.log("[RECUPERAÇÃO] E-mail aceito pelo servidor do Gmail.");
  } finally { transporter.close(); }
}
