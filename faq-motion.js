/* Shared accordion motion for clicks and its first scroll reveal. */
(() => {
 const states=new WeakMap(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let observer;
 function toggleRow(row,opening){
  const summary=row.querySelector('summary');
    const previous=states.get(row);
    const answer=row.querySelector(':scope > p');
    const start=row.getBoundingClientRect().height;
    const opacity=answer?getComputedStyle(answer).opacity:'1';
    row.style.height=start+'px';
    previous?.height.cancel();previous?.text?.cancel();
    states.delete(row);
    row.dataset.faqExpanded=String(opening);
    if(reduced.matches||!row.animate){
      row.open=opening;row.style.height='';row.classList.remove('faq-animating');return;
    }
    row.open=true;
    row.style.height='auto';
    const full=row.getBoundingClientRect().height;
    const style=getComputedStyle(row);
    const collapsed=summary.getBoundingClientRect().height+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
    row.style.height=start+'px';row.classList.add('faq-animating');
    const height=row.animate([{height:start+'px'},{height:(opening?full:collapsed)+'px'}],{
      duration:opening?420:320,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'
    });
    const text=answer?.animate([
      {opacity:previous?opacity:opening?0:1,transform:opening?'translateY(5px)':'translateY(0)'},
      {opacity:opening?1:0,transform:opening?'translateY(0)':'translateY(-3px)'}
    ],{duration:opening?320:170,easing:'ease-out',fill:'forwards'});
    const state={height,text,opening};states.set(row,state);
    height.onfinish=()=>{
      if(states.get(row)!==state)return;
      row.open=opening;row.style.height='';row.classList.remove('faq-animating');
      height.cancel();text?.cancel();states.delete(row);
    };

 }
 document.addEventListener('click',event=>{
  const row=event.target.closest('summary')?.parentElement;
  if(!row?.matches('.faq details')||event.defaultPrevented)return;
  event.preventDefault();row.closest('.faq').dataset.faqInteracted='true';
  const previous=states.get(row);toggleRow(row,!(previous?previous.opening:row.open));
 });
 window.initFAQScroll=()=>{
  observer?.disconnect();
  const section=document.querySelector('.faq'),first=section?.querySelector('details');
  if(!first||section.dataset.faqRevealed||typeof IntersectionObserver==='undefined')return;
  observer=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   observer.disconnect();section.dataset.faqRevealed='true';
   if(!section.dataset.faqInteracted&&!section.querySelector('details[open]'))toggleRow(first,true);
  },{threshold:.25,rootMargin:'0px 0px -30px 0px'});
  observer.observe(first);
 };
 window.initFAQScroll();
})();
