import multer from "multer";
import sharp from "sharp";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 1,
        parts: 2,
        fieldSize: 20 * 1024
    }
}).single("foto");

export function receberFoto(req, res, next){
    upload(req, res, (erro) => {
        if (!erro) return next();

        if (erro instanceof multer.MulterError) {
            const mensagem = erro.code === "LIMIT_FILE_SIZE"
                ? "O tamanho da foto não pode ultrapassar 5MB."
                : "Envie só uma foto e os dados do cadastro.";

                return res.status(400).json({ mensagem });
        }

        next(erro);
    });
}

export async function prepararCadastro(req, res, next) {
    let body;

    try {
        body = req.is("multipart/form-data")
        ? JSON.parse(req.body.dados)
        : req.body;
    } catch {
        return res.status(400).json({ mensagem: "Dados do cadastro inválidos."
        });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ mensagem: "Envie os dados do gatinho"
        });
    }

    if (
        body.removerFoto !== undefined &&
        typeof body.removerFoto !== "boolean"
    ) {
        return res.status(400).json({ mensagem: "A opção de remover é inválida."
        });
    }

    if (req.file && body.removerFoto) {
        return res.status(400).json({ mensagem: "Escolha entre enviar uma foto ou remover a atual."
        });
    }

    req.body = body;
    req.fotoDados = null;
    req.alterarFoto = Boolean(req.file) || body.removerFoto === true;

    if (!req.file) return next();

    try {
        const imagem = sharp(req.file.buffer, {
            limitInputPixels: 25_000_000,
        })

        const metadados = await imagem.metadata();

        if (!["jpeg", "jpg", "png", "webp"].includes(metadados.format)) {
            return res.status(400).json({ mensagem: "O formato da foto não é suportado."
            });
        }

        req.fotoDados = await imagem
        .rotate()
        .resize({
            width: 1200,
            height: 1200,
            fit: "inside",
            withoutEnlargement: true,
        })
        .webp({ quality: 80})
        .toBuffer();

if (req.fotoDados.length > 2 * 1024 * 1024) {
      return res.status(400).json({
        mensagem: "A imagem processada ficou muito grande. Escolha outra.",
      });
    }

    next();
  } catch {
    return res.status(400).json({
      mensagem: "Não foi possível ler essa imagem. Escolha outra foto.",
    });
  }
}