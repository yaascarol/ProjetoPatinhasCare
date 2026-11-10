# Recuperação de senha local

1. Dentro de backend, execute npm run db:password-reset.
2. Acrescente RECUPERACAO_LOCAL=true ao backend/.env.
3. Reinicie o backend com npm run dev. Sessões anteriores precisam fazer login novamente.
4. No login, clique em Esqueci minha senha e informe um e-mail cadastrado e ativo.
5. Copie o link exibido no terminal do backend e abra no navegador.
6. Defina e confirme a senha (12 caracteres ou mais; limite de 72 bytes do bcrypt).
7. Entre com a nova senha. A antiga deixa de funcionar; as sessões anteriores são invalidadas.

O link vale por 15 minutos, é de uso único e um novo pedido invalida o anterior.
O banco armazena apenas o hash do token. A API não revela se um e-mail existe.
O link fica no fragmento da URL para não ser enviado em requisições ao servidor do frontend.
Não compartilhe o link ou logs do terminal. O modo local exige origem localhost/127.0.0.1 e não funciona com NODE_ENV=production.

O envio pelo Gmail está implementado. Consulte EMAIL-GMAIL.md para configurar sua conta e ativar. A publicação ainda exige revisar a configuração de produção.
