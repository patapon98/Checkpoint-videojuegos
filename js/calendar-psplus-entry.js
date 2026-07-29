(function(){
  if(!document.body.classList.contains('calendar-page'))return;
  if(document.querySelector('.psplus-calendar-entry'))return;

  const stylesheet=document.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href='/css/calendar-psplus-entry.css?v=20260729-2';
  document.head.appendChild(stylesheet);

  const tools=document.querySelector('.calendar-tools');
  if(!tools)return;

  const entry=document.createElement('aside');
  entry.className='psplus-calendar-entry reveal';
  entry.setAttribute('aria-label','Calendario de PlayStation Plus');
  entry.innerHTML=`
    <img class="psplus-calendar-entry-symbol" src="/img/playstation-plus-mark.svg?v=20260729-2" alt="" aria-hidden="true" width="54" height="54" decoding="async">
    <div>
      <strong>¿Buscas los juegos de PlayStation Plus?</strong>
      <span>Consulta cada mes qué llega a Essential, Extra y Premium y en qué consolas está disponible.</span>
    </div>
    <a class="psplus-calendar-entry-link" href="/playstation-plus">Ver PlayStation Plus →</a>
  `;
  tools.parentNode.insertBefore(entry,tools);

  let revealed=false;
  const reveal=()=>{
    if(revealed)return;
    revealed=true;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      entry.classList.add('visible');
      return;
    }
    entry.getBoundingClientRect();
    requestAnimationFrame(()=>requestAnimationFrame(()=>entry.classList.add('visible')));
  };

  if(stylesheet.sheet)reveal();
  else stylesheet.addEventListener('load',reveal,{once:true});
  window.setTimeout(reveal,700);
})();