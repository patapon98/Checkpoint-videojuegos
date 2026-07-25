(function(){
  const releases=document.querySelectorAll('#releases .release');
  if(!releases.length) return;

  const eventOfYear=new Set([
    'Grand Theft Auto VI'
  ]);

  const highHype=new Set([
    'Halo: Campaign Evolved',
    'Beast of Reincarnation',
    'Marvel Tōkon: Fighting Souls',
    'Resonance: A Plague Tale Legacy',
    'Star Wars Zero Company',
    'The Blood of Dawnwalker',
    "Marvel's Wolverine",
    'Silent Hill: Townfall',
    'Control Resonant',
    'Onimusha: Way of the Sword',
    'Ace Combat 8: Wings of Theve',
    'Gears of War: E-Day',
    "Castlevania: Belmont's Curse",
    'Phantom Blade Zero',
    'God of War Laufey'
  ]);

  const interesting=new Set([
    'Mistfall Hunter',
    'Big Walk',
    'Duskfade',
    'The Sinking City 2',
    'Mortal Shell II',
    "Fire Emblem: Fortune's Weave",
    'Trails in the Sky 2nd Chapter',
    'EA Sports FC 27',
    'Minecraft Dungeons II',
    'Star Wars: Galactic Racer',
    'Final Fantasy Resonance',
    'Call of Duty: Modern Warfare 4'
  ]);

  const objectiveTags=new Map([
    ['Dune: Awakening','Nueva plataforma'],
    ['Elden Ring: Tarnished Edition','Nueva plataforma'],
    ['Metaphor: ReFantazio','Nueva plataforma'],
    ['Godzilla: Destroy All Monsters Melee','Remaster']
  ]);

  releases.forEach(release=>{
    const heading=release.querySelector('h4');
    const badge=release.querySelector(':scope > .hype');
    if(!heading||!badge) return;

    const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();
    if(badge.classList.contains('hype-out')) return;

    const objectiveTag=objectiveTags.get(title);
    if(objectiveTag&&!heading.querySelector('.tag-dlc')){
      const tag=document.createElement('span');
      tag.className='tag-dlc';
      tag.textContent=objectiveTag;
      heading.append(' ',tag);
    }

    const hasObjectiveTag=Boolean(heading.querySelector('.tag-dlc'));
    if(hasObjectiveTag){
      badge.remove();
      return;
    }

    if(eventOfYear.has(title)){
      badge.className='hype hype-max';
      badge.textContent='El evento del año';
      return;
    }

    if(highHype.has(title)){
      badge.className='hype hype-high';
      badge.textContent='Hype alto';
      return;
    }

    if(interesting.has(title)){
      badge.className='hype hype-mid';
      badge.textContent='Interesante';
      return;
    }

    badge.remove();
  });
})();