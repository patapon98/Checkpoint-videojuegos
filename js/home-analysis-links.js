(function(){
  const label='Leer noticia completa';

  function articleUrlFor(newsId){
    const news=Array.isArray(window.FINALSECRETO_NEWS)?window.FINALSECRETO_NEWS:[];
    return news.find(item=>item.id===newsId)?.article?.url||'';
  }

  function createLink(url,title){
    const link=document.createElement('a');
    link.className='news-home-analysis-link';
    link.href=url;
    link.setAttribute('aria-label',`${label}. ${title}`);
    link.innerHTML=`<span>${label}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
    return link;
  }

  function enhanceCard(card){
    const url=articleUrlFor(card.dataset.newsId);
    if(!url) return;
    const title=card.querySelector('h3')?.textContent?.trim()||'';

    card.querySelectorAll('.news-home-flip-face').forEach(face=>{
      if(face.querySelector('.news-home-analysis-link')) return;
      const flipButton=face.querySelector('[data-home-flip]');
      if(!flipButton) return;

      let actions=flipButton.closest('.news-home-actions');
      if(!actions){
        actions=document.createElement('div');
        actions.className='news-home-actions';
        flipButton.replaceWith(actions);
        actions.append(flipButton);
      }
      actions.prepend(createLink(url,title));
    });
  }

  function enhance(){
    document.querySelectorAll('.news-home-flip[data-news-id]').forEach(enhanceCard);
  }

  const style=document.createElement('style');
  style.textContent=`
    .news-home-actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:16px}
    .news-home-actions .news-home-flip-button{margin-top:0}
    .news-home-analysis-link{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:7px 11px;border:1px solid transparent;border-radius:999px;background:var(--button-bg);color:var(--button-ink);font-size:.7rem;font-weight:800;line-height:1;transition:transform .2s,background .2s,color .2s}
    .news-home-analysis-link:hover{background:var(--accent);transform:translateY(-2px)}
    .news-home-analysis-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
    .news-home-analysis-link svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    @media(max-width:620px){.news-home-actions{align-items:stretch}.news-home-analysis-link{flex:1 1 auto}}
  `;
  document.head.append(style);

  enhance();
  const home=document.getElementById('newsHome');
  if(home){
    new MutationObserver(enhance).observe(home,{childList:true,subtree:true});
  }
})();
