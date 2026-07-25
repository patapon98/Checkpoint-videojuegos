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
  try{
    const saved=localStorage.getItem('moderlode-news-view');
    if(saved==='grid'||saved==='list') activeView=saved;
  }catch(e){}

  function categoryClass(category){
    return ({Juegos:'games',Plataformas:'platforms',Industria:'industry',Lanzamientos:'releases'})[category]||'all';
  }

  function prepareCards(){
    archive.querySelectorAll('.news-archive-card').forEach(card=>{
      const item=news.find(entry=>entry.id===card.id);
      if(!item) return;
      const category=item.category?.es||'';
      card.dataset.category=category;
      card.classList.remove('news-category-games','news-category-platforms','news-category-industry','news-category-releases','news-featured');
      card.classList.add(`news-category-${categoryClass(category)}`);
      if(item.featured) card.classList.add('news-featured');
      card.style.removeProperty('grid-row-end');
      card.querySelector('.news-flip-inner')?.style.removeProperty('--news-face-height');
    });
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

  const observer=new MutationObserver(apply);
  observer.observe(archive,{childList:true,subtree:false});
  apply();
})();