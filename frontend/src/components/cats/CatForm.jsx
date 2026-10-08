import { useState } from "react";
import { Link } from "react-router";

import Input from "../ui/Input";
import Button from "../ui/Button";
import { statusOptions } from "../../utils/catOptions";

export default function CatForm({
    initialValues,
    onSubmit,
    submitLabel = "Salvar gato",
}) {
    const [nome, setNome] = useState(initialValues?.nome ?? "");
    const [dataNascimento, setDataNascimento] = useState(initialValues?.dataNascimento ?? "");
    const [sexo, setSexo] = useState(initialValues?.sexo ?? "nao_informado");
    const [status, setStatus] = useState(initialValues?.status ?? "disponivel");
    const [personalidade, setPersonalidade] = useState(initialValues?.personalidade.join(", ") ?? "");
    const [descricao, setDescricao] = useState(initialValues?.descricao ?? "");
    const [erro, setErro] = useState("");
    
    const agora = new Date();
    const hoje = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0"),
    ].join("-");

    function handleSubmit(event) {
        event.preventDefault();

        if (!nome.trim()) {
            setErro("Informe o nome do gatinho.")
            return;
        }

        if (dataNascimento && dataNascimento > hoje){
            setErro("A data de nascimento não pode ser maior que a data atual.")
            return;
        }

        const tags = personalidade.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

        onSubmit({
            nome: nome.trim(),
            dataNascimento,
            sexo,
            status,
            personalidade: [... new Set(tags)],
            descricao: descricao.trim(),
            fotoUrl: initialValues?.fotoUrl ?? "",
        });
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <p className="text-sm text-stone-600">
                Foto será adicionada na etapa de upload
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                id="nome"
                label="Nome"
                required
                maxLength={80}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                />

                <Input
                id="nascimento"
                label="Data de nascimento, se souber"
                type="date"
                max={hoje}
                value={dataNascimento}
                onChange={(event) => setDataNascimento(event.target.value)}
                />

                <Input
                id="personalidade"
                label="Personalidade (separe por vírgula)"
                placeholder="Carinhoso, Brincalhão"
                value={personalidade}
                onChange={(event) => setPersonalidade.target.value}
                />

                <div className="flex flex-col gap-2">
                    <label htmlFor="sexo" className="text-sm font-medium">
                        Sexo
                    </label>

                <select
                id="sexo"
                value={sexo}
                onChange={(event) => setSexo(event.target.value)}
                className="min-h-11 rounded-xl border border-lima bg-creme px-3"
                >
                    <option value="nao_informado">Não informado</option>
                    <option value="macho">Macho</option>
                    <option value="femea">Fêmea</option>
                </select>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="descricao" className="text-sm font-medium">
                    História/descrição
                </label>

                <textarea
                id="descricao"
                rows={4}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                className="w-full rounded-xl border border-lima bg-transparent p-3 focus:border-roxo focus-outline-none focus:ring-2 focus:ring-roxo/20"
                />
            </div>
            

            <div className="flex max-w-sm flex-col gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                    Status
                </label>

                <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="min-h-11 rounded-xl border border-lima bg-creme px-3"
                >
                    {statusOptions.map((opcao) => (
                        <option key={opcao.value} value={opcao.value}>
                            {opcao.label}
                        </option>
                    ))}
                </select>
            </div>

            {erro && (
                <p role="alert" className="text-sm text-red-70000">
                {erro}
                </p>
            )}

            <div className="flex flex-wrap gap-3 pt-3">
                <Link to="/gatinhos"
                className="rounded-xl border border-lima px-6 py-3">
                    Cancelar
                </Link>

                <Button type="submit">
                    {submitLabel}
                </Button>
            </div>
        </form>
    )
}