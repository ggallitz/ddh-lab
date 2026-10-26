import {Renderer} from './renderer.ts';
import {bundle,crossing,defaults,cameraDefault,normalize,haloWidth} from './model.ts';
import type {Dataset,Parameters,Camera,Mode} from './model.ts';
import {readSop} from './sop.ts';
import './style.css';
import {markup} from './ui.ts';

const root=document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML=markup;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=el<HTMLCanvasElement>('scene');
let renderer:Renderer;
try{renderer=new Renderer(canvas);}catch(e){el('status').textContent=String(e);throw e;}
let params:Parameters={...defaults},camera:Camera=cameraDefault(),delta=.06;
let dataset:Dataset=crossing(delta),datasetId='crossing',view='understand',loadSerial=0;
const methodNames:Record<Mode,string>={lines:'Einfache Linien',halo:'Herkömmliche Halos',ddh:'Depth-Dependent Halos'};
interface RecordData {id:string;name:string;source:string;url:string;sha256:string;pointCount:number;sequenceCount:number;bounds:{min:number[];max:number[]};dataType:'lines'}
let records:RecordData[]=[];
let importedDataset:Dataset|undefined;
function status(text:string){el('status').textContent=text;}
function updateGeometry(){renderer.setLines(dataset.lines);}
function drawSide(){
 const active=datasetId==='crossing';el('side-panel').hidden=!active;el('delta-label').hidden=!active;
 if(!active)return;
 const z1=46-Math.abs(delta)*65,z2=46+Math.abs(delta)*65;
 const edge=50*params.lineWidth/params.stripWidth;
 const boundary=haloWidth(Math.abs(delta),params.lineWidth,params.stripWidth,params.dmax);
 const expected=params.mode==='lines'?0:params.mode==='halo'?(params.stripWidth-params.lineWidth)/2:boundary;
 const profile=params.mode==='ddh'?`<path d="M100 ${z1+params.dmax*140} L${150-edge} ${z1+params.dmax*140*edge/50} M${150+edge} ${z1+params.dmax*140*edge/50} L200 ${z1+params.dmax*140}" fill="none" stroke="#657b86" stroke-dasharray="4 3"/>`:'';
 el('side').innerHTML=`<text x="16" y="18">Querschnitt Vordergrund · schematisch</text><path d="M45 28 V92 H280" fill="none" stroke="#aaa"/><text x="6" y="70">z ↓</text><text x="230" y="111">r →</text><path d="M100 ${z1} H200 M70 ${z2} H260" stroke="#999"/><path d="M${150-edge} ${z1} H${150+edge}" stroke="#111" stroke-width="3"/>${profile}<text x="350" y="24">Δz = ${delta.toFixed(3)} · Fenstertiefe</text><text x="350" y="50">Zusatzrand: ${camera.yaw||camera.pitch||params.cue?"— (Front ohne Cueing nötig)":expected.toFixed(1)+" px"}</text><text x="350" y="75">— Originaltiefe   ⋯ DDH-Fragmenttiefe</text><text x="350" y="100">${camera.yaw||camera.pitch?'Gedrehte Kamera: Orakel nicht anwendbar.':params.cue?'Cueing aktiv: Orakel nicht anwendbar.':`Vordergrund: ${delta>=0?'horizontale':'vertikale'} Linie · z nach hinten.`}</text>`;
}
function render(){
 renderer.render(params,camera);
 el('limit-cases').hidden=view!=='limits';
 el('scene-title').textContent=dataset.name;el('method-title').textContent=params.diagnostic?'Diagnose · Fragmenttiefe (Grauwert z′)':methodNames[params.mode]+(params.cue?' · Depth Cueing':'');
 const points=dataset.lines.reduce((n,l)=>n+l.length,0);
 el('caption').textContent=`${dataset.source} · ${dataset.lines.length.toLocaleString('de-DE')} Linien · ${points.toLocaleString('de-DE')} Punkte${dataset.note?' · '+dataset.note:''}${params.diagnostic?' · Diagnose: Grauwert 0 = vorne, 1 = hinten (z′)':''}`;
 el('explanation').textContent=view==='limits'?(datasetId==='crossing'?'Grenzfall Tiefengleichheit: Welche Tiefenordnung kann DDH hier vermitteln? Bei Δz = 0 existiert keine Vorder-/Hintergrundordnung; exakte Raster-Ties können von der Zeichenreihenfolge abhängen.':'Grenzfall Verdeckung: Welche Struktur bleibt verborgen? Die Schrägansicht verändert die Verdeckung. DDH liefert lokale Tiefenhinweise, keine Rekonstruktion verdeckter Strukturen.'):view==='compare'?'Methodenvergleich: Beim Umschalten bleiben Daten, Kamera und Parameter identisch. Herkömmliche Halos trennen bei jedem positiven Tiefenabstand; DDH lässt nahe Linien visuell zusammenrücken.':'Bewege Δz: Bei nahen Linien verschwindet die zusätzliche Trennung. Mit wachsendem Abstand wächst der weiße Rand bis zur Streifengrenze. Negative Werte vertauschen Vorder- und Hintergrund.';
 drawSide();
}
function sync(){
 for(const key of ['lineWidth','stripWidth','dmax'] as const){el<HTMLInputElement>(key).value=String(params[key]);el(key+'-value').textContent=params[key].toFixed(key==='dmax'?3:0)+(key==='dmax'?'':' px');}
 el<HTMLInputElement>('delta').value=String(delta);el('delta-value').textContent=delta.toFixed(3);
 for(const key of ['cue','diagnostic'] as const)el<HTMLInputElement>(key).checked=params[key];
 document.querySelector<HTMLInputElement>(`input[name="mode"][value="${params.mode}"]`)!.checked=true;
 el<HTMLSelectElement>('dataset').value=datasetId;
 document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view?'page':'false'));
}
async function load(id:string){
 const serial=++loadSerial;
 try{
  let next:Dataset;
  if(id==='import' && importedDataset)next=importedDataset;else if(id==='crossing')next=crossing(delta);else if(id==='bundle'||id==='hidden')next=bundle(id==='hidden');else{
   const record=records.find(r=>r.id===id);if(!record)throw new Error('Datensatz nicht verfügbar');
   status('Originaldaten werden gelesen …');
   const response=await fetch(record.url);if(!response.ok)throw new Error('Lokale Datei fehlt. python3 scripts/prepare_data.py ausführen.');
   const buffer=await response.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',buffer);const hash=[...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
   if(hash!==record.sha256)throw new Error('SHA-256 stimmt nicht mit dem Quelleninventar überein');
   const sop=readSop(buffer,record.dataType,600_000);
   if(sop.pointCount!==record.pointCount||sop.sequenceCount!==record.sequenceCount||JSON.stringify(sop.bounds)!==JSON.stringify(record.bounds))throw new Error('Counts/Bounds weichen vom Quelleninventar ab');
   next={name:record.name,source:record.source,lines:normalize(sop.lines),originalPoints:sop.pointCount,originalLines:sop.sequenceCount,bounds:sop.bounds??undefined,note:'Vollständiger Originaldatensatz · zentriert, einheitlich auf 1,7 Welteinheiten skaliert'};
  }
  if(serial!==loadSerial)return;
  dataset=next;datasetId=id;updateGeometry();sync();render();status('');
 }catch(e){if(serial===loadSerial){status(String(e));sync();}}
}
function preset(next:string){
 view=next;params={...defaults};camera=cameraDefault();delta=.06;
 void load(next==='understand'?'crossing':next==='compare'?'bundle':'hidden');
}
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach(b=>b.onclick=()=>preset(b.dataset.view!));
el('reset').onclick=()=>preset('understand');
el('case-hidden').onclick=()=>preset('limits');
el('case-equal').onclick=()=>{view='limits';params={...defaults};camera=cameraDefault();delta=0;void load('crossing');};
el<HTMLSelectElement>('dataset').onchange=e=>{void load((e.target as HTMLSelectElement).value);};
document.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach(r=>r.onchange=()=>{params.mode=r.value as Mode;render();});
for(const key of ['lineWidth','stripWidth','dmax'] as const)el<HTMLInputElement>(key).oninput=e=>{params[key]=Number((e.target as HTMLInputElement).value);sync();render();};
el<HTMLInputElement>('delta').oninput=e=>{delta=Number((e.target as HTMLInputElement).value);if(datasetId==='crossing'){dataset=crossing(delta);updateGeometry();}sync();render();};
for(const key of ['cue','diagnostic'] as const)el<HTMLInputElement>(key).onchange=e=>{params[key]=(e.target as HTMLInputElement).checked;render();};
el('front').onclick=()=>{camera=cameraDefault();render();};el('oblique').onclick=()=>{camera={yaw:.8,pitch:.4,zoom:1};render();};
el('export').onclick=()=>{try{render();canvas.toBlob(blob=>{if(!blob){status('PNG-Export fehlgeschlagen');return;}const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=`ddh-${datasetId}-${params.mode}${params.diagnostic?'-diagnose':''}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('PNG exportiert · aktuelle Zeichenfläche ohne Bedienelemente');},'image/png');}catch(e){status(String(e));}};
el<HTMLInputElement>('file').onchange=async e=>{
 const file=(e.target as HTMLInputElement).files?.[0];if(!file)return;const serial=++loadSerial;
 try{if(file.size>64*1024*1024)throw new Error('Datei größer als 64 MiB');
 const sop=readSop(await file.arrayBuffer(),el<HTMLSelectElement>('import-type').value as 'lines'|'points',600_000);
 const lines=normalize(sop.lines);if(serial!==loadSerial)return;
 dataset={name:file.name,source:'Lokaler SOP-Import · Herkunft durch Nutzer anzugeben',lines,note:`${sop.attributeCount} Zusatzattribute validiert, nicht interpretiert`};datasetId='import';importedDataset=dataset;
 const select=el<HTMLSelectElement>('dataset');if(!select.querySelector('[value="import"]'))select.add(new Option('Lokaler Import','import'));
 camera=cameraDefault();updateGeometry();sync();render();status('');}catch(err){if(serial===loadSerial)status(String(err));}
};
let dragging=false,lastX=0,lastY=0;
canvas.onpointerdown=e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);};
canvas.onpointermove=e=>{if(!dragging)return;camera.yaw+=(e.clientX-lastX)*.008;camera.pitch+=(e.clientY-lastY)*.008;lastX=e.clientX;lastY=e.clientY;render();};
canvas.onpointerup=canvas.onpointercancel=()=>{dragging=false;};
canvas.addEventListener('wheel',e=>{e.preventDefault();camera.zoom=Math.max(.3,Math.min(4,camera.zoom*Math.exp(-e.deltaY*.001)));render();},{passive:false});
canvas.onkeydown=e=>{const actions:Record<string,()=>void>={ArrowLeft:()=>camera.yaw-=.1,ArrowRight:()=>camera.yaw+=.1,ArrowUp:()=>camera.pitch-=.1,ArrowDown:()=>camera.pitch+=.1,'+':()=>camera.zoom=Math.min(4,camera.zoom*1.1),'-':()=>camera.zoom=Math.max(.3,camera.zoom/1.1)};if(actions[e.key]){e.preventDefault();actions[e.key]();render();}};
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();status('Grafikkontext verloren. Seite neu laden, um den Renderer wiederherzustellen.');});
new ResizeObserver(()=>render()).observe(canvas);updateGeometry();sync();render();
void fetch('/data/local/manifest.json').then(async r=>{if(!r.ok)throw new Error();records=await r.json();for(const record of records)el<HTMLSelectElement>('dataset').add(new Option(record.name+' · Original',record.id));}).catch(()=>status('Originaldaten noch nicht vorbereitet. Synthetische Szenen sind verfügbar; siehe README.'));
if(new URLSearchParams(location.search).has('test'))Object.assign(window,{labTest:{renderer,crossing,defaults,cameraDefault,state:()=>({params:{...params},camera:{...camera},datasetId,view,delta}),render:()=>render()}});
