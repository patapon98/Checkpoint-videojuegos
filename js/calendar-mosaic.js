(function(){
  const root=document.getElementById('releases');
  if(!root||root.dataset.mosaicReady) return;

  /* Los ajustes específicos de la cuadrícula viven en hojas separadas. */
  if(!document.getElementById('calendarGridStyles')){
    const styles=document.createElement('link');
    styles.id='calendarGridStyles';
    styles.rel='stylesheet';
    styles.href='css/calendar-grid.css';
    document.head.append(styles);
  }

  if(!document.getElementById('calendarPolishStyles')){
    const styles=document.createElement('link');
    styles.id='calendarPolishStyles';
    styles.rel='stylesheet';
    styles.href='css/calendar-polish.css';
    document.head.append(styles);
  }

  /*
   * Prepara el calendario para la vista de mosaico sin tocar el orden del HTML:
   *  - envuelve los lanzamientos de cada mes en un .month-group
   *  - clasifica cada uno en tres niveles según su etiqueta de hype
   *  - coloca los meses ya pasados dentro de un desplegable
   * En la vista de lista todo esto es invisible: el grupo se comporta como un bloque
   * normal y el orden sigue siendo cronológico.
   */

  const TIER={'hype-max':1,'hype-high':2};

  function addPoster(release){
    if(release.dataset.tier==='3'||release.querySelector('.release-poster')) return;
    const url=release.dataset.poster;
    if(!url) return;
    const title=release.querySelector('h4');
    const poster=document.createElement('img');
    poster.className='release-poster';
    poster.src=url;
    poster.alt='';
    poster.loading='lazy';
    poster.decoding='async';
    poster.addEventListener('load',()=>{
      if(poster.naturalWidth>0&&poster.naturalHeight>poster.naturalWidth) release.classList.add('has-poster');
      else poster.remove();
    });
    poster.addEventListener('error',()=>poster.remove());
    release.append(poster);
    if(title) poster.setAttribute('aria-hidden','true');
  }

  /*
   * La etiqueta del listado se conserva intacta y se clona como un banderín
   * exclusivo de la cuadrícula. Así DLC, remasters, recopilatorios o nuevas
   * plataformas no pierden contexto al cambiar de vista.
   */
  function addCardRibbon(release){
    if(release.querySelector(':scope > .card-ribbon')) return;
    const source=release.querySelector('h4 .tag-dlc');
    const text=source?.textContent.trim();
    if(!text) return;

    const ribbon=document.createElement('span');
    ribbon.className='card-ribbon';
    ribbon.textContent=text;
    ribbon.setAttribute('aria-hidden','true');
    release.append(ribbon);
    release.classList.add('has-card-ribbon');
  }

  /*
   * El enlace de afiliación sigue visible en la lista y se clona como una acción
   * específica de la cuadrícula. En los mosaicos grandes se presenta como un CTA
   * breve; en las fichas compactas queda reducido al icono de compra.
   */
  function addGridStoreAction(release){
    if(release.querySelector(':scope > .grid-store-cta')) return;
    const source=release.querySelector('h4 .store-cta');
    if(!source) return;

    const action=source.cloneNode(true);
    action.className='grid-store-cta';
    action.querySelector('span')?.replaceChildren(document.createTextNode('Comprar'));
    action.title=source.title||'Comprar en Instant Gaming';
    action.setAttribute('aria-label',source.getAttribute('aria-label')||action.title);
    release.append(action);
    release.classList.add('has-grid-store');
  }

  function addCompactDate(release){
    if(release.querySelector(':scope > .compact-date')) return;
    const source=release.querySelector('.release-art .rdate');
    if(!source) return;
    const day=source.querySelector('b')?.textContent.trim();
    const month=source.querySelector('span')?.textContent.trim();
    if(!day) return;

    const date=document.createElement('span');
    date.className='compact-date';
    date.setAttribute('aria-hidden','true');
    const dayNode=document.createElement('b');
    dayNode.textContent=day;
    date.append(dayNode);
    if(month){
      const monthNode=document.createElement('span');
      monthNode.textContent=month;
      date.append(monthNode);
    }
    release.prepend(date);
  }

  /*
   * En las fichas compactas ("otros lanzamientos"), toda la tarjeta enlaza a la
   * wishlist (el "+" que ya llevaba el HTML). Los iconos propios de la miniatura
   * (tráiler, Google Calendar) y el botón de Instant Gaming conservan su destino:
   * un clic sobre cualquier <a> anidado no dispara la navegación de la tarjeta.
   */
  function makeCardClickable(release){
    if(release.dataset.clickableReady) return;
    const wish=release.querySelector('.release-art > .wish');
    if(!wish) return;
    release.dataset.clickableReady='true';
    release.classList.add('card-clickable');
    release.tabIndex=0;
    release.setAttribute('role','link');
    release.setAttribute('aria-label',wish.getAttribute('aria-label')||wish.title||'');

    const activate=event=>{
      if(!root.classList.contains('view-grid')) return;
      if(event.target.closest('a')) return;
      window.open(wish.href,'_blank','noopener');
    };
    release.addEventListener('click',activate);
    release.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ') return;
      if(event.target.closest('a')) return;
      if(!root.classList.contains('view-grid')) return;
      event.preventDefault();
      window.open(wish.href,'_blank','noopener');
    });
  }

  function monthName(monthKey){
    const [year,month]=monthKey.split('-').map(Number);
    if(!year||!month) return '';
    return new Intl.DateTimeFormat('es-ES',{month:'long'}).format(new Date(year,month-1,1));
  }

  const months=[];
  let current=null;

  [...root.children].forEach(node=>{
    if(node.hasAttribute('data-month')){
      current={label:node,month:node.dataset.month,releases:[]};
      months.push(current);
    }else if(node.classList.contains('release')&&current){
      current.releases.push(node);
    }
  });

  months.forEach(entry=>{
    const group=document.createElement('div');
    group.className='month-group';
    group.dataset.groupMonth=entry.month;
    entry.label.after(group);

    entry.releases.forEach(release=>{
      const badge=release.querySelector(':scope > .hype');
      let tier=3;
      if(badge&&!badge.classList.contains('hype-out')){
        for(const [name,value] of Object.entries(TIER)){
          if(badge.classList.contains(name)) tier=value;
        }
      }
      release.dataset.tier=String(tier);
      release.style.order=tier===3?'4':String(tier);
      group.append(release);
      addCardRibbon(release);
      addGridStoreAction(release);
      addPoster(release);
      if(tier===3){
        addCompactDate(release);
        makeCardClickable(release);
      }
    });

    const compact=entry.releases.filter(release=>release.dataset.tier==='3');
    const featured=entry.releases.filter(release=>release.dataset.tier!=='3');
    const tierTwo=entry.releases.filter(release=>release.dataset.tier==='2');
    group.dataset.featuredCount=String(featured.length);
    group.dataset.tierTwoCount=String(tierTwo.length);
    group.dataset.tierTwoLayout=tierTwo.length===1?'single':(tierTwo.length===3||tierTwo.length>=5?'thirds':'halves');

    if(compact.length&&featured.length){
      compact[0].classList.add('row-start');
      const secondaryLabel=document.createElement('div');
      secondaryLabel.className='month-secondary-label';
      const name=monthName(entry.month);
      secondaryLabel.textContent=name?`Otros lanzamientos de ${name}`:'Otros lanzamientos';
      group.append(secondaryLabel);
    }

    entry.group=group;
  });

  /* ---------- Meses ya pasados, plegados ---------- */
  const now=new Date();
  const currentMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const past=months.filter(entry=>entry.month<currentMonth);

  if(past.length){
    const count=past.reduce((total,entry)=>total+entry.releases.length,0);
    const details=document.createElement('details');
    details.className='past-months';
    const summary=document.createElement('summary');
    summary.innerHTML=`<span>${past.length===1?'1 mes anterior':past.length+' meses anteriores'}</span><small>${count} ${count===1?'juego':'juegos'} ya disponibles</small>`;
    details.append(summary);
    past[0].label.before(details);
    past.forEach(entry=>details.append(entry.label,entry.group));

    /* Si el usuario busca, no tiene sentido esconderle resultados. */
    const search=document.getElementById('releaseSearch');
    const monthFilter=document.getElementById('monthFilter');
    const openIfNeeded=()=>{
      const searching=Boolean(search?.value.trim());
      const filtered=monthFilter&&monthFilter.value!=='all'&&monthFilter.value<currentMonth;
      if(searching||filtered) details.open=true;
    };
    search?.addEventListener('input',openIfNeeded);
    monthFilter?.addEventListener('change',openIfNeeded);
  }

  root.dataset.mosaicReady='true';
})();