export const tiposRegistro = {
    consulta: {
        label: "Consulta",
        campo: "Nome do(a) médico(a)",
        observacao: "Motivo da consulta: ",
    },
    
    vacina: {
        label: "Vacina",
        campo: "Tipo de vacina",
        opcoes: ["Antirrábica", "V3", "V4", "V5", "Outra"],
        proxima: "Data da próxima dose",
    },

    vermifugo: {
        label: "Vermífugo",
        campo: "Produto",
        proxima: "Data da reaplicação",
    },

    exame: {
        label: "Exame",
        campo: "Tipo de exame",
        opcoes: ["Hemograma", "Ultrassom", "FIV/FeLV", "Outro"],
    },

    procedimento: {
        label: "Procedimento",
        campo: "Tipo de procedimento",
        opcoes: ["Castração", "Curativo", "Cirurgia", "Outro"],
    },
};

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
            b.data.locaeCompare(a.data) ||
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

    if (estados.includes("vencidos")) return "vencido";
    if (estados.includes("a_vencer")) return "a_vencer";
    if (estados.includes("sem_previsso")) return "sem_previsso";

    return "em_dia"
}