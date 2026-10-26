import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {readSop} from '../src/sop.ts';

function fixture(counts=[2], attrs=0) {
  const buffer=new ArrayBuffer(35+counts.reduce((n,c)=>n+4+c*(3+attrs)*4,0));
  const d=new DataView(buffer);d.setUint32(4,14600958,true);d.setUint32(8,3,true);d.setUint8(12,1);
  d.setUint32(16,counts.length,true);d.setUint32(20,35,true);d.setUint32(24,attrs,true);d.setUint32(28,4,true);
  let off=35;
  for(const count of counts){d.setUint32(off,count,true);off+=4;for(let i=0;i<count*3;i++){d.setFloat32(off,i-1,true);off+=4;}for(let i=0;i<count*attrs;i++){d.setFloat32(off,1234,true);off+=4;}}
  return buffer;
}
const arrayBuffer=(b:Buffer)=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength) as ArrayBuffer;

test('SOP reads unaligned dataStart and sequence-local attributes without treating them as positions',()=>{
  const result=readSop(fixture([2,1,0],1));
  assert.equal(result.sequenceCount,3);assert.equal(result.pointCount,3);assert.equal(result.attributeCount,1);
  assert.deepEqual(result.lines,[[[-1,0,1],[2,3,4]],[[-1,0,1]],[]]);
  assert.deepEqual(result.bounds,{min:[-1,0,1],max:[2,3,4]});
});
test('SOP preserves repeated positions and supports empty files without invalid bounds',()=>{
  assert.deepEqual(readSop(fixture([])).bounds,null);
  const b=fixture(),d=new DataView(b);for(let i=0;i<6;i++)d.setFloat32(39+i*4,1,true);
  assert.equal(readSop(b).lines[0].length,2);
});
test('SOP rejects unsupported header variants and dangerous lengths',()=>{
  for(const [offset,value] of [[0,1],[1,1],[4,0],[8,2],[12,2],[16,0xffffffff],[20,0],[20,0xffffffff],[24,65],[28,8],[35,0xffffffff]]) {
    const b=fixture(),d=new DataView(b);if([0,1,12].includes(offset))d.setUint8(offset,value);else d.setUint32(offset,value,true);
    assert.throws(()=>readSop(b),undefined,`offset ${offset}`);
  }
  assert.throws(()=>readSop(new ArrayBuffer(31)));
  assert.throws(()=>readSop(fixture(),'points'),/Punktwolken/);
});
test('SOP rejects truncation, trailing bytes and nonfinite positions or attributes',()=>{
  const b=fixture([2],1);
  assert.throws(()=>readSop(b.slice(0,-1)),/Unvollständige/);
  assert.throws(()=>readSop(new Uint8Array([...new Uint8Array(b),0]).buffer),/Unerwartete/);
  for(const offset of [39,63]){const corrupt=b.slice(0);new DataView(corrupt).setFloat32(offset,NaN,true);assert.throws(()=>readSop(corrupt),/endliche/);}
});
const inventory=JSON.parse(readFileSync(new URL('../references/inspection-2026-10-26.json',import.meta.url),'utf8'));
for(const entry of inventory.datasets){
  const file=new URL('../references/upstream/demo/'+entry.path,import.meta.url);
  test(`original ${entry.name}: counts, bounds and attributes against independent Python inventory`,{skip:!existsSync(file)?'Original references not downloaded':false},()=>{
    const b=arrayBuffer(readFileSync(file));
    if(entry.data_type==='points'){assert.throws(()=>readSop(b,'points'),/Punktwolken/);return;}
    const result=readSop(b);
    assert.equal(result.sequenceCount,entry.sequence_count);assert.equal(result.pointCount,entry.point_count);
    assert.deepEqual(result.bounds,entry.bounds);assert.equal(result.attributeCount,entry.header.numAttributes);
    assert.equal(result.lines.reduce((n,l)=>n+Math.max(l.length-1,0),0),entry.segment_count);
  });
}
test('browser point budget is enforced before expanding coordinates',()=>{
  assert.throws(()=>readSop(fixture([3]),'lines',2),/Punktlimit/);
  assert.throws(()=>readSop(fixture(),'lines',0),/Punktlimit/);
});
