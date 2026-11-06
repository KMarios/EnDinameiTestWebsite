/* Reproduce the supplied Lottie timings without loading an animation player. */
window.animateMenuToggle=function(button,open){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){
  button._menuMotion?.forEach(animation=>animation.cancel());button._menuMotion=null;return;
 }
 if(!button._menuMotion){
  const base='translate(-50%,-50%)';
  const lines=button.querySelectorAll('.menu-stroke');
  const movement=(offset,angle)=>[
   {offset:0,transform:base+` translateY(${offset}px) rotate(0deg)`,easing:'cubic-bezier(.668,0,.33,1)'},
   {offset:10/23,transform:base+' translateY(0px) rotate(0deg)'},
   {offset:15/23,transform:base+' translateY(0px) rotate(0deg)',easing:'cubic-bezier(.668,0,.33,1)'},
   {offset:1,transform:base+` translateY(0px) rotate(${angle}deg)`}
  ];
  const frames=[movement(-8,45),[{offset:0,opacity:1},{offset:10/23,opacity:1},{offset:11/23,opacity:0},{offset:1,opacity:0}],movement(8,-45)];
  button._menuMotion=[...lines].map((line,index)=>{
   const animation=line.animate(frames[index],{duration:23000/30,fill:'both'});
   animation.pause();animation.currentTime=0;return animation;
  });
 }
 button._menuMotion.forEach(animation=>{
  animation.updatePlaybackRate(open?1:-1);animation.play();
 });
};
