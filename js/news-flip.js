(function(){
  let started=false;

  function onNewsReady(callback){
    if(Array.isArray(window.finalSecretoNews)){
      callback(window.finalSecretoNews);
      return;
    }
    window.addEventListener('finalsecreto:news-ready',event=>{
      callback(Array.isArray(event.detail?.news)?event.detail.news:[]);
    },{once:true});
  }

  onNewsReady(news=>{
    if(started) return;
    started=true;

    const archive=document.getElementById('newsArchive');
    if(!archive) return;

    const escapeHTML=value=>String(value)
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');

    function emphasizedHTML(value,item){
      const raw=String(value);
      const phrases=item.emphasis?.es||[];
      if(!phrases.length) return escapeHTML(raw);
      const matches=phrases.map(phrase=>({phrase,index:raw.indexOf(phrase)}))
        .filter(match=>match.index>=0).sort((a,b)=>a.index-b.index);
      let cursor=0,html='';
      matches.forEach(match=>{
        if(match.index<cursor) return;
        html+=escapeHTML(raw.slice(cursor,match.index));
        html+='<strong>'+escapeHTML(match.phrase)+'</strong>';
        cursor=match.index+match.phrase.length;
      });
      return html+escapeHTML(raw.slice(cursor));
    }

    function importanceBadge(item){
      return item.important&&!item.featured
        ? '<span class="news-important"><i aria-hidden="true">★</i>Relevante</span>'
        : '';
    }

    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealObserver=!reducedMotion&&'IntersectionObserver' in window
      ? new IntersectionObserver(entries=>{
          const entering=entries
            .filter(entry=>entry.isIntersecting)
            .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
          entering.forEach((entry,index)=>{
            entry.target.style.transitionDelay=Math.min(index*55,220)+'ms';
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
            entry.target.addEventListener('transitionend',()=>{
              entry.target.style.removeProperty('transition-delay');
            },{once:true});
          });
        },{threshold:.08,rootMargin:'0px 0px -4% 0px'})
      : null;

    function revealOnScroll(card){
      if(!revealObserver){
        card.classList.add('visible');
        return;
      }
      revealObserver.observe(card);
    }

    function setFlipped(card,flipped,moveFocus){
      const front=card.querySelector('.news-flip-front');
      const back=card.querySelector('.news-flip-back');
      card.classList.toggle('is-flipped',flipped);
      front?.setAttribute('aria-hidden',String(flipped));
      back?.setAttribute('aria-hidden',String(!flipped));
      if(front) front.inert=flipped;
      if(back) back.inert=!flipped;
      front?.querySelector('.news-flip-button')?.setAttribute('aria-expanded',String(flipped));
      back?.querySelector('.news-flip-button')?.setAttribute('aria-expanded',String(flipped));
      if(moveFocus){
        card.querySelector(flipped?'.news-flip-back .news-flip-button':'.news-flip-front .news-flip-button')
          ?.focus({preventScroll:true});
      }
    }

    function enhance(){
      archive.querySelectorAll('.news-archive-card:not([data-flip-ready])').forEach(card=>{
        const item=news.find(entry=>entry.id===card.id);
        const body=card.querySelector('.news-archive-body');
        if(!item||!body) return;

        const signal=card.querySelector('.news-archive-date');
        const date=card.querySelector('.news-card-date');
        const paragraphs=item.homeDetails?.es||[item.summary?.es||'',item.why?.es||''];
        const category=item.category?.es||'';

        const front=document.createElement('section');
        front.className='news-flip-face news-flip-front';
        front.setAttribute('aria-hidden','false');
        front.setAttribute('aria-label','Resumen de la noticia');
        if(signal) front.append(signal);
        front.append(body);

        const open=document.createElement('button');
        open.type='button';
        open.className='news-flip-button';
        open.setAttribute('aria-expanded','false');
        open.innerHTML='<span>Ampliar noticia</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>';
        body.append(open);

        const back=document.createElement('section');
        back.className='news-flip-face news-flip-back';
        back.setAttribute('aria-hidden','true');
        back.inert=true;
        back.innerHTML=`
          <div class="news-back-meta">
            <span class="news-category">${escapeHTML(category)}</span>
            ${importanceBadge(item)}
            <span class="news-back-date news-card-date">${date?.innerHTML||''}</span>
          </div>
          <div class="news-expanded-copy">${paragraphs.map(text=>`<p>${emphasizedHTML(text,item)}</p>`).join('')}</div>`;

        const footer=document.createElement('div');
        footer.className='news-back-footer';
        const sources=body.querySelector('.news-sources')?.cloneNode(true);
        if(sources) footer.append(sources);

        const close=document.createElement('button');
        close.type='button';
        close.className='news-flip-button';
        close.setAttribute('aria-expanded','true');
        close.innerHTML='<span>Volver al resumen</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>';
        footer.append(close);
        back.append(footer);

        const inner=document.createElement('div');
        inner.className='news-flip-inner';
        inner.append(front,back);
        card.replaceChildren(inner);
        card.dataset.flipReady='true';

        revealOnScroll(card);
      });
    }

    archive.addEventListener('click',event=>{
      const button=event.target.closest('.news-flip-button');
      const card=button?.closest('.news-archive-card');
      if(!card) return;
      setFlipped(card,!card.classList.contains('is-flipped'),true);
    });

    archive.addEventListener('keydown',event=>{
      if(event.key!=='Escape') return;
      const card=event.target.closest('.news-archive-card.is-flipped');
      if(!card) return;
      setFlipped(card,false,true);
    });

    const observer=new MutationObserver(enhance);
    observer.observe(archive,{childList:true});
    enhance();
  });
})();
