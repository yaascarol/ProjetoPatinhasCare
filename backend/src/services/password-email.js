import nodemailer from "nodemailer";

export function configuracaoEmail(env = process.env) {
  const origin = new URL(env.FRONTEND_ORIGIN);
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

export function mensagemRecuperacao(user, destinatario, link) {
  return {
    from: { name: "PatinhasCare", address: user },
    to: { address: destinatario },
    subject: "Redefina sua senha — PatinhasCare",
    text: [
      "Olá! Recebemos uma solicitação para redefinir sua senha no PatinhasCare.",
      "Abra o link abaixo para escolher uma nova senha:", link,
      "O link vale por 15 minutos e só pode ser usado uma vez.",
      "Se você não solicitou a recuperação, ignore este e-mail. Sua senha continua a mesma.",
      "Equipe PatinhasCare",
    ].join("\n\n"),
  };
}

export async function enviarRecuperacao(config, email, link) {
  if (config.local) {
    console.log("[RECUPERAÇÃO LOCAL — válido por 15 minutos] " + link);
    return;
  }
  const transporter = criarTransporte(config);
  try {
    const info = await transporter.sendMail(mensagemRecuperacao(config.user, email, link));
    if (!info.accepted?.length) throw new Error("Destinatário não aceito.");
    console.log("[RECUPERAÇÃO] E-mail aceito pelo servidor do Gmail.");
  } finally { transporter.close(); }
}
