(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;

  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };

  load('home-analysis-links.js?v=20260728-1');
  load('home-calendar-updates.js?v=20260727-3');
  load('main-core.js?v=20260729-5',()=>{
    load('review-lightbox-fixes.js?v=20260729-1');
    if(!document.body.classList.contains('calendar-page')) return;
    load('calendar-psplus-entry.js?v=20260729-2');
    load('calendar-releases.js?v=20260727-7',()=>load('calendar-images.js',()=>load('calendar-labels.js?v=20260727-1',()=>{
      load('calendar-trailers.js');
      load('calendar-new-trailers.js?v=20260727-1');
      load('calendar-gcal.js');
      load('calendar-mosaic.js',()=>load('calendar-view.js?v=20260726-3'));
    })));
  });
})();
