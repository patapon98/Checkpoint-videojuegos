/* ---------- Tema claro / oscuro ---------- */
const themeToggle=document.getElementById('themeToggle');
const themeMedia=window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme(theme,persist=false){
  const dark=theme==='dark';
  document.documentElement.setAttribute('data-theme',theme);
  document.documentElement.style.colorScheme=theme;
  if(persist){
    try{localStorage.setItem('finalsecreto-theme',theme);}catch(e){}
  }
  if(themeToggle){
    themeToggle.setAttribute('aria-pressed',String(dark));
    themeToggle.setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');
    themeToggle.title=dark?'Activar modo claro':'Activar modo oscuro';
  }
}
if(themeToggle){
  applyTheme(document.documentElement.getAttribute('data-theme')||'light');
  themeToggle.addEventListener('click',()=>{
    applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark',true);
  });
}
themeMedia.addEventListener?.('change',event=>{
  try{
    if(!localStorage.getItem('finalsecreto-theme')) applyTheme(event.matches?'dark':'light');
  }catch(e){}
});

/* ============================================
   FINAL SECRETO: JS compartido
   ============================================ */

/* ---------- i18n (solo en la home) ---------- */
const i18n = {
  es:{
    nav_reviews:"Reseñas",nav_calendar:"Calendario",nav_news:"Noticias",nav_sub:"Suscríbete",
    home_nav_label:"En esta portada",home_nav_reviews:"Últimas reseñas",home_nav_calendar:"Próximos lanzamientos",home_nav_news:"Actualidad",home_nav_newsletter:"Newsletter",
    hero_kicker:"Blog de videojuegos",
    hero_title:'La actualidad del <em>videojuego</em>, sin perder el tiempo.',
    hero_sub:"Noticias relevantes, grandes lanzamientos, análisis y reseñas con un toque único, escogidos personalmente para no hacerte perder el tiempo.",
    hero_cta1:"Ver la actualidad",hero_cta2:"Ver lanzamientos",
    hero_card_tag:"Reseña destacada",
    hero_card_sub:"Terror y acción combinados en uno de los mejores RE jamás hechos.",
    rev_kicker:"Análisis",rev_title:"Últimas reseñas",
    rev_sub:"Análisis en profundidad de los juegos que voy terminando. Opinión personal, sin notas infladas.",
    rev1:"Un remake construido desde cero en Unreal Engine 5 que respeta lo que hacía grande al original y moderniza todo lo demás.",
    rev2:"El spin-off más arriesgado de Nintendo apuesta por la historia sin perder el gancho jugable de la saga.",
    rev3:"Tras años de acceso anticipado, la versión final demuestra que había un gran juego detrás del meme.",
    read_more:"Leer reseña",
    view_all:"Ver todas las reseñas →",
    view_all_cal:"Ver calendario completo →",
    cal_kicker:"Próximos lanzamientos",cal_title:"Calendario 2026",
    cal_sub:"Los lanzamientos más importantes de los próximos meses, siempre al día.",
    cd_sub:"19 de noviembre de 2026 · PS5 · Xbox Series X|S",cd_days:"Días",cd_hours:"Horas",
    f_all:"Todos",
    m_jul:"Julio 2026",m_aug:"Agosto 2026",m_sep:"Septiembre 2026",m_oct:"Octubre 2026",m_nov:"Noviembre 2026",
    hype_high:"Hype alto",hype_mid:"Interesante",hype_max:"El evento del año",
    news_kicker:"Actualidad",news_title:"La actualidad, bien explicada",
    news_sub:"Las noticias más importantes del videojuego, seleccionadas por relevancia y explicadas con contexto, fuentes verificadas y perspectiva.",
    n1_t:"Take-Two reafirma la fecha de GTA VI para el 19 de noviembre",
    n1_p:"El CEO Strauss Zelnick vuelve a confirmar la fecha en un documento oficial y disipa los rumores de un tercer retraso. El marketing arranca este verano.",
    n2_t:"Agosto abre la temporada alta con Elden Ring en Switch 2",
    n2_p:"Tarnished Edition inaugura el 28 de agosto uno de los tramos más cargados del calendario reciente, con septiembre y octubre repletos de lanzamientos.",
    n3_t:"Wuthering Waves aterriza en Xbox y Where Winds Meet estrena expansión",
    n3_p:"Los free-to-play siguen ganando terreno en consola y 'Hidden Mountain' es la primera gran expansión de Where Winds Meet.",
    nl_title:"Un email a la semana. Cero spam.",
    nl_sub:"Las reseñas nuevas, el calendario actualizado y las 5 noticias de la semana, cada viernes en tu bandeja.",
    nl_btn:"Suscribirme",
    foot2:"Noticias · Calendario · Reseñas · Contacto"
  },
  en:{
    nav_reviews:"Reviews",nav_calendar:"Calendar",nav_news:"News",nav_sub:"Subscribe",
    home_nav_label:"On this page",home_nav_reviews:"Latest reviews",home_nav_calendar:"Upcoming releases",home_nav_news:"News",home_nav_newsletter:"Newsletter",
    hero_kicker:"Video game blog",
    hero_title:'Video game news, <em>without wasting your time.</em>',
    hero_sub:"Hand-written reviews, an always up-to-date release calendar, and only the news that truly matters. No noise, no clickbait.",
    hero_cta1:"See the news",hero_cta2:"See releases",
    hero_card_tag:"Featured review",
    hero_card_sub:"Terror and action combined in one of the best RE games ever made.",
    rev_kicker:"Analysis",rev_title:"Latest reviews",
    rev_sub:"In-depth takes on the games I finish. Personal opinion, no inflated scores.",
    rev1:"A ground-up Unreal Engine 5 remake that respects what made the original great and modernizes everything else.",
    rev2:"Nintendo's boldest spin-off bets on story without losing the series' addictive gameplay.",
    rev3:"After years in early access, the final release proves there was a great game behind the meme.",
    read_more:"Read review",
    view_all:"See all reviews →",
    view_all_cal:"See full calendar →",
    cal_kicker:"Upcoming releases",cal_title:"2026 Calendar",
    cal_sub:"The most important releases of the coming months, always up to date.",
    cd_sub:"November 19, 2026 · PS5 · Xbox Series X|S",cd_days:"Days",cd_hours:"Hours",
    f_all:"All",
    m_jul:"July 2026",m_aug:"August 2026",m_sep:"September 2026",m_oct:"October 2026",m_nov:"November 2026",
    hype_high:"High hype",hype_mid:"Worth a look",hype_max:"Event of the year",
    news_kicker:"Now",news_title:"Only what matters",
    news_sub:"The stories that change the industry, platforms or release calendar. With context, direct sources and no noise.",
    n1_t:"Take-Two reaffirms GTA VI's November 19 release date",
    n1_p:"CEO Strauss Zelnick confirms the date again in an official filing, dispelling rumors of a third delay. Marketing kicks off this summer.",
    n2_t:"August opens the high season with Elden Ring on Switch 2",
    n2_p:"Tarnished Edition launches August 28, kicking off one of the busiest stretches of the recent calendar, with September and October packed.",
    n3_t:"Wuthering Waves lands on Xbox as Where Winds Meet gets its first expansion",
    n3_p:"Free-to-play keeps gaining console ground and 'Hidden Mountain' is Where Winds Meet's first major expansion.",
    nl_title:"One email a week. Zero spam.",
    nl_sub:"New reviews, the updated calendar and the week's top 5 stories, every Friday in your inbox.",
    nl_btn:"Subscribe",
    foot2:"News · Calendar · Reviews · Contact"
  }
};

function setLang(lang){
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(i18n[lang][k]!==undefined) el.textContent = i18n[lang][k];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    const k = el.getAttribute('data-i18n-html');
    if(i18n[lang][k]!==undefined) el.innerHTML = i18n[lang][k];
  });
  const es=document.getElementById('btn-es'), en=document.getElementById('btn-en');
  if(es) es.classList.toggle('on',lang==='es');
  if(en) en.classList.toggle('on',lang==='en');
  if(window.renderNews) window.renderNews(lang);
}

/* ---------- Reveal on scroll ---------- */
const revealEls=[...document.querySelectorAll('.reveal,.stagger')];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Atajo para volver al inicio ---------- */
document.querySelectorAll('[data-scroll-top]').forEach(button=>{
  button.addEventListener('click',()=>{
    window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'});
  });
});

const revealImmediately=elements=>elements.forEach(el=>el.classList.add('visible'));

const observeReveals=(elements,{stagger=false,rootMargin='0px 0px -4% 0px'}={})=>{
  if(reducedMotion||!('IntersectionObserver' in window)){
    revealImmediately(elements);
    return;
  }
  const obs=new IntersectionObserver(entries=>{
    const entering=entries
      .filter(entry=>entry.isIntersecting)
      .sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    entering.forEach((entry,index)=>{
      if(stagger) entry.target.style.transitionDelay=Math.min(index*55,220)+'ms';
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
      entry.target.addEventListener('transitionend',()=>{
        entry.target.style.removeProperty('transition-delay');
      },{once:true});
    });
  },{threshold:.08,rootMargin});
  /* Forzamos que el navegador pinte el estado oculto antes de observar: si un
     elemento ya está en el viewport al cargar, el observer dispara casi al
     instante y, sin este respiro, el navegador se salta la transición. */
  elements.forEach(el=>el.getBoundingClientRect());
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    elements.forEach(el=>obs.observe(el));
  }));
};

if(document.body.classList.contains('calendar-page')){
  /*
   * El calendario se construye antes de mostrarse. Esperamos a que termine para
   * que la protección anti-parpadeo no se coma las transiciones intencionadas.
   */
  window.addEventListener('calendar:ready',()=>observeReveals(revealEls,{stagger:true}),{once:true});
}else{
  const earlyMobileNewsReveal=
    document.body.classList.contains('news-page')&&
    window.matchMedia('(max-width:700px)').matches;
  if(earlyMobileNewsReveal){
    const newsMain=revealEls.filter(el=>el.matches('main'));
    observeReveals(revealEls.filter(el=>!newsMain.includes(el)));
    observeReveals(newsMain,{rootMargin:'0px 0px 45% 0px'});
  }else{
    observeReveals(revealEls);
  }
}

/* ---------- Nav interna activa según scroll ---------- */
const homeSectionNav=document.querySelector('.home-section-nav');
const sections=[...document.querySelectorAll('section[id]')];
const navLinks=[...(homeSectionNav?.querySelectorAll('a[href^="#"]')||[])];
if(homeSectionNav && sections.length && navLinks.length){
  const pageHeader=document.querySelector('header');
  let activeSection=null;
  let navFrame=0;
  let lastScrollY=window.scrollY;

  const updateActiveSection=()=>{
    const chromeHeight=(pageHeader?.offsetHeight||0)+homeSectionNav.offsetHeight;
    const y=window.scrollY;
    const delta=y-lastScrollY;
    if(delta>4 && y>chromeHeight) homeSectionNav.classList.add('nav-hidden');
    else if(delta<-4 || y<chromeHeight) homeSectionNav.classList.remove('nav-hidden');
    lastScrollY=y;

    const activationLine=(pageHeader?.getBoundingClientRect().bottom||0)+homeSectionNav.getBoundingClientRect().height+16;
    let current=null;
    sections.forEach(section=>{
      if(section.getBoundingClientRect().top<=activationLine) current=section.id;
    });

    navLinks.forEach(link=>{
      const isActive=link.getAttribute('href')==='#'+current;
      link.classList.toggle('active',isActive);
      if(isActive) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });

    if(current!==activeSection){
      activeSection=current;
      const activeLink=navLinks.find(link=>link.classList.contains('active'));
      if(activeLink){
        const targetLeft=activeLink.offsetLeft-(homeSectionNav.clientWidth-activeLink.offsetWidth)/2;
        homeSectionNav.scrollTo({
          left:Math.max(0,targetLeft),
          behavior:reducedMotion?'auto':'smooth'
        });
      }
    }
    navFrame=0;
  };

  const requestNavUpdate=()=>{
    if(!navFrame) navFrame=requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener('scroll',requestNavUpdate,{passive:true});
  window.addEventListener('resize',requestNavUpdate);
  updateActiveSection();
}

/* ---------- Hero card: glow + tilt ---------- */
const hc=document.getElementById('heroCard');
if(hc && matchMedia('(pointer:fine)').matches){
  hc.addEventListener('mousemove',e=>{
    const r=hc.getBoundingClientRect();
    const x=e.clientX-r.left, y=e.clientY-r.top;
    hc.style.setProperty('--mx',x+'px');
    hc.style.setProperty('--my',y+'px');
    const rx=((y/r.height)-.5)*-8, ry=((x/r.width)-.5)*8;
    hc.style.transform=`rotate(0deg) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  hc.addEventListener('mouseleave',()=>{ hc.style.transform='rotate(2deg)'; });
}

/* ---------- Tarjetas: efecto 3D ---------- */
if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-7;
      const ry=((e.clientX-r.left)/r.width-.5)*7;
      card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      card.style.transition='box-shadow .3s ease';
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
      card.style.transition='transform .5s cubic-bezier(.22,1,.36,1), box-shadow .3s ease';
    });
  });
}

/* ---------- Cuenta atrás GTA VI ---------- */
const cdD=document.getElementById('cd-d');
if(cdD){
  const target=new Date('2026-11-19T00:00:00');
  const pad=n=>String(n).padStart(2,'0');
  const tick=()=>{
    const d=target-new Date();
    if(d<=0){document.querySelector('.countdown .cd-label b').textContent='¡GTA VI ya está aquí!';return}
    cdD.textContent=Math.floor(d/864e5);
    document.getElementById('cd-h').textContent=pad(Math.floor(d/36e5)%24);
    document.getElementById('cd-m').textContent=pad(Math.floor(d/6e4)%60);
    document.getElementById('cd-s').textContent=pad(Math.floor(d/1e3)%60);
  };
  tick();setInterval(tick,1000);
}

/* ---------- Búsqueda y filtros del calendario ---------- */
const filters=document.getElementById('filters');
const releaseSearch=document.getElementById('releaseSearch');
const releaseCount=document.getElementById('releaseCount');
const monthFilter=document.getElementById('monthFilter');
if(filters){
  let activePlatform='all';
  let activeMonth='all';
  let currentMonth='';
  document.querySelectorAll('#releases > *').forEach(el=>{
    if(el.hasAttribute('data-month')) currentMonth=el.dataset.month;
    else if(el.classList.contains('release')) el.dataset.releaseMonth=currentMonth;
  });
  const applyReleaseFilters=()=>{
    const query=(releaseSearch?.value||'').trim().toLocaleLowerCase('es');
    let visible=0;
    document.querySelectorAll('#releases .release').forEach(r=>{
      const platformMatch=activePlatform==='all'||r.dataset.plat.split(' ').includes(activePlatform);
      const monthMatch=activeMonth==='all'||r.dataset.releaseMonth===activeMonth;
      const title=(r.querySelector('h4')?.textContent||'').toLocaleLowerCase('es');
      const show=platformMatch&&monthMatch&&(!query||title.includes(query));
      r.classList.toggle('hide',!show);
      if(show) visible++;
    });
    document.querySelectorAll('#releases [data-month]').forEach(m=>{
      const next=m.nextElementSibling;
      const group=next&&next.classList.contains('month-group')?next:null;
      let any=false;
      if(group){
        any=[...group.children].some(el=>el.classList.contains('release')&&!el.classList.contains('hide'));
        group.style.display=any?'':'none';
      }else{
        let el=next;
        while(el&&!el.hasAttribute('data-month')){
          if(el.classList.contains('release')&&!el.classList.contains('hide')) any=true;
          el=el.nextElementSibling;
        }
      }
      m.style.display=any?'':'none';
    });
    if(releaseCount) releaseCount.textContent=visible+' '+(visible===1?'juego':'juegos');
  };
  filters.addEventListener('click',e=>{
    const btn=e.target.closest('.filter'); if(!btn)return;
    document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('on',b===btn));
    activePlatform=btn.dataset.f;
    applyReleaseFilters();
  });
  releaseSearch?.addEventListener('input',applyReleaseFilters);
  monthFilter?.addEventListener('change',()=>{
    activeMonth=monthFilter.value;
    applyReleaseFilters();
    document.getElementById('releases')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  applyReleaseFilters();
}

/* ---------- Slider de imágenes ---------- */
document.querySelectorAll('[data-slider]').forEach(root=>{
  const track=root.querySelector('.slider-track');
  const slides=[...root.querySelectorAll('.slide')];
  const dotsWrap=root.querySelector('.slider-dots');
  let i=0;
  slides.forEach((_,n)=>{
    const b=document.createElement('button');
    if(n===0) b.classList.add('on');
    b.setAttribute('aria-label','Ir a la foto '+(n+1));
    b.addEventListener('click',()=>go(n));
    dotsWrap.appendChild(b);
  });
  const dots=[...dotsWrap.children];
  function go(n){
    i=(n+slides.length)%slides.length;
    track.style.transform=`translateX(-${i*100}%)`;
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
  }
  root.querySelector('.prev').addEventListener('click',()=>go(i-1));
  root.querySelector('.next').addEventListener('click',()=>go(i+1));
  let timer=setInterval(()=>go(i+1),4500);
  root.addEventListener('mouseenter',()=>clearInterval(timer));
  root.addEventListener('mouseleave',()=>{timer=setInterval(()=>go(i+1),4500)});
});


/* ---------- Progreso de lectura ---------- */
const reviewArticle=document.querySelector('.article-body');
if(reviewArticle){
  const readingProgress=document.createElement('div');
  readingProgress.className='reading-progress';
  readingProgress.setAttribute('aria-hidden','true');
  document.body.appendChild(readingProgress);
  let progressFrame=0;
  const updateReadingProgress=()=>{
    const maxScroll=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const progress=Math.min(1,Math.max(0,window.scrollY/maxScroll));
    readingProgress.style.transform='scaleX('+progress+')';
    progressFrame=0;
  };
  const requestProgressUpdate=()=>{
    if(!progressFrame) progressFrame=requestAnimationFrame(updateReadingProgress);
  };
  window.addEventListener('scroll',requestProgressUpdate,{passive:true});
  window.addEventListener('resize',requestProgressUpdate);
  updateReadingProgress();
}


/* ---------- Ampliación de imágenes de reseñas ---------- */
if(reviewArticle){
  const reviewImages=[...reviewArticle.querySelectorAll('figure>img')].filter(image=>!image.closest('a'));
  if(reviewImages.length){
    const lightbox=document.createElement('dialog');
    lightbox.className='review-lightbox';
    lightbox.setAttribute('aria-label','Imagen ampliada');
    lightbox.innerHTML=
      '<button class="review-lightbox-close" type="button" aria-label="Cerrar imagen ampliada">×</button>'+
      '<figure class="review-lightbox-frame">'+
        '<img class="review-lightbox-image" alt="">'+
        '<figcaption class="review-lightbox-caption"></figcaption>'+
      '</figure>';
    document.body.appendChild(lightbox);

    const lightboxImage=lightbox.querySelector('.review-lightbox-image');
    const lightboxCaption=lightbox.querySelector('.review-lightbox-caption');
    const closeButton=lightbox.querySelector('.review-lightbox-close');
    let sourceImage=null;

    const closeLightbox=()=>{
      if(lightbox.open) lightbox.close();
    };
    const openLightbox=image=>{
      sourceImage=image;
      const figure=image.closest('figure');
      const caption=figure?.querySelector('figcaption')?.textContent.trim()||image.alt.trim();
      lightboxImage.src=image.currentSrc||image.src;
      lightboxImage.alt=image.alt;
      lightboxCaption.textContent=caption;
      lightboxCaption.hidden=!caption;
      lightbox.setAttribute('aria-label',image.alt?'Imagen ampliada: '+image.alt:'Imagen ampliada');
      document.body.classList.add('review-lightbox-open');
      if(typeof lightbox.showModal==='function') lightbox.showModal();
      else lightbox.setAttribute('open','');
      closeButton.focus();
    };

    reviewImages.forEach(image=>{
      image.classList.add('review-image-zoom');
      image.tabIndex=0;
      image.setAttribute('role','button');
      image.setAttribute('aria-label','Ampliar imagen: '+(image.alt||'imagen de la reseña'));
      image.addEventListener('click',()=>openLightbox(image));
      image.addEventListener('keydown',event=>{
        if(event.key!=='Enter'&&event.key!==' ') return;
        event.preventDefault();
        openLightbox(image);
      });
    });

    closeButton.addEventListener('click',closeLightbox);
    lightbox.addEventListener('click',event=>{
      if(event.target===lightbox) closeLightbox();
    });
    lightbox.addEventListener('close',()=>{
      document.body.classList.remove('review-lightbox-open');
      lightboxImage.removeAttribute('src');
      sourceImage?.focus();
      sourceImage=null;
    });
  }
}
