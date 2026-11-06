/* Scroll-driven pen masks preserve the exact original Figma artwork. */
(() => {
  const NS='http://www.w3.org/2000/svg';
  const selector='img.hero-line,img.home-line,img.card-line,img.play-line,img.step-line,img.assessment-line,img.assessment-line-extra,img.footer-line,img.article-decoration';
  const cache=new Map(), motion=matchMedia('(prefers-reduced-motion: reduce)');
  let lines=[], frame=0, sequence=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  function paint(){
    frame=0;let moving=false;const vh=innerHeight;
    lines=lines.filter(line=>line.svg.isConnected);
    for(const line of lines){
      const box=line.section.getBoundingClientRect();
      const target=motion.matches?1:line.opening?clamp(.12-box.top/Math.max(1,box.height*.68)):clamp((vh*.94-box.top)/(vh*.76));
      line.progress+=(target-line.progress)*.16;
      if(Math.abs(target-line.progress)<.001)line.progress=target;else moving=true;
      for(const stroke of line.strokes){
        const p=clamp((line.progress*line.total-stroke.start)/stroke.length);
        stroke.path.style.strokeDashoffset=String(stroke.length*(1-p));
        stroke.path.style.visibility=p>.001?'visible':'hidden';
      }
      if(line.progress>.999)line.art.removeAttribute('mask');else line.art.setAttribute('mask',`url(#${line.maskId})`);
      line.svg.dataset.drawProgress=line.progress.toFixed(3);
    }
    if(moving)schedule();
  }
  async function prepare(img){
    if(img.dataset.inkPrepared||motion.matches)return;
    img.dataset.inkPrepared='true';
    try{
      if(!cache.has(img.src))cache.set(img.src,fetch(img.src).then(r=>{if(!r.ok)throw Error('Line unavailable');return r.text();}));
      const text=await cache.get(img.src);if(!img.isConnected)return;
      const parsed=new DOMParser().parseFromString(text,'image/svg+xml');
      if(parsed.querySelector('parsererror'))throw Error('Invalid line');
      const svg=document.importNode(parsed.documentElement,true), paths=[...svg.querySelectorAll('path')];
      if(!paths.length)return;
      svg.setAttribute('class',img.className+' ink-line');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.style.pointerEvents='none';
      const maskId=`scroll-ink-${++sequence}`,defs=document.createElementNS(NS,'defs'),mask=document.createElementNS(NS,'mask');
      mask.id=maskId;mask.setAttribute('maskUnits','userSpaceOnUse');
      const view=svg.viewBox.baseVal;
      for(const [key,value] of Object.entries({x:view.x-100,y:view.y-100,width:view.width+200,height:view.height+200}))mask.setAttribute(key,String(value));
      mask.setAttribute('style','mask-type:luminance');
      const art=document.createElementNS(NS,'g');while(svg.firstChild)art.append(svg.firstChild);svg.append(defs,art);defs.append(mask);
      const strokes=[];let total=0;
      for(const original of paths){
        const pen=document.createElementNS(NS,'path');pen.setAttribute('d',original.getAttribute('d'));
        if(original.hasAttribute('transform'))pen.setAttribute('transform',original.getAttribute('transform'));
        for(const [key,value] of Object.entries({fill:'none',stroke:'white','stroke-width':Math.max(36,view.height*.13),'stroke-linecap':'round','stroke-linejoin':'round'}))pen.setAttribute(key,String(value));
        mask.append(pen);const length=pen.getTotalLength();pen.style.strokeDasharray=`${length} ${length}`;pen.style.strokeDashoffset=String(length);pen.style.visibility='hidden';
        strokes.push({path:pen,length,start:total});total+=length;
      }
      art.setAttribute('mask',`url(#${maskId})`);
      const section=img.closest('section,footer')||img.parentElement;
      const opening=['page-hero','home-hero','article-hero'].some(c=>section.classList.contains(c));
      img.replaceWith(svg);lines.push({svg,section,opening,strokes,total,art,maskId,progress:0});schedule();
    }catch{delete img.dataset.inkPrepared;}
  }
  function scan(){document.querySelectorAll(selector).forEach(prepare);schedule();}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',()=>{scan();schedule();});
  new MutationObserver(scan).observe(document.querySelector('#main'),{childList:true});scan();
})();
