(function(){
  const releases=[...document.querySelectorAll('.release[data-release-date]')];
  if(!releases.length) return;

  const current=document.currentScript;
  if(!document.getElementById('calendarTodayStyles')){
    const styles=document.createElement('link');
    styles.id='calendarTodayStyles';
    styles.rel='stylesheet';
    styles.href=new URL('../css/calendar-today.css?v=20260729-2',current?.src||location.href).href;
    document.head.append(styles);
  }

  function madridDate(){
    const parts=new Intl.DateTimeFormat('en-CA',{
      timeZone:'Europe/Madrid',
      year:'numeric',
      month:'2-digit',
      day:'2-digit'
    }).formatToParts(new Date());
    const values=Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  const pageDate=madridDate();

  function rememberBadge(release){
    if(release.dataset.calendarBadgeRemembered) return;
    const badge=release.querySelector(':scope > .hype');
    release.dataset.calendarBadgeRemembered='true';
    release.dataset.calendarBadgeClass=badge?.className||'';
    release.dataset.calendarBadgeText=badge?.textContent.trim()||'';
  }

  function setBadge(release,className,text){
    let badge=release.querySelector(':scope > .hype');
    if(!badge){
      badge=document.createElement('span');
      release.append(badge);
    }
    badge.className=className;
    badge.textContent=text;
  }

  function restoreBadge(release){
    const badge=release.querySelector(':scope > .hype');
    const className=release.dataset.calendarBadgeClass||'';
    const text=release.dataset.calendarBadgeText||'';
    if(!className){
      badge?.remove();
      return;
    }
    setBadge(release,className,text);
  }

  function apply(){
    const today=madridDate();
    if(today!==pageDate){
      location.reload();
      return;
    }

    releases.forEach(release=>{
      rememberBadge(release);
      const date=release.dataset.releaseDate;
      release.classList.toggle('release-today',date===today);
      release.dataset.releaseState=date===today?'today':(date<today?'available':'upcoming');

      if(date===today){
        setBadge(release,'hype hype-today hype-max','Sale hoy');
      }else if(date<today){
        setBadge(release,'hype hype-out','Ya disponible');
      }else{
        restoreBadge(release);
      }
    });
  }

  apply();
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) apply();
  });
  window.setInterval(apply,60000);
})();
