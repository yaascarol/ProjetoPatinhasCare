import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { randomBytes } from "node:crypto";

import { pool } from "./db.js";

const app = express();

const port = Number(process.env.PORT || 4000);
const origin = process.env.FRONTEND_ORIGIN;
const secret = process.env.SESSION_SECRET;

if (!origin || !secret || secret.length < 32) {
  throw new Error("Configure FRONTEND_ORIGIN e SESSION_SECRET no .env.");
}

const PgSession = connectPgSimple(session);

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // Ambiente local com HTTP.
  path: "/",
};

const hashSemUsuario = await bcrypt.hash(
  randomBytes(32).toString("hex"),
  12
);

app.use(helmet());

app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");

  const alteraDados = !["GET", "HEAD", "OPTIONS"].includes(req.method);

  if (alteraDados && req.get("origin") !== origin) {
    return res.status(403).json({
      mensagem: "Origem da requisição não permitida.",
    });
  }

  next();
});

app.use(
  session({
    name: "patinhas.sid",
    secret,
    store: new PgSession({
      pool,
      createTableIfMissing: true,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    mensagem: "Muitas tentativas. Aguarde alguns minutos.",
  },
});

app.post("/api/auth/login", limitarLogin, async (req, res, next) => {
  try {
    const { email, senha } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      email.length > 254 ||
      senha.length === 0 ||
      Buffer.byteLength(senha, "utf8") > 72
    ) {
      return res.status(400).json({
        mensagem: "Informe um e-mail e uma senha válidos.",
      });
    }

    const resultado = await pool.query(
      `
        SELECT id, nome, email, senha_hash, papel, ativo
        FROM usuarios
        WHERE email = $1
      `,
      [email.trim().toLowerCase()]
    );

    const usuario = resultado.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      usuario?.senha_hash ?? hashSemUsuario
    );

    if (!usuario || !usuario.ativo || !senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos.",
      });
    }

    req.session.regenerate((erro) => {
      if (erro) return next(erro);

      req.session.usuarioId = usuario.id;

      req.session.save((erroSalvar) => {
        if (erroSalvar) return next(erroSalvar);

        res.json({
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            papel: usuario.papel,
          },
        });
      });
    });
  } catch (erro) {
    next(erro);
  }
});

async function exigirLogin(req, res, next) {
  try {
    if (!req.session.usuarioId) {
      return res.status(401).json({
        mensagem: "Faça login para continuar.",
      });
    }

    const resultado = await pool.query(
      `
        SELECT id, nome, email, papel
        FROM usuarios
        WHERE id = $1 AND ativo = TRUE
      `,
      [req.session.usuarioId]
    );

    if (!resultado.rows[0]) {
      return res.status(401).json({
        mensagem: "Sessão inválida.",
      });
    }

    req.usuario = resultado.rows[0];
    next();
  } catch (erro) {
    next(erro);
  }
}

app.get("/api/auth/me", exigirLogin, (req, res) => {
  res.json({ usuario: req.usuario });
});

app.post("/api/auth/logout", (req, res, next) => {
  req.session.destroy((erro) => {
    if (erro) return next(erro);

    res.clearCookie("patinhas.sid", cookieOptions);
    res.status(204).end();
  });
});

app.use((req, res) => {
  res.status(404).json({ mensagem: "Endpoint não encontrado." });
});

app.use((erro, req, res, next) => {
  if (res.headersSent) return next(erro);

  if (erro.type === "entity.parse.failed") {
    return res.status(400).json({ mensagem: "JSON inválido." });
  }

  console.error("Falha na API:", erro.code || erro.name);

  res.status(500).json({
    mensagem: "Não foi possível concluir a operação.",
  });
});

await pool.query("SELECT 1");

app.listen(port, "127.0.0.1", () => {
  console.log(`API local disponível em http://localhost:${port}`);
});