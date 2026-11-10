export const statusOptions = [
    { value: "disponivel", label: "Disponível" },
    { value: "indisponivel", label: "Indisponível" },
    { value: "em_observacao", label: "Em Observação" },
    { value: "adotado(a)", label: "Adotado(a)" },
];

export function obterNomeStatus(status) {
    return (
        statusOptions.find((opcao) => opcao.value === status) ?.label ?? "Não informado"
    );
}
