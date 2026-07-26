(function(){
  const root=document.getElementById('releases');
  if(!root||root.querySelector('[data-release-id="oblivion-remastered-switch-2"]')) return;

  const augustLabel=[...root.querySelectorAll('.month-label[data-month="2026-08"]')][0];
  if(!augustLabel) return;

  const augustReleases=[];
  let node=augustLabel.nextElementSibling;
  while(node&&!node.classList.contains('month-label')){
    if(node.classList.contains('release')) augustReleases.push(node);
    node=node.nextElementSibling;
  }

  const release=document.createElement('div');
  release.className='release reveal';
  release.dataset.plat='switch';
  release.dataset.releaseId='oblivion-remastered-switch-2';
  release.innerHTML='<div class="release-art"><img src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2623190/capsule_616x353.jpg" alt="The Elder Scrolls IV: Oblivion Remastered" loading="lazy"><div class="rdate"><b>11</b><span>Ago</span></div><a class="wish" href="https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch-2/The-Elder-Scrolls-IV-Oblivion-Remastered-3131244.html" target="_blank" rel="noopener" title="Ver en Nintendo" aria-label="Ver The Elder Scrolls IV: Oblivion Remastered en Nintendo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></a></div><div><h4>The Elder Scrolls IV: Oblivion Remastered</h4><div class="platforms">Switch 2 <small style="opacity:.6">(nueva plataforma)</small></div></div><span class="hype hype-mid">Interesante</span>';

  const next=augustReleases.find(item=>{
    const day=Number(item.querySelector('.rdate b')?.textContent||0);
    return day>11;
  });

  if(next) root.insertBefore(release,next);
  else {
    const nextMonth=augustReleases.at(-1)?.nextElementSibling;
    root.insertBefore(release,nextMonth||null);
  }
})();
