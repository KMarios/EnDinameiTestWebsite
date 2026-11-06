/* Keep the page behind the full-screen menu still, including on mobile Safari. */
(()=>{
 let locked=null;
 const viewport=matchMedia('(max-width:760px)');
 window.setMobileMenuState=function(open){
  open=Boolean(open&&viewport.matches);
  const body=document.body;
  if(open&&!locked){
   locked={scrollY:window.scrollY,position:body.style.position,top:body.style.top,width:body.style.width};
   body.style.position='fixed';body.style.top=-locked.scrollY+'px';body.style.width='100%';
  }
  body.classList.toggle('mobile-menu-open',open);
  document.querySelectorAll('#main,#footer').forEach(node=>{node.inert=open;});
  if(!open&&locked){
   const previous=locked;locked=null;
   body.style.position=previous.position;body.style.top=previous.top;body.style.width=previous.width;
   window.scrollTo({top:previous.scrollY,behavior:'instant'});
  }
 };
 viewport.addEventListener('change',()=>{
  window.setMobileMenuState(false);
  document.querySelector('#mobile-navigation')?.classList.remove('open');
  const button=document.querySelector('.menu-toggle');
  if(button){button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Άνοιγμα μενού');button._menuMotion?.forEach(animation=>animation.cancel());button._menuMotion=null;}
 });
 document.addEventListener('keydown',event=>{
  if(!document.body.classList.contains('mobile-menu-open'))return;
  const button=document.querySelector('.menu-toggle');
  if(event.key==='Escape'){event.preventDefault();button.click();button.focus();return;}
  if(event.key!=='Tab')return;
  const items=[...document.querySelectorAll('#header a,#header button')].filter(node=>!node.closest('[inert]')&&node.getClientRects().length&&getComputedStyle(node).visibility==='visible');
  const first=items[0],last=items.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 });
})();
