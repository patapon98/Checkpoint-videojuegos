(function(){
  const archive=document.getElementById('newsArchive');
  const filters=document.getElementById('newsFilters');
  const toggle=document.getElementById('newsViewToggle');
  const results=document.getElementById('newsResults');
  const tools=document.querySelector('.news-tools');
  const news=Array.isArray(window.MODERLODE_NEWS)?window.MODERLODE_NEWS:[];
  if(!archive||!filters||!toggle) return;

  const pageSize=10;
  let activeCategory='all';
  let activeView='grid';
  let activePage=readPage();
  let pagination=document.getElementById('newsPagination');

  if(!pagination){
    pagination=document.createElement('nav');
    pagination.id='newsPagination';
    pagination.className='news-pagination';
    pagination.setAttribute('aria-label','Paginación de noticias');
    archive.insertAdjacentElement('afterend',pagination);
  }

  try{
    const saved=localStorage.getItem('moderlode-news-view');
    if(saved==='grid'||saved==='list') activeView=saved;
  }catch(e){}

  function readPage(){
    const value=Number(new URL(window.location.href).searchParams.get('page'));
    return Number.isInteger(value)&&value>0?value:1;
  }

  function pageURL(page){
    const url=new URL(window.location.href);
    if(page<=1) url.searchParams.delete('page');
    else url.searchParams.set('page',String(page));
    url.hash='';
    return `${url.pathname}${url.search}`;
  }

  function updatePageURL(page,mode){
    if(!window.history?.[`${mode}State`]) return;
    window.history[`${mode}State`]({},'',pageURL(page));
  }

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
    });
  }

  function matchingCards(){
    return [...archive.querySelectorAll('.news-archive-card')].filter(card=>
      activeCategory==='all'||card.dataset.category===activeCategory
    );
  }

  function syncPageWithHash(cards){
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(!id) return;
    const target=cards.find(card=>card.id===id);
    const index=target?cards.indexOf(target):-1;
    if(index>=0) activePage=Math.floor(index/pageSize)+1;
  }

  function renderPagination(totalPages){
    if(totalPages<=1){
      pagination.hidden=true;
      pagination.replaceChildren();
      return;
    }

    pagination.hidden=false;
    const links=[];
    const link=(label,page,options={})=>{
      const disabled=options.disabled?' aria-disabled="true" tabindex="-1"':'';
      const current=options.current?' aria-current="page"':'';
      const className=`news-page-link${options.current?' on':''}${options.disabled?' disabled':''}`;
      return `<a class="${className}" href="${pageURL(page)}" data-page="${page}"${disabled}${current}>${label}</a>`;
    };

    links.push(link('Anterior',Math.max(1,activePage-1),{disabled:activePage===1}));
    for(let page=1;page<=totalPages;page+=1){
      links.push(link(String(page),page,{current:page===activePage}));
    }
    links.push(link('Siguiente',Math.min(totalPages,activePage+1),{disabled:activePage===totalPages}));
    pagination.innerHTML=links.join('');
  }

  function apply(options={}){
    prepareCards();
    archive.classList.toggle('is-grid',activeView==='grid');
    archive.classList.toggle('is-list',activeView==='list');
    if(tools) tools.dataset.activeCategory=categoryClass(activeCategory==='all'?'':activeCategory);

    const allCards=[...archive.querySelectorAll('.news-archive-card')];
    const cards=matchingCards();
    if(options.syncHash) syncPageWithHash(cards);

    const totalPages=Math.max(1,Math.ceil(cards.length/pageSize));
    activePage=Math.min(Math.max(activePage,1),totalPages);
    const start=(activePage-1)*pageSize;
    const end=start+pageSize;
    const visibleCards=new Set(cards.slice(start,end));

    allCards.forEach(card=>{
      card.hidden=!visibleCards.has(card);
      if(card.hidden) card.classList.remove('is-flipped');
    });

    toggle.querySelectorAll('.view-btn').forEach(button=>{
      const on=button.dataset.view===activeView;
      button.classList.toggle('on',on);
      button.setAttribute('aria-pressed',String(on));
    });

    if(results){
      const first=cards.length?start+1:0;
      const last=Math.min(end,cards.length);
      const suffix=activeCategory==='all'?'noticias':'noticias seleccionadas';
      results.textContent=`Mostrando ${first}-${last} de ${cards.length} ${suffix}`;
    }
    renderPagination(totalPages);
  }

  filters.addEventListener('click',event=>{
    const button=event.target.closest('.news-filter');
    if(!button) return;
    activeCategory=button.dataset.category;
    activePage=1;
    filters.querySelectorAll('.news-filter').forEach(item=>{
      const on=item===button;
      item.classList.toggle('on',on);
      item.setAttribute('aria-pressed',String(on));
    });
    apply();
    updatePageURL(activePage,'replace');
  });

  toggle.addEventListener('click',event=>{
    const button=event.target.closest('.view-btn');
    if(!button) return;
    activeView=button.dataset.view;
    try{localStorage.setItem('moderlode-news-view',activeView)}catch(e){}
    apply();
  });

  pagination.addEventListener('click',event=>{
    const link=event.target.closest('[data-page]');
    if(!link||link.getAttribute('aria-disabled')==='true') return;
    event.preventDefault();
    activePage=Number(link.dataset.page)||1;
    apply();
    updatePageURL(activePage,'push');
    tools?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  window.addEventListener('popstate',()=>{
    activePage=readPage();
    apply({syncHash:true});
  });

  window.addEventListener('hashchange',()=>{
    apply({syncHash:true});
    requestAnimationFrame(()=>document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({block:'center'}));
  });

  const observer=new MutationObserver(()=>apply({syncHash:true}));
  observer.observe(archive,{childList:true,subtree:false});
  apply({syncHash:true});

  if(window.location.hash){
    requestAnimationFrame(()=>document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView({block:'center'}));
  }
})();
