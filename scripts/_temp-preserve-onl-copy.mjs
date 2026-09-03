import { readFile, writeFile } from "node:fs/promises";

const path = "scripts/render-events.mjs";
let source = await readFile(path, "utf8");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`No se encontró: ${label}`);
  source = source.replace(before, after);
}

const legacyHelper = `function legacyCompleteAnnouncementMarkup(item) {
  const isPreShow = item.type.startsWith("Pre-show");
  const stage = isPreShow ? "preshow" : "main";
  const stageLabel = isPreShow ? "Pre-show" : "Gala";
  const cleanType = item.type.replace(/^Pre-show\\s*·\\s*/, "");
  const videoId = youtubeIdFromUrl(item.trailerUrl);
  const image = item.archiveImage || \`https://img.youtube.com/vi/\${videoId}/hqdefault.jpg\`;
  const links = [
    item.relatedUrl ? \`<a href="\${escapeHtml(item.relatedUrl)}">Más información →</a>\` : "",
    item.trailerUrl ? \`<a href="\${escapeHtml(item.trailerUrl)}" target="_blank" rel="noopener noreferrer">Ver tráiler ↗</a>\` : "",
    \`<a href="\${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>\`
  ].filter(Boolean).join("\\n              ");
  return \`<article class="event-all-item" data-event-all-item data-event-stage="\${stage}">
          <div class="event-all-art"><img src="\${escapeHtml(image)}" alt="" loading="lazy" decoding="async"><span></span></div>
          <div class="event-all-meta"><span>\${stageLabel}</span><strong>\${escapeHtml(cleanType)}</strong></div>
          <div class="event-all-copy">
            <h3>\${escapeHtml(item.title)}</h3>
            <p>\${escapeHtml(item.summary)}</p>
            <div class="event-all-links">
              \${links}
            </div>
          </div>
        </article>\`;
}

`;
replaceOnce("function completeAnnouncementMarkup(item, archiveStages) {", `${legacyHelper}function completeAnnouncementMarkup(item, archiveStages) {`, "helper legacy");
replaceOnce(
  "  const archiveStages = Array.isArray(data.archiveStages) && data.archiveStages.length ? data.archiveStages : [{ id: \"main\", label: \"Gala\" }, { id: \"preshow\", label: \"Pre-show\" }];",
  "  const hasCustomArchiveStages = Array.isArray(data.archiveStages) && data.archiveStages.length > 0;\n  const archiveStages = hasCustomArchiveStages ? data.archiveStages : [{ id: \"main\", label: \"Gala\" }, { id: \"preshow\", label: \"Pre-show\" }];",
  "detección de segmentos"
);
replaceOnce(
  ".map((item) => completeAnnouncementMarkup(item, archiveStages))",
  ".map((item) => hasCustomArchiveStages ? completeAnnouncementMarkup(item, archiveStages) : legacyCompleteAnnouncementMarkup(item))",
  "renderer de archivo"
);
replaceOnce(
  '${isFinished ? "Ver la emisión completa" : "Ver la emisión"}',
  '${isFinished ? (hasCustomArchiveStages ? "Ver la emisión completa" : "Ver la gala completa") : "Ver la emisión"}',
  "CTA emisión"
);
replaceOnce(
  '${isFinished ? `Lo mejor de ${escapeHtml(data.shortTitle)}` : "Todos los anuncios de la emisión"}',
  '${isFinished ? (hasCustomArchiveStages ? `Lo mejor de ${escapeHtml(data.shortTitle)}` : "Lo mejor de Opening Night Live") : (hasCustomArchiveStages ? "Todos los anuncios de la emisión" : "Todos los anuncios de la gala")}',
  "titular de anuncios"
);
replaceOnce(
  '<strong>La cobertura comenzará con la emisión</strong>',
  '<strong>${hasCustomArchiveStages ? "La cobertura comenzará con la emisión" : "La cobertura comenzará con la gala"}</strong>',
  "estado vacío"
);
replaceOnce(
  'Una selección inicial para saber qué buscar durante la emisión, separada de cualquier rumor o predicción.',
  '${hasCustomArchiveStages ? "Una selección inicial para saber qué buscar durante la emisión, separada de cualquier rumor o predicción." : "Una selección inicial para saber qué buscar durante la gala, separada de cualquier rumor o predicción."}',
  "texto de confirmados"
);
replaceOnce(
  '${isFinished ? "La emisión completa permanece disponible en el canal oficial." : "La emisión oficial puede verse sin salir de la cobertura."}',
  '${isFinished ? (hasCustomArchiveStages ? "La emisión completa permanece disponible en el canal oficial." : "La gala completa permanece disponible en la emisión oficial.") : "La emisión oficial puede verse sin salir de la cobertura."}',
  "texto de retransmisión"
);
replaceOnce(
  '<p class="event-watch-summary">Una lectura editorial de la presentación con grandes estrenos, regresos y fechas por delante de anuncios menores.</p>',
  '<p class="event-watch-summary">${hasCustomArchiveStages ? "Una lectura editorial de la presentación con grandes estrenos, regresos y fechas por delante de anuncios menores." : "Una lectura editorial de la gala: grandes estrenos, regresos y fechas por delante de anuncios menores."}</p>',
  "resumen editorial"
);
replaceOnce(
  '${isFinished ? "Los anuncios se han contrastado con la emisión oficial y las fuentes publicadas tras la presentación." : "La página distingue los anuncios oficiales de la información previa publicada por medios solventes."}',
  '${isFinished ? (hasCustomArchiveStages ? "Los anuncios se han contrastado con la emisión oficial y las fuentes publicadas tras la presentación." : "Los anuncios se han contrastado con la emisión oficial y las coberturas publicadas tras la gala.") : "La página distingue los anuncios oficiales de la información previa publicada por medios solventes."}',
  "texto de fuentes"
);

await writeFile(path, source, "utf8");
