import { Router } from "express";
import { randomUUID } from "node:crypto";

import { pool } from "../db.js";
import {
    normalizarNome,
    tiposComOpcoes,
    validarRegistro,
} from "../validators/health.js";
import {
    receberAnexo,
    prepararRegistro,
} from "../middlewares/healthUpload.js";

const router = Router();

const formatoUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Nunca seleciona anexo_dados aqui: os bytes só saem pela rota do anexo.
const campos = `
  id,
  gato_id AS "gatoId",
  tipo,
  titulo,
  TO_CHAR(data, 'YYYY-MM-DD') AS data,
  COALESCE(TO_CHAR(proxima_data, 'YYYY-MM-DD'), '') AS "proximaData",
  observacoes,
  (anexo_dados IS NOT NULL) AS "temAnexo",
  COALESCE(anexo_nome, '') AS "anexoNome",
  COALESCE(anexo_tipo, '') AS "anexoTipo",
  criado_em AS "criadoEm",
  atualizado_em AS "atualizadoEm"
`;

function apresentarRegistro(linha) {
    const { temAnexo, ...registro } = linha;

    const versao = new Date(registro.atualizadoEm).getTime();

    return {
        ...registro,
        anexoUrl: temAnexo
            ? `/api/saude/registros/${registro.id}/anexo?v=${versao}`
            : "",
    };
}

/**
 * Para vacina, exame e procedimento, garante que o nome exista como opção
 * e devolve a grafia já cadastrada. Assim "antirrabica" vira "Antirrábica"
 * se essa opção já existir, e um nome novo passa a aparecer na lista.
 */
async function resolverTitulo(cliente, tipo, titulo) {
    if (!tiposComOpcoes.includes(tipo)) return titulo;

    const normalizado = normalizarNome(titulo);

    await cliente.query(
        `
          INSERT INTO tipos_saude (id, categoria, nome, nome_normalizado)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (categoria, nome_normalizado) DO NOTHING
        `,
        [randomUUID(), tipo, titulo, normalizado]
    );

    const resultado = await cliente.query(
        `
          SELECT nome
          FROM tipos_saude
          WHERE categoria = $1 AND nome_normalizado = $2
        `,
        [tipo, normalizado]
    );

    return resultado.rows[0].nome;
}

async function emTransacao(funcao) {
    const cliente = await pool.connect();

    try {
        await cliente.query("BEGIN");
        const resultado = await funcao(cliente);
        await cliente.query("COMMIT");
        return resultado;
    } catch (erro) {
        await cliente.query("ROLLBACK");
        throw erro;
    } finally {
        cliente.release();
    }
}

router.param("id", (req, res, next, id) => {
    if (!formatoUuid.test(id)) {
        return res.status(400).json({
            mensagem: "Identificador de registro inválido.",
        });
    }

    next();
});

router.get("/tipos", async (req, res) => {
    const resultado = await pool.query(
        "SELECT categoria, nome FROM tipos_saude"
    );

    const tipos = Object.fromEntries(
        tiposComOpcoes.map((categoria) => [categoria, []])
    );

    for (const { categoria, nome } of resultado.rows) {
        tipos[categoria]?.push(nome);
    }

    for (const lista of Object.values(tipos)) {
        lista.sort((a, b) => a.localeCompare(b, "pt-BR"));
    }

    res.json({ tipos });
});

router.get("/registros", async (req, res) => {
    const resultado = await pool.query(`
      SELECT ${campos}
      FROM registros_saude
      ORDER BY data DESC, criado_em DESC
    `);

    res.json({
        registros: resultado.rows.map(apresentarRegistro),
    });
});

router.get("/registros/:id/anexo", async (req, res) => {
    const resultado = await pool.query(
        `
          SELECT anexo_dados, anexo_nome, anexo_tipo
          FROM registros_saude
          WHERE id = $1
        `,
        [req.params.id]
    );

    const linha = resultado.rows[0];

    if (!linha?.anexo_dados) {
        return res.status(404).json({ mensagem: "Anexo não encontrado." });
    }

    res.set("Cross-Origin-Resource-Policy", "same-site");
    res.attachment(linha.anexo_nome || "anexo");
    res.type(linha.anexo_tipo);
    res.send(linha.anexo_dados);
});

router.post(
    "/registros",
    receberAnexo,
    prepararRegistro,
    async (req, res) => {
        const { gatoId } = req.body;

        if (typeof gatoId !== "string" || !formatoUuid.test(gatoId)) {
            return res.status(400).json({ mensagem: "Selecione um gatinho válido." });
        }

        const { erro, dados } = validarRegistro(req.body);

        if (erro) {
            return res.status(400).json({ mensagem: erro });
        }

        try {
            const linha = await emTransacao(async (cliente) => {
                const titulo = await resolverTitulo(cliente, dados.tipo, dados.titulo);

                const resultado = await cliente.query(
                    `
                      INSERT INTO registros_saude (
                        id, gato_id, tipo, titulo, data, proxima_data, observacoes,
                        anexo_dados, anexo_nome, anexo_tipo, criado_por
                      )
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                      RETURNING ${campos}
                    `,
                    [
                        randomUUID(),
                        gatoId,
                        dados.tipo,
                        titulo,
                        dados.data,
                        dados.proximaData,
                        dados.observacoes,
                        req.anexo?.dados ?? null,
                        req.anexo?.nome ?? null,
                        req.anexo?.tipo ?? null,
                        req.usuario.id,
                    ]
                );

                return resultado.rows[0];
            });

            res.status(201).json({ registro: apresentarRegistro(linha) });
        } catch (falha) {
            // Violação de chave estrangeira: o gato não existe.
            if (falha.code === "23503") {
                return res.status(404).json({ mensagem: "Gatinho não encontrado." });
            }

            throw falha;
        }
    }
);

router.put(
    "/registros/:id",
    receberAnexo,
    prepararRegistro,
    async (req, res) => {
        const atual = await pool.query(
            "SELECT tipo FROM registros_saude WHERE id = $1",
            [req.params.id]
        );

        if (!atual.rows[0]) {
            return res.status(404).json({ mensagem: "Registro não encontrado." });
        }

        const { erro, dados } = validarRegistro(req.body, {
            tipo: atual.rows[0].tipo,
        });

        if (erro) {
            return res.status(400).json({ mensagem: erro });
        }

        const alterarAnexo = Boolean(req.anexo) || dados.removerAnexo;

        const linha = await emTransacao(async (cliente) => {
            const titulo = await resolverTitulo(cliente, dados.tipo, dados.titulo);

            const resultado = await cliente.query(
                `
                  UPDATE registros_saude
                  SET
                    titulo = $1,
                    data = $2,
                    proxima_data = $3,
                    observacoes = $4,
                    anexo_dados = CASE WHEN $5::boolean THEN $6::bytea ELSE anexo_dados END,
                    anexo_nome = CASE WHEN $5::boolean THEN $7::text ELSE anexo_nome END,
                    anexo_tipo = CASE WHEN $5::boolean THEN $8::varchar ELSE anexo_tipo END,
                    atualizado_em = NOW()
                  WHERE id = $9
                  RETURNING ${campos}
                `,
                [
                    titulo,
                    dados.data,
                    dados.proximaData,
                    dados.observacoes,
                    alterarAnexo,
                    req.anexo?.dados ?? null,
                    req.anexo?.nome ?? null,
                    req.anexo?.tipo ?? null,
                    req.params.id,
                ]
            );

            return resultado.rows[0];
        });

        if (!linha) {
            return res.status(404).json({ mensagem: "Registro não encontrado." });
        }

        res.json({ registro: apresentarRegistro(linha) });
    }
);

router.delete("/registros/:id", async (req, res) => {
    const resultado = await pool.query(
        "DELETE FROM registros_saude WHERE id = $1 RETURNING id",
        [req.params.id]
    );

    if (!resultado.rowCount) {
        return res.status(404).json({ mensagem: "Registro não encontrado." });
    }

    res.status(204).end();
});

export default router;
