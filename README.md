# PatinhasCare

Sistema de gestão para o projeto independente Entre Lares, que resgata gatos e oferece lar temporário até a adoção.

[Protótipo no Figma](https://www.figma.com/site/oU0AbwP6LuoGaypKpuvnRa/SistemaPatinhasCare--Copy-?node-id=0-1&t=GMxHgQxilP3klnN5-1)

## Estado do projeto e repasse

- Login e logout com sessão no backend e responsável cadastrada por script.
- Gatinhos: consulta, cadastro, edição, filtros e upload, substituição e remoção de foto implementados. Validar os fluxos abaixo no ambiente de quem assumir.
- Home: contadores dos gatos, informações pendentes e cinco últimos cadastros ligados aos dados da API. A ordem é da criação mais recente para a mais antiga; editar não muda a data de criação.
- Saúde, Alertas, Mural, Equipe e recuperação de senha ficam para a próxima etapa de integração. Os alertas da Home também dependem de Saúde. A existência de uma tela não significa que sua integração com o banco esteja concluída.
- Publicação e configurações de produção ainda precisam ser revisadas. Este guia descreve o desenvolvimento local.

O frontend usa JavaScript, React, Vite e Tailwind. O backend atual usa **JavaScript com Node.js e Express**, com PostgreSQL. Não há compilação TypeScript no backend atual.

```text
frontend/             interface e serviços que chamam a API
backend/src/          servidor, rotas, validações e upload
backend/scripts/      preparação das tabelas e cadastro inicial
backend/sql/          alterações de estrutura do banco
```

## 1. Pré-requisitos

Instale Git, Node.js com npm e PostgreSQL. Use Node.js 24.x para acompanhar o ambiente em que o projeto foi verificado. Links: [Node.js](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads) e [PostgreSQL para Windows](https://www.postgresql.org/download/windows/).

O instalador de PostgreSQL indicado na página oficial para Windows inclui o servidor e o pgAdmin. Anote a senha definida para o usuário do banco e confira a porta (normalmente `5432`). O serviço PostgreSQL precisa estar funcionando; abrir apenas o pgAdmin não inicia a aplicação.

Confira no terminal:

```powershell
git --version
node --version
npm --version
```

Os comandos abaixo podem ser executados no PowerShell ou no terminal do VS Code. Respeite a pasta indicada: **frontend e backend têm instalações e comandos separados**.

## 2. Clonar e instalar as dependências

No terminal, entre na pasta em que deseja guardar o projeto e execute:

```powershell
git clone https://github.com/yaascarol/ProjetoPatinhasCare.git
cd ProjetoPatinhasCare
cd backend
npm ci
cd ../frontend
npm ci
cd ..
```

`git clone` baixa o repositório na primeira vez. Se ele for privado, é necessário ter acesso no GitHub e autenticar o Git. Quem já tem a pasta deve usar `git pull`, conforme a seção de atualização, em vez de clonar novamente.

`npm ci` instala as versões registradas no `package-lock.json`. Execute nos dois diretórios. Para acrescentar uma biblioteca deliberadamente, use `npm install nome-da-biblioteca` na pasta correspondente e versione também o lockfile alterado.

Clonar o código **não copia o banco, seus dados nem o arquivo `.env`**. Cada pessoa precisa preparar seu ambiente local.

## 3. Criar o banco e conectar uma ferramenta

### PostgreSQL, pgAdmin e Beekeeper: o que cada um faz

- **PostgreSQL** é o servidor que armazena os dados e executa SQL.
- **pgAdmin** é uma interface para administrar esse servidor, criar bancos e consultar tabelas.
- **Beekeeper Studio** é outra interface que pode ser usada para consultar e editar os mesmos dados e executar os arquivos SQL. Não substitui a instalação do PostgreSQL.

Não é necessário manter pgAdmin e Beekeeper abertos enquanto o sistema roda. Eles são ferramentas de trabalho; quem precisa continuar ativo é o servidor PostgreSQL.

### Criar pelo pgAdmin

1. Conecte-se ao servidor PostgreSQL local com o usuário e a senha da instalação.
2. Em `Databases`, escolha criar um banco chamado `patinhascare`.
3. Use como proprietário o usuário que o backend utilizará. No desenvolvimento local, o exemplo deste guia usa `postgres`.
4. Abra o Query Tool do banco `patinhascare` para executar os SQLs das próximas etapas.

Alternativamente, conectado ao banco inicial `postgres`, execute a instrução abaixo isoladamente, com autocommit habilitado, e depois reconecte ao banco criado:

```sql
CREATE DATABASE patinhascare;
```

### Usar o Beekeeper Studio

Crie uma conexão do tipo PostgreSQL e preencha:

| Campo | Exemplo local / variável equivalente |
| --- | --- |
| Host | `localhost` / `PGHOST` |
| Port | `5432` / `PGPORT` |
| User | `postgres` / `PGUSER` |
| Password | senha do PostgreSQL / `PGPASSWORD` |
| Database | `patinhascare` / `PGDATABASE` |

Use as mesmas informações que estarão no `.env` do backend. Na instalação local padrão sem SSL configurado, não exija SSL na conexão. Configurações de um banco remoto devem seguir seu provedor.

Depois de conectar, abra uma consulta SQL para executar a migração das fotos ou verificar os cadastros. Atualize a lista de tabelas após criar ou alterar a estrutura. Consulte o [guia oficial de conexões do Beekeeper](https://docs.beekeeperstudio.io/user_guide/connecting/connecting/).

## 4. Configurar o backend

Crie manualmente o arquivo `backend/.env`. Ele é ignorado pelo Git. O projeto ainda não inclui um `.env.example`; use este modelo e substitua todos os valores indicados:

```dotenv
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
SESSION_SECRET=SUBSTITUA_PELO_SEGREDO_GERADO

PGHOST=localhost
PGPORT=5432
PGDATABASE=patinhascare
PGUSER=postgres
PGPASSWORD="SUBSTITUA_PELA_SENHA_DO_POSTGRES"

ADMIN_NAME="Responsável de desenvolvimento"
ADMIN_EMAIL=responsavel@example.com
ADMIN_PASSWORD="SUBSTITUA_POR_UMA_SENHA_LOCAL_FORTE"
```

Para gerar o segredo de sessão, execute e copie a saída para `SESSION_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`SESSION_SECRET` assina a sessão; não é a senha de login. `PGPASSWORD` é a senha do banco. `ADMIN_PASSWORD` é a senha inicial da pessoa que entrará no site. O script exige pelo menos 12 caracteres e no máximo 72 bytes para essa senha.

Não envie o `.env` nem credenciais em commits. O backend lê o arquivo ao iniciar, então reinicie-o quando mudar as variáveis.

## 5. Preparar as tabelas e o acesso inicial

Com o banco já criado, partindo da raiz do repositório:

```powershell
cd backend
npm run db:init
npm run db:cats
```

- `db:init` executa `sql/001-usuarios.sql` e prepara usuários.
- `db:cats` executa `sql/002-gatos.sql` e prepara gatos.
- Esses comandos criam tabelas dentro do banco; não criam o banco `patinhascare`.

**Ainda falta a migração das fotos:** abra `backend/sql/003-fotos-gatos.sql` no Query Tool do pgAdmin ou em uma consulta do Beekeeper, conectado ao banco `patinhascare`, e execute todo o conteúdo:

```sql
ALTER TABLE gatos
ADD COLUMN IF NOT EXISTS foto_dados BYTEA;

ALTER TABLE gatos
ALTER COLUMN nome TYPE TEXT;
```

Não existe um script npm para essa terceira migração atualmente. Executar somente `db:cats` não a aplica. Como alternativa ao editor gráfico, se `psql` estiver no PATH, execute **dentro de backend**, ajustando conexão e usuário se necessário:

```powershell
psql -h localhost -p 5432 -U postgres -d patinhascare -W -v ON_ERROR_STOP=1 -f sql/003-fotos-gatos.sql
```

Depois, ainda no terminal do backend:

```powershell
npm run seed:admin
```

Esse comando cria a responsável usando as variáveis `ADMIN_*`. Se o e-mail já existir, ele não altera sua senha. Após criar o acesso, as variáveis `ADMIN_*` podem ser retiradas do `.env` se não for executar novamente o seed. Guarde o acesso em local seguro.

A senha é armazenada como hash: pgAdmin e Beekeeper permitem consultar o e-mail, mas não recuperar a senha original. A recuperação de senha ainda será implementada.

O armazenamento de sessões cria sua tabela automaticamente quando necessário, conforme a configuração atual. O usuário da conexão precisa ter permissão para criar e acessar essas tabelas.

Para conferir os cadastros sem exibir senhas ou bytes de imagens:

```sql
SELECT id, nome, email, papel, ativo FROM usuarios;

SELECT id, nome, status, criado_em,
       foto_dados IS NOT NULL AS tem_foto
FROM gatos
ORDER BY criado_em DESC;
```

## 6. Rodar o sistema: dois terminais

Mantenha o PostgreSQL ativo. Abra **dois terminais**, ambos inicialmente na raiz do repositório.

**Terminal 1 — backend:**

```powershell
cd backend
npm run dev
```

A API fica em `http://localhost:4000`. O comando usa `node --watch`, reiniciando o servidor quando seus arquivos mudam.

**Terminal 2 — frontend:**

```powershell
cd frontend
npm run dev -- --port 5173 --strictPort
```

Abra `http://localhost:5173/login` no navegador e use o acesso criado pelo seed.

`--strictPort` faz o Vite avisar se a porta estiver ocupada, em vez de escolher outra silenciosamente. Isso mantém o endereço igual a `FRONTEND_ORIGIN`. Use `localhost` nos dois lados; não misture com `127.0.0.1` no navegador.

O frontend aponta atualmente para `http://localhost:4000/api` em `frontend/src/services/api.js`. Se mudar a porta do backend, ajuste esse endereço. Se mudar a porta do frontend, ajuste `FRONTEND_ORIGIN` e reinicie o backend. Essa variável é usada tanto no CORS quanto na verificação de origem das requisições que alteram dados.

Para parar cada processo, pressione `Ctrl+C` no seu terminal. Rodar só o frontend não permite usar os dados reais; rodar só o backend não abre a interface.

## 7. Verificação: lint, build e teste manual

No diretório **frontend**, execute antes de entregar mudanças:

```powershell
npm run lint
npm run build
```

| Comando | Para que serve |
| --- | --- |
| `npm run lint` | Executa ESLint para encontrar problemas de código, como variáveis sem uso e uso inadequado de hooks do React. Não corrige os arquivos automaticamente. |
| `npm run build` | Gera a versão de produção do frontend em `dist` e identifica falhas de empacotamento/importação. Não publica o site. |
| `npm run preview -- --port 5173 --strictPort` | Visualiza localmente o último build. Pare antes o Vite de desenvolvimento para liberar a porta; mantenha o backend ativo. |

Um build pode passar mesmo com erro de lint, pois são verificações diferentes. Nenhum deles comprova sozinho que login, banco ou upload funcionam.

O backend **não tem scripts de lint ou build atualmente**: ele executa JavaScript diretamente. Seu `npm test` é apenas um placeholder que falha; ainda não há suíte automatizada configurada. Não execute os comandos do frontend dentro do backend esperando o mesmo resultado.

Checklist manual de Gatinhos para o repasse:

- Fazer login e logout.
- Cadastrar um gato com foto e outro sem foto.
- Consultar e filtrar a lista.
- Editar somente dados e confirmar que a foto permanece.
- Substituir a foto, salvar e atualizar o navegador.
- Remover a foto, salvar e atualizar o navegador para confirmar persistência.
- Cancelar uma edição e confirmar que nada mudou no banco.
- Conferir a rejeição de arquivo inválido ou maior que 5 MB.
- Conferir os contadores e os últimos cadastros da Home.

Fotos aceitas: JPG, PNG e WebP, até 5 MB na entrada. O backend processa para WebP de até 1200 × 1200, mantendo proporção, e limita a saída a 2 MB. Os bytes ficam em `gatos.foto_dados`; a API entrega a imagem por uma rota autenticada. Isso aumenta o tamanho do banco e dos backups; avaliar armazenamento de objetos se o volume crescer.

## 8. Atualizar o código e trabalhar com Git

Os comandos Git podem ser executados na raiz do repositório. `commit` salva o histórico local; `push` envia os commits para o GitHub; `pull` traz alterações do remoto. Nenhum deles transfere os dados do PostgreSQL.

### Antes de começar uma tarefa

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c minha-tarefa
```

Troque `minha-tarefa` por um nome descritivo. Se `git status` mostrar alterações, salve-as em um commit na branch apropriada antes de trocar de branch ou atualizar. Se `pull --ff-only` recusar a atualização, há históricos divergentes: revise com a equipe em vez de forçar ou apagar trabalho.

### Depois de alterar e testar

Confira o diff e adicione apenas os arquivos da tarefa. Exemplo de uma alteração no README:

```powershell
git status
git diff
git add README.md
git diff --cached
git commit -m "Documenta instalação e execução do projeto"
git push -u origin minha-tarefa
```

Para outra tarefa, substitua `README.md` pelos caminhos alterados e ajuste a mensagem. Em envios seguintes da mesma branch, basta `git push`. Abra um Pull Request no GitHub para revisar e integrar à `main`. Se o fluxo combinado for trabalhar diretamente na `main`, o envio é `git push origin main`.

### Trazer mudanças depois de um merge

Com as alterações locais já salvas:

```powershell
git switch main
git pull --ff-only origin main
```

Se as dependências mudaram, reinstale em cada pasta afetada. Para sincronizar ambas, partindo da raiz:

```powershell
cd backend
npm ci
cd ../frontend
npm ci
cd ..
```

Leia também os novos arquivos em `backend/sql`: mudanças de estrutura precisam ser aplicadas ao banco local na ordem indicada pela tarefa. `git pull` não executa migrações, e `CREATE TABLE IF NOT EXISTS` não atualiza automaticamente uma tabela antiga.

## 9. Problemas comuns

| Sintoma | O que conferir |
| --- | --- |
| `Missing script` | Confira a pasta: scripts de frontend e backend são diferentes. |
| Erro de conexão com o banco | Serviço PostgreSQL ativo e variáveis `PG*` corretas no `.env` do backend. |
| Tabela de gatos não encontrada | Execute `npm run db:cats` no backend, depois de criar o banco. |
| Coluna `foto_dados` não encontrada | Execute `003-fotos-gatos.sql` no banco usado pela API. |
| Erro de origem/CORS ou 403 | Endereço do frontend exatamente igual a `FRONTEND_ORIGIN`; reinicie o backend após mudar o `.env`. |
| 401 ao consultar gatos | Faça login; a sessão é necessária inclusive para carregar fotos. |
| Seed não muda uma senha existente | Esse é o comportamento esperado; o script só cria novos e-mails. |
| Remover/substituir foto não funciona | Confira `req.alterarFoto` no middleware e na rota; os nomes devem ser idênticos. |

Mocks e armazenamento local dos módulos pendentes devem ser substituídos gradualmente durante a integração. Não exclua todos os mocks antes de remover ou substituir seus usos. A publicação precisa revisar HTTPS, cookies, origens, conexão ao banco e rotas do frontend; o modo local atual não deve ser tratado como configuração pronta para produção.
