(function(){
  if(document.body.classList.contains('calendar-page')) return;
  const root=document.querySelector('#calendario #releases');
  if(!root) return;
  const titleOf=release=>(release.querySelector('h4')?.textContent||'').trim();
  const existing=new Set([...root.querySelectorAll('.release')].map(titleOf));
  const wishIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const add=({title,day,month,image,platforms,dataPlat,url,badge,badgeClass})=>{
    if(existing.has(title)) return;
    const release=document.createElement('div');
    release.className='release';
    release.dataset.plat=dataPlat;
    release.innerHTML=`<div class="release-art"><img src="${image}" alt="${title}" loading="lazy"><div class="rdate"><b>${day}</b><span>${month}</span></div><a class="wish" href="${url}" target="_blank" rel="noopener" title="Ver ficha oficial" aria-label="Ver ficha oficial de ${title}">${wishIcon}</a></div><div><h4>${title}</h4><div class="platforms">${platforms}</div></div><span class="hype ${badgeClass}">${badge}</span>`;
    const gta=[...root.querySelectorAll('.release')].find(item=>titleOf(item)==='Grand Theft Auto VI');
    root.insertBefore(release,gta||null);
  };
  add({title:'Elden Ring: Tarnished Edition',day:28,month:'Ago',image:'https://p325k7wa.twic.pics/high/elden-ring/elden-ring-tarnished-edition/00-product-page/ERTE-Header-Mobile-2.png?twic=v1/cover=1920x1080/quality=100',platforms:'Switch 2',dataPlat:'switch',url:'https://en.bandainamcoent.eu/elden-ring/elden-ring-tarnished-edition',badge:'Nueva plataforma',badgeClass:'hype-mid'});
  add({title:'Valheim 1.0',day:9,month:'Sep',image:'https://img2.storyblok.com/fit-in/1920x1080/f/157036/6001x3323/1f79e49ebe/deep-north-art-2.jpg',platforms:'PC · Xbox · PS5 · Switch 2',dataPlat:'pc xbox ps5 switch',url:'https://www.valheimgame.com/news/valheim-has-a-release-date-/',badge:'Hype alto',badgeClass:'hype-high'});
})();