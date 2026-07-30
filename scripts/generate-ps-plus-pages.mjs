import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT=process.cwd();
const DATA_FILE=path.join(ROOT,"data","playstation-plus.json");
const OUTPUT_DIR=path.join(ROOT,"playstation-plus");
const SITE_ORIGIN="https://finalsecreto.com";

const escapeHtml=(value="")=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const escapeJson=(value)=>JSON.stringify(value).replaceAll("<","\\u003c");
const lowerFirst=(value="")=>value?value[0].toLocaleLowerCase("es-ES")+value.slice(1):value;
function formatUpdated(value){const date=new Date(`${value}T12:00:00Z`);if(Number.isNaN(date.getTime()))return value;return new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(date);}
function heroSymbols(){return `<div class="psplus-symbol" aria-hidden="true"><span><svg viewBox="0 0 48 48"><rect x="13" y="13" width="22" height="22" rx="1"/></svg></span><span><svg viewBox="0 0 48 48"><path d="M24 11 37 35H11Z"/></svg></span><span><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="13"/></svg></span><span><svg viewBox="0 0 48 48"><path d="m14 14 20 20M34 14 14 34"/></svg></span></div>`;}
function monthNavigation(months,index){const previous=months[index+1],next=months[index-1];return `<nav class="psplus-month-nav" aria-label="Navegar entre meses">${previous?`<a href="/playstation-plus/${previous.id}">← ${escapeHtml(previous.label)}</a>`:"<span></span>"}<a class="psplus-month-index" href="/playstation-plus">Todos los meses</a>${next?`<a href="/playstation-plus/${next.id}">${escapeHtml(next.label)} →</a>`:"<span></span>"}</nav>`;}

function renderPage(month,months,index,data){
  const titleMonth=lowerFirst(month.label);
  const gameCount=month.groups.flatMap((group)=>group.games||[]).length;
  const description=`Juegos de PlayStation Plus de ${titleMonth}, ordenados por Essential, Extra y Premium, con fechas y consolas.`;
  const canonical=`${SITE_ORIGIN}/playstation-plus/${month.id}`;
  const structured={"@context":"https://schema.org","@type":"CollectionPage",name:`Juegos de PlayStation Plus de ${month.label}`,url:canonical,description,inLanguage:"es",dateModified:data.updatedAt,mainEntity:{"@type":"ItemList",numberOfItems:gameCount},isPartOf:{"@type":"WebSite",name:"Final Secreto",url:`${SITE_ORIGIN}/`}};
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Juegos de PlayStation Plus de ${escapeHtml(month.label)} | Final Secreto</title>
  <meta name="description" content="${escapeHtml(description)}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png"><link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Final Secreto"><meta property="og:title" content="Juegos de PlayStation Plus de ${escapeHtml(month.label)} | Final Secreto"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css?v=20260729-6"><link rel="stylesheet" href="/css/brand-logo.css"><link rel="stylesheet" href="/css/playstation-plus.css?v=20260729-3">
  <script>(function(){try{var saved=localStorage.getItem('finalsecreto-theme');var theme=saved||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme;}catch(e){}})();</script><script type="application/ld+json">${escapeJson(structured)}</script>
</head>
<body class="psplus-page psplus-month-page" data-psplus-month="${escapeHtml(month.id)}">
  <header><div class="header-inner"><a href="/" class="logo"><img class="site-logo-mark" src="/favicon.svg" alt="" aria-hidden="true" width="36" height="36">Final <span>Secreto</span></a><nav><a href="/noticias">Noticias</a><a href="/calendario" class="active">Calendario</a><a href="/juegos">Juegos</a><a href="/resenas">Reseñas</a><a href="/sobre-mi">Sobre mí</a><a href="/contacto">Contacto</a><button class="theme-toggle" id="themeToggle" type="button" aria-label="Activar modo oscuro" aria-pressed="false" title="Cambiar tema"><svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.7 8.7 0 1 0 20.2 15.4Z"/></svg><svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></nav></div></header>
  <main><section class="psplus-hero"><div class="wrap psplus-hero-inner"><a href="/playstation-plus" class="back">← Volver a PlayStation Plus</a><div class="psplus-hero-grid"><div><div class="kicker">PlayStation Plus</div><h1>Juegos de ${escapeHtml(month.label)}</h1><p>${escapeHtml(month.availability)}. Consulta qué llega a cada plan y en qué consolas está disponible.</p></div>${heroSymbols()}</div></div></section>
    <section class="wrap psplus-content" aria-labelledby="psplusMonthTitle">${monthNavigation(months,index)}<div class="psplus-month-heading reveal"><div><span class="psplus-eyebrow">${escapeHtml(month.availability)}</span><h2 id="psplusMonthTitle">${escapeHtml(month.headline)}</h2></div><a class="psplus-source-link" href="${escapeHtml(month.source)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></div>
      <div class="psplus-filters reveal" id="psplusMonthFilters" role="group" aria-label="Filtrar juegos"><button type="button" class="on" data-filter="all" aria-pressed="true">Todos</button><button type="button" data-filter="essential" aria-pressed="false">Essential</button><button type="button" data-filter="extra" aria-pressed="false">Extra</button><button type="button" data-filter="premium" aria-pressed="false">Premium</button><button type="button" data-filter="ps5" aria-pressed="false">PS5</button><button type="button" data-filter="ps4" aria-pressed="false">PS4</button></div>
      <p class="psplus-static-status" id="psplusMonthStatus" aria-live="polite">Cargando juegos…</p><div class="psplus-groups" id="psplusMonthGroups" aria-live="polite"></div>${monthNavigation(months,index)}<p class="psplus-disclaimer">Actualizado el ${escapeHtml(formatUpdated(data.updatedAt))}. La selección y las fechas pueden variar según la región. Esta página toma como referencia la información oficial para ${escapeHtml(data.region)}.</p></section>
  </main><footer><div class="footer-inner"><span>© 2026 Final Secreto</span></div></footer><script src="/js/main.js?v=20260729-8"></script><script src="/js/playstation-plus-month.js?v=20260729-2"></script>
</body></html>\n`;
}

const data=JSON.parse(await readFile(DATA_FILE,"utf8"));
const months=data.months.filter((month)=>month.groups?.some((group)=>group.games?.length)).sort((a,b)=>b.id.localeCompare(a.id));
await mkdir(OUTPUT_DIR,{recursive:true});
const expected=new Set(months.map((month)=>`${month.id}.html`));
for(const file of await readdir(OUTPUT_DIR)){if(file.endsWith(".html")&&!expected.has(file))await unlink(path.join(OUTPUT_DIR,file));}
await Promise.all(months.map((month,index)=>writeFile(path.join(OUTPUT_DIR,`${month.id}.html`),renderPage(month,months,index,data),"utf8")));
console.log(`Generadas ${months.length} páginas mensuales de PlayStation Plus.`);
