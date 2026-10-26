export type Point = [number, number, number];
export type Line = Point[];
export type Mode = 'lines' | 'halo' | 'ddh';
export interface Parameters { mode: Mode; lineWidth: number; stripWidth: number; dmax: number; cue: boolean; diagnostic: boolean }
export interface Camera { yaw: number; pitch: number; zoom: number }
export interface Dataset { name: string; source: string; lines: Line[]; originalPoints?: number; originalLines?: number; bounds?: {min:number[];max:number[]}; note?:string }
export const defaults: Parameters = {mode:'ddh',lineWidth:4,stripWidth:28,dmax:0.12,cue:false,diagnostic:false};
export const cameraDefault = ():Camera => ({yaw:0,pitch:0,zoom:1});
// Own visibility derivation: a front strip fragment at radius r wins when
// z_front + dmax*2r/stripWidth < z_back. Subtract the black half-width.
export function haloWidth(delta:number,line:number,strip:number,dmax:number):number {
  if (!(strip > line && line > 0 && dmax > 0 && delta >= 0)) throw new Error('Ungültige Halo-Parameter');
  return Math.max(0,Math.min(strip/2,strip*delta/(2*dmax))-line/2);
}
export function crossing(delta=0.06):Dataset {
  // Orthographic z_window = .5 + z/4; positive z is farther away.
  return {name:'Zwei Linien',source:'Synthetische Kontrollszene',lines:[ [[-.85,0,-2*delta],[.85,0,-2*delta]], [[0,-.85,2*delta],[0,.85,2*delta]] ]};
}
export function bundle(hidden=false):Dataset {
  const lines:Line[]=[];
  for(let j=0;j<24;j++) {const l:Line=[];for(let i=0;i<=100;i++){const t=i/100*2-1;l.push([t*.9,Math.sin(t*4+j*.18)*.19+(j-12)*.035,Math.cos(t*3+j*.3)*.32]);} lines.push(l);}
  if(hidden) for(let j=0;j<6;j++) lines.push([[-.7,(j-3)*.035,.65],[.7,(j-3)*.035,.65]]);
  return {name:hidden?'Verdecktes Bündel':'Wellenbündel',source:'Synthetisch · deterministische Lehrszene',lines,note:hidden?'Welche Struktur bleibt hinter dem Vordergrundbündel verdeckt? Ändere den Blickwinkel.':undefined};
}
export function normalize(lines:Line[]):Line[] {
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(const l of lines)for(const p of l)for(let a=0;a<3;a++){min[a]=Math.min(min[a],p[a]);max[a]=Math.max(max[a],p[a]);}
  const span=Math.max(...max.map((v,a)=>v-min[a]));
  if(!Number.isFinite(span)||span===0)throw new Error('Datensatz ohne räumliche Ausdehnung');
  return lines.map(l=>l.map(p=>p.map((v,a)=>(v-(min[a]+max[a])/2)*1.7/span) as Point));
}
