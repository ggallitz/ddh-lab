import type {Camera, Line, Parameters} from './model.ts';
const vertex = `#version 300 es
precision highp float;
precision highp int;
layout(location=0) in vec3 position;
layout(location=1) in vec3 previous;
layout(location=2) in vec3 following;
layout(location=3) in float side;
uniform vec2 viewport;
uniform vec3 camera;
uniform float stripWidth;
uniform float lineWidth;
uniform int mode;
uniform bool cue;
out float across;
out float ratio;
vec3 project(vec3 p){
 float cy=cos(camera.x),sy=sin(camera.x),cx=cos(camera.y),sx=sin(camera.y);
 vec3 q=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
 q=vec3(q.x,cx*q.y-sx*q.z,sx*q.y+cx*q.z);
 return vec3(q.xy*camera.z,q.z/2.0);
}
void main(){
 vec3 p=project(position),a=project(previous),b=project(following);
 float aspect=viewport.x/viewport.y;
 p.x/=aspect;a.x/=aspect;b.x/=aspect;
 vec2 before=(p.xy-a.xy)*viewport, after=(b.xy-p.xy)*viewport;
 if(length(before)<0.00001)before=after;
 if(length(after)<0.00001)after=before;
 if(length(before)<0.00001){gl_Position=vec4(p,1.0);across=side;ratio=1.;return;}
 vec2 n1=normalize(vec2(-before.y,before.x));
 vec2 n2=normalize(vec2(-after.y,after.x));
 vec2 m=n1+n2;if(length(m)<0.0001)m=n2;else m=normalize(m);
 float scale=min(2.0,1.0/max(0.01,abs(dot(m,n2))));
 float width=stripWidth;
 // Explicit teaching extension: bounded taper using normalized window depth.
 float taper=cue?mix(1.35,0.5,clamp(p.z*.5+.5,0.,1.)):1.;
 if(mode==0)width=min(lineWidth*taper,stripWidth);
 p.xy+=m*side*width*scale/viewport;
 gl_Position=vec4(p,1.0);across=side;ratio=min(1.0,lineWidth*taper/stripWidth);
}`;
const fragment = `#version 300 es
precision highp float;
precision highp int;
in float across;
in float ratio;
uniform int mode;
uniform float dmax;
uniform bool diagnostic;
out vec4 color;
void main(){
 float r=abs(across);
 bool black=mode==0 || r<=ratio;
 float displacement=mode==2 && !black?dmax*r:0.0;
 // Original fragment shader: only white halo fragments receive displacement.
 gl_FragDepth=gl_FragCoord.z+displacement;
 color=diagnostic?vec4(vec3(gl_FragDepth),1.):vec4(vec3(black?0.:1.),1.);
}`;
export class Renderer {
 readonly gl:WebGL2RenderingContext; private program:WebGLProgram; private vao:WebGLVertexArrayObject; private buffer:WebGLBuffer; private count=0;
 private locations:Record<string,WebGLUniformLocation|null>={};
 constructor(readonly canvas:HTMLCanvasElement){
  const gl=canvas.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,alpha:false});if(!gl)throw new Error('WebGL2 nicht verfügbar. Bitte einen WebGL2-fähigen Browser verwenden.');this.gl=gl;
  const compile=(kind:number,source:string)=>{const s=gl.createShader(kind)!;gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)??'Shaderfehler');return s;};
  this.program=gl.createProgram()!;const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program)??'Linkfehler');gl.deleteShader(vs);gl.deleteShader(fs);
  this.vao=gl.createVertexArray()!;this.buffer=gl.createBuffer()!;gl.bindVertexArray(this.vao);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);
  for(let i=0;i<4;i++){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,i===3?1:3,gl.FLOAT,false,40,i*12);}
  for(const name of ['viewport','camera','stripWidth','lineWidth','mode','cue','dmax','diagnostic'])this.locations[name]=gl.getUniformLocation(this.program,name);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
 }
 setLines(lines:Line[]){
  const clean=lines.map(l=>l.filter((p,i)=>i===0||p.some((v,a)=>Math.abs(v-l[i-1][a])>1e-10))).filter(l=>l.length>1);
  const segments=clean.reduce((n,l)=>n+l.length-1,0);
  if(segments>600_000)throw new Error("Rendergrenze: maximal 600.000 Segmente");
  const values=new Float32Array(segments*6*10);let offset=0;
  const emit=(line:Line,i:number,side:number)=>{
   values.set(line[i],offset);values.set(line[Math.max(0,i-1)],offset+3);
   values.set(line[Math.min(line.length-1,i+1)],offset+6);values[offset+9]=side;offset+=10;
  };
  for(const line of clean)for(let i=0;i<line.length-1;i++){
   emit(line,i,-1);emit(line,i,1);emit(line,i+1,-1);
   emit(line,i+1,-1);emit(line,i,1);emit(line,i+1,1);
  }
  this.count=values.length/10;const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);
 }
 render(p:Parameters,c:Camera,width?:number,height?:number){
  const gl=this.gl,dpr=Math.min(window.devicePixelRatio||1,2);
  const w=width??Math.max(1,Math.round(this.canvas.clientWidth*dpr)),h=height??Math.max(1,Math.round(this.canvas.clientHeight*dpr));
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}
  gl.viewport(0,0,w,h);gl.clearColor(1,1,1,1);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.bindVertexArray(this.vao);
  const u=this.locations;gl.uniform2f(u.viewport,w,h);gl.uniform3f(u.camera,c.yaw,c.pitch,c.zoom);gl.uniform1f(u.stripWidth,p.stripWidth);gl.uniform1f(u.lineWidth,p.lineWidth);gl.uniform1f(u.dmax,p.dmax);gl.uniform1i(u.mode,['lines','halo','ddh'].indexOf(p.mode));gl.uniform1i(u.cue,p.cue?1:0);gl.uniform1i(u.diagnostic,p.diagnostic?1:0);gl.drawArrays(gl.TRIANGLES,0,this.count);
  if(gl.getError()!==gl.NO_ERROR)throw new Error('WebGL-Fehler beim Rendern');
 }
 pixel(x:number,y:number){const a=new Uint8Array(4);this.gl.readPixels(x,y,1,1,this.gl.RGBA,this.gl.UNSIGNED_BYTE,a);return [...a];}
 backend(){const e=this.gl.getExtension('WEBGL_debug_renderer_info');return {version:this.gl.getParameter(this.gl.VERSION),renderer:e?this.gl.getParameter(e.UNMASKED_RENDERER_WEBGL):this.gl.getParameter(this.gl.RENDERER)};}
}
