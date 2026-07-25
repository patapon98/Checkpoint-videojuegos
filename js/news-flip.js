(function(){
  const archive=document.getElementById('newsArchive');
  if(!archive||!Array.isArray(window.MODERLODE_NEWS)) return;

  const expanded={
    'playstation-fin-formato-fisico':[
      'La medida solo afectará a los juegos nuevos publicados desde enero de 2028. Los títulos estrenados antes de esa fecha podrán seguir fabricándose y vendiéndose en disco, por lo que el corte no elimina de inmediato todo el catálogo físico existente.',
      'Los lanzamientos posteriores dependerán de PlayStation Store: no podrán prestarse ni revenderse como un disco y quedarán más expuestos al cierre de servidores, la retirada de licencias o cambios de precio. Las tiendas físicas y el mercado de segunda mano perderán además su principal vía de participación.'
    ],
    'xbox-retrocompatibilidad-pc':[
      'El programa comienza con Blinx, Conker: Live & Reloaded, Crimson Skies y Fuzion Frenzy. Quienes ya posean una licencia digital compatible en Xbox podrán utilizarla también en Windows 11 mediante Xbox Play Anywhere, sin comprar otra copia.',
      'La selección inicial es pequeña, pero lo relevante es la infraestructura: Microsoft empieza a trasladar su catálogo histórico a PC con licencias compartidas. Si el programa crece, reducirá la dependencia de las consolas originales y facilitará la conservación de juegos que no tenían versión nativa para ordenador.'
    ],
    'god-of-war-laufey-fecha':[
      'God of War Laufey llegará en exclusiva a PS5 el 16 de febrero de 2027 y estará centrado en Faye, ampliando su historia antes de los acontecimientos vividos junto a Kratos y Atreus.',
      'Cory Barlog también ha confirmado que la entrega posterior recuperará a Kratos como protagonista y conectará directamente con Laufey. El anuncio no solo fecha un juego: ordena la continuidad narrativa de las próximas dos entregas de la saga.'
    ],
    'gta-vi-codigos-japon':[
      'La edición japonesa de GTA VI para PS5 se venderá dentro de una caja, pero contendrá un código de descarga y no un disco. Rockstar fija para ese código una validez de 170 días desde su fecha de emisión, indicada como el 19 de noviembre de 2026.',
      'Una unidad que permanezca precintada más allá de ese plazo podría perder su utilidad. La limitación afecta especialmente al coleccionismo, los regalos tardíos, el stock almacenado y la reventa, y muestra una diferencia esencial entre poseer un disco y recibir una licencia digital dentro de una caja.'
    ],
    'marvel-wolverine-fecha':[
      "Insomniac ha fijado Marvel's Wolverine para el 15 de septiembre de 2026, ha abierto las reservas y ha publicado un nuevo tráiler centrado en la historia. El material permite concretar mejor el tono del juego y el papel de los personajes que acompañarán a Logan.",
      'La fecha convierte al título en uno de los principales exclusivos de PS5 para la segunda mitad de 2026 y cierra una larga etapa de incertidumbre desde su anuncio. Para PlayStation, será además el siguiente gran lanzamiento de Insomniac tras la saga Spider-Man.'
    ],
    'xbox-reestructuracion-despidos':[
      'Compulsion Games y Double Fine volverán a ser independientes, conservando sus propiedades intelectuales, catálogos y financiación para sus próximos proyectos. Ninja Theory y Undead Labs pasarán a nuevos propietarios con fondos para completar Senua y State of Decay 3; Arkane Lyon estudia opciones estratégicas mediante el proceso de consulta laboral francés.',
      'Xbox eliminará unos 3.200 puestos durante su año fiscal 2027, con 1.600 salidas inmediatas. Los recortes alcanzan a Activision, Bethesda/ZeniMax, Blizzard, King, Mojang y Xbox Game Studios. Microsoft afirma que no ha cancelado ningún proyecto first-party anunciado, aunque la propiedad de varios equipos y la capacidad global de producción sí se reducen.'
    ],
    'halo-campaign-evolved-lanzamiento':[
      'Halo: Campaign Evolved reconstruye la primera campaña de la saga y se publicará el 28 de julio en Xbox Series, PC, nube y PS5. Incluirá juego cruzado y cooperativo online para hasta cuatro personas.',
      'La llegada simultánea a PlayStation es el elemento industrial más significativo: una de las franquicias que definieron Xbox debutará en la consola rival el mismo día. El lanzamiento confirma que Microsoft está priorizando el alcance comercial de su catálogo sobre la exclusividad tradicional.'
    ],
    'elden-ring-switch-2-fecha':[
      'Tarnished Edition incluirá Elden Ring, Shadow of the Erdtree y contenido adicional cuando llegue a Switch 2 el 28 de agosto. Ese mismo día, las demás plataformas recibirán el nuevo Tarnished Pack.',
      'Más allá de la fecha, la adaptación será una prueba técnica y comercial para Switch 2: deberá trasladar uno de los mundos abiertos más exigentes de la generación y puede influir en la confianza de otras editoras para publicar grandes producciones en la consola.'
    ]
  };

  const escapeHTML=value=>String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');

  function enhance(){
    archive.querySelectorAll('.news-archive-card:not([data-flip-ready])').forEach((card,i)=>{
      const item=window.MODERLODE_NEWS.find(entry=>entry.id===card.id);
      const body=card.querySelector('.news-archive-body');
      if(!item||!body) return;

      const date=card.querySelector('.news-archive-date');
      const paragraphs=expanded[item.id]||[item.summary?.es||'',item.why?.es||''];
      const category=item.category?.es||'';
      const dateText=date?.querySelector('time')?.textContent||'';

      const front=document.createElement('section');
      front.className='news-flip-face news-flip-front';
      front.setAttribute('aria-label','Resumen de la noticia');
      if(date) front.append(date);
      front.append(body);

      const open=document.createElement('button');
      open.type='button';
      open.className='news-flip-button';
      open.setAttribute('aria-expanded','false');
      open.innerHTML='<span>Ampliar noticia</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>';
      body.append(open);

      const back=document.createElement('section');
      back.className='news-flip-face news-flip-back';
      back.setAttribute('aria-hidden','true');
      back.innerHTML=`
        <div class="news-back-meta">
          <span class="news-category">${escapeHTML(category)}</span>
          <span class="news-back-date">${escapeHTML(dateText)}</span>
        </div>
        <div class="news-expanded-copy">${paragraphs.map(text=>`<p>${escapeHTML(text)}</p>`).join('')}</div>
        <button class="news-flip-button" type="button" aria-expanded="true">
          <span>Volver al resumen</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>
        </button>`;

      const inner=document.createElement('div');
      inner.className='news-flip-inner';
      inner.append(front,back);
      card.replaceChildren(inner);
      card.dataset.flipReady='true';

      card.style.transitionDelay=(Math.min(i,8)*70)+'ms';
      requestAnimationFrame(()=>requestAnimationFrame(()=>card.classList.add('visible')));
    });
  }

  archive.addEventListener('click',event=>{
    const button=event.target.closest('.news-flip-button');
    const card=button?.closest('.news-archive-card');
    if(!card) return;
    const flipped=card.classList.toggle('is-flipped');
    card.querySelector('.news-flip-front .news-flip-button')?.setAttribute('aria-expanded',String(flipped));
    card.querySelector('.news-flip-back')?.setAttribute('aria-hidden',String(!flipped));
    card.querySelector(flipped?'.news-flip-back .news-flip-button':'.news-flip-front .news-flip-button')?.focus({preventScroll:true});
  });

  archive.addEventListener('keydown',event=>{
    if(event.key!=='Escape') return;
    const card=event.target.closest('.news-archive-card.is-flipped');
    if(!card) return;
    card.classList.remove('is-flipped');
    card.querySelector('.news-flip-back')?.setAttribute('aria-hidden','true');
    const button=card.querySelector('.news-flip-front .news-flip-button');
    button?.setAttribute('aria-expanded','false');
    button?.focus({preventScroll:true});
  });

  const observer=new MutationObserver(enhance);
  observer.observe(archive,{childList:true});
  enhance();
})();