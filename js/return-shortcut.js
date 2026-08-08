(function(){
  const body=document.body;
  const isNews=body.classList.contains('news-page');
  const isCalendar=body.classList.contains('calendar-page');
  if(!isNews&&!isCalendar)return;

  if(!document.querySelector('link[rel="manifest"]')){
    const manifest=document.createElement('link');
    manifest.rel='manifest';
    manifest.href='/manifest.webmanifest';
    document.head.appendChild(manifest);
  }

  const hero=document.querySelector('.article-hero');
  if(!hero||hero.querySelector('[data-return-shortcut]'))return;

  const mobileQuery=window.matchMedia('(max-width:760px), (pointer:coarse)');
  const pageName=isNews?'Noticias':'Calendario';
  let installPrompt=null;

  const isStandalone=()=>window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true;
  const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isAndroid=()=>/android/i.test(navigator.userAgent);

  const wrap=document.createElement('div');
  wrap.className='return-shortcut-wrap';
  wrap.dataset.returnShortcut='';
  wrap.innerHTML=`
    <button class="return-shortcut" type="button" aria-haspopup="dialog" aria-label="Guardar ${pageName} para volver más tarde">
      <svg class="return-shortcut-icon return-shortcut-icon-bookmark" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.7 6.5 21V4.5Z"/></svg>
      <svg class="return-shortcut-icon return-shortcut-icon-home" viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"/><path d="M12 9v3M10.5 10.5h3"/></svg>
      <span class="return-shortcut-label-desktop">Añadir a marcadores</span>
      <span class="return-shortcut-label-mobile">Añadir acceso directo</span>
    </button>`;

  const anchor=isNews?hero.querySelector('.news-page-intro'):hero.querySelector('.section-sub');
  if(anchor)anchor.insertAdjacentElement('afterend',wrap);
  else hero.appendChild(wrap);

  const button=wrap.querySelector('.return-shortcut');
  const mobileLabel=wrap.querySelector('.return-shortcut-label-mobile');

  const layer=document.createElement('div');
  layer.className='return-shortcut-layer';
  layer.hidden=true;
  layer.innerHTML=`
    <div class="return-shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="returnShortcutTitle" aria-describedby="returnShortcutText">
      <button class="return-shortcut-close" type="button" aria-label="Cerrar">×</button>
      <div class="return-shortcut-dialog-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.7 6.5 21V4.5Z"/></svg>
      </div>
      <h2 id="returnShortcutTitle">Guarda Final Secreto</h2>
      <div id="returnShortcutText" class="return-shortcut-copy"></div>
      <button class="return-shortcut-done" type="button">Entendido</button>
    </div>`;
  document.body.appendChild(layer);

  const title=layer.querySelector('#returnShortcutTitle');
  const copy=layer.querySelector('#returnShortcutText');
  const closeButton=layer.querySelector('.return-shortcut-close');
  const doneButton=layer.querySelector('.return-shortcut-done');
  let previousFocus=null;

  function shortcutKeys(){
    const mac=/Mac|iPhone|iPad|iPod/.test(navigator.platform)||/Macintosh/.test(navigator.userAgent);
    return mac?'<kbd>⌘</kbd><span>+</span><kbd>D</kbd>':'<kbd>Ctrl</kbd><span>+</span><kbd>D</kbd>';
  }

  function mobileInstructions(){
    if(isStandalone()){
      title.textContent='Ya lo tienes a mano';
      copy.innerHTML='<p>Final Secreto ya está abierto como acceso directo. Puedes volver desde el icono de tu pantalla de inicio.</p>';
      return;
    }
    title.textContent='Añade Final Secreto a tu inicio';
    if(isIOS()){
      copy.innerHTML='<p>Pulsa <strong>Compartir</strong> en el navegador y después <strong>Añadir a pantalla de inicio</strong>.</p><p class="return-shortcut-note">El icono quedará junto a tus apps para volver con un toque.</p>';
      return;
    }
    if(isAndroid()){
      copy.innerHTML='<p>Abre el menú <strong>⋮</strong> del navegador y elige <strong>Añadir a pantalla de inicio</strong> o <strong>Instalar aplicación</strong>.</p><p class="return-shortcut-note">El nombre puede variar ligeramente según el navegador.</p>';
      return;
    }
    copy.innerHTML='<p>Abre el menú de tu navegador y busca <strong>Añadir a pantalla de inicio</strong>, <strong>Instalar</strong> o una opción equivalente.</p>';
  }

  function desktopInstructions(){
    title.textContent=`Guarda ${pageName}`;
    copy.innerHTML=`<p>Tu navegador no permite que una web cree el marcador por ti. Usa este atajo y confirma:</p><div class="return-shortcut-keys" aria-label="Atajo de teclado">${shortcutKeys()}</div><p class="return-shortcut-note">Así podrás volver directamente a esta sección.</p>`;
  }

  function openDialog(mode){
    if(mode==='mobile')mobileInstructions();
    else desktopInstructions();
    previousFocus=document.activeElement;
    layer.hidden=false;
    requestAnimationFrame(()=>layer.classList.add('is-open'));
    closeButton.focus({preventScroll:true});
  }

  function closeDialog(){
    layer.classList.remove('is-open');
    window.setTimeout(()=>{layer.hidden=true;},180);
    if(previousFocus&&typeof previousFocus.focus==='function')previousFocus.focus({preventScroll:true});
  }

  function updateState(){
    if(mobileQuery.matches&&isStandalone()){
      button.classList.add('is-installed');
      mobileLabel.textContent='Acceso directo añadido';
      button.setAttribute('aria-label','Final Secreto ya está añadido como acceso directo');
    }else{
      button.classList.remove('is-installed');
      mobileLabel.textContent='Añadir acceso directo';
      button.setAttribute('aria-label',`Guardar ${pageName} para volver más tarde`);
    }
  }

  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    installPrompt=event;
    button.classList.add('can-install');
  });

  window.addEventListener('appinstalled',()=>{
    installPrompt=null;
    button.classList.remove('can-install');
    updateState();
  });

  button.addEventListener('click',async()=>{
    if(!mobileQuery.matches){
      openDialog('desktop');
      return;
    }

    if(isStandalone()){
      openDialog('mobile');
      return;
    }

    if(installPrompt){
      installPrompt.prompt();
      try{
        const choice=await installPrompt.userChoice;
        if(choice&&choice.outcome==='accepted'){
          installPrompt=null;
          button.classList.remove('can-install');
        }
      }catch(e){}
      return;
    }

    openDialog('mobile');
  });

  closeButton.addEventListener('click',closeDialog);
  doneButton.addEventListener('click',closeDialog);
  layer.addEventListener('click',event=>{if(event.target===layer)closeDialog();});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!layer.hidden)closeDialog();
    if(event.key==='Tab'&&!layer.hidden){
      const focusable=[closeButton,doneButton];
      const first=focusable[0];
      const last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });

  if(typeof mobileQuery.addEventListener==='function')mobileQuery.addEventListener('change',updateState);
  updateState();
})();
