import multer from "multer";

import {
    detectarTipoAnexo,
    limparNomeArquivo,
} from "../validators/health.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 1,
        parts: 2,
        fieldSize: 20 * 1024,
    },
}).single("anexo");

export function receberAnexo(req, res, next) {
    upload(req, res, (erro) => {
        if (!erro) return next();

        if (erro instanceof multer.MulterError) {
            const mensagem = erro.code === "LIMIT_FILE_SIZE"
                ? "O anexo não pode ultrapassar 5 MB."
                : "Envie só um anexo e os dados do registro.";

            return res.status(400).json({ mensagem });
        }

        next(erro);
    });
}

// Lê o JSON do campo "dados" (multipart) e confere o anexo pelo conteúdo,
// não pela extensão ou pelo tipo informado pelo navegador.
export function prepararRegistro(req, res, next) {
    let body;

    try {
        body = req.is("multipart/form-data")
            ? JSON.parse(req.body?.dados ?? "")
            : req.body;
    } catch {
        return res.status(400).json({ mensagem: "Dados do registro inválidos." });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ mensagem: "Envie os dados do registro." });
    }

    if (req.file && body.removerAnexo === true) {
        return res.status(400).json({
            mensagem: "Escolha entre enviar um anexo ou remover o atual.",
        });
    }

    req.body = body;
    req.anexo = null;

    if (!req.file) return next();

    const tipo = detectarTipoAnexo(req.file.buffer);

    if (!tipo) {
        return res.status(400).json({
            mensagem: "O anexo deve ser um PDF, JPG ou PNG.",
        });
    }

    req.anexo = {
        dados: req.file.buffer,
        nome: limparNomeArquivo(req.file.originalname),
        tipo,
    };

    next();
}
