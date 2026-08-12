(function(){
  const monthId=document.body.dataset.psplusMonth;
  const filters=document.getElementById('psplusMonthFilters');
  const groupsRoot=document.getElementById('psplusMonthGroups');
  const status=document.getElementById('psplusMonthStatus');
  if(!monthId||!filters||!groupsRoot||!status)return;

  const tierNames={essential:'Essential',extra:'Extra',premium:'Premium'};
  const imageFallbacks={
    'Onimusha: Dawn of Dreams':'https://images.launchbox-app.com/ad7677bb-42d1-48d2-958f-f4298c3a8d0b.jpg'
  };
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let month=null;
  let activeFilter='all';

  const element=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };

  const renderCard=(game,group)=>{
    const card=element('article','psplus-card');
    card.dataset.tier=group.id;
    card.dataset.platforms=game.platforms.map((platform)=>platform.toLowerCase()).join(' ');
    const media=element('div','psplus-card-media');
    const image=document.createElement('img');
    image.src=game.image;
    image.alt=`Imagen de ${game.title}`;
    image.loading='lazy';
    image.decoding='async';
    image.addEventListener('error',()=>{
      const fallback=imageFallbacks[game.title];
      if(fallback&&image.src!==fallback){
        image.src=fallback;
        return;
      }
      image.remove();
      media.classList.add('image-missing');
      media.setAttribute('aria-label',`No se pudo cargar la imagen de ${game.title}`);
    });
    media.append(image,element('span',`psplus-card-tier tier-${group.id}`,tierNames[group.id]||group.label));

    const body=element('div','psplus-card-body');
    body.appendChild(element('h4','',game.title));
    if(game.summary)body.appendChild(element('p','psplus-card-copy',game.summary));
    const details=element('div','psplus-card-details');
    game.platforms.forEach((platform)=>details.appendChild(element('span','psplus-chip',platform)));
    body.appendChild(details);
    const footer=element('div','psplus-card-footer');
    footer.appendChild(element('span','psplus-date',game.available));
    const source=element('a','psplus-card-source','Fuente ↗');
    source.href=game.source;
    source.target='_blank';
    source.rel='noopener noreferrer';
    source.setAttribute('aria-label',`Abrir la fuente oficial de ${game.title}`);
    footer.appendChild(source);
    body.appendChild(footer);
    card.append(media,body);
    return card;
  };

  const renderPending=(group)=>{
    const pending=element('div','psplus-pending');
    pending.appendChild(element('div','psplus-pending-icon','…'));
    const copy=element('div');
    copy.append(element('h4','',`${group.label} todavía no anunciado`),element('p','',group.pending));
    pending.appendChild(copy);
    return pending;
  };

  const revealGroups=()=>{
    const groups=[...groupsRoot.querySelectorAll('.psplus-group')];
    if(reducedMotion){groups.forEach((group)=>group.classList.add('visible'));return;}
    groups.forEach((group)=>group.getBoundingClientRect());
    requestAnimationFrame(()=>requestAnimationFrame(()=>groups.forEach((group,index)=>{
      group.style.transitionDelay=`${Math.min(index*70,210)}ms`;
      group.classList.add('visible');
      group.addEventListener('transitionend',()=>group.style.removeProperty('transition-delay'),{once:true});
    })));
  };

  const render=()=>{
    groupsRoot.replaceChildren();
    let visibleGames=0;
    month.groups.forEach((group)=>{
      const tierFilter=['essential','extra','premium'].includes(activeFilter);
      if(tierFilter&&activeFilter!==group.id)return;
      const games=(group.games||[]).filter((game)=>activeFilter==='all'||game.platforms.some((platform)=>platform.toLowerCase()===activeFilter));
      if(!games.length&&!group.pending)return;
      if(group.pending&&!['all',group.id].includes(activeFilter))return;

      const section=element('section','psplus-group reveal');
      section.dataset.tier=group.id;
      const head=element('div','psplus-group-head');
      const title=element('div','psplus-group-title');
      title.append(element('span',`psplus-tier-mark tier-${group.id}`,group.label),element('h3','',group.access));
      head.append(title,element('span','psplus-group-meta',group.pending?'Pendiente de anuncio':`${games.length} ${games.length===1?'juego':'juegos'}`));
      section.appendChild(head);
      if(group.pending) section.appendChild(renderPending(group));
      else {
        const grid=element('div','psplus-grid');
        games.forEach((game)=>grid.appendChild(renderCard(game,group)));
        visibleGames+=games.length;
        section.appendChild(grid);
      }
      groupsRoot.appendChild(section);
    });
    if(!groupsRoot.children.length)groupsRoot.appendChild(element('div','psplus-empty','No hay juegos que coincidan con este filtro.'));
    status.textContent=`${visibleGames||'Sin'} ${visibleGames===1?'juego visible':'juegos visibles'}`;
    revealGroups();
  };

  fetch('/data/playstation-plus.json',{cache:'no-cache'})
    .then((response)=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();})
    .then((data)=>{
      month=data.months.find((item)=>item.id===monthId);
      if(!month)throw new Error(`No existe el mes ${monthId}`);
      render();
    })
    .catch((error)=>{
      console.error('No se pudo cargar el mes de PlayStation Plus',error);
      groupsRoot.replaceChildren(element('div','psplus-empty','No se han podido cargar los juegos. Vuelve a intentarlo dentro de unos minutos.'));
      status.textContent='Error al cargar los datos';
    });

  filters.addEventListener('click',(event)=>{
    const button=event.target.closest('button[data-filter]');
    if(!button||!month)return;
    activeFilter=button.dataset.filter;
    filters.querySelectorAll('button').forEach((candidate)=>{
      const active=candidate===button;
      candidate.classList.toggle('on',active);
      candidate.setAttribute('aria-pressed',String(active));
    });
    render();
  });
})();
