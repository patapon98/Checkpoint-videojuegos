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
    'Mafia: The Old Country',
    'The Sinking City 2',
    'Mortal Shell II',
    "Fire Emblem: Fortune's Weave",
    'Trails in the Sky 2nd Chapter',
    'EA Sports FC 27',
    'Minecraft Dungeons II',
    'Star Wars: Galactic Racer',
    "Dragon's Dogma 2: Dark Arisen",
    'Final Fantasy Resonance',
    'Call of Duty: Modern Warfare 4'
  ]);

  const objectiveLabels=new Map([
    ['Dune: Awakening','Nueva plataforma'],
    ['Elden Ring: Tarnished Edition','Nueva plataforma'],
    ['Metaphor: ReFantazio','Nueva plataforma'],
    ['Kingdom Hearts Collection [I~III]','Recopilatorio'],
    ['MGS: Master Collection Vol. 2','Recopilatorio'],
    ['Godzilla: Destroy All Monsters Melee','Remaster']
  ]);

  releases.forEach(release=>{
    const heading=release.querySelector('h4');
    const badge=release.querySelector(':scope > .hype');
    if(!heading||!badge) return;

    const title=(heading.childNodes[0]?.textContent||heading.textContent).trim();
    if(badge.classList.contains('hype-out')) return;

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

    const objective=objectiveLabels.get(title);
    if(objective){
      badge.className='hype hype-mid';
      badge.textContent=objective;
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
