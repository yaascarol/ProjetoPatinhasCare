import { Router } from "express";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db.js";
import { configuracaoEmail, enviarRecuperacao } from "../services/password-email.js";
import { validarIntegrante, validarAlteracao } from "../validators/team.js";

const router = Router();
const campos = 'id, nome, email, papel, ativo, senha_definida AS "senhaDefinida", criado_em AS "criadoEm"';
const falha = (status, message) => Object.assign(new Error(message), { status });

router.use((req, res, next) => {
  if (req.usuario?.papel !== "responsavel") return res.status(403).json({ mensagem: "Somente responsáveis podem administrar a equipe." });
  next();
});

router.param("id", (req, res, next, id) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return res.status(400).json({ mensagem: "Integrante inválido." });
  next();
});

// Serializa mudanças de acesso: duas requisições não podem remover os últimos
// responsáveis ao mesmo tempo. Revalida o autor após obter o bloqueio.
async function administrar(req, executar) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(160011, 1)");
    const autor = await client.query("SELECT papel, ativo, versao_senha FROM usuarios WHERE id=$1 FOR UPDATE", [req.usuario.id]);
    if (!autor.rows[0]?.ativo || autor.rows[0].papel !== "responsavel" || autor.rows[0].versao_senha !== req.session.versaoSenha) throw falha(403, "Seu acesso mudou. Entre novamente no sistema.");
    const resultado = await executar(client);
    await client.query("COMMIT");
    return resultado;
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally { client.release(); }
}

router.get("/", async (req, res) => {
  const resultado = await pool.query(`SELECT ${campos} FROM usuarios ORDER BY nome, id`);
  res.json({ integrantes: resultado.rows });
});

const limitarCriacao = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { mensagem: "Muitos cadastros. Aguarde alguns minutos." } });
router.post("/", limitarCriacao, async (req, res) => {
  const { erro, dados } = validarIntegrante(req.body);
  if (erro) return res.status(400).json({ mensagem: erro });
  // Senha aleatória não é entregue a ninguém; o titular define sua senha pelo link.
  const senhaHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
  const integrante = await administrar(req, async client => {
    const resultado = await client.query(`INSERT INTO usuarios(id,nome,email,papel,senha_hash,senha_definida) VALUES($1,$2,$3,$4,$5,FALSE) RETURNING ${campos}`, [randomUUID(), dados.nome, dados.email, dados.papel, senhaHash]);
    return resultado.rows[0];
  });
  res.status(201).json({ integrante });
});

router.patch("/:id", async (req, res) => {
  const erro = validarAlteracao(req.body);
  if (erro) return res.status(400).json({ mensagem: erro });
  const integrante = await administrar(req, async client => {
    const atual = await client.query("SELECT * FROM usuarios WHERE id=$1 FOR UPDATE", [req.params.id]);
    const pessoa = atual.rows[0];
    if (!pessoa) throw falha(404, "Integrante não encontrado.");
    const papel = req.body.papel ?? pessoa.papel;
    const ativo = req.body.ativo ?? pessoa.ativo;
    if (pessoa.ativo && pessoa.senha_definida && pessoa.papel === "responsavel" && (!ativo || papel !== "responsavel")) {
      const contagem = await client.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE ativo=TRUE AND senha_definida=TRUE AND papel='responsavel'");
      if (contagem.rows[0].total <= 1) throw falha(409, "Mantenha pelo menos um responsável ativo com senha definida.");
    }
    const mudou = pessoa.papel !== papel || pessoa.ativo !== ativo;
    const resultado = await client.query(`UPDATE usuarios SET papel=$1, ativo=$2, versao_senha=versao_senha+$3 WHERE id=$4 RETURNING ${campos}`, [papel, ativo, mudou ? 1 : 0, pessoa.id]);
    if (mudou) await client.query("DELETE FROM recuperacoes_senha WHERE usuario_id=$1", [pessoa.id]);
    return resultado.rows[0];
  });
  res.json({ integrante });
});

router.delete("/:id", async (req, res) => {
  await administrar(req, async client => {
    const resultado = await client.query("SELECT id,ativo,papel,senha_definida FROM usuarios WHERE id=$1 FOR UPDATE", [req.params.id]);
    const pessoa = resultado.rows[0];
    if (!pessoa) throw falha(404, "Integrante não encontrado.");
    if (pessoa.ativo && pessoa.senha_definida && pessoa.papel === "responsavel") {
      const contagem = await client.query("SELECT COUNT(*)::int AS total FROM usuarios WHERE ativo=TRUE AND senha_definida=TRUE AND papel='responsavel'");
      if (contagem.rows[0].total <= 1) throw falha(409, "Não é possível excluir o último responsável ativo com senha definida.");
    }
    await client.query("DELETE FROM session WHERE sess::jsonb->>'usuarioId'=$1", [pessoa.id]);
    // Recuperações são removidas por CASCADE. Registros de Saúde são preservados
    // pela chave estrangeira criado_por com ON DELETE SET NULL.
    await client.query("DELETE FROM usuarios WHERE id=$1", [pessoa.id]);
  });
  res.status(204).end();
});

const limitarEnvio = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { mensagem: "Muitos envios. Aguarde 15 minutos." } });
router.post("/:id/recuperacao", limitarEnvio, async (req, res) => {
  let config;
  try { config = configuracaoEmail(); } catch { throw falha(503, "Envio indisponível. Confira a configuração de e-mail do backend."); }
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  const pessoa = await administrar(req, async client => {
    const resultado = await client.query("SELECT id,email,ativo,senha_definida FROM usuarios WHERE id=$1 FOR UPDATE", [req.params.id]);
    const usuario = resultado.rows[0];
    if (!usuario) throw falha(404, "Integrante não encontrado.");
    if (!usuario.ativo) throw falha(409, "Reative o acesso antes de enviar um link.");
    const recente = await client.query("SELECT 1 FROM recuperacoes_senha WHERE usuario_id=$1 AND expira_em > NOW()+INTERVAL '14 minutes'", [usuario.id]);
    if (recente.rowCount) throw falha(429, "Um link acabou de ser solicitado. Aguarde um minuto para reenviar.");
    await client.query("INSERT INTO recuperacoes_senha(usuario_id,token_hash,expira_em) VALUES($1,$2,NOW()+INTERVAL '15 minutes') ON CONFLICT(usuario_id) DO UPDATE SET token_hash=EXCLUDED.token_hash, expira_em=EXCLUDED.expira_em", [usuario.id, hash]);
    return usuario;
  });
  const link = new URL("/redefinir-senha", config.origin);
  link.hash = "token=" + token;
  try { await enviarRecuperacao(config, pessoa.email, link.href, !pessoa.senha_definida); }
  catch {
    await pool.query("DELETE FROM recuperacoes_senha WHERE usuario_id=$1 AND token_hash=$2", [pessoa.id, hash]);
    throw falha(502, "Não foi possível enviar o e-mail. O cadastro foi mantido; confira o Gmail e tente novamente.");
  }
  res.json({ mensagem: config.local ? "Link gerado no terminal do backend, válido por 15 minutos." : "E-mail aceito pelo Gmail. Peça ao integrante para conferir a caixa de entrada e o spam. O link vale por 15 minutos." });
});

router.use((erro, req, res, next) => {
  if (erro.code === "23505") return res.status(409).json({ mensagem: "Já existe um integrante com esse e-mail." });
  if (erro.status) return res.status(erro.status).json({ mensagem: erro.message });
  next(erro);
});
export default router;
