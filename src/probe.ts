import {Renderer} from './renderer.ts';
import {crossing,defaults,cameraDefault} from './model.ts';
const renderer=new Renderer(document.querySelector('canvas')!);
renderer.setLines(crossing().lines);renderer.render(defaults,cameraDefault(),512,512);
Object.assign(window,{labTest:{renderer,crossing,defaults,cameraDefault}});
