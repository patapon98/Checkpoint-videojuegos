(function(){
  const archive=document.getElementById('newsArchive');
  const filters=document.getElementById('newsFilters');
  const toggle=document.getElementById('newsViewToggle');
  const results=document.getElementById('newsResults');
  const tools=document.querySelector('.news-tools');
  const news=Array.isArray(window.MODERLODE_NEWS)?window.MODERLODE_NEWS:[];
  if(!archive||!filters||!toggle) return;

  let activeCategory='all';
  let activeView='grid';
  let resizeObserver=null;
  let layoutFrame=0;
  const masonryRow=8;
  const masonryGap=18;

  try{
    const saved=localStorage.getItem('moderlode-news-view');
    if(saved==='grid'||saved==='list') activeView=saved;
  }catch(e){}

  function priority(item){
    if(item.featured) return 'lead';
    if(item.latest||item.ticker) return 'high';
    return 'standard';
  }

  function categoryClass(category){
    const map={
      Juegos:'games',
      Plataformas:'platforms',
      Industria:'industry',
      Lanzamientos:'releases'
    };
    return map[category]||'all';
  }

  function prepareCards(){
    archive.querySelectorAll('.news-archive-card').forEach(card=>{
      const item=news.find(entry=>entry.id===card.id);
      if(!item) return;
      const category=item.category?.es||'';
      card.dataset.category=category;
      card.classList.remove(
        'news-category-games','news-category-platforms','news-category-industry','news-category-releases',
        'news-priority-lead','news-priority-high','news-priority-standard'
      );
      card.classList.add(`news-category-${categoryClass(category)}`,`news-priority-${priority(item)}`);
    });
  }

  function activeFace(card){
    return card.querySelector(card.classList.contains('is-flipped')?'.news-flip-back':'.news-flip-front');
  }

  function sizeCard(card){
    const inner=card.querySelector('.news-flip-inner');
    const face=activeFace(card);
    if(!inner||!face) return;

    inner.style.setProperty('--news-face-height',`${Math.ceil(face.scrollHeight)}px`);

    if(activeView==='grid'&&window.innerWidth>760&&!card.hidden){
      const height=Math.ceil(inner.getBoundingClientRect().height);
      const span=Math.max(1,Math.ceil((height+masonryGap)/(masonryRow+masonryGap)));
      card.style.gridRowEnd=`span ${span}`;
    }else{
      card.style.removeProperty('grid-row-end');
    }
  }

  function layoutCards(){
    cancelAnimationFrame(layoutFrame);
    layoutFrame=requestAnimationFrame(()=>{
      archive.querySelectorAll('.news-archive-card').forEach(sizeCard);
    });
  }

  function observeFaces(){
    if(resizeObserver) resizeObserver.disconnect();
    if(typeof ResizeObserver!=='function') return;
    resizeObserver=new ResizeObserver(layoutCards);
    archive.querySelectorAll('.news-flip-face').forEach(face=>resizeObserver.observe(face));
  }

  function apply(){
    prepareCards();
    archive.classList.toggle('is-grid',activeView==='grid');
    archive.classList.toggle('is-list',activeView==='list');
    if(tools) tools.dataset.activeCategory=categoryClass(activeCategory==='all'?'':activeCategory);

    let visible=0;
    archive.querySelectorAll('.news-archive-card').forEach(card=>{
      const show=activeCategory==='all'||card.dataset.category===activeCategory;
      card.hidden=!show;
      if(show) visible+=1;
    });

    toggle.querySelectorAll('.view-btn').forEach(button=>{
      const on=button.dataset.view===activeView;
      button.classList.toggle('on',on);
      button.setAttribute('aria-pressed',String(on));
    });
    if(results) results.textContent=`${visible} noticias seleccionadas`;

    observeFaces();
    layoutCards();
  }

  filters.addEventListener('click',event=>{
    const button=event.target.closest('.news-filter');
    if(!button) return;
    activeCategory=button.dataset.category;
    filters.querySelectorAll('.news-filter').forEach(item=>{
      const on=item===button;
      item.classList.toggle('on',on);
      item.setAttribute('aria-pressed',String(on));
    });
    apply();
  });

  toggle.addEventListener('click',event=>{
    const button=event.target.closest('.view-btn');
    if(!button) return;
    activeView=button.dataset.view;
    try{localStorage.setItem('moderlode-news-view',activeView)}catch(e){}
    apply();
  });

  archive.addEventListener('click',event=>{
    if(!event.target.closest('.news-flip-button')) return;
    requestAnimationFrame(()=>requestAnimationFrame(layoutCards));
  });

  window.addEventListener('resize',layoutCards);

  const observer=new MutationObserver(apply);
  observer.observe(archive,{childList:true,subtree:false});
  apply();
})();