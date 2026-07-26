(function(){
  const links={
    'playstation-fin-formato-fisico':'/noticias/playstation-fin-formato-fisico'
  };

  function decorate(){
    document.querySelectorAll('[data-news-id],.news-archive-card').forEach(card=>{
      const id=card.dataset.newsId||card.id;
      const href=links[id];
      if(!href||card.querySelector('[data-news-article-link]')) return;
      const target=card.querySelector('.news-sources')||card.querySelector('.news-archive-body')||card;
      const link=document.createElement('a');
      link.href=href;
      link.className='news-trailer';
      link.dataset.newsArticleLink='';
      link.innerHTML='<span>Leer análisis completo</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      target.append(link);
    });
  }

  const observer=new MutationObserver(decorate);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  decorate();
})();
