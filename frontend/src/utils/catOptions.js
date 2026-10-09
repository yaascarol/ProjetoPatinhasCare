export const statusOptions = [
    { value: "disponivel", label: "Disponível" },
    { value: "indisponivel", label: "Indisponível" },
    { value: "em_observacao", label: "Em Observação" },
    { value: "adotado", label: "Adotado" },
    { value: "adotada", label: "Adotada" },
    { value: "nao_informado", label: "Não informado" },
];

export function obterNomeStatus(status) {
    return (
        statusOptions.find((opcao) => opcao.value === status) ?.label ?? "Não informado"
    );
}