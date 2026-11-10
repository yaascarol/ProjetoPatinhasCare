import { Router } from "express";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db.js";

import { configuracaoEmail, enviarRecuperacao } from "../services/password-email.js";

const router = Router();
const hash = token => createHash("sha256").update(token).digest("hex");
const resposta = { mensagem: "Se o e-mail estiver cadastrado e ativo, você receberá as instruções de recuperação." };
const invalido = { mensagem: "Link inválido ou expirado. Solicite uma nova recuperação." };
const limite = () => rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: "draft-8", legacyHeaders: false,
  message: { mensagem: "Muitas tentativas. Aguarde 15 minutos." } });

router.post("/forgot-password", limite(), async (req, res, next) => {
  const email = req.body?.email;
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ mensagem: "Informe um e-mail válido." });
  }
  let config;
  try { config = configuracaoEmail(); }
  catch {
    return res.status(503).json({ mensagem: "Recuperação indisponível. Contate a responsável pelo sistema." });
  }
  const origin = config.origin;
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    const { rows } = await client.query("SELECT id FROM usuarios WHERE email=$1 AND ativo=TRUE FOR UPDATE", [email.trim().toLowerCase()]);
    let link;
    if (rows[0]) {
      const token = randomBytes(32).toString("hex");
      await client.query(
        "INSERT INTO recuperacoes_senha(usuario_id, token_hash, expira_em) VALUES($1,$2,NOW()+INTERVAL '15 minutes') ON CONFLICT(usuario_id) DO UPDATE SET token_hash=EXCLUDED.token_hash, expira_em=EXCLUDED.expira_em",
        [rows[0].id, hash(token)]);
      link = new URL("/redefinir-senha", origin);
      link.hash = "token=" + token;
    }
    await client.query("COMMIT");
    client.release();
    client = null;
    if (link) {
      try { await enviarRecuperacao(config, email.trim().toLowerCase(), link.href); }
      catch {
        // Não revelar a existência da conta nem registrar link, senha ou endereço.
        console.error("[RECUPERAÇÃO] Falha no envio. Execute npm run email:verify para conferir o Gmail.");
        await pool.query("DELETE FROM recuperacoes_senha WHERE usuario_id=$1 AND token_hash=$2", [rows[0].id, hash(new URLSearchParams(link.hash.slice(1)).get("token"))]);
      }
    }
    return res.json(resposta);
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    next(error);
  } finally { client?.release(); }
});

router.post("/reset-password", limite(), async (req, res, next) => {
  const { token, senha } = req.body ?? {};
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).json(invalido);
  if (typeof senha !== "string" || senha.length < 12 || Buffer.byteLength(senha,"utf8") > 72) {
    return res.status(400).json({ mensagem: "Use uma senha com pelo menos 12 caracteres e no máximo 72 bytes." });
  }
  let client;
  try {
    const senhaHash = await bcrypt.hash(senha,12);
    client = await pool.connect();
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT u.id FROM usuarios u JOIN recuperacoes_senha r ON r.usuario_id=u.id WHERE r.token_hash=$1 AND u.ativo=TRUE FOR UPDATE OF u", [hash(token)]);
    if (!rows[0]) {
      await client.query("ROLLBACK");
      return res.status(400).json(invalido);
    }
    const usado = await client.query("DELETE FROM recuperacoes_senha WHERE usuario_id=$1 AND token_hash=$2 AND expira_em>clock_timestamp() RETURNING usuario_id", [rows[0].id,hash(token)]);
    if (!usado.rowCount) {
      await client.query("ROLLBACK");
      return res.status(400).json(invalido);
    }
    await client.query("UPDATE usuarios SET senha_hash=$1, versao_senha=versao_senha+1 WHERE id=$2", [senhaHash,rows[0].id]);
    await client.query("COMMIT");
    return res.json({ mensagem: "Senha atualizada! Entre com sua nova senha." });
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    next(error);
  } finally { client?.release(); }
});
export default router;
