import { Router } from "express";
import { randomUUID } from "node:crypto";

import { pool } from "../db.js";
import { validarGato } from "../validators/cat.js";
import {
  receberFoto,
  prepararCadastro,
} from "../middlewares/catUpload.js";

const router = Router();

const campos = `
  id,
  nome,
  COALESCE(
    TO_CHAR(data_nascimento, 'YYYY-MM-DD'),
    ''
  ) AS "dataNascimento",
  sexo,
  status,
  personalidade,
  descricao,
  (foto_dados IS NOT NULL) AS "temFoto",
  criado_em AS "criadoEm",
  atualizado_em AS "atualizadoEm"
`;

function apresentarGato(linha) {
  const { temFoto, ...gato } = linha;

  const versao = new Date(gato.atualizadoEm).getTime();

  return {
    ...gato,
    fotoUrl: temFoto
      ? `/api/gatos/${gato.id}/foto?v=${versao}`
      : "",
  };
}

router.param("id", (req, res, next, id) => {
  const formatoUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!formatoUuid.test(id)) {
    return res.status(400).json({
      mensagem: "Identificador de gatinho inválido.",
    });
  }

  next();
});

router.get("/", async (req, res) => {
  const resultado = await pool.query(`
    SELECT ${campos}
    FROM gatos
    ORDER BY criado_em DESC, id DESC
  `);

  res.json({
    gatos: resultado.rows.map(apresentarGato),
  });
});

router.get("/:id/foto", async (req, res) => {
  const resultado = await pool.query(
    "SELECT foto_dados FROM gatos WHERE id = $1",
    [req.params.id]
  );

  const foto = resultado.rows[0]?.foto_dados;

  if (!foto) {
    return res.status(404).json({
      mensagem: "Foto não encontrada.",
    });
  }

  res.set("Cross-Origin-Resource-Policy", "same-site");
  res.set("Cache-Control", "no-store");
  res.type("image/webp").send(foto);
});

router.get("/:id", async (req, res) => {
  const resultado = await pool.query(
    `SELECT ${campos} FROM gatos WHERE id = $1`,
    [req.params.id]
  );

  if (!resultado.rows[0]) {
    return res.status(404).json({
      mensagem: "Gatinho não encontrado.",
    });
  }

  res.json({
    gato: apresentarGato(resultado.rows[0]),
  });
});

router.post(
  "/",
  receberFoto,
  prepararCadastro,
  async (req, res) => {
    const { erro, dados } = validarGato(req.body);

    if (erro) {
      return res.status(400).json({ mensagem: erro });
    }

    const resultado = await pool.query(
      `
        INSERT INTO gatos (
          id,
          nome,
          data_nascimento,
          sexo,
          status,
          personalidade,
          descricao,
          foto_dados
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING ${campos}
      `,
      [
        randomUUID(),
        dados.nome,
        dados.dataNascimento,
        dados.sexo,
        dados.status,
        dados.personalidade,
        dados.descricao,
        req.fotoDados,
      ]
    );

    res.status(201).json({
      gato: apresentarGato(resultado.rows[0]),
    });
  }
);

router.put(
  "/:id",
  receberFoto,
  prepararCadastro,
  async (req, res) => {
    const { erro, dados } = validarGato(req.body);

    if (erro) {
      return res.status(400).json({ mensagem: erro });
    }

    const resultado = await pool.query(
      `
        UPDATE gatos
        SET
          nome = $1,
          data_nascimento = $2,
          sexo = $3,
          status = $4,
          personalidade = $5,
          descricao = $6,
          foto_dados = CASE
            WHEN $7::boolean THEN $8::bytea
            ELSE foto_dados
          END,
          atualizado_em = NOW()
        WHERE id = $9
        RETURNING ${campos}
      `,
      [
        dados.nome,
        dados.dataNascimento,
        dados.sexo,
        dados.status,
        dados.personalidade,
        dados.descricao,
        req.alterarFoto,
        req.fotoDados,
        req.params.id,
      ]
    );

    if (!resultado.rows[0]) {
      return res.status(404).json({
        mensagem: "Gatinho não encontrado.",
      });
    }

    res.json({
      gato: apresentarGato(resultado.rows[0]),
    });
  }
);

export default router;