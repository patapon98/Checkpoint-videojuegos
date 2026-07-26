(function(){
  const copy={
    es:{
      title:'Final Secreto | Noticias, lanzamientos, análisis y reseñas',
      description:'Noticias relevantes de videojuegos, próximos lanzamientos, análisis de industria y reseñas escogidas personalmente. Sin ruido, relleno ni clickbait.',
      heroTitle:'Todo lo que importa de los videojuegos, en un mismo lugar.',
      heroSub:'Noticias relevantes, grandes lanzamientos, análisis y reseñas con un toque único, escogidos personalmente para no hacerte perder el tiempo.'
    },
    en:{
      title:'Final Secreto | Video game news, releases, analysis and reviews',
      description:'Relevant video game news, upcoming releases, industry analysis and personally selected reviews. No noise, filler or clickbait.',
      heroTitle:'Everything that matters in video games, all in one place.',
      heroSub:'Relevant news, major releases, analysis and reviews with a distinctive touch, personally selected so you do not waste your time.'
    }
  };

  function setMeta(selector,attribute,value){
    const element=document.querySelector(selector);
    if(element) element.setAttribute(attribute,value);
  }

  function apply(lang){
    const selected=copy[lang]||copy.es;
    document.title=selected.title;
    setMeta('meta[name="description"]','content',selected.description);
    setMeta('meta[property="og:title"]','content',selected.title);
    setMeta('meta[property="og:description"]','content',selected.description);

    const heroTitle=document.querySelector('[data-i18n-html="hero_title"]');
    const heroSub=document.querySelector('[data-i18n="hero_sub"]');
    if(heroTitle) heroTitle.textContent=selected.heroTitle;
    if(heroSub) heroSub.textContent=selected.heroSub;

    const websiteSchema=document.querySelector('script[type="application/ld+json"]');
    if(websiteSchema){
      try{
        const data=JSON.parse(websiteSchema.textContent);
        if(data['@type']==='WebSite'){
          data.description=selected.description;
          websiteSchema.textContent=JSON.stringify(data,null,2);
        }
      }catch(error){}
    }
  }

  function currentLanguage(){
    return document.documentElement.lang==='en'?'en':'es';
  }

  apply(currentLanguage());

  ['btn-es','btn-en'].forEach(id=>{
    document.getElementById(id)?.addEventListener('click',()=>{
      requestAnimationFrame(()=>apply(currentLanguage()));
    });
  });
})();