# Publicação de teste: Render + Neon + Brevo

O código está preparado, mas criar estes arquivos não publica o site. Não foram criadas contas nem enviados e-mails automaticamente.

## 1. Criar as contas gratuitas

- [Neon](https://neon.com): crie um projeto de teste e copie a connection string em Connect, incluindo os parâmetros SSL. Esse banco começa vazio; não contém os cadastros locais.
- [Brevo](https://www.brevo.com): crie a conta, conclua a ativação do envio transacional, cadastre e verifique o remetente que controla. Em SMTP & API, gere uma **API key**, não uma chave SMTP. A aprovação da conta e do remetente depende da Brevo.
- [Render](https://dashboard.render.com): conecte sua conta GitHub e autorize o repositório.

Brevo oferece atualmente até 300 envios/dia no plano gratuito. Um remetente Gmail pode ter o endereço reescrito pela Brevo para cumprir regras de entrega; confirme os avisos do painel. Para uso definitivo, prefira domínio autenticado. A entrega precisa ser testada, inclusive spam. Fontes: [limites](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan), [regras de remetentes](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders).

## 2. Preparar somente o banco de teste

Crie `backend/.env.neon` (ignorado pelo Git):

```dotenv
DATABASE_URL="cole-a-string-do-Neon-com-os-parametros-SSL"
ADMIN_NAME="Responsável de teste"
ADMIN_EMAIL="email-do-login"
ADMIN_PASSWORD="senha-inicial-com-pelo-menos-12-caracteres"
```

Dentro de `backend`, execute:

```powershell
git check-ignore .env.neon
node --env-file=.env.neon scripts/setup-db.js
node --env-file=.env.neon scripts/seed-admin.js
```

Confirme a origem da connection string antes de executar: estes comandos criam a estrutura e a responsável no banco indicado. A senha inicial tem limite de 72 bytes. O seed não muda a senha de um e-mail já existente. Não execute `db:setup` supondo que ele usa o Neon sem configurar `DATABASE_URL`; sem ela, a conexão continua local. O setup aplica os sete SQLs atuais em ordem e pode ser repetido; não substitui um sistema completo de migrações futuras.

Se quiser levar os cadastros reais existentes, pare aqui e planeje backup/restauração em vez de criar dados de teste. As fotos e anexos estão no PostgreSQL e consomem a cota do banco.

## 3. Conferir e enviar os arquivos

Na raiz do repositório:

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix backend run test:email
git status
git diff
```

Faça commit dos arquivos desta implementação (incluindo `render.yaml` e este guia) e envie à branch que será publicada. Não adicione `.env`, `.env.neon`, credenciais ou backups. Nenhum commit ou push é feito automaticamente por este guia.

## 4. Publicar pelo Blueprint

No Render, escolha **New > Blueprint**, conecte o repositório e selecione a branch enviada. Ele lerá `render.yaml` da raiz. Revise se o serviço está no plano **Free** e preencha:

| Variável | Conteúdo |
| --- | --- |
| DATABASE_URL | String do banco Neon com SSL |
| BREVO_API_KEY | Chave API da Brevo |
| EMAIL_FROM | E-mail remetente verificado na Brevo |

O Blueprint configura o restante, gera `SESSION_SECRET`, instala dependências, verifica lint, compila o frontend e inicia a API. Não defina Root Directory como backend: o serviço precisa das duas pastas. Não precisa inserir senha de Gmail no Render.

O endereço público é obtido automaticamente de `RENDER_EXTERNAL_URL`. Se usar domínio próprio, configure `FRONTEND_ORIGIN` com a origem HTTPS exata, sem barra final. Localmente, mantenha `FRONTEND_ORIGIN=http://localhost:5173`.

O banco deve estar preparado antes da primeira utilização. O deploy não executa SQLs nem cria o administrador automaticamente.

## 5. Verificar o serviço

- Abra `/api/health`: deve responder `{"status":"ok"}`. Isso verifica a conexão, não todas as tabelas.
- Abra `/login` diretamente, entre com a conta de teste e atualize `/gatinhos` com F5.
- Cadastre, edite, substitua e remova uma foto; confira persistência após atualizar.
- Solicite recuperação para seu e-mail cadastrado e abra o link HTTPS recebido.
- Redefina a senha, faça login e teste sair. Nunca compartilhe tokens.
- Confira convites de Equipe, que usam o mesmo provedor de email.

O Render gratuito suspende o processo após inatividade e bloqueia SMTP. A integração Brevo usa HTTPS; o primeiro acesso após repouso pode demorar. Não guarde uploads na pasta local do Render. [Limitações](https://render.com/docs/free).

Para verificar credenciais sem enviar email, crie opcionalmente `backend/.env.deploy` (ignorado pelo Git) com:

```dotenv
NODE_ENV=production
FRONTEND_ORIGIN=https://endereco-real.onrender.com
EMAIL_PROVIDER=brevo
BREVO_API_KEY=chave-da-api
EMAIL_FROM=remetente-verificado
RECUPERACAO_LOCAL=false
```

Dentro de backend: `node --env-file=.env.deploy scripts/verify-email.js`. A verificação consulta a API e o remetente; não comprova entrega nem aprovação definitiva do envio transacional.

## Desenvolvimento local e futuras atualizações

O `.env` local não foi alterado: sem EMAIL_PROVIDER, o Gmail continua sendo usado. No desenvolvimento, rode frontend e backend em terminais separados. Em produção o Express entrega ambos. Não use `npm run preview` para validar a integração publicada: teste no serviço Express.

Após novos commits enviados à branch vinculada, confira o deploy automático do Render. Novas alterações SQL ainda precisam ser aplicadas explicitamente. Os arquivos `db.js`, `server.js`, `api.js` e o serviço de email agora estão preparados para publicação; instruções antigas do README que descrevem apenas localhost devem ser lidas junto deste guia.

Não considere a publicação finalizada antes de testar login, banco e entrega real de recuperação no domínio público. Limites gratuitos podem mudar; acompanhe o uso nos painéis.
