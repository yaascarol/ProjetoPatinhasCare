import { useState } from "react";

const equipeInicial = [
  {
    id: "pessoa-001",
    nome: "Isabel",
    email: "isabel@example.com",
    papel: "responsavel",
    ativo: true,
  },
  {
    id: "pessoa-002",
    nome: "Isabelle",
    email: "isabelle@example.com",
    papel: "voluntario",
    ativo: true,
  },
  {
    id: "pessoa-003",
    nome: "Laís",
    email: "lais@example.com",
    papel: "voluntario",
    ativo: true,
  },
];

export default function TeamPage() {
  const [equipe, setEquipe] = useState(equipeInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [novoPapel, setNovoPapel] = useState("voluntario");
  const [mensagem, setMensagem] = useState("");

  const pessoaEmEdicao = equipe.find(
    (pessoa) => pessoa.id === editandoId
  );

  function ultimoResponsavel(pessoa) {
    const responsaveisAtivos = equipe.filter(
      (item) => item.ativo && item.papel === "responsavel"
    );

    return (
      pessoa.ativo &&
      pessoa.papel === "responsavel" &&
      responsaveisAtivos.length === 1
    );
  }

  function iniciarEdicao(pessoa) {
    setEditandoId(pessoa.id);
    setNovoPapel(pessoa.papel);
    setMensagem("");
  }

  function salvarPapel(event) {
    event.preventDefault();

    if (!pessoaEmEdicao) return;

    if (
      ultimoResponsavel(pessoaEmEdicao) &&
      novoPapel !== "responsavel"
    ) {
      setMensagem("Mantenha pelo menos um responsável ativo.");
      return;
    }

    setEquipe((atuais) =>
      atuais.map((pessoa) =>
        pessoa.id === editandoId
          ? { ...pessoa, papel: novoPapel }
          : pessoa
      )
    );

    setEditandoId(null);
    setMensagem("Papel atualizado na demonstração.");
  }

  function alternarAcesso(pessoa) {
    if (ultimoResponsavel(pessoa)) {
      setMensagem("Não é possível desativar o último responsável ativo.");
      return;
    }

    const acao = pessoa.ativo ? "Desativar" : "Reativar";

    if (!window.confirm(`${acao} ${pessoa.nome} na demonstração?`)) {
      return;
    }

    setEquipe((atuais) =>
      atuais.map((item) =>
        item.id === pessoa.id
          ? { ...item, ativo: !item.ativo }
          : item
      )
    );

    setMensagem(
      `${acao === "Desativar" ? "Desativação" : "Reativação"} simulada. Nenhum acesso real foi alterado.`
    );
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Equipe</h1>

        <p className="mt-2 text-stone-600">
          Administração dos integrantes do abrigo.
        </p>

        <p className="mt-2 text-sm text-stone-600">
          Demonstração: a restrição ao responsável e as ações de acesso
          dependem da autenticação. As alterações locais são reiniciadas
          ao sair desta página.
        </p>
      </header>

      <p role="status" className="text-sm text-stone-700">
        {mensagem}
      </p>

      {pessoaEmEdicao && (
        <form
          onSubmit={salvarPapel}
          className="space-y-4 rounded-2xl border border-lima p-5"
        >
          <h2 className="text-lg font-semibold">
            Editar papel de {pessoaEmEdicao.nome}
          </h2>

          <label htmlFor="papel" className="block">
            Papel
          </label>

          <select
            id="papel"
            value={novoPapel}
            onChange={(event) => setNovoPapel(event.target.value)}
            className="min-h-11 rounded-xl border border-lima bg-creme px-3"
          >
            <option value="responsavel">Responsável</option>
            <option value="voluntario">Voluntário</option>
          </select>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditandoId(null)}
              className="rounded-xl border border-lima px-4 py-2"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-roxo px-4 py-2 text-white"
            >
              Salvar papel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-lima p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Integrantes da equipe — dados fictícios
            </caption>

            <thead>
              <tr className="border-b border-lima">
                <th scope="col" className="p-3">Nome</th>
                <th scope="col" className="p-3">E-mail</th>
                <th scope="col" className="p-3">Papel</th>
                <th scope="col" className="p-3">Situação</th>
                <th scope="col" className="p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {equipe.map((pessoa) => (
                <tr
                  key={pessoa.id}
                  className="border-b border-lima/50 align-top hover:bg-lilas/20"
                >
                  <td className="p-3">{pessoa.nome}</td>
                  <td className="p-3">{pessoa.email}</td>
                  <td className="p-3">
                    {pessoa.papel === "responsavel"
                      ? "Responsável"
                      : "Voluntário"}
                  </td>
                  <td className="p-3">
                    {pessoa.ativo ? "Ativo" : "Desativado"}
                  </td>

                  <td className="p-3">
                    <details>
                      <summary
                        className="cursor-pointer rounded-lg bg-lilas px-3 py-2"
                        aria-label={`Ações de ${pessoa.nome}`}
                      >
                        Ações
                      </summary>

                      <div className="mt-2 flex min-w-40 flex-col gap-2 rounded-xl bg-lilas/30 p-3">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(pessoa)}
                          className="text-left underline"
                        >
                          Editar papel
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMensagem(
                              "Redefinição de senha ainda não conectada. Nenhum e-mail foi enviado."
                            )
                          }
                          className="text-left underline"
                        >
                          Redefinir senha
                        </button>

                        <button
                          type="button"
                          onClick={() => alternarAcesso(pessoa)}
                          className="text-left text-red-700 underline"
                        >
                          {pessoa.ativo
                            ? "Desativar acesso"
                            : "Reativar acesso"}
                        </button>
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}