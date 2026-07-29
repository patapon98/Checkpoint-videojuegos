(function(){
  const viewport=document.querySelector('[data-game-hubs-track]');
  const previous=document.querySelector('[data-game-hubs-prev]');
  const next=document.querySelector('[data-game-hubs-next]');
  const progress=document.querySelector('[data-game-hubs-progress]');
  if(!viewport||!previous||!next||!progress)return;

  const cards=[...viewport.querySelectorAll('.home-game-hub-card')].slice(0,9);
  if(!cards.length)return;

  let frame=0;

  const metrics=()=>{
    const first=cards[0];
    const second=cards[1];
    const step=second?second.offsetLeft-first.offsetLeft:first.offsetWidth;
    const gap=Math.max(0,step-first.offsetWidth);
    const visible=Math.max(1,Math.floor((viewport.clientWidth+gap+1)/step));
    const maximum=Math.max(0,cards.length-visible);
    const current=Math.min(maximum,Math.max(0,Math.round(viewport.scrollLeft/step)));
    return{step,visible,maximum,current};
  };

  const update=()=>{
    frame=0;
    const{visible,maximum,current}=metrics();
    previous.disabled=current<=0;
    next.disabled=current>=maximum;
    const end=Math.min(cards.length,current+visible);
    progress.textContent=`${current+1}–${end} de ${cards.length}`;
  };

  const scheduleUpdate=()=>{
    if(frame)return;
    frame=requestAnimationFrame(update);
  };

  previous.addEventListener('click',()=>{
    const{step}=metrics();
    viewport.scrollBy({left:-step,behavior:'smooth'});
  });

  next.addEventListener('click',()=>{
    const{step}=metrics();
    viewport.scrollBy({left:step,behavior:'smooth'});
  });

  viewport.addEventListener('scroll',scheduleUpdate,{passive:true});
  window.addEventListener('resize',scheduleUpdate,{passive:true});

  if('ResizeObserver'in window){
    new ResizeObserver(scheduleUpdate).observe(viewport);
  }

  update();
})();
