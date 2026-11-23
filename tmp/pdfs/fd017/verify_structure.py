from pathlib import Path
import sys,re,json,hashlib,io,struct
sys.path.insert(0,str(Path('tmp/pdfs/fd017/libs').resolve()))
from pypdf import PdfReader
from pypdf.generic import IndirectObject,read_object,DictionaryObject,ArrayObject
from PIL import Image
import zxingcpp
p=Path('tmp/pdfs/fd017'); b=(p/'fd017-trabalho.pdf').read_bytes(); r=PdfReader(io.BytesIO(b))
# Read each xref at its physical offset; newest entries take precedence.
offset=int(re.findall(rb'startxref\s+(\d+)',b)[-1]); active={}; chain=[]
while True:
 if b[offset:offset+4]==b'xref':
  for num, off in r.xref[0].items(): active.setdefault(num,off)
  chain.append({'offset':offset,'kind':'table','size':51,'prev':None});break
 s=io.BytesIO(b);s.seek(offset+re.match(rb"\d+\s+\d+\s+obj\s*",b[offset:]).end()); obj=read_object(s,r); widths=obj['/W']; data=obj.get_data(); ix=obj['/Index']; pos=0; entries={}
 for start,count in zip(ix[::2],ix[1::2]):
  for num in range(start,start+count):
   fields=[]
   for w in widths: fields.append(int.from_bytes(data[pos:pos+w],'big'));pos+=w
   if fields[0]==1: active.setdefault(num,fields[1]); entries[num]=fields[1]
 chain.append({'offset':offset,'kind':'stream','size':obj['/Size'],'prev':obj.get('/Prev'),'entries':entries})
 offset=int(obj['/Prev'])
r.xref[0].update(active);r.resolved_objects.clear()
seen=set(); actions=[]
def walk(o,path):
 if isinstance(o,IndirectObject):
  k=(o.idnum,o.generation)
  if k in seen:return
  seen.add(k);walk(o.get_object(),f'{o.idnum} {o.generation} R');return
 if isinstance(o,DictionaryObject):
  if '/S' in o: actions.append([path,str(o)])
  for k,v in o.items():walk(v,path+'/'+str(k).lstrip('/'))
 elif isinstance(o,ArrayObject):
  for j,v in enumerate(o):walk(v,path+f'[{j}]')
walk(r.trailer.raw_get('/Root'),'Root')
img=r.pages[6].images[0]; (p/'qr.png').write_bytes(img.data)
qr=zxingcpp.read_barcode(Image.open(io.BytesIO(img.data))).text
result={'chain':chain,'qr':qr,'reachable':sorted(seen),'actions':actions,'ocg':str(r.get_object(54)),'orphan57':str(r.get_object(57)),'orphan51':str(r.get_object(51)),'header':b[:8].decode(),'old34':str(PdfReader(io.BytesIO(b[:103397])).get_object(34))}
(p/'evidencias.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
for n in [1,2,5,9,32,33,34,38,44,46,47,48,50,51,52,53,54,55,56,57,59]:
 print(n,active.get(n),str(r.get_object(n)))
print(json.dumps(result,ensure_ascii=False,indent=2))

