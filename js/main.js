(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;

  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };
  const loadStyle=name=>{
    if(document.querySelector(`link[data-dynamic-style="${name}"]`))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=new URL(name,base).href;
    link.dataset.dynamicStyle=name;
    document.head.appendChild(link);
  };

  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link');
    manifest.rel='manifest';
    manifest.href='/manifest.webmanifest';
    document.head.appendChild(manifest);
  }

  loadStyle('../css/game-hub-links.css?v=20260730-1');
  loadStyle('../css/return-shortcut.css?v=20260808-1');
  if(document.body.classList.contains('home-page')) loadStyle('../css/home-mobile-nav.css?v=20260808-1');
  load('game-hub-links.js?v=20260730-1');
  load('home-analysis-links.js?v=20260728-1');
  load('return-shortcut.js?v=20260808-1');
  if(document.body.classList.contains('home-page')) load('home-featured.js?v=20260808-1');
  load('calendar-today.js?v=20260729-2',()=>{
    load('calendar-countdown-prepare.js?v=20260729-1',()=>{
      load('main-core.js?v=20260730-1',()=>{
        load('calendar-countdown.js?v=20260729-1');
        load('review-lightbox-fixes.js?v=20260808-3');
        if(!document.body.classList.contains('calendar-page')) return;
        load('calendar-psplus-entry.js?v=20260729-2');
        load('calendar-gcal.js',()=>{
          load('calendar-mosaic.js?v=20260729-1',()=>load('calendar-view.js?v=20260729-1'));
        });
      });
    });
  });
})();
