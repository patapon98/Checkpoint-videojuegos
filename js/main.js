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
  load('calendar-today.js?v=20260729-2',()=>{
    load('calendar-countdown-prepare.js?v=20260729-1',()=>{
      load('main-core.js?v=20260729-6',()=>{
        load('calendar-countdown.js?v=20260729-1');
        load('review-lightbox-fixes.js?v=20260729-1');
        if(!document.body.classList.contains('calendar-page')) return;
        load('calendar-psplus-entry.js?v=20260729-2');
        load('calendar-gcal.js',()=>{
          load('calendar-mosaic.js?v=20260729-1',()=>load('calendar-view.js?v=20260729-1'));
        });
      });
    });
  });
})();
