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
  load('main-core.js?v=20260726-3',()=>{
    if(!document.body.classList.contains('calendar-page')) return;
    load('calendar-images.js',()=>load('calendar-labels.js',()=>{
      load('calendar-trailers.js');
      load('calendar-gcal.js');
      load('calendar-mosaic.js',()=>load('calendar-view.js?v=20260726-3'));
    }));
  });
})();
