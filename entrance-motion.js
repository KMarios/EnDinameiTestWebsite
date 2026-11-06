/* One-shot, section-triggered entrances. Content stays visible if JS fails. */
(() => {
 let observer,events;
 const playing=new Map();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function stop(){observer?.disconnect();events?.abort();for(const animation of playing.values())animation.cancel();playing.clear();}
 function prepare(element){
  if(!element.isConnected||reduced.matches||typeof element.animate!=='function')return;
  const media=element.matches('img,.story-media,.portrait-strip');
  const frames=media?[{opacity:0},{opacity:1}]:[{opacity:0,translate:'0 32px'},{opacity:1,translate:'0 0'}];
  const animation=element.animate(frames,{duration:media?850:760,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  animation.pause();animation.currentTime=0;
  playing.set(element,animation);
  animation.finished.then(()=>{if(playing.get(element)===animation){playing.delete(element);animation.cancel();}},()=>{});
 }
 window.initEntranceMotion=()=>{
  stop();events=new AbortController();
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
  if(reduced.matches||typeof IntersectionObserver==='undefined')return;
  const selector=['#main .reveal','#main .page-hero h1','#main .hero-copy > *','#main .hero-person','#main .story-media','#main .play-background','#main .step-person','#main .service-intro > *','#main .tabs','#main .service-text > p','#main .service-photo','#main .team-heading > *','#main .team-card','#main .faq-aside > :is(h2,p,img)','#main .faq-list > details','#main .article-card','#main .articles-intro','#main .article-hero > :is(h1,img:not(.article-decoration))','#main .profile-top > img','#main .profile-heading > *','#main .profile-lead','#main .profile-body','#main .article-body > *','#main .method-content > :not(.method-steps)','#main .method-steps > *','#main .contact-layout > div > *','#main .legal > .container > *','#main .assessment > .container > *','#footer .footer-logo','#footer .footer-columns','#footer .footer-bottom'].join(',');
  const candidates=[...new Set([...document.querySelectorAll(selector)].flatMap(el=>el.matches('.reveal:not(a)')&&el.children?.length>1?[...el.children]:[el]))];
  const selected=new Set(candidates);
  const targets=candidates.filter(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(selected.has(p))return false;return true;});
  observer=new IntersectionObserver(entries=>{
   let order=0;
   for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);const animation=playing.get(entry.target);if(animation){animation.effect.updateTiming({delay:Math.min(order++%3*90,180)});animation.play();}}
  },{threshold:.025,rootMargin:'0px 0px 24px 0px'});
  targets.forEach(el=>{prepare(el);observer.observe(el);});
  document.addEventListener('focusin',e=>{for(const [el,a] of playing)if(el===e.target||el.contains(e.target)){a.cancel();playing.delete(el);}},{signal:events.signal});
 };
 reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
})();
