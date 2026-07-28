(function(){
  if(!document.body.classList.contains('calendar-page'))return;
  if(document.querySelector('.psplus-calendar-entry'))return;

  const stylesheet=document.createElement('link');
  stylesheet.rel='stylesheet';
  stylesheet.href='/css/calendar-psplus-entry.css?v=20260729-1';
  document.head.appendChild(stylesheet);

  const tools=document.querySelector('.calendar-tools');
  if(!tools)return;

  const entry=document.createElement('aside');
  entry.className='psplus-calendar-entry reveal visible';
  entry.setAttribute('aria-label','Calendario de PlayStation Plus');
  entry.innerHTML=`
    <div class="psplus-calendar-entry-symbol" aria-hidden="true">△○</div>
    <div>
      <strong>¿Buscas los juegos de PlayStation Plus?</strong>
      <span>Consulta cada mes qué llega a Essential, Extra y Premium y en qué consolas está disponible.</span>
    </div>
    <a class="psplus-calendar-entry-link" href="/playstation-plus">Ver PlayStation Plus →</a>
  `;
  tools.parentNode.insertBefore(entry,tools);
})();
