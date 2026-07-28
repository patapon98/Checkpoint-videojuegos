(function(){
  const news=Array.isArray(window.FINALSECRETO_NEWS)?window.FINALSECRETO_NEWS:[];

  function escapeHTML(value){
    return String(value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function articleLink(item){
    const link=document.createElement('a');
    link.href=item.article.url;
    link.className='news-article-link';
    link.dataset.newsArticleLink='';
    link.innerHTML='<span>Leer noticia completa</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    return link;
  }

  function decorate(){
    document.querySelectorAll('[data-news-id],.news-archive-card').forEach(card=>{
      const id=card.dataset.newsId||card.id;
      const item=news.find(entry=>entry.id===id);
      if(!item?.article?.url||card.querySelector('[data-news-article-link]')) return;
      const target=card.querySelector('.news-sources')||card.querySelector('.news-archive-body')||card;
      target.append(articleLink(item));
    });
  }

  function renderArchive(){
    const list=document.getElementById('newsArticleArchiveList');
    if(!list) return;
    const articles=news
      .filter(item=>item.article?.url)
      .sort((a,b)=>(b.publishedAt||b.date).localeCompare(a.publishedAt||a.date));

    list.innerHTML=articles.map(item=>{
      const title=item.title?.es||item.title||'';
      const category=item.category?.es||item.category||'';
      const date=new Intl.DateTimeFormat('es-ES',{
        day:'numeric',
        month:'long',
        year:'numeric',
        timeZone:'UTC'
      }).format(new Date(item.date+'T12:00:00Z'));
      return `
        <a class="news-article-archive-item" href="${escapeHTML(item.article.url)}">
          <span class="news-article-archive-meta">${escapeHTML(category)} · ${escapeHTML(date)}</span>
          <strong>${escapeHTML(title)}</strong>
          <span class="news-article-archive-cta">Leer noticia completa <span aria-hidden="true">→</span></span>
        </a>`;
    }).join('');

    const section=list.closest('.news-article-archive');
    if(section) section.hidden=articles.length===0;
  }

  const observer=new MutationObserver(decorate);
  observer.observe(document.getElementById('newsArchive')||document.documentElement,{subtree:true,childList:true});
  decorate();
  renderArchive();
})();
