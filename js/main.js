(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;

  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };

  load('home-analysis-links.js?v=20260726-2');
  load('home-calendar-updates.js?v=20260727-3');
  load('main-core.js?v=20260728-3',()=>{
    if(!document.body.classList.contains('calendar-page')) return;
    load('calendar-releases.js?v=20260727-7',()=>load('calendar-images.js',()=>load('calendar-labels.js?v=20260727-1',()=>{
      load('calendar-trailers.js');
      load('calendar-new-trailers.js?v=20260727-1');
      load('calendar-gcal.js');
      load('calendar-mosaic.js',()=>load('calendar-view.js?v=20260726-3'));
    })));
  });
})();