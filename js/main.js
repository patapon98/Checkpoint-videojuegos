(function(){
  const current=document.currentScript;
  const base=current?.src||location.href;
  const load=(name,onload)=>{
    const script=document.createElement('script');
    script.src=new URL(name,base).href;
    script.onload=onload||null;
    document.head.appendChild(script);
  };
  load('main-core.js',()=>load('calendar-labels.js',()=>load('calendar-trailers.js')));
})();
