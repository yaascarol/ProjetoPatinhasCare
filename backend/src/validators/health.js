import { dataValida, hojeNoBrasil } from "./cat.js";

export const tiposPermitidos = [
    "consulta",
    "vacina",
    "vermifugo",
    "exame",
    "procedimento",
];

// Tipos cujo título vem de uma lista de opções (com "Outro").
export const tiposComOpcoes = ["vacina", "exame", "procedimento"];

// Tipos que têm próxima data (próxima dose / reaplicação).
const tiposComProximaData = ["vacina", "vermifugo"];

const LIMITE_TITULO = 120;
const LIMITE_OBSERVACOES = 2000;

/**
 * Normaliza um nome para comparação: sem acentos, minúsculo e com
 * espaços simples. "  ANTIRRÁBICA " e "antirrabica" ficam iguais.
 */
export function normalizarNome(nome) {
    return nome
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("pt-BR")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Valida os dados de um registro de saúde.
 * Em edição, o tipo vem do registro existente (não pode ser trocado).
 */
export function validarRegistro(body, { tipo: tipoExistente } = {}) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { erro: "Envie os dados do registro." };
    }

    const tipo = tipoExistente ?? body.tipo;

    if (!tiposPermitidos.includes(tipo)) {
        return { erro: "Selecione um tipo de registro válido." };
    }

    if (typeof body.titulo !== "string" || !body.titulo.trim()) {
        return { erro: "Preencha a identificação do registro." };
    }

    const titulo = body.titulo.trim().replace(/\s+/g, " ");

    if (titulo.length > LIMITE_TITULO) {
        return { erro: `A identificação deve ter até ${LIMITE_TITULO} caracteres.` };
    }

    if (typeof body.data !== "string" || !dataValida(body.data)) {
        return { erro: "Informe uma data válida para o registro." };
    }

    if (body.data > hojeNoBrasil()) {
        return { erro: "A data do registro não pode estar no futuro." };
    }

    let proximaData = null;

    if (
        tiposComProximaData.includes(tipo) &&
        body.proximaData !== "" &&
        body.proximaData != null
    ) {
        if (typeof body.proximaData !== "string" || !dataValida(body.proximaData)) {
            return { erro: "Informe uma próxima data válida." };
        }

        if (body.proximaData < body.data) {
            return { erro: "A próxima data não pode ser anterior à data do registro." };
        }

        proximaData = body.proximaData;
    }

    const observacoes = body.observacoes ?? "";

    if (typeof observacoes !== "string" || observacoes.length > LIMITE_OBSERVACOES) {
        return { erro: `As observações devem ter até ${LIMITE_OBSERVACOES} caracteres.` };
    }

    if (tipo === "consulta" && !observacoes.trim()) {
        return { erro: "Informe o motivo da consulta." };
    }

    if (body.removerAnexo !== undefined && typeof body.removerAnexo !== "boolean") {
        return { erro: "A opção de remover o anexo é inválida." };
    }

    return {
        dados: {
            tipo,
            titulo,
            data: body.data,
            proximaData,
            observacoes: observacoes.trim(),
            removerAnexo: body.removerAnexo === true,
        },
    };
}

/** Remove caminho e caracteres de controle do nome do arquivo enviado. */
export function limparNomeArquivo(nome) {
    const base = String(nome ?? "")
        .split(/[\\/]/)
        .pop()
        .replace(/[\u0000-\u001f\u007f"]/g, "")
        .trim();

    return (base || "anexo").slice(0, 150);
}

/** Descobre o tipo real do arquivo pelos primeiros bytes. */
export function detectarTipoAnexo(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 8) return null;

    if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") {
        return "application/pdf";
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }

    if (
        buffer
            .subarray(0, 8)
            .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
        return "image/png";
    }

    return null;
}
