// As opções de vacina, exame e procedimento vêm da API (/saude/tipos).
// "outro" é o rótulo da opção que abre o campo para digitar um nome novo;
// o nome digitado é salvo no banco e vira opção nos próximos registros.
export const tiposRegistro = {
    consulta: {
        label: "Consulta",
        campo: "Nome do(a) médico(a)",
        data: "Data da consulta",
        anexo: "Anexar comprovante",
        observacao: "Motivo da consulta",
    },

    vacina: {
        label: "Vacina",
        campo: "Tipo de vacina",
        outro: "Outra",
        campoOutro: "Informe qual vacina",
        data: "Data da vacina",
        anexo: "Anexar comprovante da vacina",
        proxima: "Data da próxima dose",
    },

    vermifugo: {
        label: "Vermífugo",
        campo: "Produto",
        data: "Data de aplicação",
        anexo: "Anexar comprovante",
        proxima: "Data da reaplicação",
    },

    exame: {
        label: "Exame",
        campo: "Tipo de exame",
        outro: "Outro",
        campoOutro: "Informe qual exame",
        data: "Data do exame",
        anexo: "Anexar exame",
    },

    procedimento: {
        label: "Procedimento",
        campo: "Tipo de procedimento",
        outro: "Outro",
        campoOutro: "Informe qual procedimento",
        data: "Data do procedimento",
        anexo: "Anexar comprovante",
    },
};

// Mesma regra do backend: ignora acento, maiúsculas e espaços repetidos.
export function normalizarNome(nome) {
    return nome
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleLowerCase("pt-BR")
        .replace(/\s+/g, " ")
        .trim();
}

export const nomeStatus = {
    vencido: "Vencido",
    a_vencer: "A vencer",
    em_dia: "Prazos em dia",
    sem_previsao: "Sem próxima data",
    sem_registro: "Sem acompanhamento"
};

export const coresStatus = {
    vencido: "bg-red-100 text-red-900",
    a_vencer: "bg-amber-100 text-amber-900",
    em_dia: "bg-green-100 text-green-900",
    sem_previsao: "bg-stone-200 text-stone-800",
    sem_registro: "bg-stone-200 text-stone-800",
};

export function dataHoje(){
    const data = new Date();

    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0"),
    ].join("-");
}

export function formatarData(data) {
    if (!data) return "Não informada";
    return data.split("-").reverse().join("/");
}

function numeroDoDia(data){
    const [ano, mes, dia] = data.split("-").map(Number);
    return Date.UTC(ano, mes - 1, dia) / 86400000;
}

export function statusDoPrazo(registro, hoje = dataHoje()) {
    if (!registro.proximaData) return "sem_previsao";

    const dias = numeroDoDia(registro.proximaData) - numeroDoDia(hoje);

    if (dias < 0) return "vencido";
    if (dias <= 30) return "a_vencer";

    return "em_dia";
}

export function acompanhamentosAtuais(registros){
    const ultimos = new Map();

    const ordenados = [...registros].sort(
        (a, b) =>
            b.data.localeCompare(a.data) ||
        b.criadoEm.localeCompare(a.criadoEm)
    );

    for (const registro of ordenados) {
        if (!["vacina", "vermifugo"].includes(registro.tipo)) continue;

        const chave =
        registro.tipo === "vacina"
        ? `vacina:${registro.titulo.trim().toLocaleLowerCase("pt-BR")}`
        : "vermifugo";

        if (!ultimos.has(chave)) {
            ultimos.set(chave, registro);
        }
    }

    return [...ultimos.values()];
}

export function statusGeral(registros){
    const atuais = acompanhamentosAtuais(registros);

    if (atuais.length === 0) return "sem_registro";

    const estados = atuais.map((registros) => statusDoPrazo(registros));

    if (estados.includes("vencido")) return "vencido";
    if (estados.includes("a_vencer")) return "a_vencer";
    if (estados.includes("sem_previsao")) return "sem_previsao";

    return "em_dia"
}