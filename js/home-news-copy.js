(function(){
  const title=document.querySelector('[data-i18n="news_title"]');
  const subtitle=document.querySelector('[data-i18n="news_sub"]');
  if(!title||!subtitle) return;

  const copy={
    es:{
      title:'La actualidad, bien explicada',
      subtitle:'Las noticias más importantes del videojuego, seleccionadas por relevancia y explicadas con contexto, fuentes verificadas y perspectiva.'
    },
    en:{
      title:'Gaming news, properly explained',
      subtitle:'The most important stories in video games, selected for relevance and explained with context, verified sources and perspective.'
    }
  };

  function apply(){
    const lang=document.documentElement.lang==='en'?'en':'es';
    title.textContent=copy[lang].title;
    subtitle.textContent=copy[lang].subtitle;
  }

  const stylesheet=new URL('../css/home-news-featured.css',document.currentScript.src).href;
  if(!document.querySelector(`link[href="${stylesheet}"]`)){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=stylesheet;
    document.head.appendChild(link);
  }

  new MutationObserver(apply).observe(document.documentElement,{
    attributes:true,
    attributeFilter:['lang']
  });
  apply();
})();
