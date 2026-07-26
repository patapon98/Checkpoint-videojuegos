(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;

  const ensureBrandAssets=()=>{
    let icon=document.querySelector('link[rel~="icon"]');
    if(!icon){
      icon=document.createElement('link');
      icon.rel='icon';
      document.head.appendChild(icon);
    }
    icon.type='image/svg+xml';
    icon.href='/favicon.svg';

    let brandStyles=document.querySelector('link[data-final-secreto-brand]');
    if(!brandStyles){
      brandStyles=document.createElement('link');
      brandStyles.rel='stylesheet';
      brandStyles.href='/css/brand-logo.css';
      brandStyles.dataset.finalSecretoBrand='';
      document.head.appendChild(brandStyles);
    }

    document.querySelectorAll('a.logo').forEach(logo=>{
      if(logo.querySelector('.site-logo-mark')) return;
      const mark=document.createElement('img');
      mark.className='site-logo-mark';
      mark.src='/favicon.svg';
      mark.alt='';
      mark.setAttribute('aria-hidden','true');
      mark.width=36;
      mark.height=36;
      logo.prepend(mark);
    });

    if(location.pathname==='/'||location.pathname==='/index.html'){
      const existing=document.querySelector('script[data-final-secreto-organization]');
      if(!existing){
        const schema=document.createElement('script');
        schema.type='application/ld+json';
        schema.dataset.finalSecretoOrganization='';
        schema.textContent=JSON.stringify({
          '@context':'https://schema.org',
          '@type':'Organization',
          name:'Final Secreto',
          url:'https://finalsecreto.com/',
          logo:'https://finalsecreto.com/favicon.svg'
        });
        document.head.appendChild(schema);
      }
    }
  };

  ensureBrandAssets();

  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };

  load('spanish-only.js');
  load('site-nav.js');
  load('home-news-copy.js');
  load('home-analysis-links.js');
  load('main-core.js',()=>{
    load('home-brand-copy.js');
    load('calendar-images.js',()=>load('calendar-labels.js',()=>{
      load('calendar-trailers.js');
      load('calendar-gcal.js');
      load('calendar-mosaic.js',()=>load('calendar-view.js'));
    }));
  });
})();