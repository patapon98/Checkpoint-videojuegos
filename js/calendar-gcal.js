(function(){
  const root=document.getElementById('releases');
  if(!root) return;

  /*
   * Botón "añadir a Google Calendar" para cada lanzamiento pendiente.
   * El año y el mes salen del data-month de la cabecera correspondiente;
   * el día, del recuadro de fecha de la carátula. Los juegos ya publicados
   * se omiten: un evento en el pasado no aporta nada.
   */

  const MONTHS_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const pad=value=>String(value).padStart(2,'0');
  const stamp=date=>`${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}`;

  const today=new Date();
  const todayUTC=Date.UTC(today.getFullYear(),today.getMonth(),today.getDate());

  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/></svg>';

  let currentMonth=null;

  [...root.children].forEach(node=>{
    if(node.classList.contains('month-label')){
      currentMonth=node.dataset.month||null;
      return;
    }
    if(!node.classList.contains('release')||!currentMonth) return;
    if(node.querySelector('.hype-out')) return;
    if(node.querySelector('.release-art .gcal')) return;

    const art=node.querySelector('.release-art');
    const heading=node.querySelector('h4');
    const day=Number(node.querySelector('.rdate b')?.textContent.trim());
    if(!art||!heading||!Number.isInteger(day)||day<1||day>31) return;

    const [year,month]=currentMonth.split('-').map(Number);
    if(!year||!month) return;

    const start=new Date(Date.UTC(year,month-1,day));
    if(Number.isNaN(start.getTime())||start.getTime()<todayUTC) return;
    const end=new Date(start.getTime()+86400000);

    const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();
    const platforms=node.querySelector('.platforms')?.textContent.trim()||'';
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
