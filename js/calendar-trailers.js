(function(){
  const releases=document.querySelectorAll('#releases .release');
  if(!releases.length) return;

  /*
   * Tráilers oficiales en YouTube.
   * Cada entrada apunta al vídeo publicado por la editora o la plataforma
   * (PlayStation, Xbox, Nintendo, Konami, Capcom, Bandai Namco, Rockstar...),
   * priorizando el tráiler de lanzamiento o de fecha sobre los teasers antiguos.
   */
  const trailers=new Map([
    ['Directive 8020','https://www.youtube.com/watch?v=QgGQe-tilcE'],
    ['Forza Horizon 6','https://www.youtube.com/watch?v=c6O5J-8dz90'],
    ['LEGO Batman: Legacy of the Dark Knight','https://www.youtube.com/watch?v=DfJaUpW_P00'],
    ['007 First Light','https://www.youtube.com/watch?v=jfRZRwu4aEc'],
    ['Gothic 1 Remake','https://www.youtube.com/watch?v=6Qh24rZDaU4'],
    ['The Adventures of Elliot','https://www.youtube.com/watch?v=0xfxIcWTBIY'],
    ['Dave the Diver','https://www.youtube.com/watch?v=HCYultesGEg'],
    ['Deltarune: Chapter 5','https://www.youtube.com/watch?v=P3rE7su1Fxg'],
    ['Star Fox','https://www.youtube.com/watch?v=SBKbRlPix2U'],
    ['DOOM: The Dark Ages | Revelations','https://www.youtube.com/watch?v=nL_JF1ZNllI'],
    ['AC Black Flag Resynced','https://www.youtube.com/watch?v=U9EmVkQ5v54'],
    ['Granblue Fantasy: Relink','https://www.youtube.com/watch?v=klUbdrmc618'],
    ['Denshattack!','https://www.youtube.com/watch?v=2gOL6y8iCHc'],
    ['Splatoon Raiders','https://www.youtube.com/watch?v=M2_RGzOPfgA'],
    ['Halo: Campaign Evolved','https://www.youtube.com/watch?v=5KhzCSeZxAU'],
    ['Mistfall Hunter','https://www.youtube.com/watch?v=sUq5gbiGFSE'],
    ['The Relic: First Guardian','https://www.youtube.com/watch?v=xg58ti8GPWg'],
    ['Beast of Reincarnation','https://www.youtube.com/watch?v=zqxdVtJ24ms'],
    ['Big Walk','https://www.youtube.com/watch?v=jJlwK8ODXM4'],
    ['Marvel Tōkon: Fighting Souls','https://www.youtube.com/watch?v=DV9Oq_X22Ak'],
    ['Duskfade','https://www.youtube.com/watch?v=hPV20ncmotY'],
    ['Mafia: The Old Country','https://www.youtube.com/watch?v=rtZkUh-I7ls'],
    ['The Sinking City 2','https://www.youtube.com/watch?v=JrELQ7n5K3M'],
    ['Mortal Shell II','https://www.youtube.com/watch?v=XZZnbmS47VQ'],
    ['Resonance: A Plague Tale Legacy','https://www.youtube.com/watch?v=Vf4ioj974hg'],
    ['Star Wars Zero Company','https://www.youtube.com/watch?v=WxLUZ1omFA8'],
    ['MGS: Master Collection Vol. 2','https://www.youtube.com/watch?v=61SGMvsynus'],
    ['The Blood of Dawnwalker','https://www.youtube.com/watch?v=yZB9Pj1P5XE'],
    ["Marvel's Wolverine",'https://www.youtube.com/watch?v=3Z42tBfBLJY'],
    ["Fire Emblem: Fortune's Weave",'https://www.youtube.com/watch?v=Zop2qyExaj8'],
    ['Trails in the Sky 2nd Chapter','https://www.youtube.com/watch?v=hluMj9phquM'],
    ['Dune: Awakening','https://www.youtube.com/watch?v=iCKflvFn4p4'],
    ['Silent Hill: Townfall','https://www.youtube.com/watch?v=DbEwGucBaFY'],
    ['Control Resonant','https://www.youtube.com/watch?v=LfFBFxg3UXQ'],
    ['Onimusha: Way of the Sword','https://www.youtube.com/watch?v=_rpyWOiHkAg'],
    ['EA Sports FC 27','https://www.youtube.com/watch?v=bseuGR08mas'],
    ['Minecraft Dungeons II','https://www.youtube.com/watch?v=x6dV4NB8Ms8'],
    ['Ace Combat 8: Wings of Theve','https://www.youtube.com/watch?v=cW6zBuO7sb4'],
    ['Star Wars: Galactic Racer','https://www.youtube.com/watch?v=EwVzrXv5FU0'],
    ['Gears of War: E-Day','https://www.youtube.com/watch?v=ngquU3t9vnk'],
    ['Kingdom Hearts Collection [I~III]','https://www.youtube.com/watch?v=ldMqRmTwy80'],
    ["Dragon's Dogma 2: Dark Arisen",'https://www.youtube.com/watch?v=Ob9pYAlIHZM'],
    ['Planet Zoo 2','https://www.youtube.com/watch?v=1oVm4wy0K0I'],
    ["Castlevania: Belmont's Curse",'https://www.youtube.com/watch?v=HJKj6H4dChA'],
    ['Final Fantasy Resonance','https://www.youtube.com/watch?v=C3OtFE5mZe4'],
    ['Call of Duty: Modern Warfare 4','https://www.youtube.com/watch?v=jLbst85USN8'],
    ['Phantom Blade Zero','https://www.youtube.com/watch?v=ayGk_auu5tk'],
    ['Godzilla: Destroy All Monsters Melee','https://www.youtube.com/watch?v=w-veMlH2L-A'],
    ['Metaphor: ReFantazio','https://www.youtube.com/watch?v=FlccMxW_0bc'],
    ['Grand Theft Auto VI','https://www.youtube.com/watch?v=VQRLujxTm3c'],
    ['Tomb Raider: Legacy of Atlantis','https://www.youtube.com/watch?v=fn1EREGsdFg'],
    ['God of War Laufey','https://www.youtube.com/watch?v=HLMX2w3cwuE'],
    ['Persona 4 Revival','https://www.youtube.com/watch?v=Wg3Enwd7Ba4'],
    ['Fable','https://www.youtube.com/watch?v=3iW1i78zFvk'],
    ['The Elder Scrolls IV: Oblivion Remastered','https://www.youtube.com/watch?v=kk5cymSWmqo'],
    ['Elden Ring: Tarnished Edition','https://www.youtube.com/watch?v=pMeYxev9PZM']
  ]);

  const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>';

  releases.forEach(release=>{
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
