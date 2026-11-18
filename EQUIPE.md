# Administração da Equipe

## Preparação

Na pasta backend, execute `npm run db:team` e reinicie `npm run dev`.
A migração 006 acrescenta senha_definida aos usuários. Contas existentes são preservadas.
São pré-requisitos as migrações anteriores, especialmente 004 (recuperação).

## Uso

Somente responsáveis acessam a página e as rotas /api/equipe.
Responsáveis e voluntários podem consultar, cadastrar e editar Gatinhos e Saúde.
Somente responsáveis podem excluir gatinhos e registros de saúde. Essa regra é validada no backend, além de ocultar os botões para voluntários.

1. Entre como responsável e abra Equipe.
2. Adicione um integrante com nome, e-mail e papel. O e-mail deve ser único.
3. Clique em Enviar acesso e confirme o endereço. O cadastro por si só não envia mensagem.
4. O integrante abre o link em até 15 minutos e define sua senha. O estado passa de Senha pendente para Ativo ao atualizar a lista.
5. Redefinir senha permite enviar um novo link. Reenvios exigem intervalo mínimo de um minuto.

RECUPERACAO_LOCAL=true exibe links no terminal. Com false, utiliza o Gmail configurado.
Com localhost, abra os links no computador onde o sistema roda. Não compartilhe logs com tokens.
Falhas de envio são informadas e não removem o cadastro; é possível reenviar após corrigir a configuração.

Desativar mantém os registros e impede login. Alterar papel ou situação invalida sessões e links antigos; reativar não restaura sessões anteriores.
Excluir integrante remove permanentemente a conta, sessões e links de recuperação, liberando o e-mail para um novo cadastro. Registros de Saúde são preservados, com criado_por vazio. A exclusão exige confirmação e é exclusiva dos responsáveis; o último responsável ativo com senha definida também não pode ser excluído.
O último responsável ativo com senha definida não pode ser desativado nem rebaixado.
Responsáveis com senha pendente não contam como substitutos do último responsável.
Mudanças simultâneas são serializadas no banco para preservar essa regra.

## Verificação

`npm run test:team` executa a validação de entradas.
`npm run test:team:integration` cria um schema temporário isolado no PostgreSQL configurado, inicia uma API de teste em porta livre e remove o schema ao terminar. Exige permissão de criar schema, não usa e-mail real e não altera contas do schema público.
No frontend, execute `npm run lint` e `npm run build`.
