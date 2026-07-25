(function(){
  const root=document.getElementById('releases');
  if(!root) return;

  /* Estilos propios para que el botón siga visible también en fichas compactas. */
  if(!document.getElementById('calendarGcalStyles')){
    const styles=document.createElement('link');
    styles.id='calendarGcalStyles';
    styles.rel='stylesheet';
    styles.href=new URL('../css/calendar-gcal.css',document.currentScript.src).href;
    document.head.append(styles);
  }

  /*
   * Botón "añadir a Google Calendar" para cada lanzamiento pendiente.
   * Funciona tanto antes como después de que calendar-mosaic.js agrupe los
   * lanzamientos dentro de .month-group, evitando depender del orden de carga.
   */

  const MONTHS_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const pad=value=>String(value).padStart(2,'0');
  const stamp=date=>`${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}`;

  const today=new Date();
  const todayUTC=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());

  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>';

  function monthForRelease(release){
    const group=release.closest('.month-group[data-group-month]');
    if(group?.dataset.groupMonth) return group.dataset.groupMonth;

    let sibling=release.previousElementSibling;
    while(sibling){
      if(sibling.classList.contains('month-label')&&sibling.dataset.month){
        return sibling.dataset.month;
      }
      sibling=sibling.previousElementSibling;
    }
    return null;
  }

  root.querySelectorAll('.release').forEach(release=>{
    const currentMonth=monthForRelease(release);
    if(!currentMonth) return;
    if(release.querySelector('.hype-out')) return;
    if(release.querySelector('.release-art .gcal')) return;

    const art=release.querySelector('.release-art');
    const heading=release.querySelector('h4');
    const day=Number(release.querySelector('.rdate b')?.textContent.trim());
    if(!art||!heading||!Number.isInteger(day)||day<1||day>31) return;

    const [year,month]=currentMonth.split('-').map(Number);
    if(!year||!month) return;

    const start=new Date(Date.UTC(year,month-1,day));
    if(Number.isNaN(start.getTime())||start.getTime()<todayUTC) return;
    const end=new Date(start.getTime()+86400000);

    const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();
    const platforms=release.querySelector('.platforms')?.textContent.trim()||'';
    const readable=`${day} de ${MONTHS_ES[month-1]} de ${year}`;

    const details=[
      `Lanzamiento de ${title}.`,
      platforms?`Plataformas: ${platforms}.`:'',
      '',
      'Fecha recogida del calendario de lanzamientos de Moderlode.'
    ].filter(Boolean).join('\n');

    const params=new URLSearchParams({
      action:'TEMPLATE',
      text:`${title} — Lanzamiento`,
      dates:`${stamp(start)}/${stamp(end)}`,
      details
    });

    const link=document.createElement('a');
    link.className='gcal';
    link.href=`https://calendar.google.com/calendar/render?${params}`;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.title='Añadir el lanzamiento a Google Calendar';
    link.setAttribute('aria-label',`Añadir a Google Calendar el lanzamiento de ${title}, el ${readable}`);
    link.innerHTML=icon;
    art.append(link);
  });
})();
