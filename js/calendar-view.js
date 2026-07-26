(function(){
  const releases=document.getElementById('releases');
  const toggle=document.getElementById('viewToggle');
  if(!releases||!toggle) return;

  /*
   * Alterna entre la cuadrícula y la lista densa. Ambas vistas usan el mismo
   * HTML, pero los mosaicos destacados pueden cargar una imagen de mayor
   * resolución sin penalizar la vista de lista ni descargar todos los banners
   * HD de golpe.
   */

  const STORAGE_KEY='finalsecreto:calendar-view';
  const buttons=[...toggle.querySelectorAll('.view-btn')];
  const gridButton=buttons.find(btn=>btn.dataset.view==='grid');
  const listButton=buttons.find(btn=>btn.dataset.view==='list');
  const featuredImages=[...releases.querySelectorAll('.release[data-tier="1"] .release-art img,.release[data-tier="2"] .release-art img')];
  let artworkObserver=null;

  /* La opción principal queda visualmente a la izquierda. */
  if(gridButton) toggle.prepend(gridButton);
  if(listButton) toggle.append(listButton);

  /*
   * data-grid-art permite indicar manualmente una imagen concreta en el HTML.
   * Cuando no existe, se intenta obtener la versión original de las fuentes que
   * actualmente usa el calendario. Si una URL no responde, se conserva la
   * miniatura de lista.
   */
  function inferGridArt(source){
    if(!source) return '';

    try{
      const url=new URL(source,document.baseURI);

      if(url.hostname==='media.rawg.io'){
        const originalPath=url.pathname.replace(/^\/media\/resize\/\d+\/-\//,'/media/');
        if(originalPath!==url.pathname){
          url.pathname=originalPath;
          return url.href;
        }
      }

      if(url.hostname==='image.api.playstation.com'){
        const before=url.href;
        url.searchParams.delete('thumb');
        url.searchParams.delete('w');
        url.searchParams.delete('h');
        if(url.href!==before) return url.href;
      }

      if(url.hostname.endsWith('steamstatic.com')){
        const app=url.pathname.match(/\/(?:store_item_assets\/)?steam\/apps\/(\d+)\//);
        if(app) return `${url.origin}/store_item_assets/steam/apps/${app[1]}/header.jpg`;
      }
    }catch(err){
      return '';
    }

    return '';
  }

  function prepareArtwork(img){
    if(img.dataset.listSrc) return;

    const release=img.closest('.release');
    const listSrc=img.getAttribute('src')||img.src;
    const gridSrc=release?.dataset.gridArt||inferGridArt(listSrc);

    img.dataset.listSrc=listSrc;
    if(gridSrc&&gridSrc!==listSrc) img.dataset.gridSrc=gridSrc;
  }

  function useGridArtwork(img){
    prepareArtwork(img);
    const gridSrc=img.dataset.gridSrc;
    if(!gridSrc||img.dataset.gridFailed==='true') return;

    if(img.dataset.gridLoaded==='true'){
      img.src=gridSrc;
      img.dataset.usingGridArt='true';
      return;
    }

    if(img.dataset.gridLoading==='true') return;
    img.dataset.gridLoading='true';

    const probe=new Image();
    probe.decoding='async';
    probe.addEventListener('load',()=>{
      img.dataset.gridLoading='false';
      img.dataset.gridLoaded='true';
      if(releases.classList.contains('view-grid')){
        img.src=gridSrc;
        img.dataset.usingGridArt='true';
      }
    },{once:true});
    probe.addEventListener('error',()=>{
      img.dataset.gridLoading='false';
      img.dataset.gridFailed='true';
    },{once:true});
    probe.src=gridSrc;
  }

  function restoreListArtwork(img){
    prepareArtwork(img);
    if(img.dataset.usingGridArt!=='true') return;
    img.src=img.dataset.listSrc;
    img.dataset.usingGridArt='false';
  }

  function updateArtwork(grid){
    artworkObserver?.disconnect();
    artworkObserver=null;

    if(!grid){
      featuredImages.forEach(restoreListArtwork);
      return;
    }

    if(!('IntersectionObserver' in window)){
      featuredImages.forEach(useGridArtwork);
      return;
    }

    artworkObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const img=entry.target.querySelector('.release-art img');
        if(img) useGridArtwork(img);
        artworkObserver?.unobserve(entry.target);
      });
    },{rootMargin:'500px 0px'});

    featuredImages.forEach(img=>{
      const release=img.closest('.release');
      if(release) artworkObserver.observe(release);
    });
  }

  function apply(view){
    const grid=view==='grid';
    releases.classList.toggle('view-grid',grid);
    updateArtwork(grid);

    buttons.forEach(btn=>{
      const on=btn.dataset.view===(grid?'grid':'list');
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-pressed',String(on));
    });
  }

  let saved=null;
  try{ saved=localStorage.getItem(STORAGE_KEY); }catch(err){ saved=null; }
  apply(saved==='list'?'list':'grid');

  toggle.addEventListener('click',event=>{
    const btn=event.target.closest('.view-btn');
    if(!btn) return;
    const view=btn.dataset.view;
    apply(view);
    try{ localStorage.setItem(STORAGE_KEY,view); }catch(err){ /* modo privado: no se recuerda */ }
  });
})();