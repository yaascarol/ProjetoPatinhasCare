from pathlib import Path
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

root = Path(__file__).resolve().parents[2]
out = root / 'output/pdf/guia-estudos-web-patinhascare.pdf'
out.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial', boldItalic='Arial-Bold')
purple = colors.HexColor('#684794')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyGuide', fontName='Arial', fontSize=10.5, leading=15.5, spaceAfter=9, textColor=colors.HexColor('#29262d')))
styles.add(ParagraphStyle(name='TitleGuide', fontName='Arial-Bold', fontSize=25, leading=30, textColor=purple, spaceAfter=14))
styles.add(ParagraphStyle(name='SectionGuide', fontName='Arial-Bold', fontSize=14, leading=19, textColor=purple, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name='SmallGuide', fontName='Arial', fontSize=9, leading=13, spaceAfter=6))
story=[]
def p(text): story.append(Paragraph(text, styles['BodyGuide']))
def h(text): story.append(Paragraph(text, styles['SectionGuide']))
def title(text): story.append(Paragraph(text, styles['TitleGuide']))
def table(rows, widths):
    data=[[Paragraph(cell, styles['SmallGuide']) for cell in row] for row in rows]
    t=Table(data,colWidths=widths,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eee7f5')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,-1),0.4,colors.HexColor('#ddd4e6'))]))
    story.append(t)
    story.append(Spacer(1,10))
def link(label,url): return f'<link href="{url}" color="#684794"><u>{label}</u></link>'

title('Entender o que está por trás da aplicação')
p('<b>Guia de estudo do PatinhasCare</b><br/>JavaScript, Node, APIs e os fundamentos da web')
p('Esses fundamentos são importantes para Engenharia de Software, especialmente para aplicações web. Eles ajudam a entender onde um problema acontece e a avaliar se uma solução sugerida pela IA faz sentido. Você não precisa dominar tudo antes de continuar o projeto.')
h('Node, TypeScript e Express têm papéis diferentes')
table([
 ['<b>Tecnologia</b>','<b>O que é e qual seu papel</b>'],
 ['JavaScript','Linguagem na qual escrevemos o código atual.'],
 ['TypeScript (TS)','Acrescenta verificação de tipos ao JavaScript. Ajuda a identificar certos erros durante o desenvolvimento.'],
 ['Node.js','Ambiente que executa JavaScript fora do navegador.'],
 ['Express','Framework usado com Node que facilita criar rotas, receber pedidos e enviar respostas.'],
], [110,389])
p('<b>No projeto que verificamos, o backend usa JavaScript, Node.js e Express.</b> Os arquivos são server.js, db.js e scripts .js; ainda não configuramos TypeScript.')
p('Um projeto pode usar Node + TypeScript + Express ao mesmo tempo. TypeScript não substitui Express. A relação com JavaScript é explicada na '+link('introdução oficial ao TypeScript','https://www.typescriptlang.org/docs/handbook/typescript-from-scratch')+'.')
h('Como estudar sem transformar tudo em uma leitura maçante')
p('Comece com materiais visuais e pequenos experimentos no PatinhasCare. CORS fica mais fácil depois de entender o caminho de uma requisição. Começar diretamente por ele pode parecer uma coleção de regras arbitrárias.')
p('Use a documentação como consulta guiada por uma pergunta, sem tentar ler tudo de uma vez. Por exemplo: <b>“O que meu navegador envia quando clico em Entrar?”</b>')
story.append(PageBreak())

title('Fontes e sequência de estudo')
p('Os títulos sublinhados abaixo são links clicáveis. Os materiais indicados em português ajudam a conectar a explicação ao projeto.')
sources=[
 ('Como o DNS funciona','https://howdns.works/pt-br/','História ilustrada em português sobre como um nome de site é localizado na internet. Uma entrada mais leve.'),
 ('Como o HTTPS funciona','https://howhttps.works/pt-br/','Quadrinhos em português sobre conexão segura, inclusive com um “certifiGATO”.'),
 ('Introdução ao lado servidor - MDN','https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Extensions/Server-side/First_steps/Introduction','Explica o que acontece no servidor e como isso se relaciona com o navegador.'),
 ('Visão geral do HTTP - MDN','https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/Overview','Para entender pedidos, respostas e a comunicação entre navegador e servidor.'),
 ('Inspecionar atividade de rede - Chrome','https://developer.chrome.com/docs/devtools/network/?hl=pt-br','Tutorial prático para observar requisições no navegador, em vez de apenas ler sobre elas.'),
 ('CORS - MDN','https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Guides/CORS','Leia depois da base: faz mais sentido quando origem, cabeçalho e resposta já são familiares.'),
]
for label,url,desc in sources:
    p('<b>'+link(label,url)+'</b><br/>'+desc)
h('A ordem sugerida para você')
for text in [
 '1. <b>Cliente e servidor:</b> quem pede, quem responde e onde o banco entra.',
 '2. <b>HTTP:</b> URL, métodos, cabeçalhos, corpo e códigos de resposta.',
 '3. <b>API e JSON:</b> quais operações o backend oferece e como os dados são enviados.',
 '4. <b>Cookies e sessão:</b> como o servidor reconhece você depois do login.',
 '5. <b>Origem e CORS:</b> como o navegador controla o acesso entre endereços diferentes.',
 '6. <b>HTTPS:</b> como a comunicação é protegida durante o transporte.',
]: p(text)
p('<b>Vocabulário:</b> no localhost estamos usando HTTP. HTTPS é HTTP protegido por TLS, a tecnologia que protege a comunicação. Uma API pode ser acessada por HTTP ou HTTPS; “API” não é o nome do protocolo.')
story.append(PageBreak())

title('Aprender observando o projeto')
h('Um exercício curto no PatinhasCare')
for text in [
 '1. Com o projeto aberto no navegador, pressione <b>F12</b>.',
 '2. Abra a aba <b>Network / Rede</b>.',
 '3. Faça login.',
 '4. Clique na requisição que termina em <b>/auth/login</b>.',
 '5. Observe os campos abaixo e procure responder às perguntas.',
]: p(text)
table([
 ['<b>Campo</b>','<b>Pergunta que ele responde</b>'],
 ['Request URL','Para onde o pedido foi enviado?'],
 ['Request Method','Qual método foi usado? No login, POST.'],
 ['Status Code','Como o servidor respondeu?'],
 ['Payload','Quais dados o frontend enviou?'],
 ['Response','O que o backend devolveu?'],
], [135,364])
p('<b>Atenção ao compartilhar:</b> o Payload do login contém a senha enviada. Não compartilhe uma captura dessa parte.')
p('Depois, teste uma senha incorreta e compare a resposta. Você verá uma situação real: a requisição chegou ao backend, mas as credenciais foram recusadas. Isso é diferente de o backend estar desligado ou de o navegador bloquear o acesso à resposta.')
h('Como usar IA sem apenas copiar')
p('A IA pode ajudar tanto no frontend quanto no backend. Mas frontend também exige conhecimento: acessibilidade, estado, formulários, segurança e comunicação com a API. Uma tela bonita pode estar funcionando incorretamente.')
p('Uma forma de estudar com IA é pedir:')
p('<b>“Explique o caminho deste clique até o banco. Depois me peça para prever o que acontece se uma etapa falhar. Só então mostre a correção.”</b>')
p('Podemos adotar esse método no projeto: <b>antes de cada integração, entender o fluxo; depois escrever o código; por fim observar a requisição no navegador.</b> Você aprende a base usando problemas concretos, sem precisar interromper tudo para enfrentar um curso enorme.')

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#ddd4e6'))
    canvas.line(48,43,547,43)
    canvas.setFont('Arial',8)
    canvas.setFillColor(colors.HexColor('#6b6374'))
    canvas.drawString(48,29,'PatinhasCare | Guia de estudo | 28/10/2026')
    canvas.drawRightString(547,29,f'{doc.page}')

doc=SimpleDocTemplate(str(out),pagesize=(595.28,841.89),rightMargin=48,leftMargin=48,topMargin=42,bottomMargin=58,title='Fundamentos web - Guia de estudo PatinhasCare',author='PatinhasCare')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(str(out))
urls=[]
for page in reader.pages:
    for ref in page.get('/Annots',[]):
        annotation=ref.get_object()
        action=annotation.get('/A',{})
        if action.get('/URI'): urls.append(str(action['/URI']))
assert len(reader.pages)==3, len(reader.pages)
assert len(set(urls))==7, urls
assert all(page.extract_text().strip() for page in reader.pages)
print(f'PDF: {out}\nPages: {len(reader.pages)}\nUnique clickable links: {len(set(urls))}')
