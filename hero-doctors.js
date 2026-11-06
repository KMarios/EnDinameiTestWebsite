/* Self-contained carousel; the hero drawing and site navigation are untouched. */
(() => {
 const profiles=[
  {name:'Καμπάς Απόστολος',role:'Εργοθεραπευτής',slug:'apostolos-kampas',photo:'apostolos'},
  {name:'Μαρία Σακελλαρίου',role:'Ειδική Παιδαγωγός',slug:'maria-sakellariou',photo:'maria'},
  {"name":"Σίλλια","role":"Κλινική και Δικαστική Ψυχολόγος","slug":"sillia","photo":"member4","src":"hero-doctor-sillia.jpg"},
  {"name":"Καρυοφύλλη Χριστίνα","role":"Ειδική Παιδαγωγός","slug":"christina-karyofylli","photo":"member3","src":"hero-doctor-christina.jpg"}
 ];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let cleanup=()=>{};
 window.initHeroDoctors=()=>{
  cleanup();const mount=document.querySelector('.hero-doctors-mount');if(!mount)return;
  const link=document.createElement('a');link.className='hero-doctors';link.dataset.figmaNode='100:265';
  link.innerHTML='<div class="hero-doctors-canvas">'+profiles.map((p,i)=>`<div class="hero-doctor-slide${i===0?' is-active':''}" aria-hidden="${i!==0}"><div class="hero-doctor-portrait hero-doctor-portrait--${p.photo}"><img src="assets/${p.src||`hero-doctor-${p.photo}.webp`}" width="480" height="${p.photo==='apostolos'?632:480}" alt="" decoding="async" loading="eager"></div><p class="hero-doctor-name">${p.name}</p><p class="hero-doctor-role">${p.role}</p><span class="hero-doctor-number">0${i+1}</span><span class="hero-doctor-experience">7 χρόνια εμπειρίας</span></div>`).join('')+'<div class="hero-doctor-progress" aria-hidden="true"><img src="assets/hero-doctor-track.svg" width="231.362" height="1" alt=""><span class="hero-doctor-progress-fill"><img src="assets/hero-doctor-fill.svg" width="49.652" height="1" alt=""></span></div></div>';
  mount.replaceChildren(link);
  const canvas=link.firstElementChild,slides=[...link.querySelectorAll('.hero-doctor-slide')],fill=link.querySelector('.hero-doctor-progress-fill');
  let index=0,animation,visible=false,hover=false,focused=false,disposed=false,entered=false;
  const resize=new ResizeObserver(()=>{canvas.style.transform='scale('+mount.clientWidth/408+')';});resize.observe(mount);
  function setProfile(){const p=profiles[index];link.href='#/team/'+p.slug;link.setAttribute('aria-label',p.name+' — '+p.role);slides.forEach((s,i)=>{s.classList.toggle('is-active',i===index);s.setAttribute('aria-hidden',String(i!==index));});}
  function pause(){if(animation){if(!visible||document.hidden||hover||focused)animation.pause();else animation.play();}}
  function cycle(){
   animation?.cancel();if(disposed||reduced.matches||typeof fill.animate!=='function')return;
   animation=fill.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:5000,delay:420,easing:'linear',fill:'both'});
   animation.onfinish=()=>{if(disposed||!mount.isConnected){cleanup();return;}index=(index+1)%profiles.length;setProfile();cycle();};pause();
  }
  const events=new AbortController(),options={signal:events.signal};
  link.addEventListener('pointerenter',()=>{hover=true;pause();},options);link.addEventListener('pointerleave',()=>{hover=false;pause();},options);
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  let tiltFrame=0;
  function resetTilt(){cancelAnimationFrame(tiltFrame);['--tilt-x','--tilt-y','--glass-x','--glass-y'].forEach(key=>link.style.removeProperty(key));}
  link.addEventListener('pointermove',event=>{
   if(reduced.matches||!finePointer.matches||event.pointerType==='touch')return;
   const bounds=mount.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-bounds.left)/bounds.width)),y=Math.max(0,Math.min(1,(event.clientY-bounds.top)/bounds.height));
   cancelAnimationFrame(tiltFrame);tiltFrame=requestAnimationFrame(()=>{
    link.style.setProperty('--tilt-x',((.5-y)*5)+'deg');link.style.setProperty('--tilt-y',((x-.5)*7)+'deg');
    link.style.setProperty('--glass-x',(x*100)+'%');link.style.setProperty('--glass-y',(y*100)+'%');
   });
  },options);
  link.addEventListener('pointerleave',resetTilt,options);
  link.addEventListener('pointercancel',resetTilt,options);
  reduced.addEventListener('change',resetTilt,options);
  link.addEventListener('focus',()=>{focused=true;pause();},options);link.addEventListener('blur',()=>{focused=false;pause();},options);
  document.addEventListener('visibilitychange',pause,options);
  reduced.addEventListener('change',()=>{cycle();},options);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&!entered){entered=true;if(!reduced.matches&&typeof link.animate==='function')link.animate([{opacity:0},{opacity:1}],{duration:650,easing:'ease-out'});}pause();},{threshold:.15});observer.observe(mount);
  cleanup=()=>{resetTilt();disposed=true;animation?.cancel();observer.disconnect();resize.disconnect();events.abort();};
  setProfile();cycle();
 };
})();
