import {test,expect} from '@playwright/test';
import {existsSync,readFileSync} from 'node:fs';

// Source: Everts et al. (2009), accompanying DepthDependentHalos.zip.
// Read the preserved local original; never overwrite or execute upstream hosts.
const sourcePath='references/upstream/demo/illuvis-program/linux/shaders/fragmentshader-lines.glsl';
test('original shader displacement kernel agrees with analytical-profile visibility',async({page})=>{
 test.skip(!existsSync(sourcePath),'Fetch the verified original references to run this comparison.');
 const original=readFileSync(sourcePath,'utf8');
 // Only texture-based appearance is replaced: hard black width L=4 within S=28,
 // no end mask. This verifies the ORIGINAL depth/color kernel, not pixel identity
 // to the historical demo textures or its unknown host uniform conventions.
 const stroke=/float getStroke\(float x, float y, float width\)\s*\{[^}]*\}/;
 const mask=/float stripMask = \(texture2D\(stripMaskTexture,gl_TexCoord\[0\]\.xy\)\)\.x;/;
 expect(original).toMatch(stroke);expect(original).toMatch(mask);
 const fragment='#version 300 es\nprecision highp float;\nin vec2 uv;\nout vec4 outputColor;\n'+original
  .replace(stroke,'float getStroke(float x, float y, float width) { return x <= 4.0/28.0 ? 0.0 : 1.0; }')
  .replace(mask,'float stripMask = 1.0;')
  .replaceAll('gl_TexCoord[0]','uv').replaceAll('uv.xy','uv')
  .replaceAll('gl_FragColor','outputColor');
 await page.goto('/probe.html');
 const result=await page.evaluate((source)=>{
  const canvas=document.createElement('canvas');canvas.width=28;canvas.height=28;
  const gl=canvas.getContext('webgl2',{antialias:false,alpha:false})!;
  if(!gl)throw new Error('WebGL2 unavailable');
  const vertex=`#version 300 es
  precision highp float;
  layout(location=0) in vec2 position;
  uniform float depth;
  out vec2 uv;
  void main(){uv=position*.5+.5;gl_Position=vec4(position,depth*2.-1.,1.);}`;
  function program(fs:string){
   const p=gl.createProgram()!;
   for(const [kind,text] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fs]] as const){
    const s=gl.createShader(kind)!;gl.shaderSource(s,text);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)??'compile');
    gl.attachShader(p,s);
   }
   gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)??'link');return p;
  }
  const front=program(source),back=program('#version 300 es\nprecision highp float;\nout vec4 color;void main(){color=vec4(0.,0.,0.,1.);}');
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  gl.viewport(0,0,28,28);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);
  function draw(p:WebGLProgram,z:number,dmax=0){
   gl.useProgram(p);gl.uniform1f(gl.getUniformLocation(p,'depth'),z);
   gl.uniform1f(gl.getUniformLocation(p,'stripDepth'),dmax);
   gl.uniform1f(gl.getUniformLocation(p,'strokeDepthInfluence'),0);
   gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function sample(frontZ:number,backZ:number,dmax:number,reverse=false){
   gl.clearColor(1,1,1,1);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
   if(reverse){draw(back,backZ);draw(front,frontZ,dmax);}else{draw(front,frontZ,dmax);draw(back,backZ);}
   return [14,19,23].map(y=>{const pixel=new Uint8Array(4);gl.readPixels(14,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);return pixel[0];});
  }
  // At radius .5, 5.5, 9.5 pixels: center black unchanged; Δz=.06
  // intersects the sloping depth at r=7, independently from rasterization.
  const normal=sample(.47,.53,.12),reversedDraw=sample(.47,.53,.12,true);
  const traditional=sample(.47,.53,0),swapped=sample(.53,.47,.12);
  const error=gl.getError();return {normal,reversedDraw,traditional,swapped,error};
 },fragment);
 expect(result.normal).toEqual([0,255,0]);
 expect(result.reversedDraw).toEqual(result.normal);
 expect(result.traditional).toEqual([0,255,255]);
 expect(result.swapped).toEqual([0,0,0]);expect(result.error).toBe(0);
});
