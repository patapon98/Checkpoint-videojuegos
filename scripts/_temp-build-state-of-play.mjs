import { readFile, writeFile } from "node:fs/promises";
const mode=process.argv[2]||"prepare";
const get=(p)=>readFile(p,"utf8"), put=(p,s)=>writeFile(p,s,"utf8");
function r(s,re,v,label){if(s.includes(v))return s;if(!re.test(s))throw new Error(`Falta bloque: ${label}`);return s.replace(re,()=>v)}
if(mode==="prepare"){
  const ep="data/events/state-of-play-septiembre-2026.json";const ed=JSON.parse(await get(ep));await put(ep,JSON.stringify(ed,null,2)+"\n");
  let s=await get("scripts/render-events.mjs");
  const cm=`function completeAnnouncementMarkup(item, archiveStages) {
  const isPreShow = item.type.startsWith("Pre-show");
  const stages = Array.isArray(item.stages) && item.stages.length ? item.stages : [item.stage || (isPreShow ? "preshow" : "main")];
  const stageLabels = stages.map((stage) => archiveStages.find((entry) => entry.id === stage)?.label || stage).filter(Boolean);
  const cleanType = item.type.replace(/^Pre-show\\s*·\\s*/, "");
  const videoId = youtubeIdFromUrl(item.trailerUrl);
  const image = item.archiveImage || \`https://img.youtube.com/vi/\${videoId}/hqdefault.jpg\`;
  const links = [
    item.relatedUrl ? \`<a href="\${escapeHtml(item.relatedUrl)}">Más información →</a>\` : "",
    item.trailerUrl ? \`<a href="\${escapeHtml(item.trailerUrl)}" target="_blank" rel="noopener noreferrer">Ver tráiler ↗</a>\` : "",
    \`<a href="\${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>\`
  ].filter(Boolean).join("\\n              ");
  return \`<article class="event-all-item" data-event-all-item data-event-stages="\${escapeHtml(stages.join(" "))}">
          <div class="event-all-art"><img src="\${escapeHtml(image)}" alt="" loading="lazy" decoding="async"><span></span></div>
          <div class="event-all-meta"><span>\${escapeHtml(stageLabels.join(" · "))}</span><strong>\${escapeHtml(cleanType)}</strong></div>
          <div class="event-all-copy">
            <h3>\${escapeHtml(item.title)}</h3><p>\${escapeHtml(item.summary)}</p>
            <div class="event-all-links">\${links}</div>
          </div>
        </article>\`;
}

function archiveCardMarkup`;
  s=r(s,/function completeAnnouncementMarkup\(item\) \{[\s\S]*?\n\}\n\nfunction archiveCardMarkup/,cm,"archivo por segmentos");
  const setup=`  const announcements = data.announcements.map(announcementMarkup).join("\\n        ");
  const highlightAnnouncements = highlights.map(highlightMarkup).join("\\n        ");
  const archiveStages = Array.isArray(data.archiveStages) && data.archiveStages.length ? data.archiveStages : [{ id: "main", label: "Gala" }, { id: "preshow", label: "Pre-show" }];
  const archiveStageButtons = archiveStages.map((stage) => \`<button type="button" data-event-stage-filter="\${escapeHtml(stage.id)}" aria-pressed="false">\${escapeHtml(stage.label)}</button>\`).join("\\n            ");
  const completeAnnouncements = [...data.announcements]
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }))
    .map((item) => completeAnnouncementMarkup(item, archiveStages))
    .join("\\n        ");
  const filterTypes`;
  s=r(s,/  const announcements = data\.announcements\.map\(announcementMarkup\)[\s\S]*?  const filterTypes/,setup,"configuración de segmentos");
  s=r(s,/        location: \{ "@type": "Place", name: data\.location\.name, address: \{ "@type": "PostalAddress", addressLocality: data\.location\.city, addressCountry: data\.location\.country \} \},/,
`        location: data.attendanceMode === "OnlineEventAttendanceMode"
          ? { "@type": "VirtualLocation", url: data.streamUrl }
          : { "@type": "Place", name: data.location.name, address: { "@type": "PostalAddress", addressLocality: data.location.city, addressCountry: data.location.country } },`,"ubicación");
  const swaps=[
    ['${isFinished ? "Ver la gala completa" : "Ver la emisión"}','${isFinished ? "Ver la emisión completa" : "Ver la emisión"}'],
    ['${isFinished ? "Lo mejor de Opening Night Live" : "Todos los anuncios de la gala"}','${isFinished ? `Lo mejor de ${escapeHtml(data.shortTitle)}` : "Todos los anuncios de la emisión"}'],
    ["La cobertura comenzará con la gala","La cobertura comenzará con la emisión"],
    ["durante la gala, separada de cualquier rumor o predicción.","durante la emisión, separada de cualquier rumor o predicción."],
    ["La gala completa permanece disponible en la emisión oficial.","La emisión completa permanece disponible en el canal oficial."],
    ["Una lectura editorial de la gala: grandes estrenos, regresos y fechas por delante de anuncios menores.","Una lectura editorial de la presentación con grandes estrenos, regresos y fechas por delante de anuncios menores."],
    ["Los anuncios se han contrastado con la emisión oficial y las coberturas publicadas tras la gala.","Los anuncios se han contrastado con la emisión oficial y las fuentes publicadas tras la presentación."],
    ['<script src="/js/event-hub.js?v=20260826-3"></script>','<script src="/js/event-hub.js?v=20260903-1"></script>']
  ];for(const [a,b] of swaps)s=s.replaceAll(a,b);
  s=r(s,/            <button type="button" data-event-stage-filter="main"[\s\S]*?<button type="button" data-event-stage-filter="preshow"[^>]*>Pre-show<\/button>/,`            \${archiveStageButtons}`,"botones de segmentos");
  await put("scripts/render-events.mjs",s);

  s=await get("js/event-hub.js");
  s=r(s,/      const matchesStage = activeStage === 'all' \|\| item\.dataset\.eventStage === activeStage;\n      const matchesQuery/,
`      const itemStages = (item.dataset.eventStages || item.dataset.eventStage || '').split(/\\s+/).filter(Boolean);
      const matchesStage = activeStage === 'all' || itemStages.includes(activeStage);
      const matchesQuery`,"filtro JS");await put("js/event-hub.js",s);

  s=await get("scripts/validate-events.mjs");
  s=s.replace('"phase", "preShowAt", "startAt"','"phase", "startAt"');
  s=r(s,/  expect\(Number\.isFinite\(Date\.parse\(data\.preShowAt\)\) && Number\.isFinite\(Date\.parse\(data\.startAt\)\), `\$\{label\}: horarios inválidos`\);\n  expect\(Date\.parse\(data\.preShowAt\) < Date\.parse\(data\.startAt\), `\$\{label\}: la previa debe comenzar antes de la gala`\);/,
`  expect(Number.isFinite(Date.parse(data.startAt)), \`\${label}: horario principal inválido\`);
  if (data.preShowAt) {
    expect(Number.isFinite(Date.parse(data.preShowAt)), \`\${label}: horario previo inválido\`);
    expect(Date.parse(data.preShowAt) < Date.parse(data.startAt), \`\${label}: la previa debe comenzar antes de la emisión principal\`);
  }`,"horarios");
  s=r(s,/  \["name", "city", "country"\]\.forEach\(\(key\) => requiredString\(data\.location, key, `\$\{label\} > location`\)\);/,
`  if (data.attendanceMode !== "OnlineEventAttendanceMode") ["name", "city", "country"].forEach((key) => requiredString(data.location, key, \`\${label} > location\`));`,"location");
  s=r(s,/      requiredString\(item, "trailerUrl", `\$\{label\} > announcements\[\$\{index\}\]`\);\n      expect\(\/\^https:[\s\S]*?if \(item\.archiveImage\) expect\(\/\^https:[^\n]+\n/,
`      expect(Boolean(item.trailerUrl || item.archiveImage), \`\${label} > announcements[\${index}]: necesita trailerUrl o archiveImage\`);
      if (item.trailerUrl) {
        expect(/^https:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)/.test(item.trailerUrl), \`\${label} > announcements[\${index}]: trailerUrl debe enlazar a YouTube\`);
        expect(youtubeIdFromUrl(item.trailerUrl) !== data.streamYoutubeId, \`\${label} > announcements[\${index}]: trailerUrl no puede apuntar a la retransmisión completa\`);
      }
      if (item.archiveImage) expect(/^https:\\/\\//.test(item.archiveImage), \`\${label} > announcements[\${index}]: archiveImage debe ser una URL HTTPS\`);
`,"tráiler opcional");
  s=r(s,/    expect\(html\.includes\('data-event-stage-filter="main"'\) && html\.includes\('data-event-stage-filter="preshow"'\), `\$\{output\}: faltan los filtros de gala y pre-show`\);/,
`    const archiveStages = Array.isArray(data.archiveStages) && data.archiveStages.length ? data.archiveStages : [{ id: "main", label: "Gala" }, { id: "preshow", label: "Pre-show" }];
    for (const stage of archiveStages) expect(html.includes(\`data-event-stage-filter="\${stage.id}"\`), \`\${output}: falta el filtro \${stage.label}\`);`,"validar segmentos");
  s=r(s,/  const home = await readFile\("index\.html", "utf8"\);[\s\S]*?expect\(homeScript\.includes\(`\/data\/events\/\$\{data\.id\}\.json`\), `js\/home-featured\.js: no carga los datos de \$\{data\.id\}`\);/,
`  if (data.homeFeatured === true) {
    const home = await readFile("index.html", "utf8");
    const compactHome = home.replace(/\\s+/g, " ");
    expect(home.includes(\`/eventos/\${data.id}\`), \`index.html: falta el evento destacado \${data.id}\`);
    expect(compactHome.includes(escapeHtml(data.homeFeature.tag)) && compactHome.includes(escapeHtml(data.homeFeature.title)) && compactHome.includes(escapeHtml(data.homeFeature.summary)), \`index.html: la destacada inicial de \${data.id} no coincide con sus datos\`);
    expect(home.includes(data.heroImage), \`index.html: la destacada inicial de \${data.id} no usa su imagen actual\`);
    const homeScript = await readFile("js/home-featured.js", "utf8");
    expect(homeScript.includes(\`/data/events/\${data.id}.json\`), \`js/home-featured.js: no carga los datos de \${data.id}\`);
  }`,"portada única");
  await put("scripts/validate-events.mjs",s);

  s=await get("js/home-featured.js");s=s.replace("/data/events/gamescom-onl-2026.json","/data/events/state-of-play-septiembre-2026.json");await put("js/home-featured.js",s);
  s=await get("docs/EVENT_HUBS.md");s=s.replace("un archivo alfabético buscable con filtros para gala y pre-show. El resumen final no muestra horas.","un archivo alfabético buscable. Los filtros se definen mediante `archiveStages` para reflejar las partes reales de cada evento y cada anuncio puede declarar uno o varios `stages`. El resumen final no muestra horas.");await put("docs/EVENT_HUBS.md",s);
  s=await get(".github/workflows/update-sitemap.yml");s=s.replace('      - "juegos/*.html"\n      - "playstation-plus.html"','      - "juegos/*.html"\n      - "eventos.html"\n      - "eventos/*.html"\n      - "playstation-plus.html"');await put(".github/workflows/update-sitemap.yml",s);
}else if(mode==="finalize"){
  let s=await get("index.html");
  const card=`<a
          class="hero-card event-featured"
          id="heroCard"
          href="/eventos/state-of-play-septiembre-2026"
          aria-label="Repasar State of Play y State of Play Japan de septiembre de 2026 en Final Secreto"
        >
          <img src="https://img.youtube.com/vi/dcTYz_mJpkU/maxresdefault.jpg" alt="Imagen oficial del State of Play de septiembre de 2026" />
          <div class="event-featured-date" aria-hidden="true"><b>03</b><span>SEP</span></div>
          <div class="tag">RESUMEN · State of Play</div>
          <h3>State of Play de septiembre, lo más importante</h3>
          <p>Final Fantasy VII Revelation ya tiene fecha y la doble emisión dejó nuevos juegos, expansiones y fechas para PS5.</p>
        </a>
      </div>
    </div>`;
  if(!s.includes('href="/eventos/state-of-play-septiembre-2026"'))s=r(s,/<a\s+class="hero-card event-featured"\s+id="heroCard"[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/,card,"hero");
  await put("index.html",s);
}else throw new Error("Modo no válido");
