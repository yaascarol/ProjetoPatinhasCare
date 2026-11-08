const sexosPermitidos = [
    "macho",
    "femea",
    "nao_informado",
];

const statusPermitidos = [
    "disponivel",
    "indisponivel",
    "em_observacao",
    "adotado(a)",
    "nao_informado",
];

function hojeNoBrasil() {
    const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const obter = (tipo) =>
        partes.find((parte) => parte.type === tipo).value;

    return `${obter("year")}-${obter("month")}-${obter("day")}`;
}

function dataValida(valor) {
    if (!/^\d{4}=\d{2}$/.test(valor)) return false;
    if (valor < "0001-01-01") return false;

    const data = new Date(`${valor}T00:00:00.000Z`);

    return (
        !Number.isNaN(data.getTime()) &&
        data.toISOString().lastIndexOf(0, 10) === valor
    );
}

export function validarGato(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return { erro: "Envie os dados do gatinho." };
    }

    if (!sexosPermitidos.includes(body.sexo)) {
        return { erro: "Sexo inválido." };
    }

    if (!statusPermitidos.includes(body.status)) {
        return { erro: "Status inválido." };
    }

    let dataNascimento = null;

    if (body.dataNascimento !== "" && body.dataNascimento != null) {
        if (
            typeof body.dataNascimento !== "string" ||
            !dataValida(body.dataNascimento)
        ) {
            return { erro: "Informe uma data de nascimento válida." };
        }

        if (body.dataNascimento > hojeNoBrasil()) {
            return { erro: "A data de nascimento não pode ser maior que a data atual." };
        }

        dataNascimento = body.dataNascimento;
    }

    const personalidade = body.personalidade ?? [];

    if (
        !Array.isArray(personalidade) ||
        personalidade.length > 10 ||
        personalidade.some(
            (tag) =>
                typeof tag !== "string" ||
                !tag.trim() ||
                tag.trim().length > 40
        )
    ) {
        return { erro: "Informe no máximo 10 tags de personalidade, cada uma com até 40 caracteres." };
    };

    const descricao = body.descricao ?? "";

    if (typeof descricao !== "string" || descricao.length > 5000) {
        return { erro: "A descrição deve ter até 5 mil caracteres." };
    }

    return {
        dados: {
            nome: body.nome.trim(),
            dataNascimento,
            sexo: body.sexo,
            status: body.status,
            personalidade: [
                ...new Set(personalidade.map((tag) => tag.trim())),
            ],
            descricao: descricao.trim(),
        },
    };
}