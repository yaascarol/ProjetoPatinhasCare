import { useEffect, useRef, useState } from "react";
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
    const [salvando, setSalvando] = useState(false);
    const [foto, setFoto] = useState(null);
    const [previewFoto, setPreviewFoto] = useState("");
    const [removerFoto, setRemoverFoto] = useState(false);

    const inputFotoRef = useRef(null);

    useEffect(() => {
        if (!previewFoto) return;

        return () => {
            URL.revokeObjectURL(previewFoto);
        };
    }, [previewFoto]);

    const fotoExibida = foto
        ? previewFoto
        : removerFoto
            ? ""
            : initialValues?.fotoUrl ?? "";

    function selecionarFoto(event) {
        const arquivo = event.target.files?.[0];

        if (!arquivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!tiposPermitidos.includes(arquivo.type)) {
            setErro("Escolha uma foto JPG, PNG ou WebP.");
            event.target.value = "";
            return;
        }

        if (arquivo.size > 5 * 1024 * 1024) {
            setErro("A foto deve ter até 5 MB.");
            event.target.value = "";
            return;
        }

        const endereco = URL.createObjectURL(arquivo);

        setErro("");
        setPreviewFoto(endereco);
        setFoto(arquivo);
        setRemoverFoto(false);
    }

    function retirarFoto() {
        setFoto(null);
        setPreviewFoto("");
        setRemoverFoto(true);

        if (inputFotoRef.current) {
            inputFotoRef.current.value = "";
        }
    }

    const agora = new Date();
    const hoje = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0"),
    ].join("-");

    async function handleSubmit(event) {
        event.preventDefault();

        if (salvando) return;

        setErro("");

        if (!nome.trim()) {
            setErro("Informe o nome do gatinho.");
            return;
        }

        if (dataNascimento && dataNascimento > hoje) {
            setErro("A data de nascimento não pode estar no futuro.");
            return;
        }

        const tags = personalidade
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

        setSalvando(true);

        try {
            await onSubmit({
                nome: nome.trim(),
                dataNascimento,
                sexo,
                status,
                personalidade: [...new Set(tags)],
                descricao: descricao.trim(),
                foto,
                removerFoto,
            });
        } catch (falha) {
            setErro(
                falha.status === 401
                    ? "Sua sessão expirou. Faça login novamente antes de salvar."
                    : falha instanceof TypeError
                        ? "Não foi possível conectar à API. Confira o backend."
                        : falha.message
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <fieldset disabled={salvando} className="space-y-5">

                <div className="space-y-3">
                    <label
                        htmlFor="foto"
                        className="block text-sm font-medium"
                    >
                        Foto do gatinho
                    </label>

                    {fotoExibida ? (
                        <img
                            src={fotoExibida}
                            alt={`Prévia da foto de ${nome || "gatinho"}`}
                            className="h-40 w-40 rounded-2xl border border-lima object-cover"
                        />
                    ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-lima bg-roxo/10 text-stone-600">
                            Sem foto
                        </div>
                    )}

                    <input
                        ref={inputFotoRef}
                        id="foto"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={selecionarFoto}
                        aria-describedby="foto-ajuda"
                        className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-roxo file:px-4 file:py-2 file:text-white"
                    />

                    <p id="foto-ajuda" className="text-sm text-stone-600">
                        JPG, PNG ou WebP, até 5 MB. A foto será enviada ao salvar.
                    </p>

                    {(foto || (!removerFoto && initialValues?.fotoUrl)) && (
                        <button
                            type="button"
                            onClick={retirarFoto}
                            className="text-sm text-red-700 underline"
                        >
                            Remover foto
                        </button>
                    )}

                    {removerFoto && initialValues?.fotoUrl && (
                        <p className="text-sm text-stone-600">
                            A foto atual será removida quando você salvar.
                        </p>
                    )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                        id="nome"
                        label="Nome"
                        required
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
                        onChange={(event) => setPersonalidade(event.target.value)}
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
                        className="w-full rounded-xl border border-lima bg-transparent p-3 focus:border-roxo focus:outline-none focus:ring-2 focus:ring-roxo/20"
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
                    <p role="alert" className="text-sm text-red-700">
                        {erro}
                    </p>
                )}

                <div className="flex flex-wrap gap-3 pt-3">
                    {!salvando && (
                        <Link
                            to="/gatinhos"
                            className="rounded-xl border border-lima px-6 py-3"
                        >
                            Cancelar
                        </Link>
                    )}

                    <Button type="submit" disabled={salvando}>
                        {salvando ? "Salvando..." : submitLabel}
                    </Button>
                </div>
            </fieldset>
        </form>
    )
}
