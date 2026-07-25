(function(){
  const releases=document.getElementById('releases');
  const toggle=document.getElementById('viewToggle');
  if(!releases||!toggle) return;

  /*
   * Alterna entre la lista densa y la cuadrícula de tres columnas.
   * Ambas vistas usan el mismo HTML: solo cambia una clase en el contenedor,
   * así que el buscador, los filtros y los iconos siguen funcionando igual.
   */

  const STORAGE_KEY='moderlode:calendar-view';
  const buttons=[...toggle.querySelectorAll('.view-btn')];

  function apply(view){
    const grid=view==='grid';
    releases.classList.toggle('view-grid',grid);
    buttons.forEach(btn=>{
      const on=btn.dataset.view===(grid?'grid':'list');
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-pressed',String(on));
    });
  }

  let saved=null;
  try{ saved=localStorage.getItem(STORAGE_KEY); }catch(err){ saved=null; }
  apply(saved==='grid'?'grid':'list');

  toggle.addEventListener('click',event=>{
    const btn=event.target.closest('.view-btn');
    if(!btn) return;
    const view=btn.dataset.view;
    apply(view);
    try{ localStorage.setItem(STORAGE_KEY,view); }catch(err){ /* modo privado: no se recuerda */ }
  });
})();
