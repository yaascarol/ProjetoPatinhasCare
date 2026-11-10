# Recuperação pelo Gmail

No Google, ative a verificação em duas etapas e gere uma senha de app chamada PatinhasCare:
https://myaccount.google.com/apppasswords

No backend/.env, configure (sem duplicar variáveis existentes):

RECUPERACAO_LOCAL=false
SMTP_USER=seuemail@gmail.com
SMTP_PASSWORD="senha de app gerada pelo Google"

SMTP_USER é a conta remetente. O destinatário é o e-mail cadastrado no PatinhasCare.
Nunca use a senha normal do Gmail, envie a senha de app no chat ou versione o .env.
Se o Google não disponibilizar senhas de app, consulte as restrições da conta na documentação oficial.

No terminal do backend:

npm run email:verify

Esse comando verifica conexão e autenticação; não envia mensagem e não garante entrega na caixa de entrada.
Depois reinicie npm run dev e solicite recuperação na tela de login.
Confira a caixa de entrada e spam do e-mail cadastrado no sistema.
O backend registra apenas a aceitação pelo Gmail ou falha de envio, sem expor o link.
Uma falha mantém resposta genérica no site para não revelar contas cadastradas.

O link vale por 15 minutos, é de uso único e um novo pedido invalida o anterior.
Com FRONTEND_ORIGIN=http://localhost:5173, abra o link neste mesmo computador, com frontend e backend ligados.
Para outras pessoas usarem, será necessário publicar o sistema e configurar sua origem HTTPS, cookies e demais opções de produção.
Para voltar ao teste pelo terminal, configure RECUPERACAO_LOCAL=true (somente desenvolvimento local).

Referências: https://support.google.com/accounts/answer/185833 e https://nodemailer.com/smtp
