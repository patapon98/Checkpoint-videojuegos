(function(){
  const countdowns=[...document.querySelectorAll('.countdown[data-countdown-date]')];
  if(!countdowns.length)return;
  const pad=(value)=>String(value).padStart(2,'0');

  countdowns.forEach((countdown)=>{
    const date=countdown.dataset.countdownDate;
    const title=countdown.dataset.countdownTitle||'El lanzamiento destacado';
    const target=new Date(`${date}T00:00:00`);
    const units={};
    ['d','h','m','s'].forEach((unit)=>{
      const node=countdown.querySelector(`#calendar-cd-${unit}`);
      if(node){node.id=`cd-${unit}`;units[unit]=node;}
    });
    if(!units.d||Number.isNaN(target.getTime()))return;

    const tick=()=>{
      const distance=target-new Date();
      if(distance<=0){
        countdown.querySelector('.cd-label b')?.replaceChildren(document.createTextNode(`${title} ya está disponible`));
        units.d.textContent='0';
        if(units.h)units.h.textContent='00';
        if(units.m)units.m.textContent='00';
        if(units.s)units.s.textContent='00';
        return;
      }
      units.d.textContent=Math.floor(distance/864e5);
      if(units.h)units.h.textContent=pad(Math.floor(distance/36e5)%24);
      if(units.m)units.m.textContent=pad(Math.floor(distance/6e4)%60);
      if(units.s)units.s.textContent=pad(Math.floor(distance/1e3)%60);
    };
    tick();
    window.setInterval(tick,1000);
  });
})();
