(function(){
  const archive=document.getElementById('newsArchive');
  const filters=document.getElementById('newsFilters');
  const toggle=document.getElementById('newsViewToggle');
  const results=document.getElementById('newsResults');
  const tools=document.querySelector('.news-tools');
  const news=Array.isArray(window.FINALSECRETO_NEWS)?window.FINALSECRETO_NEWS:[];
  if(!archive||!filters||!toggle) return;

  const desktopPageSize=10;
  const mobilePageSize=9;
  const mobileQuery=window.matchMedia('(max-width: 700px)');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STORAGE_KEY='finalsecreto:news-view';
  const viewButtons=[...toggle.querySelectorAll('.view-btn')];
  const gridButton=viewButtons.find(button=>button.dataset.view==='grid');
  const listButton=viewButtons.find(button=>button.dataset.view==='list');
  let activeCategory='all';
  let activeView='grid';
  let activePage=readPage();
  let mobileSlide=0;
  let pagination=document.getElementById('newsPagination');
  let mobileCarousel=null;
  let mobileTrack=null;
  let mobileDots=null;
  let mobilePrevious=null;
  let mobileNext=null;

  /* La vista principal aparece primero, igual que en el Calendario. */
  if(gridButton) toggle.prepend(gridButton);
  if(listButton) toggle.append(listButton);

  if(!pagination){
    pagination=document.createElement('nav');
    pagination.id='newsPagination';
    pagination.className='news-pagination';
    pagination.setAttribute('aria-label','Paginación de noticias');
    archive.insertAdjacentElement('afterend',pagination);
  }

  /* Nueva clave: la primera visita tras el cambio arranca siempre en cuadrícula. */
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved==='list') activeView='list';
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
    clearHashSelection();
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

  function featuredCard(cards){
    return cards.find(card=>card.classList.contains('news-featured'))||null;
  }

  function recentCards(cards){
    const featured=featuredCard(cards);
    return cards.filter(card=>card!==featured);
  }

  function syncToolsPosition(featured){
    if(!tools||!results) return;
    if(mobileQuery.matches){
      if(tools.parentElement!==archive||tools.previousElementSibling!==featured){
        if(featured) featured.insertAdjacentElement('afterend',tools);
        else archive.prepend(tools);
      }
      if(results.parentElement!==archive||results.previousElementSibling!==tools){
        tools.insertAdjacentElement('afterend',results);
      }
    }else{
      if(tools.parentElement!==archive.parentElement||tools.nextElementSibling!==archive){
        archive.parentElement.insertBefore(tools,archive);
      }
      if(results.parentElement!==archive.parentElement||results.previousElementSibling!==tools){
        tools.insertAdjacentElement('afterend',results);
      }
    }
  }

  function ensureMobileCarousel(){
    if(mobileCarousel?.isConnected) return;
    mobileCarousel=document.createElement('div');
    mobileCarousel.className='news-mobile-carousel';
    mobileCarousel.dataset.newsMobileCarousel='';
    mobileCarousel.innerHTML=`
      <div class="news-mobile-viewport">
        <div class="news-mobile-track" data-news-mobile-track></div>
        <span class="news-swipe-hint" data-news-mobile-swipe-hint aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </div>
      <div class="news-carousel-controls news-mobile-controls" aria-label="Más noticias recientes">
        <button type="button" data-news-mobile-prev aria-label="Noticia anterior">←</button>
        <div class="news-carousel-dots" data-news-mobile-dots></div>
        <button type="button" data-news-mobile-next aria-label="Noticia siguiente">→</button>
      </div>`;
    archive.append(mobileCarousel);
    mobileTrack=mobileCarousel.querySelector('[data-news-mobile-track]');
    mobileDots=mobileCarousel.querySelector('[data-news-mobile-dots]');
    mobilePrevious=mobileCarousel.querySelector('[data-news-mobile-prev]');
    mobileNext=mobileCarousel.querySelector('[data-news-mobile-next]');

    [...archive.querySelectorAll(':scope > .news-archive-card:not(.news-featured)')].forEach(card=>mobileTrack.append(card));

    mobilePrevious.addEventListener('click',()=>showMobileSlide(mobileSlide-1));
    mobileNext.addEventListener('click',()=>showMobileSlide(mobileSlide+1));
    mobileDots.addEventListener('click',event=>{
      const dot=event.target.closest('[data-mobile-slide]');
      if(dot) showMobileSlide(Number(dot.dataset.mobileSlide));
    });

    let pointerStart=null;
    const viewport=mobileCarousel.querySelector('.news-mobile-viewport');
    viewport.addEventListener('pointerdown',event=>{
      if(event.target.closest('a,button')) return;
      pointerStart={x:event.clientX,y:event.clientY};
    });
    viewport.addEventListener('pointerup',event=>{
      if(!pointerStart) return;
      const deltaX=event.clientX-pointerStart.x;
      const deltaY=event.clientY-pointerStart.y;
      pointerStart=null;
      if(Math.abs(deltaX)<45||Math.abs(deltaX)<=Math.abs(deltaY)*1.15) return;
      showMobileSlide(mobileSlide+(deltaX<0?1:-1));
    });
    viewport.addEventListener('pointercancel',()=>{pointerStart=null;});

    let seenSwipeHint=true;
    try{seenSwipeHint=sessionStorage.getItem('finalsecreto:seen-news-archive-carousel-hint')==='1'}catch(e){}
    if(!seenSwipeHint&&!reducedMotion){
      const trigger=()=>{
        mobileTrack.classList.add('peek-nudge');
        mobileTrack.addEventListener('animationend',()=>mobileTrack.classList.remove('peek-nudge'),{once:true});
        const arrow=mobileCarousel.querySelector('[data-news-mobile-swipe-hint]');
        arrow?.classList.add('show');
        arrow?.addEventListener('animationend',()=>arrow.classList.remove('show'),{once:true});
        try{sessionStorage.setItem('finalsecreto:seen-news-archive-carousel-hint','1')}catch(e){}
      };
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{
          if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();trigger();}
        },{threshold:.6});
        observer.observe(mobileCarousel);
      }else trigger();
    }
  }

  function showMobileSlide(index){
    if(!mobileTrack) return;
    const slides=[...mobileTrack.querySelectorAll('.news-archive-card:not([hidden])')];
    mobileSlide=Math.max(0,Math.min(index,Math.max(0,slides.length-1)));
    const offset=slides[mobileSlide]?.offsetLeft||0;
    mobileTrack.style.transform=`translateX(-${offset}px)`;
    slides.forEach((card,cardIndex)=>{
      const hidden=cardIndex!==mobileSlide;
      card.setAttribute('aria-hidden',String(hidden));
      card.inert=hidden;
    });
    [...mobileDots.querySelectorAll('[data-mobile-slide]')].forEach((dot,dotIndex)=>{
      const active=dotIndex===mobileSlide;
      dot.classList.toggle('on',active);
      dot.setAttribute('aria-pressed',String(active));
    });
    mobilePrevious.disabled=mobileSlide===0;
    mobileNext.disabled=mobileSlide===slides.length-1;
  }

  function refreshMobileCarousel(cards,options={}){
    ensureMobileCarousel();
    const visible=recentCards(cards).filter(card=>!card.hidden);
    const targetId=options.syncHash?decodeURIComponent(window.location.hash.slice(1)):'';
    const targetIndex=targetId?visible.findIndex(card=>card.id===targetId):-1;
    if(targetIndex>=0) mobileSlide=targetIndex;
    else if(options.resetSlide) mobileSlide=0;
    mobileDots.innerHTML=visible.map((card,index)=>
      `<button type="button" data-mobile-slide="${index}" aria-label="Mostrar noticia ${index+1} de ${visible.length}" aria-pressed="${index===mobileSlide}"></button>`
    ).join('');
    mobileCarousel.hidden=visible.length===0;
    mobileCarousel.classList.toggle('has-single-slide',visible.length<2);
    requestAnimationFrame(()=>showMobileSlide(mobileSlide));
  }

  function syncPageWithHash(cards){
    const id=decodeURIComponent(window.location.hash.slice(1));
    if(!id) return;
    const target=cards.find(card=>card.id===id);
    if(!target) return;
    if(mobileQuery.matches){
      const recent=recentCards(cards);
      if(target.classList.contains('news-featured')) activePage=1;
      else activePage=Math.floor(recent.indexOf(target)/mobilePageSize)+1;
    }else{
      activePage=Math.floor(cards.indexOf(target)/desktopPageSize)+1;
    }
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

    const isMobile=mobileQuery.matches;
    const featured=featuredCard(cards);
    const recent=recentCards(cards);
    syncToolsPosition(featured);
    const totalPages=Math.max(1,Math.ceil((isMobile?recent.length:cards.length)/(isMobile?mobilePageSize:desktopPageSize)));
    activePage=Math.min(Math.max(activePage,1),totalPages);
    const pageSize=isMobile?mobilePageSize:desktopPageSize;
    const start=(activePage-1)*pageSize;
    const end=start+pageSize;
    const visibleCards=new Set(
      isMobile
        ? recent.slice(start,end).concat(activePage===1&&featured?[featured]:[])
        : cards.slice(start,end)
    );

    allCards.forEach(card=>{
      card.hidden=!visibleCards.has(card);
      if(card.hidden) card.classList.remove('is-flipped');
      if(!isMobile){
        card.removeAttribute('aria-hidden');
        card.inert=false;
      }
    });
    if(isMobile) refreshMobileCarousel(cards,options);
    else if(mobileTrack) mobileTrack.style.removeProperty('transform');

    toggle.querySelectorAll('.view-btn').forEach(button=>{
      const on=button.dataset.view===activeView;
      button.classList.toggle('on',on);
      button.setAttribute('aria-pressed',String(on));
    });

    if(results){
      const countSource=isMobile?recent:cards;
      const first=countSource.length?start+1:0;
      const last=Math.min(end,countSource.length);
      const suffix=activeCategory==='all'?'noticias recientes':'noticias recientes seleccionadas';
      results.textContent=`Mostrando ${first}-${last} de ${countSource.length} ${suffix}`;
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
    apply({resetSlide:true});
    updatePageURL(activePage,'replace');
  });

  toggle.addEventListener('click',event=>{
    const button=event.target.closest('.view-btn');
    if(!button) return;
    activeView=button.dataset.view;
    try{localStorage.setItem(STORAGE_KEY,activeView)}catch(e){}
    apply();
  });

  pagination.addEventListener('click',event=>{
    const link=event.target.closest('[data-page]');
    if(!link||link.getAttribute('aria-disabled')==='true') return;
    event.preventDefault();
    activePage=Number(link.dataset.page)||1;
    apply({resetSlide:true});
    updatePageURL(activePage,'push');
    tools?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  window.addEventListener('popstate',()=>{
    activePage=readPage();
    apply({syncHash:true,resetSlide:true});
    settleHashTarget();
  });

  let resizeFrame=0;
  mobileQuery.addEventListener?.('change',()=>{
    cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(()=>{
      activePage=1;
      mobileSlide=0;
      apply({resetSlide:true});
      updatePageURL(activePage,'replace');
    });
  });

  let hashAlignment=0;
  let highlightTimer=0;
  const reducedAnchorMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearHashSelection(except=null){
    archive.querySelectorAll('.news-anchor-selected').forEach(card=>{
      if(card===except) return;
      card.classList.remove('news-anchor-selected','news-anchor-highlight');
      card.querySelector('.news-anchor-marker')?.remove();
      if(card.dataset.newsAnchorFocus==='true'){
        card.removeAttribute('tabindex');
        delete card.dataset.newsAnchorFocus;
      }
    });
  }

  function alignHashTarget(){
    const id=decodeURIComponent(window.location.hash.slice(1));
    const target=id?document.getElementById(id):null;
    if(!target||target.hidden) return;

    clearHashSelection(target);
    target.classList.add('news-anchor-selected');
    let marker=target.querySelector('.news-anchor-marker');
    if(!marker){
      marker=document.createElement('span');
      marker.className='news-anchor-marker';
      marker.setAttribute('aria-hidden','true');
      marker.textContent='Noticia seleccionada';
      const heading=target.querySelector('.news-card-heading');
      (heading?.parentElement||target).insertBefore(marker,heading||null);
    }

    const obstruction=[document.querySelector('header'),tools].reduce((height,element)=>{
      if(!element) return height;
      const position=getComputedStyle(element).position;
      return height+(position==='fixed'||position==='sticky'?element.getBoundingClientRect().height:0);
    },0);
    const rect=target.getBoundingClientRect();
    const available=Math.max(0,window.innerHeight-obstruction);
    const visibleHeight=Math.min(rect.height,available);
    const targetTop=obstruction+Math.max(18,(available-visibleHeight)/2);
    window.scrollTo({
      top:Math.max(0,window.scrollY+rect.top-targetTop),
      behavior:reducedAnchorMotion?'auto':'smooth'
    });

    if(!target.hasAttribute('tabindex')){
      target.tabIndex=-1;
      target.dataset.newsAnchorFocus='true';
    }
    target.focus({preventScroll:true});
    target.classList.remove('news-anchor-highlight');
    void target.offsetWidth;
    target.classList.add('news-anchor-highlight');
    clearTimeout(highlightTimer);
    highlightTimer=window.setTimeout(()=>target.classList.remove('news-anchor-highlight'),2400);
  }

  function settleHashTarget(){
    if(!window.location.hash){
      clearHashSelection();
      return;
    }
    const alignment=++hashAlignment;
    const fontsReady=document.fonts?.ready||Promise.resolve();
    fontsReady.then(()=>{
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(alignment===hashAlignment) alignHashTarget();
      }));
    });
  }

  window.addEventListener('hashchange',()=>{
    apply({syncHash:true});
    settleHashTarget();
  });

  prepareCards();
  ensureMobileCarousel();
  const observer=new MutationObserver(()=>apply({syncHash:true}));
  observer.observe(archive,{childList:true,subtree:false});
  apply({syncHash:true});
  settleHashTarget();
})();
