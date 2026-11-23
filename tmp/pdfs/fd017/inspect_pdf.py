from pathlib import Path
from pypdf import PdfReader
import hashlib, shutil, sys, reportlab, pypdf
p=Path('tmp/pdfs/fd017'); src=p/'amostra-forense-pdf.pdf'; dst=p/'fd017-trabalho.pdf'; shutil.copyfile(src,dst)
r=PdfReader(dst)
out=[f'Python {sys.version}\npypdf {pypdf.__version__}\nreportlab {reportlab.Version}',f'Size {src.stat().st_size}',f'SHA256 {hashlib.sha256(src.read_bytes()).hexdigest()}',f'Copy SHA256 {hashlib.sha256(dst.read_bytes()).hexdigest()}',f'TRAILER {r.trailer}',f'METADATA {r.metadata}']
for gen, objs in r.xref.items():
 for num, off in objs.items():
  if num==0: continue
  try:
   o=r.get_object(pypdf.generic.IndirectObject(num,gen,r)); out.append(f'\nOBJECT {num} {gen} OFFSET {off}\n{repr(o)}')
   if hasattr(o,'get_data') and o.get('/Subtype')!='/Image': out.append('STREAM\n'+o.get_data().decode('latin1'))
  except Exception as e: out.append(str(e))
for i,page in enumerate(r.pages): out.append(f'\nPAGE {i+1} REF {page.indirect_reference}\nTEXT\n{page.extract_text()}')
for name, data in r.attachments.items():
 for j,b in enumerate(data):
  (p/(name+'.bin')).write_bytes(b); out.append(f'ATTACHMENT {name} SIZE {len(b)} SHA256 {hashlib.sha256(b).hexdigest()} BYTES {b[:3000]!r}')
(p/'dump.txt').write_text('\n'.join(out),encoding='utf-8')
print('\n'.join(out[:6]));print('dump saved')
