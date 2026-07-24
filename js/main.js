/* ============================================
   CHECKPOINT — JS compartido
   ============================================ */

/* ---------- i18n (solo en la home) ---------- */
const i18n = {
  es:{
    nav_reviews:"Reseñas",nav_calendar:"Calendario",nav_news:"Noticias",nav_sub:"Suscríbete",
    hero_kicker:"Blog de videojuegos",
    hero_title:'Crítica con criterio, <em>hype</em> con calendario.',
    hero_sub:"Reseñas escritas a mano, un calendario de lanzamientos siempre al día y las noticias que de verdad importan. Sin ruido, sin clickbait.",
    hero_cta1:"Leer reseñas",hero_cta2:"Ver lanzamientos",
    hero_card_tag:"Reseña destacada",
    hero_card_sub:"Terror y acción combinados en uno de los mejores RE jamás hechos.",
    rev_kicker:"Análisis",rev_title:"Últimas reseñas",
    rev_sub:"Análisis en profundidad de los juegos que voy terminando. Opinión personal, sin notas infladas.",
    rev1:"Un remake construido desde cero en Unreal Engine 5 que respeta lo que hacía grande al original y moderniza todo lo demás.",
    rev2:"El spin-off más arriesgado de Nintendo apuesta por la historia sin perder el gancho jugable de la saga.",
    rev3:"Tras años de acceso anticipado, la versión final demuestra que había un gran juego detrás del meme.",
    read_more:"Leer reseña",
    cal_kicker:"Próximos lanzamientos",cal_title:"Calendario 2026",
    cal_sub:"Los lanzamientos más importantes de los próximos meses, siempre al día.",
    cd_sub:"19 de noviembre de 2026 · PS5 · Xbox Series X|S",cd_days:"Días",cd_hours:"Horas",
    f_all:"Todos",
    m_aug:"Agosto 2026",m_sep:"Septiembre 2026",m_oct:"Octubre 2026",m_nov:"Noviembre 2026",
    hype_high:"Hype alto",hype_mid:"Interesante",hype_max:"El evento del año",
    news_kicker:"Actualidad",news_title:"Solo lo relevante",
    news_sub:"Un resumen diario de las 3-5 noticias que de verdad merecen tu tiempo. Nada de notas de prensa recicladas.",
    n1_t:"Take-Two reafirma la fecha de GTA VI: 19 de noviembre",
    n1_p:"El CEO Strauss Zelnick vuelve a confirmar la fecha en un documento oficial y disipa los rumores de un tercer retraso. El marketing arranca este verano.",
    n2_t:"Agosto abre la temporada alta: Elden Ring llega a Switch 2",
    n2_p:"Tarnished Edition inaugura el 28 de agosto uno de los tramos más cargados del calendario reciente, con septiembre y octubre repletos de lanzamientos.",
    n3_t:"Wuthering Waves aterriza en Xbox y Where Winds Meet estrena expansión",
    n3_p:"Los free-to-play siguen ganando terreno en consola: 'Hidden Mountain' es la primera gran expansión de Where Winds Meet.",
    nl_title:"Un email a la semana. Cero spam.",
    nl_sub:"Las reseñas nuevas, el calendario actualizado y las 5 noticias de la semana, cada viernes en tu bandeja.",
    nl_btn:"Suscribirme",
    foot2:"Reseñas · Calendario · Noticias · Contacto"
  },
  en:{
    nav_reviews:"Reviews",nav_calendar:"Calendar",nav_news:"News",nav_sub:"Subscribe",
    hero_kicker:"Video game blog",
    hero_title:'Reviews with judgment, <em>hype</em> with a calendar.',
    hero_sub:"Hand-written reviews, an always up-to-date release calendar, and only the news that truly matters. No noise, no clickbait.",
    hero_cta1:"Read reviews",hero_cta2:"See releases",
    hero_card_tag:"Featured review",
    hero_card_sub:"Terror and action combined in one of the best RE games ever made.",
    rev_kicker:"Analysis",rev_title:"Latest reviews",
    rev_sub:"In-depth takes on the games I finish. Personal opinion, no inflated scores.",
    rev1:"A ground-up Unreal Engine 5 remake that respects what made the original great and modernizes everything else.",
    rev2:"Nintendo's boldest spin-off bets on story without losing the series' addictive gameplay.",
    rev3:"After years in early access, the final release proves there was a great game behind the meme.",
    read_more:"Read review",
    cal_kicker:"Upcoming releases",cal_title:"2026 Calendar",
    cal_sub:"The most important releases of the coming months, always up to date.",
    cd_sub:"November 19, 2026 · PS5 · Xbox Series X|S",cd_days:"Days",cd_hours:"Hours",
    f_all:"All",
    m_aug:"August 2026",m_sep:"September 2026",m_oct:"October 2026",m_nov:"November 2026",
    hype_high:"High hype",hype_mid:"Worth a look",hype_max:"Event of the year",
    news_kicker:"Now",news_title:"Only what matters",
    news_sub:"A daily digest of the 3-5 stories actually worth your time. No recycled press releases.",
    n1_t:"Take-Two reaffirms GTA VI's date: November 19",
    n1_p:"CEO Strauss Zelnick confirms the date again in an official filing, dispelling rumors of a third delay. Marketing kicks off this summer.",
    n2_t:"August opens high season: Elden Ring comes to Switch 2",
    n2_p:"Tarnished Edition launches August 28, kicking off one of the busiest stretches of the recent calendar, with September and October packed.",
    n3_t:"Wuthering Waves lands on Xbox as Where Winds Meet gets its first expansion",
    n3_p:"Free-to-play keeps gaining console ground: 'Hidden Mountain' is Where Winds Meet's first major expansion.",
    nl_title:"One email a week. Zero spam.",
    nl_sub:"New reviews, the updated calendar and the week's top 5 stories, every Friday in your inbox.",
    nl_btn:"Subscribe",
    foot2:"Reviews · Calendar · News · Contact"
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
}

/* ---------- Reveal on scroll ---------- */
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target);} });
},{threshold:.08});
document.querySelectorAll('.reveal,.stagger').forEach(el=>obs.observe(el));

/* ---------- Nav activa según scroll ---------- */
const sections=[...document.querySelectorAll('section[id]')];
const navLinks=[...document.querySelectorAll('nav a[href^="#"]')];
if(sections.length && navLinks.length){
  window.addEventListener('scroll',()=>{
    const y=window.scrollY+140;
    let cur=null;
    sections.forEach(s=>{ if(s.offsetTop<=y) cur=s.id; });
    navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
  },{passive:true});
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

/* ---------- Filtros del calendario ---------- */
const filters=document.getElementById('filters');
if(filters){
  filters.addEventListener('click',e=>{
    const btn=e.target.closest('.filter'); if(!btn)return;
    document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('on',b===btn));
    const f=btn.dataset.f;
    document.querySelectorAll('.release').forEach(r=>{
      r.classList.toggle('hide', f!=='all' && !r.dataset.plat.split(' ').includes(f));
    });
    document.querySelectorAll('[data-month]').forEach(m=>{
      let el=m.nextElementSibling, any=false;
      while(el && !el.hasAttribute('data-month')){
        if(el.classList.contains('release') && !el.classList.contains('hide')) any=true;
        el=el.nextElementSibling;
      }
      m.style.display=any?'':'none';
    });
  });
}
