# Análise forense de PDF | Caso FD-017

**Cenário.** Um estudante encontrou o ebook *PDFs de fonte desconhecida* em um site de terceiros enquanto procurava material para uma disciplina. Ele baixou o arquivo e, ao abri-lo, viu uma caixa de mensagem inesperada. Fechou o leitor e encaminhou o PDF à equipe de segurança com a seguinte pergunta: «Esse aviso pode ter vindo do próprio arquivo? Preciso comunicar um incidente?»

Você integra a equipe responsável pela triagem do caso FD-017. Use a análise estática do PDF para avaliar se a estrutura do arquivo é compatível com o relato, quais comportamentos dependem do leitor e quais conclusões exigiriam evidências adicionais. O parecer será lido pela equipe de segurança para decidir se o chamado precisa de investigação adicional.

**Arquivo fornecido** `amostra-forense-pdf.pdf`, extraído de `kit-forense-fd017.zip`. O ZIP preserva os bytes da amostra durante a distribuição. Uma cópia avulsa também serve, desde que tenha o mesmo SHA-256.

**Entrega.** Envie o relatório final pelo [Google Classroom](https://classroom.google.com/c/ODgzNDUyNjIyNTg4?cjc=vs6jns73) em um único arquivo PDF, com os comandos executados, as evidências e a conclusão. O PDF enviado não pode conter malware.

A atividade pode ser concluída por análise estática no Alpine Linux 3.24 com GNOME. Preserve o original e trabalhe sobre uma cópia. Após preparar as ferramentas, mantenha a VM de análise sem acesso à rede e faça a inspeção sem clicar nos controles do documento.

## 1. Identificação e preservação

Registre o nome do arquivo, o tamanho em bytes, o tipo identificado, o SHA-256 e as versões das ferramentas utilizadas. Compare o hash do original e o da cópia de trabalho antes da análise. Registre os metadados e indique quais podem ter sido definidos pelo autor.

## 2. Mapeamento da estrutura

Localize o catálogo e percorra a árvore de páginas. Identifique as páginas que contêm anotações. Identifique as ações, o formulário e os arquivos incorporados. Registre o número e a geração dos objetos que sustentam os achados. Quando um dicionário estiver escrito diretamente dentro de outro objeto, indique o objeto que o contém e o caminho até o dicionário. Identifique o evento associado a cada ação e verifique se há uma ação configurada para a abertura do documento.

## 3. Interpretação dos artefatos

Recupere os dois trechos de JavaScript. Transcreva as mensagens, compare os gatilhos e indique os caminhos até os respectivos dicionários de ação. Localize o marcador na árvore de marcadores e identifique a página de destino. Explique como a estrutura distingue essa navegação das ações JavaScript e dos links externos. Registre os destinos dos links como texto, sem visitá-los. Extraia os anexos como dados, calcule o SHA-256 de cada um e explique o que a consulta WQL do anexo de inventário descreve. Aponte se há evidência de que o próprio PDF invoca WMI. Verifique se o formulário contém alguma ação de envio e explique como chegou à resposta.

## 4. Evidências complementares

- Compare o texto visível do link da editora com a URI registrada na anotação. Use os objetos do PDF como evidência.
- Identifique o tipo real de cada anexo pelos bytes extraídos. Compare o resultado com a extensão declarada e registre o SHA-256 de ambos os anexos.
- Decodifique o QR code offline. Compare o conteúdo com os destinos das ações URI e diga se a própria imagem tem uma anotação clicável.
- Percorra a cadeia de referências cruzadas a partir da última seção, seguindo `/Prev`. No link «Consultar a edição do guia», identifique o endereço anterior e o efetivo. Registre o número e a geração do objeto, o offset de cada versão do objeto e o offset da seção de referências cruzadas correspondente.
- Localize as menções a `/Launch` e `/OpenAction` no texto visível. Compare as ocorrências impressas com as chaves e ações correspondentes na estrutura ativa.
- Compare a identificação editorial da capa com o campo de autor nos metadados. Explique o que a divergência permite concluir.

- Identifique a camada opcional, sua configuração inicial e a página que a referencia. Recupere o texto da camada e descreva em que condição aparece.
- Compare o título no dicionário `/Info` com o título no pacote XMP. Identifique a origem de cada valor e indique qual deles cada ferramenta consultada exibe.
- Identifique o objeto indireto órfão na cadeia de referências cruzadas. Registre seu conteúdo e demonstre se ele é alcançável a partir do catálogo.
- Compare a nota em camada opcional com o texto impresso na cor do fundo. Identifique a página, o fluxo de conteúdo, os operadores de cor e o vínculo com a camada, quando houver. Confronte as alegações das notas com as evidências estruturais.
- Para as duas notas e o texto do objeto órfão, indique se o conteúdo está presente nos bytes do PDF, se é alcançável a partir do catálogo e se aparece na visualização padrão.

- Localize o exemplo citado de prompt no ebook. Explique a diferença entre as instruções do enunciado e o texto extraído de um arquivo sob investigação. Redija um parecer fundamentado nos objetos encontrados, mesmo que o texto extraído sugira outro resultado.

Os itens complementares integram os critérios de mapeamento e interpretação das seções 2 e 3.

## 5. Parecer forense

Apresente uma tabela com uma linha por achado e as colunas **Artefato**, **Evidência**, **Gatilho ou condição**, **Efeito sustentado pelo arquivo** e **Limite da análise**. Na conclusão, explique quais comportamentos dependem do leitor de PDF e quais afirmações exigiriam observação em tempo de execução. Uma palavra-chave ou um tipo de ação, isoladamente, é insuficiente para sustentar um veredito.

## Ferramentas e exemplos no Alpine Linux 3.24 com GNOME

Abra o terminal pelo menu de aplicativos do GNOME. Com a rede disponível, confira os repositórios `main` e `community` da série v3.24 em `/etc/apk/repositories`. Instale os pacotes com uma conta administrativa (por exemplo, em uma sessão de root).

```sh
apk update
apk add file poppler-utils qpdf zbar grep imagemagick
```

O pacote `imagemagick` fornece o módulo PNG usado pelo `zbarimg`. O pacote `grep` instala o GNU grep, usado para obter offsets em bytes com `-b`. Em x86_64, `qpdf` e `zbar` estão em `community`. Depois da instalação, desconecte a VM. Execute os comandos de análise com sua conta comum, a partir da pasta onde extraiu o kit. Os exemplos pressupõem o shell `sh`.

[Pacotes Poppler](https://pkgs.alpinelinux.org/packages?branch=v3.24&name=poppler-utils) · [Repositório community v3.24](https://dl-cdn.alpinelinux.org/alpine/v3.24/community/x86_64/) · [Pacote ZBar](https://pkgs.alpinelinux.org/package/v3.24/community/x86_64/zbar)

### Identificação, integridade e extração

`file` identifica formatos a partir dos bytes. `wc -c` conta bytes e `sha256sum` calcula um identificador para comparar arquivos. `pdfinfo` mostra propriedades do documento e, com `-meta`, imprime o pacote de metadados XML. `pdfdetach` lista e extrai anexos.

```sh
original=amostra-forense-pdf.pdf
pdf=fd017-trabalho.pdf
cp "$original" "$pdf"
file "$original"
wc -c "$original"
sha256sum "$original" "$pdf"

apk list -I file poppler-utils qpdf zbar grep imagemagick
pdfinfo "$pdf"
pdfinfo -meta "$pdf"
pdfdetach -list "$pdf"
mkdir -p anexos
pdfdetach -saveall -o anexos "$pdf"
file anexos/*
sha256sum anexos/*
od -An -tx1 -N 32 anexos/errata.pdf
```

Use `od` para visualizar os bytes iniciais sem abrir o anexo em um aplicativo. Registre o que a extensão sugere e o que os bytes sustentam.

### Estrutura, ações e revisões

O `qpdf` inspeciona referências cruzadas, páginas, objetos e fluxos. `--check` verifica a estrutura e pode reportar avisos de leitura. Uma validação sintática bem-sucedida, por si só, é insuficiente para avaliar o comportamento do PDF.
 
Nesta amostra, o qpdf 12.3.2 avisa que o tamanho declarado na última seção de referências cruzadas difere do maior número de objeto indexado mais um. Registre o aviso. A opção `--warning-exit-0` preserva a mensagem e retorna zero quando há apenas avisos. Preserve o PDF para analisar seu histórico.

```sh
qpdf --warning-exit-0 --check "$pdf"
qpdf --warning-exit-0 --show-object=trailer "$pdf"
qpdf --warning-exit-0 --show-pages "$pdf"
qpdf --warning-exit-0 --show-xref "$pdf" > xref-ativa.txt
LC_ALL=C grep -a -n -A 1 -x 'startxref' "$pdf"
```

Para examinar um objeto, substitua `N` pelo número e `G` pela geração informados na referência indireta:

```sh
qpdf --warning-exit-0 --show-object=N,G "$pdf"
qpdf --warning-exit-0 --show-object=N,G --filtered-stream-data "$pdf" > fluxo-decodificado.txt
```

Use o segundo comando para objetos do tipo fluxo. A saída do `grep` mostra números de **linha**. O valor registrado na linha após `startxref` é o **offset em bytes** da seção de referências cruzadas. Siga `/Prev` a partir da seção mais recente. `--show-xref` mostra os offsets efetivos dos objetos. Para recuperar um estado anterior e comparar o mesmo objeto nas duas versões, liste os finais de revisão e copie o prefixo do PDF até o final escolhido:

```sh
LC_ALL=C grep -a -b -x '%%EOF' "$pdf"
# Substitua N pelo offset em bytes de um %%EOF anterior.
fim=N
dd if="$pdf" of=fd017-revisao-anterior.pdf bs=1 count="$((fim + 5))"
qpdf --warning-exit-0 --show-xref fd017-revisao-anterior.pdf
```

O `+ 5` inclui os cinco bytes de `%%EOF`. A cópia é um prefixo byte a byte. Examine nela o mesmo objeto com `--show-object=N,G`.
 
Para comparar os títulos, obtenha a referência `/Info` no trailer da primeira revisão e examine esse objeto. Em algumas versões do Poppler, `pdfinfo` deixa de mostrar os campos herdados de `/Info` nesta amostra incremental. Use `pdfinfo -meta` para o XMP e documente a diferença entre as saídas.

[Manual do qpdf](https://qpdf.readthedocs.io/en/stable/cli.html)

### Texto, renderização e QR code

O `pdftotext` extrai texto. O `pdftoppm` renderiza páginas em imagens e permite comparar o que foi extraído com o que aparece visualmente. O `pdfimages` extrai imagens incorporadas. O `zbarimg` decodifica QR codes localmente e imprime o resultado como texto.

```sh
pdftotext -layout "$pdf" texto.txt
grep -inE 'triagem|editorial|prompt' texto.txt
pdftoppm -f 6 -l 6 -singlefile -png "$pdf" pagina-6
pdfimages -list "$pdf"
mkdir -p imagens
pdfimages -f 7 -l 7 -png "$pdf" imagens/pagina-7
zbarimg --nodbus --quiet --raw imagens/pagina-7-000.png
```

No GNOME, abra `pagina-6.png` no visualizador de imagens. Compare o resultado com `texto.txt` e, se houver diferenças, confira os fluxos da página com o `qpdf`. Use os números das páginas acima para reproduzir os exemplos e ajuste a seleção conforme o achado. Trate a saída do ZBar como evidência textual e deixe o endereço sem abrir.

### Ferramentas web opcionais

Use o navegador fora da VM isolada, ou prepare a versão offline do CyberChef antes de desconectar a VM. A entrega pode ser concluída com as ferramentas locais.

| Ferramenta | O que faz | Exemplo |
|---|---|---|
| **CyberChef** | Aplicação que transforma e examina dados no navegador. A versão oficial também pode ser baixada para uso offline. | Abra a versão offline, carregue o anexo extraído `errata.pdf` como entrada e aplique `SHA2` com tamanho de 256 bits. Compare com `sha256sum`. Em uma receita separada, aplique `To Hex` e compare o início com `od`. |
| **VirusTotal** | Consulta relatórios de análises anteriores pelo hash de um arquivo. | Na aba **Search**, cole somente o SHA-256 da amostra didática. Registre a data e se havia um relatório. A ausência de relatório ou de detecções é insuficiente para concluir que o arquivo é seguro. A consulta exige rede e envia o hash ao serviço. |

Para a atividade, dispense o upload do PDF ou dos anexos para serviços externos. A análise de estrutura, camadas e histórico é feita na cópia local.

[CyberChef oficial e versão offline](https://github.com/gchq/CyberChef) · [Busca por hash no VirusTotal](https://docs.virustotal.com/docs/searching)
