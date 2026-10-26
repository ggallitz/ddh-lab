import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('seminar flow, shared camera, reset, resize and PNG',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const consoleErrors:string[]=[];page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.setViewportSize({width:1280,height:720});await page.goto('/?test=1');await page.waitForFunction(()=>!!(window as any).labTest);
 const state=()=>page.evaluate(()=>(window as any).labTest.state());
 const initial=await state();
 await page.locator('#delta').fill('0.12');await expect(page.locator('#delta-value')).toHaveText('0.120');
 await page.getByRole('button',{name:'Vergleichen',exact:true}).click();
 await expect(page.locator('#scene-title')).toHaveText('Wellenbündel');
 await page.getByRole('button',{name:'Schrägansicht',exact:true}).click();
 const before=await state();
 for(const mode of ['lines','halo','ddh']){await page.locator(`input[name=mode][value=${mode}]`).check();const after=await state();expect(after.camera).toEqual(before.camera);expect(after.datasetId).toEqual(before.datasetId);expect(after.params.lineWidth).toEqual(before.params.lineWidth);}
 await page.locator('#cue').check();await expect(page.locator('#method-title')).toContainText('Depth Cueing');await page.locator('#cue').uncheck();
 await page.getByRole('button',{name:'Grenzen',exact:true}).click();await expect(page.locator('#scene-title')).toHaveText('Verdecktes Bündel');await page.getByRole('button',{name:'Schrägansicht',exact:true}).click();
 await page.getByRole('button',{name:'Exakt gleiche Tiefe',exact:true}).click();await expect(page.locator('#delta-value')).toHaveText('0.000');
 await page.getByRole('button',{name:'Zurücksetzen',exact:true}).click();expect(await state()).toEqual(initial);
 for(const [width,height] of [[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(100);
  const dimensions=await page.locator('#scene').evaluate((c:HTMLCanvasElement)=>({width:c.width,height:c.height,rect:{width:c.clientWidth,height:c.clientHeight}}));expect(dimensions.width/dimensions.height).toBeCloseTo(dimensions.rect.width/dimensions.rect.height,2);
  expect(await page.locator('input[name=mode][value=ddh]').boundingBox()).toMatchObject({});
  const control=await page.locator('#diagnostic').boundingBox();expect(control!.y+control!.height).toBeLessThan(height);
  await page.screenshot({path:`.artifacts/app-${width}.png`});
 }
 const downloadEvent=page.waitForEvent('download');await page.getByRole('button',{name:'PNG exportieren'}).click();const download=await downloadEvent;
 expect(download.suggestedFilename()).toBe('ddh-crossing-ddh.png');const path=await download.path();const png=await readFile(path!);expect(png.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');expect(png.readUInt32BE(16)).toBeGreaterThan(500);expect(png.readUInt32BE(20)).toBeGreaterThan(200);
 await page.reload();await page.waitForFunction(()=>!!(window as any).labTest);expect(await state()).toEqual(initial);expect(errors).toEqual([]);expect(consoleErrors).toEqual([]);
});
test('complete original datasets load, render and report exact counts',async({page})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/?test=1');await expect(page.locator('#dataset option[value=office]')).toHaveCount(1);
 for(const [id,points,lines] of [['knot','752','1'],['office','278.849','786'],['fibers','548.013','17.176']] as const){
  const start=Date.now();await page.locator('#dataset').selectOption(id);await expect(page.locator('#caption')).toContainText(points,{timeout:60000});await expect(page.locator('#caption')).toContainText(`${lines} Linien`);
  const pixels=await page.locator('#scene').evaluate((c:HTMLCanvasElement)=>{const gl=c.getContext('webgl2')!;const p=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,p);let black=0;for(let i=0;i<p.length;i+=4)if(p[i]<128)black++;return black;});expect(pixels).toBeGreaterThan(50);console.log(`${id}: rendered complete data in ${Date.now()-start}ms; black pixels ${pixels}`);await page.screenshot({path:`.artifacts/data-${id}.png`});
 }
 expect(errors).toEqual([]);
});
test('local import rejects declared point clouds and malformed SOP',async({page})=>{
 await page.goto('/');await page.locator('summary').filter({hasText:'Lokale SOP-Linien laden'}).click();
 await page.locator('#import-type').selectOption('points');await page.locator('#file').setInputFiles({name:'points.sop',mimeType:'application/octet-stream',buffer:Buffer.alloc(35)});await expect(page.locator('#status')).toContainText('Punktwolken');
 await page.locator('#import-type').selectOption('lines');await page.locator('#file').setInputFiles({name:'bad.sop',mimeType:'application/octet-stream',buffer:Buffer.alloc(12)});await expect(page.locator('#status')).toContainText('Unvollständiger');await expect(page.locator('#scene-title')).toHaveText('Zwei Linien');
 await page.locator('#file').setInputFiles('public/data/local/knot.sop');await expect(page.locator('#scene-title')).toHaveText('knot.sop');
 await page.locator('#dataset').selectOption('bundle');await expect(page.locator('#scene-title')).toHaveText('Wellenbündel');
 await page.locator('#dataset').selectOption('import');await expect(page.locator('#scene-title')).toHaveText('knot.sop');await expect(page.locator('#status')).toBeEmpty();
});
