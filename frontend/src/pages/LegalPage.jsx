import { useEffect } from "react";
import { Link } from "react-router";
import LegalLinks from "../components/LegalLinks";

const contato = "miyashiroluana@gmail.com";
const termos = [
  ["Sobre o projeto", "O PatinhasCare é um protótipo acadêmico, sem finalidade de venda, desenvolvido pela equipe PatinhasCare para demonstrar a organização de informações de abrigos e ONGs de animais. O acesso é destinado à equipe do projeto e a participantes convidados para avaliação e testes."],
  ["Participação do abrigo", "O abrigo participa como referência e autorizou o uso de imagens e informações como modelo, conforme o combinado com a equipe. Essa participação não significa que o abrigo desenvolva, opere ou seja responsável por este protótipo. O uso dos materiais deve respeitar os limites da autorização recebida; a participação no projeto não autoriza sua reprodução ou publicação irrestrita."],
  ["Regras de acesso e uso", "Use apenas sua própria conta e mantenha sua senha e os links de recuperação em sigilo. Cadastre somente informações necessárias ao teste, preferencialmente fictícias. Não insira documentos, contatos ou outros dados pessoais de adotantes, voluntários e terceiros sem avaliação prévia da equipe e autorização adequada quando necessária. Não tente acessar contas alheias, explorar falhas ou divulgar conteúdo do sistema sem autorização."],
  ["Cadastros, fotos e exclusões", "Quem insere informações deve conferir sua adequação e ter autorização para utilizar os materiais. O sistema permite editar e excluir cadastros de gatinhos; a exclusão confirmada remove o cadastro e sua foto do banco usado pela aplicação. Não utilize essa função em registros que precisem ser preservados. Comunique à equipe materiais incorretos ou publicados fora dos limites da autorização."],
  ["Limites do protótipo", "Funcionalidades podem estar incompletas, mudar ou apresentar falhas durante os testes. O PatinhasCare não deve ser o único registro das atividades reais de um abrigo, nem substituir avaliação veterinária, prontuários ou procedimentos profissionais. As informações de demonstração não devem orientar decisões reais sobre a saúde ou a adoção dos animais."],
  ["Interrupção do acesso e atualizações", "A equipe pode interromper os testes, realizar manutenção ou restringir acessos para investigar uso indevido e proteger o projeto. Solicitações e dúvidas podem ser encaminhadas ao contato abaixo. Mudanças nestes documentos serão identificadas pela versão e pela data; alterações relevantes devem ser comunicadas aos participantes antes da continuidade dos testes."],
];
const privacidade = [
  ["Quem organiza os testes", "A equipe acadêmica PatinhasCare organiza este protótipo e atende questões sobre seu uso e seus dados pelo contato informado nesta página. O abrigo é referência do trabalho e não é apresentado como responsável pelo tratamento de dados do protótipo. Esta versão descreve o ambiente de desenvolvimento e testes; uma futura disponibilização ao público exige revisão das condições aqui descritas."],
  ["Dados utilizados e suas finalidades", "Para permitir o acesso, o banco registra nome, e-mail, papel de acesso, situação da conta, data de criação e uma representação protegida da senha (hash). O sistema utiliza informações de sessão para manter o login e verificar o acesso. Na recuperação de senha, utiliza o e-mail e um token temporário, cujo hash é armazenado no banco. Também processa o endereço IP temporariamente para limitar tentativas de autenticação e recuperação. Esses dados servem à autenticação, à proteção do acesso e à operação dos testes."],
  ["Informações dos gatinhos", "O protótipo permite registrar nome, foto, características, datas e descrição dos animais. Informações sobre animais não são, por si só, dados pessoais de pessoas naturais; fotos e textos podem, contudo, identificar pessoas. Prefira dados fictícios e materiais autorizados. Caso identifique dados de terceiros inseridos indevidamente, contate a equipe para revisão e remoção quando cabível."],
  ["Sessão e cookies", "O cookie patinhas.sid mantém a sessão de acesso e é configurado com duração de até oito horas. O logout encerra a sessão e remove esse cookie do navegador. O cookie é necessário à autenticação; recusá-lo no navegador pode impedir o acesso. O fluxo de autenticação implementado não utiliza cookies de publicidade. O fornecimento desta política não representa consentimento genérico para novas finalidades."],
  ["Armazenamento e acesso", "No ambiente local, os dados ficam no PostgreSQL configurado pela equipe. Pessoas com acesso administrativo ao ambiente e participantes autenticados podem acessar informações conforme as funções disponíveis. Senhas são armazenadas como hash, e os links de recuperação são de uso único com validade de 15 minutos. Esses controles não constituem garantia de segurança absoluta. Não envie senhas por e-mail ao contato do projeto."],
  ["Envio de e-mail e outros serviços", "Quando o envio pelo Gmail está habilitado, o Google processa o endereço do destinatário e a mensagem contendo o link de recuperação para realizar a entrega, de acordo com suas condições e política de privacidade. Isso pode envolver infraestrutura fora do Brasil. No modo de teste local, o link é exibido no terminal do backend, acessível a quem opera esse ambiente. Antes de hospedar a aplicação para terceiros, a equipe deverá informar os provedores envolvidos e revisar as condições de compartilhamento e eventuais transferências internacionais."],
  ["Tempo de armazenamento", "A validade de um link não significa que todos os seus registros sejam apagados automaticamente. Tokens são invalidados por expiração, substituídos em uma nova solicitação e removidos após uso bem-sucedido. Contas e cadastros permanecem no banco até uma ação de exclusão; ainda não existe uma rotina geral de descarte automático ao fim do semestre. O prazo de encerramento dos testes e o procedimento de exclusão ou anonimização, incluindo eventuais cópias e mensagens de e-mail, devem ser definidos pela equipe antes de ampliar a participação."],
  ["Solicitações sobre seus dados", "Entre em contato para solicitar informações sobre o uso dos seus dados, acesso, correção ou exclusão quando aplicável, ou para comunicar um problema. A equipe poderá pedir apenas as informações necessárias para confirmar sua identidade e analisar o pedido. Caso exista uma razão legítima para preservar algum dado, ela deverá ser explicada. Não há cobrança para encaminhar uma solicitação."],
  ["Escopo acadêmico e revisão", "Este documento é uma versão acadêmica para testes e não certifica adequação jurídica. A finalidade acadêmica não autoriza qualquer uso de dados pessoais. Antes de convidar participantes com dados reais, a equipe deverá definir e documentar as bases legais aplicáveis a cada finalidade, a identificação dos responsáveis e os critérios de retenção, com orientação da instituição. Novas finalidades ou integrações exigem atualização desta política e, quando cabível, autorização específica."],
];

export default function LegalPage({ tipo }) {
  const politica = tipo === "privacidade";
  const titulo = politica ? "Política de Privacidade" : "Termos de Uso";
  useEffect(() => {
    const anterior = document.title;
    document.title = `${titulo} | PatinhasCare`;
    window.scrollTo(0, 0);
    return () => { document.title = anterior; };
  }, [titulo]);
  return (
    <main className="min-h-screen bg-creme px-4 py-8 text-texto sm:py-12">
      <article className="mx-auto max-w-3xl rounded-3xl border border-lima p-6 sm:p-10">
        <Link to="/login" className="inline-block rounded focus-visible:outline-2 focus-visible:outline-roxo">
          <img src="/imagens/icones-patinhascare/LOGO PatinhasCare.png" alt="PatinhasCare — ir ao login" className="h-auto w-50" />
        </Link>
        <p className="mt-7 text-sm font-semibold text-stone-600">Versão acadêmica para testes</p>
        <h1 className="mt-2 text-3xl font-semibold">{titulo}</h1>
        <p className="mt-3 text-sm text-stone-600">Versão 1.0 · Atualizado em <time dateTime="2026-11-09">9 de novembro de 2026</time></p>
        <div className="mt-8 space-y-7">
          {(politica ? privacidade : termos).map(([subtitulo, texto], indice) => (
            <section key={subtitulo} aria-labelledby={`secao-${indice}`}>
              <h2 id={`secao-${indice}`} className="text-lg font-semibold">{indice + 1}. {subtitulo}</h2>
              <p className="mt-2 leading-relaxed text-stone-700">{texto}</p>
            </section>
          ))}
          <section aria-labelledby="contato">
            <h2 id="contato" className="text-lg font-semibold">Contato da equipe PatinhasCare</h2>
            <a href={`mailto:${contato}`} className="mt-2 inline-block break-all rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-roxo">{contato}</a>
          </section>
          {politica && <p className="text-sm text-stone-600">Referências: <a className="underline" href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm">LGPD</a> e <a className="underline" href="https://policies.google.com/privacy?hl=pt-BR">Política de Privacidade do Google</a>.</p>}
        </div>
        <LegalLinks />
        <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm">
          <Link to="/login" className="rounded underline focus-visible:outline-2 focus-visible:outline-roxo">Voltar ao login</Link>
          <Link to="/" className="rounded underline focus-visible:outline-2 focus-visible:outline-roxo">Acessar o sistema</Link>
        </div>
      </article>
    </main>
  );
}
