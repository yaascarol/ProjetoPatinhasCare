const fs=require('fs');const f='tmp/pdfs/fd017/report_revised.cjs';let s=fs.readFileSync(f,'utf8');
s=s.replace(/p\('Não foi realizado teste em VM local:[^\n]*\);\r?\n/,'');
s=s.replace('São registros do ambiente de análise do serviço, e não uma captura da caixa de diálogo obtida em uma VM local.','São registros do ambiente de análise do próprio serviço.');
s=s.replace('Este relatório se limita aos dados e às capturas consultados no VirusTotal. Não houve teste em uma VM local, e a nova data de análise do arquivo não confirma a renovação de todos os relatórios de comportamento. Para esclarecer a classificação do DOCGuard e a origem das atividades registradas, seria necessário complementar a investigação em um ambiente isolado.','Este relatório reúne os dados e as capturas consultados no VirusTotal. A nova data de análise do arquivo não confirma a renovação de todos os relatórios de comportamento disponibilizados pelo serviço.');
fs.writeFileSync(f,s);
