/* Section-triggered SVG drawing; retain the original filled artwork and geometry. */
(() => {
 const ns='http://www.w3.org/2000/svg', reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cache=new Map(), active=new Set(); let serial=0;
 const make=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n};
 async function prepare(img){
  if(img.dataset.sectionDrawing||reduced.matches)return;
  img.dataset.sectionDrawing='true';
  try{
   if(!cache.has(img.src))cache.set(img.src,fetch(img.src).then(r=>{if(!r.ok)throw Error('Line unavailable');return r.text()}));
   const source=await cache.get(img.src);if(!img.isConnected)return;
   const parsed=new DOMParser().parseFromString(source,'image/svg+xml');if(parsed.querySelector('parsererror'))return;
   const svg=document.importNode(parsed.documentElement,true);
   for(const attr of img.attributes)if(!['src','loading','decoding','alt'].includes(attr.name))svg.setAttribute(attr.name,attr.value);
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   const artwork=make('g');while(svg.firstChild)artwork.append(svg.firstChild);
   const defs=make('defs'),id='section-draw-'+ ++serial,view=svg.viewBox.baseVal;
   const mask=make('mask',{id,maskUnits:'userSpaceOnUse',x:view.x-100,y:view.y-100,width:view.width+200,height:view.height+200});
   mask.style.maskType='luminance';defs.append(mask);svg.append(defs,artwork);
   const strokes=[];let total=0;
   // A single centerline brush follows the ribbon, exactly as in the hero.
   // Both Figma assets share the same shape at different native scales.
   const pen=make('path',{d:'M10 613 C120 405 255 250 395 240 C470 236 529 296 531 350 C536 408 481 488 417 486 C340 490 330 414 380 377 C420 344 480 330 531 345 C600 360 656 406 716 424 C820 465 913 428 978 282 C1010 205 1015 95 945 42 C895 -3 817 5 787 52 C727 140 827 245 978 282 C1140 314 1330 266 1470 168',fill:'none',stroke:'white','stroke-width':64,'stroke-linecap':'round','stroke-linejoin':'round',transform:'scale('+(view.width/1474.93)+' '+(view.height/629.008)+')'});
   mask.append(pen);const length=pen.getTotalLength();pen.setAttribute('stroke-dasharray',length+' '+length);pen.setAttribute('stroke-dashoffset',-length);strokes.push({pen,length,start:0});total=length;
   // Keep each crossing on its current ribbon until the returning pass arrives.
   const transform=pen.getAttribute('transform');
   const crossings=[
    {cx:978,cy:282,r:70,hole:"M777.249 173.936 C816.859 236.368 887.367 270.229 958.785 287.942 L962.829 288.931 L990.643 294.59 L1100 310 L1100 277 L1080.61 276.138 C1049.27 275.437 1030.72 272.913 1000.43 269.368 L972.774 263.802 C959.261 260.663 944.019 256.733 931.047 252.132 C861.556 229.153 781.675 175.042 783.678 97.551 Z",prefix:'M10 613 C120 405 255 250 395 240 C470 236 529 296 531 350 C536 408 481 488 417 486 C340 490 330 414 380 377 C420 344 480 330 531 345 C600 360 656 406 716 424 C820 465 913 428 978 282',d:'M1003 215 C998 245 989 265 978 282 C964 317 942 350 915 376'},
    {cx:531,cy:350,r:64,hole:"M371.251 363.046 C410.878 328.81 459.75 322.682 510.877 328.394 L541.764 335.236 C551.453 337.106 569.643 343.811 579.031 347.435 L620 364 L610 389 L545.161 364.118 L516.894 356.603 C505.576 354.561 476.626 351.329 465.338 353.454 C432.695 356.754 404.094 366.821 382.431 391.414 Z",prefix:'M10 613 C120 405 255 250 395 240 C470 236 529 296 531 350',d:'M508 419 C526 395 535 371 531 350 C529 323 516 292 499 276'}
   ];
   const returns=[];
   for(const [i,c] of crossings.entries()){
    const clip=make('clipPath',{id:id+'-cross-'+i,clipPathUnits:'userSpaceOnUse'});clip.append(make('circle',{cx:c.cx,cy:c.cy,r:c.r,transform}));defs.append(clip);
    const guard=make('g',{'clip-path':'url(#'+id+'-cross-'+i+')'});
    guard.append(make('path',{d:'M'+(c.cx-100)+' '+(c.cy-100)+'h200v200h-200Z '+c.hole,fill:'black','fill-rule':'evenodd',transform}));mask.append(guard);
    const brush=make('path',{d:c.d,fill:'none',stroke:'white','stroke-width':64,'stroke-linecap':'butt',transform});const returnClip=make('clipPath',{id:id+'-return-'+i,clipPathUnits:'userSpaceOnUse'});returnClip.append(make('circle',{cx:c.cx,cy:c.cy,r:c.r+1.5,transform}));defs.append(returnClip);
    const returnLayer=make('g',{'clip-path':'url(#'+id+'-return-'+i+')'});returnLayer.append(brush);mask.append(returnLayer);
    const len=brush.getTotalLength(),prefix=make('path',{d:c.prefix}).getTotalLength();brush.setAttribute('stroke-dasharray',len+' '+len);brush.setAttribute('stroke-dashoffset',len);
    const center=(total-prefix)/total;returns.push({brush,len,start:Math.max(0,center-65/total),end:Math.min(1,center+(len-65)/total)});
   }
   if(!total)return;
   const section=img.closest('section,footer');img.replaceWith(svg);
   let animations=[],observer;
   const finish=()=>{artwork.removeAttribute('mask');for(const a of animations)a.cancel();defs.remove();observer?.disconnect();active.delete(finish)};
   const play=()=>{observer?.disconnect();active.add(finish);for(const r of returns){animations.push(r.brush.animate([{strokeDashoffset:r.len,offset:0},{strokeDashoffset:r.len,offset:r.start},{strokeDashoffset:0,offset:r.end},{strokeDashoffset:0,offset:1}],{duration:3000,easing:'cubic-bezier(.5,0,.27,1)',fill:'forwards'}))}for(const s of strokes){const start=s.start/total,end=(s.start+s.length)/total;const frames=[{strokeDashoffset:-s.length,offset:0}];if(start>0)frames.push({strokeDashoffset:-s.length,offset:start});frames.push({strokeDashoffset:0,offset:end});if(end<1)frames.push({strokeDashoffset:0,offset:1});const a=s.pen.animate(frames,{duration:3000,easing:'cubic-bezier(.5,0,.27,1)',fill:'forwards'});animations.push(a)}Promise.all(animations.map(a=>a.finished)).then(finish,finish)};
   if(reduced.matches||!svg.animate)return;
   active.add(finish);artwork.setAttribute('mask','url(#'+id+')');
   observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))play()},{threshold:.12});observer.observe(section||svg);
  }catch{delete img.dataset.sectionDrawing}
 }
 const scan=()=>document.querySelectorAll('img.step-line,img.footer-line').forEach(prepare);
 new MutationObserver(scan).observe(document.querySelector('#main'),{childList:true});scan();
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const finish of [...active])finish();else scan()});
})();
