/* The bounds, mirroring, skew and rotation below come directly from Figma. */
(() => {
  const geometry=window.LINE_GEOMETRY, observers=new Set();
  const selector='img.hero-line,img.home-line,img.card-line,img.play-line,img.step-line,img.assessment-line,img.assessment-line-extra,img.footer-line,img.article-decoration,svg.home-line';
  function scan(){
    for(const observer of observers)if(!observer.slot.isConnected){observer.disconnect();observers.delete(observer);}
    document.querySelectorAll('.assessment').forEach(section=>{
      if(!section.querySelector('.assessment-line-extra')){
        const img=document.createElement('img');img.src='assets/88634.svg';img.alt='';img.className='assessment-line-extra';section.prepend(img);
      }
    });
    document.querySelectorAll(selector).forEach(img=>{
      img.loading='eager';
      if(img.closest('.figma-line-slot'))return;
      let spec;
      if(img.classList.contains('hero-line'))spec=location.hash==='#/articles'?geometry.articles:geometry.hero;
      else spec=Object.values(geometry).find(s=>img.dataset.lineAsset===s.filename||img.getAttribute('src')?.endsWith('/'+s.filename));
      if(!spec)return;
      if(img.closest('.assessment--figma')&&img.classList.contains('assessment-line-extra'))spec={...spec,skew:2.82};
      if(img.tagName.toLowerCase()==='img'&&!img.src.endsWith('/'+spec.filename))img.src='assets/'+spec.filename;
      const slot=document.createElement('div'),rotator=document.createElement('div'),scale=document.createElement('div');
      slot.className='figma-line-slot';slot.setAttribute('aria-hidden','true');slot.style.inset=spec.inset.join(' ');
      slot.style.setProperty('--asset-w',spec.natural[0]+'px');slot.style.setProperty('--asset-h',spec.natural[1]+'px');
      rotator.className='figma-line-rotation';rotator.style.transform=`rotate(${spec.angle}deg) skewX(${spec.skew}deg) scaleX(${spec.flip})`;
      scale.className='figma-line-scale';
      img.classList.add('figma-line-art');img.replaceWith(slot);slot.append(rotator);rotator.append(scale);scale.append(img);
      const resize=()=>{
        const width=slot.clientWidth,height=slot.clientHeight;
        const w=Math.hypot(spec.w[0]*width/100,spec.w[1]*height/100),h=Math.hypot(spec.h[0]*width/100,spec.h[1]*height/100);
        rotator.style.width=w+'px';rotator.style.height=h+'px';scale.style.transform=`scale(${w/spec.natural[0]},${h/spec.natural[1]})`;
      };
      const observer=new ResizeObserver(resize);observer.slot=slot;observer.observe(slot);observers.add(observer);resize();
    });
  }
  new MutationObserver(scan).observe(document.querySelector('#main'),{childList:true});scan();
})();
