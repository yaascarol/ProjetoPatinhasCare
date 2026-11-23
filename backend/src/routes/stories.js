import { Router } from "express";
import { randomUUID } from "node:crypto";

import { pool } from "../db.js";
import { validarHistoria } from "../validators/story.js";
import { receberFoto, prepararCadastro } from "../middlewares/catUpload.js";

const router = Router();

const campos = `
  h.id,
  h.gato_id AS "gatoId",
  COALESCE(g.nome, h.nome_gato) AS "nomeGato",
  h.titulo,
  h.texto,
  TO_CHAR(h.data, 'YYYY-MM-DD') AS data,
  h.status,
  h.autor_id AS "autorId",
  (h.foto_dados IS NOT NULL) AS "temFoto",
  h.atualizado_em AS "atualizadoEm"
`;

const origem = "FROM historias h LEFT JOIN gatos g ON g.id = h.gato_id";

const ehResponsavel = (req) => req.usuario.papel === "responsavel";

const buscar = async (id) =>
  (await pool.query(`SELECT ${campos} ${origem} WHERE h.id = $1`, [id])).rows[0];

function apresentar({ temFoto, atualizadoEm, ...historia }) {
  const versao = new Date(atualizadoEm).getTime();

  return {
    ...historia,
    fotoUrl: temFoto ? `/api/historias/${historia.id}/foto?v=${versao}` : "",
  };
}

router.param("id", (req, res, next, id) => {
  const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!formatoUuid.test(id)) {
    return res.status(400).json({ mensagem: "Identificador inválido." });
  }
  next();
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${campos} ${origem} ORDER BY h.data DESC, h.criado_em DESC`
  );
  res.json({ historias: rows.map(apresentar) });
});

router.get("/:id/foto", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT foto_dados FROM historias WHERE id = $1",
    [req.params.id]
  );

  if (!rows[0]?.foto_dados) {
    return res.status(404).json({ mensagem: "Foto não encontrada." });
  }

  res.set("Cross-Origin-Resource-Policy", "same-site");
  res.type("image/webp").send(rows[0].foto_dados);
});

router.post("/", receberFoto, prepararCadastro, async (req, res) => {
  const { erro, dados } = validarHistoria(req.body);
  if (erro) return res.status(400).json({ mensagem: erro });

  if (dados.status === "publicada" && !ehResponsavel(req)) {
    return res.status(403).json({ mensagem: "Apenas responsáveis podem publicar histórias." });
  }

  const id = randomUUID();

  try {
    await pool.query(
      `INSERT INTO historias
         (id, gato_id, nome_gato, titulo, texto, data, status, foto_dados, autor_id)
       VALUES
         ($1, $2, COALESCE((SELECT nome FROM gatos WHERE id = $2), ''), $3, $4, $5, $6, $7, $8)`,
      [id, dados.gatoId, dados.titulo, dados.texto, dados.data, dados.status, req.fotoDados, req.usuario.id]
    );
  } catch (e) {
    if (e.code === "23503") return res.status(400).json({ mensagem: "Gatinho não encontrado." });
    throw e;
  }

  res.status(201).json({ historia: apresentar(await buscar(id)) });
});

router.put("/:id", receberFoto, prepararCadastro, async (req, res) => {
  const { erro, dados } = validarHistoria(req.body);
  if (erro) return res.status(400).json({ mensagem: erro });

  const atual = await buscar(req.params.id);
  if (!atual) return res.status(404).json({ mensagem: "História não encontrada." });

  if (!ehResponsavel(req) && (atual.status === "publicada" || dados.status === "publicada")) {
    return res.status(403).json({
      mensagem: "Apenas responsáveis podem publicar ou editar histórias publicadas.",
    });
  }

  try {
    await pool.query(
      `UPDATE historias SET
         gato_id = $1,
         nome_gato = COALESCE((SELECT nome FROM gatos WHERE id = $1), nome_gato),
         titulo = $2,
         texto = $3,
         data = $4,
         status = $5,
         foto_dados = CASE WHEN $6::boolean THEN $7::bytea ELSE foto_dados END,
         atualizado_em = NOW()
       WHERE id = $8`,
      [dados.gatoId, dados.titulo, dados.texto, dados.data, dados.status, req.alterarFoto, req.fotoDados, req.params.id]
    );
  } catch (e) {
    if (e.code === "23503") return res.status(400).json({ mensagem: "Gatinho não encontrado." });
    throw e;
  }

  res.json({ historia: apresentar(await buscar(req.params.id)) });
});

router.delete("/:id", async (req, res) => {
  const atual = await buscar(req.params.id);
  if (!atual) return res.status(404).json({ mensagem: "História não encontrada." });

  const ehAutora = atual.autorId === req.usuario.id && atual.status === "rascunho";

  if (!ehResponsavel(req) && !ehAutora) {
    return res.status(403).json({ mensagem: "Você só pode excluir os seus próprios rascunhos." });
  }

  await pool.query("DELETE FROM historias WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;