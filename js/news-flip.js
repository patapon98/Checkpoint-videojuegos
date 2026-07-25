(function(){
  const archive=document.getElementById('newsArchive');
  if(!archive||!Array.isArray(window.MODERLODE_NEWS)) return;

  const expanded={
    'playstation-fin-formato-fisico':[
      'La medida se aplicará a los juegos nuevos publicados desde enero de 2028. Los títulos anteriores podrán seguir fabricándose y vendiéndose en disco, pero los estrenos posteriores dependerán de la distribución digital.',
      'El cambio elimina la posibilidad de prestar, revender o conservar físicamente esos nuevos lanzamientos. También concentra la compra en PlayStation Store y reduce el papel de las tiendas y del mercado de segunda mano.'
    ],
    'xbox-retrocompatibilidad-pc':[
      'Microsoft ha iniciado el programa con Blinx, Conker: Live & Reloaded, Crimson Skies y Fuzion Frenzy. Las licencias digitales compatibles que ya se tengan en Xbox también pueden utilizarse en Windows 11.',
      'El primer catálogo es pequeño, pero establece la infraestructura para trasladar más clásicos a PC. Esto amplía su disponibilidad y reduce la dependencia del hardware original.'
    ],
    'god-of-war-laufey-fecha':[
      'God of War Laufey llegará en exclusiva a PS5 el 16 de febrero de 2027. La entrega estará centrada en Faye y ampliará su historia antes de los acontecimientos protagonizados por Kratos.',
      'Cory Barlog también ha confirmado que el juego posterior recuperará a Kratos como protagonista y conectará directamente con Laufey. El anuncio ordena así las próximas dos entregas de la saga.'
    ],
    'gta-vi-codigos-japon':[
      'La edición japonesa de GTA VI para PS5 se venderá en caja, pero incluirá un código de descarga en lugar de un disco. Ese código tendrá una validez de 170 días desde la fecha de emisión indicada por Rockstar.',
      'Una copia sin canjear perderá su utilidad cuando expire el código. Esto afecta especialmente a regalos tardíos, unidades almacenadas, coleccionismo y reventa, aunque la restricción anunciada se limite a Japón.'
    ],
    'marvel-wolverine-fecha':[
      "Insomniac ha fijado Marvel's Wolverine para el 15 de septiembre de 2026 y ha abierto las reservas. El nuevo tráiler ofrece una visión más clara de la historia, el tono y los personajes que acompañarán a Logan.",
      'La confirmación coloca al juego como uno de los pilares del calendario de PS5 para la segunda mitad del año y reduce la incertidumbre alrededor de un proyecto anunciado mucho tiempo atrás.'
    ],
    'xbox-reestructuracion-despidos':[
      'Microsoft plantea reducir aproximadamente una quinta parte de la plantilla de Xbox durante su año fiscal 2027. La primera fase contempla 1.600 salidas inmediatas y una reorganización que afecta a varios estudios.',
      'El impacto no se limita al empleo. Menos equipos y cambios de propiedad pueden alterar calendarios, cancelar proyectos y modificar la capacidad de Xbox para mantener su actual volumen de producción.'
    ],
    'halo-campaign-evolved-lanzamiento':[
      'Halo: Campaign Evolved reconstruye la primera campaña de la saga y se publicará el 28 de julio en Xbox Series, PC, nube y PS5. Incluirá juego cruzado y cooperativo online para hasta cuatro personas.',
      'El estreno simultáneo en PlayStation convierte el lanzamiento en algo más que un remake. Es otra señal de que Microsoft está priorizando el alcance de sus franquicias sobre la exclusividad tradicional.'
    ],
    'elden-ring-switch-2-fecha':[
      'Tarnished Edition llevará a Switch 2 el juego base, Shadow of the Erdtree y contenido adicional el 28 de agosto. Ese mismo día, el resto de plataformas recibirá el nuevo Tarnished Pack.',
      'La adaptación medirá el rendimiento de uno de los mundos abiertos más exigentes en el hardware de Nintendo y puede influir en la confianza de otras editoras para llevar grandes producciones a Switch 2.'
    ]
  };

  const escapeHTML=value=>String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  function enhance(){
    archive.querySelectorAll('.news-archive-card:not([data-flip-ready])').forEach(card=>{
      const item=window.MODERLODE_NEWS.find(entry=>entry.id===card.id);
      const body=card.querySelector('.news-archive-body');
      if(!item||!body) return;

      const date=card.querySelector('.news-archive-date');
      const sources=body.querySelector('.news-sources')?.outerHTML||'';
      const paragraphs=expanded[item.id]||[item.summary?.es||'',item.why?.es||''];
      const title=item.title?.es||'';
      const category=item.category?.es||'';

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
        <div class="news-back-heading">
          <span class="news-category">${escapeHTML(category)}</span>
          <h2>${escapeHTML(title)}</h2>
        </div>
        <div class="news-expanded-copy">${paragraphs.map(text=>`<p>${escapeHTML(text)}</p>`).join('')}</div>
        <div class="news-back-footer">
          ${sources}
          <button class="news-flip-button" type="button" aria-expanded="true">
            <span>Volver al resumen</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>
          </button>
        </div>`;

      const inner=document.createElement('div');
      inner.className='news-flip-inner';
      inner.append(front,back);
      card.replaceChildren(inner);
      card.dataset.flipReady='true';
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