(function(){
  const filters=document.getElementById('psplusMonthFilters');
  const groupsRoot=document.getElementById('psplusMonthGroups');
  const status=document.getElementById('psplusMonthStatus');
  if(!filters||!groupsRoot||!status)return;

  const update=(filter)=>{
    let visible=0;
    groupsRoot.querySelectorAll('.psplus-group').forEach((group)=>{
      const tier=group.dataset.tier;
      const cards=[...group.querySelectorAll('.psplus-card')];
      const pending=group.querySelector('.psplus-pending');
      let showGroup=false;

      cards.forEach((card)=>{
        const matches=filter==='all'||filter===tier||card.dataset.platforms.split(/\s+/).includes(filter);
        card.hidden=!matches;
        if(matches){visible+=1;showGroup=true;}
      });

      if(pending){
        const showPending=filter==='all'||filter===tier;
        pending.hidden=!showPending;
        showGroup=showGroup||showPending;
      }

      group.hidden=!showGroup;
    });

    status.textContent=`${visible||'Sin'} ${visible===1?'juego visible':'juegos visibles'}`;
  };

  filters.addEventListener('click',(event)=>{
    const button=event.target.closest('button[data-filter]');
    if(!button)return;
    filters.querySelectorAll('button').forEach((candidate)=>{
      const active=candidate===button;
      candidate.classList.toggle('on',active);
      candidate.setAttribute('aria-pressed',String(active));
    });
    update(button.dataset.filter);
  });
})();
