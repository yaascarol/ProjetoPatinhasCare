const fs=require('fs');
const {PDFDocument,StandardFonts,rgb}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/pdf-lib');
(async()=>{
const doc=await PDFDocument.create();const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
const green=rgb(.16,.34,.27),pink=rgb(.98,.91,.93),light=rgb(.92,.96,.93),ink=rgb(.16,.19,.18),muted=rgb(.4,.44,.42); let pg,y,n=0;
const clean=t=>t.replace(/\u2192/g,' > ').replace(/\u2011/g,'-');
function text(t,x,yy,size=11,font=regular,color=ink){pg.drawText(clean(t),{x,y:yy,size,font,color});}
function lines(t,size,width,font){let out=[];for(const segment of clean(t).split('\n')){let line='';for(let word of segment.split(' ')){if(font.widthOfTextAtSize(word,size)>width){if(line){out.push(line);line='';}while(font.widthOfTextAtSize(word,size)>width){let cut=word.length-1;while(font.widthOfTextAtSize(word.slice(0,cut),size)>width)cut--;out.push(word.slice(0,cut));word=word.slice(cut);}}const trial=line?line+' '+word:word;if(font.widthOfTextAtSize(trial,size)>width){out.push(line);line=word;}else line=trial;}out.push(line);}return out;}
function p(t,opt={}){const size=opt.size||11,lead=opt.lead||16,width=opt.width||495,x=opt.x||50,font=opt.bold?bold:regular;for(const l of lines(t,size,width,font)){text(l,x,y,size,font,opt.color||ink);y-=lead;}y-=opt.gap===undefined?10:opt.gap;if(y<48)throw new Error('Overflow page '+n);}
function h(t){y-=6;p(t,{size:15,lead:20,bold:true,color:green,gap:5});}
function start(title,sub){pg=doc.addPage([595,842]);n++;pg.drawRectangle({x:0,y:0,width:12,height:842,color:green});pg.drawRectangle({x:450,y:740,width:145,height:102,color:pink});y=755;p(title,{size:25,lead:29,bold:true,color:green,gap:10});y-=12;pg.drawLine({start:{x:50,y:43},end:{x:545,y:43},thickness:.6,color:green});text(String(n),533,27,9,bold,green);}
function box(t){let ls=lines(t,11,465,bold),height=ls.length*16+25;pg.drawRectangle({x:50,y:y-height+12,width:495,height,color:pink});y-=5;for(const l of ls){text(l,65,y,11,bold,green);y-=16;}y-=20;}
async function photo(name,width,maxHeight){const im=await doc.embedJpg(fs.readFileSync('tmp/pdfs/fd017/'+name));let height=im.height*width/im.width;if(height>maxHeight){width*=maxHeight/height;height=maxHeight;}pg.drawImage(im,{x:50,y:y-height,width,height});y-=height+12;}
start('Análise do PDF FD-017','Arquivo examinado: amostra-forense-pdf.pdf');
p('O arquivo amostra-forense-pdf.pdf foi verificado no VirusTotal para observar as detecções dos antivírus e os registros de comportamento disponíveis no serviço. Este relatório apresenta os resultados da reanálise solicitada em 20/11/2026 e as informações exibidas nas abas Detection, Details e Behavior.');
h('Resultado da nova verificação');
p('A reanálise foi solicitada e concluída no VirusTotal em 20/11/2026. O serviço registrou a última análise às 20h12min03s, no horário de Brasília. Na aba Detection, nenhum fornecedor sinalizou o arquivo como malicioso. A lista também apresentou mecanismos sem suporte ao tipo de arquivo e uma falha no mecanismo Google; esses resultados não foram tratados como verificações bem-sucedidas.');
box('A aba de antivírus não apontou detecções, mas o DOCGuard classificou o arquivo como MALWARE na aba de comportamento. São resultados diferentes dentro do mesmo serviço.');
p('A amostra já estava cadastrada no VirusTotal. Por isso, foi solicitada uma nova análise do registro existente, identificado pelo SHA-256 abaixo, sem necessidade de um novo envio. A aba Details informa o formato, a quantidade de páginas e o tamanho do arquivo.');
h('Identificação do arquivo');
p('PDF versão 1.3 • 7 páginas • 107.681 bytes',{bold:true});
p('SHA-256',{size:9,bold:true,gap:4});p('2080f63126d077ade7a7df46b494647d5c76845ecbf06861c414c2fac5a56163',{size:9,lead:13});
start('O que o VirusTotal mostrou','Capturas obtidas durante esta análise, após a reanálise solicitada');
p('Na tela principal, o serviço manteve a mensagem de que nenhum fornecedor de segurança marcou o arquivo como malicioso. A classificação do DOCGuard aparece em outra seção, chamada Dynamic Analysis Sandbox Detections.');
await photo('virustotal-nova.jpg',280,225);
await photo('virustotal-docguard.jpg',280,225);
start('Registros dos ambientes de análise','Behavior • CAPE Sandbox, DOCGuard, Jujubox, Yomi Hunter e Zenbox');
p('O Jujubox registrou o texto “FD-017 — alerta de abertura do laboratório.” e a indicação “Warning: JavaScript Window -”. Esses textos aparecem na seção Highlighted Text da aba Behavior. São registros do ambiente de análise do próprio serviço.');
await photo('virustotal-alerta.jpg',280,235);
h('Rede e processos');
p('O Jujubox listou uma resolução DNS para acroipm2.adobe.com e tráfego UDP para 8.8.8.8 na porta 53. O DOCGuard encontrou os endereços de inventário e de edição do guia como padrões em memória. Encontrar uma URL na memória não demonstra que ela foi acessada.');
p('O CAPE registrou a abertura do documento no Acrobat e processos relacionados ao tratamento de falhas do Adobe. Também aparecem serviços do Windows e wmiprvse.exe. Esses eventos descrevem o ambiente monitorado; a listagem, sozinha, não demonstra que todos foram provocados por instruções do PDF.');
h('Etiquetas exibidas');
p('Entre as etiquetas estavam js-embedded, autoaction, file-embedded, acroform, calls-wmi, detect-debug-environment, obfuscated e idle. Essas etiquetas são classificações exibidas pelo serviço. Sozinhas, não comprovam que o PDF tenha coletado dados, evitado a análise ou causado dano.',{size:10,lead:14});
start('Considerações finais');
p('A análise do arquivo amostra-forense-pdf.pdf no VirusTotal apresentou resultados diferentes entre a verificação dos antivírus e os ambientes de análise de comportamento. Na reanálise concluída em 20/11/2026, nenhum fornecedor da aba Detection sinalizou o arquivo como malicioso. Alguns mecanismos não conseguiram processar o formato e um apresentou falha, portanto nem todas as verificações tiveram um resultado válido.');
h('Principais achados');
p('Na aba Behavior, o DOCGuard classificou a amostra como MALWARE. Essa indicação merece atenção e precisa ser considerada junto ao resultado dos antivírus. A ausência de detecções na tela principal não elimina o alerta apresentado por esse ambiente.');
p('O Jujubox registrou a mensagem “FD-017 — alerta de abertura do laboratório.” e a indicação de uma janela JavaScript. Também foram exibidos uma consulta DNS para acroipm2.adobe.com e tráfego UDP para 8.8.8.8 na porta 53. Os endereços de inventário e de edição do guia apareceram como padrões em memória no DOCGuard, o que não confirma que tenham sido acessados.');
p('O CAPE registrou a abertura do documento no Acrobat, processos relacionados ao tratamento de falhas do Adobe e atividades de serviços do Windows. O VirusTotal também apresentou etiquetas relacionadas a JavaScript, ações automáticas, arquivos incorporados, formulário e WMI. Esses registros mostram o que foi identificado pelo serviço, mas não permitem atribuir automaticamente toda a atividade observada ao PDF.');
h('Como interpretar os resultados');
p('O conjunto dos resultados exige uma avaliação cuidadosa: há um alerta de comportamento e registros de interação com JavaScript, mesmo sem detecções na aba de antivírus. Com as informações consultadas, não é possível garantir que o arquivo seja seguro nem afirmar que ele tenha comprometido um computador.');
p('Este relatório reúne os dados e as capturas consultados no VirusTotal. A nova data de análise do arquivo não confirma a renovação de todos os relatórios de comportamento disponibilizados pelo serviço.');

doc.setTitle('Análise do PDF FD-017 - achados e VirusTotal');doc.setSubject('Resultados consultados no VirusTotal');fs.writeFileSync('output/pdf/relatorio-fd017-revisado.pdf',await doc.save());console.log('Created',n,'pages');
})();

