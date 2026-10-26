import {test,expect} from '@playwright/test';
test('orthographic DDH transitions against independent visibility positions',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/probe.html');expect(errors).toEqual([]);await page.waitForFunction(()=>!!(window as any).labTest);
 const result=await page.evaluate(()=>{
  const {renderer:r,crossing,defaults,cameraDefault}=(window as any).labTest;
  const outcomes:any[]=[];
  // Sampling vertical black line above horizontal foreground. Pixel centres
  // lie at radius y+.5. Near/onset: .5px from black edge; middle/saturation: ≥1.5px from predicted boundary. No boundary-centre samples.
  for(const [mode,delta,boundary] of [['ddh',.001,2],['ddh',.06,7],['ddh',.2,14],['halo',.001,14],['halo',.06,14],['lines',.06,2]] as const){
   r.setLines(crossing(delta).lines);r.render({...defaults,mode},cameraDefault(),512,512);
   const white=r.pixel(256,256+Math.max(0,boundary-2))[0];
   const black=r.pixel(256,256+(boundary===2?2:boundary+2))[0];outcomes.push({mode,delta,boundary,white,black});
  }
  r.setLines(crossing(.06).lines);r.render({...defaults,diagnostic:true},cameraDefault(),512,512);
  const diagnostic=[r.pixel(256,256)[0],r.pixel(256,261)[0]];
  // Swap depths: horizontal is now back, vertical in front.
  r.setLines(crossing(-.06).lines);r.render(defaults,cameraDefault(),512,512);
  const swap=[r.pixel(261,256)[0],r.pixel(256,261)[0]];
  // Explicit exact equality records the draw-order tie, separate from near case.
  r.setLines(crossing(0).lines);r.render(defaults,cameraDefault(),512,512);
  const tie=r.pixel(256,261)[0];
  return {outcomes,swap,tie,diagnostic,backend:r.backend()};
 });
 console.log(JSON.stringify(result));
 for(const o of result.outcomes){if(o.boundary!==2 && !(o.mode==='lines'||o.delta===.001&&o.mode==='ddh'))expect(o.white).toBe(255);expect(o.black).toBe(0);}
 expect(result.diagnostic[0]).toBeCloseTo(120,0);expect(result.diagnostic[1]).toBeCloseTo(132,0);
 expect(result.swap).toEqual([255,0]);expect(result.tie).toBe(0);expect(errors).toEqual([]);
 await page.screenshot({path:'.artifacts/core.png'});
});
test('degenerate geometry, cueing and exact-depth ties are explicit',async({page})=>{
 await page.goto('/probe.html');
 const result=await page.evaluate(()=>{
  const {renderer:r,crossing,defaults,cameraDefault}=(window as any).labTest;
  const row=()=>{let n=0;for(let y=0;y<512;y++)if(r.pixel(256,y)[0]===0)n++;return n;};
  r.setLines([[],[[0,0,0]],[[0,0,0],[0,0,0]],[[0,0,-.7],[0,0,.7]]]);r.render(defaults,cameraDefault(),512,512);const degenerate=row();
  r.setLines([[[-.8,0,1],[.8,0,1]]]);r.render({...defaults,mode:'lines',lineWidth:10,cue:false},cameraDefault(),512,512);const plain=row();r.render({...defaults,mode:'lines',lineWidth:10,cue:true},cameraDefault(),512,512);const cued=row();
  const lines=crossing(0).lines;r.setLines(lines);r.render({...defaults,mode:'halo'},cameraDefault(),512,512);const first=r.pixel(256,261)[0];r.setLines([...lines].reverse());r.render({...defaults,mode:'halo'},cameraDefault(),512,512);const reversed=r.pixel(256,261)[0];
  return {degenerate,plain,cued,first,reversed};
 });
 expect(result.degenerate).toBe(0);expect(result.plain).toBe(10);expect(result.cued).toBeLessThan(result.plain);expect([result.first,result.reversed]).toEqual([255,0]);
});
