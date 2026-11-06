import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
class Target {
  constructor() { this.events=new Map(); this.attrs={}; this.style={}; }
  addEventListener(name,handler) { this.events.set(name,[...(this.events.get(name)||[]),handler]); }
  emit(name,event={}) { for(const handler of this.events.get(name)||[]) handler(event); }
  setAttribute(name,value) { this.attrs[name]=value; }
  getAttribute(name) { return this.attrs[name]??null; }
}
function fixture({reduced=false,reject=false,defer=false,noObserver=false}={}) {
  const document=new Target(),window=new Target(),motion=new Target();
  document.hidden=false; motion.matches=reduced; window.matchMedia=()=>motion;
  const stage=new Target(),mini=new Target(),lock=new Target(),play=new Target(),video=new Target(),timeline=new Target();
  const classes=new Set(); mini.classList={toggle(name,value){const next=value??!classes.has(name);if(next)classes.add(name);else classes.delete(name);return next;}};
  mini.querySelector=()=>timeline; mini.offsetWidth=216;mini.offsetHeight=145;mini.offsetLeft=20;mini.offsetTop=20;stage.clientWidth=640;stage.clientHeight=360;
  video.dataset={src:'./assets/gameplay/film-preview.mp4'};video.paused=true;video.loadCalls=video.playCalls=0;video.pending=[];
  Object.defineProperty(video,'src',{get:()=>video.getAttribute('src'),set:value=>video.setAttribute('src',value)});
  video.load=()=>{video.loadCalls++;video.paused=true;};video.pause=()=>{video.paused=true;};
  video.play=()=>{video.playCalls++;if(reject)return Promise.reject(new Error('Denied'));video.paused=false;return defer?new Promise(resolve=>video.pending.push(()=>{video.paused=false;resolve();})):Promise.resolve();};
  const nodes={'#demo-stage':stage,'#mini-demo':mini,'#demo-lock':lock,'#demo-play':play,'#mini-preview':video};
  document.querySelector=selector=>nodes[selector]||null;document.querySelectorAll=()=>[];
  let observer;if(!noObserver)window.IntersectionObserver=class{constructor(callback){this.callback=callback;observer=this;}observe(){}disconnect(){}};
  vm.runInNewContext(source,{document,window,URL,location:{href:'https://example.test/'},fetch:async()=>({ok:false}),setTimeout,clearTimeout});
  return {document,window,motion,mini,play,video,timeline,classes,intersect:value=>observer.callback([{isIntersecting:value}]),allow:()=>{reject=false;},resolve:()=>video.pending.shift()()};
}
const settle=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
const checks=[];
async function check(name,action){await action();checks.push({name,pass:true});}
await check('Film stays unloaded offscreen and plays muted only when visible',async()=>{
  const f=fixture();assert.equal(f.video.loadCalls,0);f.intersect(true);await settle();assert.equal(f.video.loadCalls,1);assert.equal(f.video.paused,false);assert.equal(f.video.muted,true);assert.equal(f.video.loop,true);assert.equal(f.video.playsInline,true);
  f.play.emit('click');assert.equal(f.video.paused,true);f.play.emit('click');await settle();assert.equal(f.video.paused,false);assert.equal(f.video.loadCalls,1);
});
await check('Hidden tabs, offscreen movement and page exit pause without changing user intent',async()=>{
  const f=fixture();f.intersect(true);await settle();f.document.hidden=true;f.document.emit('visibilitychange');assert.equal(f.video.paused,true);
  f.document.hidden=false;f.document.emit('visibilitychange');await settle();assert.equal(f.video.paused,false);f.intersect(false);assert.equal(f.video.paused,true);
  f.intersect(true);await settle();f.window.emit('pagehide');assert.equal(f.video.paused,true);f.window.emit('pageshow');assert.equal(f.video.paused,true);f.intersect(true);await settle();assert.equal(f.video.paused,false);
});
await check('Reduced motion keeps the poster until an explicit Play gesture',async()=>{
  const f=fixture({reduced:true});f.intersect(true);assert.equal(f.video.loadCalls,0);f.play.emit('click');await settle();assert.equal(f.video.paused,false);
  f.motion.emit('change',{matches:true});assert.equal(f.video.paused,true);f.motion.emit('change',{matches:false});assert.equal(f.video.paused,true);
});
await check('Autoplay rejection retains a poster and manual Play can retry',async()=>{
  const f=fixture({reject:true});f.intersect(true);await settle();assert.equal(f.video.paused,true);assert.equal(f.play.getAttribute('aria-label'),'Play film preview');
  f.allow();f.play.emit('click');await settle();assert.equal(f.video.paused,false);
});
await check('A late Play promise cannot restart a manually paused film',async()=>{
  const f=fixture({defer:true});f.intersect(true);f.play.emit('click');assert.equal(f.video.paused,true);f.resolve();await settle();assert.equal(f.video.paused,true);
});
await check('Decode failure offers retry and the progress bar follows actual media time',async()=>{
  const f=fixture();f.intersect(true);await settle();f.video.duration=12;f.video.currentTime=6;f.video.emit('timeupdate');assert.equal(f.timeline.style.width,'50%');
  f.video.emit('error');assert.equal(f.video.paused,true);assert.equal(f.play.getAttribute('aria-label'),'Retry film preview');f.play.emit('click');await settle();assert.equal(f.video.paused,false);
  const g=fixture({noObserver:true});await settle();assert.equal(g.video.paused,false);
});
console.log(`Film preview checks: ${checks.length}/${checks.length} passed.`);
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({pass:true,finishedAtUtc:new Date().toISOString(),checks},null,2));
