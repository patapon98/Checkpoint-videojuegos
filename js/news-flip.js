(function(){
  const archive=document.getElementById('newsArchive');
  if(!archive||!Array.isArray(window.FINALSECRETO_NEWS)) return;

  const expanded={
    'playstation-fin-formato-fisico':[
      'La medida solo afectará a los juegos nuevos publicados desde enero de 2028. Los títulos estrenados antes de esa fecha podrán seguir fabricándose y vendiéndose en disco, por lo que el corte no elimina de inmediato todo el catálogo físico existente.',
      'Los lanzamientos posteriores dependerán de PlayStation Store: no podrán prestarse ni revenderse como un disco y quedarán más expuestos al cierre de servidores, la retirada de licencias o cambios de precio. Las tiendas físicas y el mercado de segunda mano perderán además su principal vía de participación.'
    ],
    'bethesda-futuro-fallout':[
      'Bethesda Game Studios ha confirmado que trabaja en remasterizaciones de Fallout 3 y Fallout: New Vegas, todavía sin fecha. También prepara Raven Rock para Fallout 76 en 2027 y mantiene Fallout 5 como objetivo a largo plazo, ya en preproducción.',
      'El movimiento más llamativo es la vuelta de Obsidian a la franquicia con un nuevo proyecto de Fallout sin título, fecha ni plataformas anunciadas. La información es oficial, pero Bethesda no ha aclarado si se trata de un juego principal, un spin-off o cuándo podría llegar.'
    ],
    'tomb-raider-catalyst-2028':[
      'Durante una entrevista sobre la estrategia de Amazon, el responsable de Amazon Games situó Tomb Raider: Catalyst en 2028. El juego había sido anunciado originalmente con una ventana de lanzamiento en 2027.',
      'Horas después, la propia compañía evitó confirmar el cambio y declaró que no tenía novedades sobre la fecha, aunque el desarrollo avanzaba bien. Por eso, 2028 no debe considerarse todavía una fecha oficial: es una declaración relevante del máximo responsable de la división, contradicha por la respuesta corporativa posterior.'
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
    'ea-compra-autorizacion-ue':[
      'La Comisión Europea ha autorizado la adquisición de Electronic Arts bajo el Reglamento de concentraciones tras concluir que el cambio de propiedad no plantea problemas de competencia. El comprador es un consorcio formado por el fondo soberano saudí PIF, Silver Lake y Affinity Partners.',
      'La autorización no cierra todavía la operación. Bruselas mantiene una revisión separada bajo el Reglamento sobre Subvenciones Extranjeras, con una decisión prevista para el 30 de julio. Si supera ese último control, EA pasará a ser una compañía privada dentro de una compra valorada en 55.000 millones de dólares.'
    ],
    'xbox-nube-gratis-anuncios':[
      'La prueba permite a Xbox Insiders retransmitir una selección de juegos que ya poseen sin pagar por el acceso a la nube. Los anuncios se muestran antes de comenzar y cada sesión tiene un límite de una hora, pero la partida no se interrumpe con publicidad.',
      'Microsoft presenta el sistema como una forma opcional de reducir el coste de entrada, especialmente para quienes usan móviles, televisores, ordenadores modestos o Xbox One. De momento no existe confirmación de que la prueba vaya a convertirse en un nivel comercial permanente.'
    ],
    'amazon-luna-prime-video':[
      'Amazon ha añadido una pestaña de juegos dentro de Prime Video para los miembros de Prime que utilizan Fire TV en Estados Unidos y Reino Unido. Desde ella pueden iniciar juegos de Luna con un mando o con el teléfono, sin descargas ni pagos adicionales.',
      'El cambio integra el juego en el mismo espacio donde Amazon distribuye películas, series y deportes. La compañía promete ampliar dispositivos, países y catálogo, pero España y Japón no forman parte del despliegue inicial.'
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

  function emphasizedHTML(value,item){
    const raw=String(value);
    const phrases=item.emphasis?.es||[];
    if(!phrases.length) return escapeHTML(raw);
    const matches=phrases.map(phrase=>({phrase,index:raw.indexOf(phrase)}))
      .filter(match=>match.index>=0).sort((a,b)=>a.index-b.index);
    let cursor=0,html='';
    matches.forEach(match=>{
      if(match.index<cursor) return;
      html+=escapeHTML(raw.slice(cursor,match.index));
      html+='<strong>'+escapeHTML(match.phrase)+'</strong>';
      cursor=match.index+match.phrase.length;
    });
    return html+escapeHTML(raw.slice(cursor));
  }

  function importanceBadge(item){
    return item.important&&!item.featured
      ? '<span class="news-important"><i aria-hidden="true">★</i>Relevante</span>'
      : '';
  }

  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealObserver=!reducedMotion&&'IntersectionObserver' in window
    ? new IntersectionObserver(entries=>{
        const entering=entries
          .filter(entry=>entry.isIntersecting)
          .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
        entering.forEach((entry,index)=>{
          entry.target.style.transitionDelay=Math.min(index*55,220)+'ms';
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
          entry.target.addEventListener('transitionend',()=>{
            entry.target.style.removeProperty('transition-delay');
          },{once:true});
        });
      },{threshold:.08,rootMargin:'0px 0px -4% 0px'})
    : null;

  function revealOnScroll(card){
    if(!revealObserver){
      card.classList.add('visible');
      return;
    }
    revealObserver.observe(card);
  }

  function enhance(){
    archive.querySelectorAll('.news-archive-card:not([data-flip-ready])').forEach(card=>{
      const item=window.FINALSECRETO_NEWS.find(entry=>entry.id===card.id);
      const body=card.querySelector('.news-archive-body');
      if(!item||!body) return;

      const signal=card.querySelector('.news-archive-date');
      const date=card.querySelector('.news-card-date');
      const paragraphs=expanded[item.id]||[item.summary?.es||'',item.why?.es||''];
      const category=item.category?.es||'';
      const dateText=[...(date?.querySelectorAll('time')||[])]
        .map(node=>node.textContent.trim()).filter(Boolean).join(' · ');

      const front=document.createElement('section');
      front.className='news-flip-face news-flip-front';
      front.setAttribute('aria-label','Resumen de la noticia');
      if(signal) front.append(signal);
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
          ${importanceBadge(item)}
          <span class="news-back-date news-card-date">${date?.innerHTML||escapeHTML(dateText)}</span>
        </div>
        <div class="news-expanded-copy">${paragraphs.map(text=>`<p>${emphasizedHTML(text,item)}</p>`).join('')}</div>
        <button class="news-flip-button" type="button" aria-expanded="true">
          <span>Volver al resumen</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>
        </button>`;

      const inner=document.createElement('div');
      inner.className='news-flip-inner';
      inner.append(front,back);
      card.replaceChildren(inner);
      card.dataset.flipReady='true';

      revealOnScroll(card);
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
