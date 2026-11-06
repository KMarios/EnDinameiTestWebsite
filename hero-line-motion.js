/* A continuous SVG mask reveals the untouched original filled artwork. */
(() => {
 const ns='http://www.w3.org/2000/svg',reduced=matchMedia('(prefers-reduced-motion: reduce)'),running=new Set();let serial=0;
 const node=(tag,attrs)=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
 window.initHeroLineDrawing=svg=>{
  for(const entry of running)if(!entry.svg.isConnected)entry.finish();
  if(!svg||svg.dataset.drawReady||reduced.matches)return;
  svg.dataset.drawReady='true';const artwork=svg.querySelector('path');if(!artwork)return;
  const id='hero-draw-'+ ++serial,defs=node('defs',{}),mask=node('mask',{id,maskUnits:'userSpaceOnUse',x:-50,y:-50,width:1852,height:576});
  const brush=node('path',{d:"M10 226 C70 244 140 244 186 232 C342 202 495 30 636 39 C724 28 700 168 712 242 C715 310 719 356 760 399 C839 505 976 446 1057 388 C1115 347 1155 298 1181 267 C1229 211 1252 167 1252 132 C1259 80 1240 11 1200 17 C1126 -2 1113 103 1145 169 C1173 246 1190 290 1252 317 C1395 405 1600 325 1741 264",fill:'none',stroke:'white','stroke-width':76,'stroke-linecap':'round','stroke-linejoin':'round'});
  // The first pass owns only its own ribbon at the self-intersection.
  const clip=node('clipPath',{id:id+'-cross'});clip.append(node('circle',{cx:1187,cy:255,r:80}));
  const guard=node('g',{'clip-path':'url(#'+id+'-cross)'});
  guard.append(node('path',{d:'M1080 150H1300V360H1080Z M1159.31 164.698 C1166.4 189.386 1176.25 212.144 1189.38 232.16 C1210 263 1230 280 1275 303 L1250 333 C1216 310 1199 294 1187.07 278.69 C1180 270 1174 263 1169.62 256.907 C1148 224 1133 193 1125 169Z',fill:'black','fill-rule':'evenodd'}));
  const returnBrush=node('path',{d:'M1252 132 C1252 167 1229 211 1181 267 C1155 298 1115 347 1057 388',fill:'none',stroke:'white','stroke-width':76,'stroke-linecap':'butt'});
  mask.append(brush,guard,returnBrush);defs.append(clip,mask);svg.prepend(defs);let animation,returnAnimation;
  const entry={svg,finish(){artwork.removeAttribute('mask');animation?.cancel();returnAnimation?.cancel();defs.remove();running.delete(entry);}};
  try{
   if(typeof brush.animate!=='function'){defs.remove();return;}
   const length=brush.getTotalLength();brush.setAttribute('stroke-dasharray',length+' '+length);brush.setAttribute('stroke-dashoffset',-length);
   const prefix=node('path',{d:'M10 226 C70 244 140 244 186 232 C342 202 495 30 636 39 C724 28 700 168 712 242 C715 310 719 356 760 399 C839 505 976 446 1057 388 C1115 347 1155 298 1181 267 C1229 211 1252 167 1252 132'});
   const returnLength=returnBrush.getTotalLength(),start=(length-prefix.getTotalLength())/length,end=Math.min(1,start+returnLength/length);
   returnBrush.setAttribute('stroke-dasharray',returnLength+' '+returnLength);returnBrush.setAttribute('stroke-dashoffset',returnLength);
   artwork.setAttribute('mask','url(#'+id+')');running.add(entry);
   returnAnimation=returnBrush.animate([{strokeDashoffset:returnLength,offset:0},{strokeDashoffset:returnLength,offset:start},{strokeDashoffset:0,offset:end},{strokeDashoffset:0,offset:1}],{duration:3000,easing:'cubic-bezier(.5,0,.27,1)',fill:'forwards'});
   animation=brush.animate([{strokeDashoffset:-length},{strokeDashoffset:0}],{duration:3000,easing:'cubic-bezier(.5,0,.27,1)',fill:'forwards'});
   animation.onfinish=()=>entry.finish();
  }catch{entry.finish();}
 };
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const entry of running)entry.finish();});
})();




