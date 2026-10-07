export const statusOptions = [
    { value: "disponível", label: "Disponível" },
    { value: "indisponível", label: "Indisponível" },
    { value: "em_observacao", label: "Em Observação" },
    { value: "adotado", label: "Adotado" },
];

export function obterNomeStatus(status) {
    return (
        statusOptions.find((opcao) => opcao.value === status) ?.label ?? "Não informado"
    );
}