(function(){
  const trailers=new Map([
    ['Captain Tsubasa 2: World Fighters','https://www.youtube.com/watch?v=c6yniKaV6io'],
    ['Valheim 1.0','https://www.youtube.com/watch?v=UVq6H0eK8Ck']
  ]);
  const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>';
  document.querySelectorAll('#releases .release').forEach(release=>{
    const heading=release.querySelector('h4');
    const art=release.querySelector('.release-art');
    if(!heading||!art||art.querySelector('.trailer')) return;
    const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();
    const url=trailers.get(title);
    if(!url) return;
    const link=document.createElement('a');
    link.className='trailer';
    link.href=url;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.title='Ver el tráiler oficial en YouTube';
    link.setAttribute('aria-label',`Ver el tráiler oficial de ${title} en YouTube`);
    link.innerHTML=icon;
    art.append(link);
  });
})();