(function(){
  const root=document.getElementById('releases');
  if(!root||root.dataset.mosaicReady) return;

  /*
   * Prepara el calendario para la vista de mosaico sin tocar el orden del HTML:
   *  - envuelve los lanzamientos de cada mes en un .month-group
   *  - clasifica cada uno en tres niveles según su etiqueta de hype
   *  - coloca los meses ya pasados dentro de un desplegable
   * En la vista de lista todo esto es invisible: el grupo se comporta como un bloque
   * normal y el orden sigue siendo cronológico.
   */

  const TIER={'hype-max':1,'hype-high':2};

  /*
   * Carátula vertical para las tarjetas destacadas del mosaico.
   * Se indica a mano con data-poster en el .release correspondiente. No se puede
   * deducir de Steam: cada recurso vive bajo un hash distinto en su CDN y el
   * retrato 600x900 no aparece en ninguna API pública.
   * Solo se aplica a los niveles 1 y 2; en las fichas mínimas no se apreciaría.
   * Si la imagen falla o no es vertical se descarta y la tarjeta queda como está.
   */
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
      release.style.order=String(tier);
      group.append(release);
      addPoster(release);
    });

    /*
     * Las fichas mínimas arrancan en fila nueva. Si no, cuando un mes tiene
     * un número de destacados que no llena la última fila, se cuela una ficha
     * baja al lado de dos tarjetas altas y deja un hueco debajo.
     */
    const compact=entry.releases.find(release=>release.dataset.tier==='3');
    const hasFeatured=entry.releases.some(release=>release.dataset.tier!=='3');
    if(compact&&hasFeatured) compact.classList.add('row-start');

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
