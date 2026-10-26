import test from 'node:test';
import assert from 'node:assert/strict';
import {haloWidth,crossing,normalize,bundle} from '../src/model.ts';
test('visibility oracle has onset, linear middle and saturated width',()=>{
 assert.equal(haloWidth(.001,4,28,.12),0);
 assert.equal(haloWidth(.06,4,28,.12),5);
 assert.equal(haloWidth(.24,4,28,.12),12);
 assert.throws(()=>haloWidth(.1,4,4,.12));
});
test('crossing geometry delta is window depth difference, with swapped roles',()=>{
 for(const delta of [-.2,0,.06,.2]){const d=crossing(delta);assert.equal((d.lines[1][0][2]-d.lines[0][0][2])/4,delta);}
});
test('normalization preserves aspect and deterministic synthetic scenes',()=>{
 assert.deepEqual(normalize([[[1,2,3],[3,3,3]]]),[[[-.85,-.425,0],[.85,.425,0]]]);assert.throws(()=>normalize([[[0,0,0]]]));assert.deepEqual(bundle(),bundle());
});
