(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;
  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };

  load('site-nav.js');
  load('main-core.js',()=>load('calendar-images.js',()=>load('calendar-labels.js',()=>{
    load('calendar-trailers.js');
    load('calendar-gcal.js');
    load('calendar-mosaic.js',()=>load('calendar-view.js'));
  })));
})();
