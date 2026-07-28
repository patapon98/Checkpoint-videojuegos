(function(){
  const monthSelect=document.getElementById('psplusMonth');
  const groupsRoot=document.getElementById('psplusGroups');
  const filtersRoot=document.getElementById('psplusFilters');
  if(!monthSelect||!groupsRoot||!filtersRoot)return;

  const state={data:null,month:null,filter:'all'};
  const tierNames={essential:'Essential',extra:'Extra',premium:'Premium'};

  const formatUpdated=(value)=>{
    const date=new Date(value+'T12:00:00');
    if(Number.isNaN(date.getTime()))return value;
    return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric'}).format(date);
  };

  const element=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };

  const matchesFilter=(game,groupId)=>{
    if(state.filter==='all')return true;
    if(['essential','extra','premium'].includes(state.filter))return groupId===state.filter;
    return game.platforms.some((platform)=>platform.toLowerCase()===state.filter);
  };

  const renderCard=(game,group)=>{
    const card=element('article','psplus-card');
    const media=element('div','psplus-card-media');
    const image=document.createElement('img');
    image.src=game.image;
    image.alt=`Imagen oficial de ${game.title}`;
    image.loading='lazy';
    image.decoding='async';
    image.addEventListener('error',()=>{
      image.remove();
      media.classList.add('image-missing');
      media.setAttribute('aria-label',`No se pudo cargar la imagen de ${game.title}`);
    });
    media.appendChild(image);
    media.appendChild(element('span','psplus-card-tier',tierNames[group.id]||group.label));

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
    copy.appendChild(element('h4','',`${group.label} todavía no anunciado`));
    copy.appendChild(element('p','',group.pending));
    pending.appendChild(copy);
    return pending;
  };

  const render=()=>{
    const month=state.data.months.find((item)=>item.id===state.month)||state.data.months[0];
    state.month=month.id;
    document.getElementById('psplusMonthTitle').textContent=month.headline;
    document.getElementById('psplusAvailability').textContent=month.availability;
    const mainSource=document.getElementById('psplusMainSource');
    mainSource.href=month.source;

    groupsRoot.replaceChildren();
    let visibleGames=0;

    month.groups.forEach((group)=>{
      const isTierFilter=['essential','extra','premium'].includes(state.filter);
      if(isTierFilter&&state.filter!==group.id)return;

      const games=(group.games||[]).filter((game)=>matchesFilter(game,group.id));
      if(!games.length&&!group.pending)return;
      if(group.pending&&!['all',group.id].includes(state.filter))return;

      const section=element('section','psplus-group');
      section.dataset.tier=group.id;
      const head=element('div','psplus-group-head');
      const titleWrap=element('div','psplus-group-title');
      titleWrap.appendChild(element('span','psplus-tier-mark',group.label));
      titleWrap.appendChild(element('h3','',group.access));
      head.appendChild(titleWrap);

      const countText=group.pending?'Pendiente de anuncio':`${games.length} ${games.length===1?'juego':'juegos'}`;
      head.appendChild(element('span','psplus-group-meta',countText));
      section.appendChild(head);

      if(group.pending){
        section.appendChild(renderPending(group));
      }else if(games.length){
        const grid=element('div','psplus-grid');
        games.forEach((game)=>grid.appendChild(renderCard(game,group)));
        visibleGames+=games.length;
        section.appendChild(grid);
      }
      groupsRoot.appendChild(section);
    });

    if(!groupsRoot.children.length){
      groupsRoot.appendChild(element('div','psplus-empty','No hay juegos que coincidan con este filtro.'));
    }

    const selectedLabel=month.label.toLowerCase();
    const status=document.getElementById('psplusStatus');
    status.textContent=`${visibleGames||'Sin'} ${visibleGames===1?'juego visible':'juegos visibles'} · ${selectedLabel}`;
  };

  const selectMonth=(id,updateUrl=true)=>{
    state.month=id;
    monthSelect.value=id;
    if(updateUrl){
      const url=new URL(location.href);
      url.searchParams.set('mes',id);
      history.replaceState({},'',url);
    }
    render();
  };

  fetch('/data/playstation-plus.json',{cache:'no-cache'})
    .then((response)=>{
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data)=>{
      state.data=data;
      data.months.forEach((month)=>{
        const option=document.createElement('option');
        option.value=month.id;
        option.textContent=month.label;
        monthSelect.appendChild(option);
      });
      const requested=new URLSearchParams(location.search).get('mes');
      const initial=data.months.some((month)=>month.id===requested)?requested:data.months[0].id;
      document.getElementById('psplusStatus').textContent=`Actualizado el ${formatUpdated(data.updatedAt)} · ${data.region}`;
      state.month=initial;
      monthSelect.value=initial;
      render();
    })
    .catch((error)=>{
      console.error('No se pudieron cargar los datos de PlayStation Plus',error);
      groupsRoot.replaceChildren(element('div','psplus-empty','No se han podido cargar los juegos. Vuelve a intentarlo dentro de unos minutos.'));
      document.getElementById('psplusStatus').textContent='Error al cargar los datos';
    });

  monthSelect.addEventListener('change',()=>selectMonth(monthSelect.value));
  filtersRoot.addEventListener('click',(event)=>{
    const button=event.target.closest('button[data-filter]');
    if(!button)return;
    state.filter=button.dataset.filter;
    filtersRoot.querySelectorAll('button').forEach((candidate)=>{
      const active=candidate===button;
      candidate.classList.toggle('on',active);
      candidate.setAttribute('aria-pressed',String(active));
    });
    render();
  });
})();
