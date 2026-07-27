(function(){
  /*
   * El "+" de la carátula enlaza a destinos distintos según el juego (Steam,
   * PlayStation Store, la ficha oficial de la editora...). Cuando el destino
   * es una tienda reconocible, sustituimos el icono genérico por el de esa
   * tienda para que el usuario sepa a dónde va antes de pulsar.
   *
   * Corre en cualquier página con enlaces .wish, tanto los que ya vienen en
   * el HTML como los que añaden después otros scripts (calendar-releases.js,
   * home-calendar-updates.js, calendar-mosaic.js...), así que no asumimos
   * ningún orden de carga: un MutationObserver cubre las incorporaciones
   * tardías.
   */

  const STEAM_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.616C1.516 20.279 6.146 24 11.979 24c6.627 0 12.021-5.373 12.021-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012zm10.16-9.34c0-1.66-1.352-3.011-3.013-3.011-1.664 0-3.014 1.352-3.014 3.011 0 1.663 1.35 3.013 3.014 3.013 1.66 0 3.013-1.35 3.013-3.013zm-5.276-.005c0-1.252 1.013-2.266 2.263-2.266 1.249 0 2.262 1.014 2.262 2.266 0 1.251-1.013 2.265-2.262 2.265-1.25 0-2.263-1.014-2.263-2.265z"/></svg>';
  const PLAYSTATION_ICON='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 3.6 12.9 4.4 12.9 19.4 10.6 20.2Z"/><path d="M12.9 4.6c2.4.5 4 2 4 3.9 0 2.1-1.7 3.6-4 3.4"/><path d="M3.9 17.8 10.6 15.3"/><path d="M12.9 15.8 20.1 13"/></svg>';

  const ICONS_BY_HOST={
    'store.steampowered.com':{icon:STEAM_ICON,cls:'wish-steam'},
    'store.playstation.com':{icon:PLAYSTATION_ICON,cls:'wish-playstation'}
  };

  function matchFor(href){
    try{
      const host=new URL(href,document.baseURI).hostname;
      return ICONS_BY_HOST[host]||null;
    }catch(err){
      return null;
    }
  }

  function upgrade(link){
    if(!link||link.dataset.wishIconReady) return;
    const match=matchFor(link.getAttribute('href'));
    if(!match) return;
    link.innerHTML=match.icon;
    link.classList.add(match.cls);
    link.dataset.wishIconReady='true';
  }

  function scan(node){
    if(!(node instanceof Element)) return;
    if(node.matches('a.wish')) upgrade(node);
    node.querySelectorAll?.('a.wish').forEach(upgrade);
  }

  scan(document.body);

  new MutationObserver(mutations=>{
    mutations.forEach(mutation=>{
      mutation.addedNodes.forEach(scan);
    });
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
