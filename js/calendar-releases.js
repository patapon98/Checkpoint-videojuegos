(function(){
  const root=document.getElementById('releases');
  if(!root) return;

  const titleOf=release=>(release.querySelector('h4')?.childNodes[0]?.textContent||release.querySelector('h4')?.textContent||'').trim();
  const findRelease=title=>[...root.querySelectorAll('.release')].find(release=>titleOf(release)===title);
  const monthLabel=month=>[...root.querySelectorAll(`.month-label[data-month="${month}"]`)][0];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observeDynamicRelease=release=>{
    if(reducedMotion||!('IntersectionObserver' in window)){
      release.classList.add('visible');
      return;
    }
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    observer.observe(release);
  };

  const setPlatforms=(title,text,dataPlat)=>{
    const release=findRelease(title);
    if(!release) return;
    release.dataset.plat=dataPlat;
    const platforms=release.querySelector('.platforms');
    if(platforms) platforms.textContent=text;
  };

  const setDate=(title,day,monthText,targetMonth)=>{
    const release=findRelease(title);
    const label=monthLabel(targetMonth);
    if(!release||!label) return;
    const date=release.querySelector('.rdate');
    if(date) date.innerHTML=`<b>${day}</b><span>${monthText}</span>`;
    const siblings=[];
    let node=label.nextElementSibling;
    while(node&&!node.classList.contains('month-label')){
      if(node.classList.contains('release')&&node!==release) siblings.push(node);
      node=node.nextElementSibling;
    }
    const next=siblings.find(item=>Number(item.querySelector('.rdate b')?.textContent||0)>Number(day));
    root.insertBefore(release,next||(siblings.at(-1)?.nextElementSibling||node||null));
  };

  const removeMonth=month=>{
    const label=monthLabel(month);
    if(!label) return;
    let node=label.nextElementSibling;
    while(node&&!node.classList.contains('month-label')){
      const next=node.nextElementSibling;
      node.remove();
      node=next;
    }
    label.remove();
    document.querySelector(`#monthFilter option[value="${month}"]`)?.remove();
  };

  const wishIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  const createRelease=({id,title,day,month,monthText,platforms,dataPlat,image,storeUrl,storeTitle='Ver en la tienda',hype='Interesante'})=>{
    if(root.querySelector(`[data-release-id="${id}"]`)||findRelease(title)) return;
    const label=monthLabel(month);
    if(!label) return;
    const release=document.createElement('div');
    release.className='release reveal';
    release.dataset.plat=dataPlat;
    release.dataset.releaseId=id;
    release.innerHTML=`<div class="release-art"><img src="${image}" alt="${title}" loading="lazy"><div class="rdate"><b>${day}</b><span>${monthText}</span></div><a class="wish" href="${storeUrl}" target="_blank" rel="noopener" title="${storeTitle}" aria-label="${storeTitle}: ${title}">${wishIcon}</a></div><div><h4>${title}</h4><div class="platforms">${platforms}</div></div><span class="hype hype-mid">${hype}</span>`;
    const releases=[];
    let node=label.nextElementSibling;
    while(node&&!node.classList.contains('month-label')){
      if(node.classList.contains('release')) releases.push(node);
      node=node.nextElementSibling;
    }
    const next=releases.find(item=>Number(item.querySelector('.rdate b')?.textContent||0)>Number(day));
    root.insertBefore(release,next||(releases.at(-1)?.nextElementSibling||node||null));
    observeDynamicRelease(release);
  };

  removeMonth('2026-05');

  setPlatforms('The Adventures of Elliot','Switch 2 · PS5 · Xbox Series X|S · PC','switch ps5 xbox pc');
  setPlatforms('Dave the Diver','Switch 2 · Switch · PS5 · PC','switch ps5 pc');
  setPlatforms('Granblue Fantasy: Relink','PS5 · PS4 · PC','ps5 ps4 pc');
  setPlatforms('Deltarune: Chapter 5','Switch 2 · Switch · PS5 · PS4 · PC','switch ps5 ps4 pc');
  setPlatforms('Silent Hill: Townfall','PS5 · PC','ps5 pc');
  setDate('Onimusha: Way of the Sword',4,'Sep','2026-09');

  createRelease({
    id:'oblivion-remastered-switch-2',
    title:'The Elder Scrolls IV: Oblivion Remastered',
    day:11,
    month:'2026-08',
    monthText:'Ago',
    platforms:'Switch 2',
    dataPlat:'switch',
    image:'https://www.nintendo.com/eu/media/images/assets/nintendo_switch_2_games/theelderscrollsivoblivionremastered/16x9_TheElderScrollsIVOblivionRemastered_image1600w.jpg',
    storeUrl:'https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch-2/The-Elder-Scrolls-IV-Oblivion-Remastered-3131244.html',
    storeTitle:'Ver en Nintendo'
  });

  createRelease({
    id:'elden-ring-tarnished-edition',
    title:'Elden Ring: Tarnished Edition',
    day:28,
    month:'2026-08',
    monthText:'Ago',
    platforms:'Switch 2',
    dataPlat:'switch',
    image:'https://p325k7wa.twic.pics/high/elden-ring/elden-ring-tarnished-edition/00-product-page/ERTE-Header-Mobile-2.png',
    storeUrl:'https://en.bandainamcoent.eu/elden-ring/elden-ring-tarnished-edition',
    storeTitle:'Ver ficha oficial'
  });

  createRelease({
    id:'captain-tsubasa-2-world-fighters',
    title:'Captain Tsubasa 2: World Fighters',
    day:28,
    month:'2026-08',
    monthText:'Ago',
    platforms:'PS5 · Xbox Series X|S · Switch · PC',
    dataPlat:'ps5 xbox switch pc',
    image:'https://p325k7wa.twic.pics/high/captain-tsubasa/captain-tsubasa-2-worlds-fighter/00-page-setup/CT2-header-mobile.jpg',
    storeUrl:'https://en.bandainamcoent.eu/captain-tsubasa/captain-tsubasa-2-world-fighters',
    storeTitle:'Ver ficha oficial'
  });

  createRelease({
    id:'valheim-1-0',
    title:'Valheim 1.0',
    day:9,
    month:'2026-09',
    monthText:'Sep',
    platforms:'PC · Xbox · PS5 · Switch 2',
    dataPlat:'pc xbox ps5 switch',
    image:'https://media.rawg.io/media/resize/420/-/screenshots/ad2/ad235d65b89c44add3aaebac1051af87.jpg',
    storeUrl:'https://www.valheimgame.com/news/valheim-has-a-release-date-/',
    storeTitle:'Ver anuncio oficial',
    hype:'Hype alto'
  });
})();