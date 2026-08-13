# Automatización editorial de Noticias

La fuente de verdad de Noticias es el directorio `data/news/`. Cada noticia vive en un JSON independiente llamado exactamente como su identificador:

`data/news/slug-de-la-noticia.json`

El archivo generado `data/news-index.json` reúne esas entradas para el navegador. No se edita a mano. `js/news-core.js` y `js/game-hub.js` lo cargan mediante `fetch()`.

Una noticia válida alimenta:

- la noticia destacada y las tarjetas recientes de la portada,
- el reverso ampliado de cada tarjeta,
- la cuadrícula y la lista de Noticias,
- los filtros, la paginación y el ticker,
- las insignias «Relevante» y «Última hora»,
- las noticias relacionadas de las fichas de juego.

Las páginas individuales dentro de `noticias/` quedan fuera de la publicación automática. Una rama `bot/news-*` no puede crear `article.url` ni modificar artículos.

## Contenido de cada JSON

Cada archivo contiene directamente el objeto completo de la noticia. Debe incluir:

- `id` único en kebab-case y coincidente con el nombre del archivo,
- `category.es`, usando `Juegos`, `Lanzamientos`, `Plataformas` o `Industria`,
- `date` como fecha del hecho o publicación original y, cuando la hora de la fuente sea fiable, `publishedAt`,
- `addedAt` con fecha y hora ISO UTC del momento en que la tarjeta se incorpora al flujo de publicación de Final Secreto,
- `featured: false` en las altas automáticas,
- `tone`, `title.es`, `summary.es` y `why.es`,
- `homeDetails.es` con exactamente dos párrafos que aporten contexto nuevo,
- `emphasis.es` con dos o tres fragmentos literales del anverso,
- `sources` con URL HTTPS, etiqueta, `type.es` y al menos una fuente oficial inequívoca,
- `ticker.keyword.es` y `ticker.copy.es`.

`addedAt` gobierna la recencia editorial de la web: el orden de las tarjetas recientes, el ticker y el texto «Hace X horas» se calculan desde ese momento, no desde la fecha de la noticia original. Para las altas automáticas se fija al crear la tarjeta y no se modifica después. Las noticias antiguas que todavía no dispongan de `addedAt` mantienen como respaldo `publishedAt` o `date`.

La portada muestra las seis tarjetas recientes no destacadas: dos por página en escritorio, para un total de tres páginas. En móvil se mantiene una tarjeta por página y el gesto de deslizamiento.

## Modo ACTUALIZACIÓN

Una PR de ACTUALIZACIÓN modifica exactamente un JSON ya existente y nunca crea una noticia duplicada. Puede responder a dos causas:

1. **Evolución sustancial:** aparece un hecho oficial nuevo que cambia de forma material el estado de la historia. En este caso pueden actualizarse título, resumen, explicación, ampliación, énfasis, ticker y fuentes según sea necesario.
2. **Corrección o refuerzo editorial de fuentes:** se localiza una fuente primaria u oficial que faltaba, sustituye una fuente secundaria o mejora de forma inequívoca la verificación de una tarjeta ya publicada. En este caso la automatización puede modificar exclusivamente `sources` y `updated`; no debe reescribir el resto de la noticia si los hechos no han cambiado.

En ambos casos se conserva el mismo archivo, `id`, `date`, `publishedAt`, `addedAt`, categoría, tono, `important`, `featured`, `home`, `article`, `trailer` y los demás campos estructurales. `updated` debe reflejar la fecha de la actualización y avanzar respecto a la versión publicada. No se crea ni se conserva `versionHistory`.

La corrección de fuentes no cuenta como una noticia nueva, no altera el orden de recencia y no reactiva «Última hora». Su objetivo es endurecer la trazabilidad editorial sin obligar a crear una tarjeta duplicada ni bloquear el flujo automático.

`important: true` se reserva para prioridad alta. Junto con `publishedAt`, activa «Última hora» durante 24 horas desde la publicación original confirmada; `addedAt` no altera esa insignia. Una rama automática nunca puede cambiar la noticia `featured`.

## Criterio editorial

Se publican únicamente novedades nuevas, verificadas y de relevancia amplia:

- grandes decisiones estratégicas o empresariales,
- adquisiciones, cierres, despidos o reestructuraciones importantes,
- cambios sustanciales en PlayStation, Xbox, Nintendo, Steam u otras plataformas principales,
- anuncios, fechas, adelantos, retrasos o cancelaciones de juegos de gran interés,
- hardware o servicios relevantes,
- cuestiones importantes sobre propiedad, acceso, licencias o preservación.

Se excluyen rumores débiles, filtraciones no corroboradas, polémicas menores, parches, skins, temporadas, tráileres rutinarios y noticias de supernicho. Una información periodística sin confirmación oficial solo puede publicarse cuando proceda de un medio de máxima solvencia, tenga relevancia excepcional y se atribuya con claridad.

## Flujo único

La automatización diaria de ChatGPT se limita a:

1. consultar el `main` más reciente y las PR abiertas `bot/news-*`,
2. crear una rama `bot/news-AAAA-MM-DD-HHMM-slug`,
3. añadir uno o dos JSON nuevos en `data/news/` o actualizar exactamente uno ya existente,
4. abrir una PR lista para revisión contra `main`.

A partir de ese momento GitHub completa el proceso sin intervención manual:

1. `.github/workflows/dispatch-news-bot.yml` detecta la PR `bot/news-*` y lanza la validación protegida desde la versión de `validate-news.yml` existente en `main`.
2. La ejecución protegida vuelve a consultar la PR y exige que siga abierta, no sea borrador, apunte a `main`, proceda del repositorio principal y contenga exclusivamente JSON con ruta válida dentro de `data/news/`.
3. Se descarga la cabecera exacta de la PR, se compara contra el `main` actual, se ejecuta `validate-news-change.mjs`, se generan temporalmente todas las superficies y se pasan las validaciones de Noticias y fichas de juego.
4. Antes de fusionar se vuelve a comprobar el SHA de cabecera y la lista de archivos. Si no han cambiado, GitHub realiza `squash merge` y elimina la rama.
5. Un barrido programado cada diez minutos vuelve a procesar las PR `bot/news-*` abiertas y no borrador para recuperar ejecuciones perdidas o interrumpidas.
6. Tras el `push` a `main`, el mismo pipeline genera `data/news-index.json`, portada, Noticias, noticias relacionadas y sitemap, y guarda únicamente las salidas derivadas que hayan cambiado.

Las PR manuales que no usan el prefijo `bot/news-*` continúan validándose sin fusión automática. La autorización de merge automático queda limitada por tanto al canal automático de tarjetas y nunca se extiende a cambios de diseño, scripts, artículos o cualquier otro archivo del repositorio.

Cloudflare ejecuta `scripts/build-cloudflare-preview.mjs` mediante `wrangler.jsonc` antes de cada despliegue. Ese build regenera temporalmente `data/news-index.json`, portada, Noticias, ticker y noticias relacionadas en el entorno de compilación. Así la `Commit Preview URL` refleja el JSON de la rama sin añadir archivos generados al diff. `serve.py` conserva el mismo comportamiento para previews locales/Replit.

No hay bandeja de entrada, archivo histórico separado, importador ni movimientos de archivos. La comprobación de SHA y la fusión automática existen únicamente como barrera de seguridad para las ramas `bot/news-*` que superan la validación protegida.

## Archivos autorizados

La automatización externa modifica inicialmente solo:

- `data/news/slug-de-la-noticia.json`.

Una PR automática puede contener una o dos altas o una única actualización. No puede mezclar ambos modos, eliminar noticias, cambiar la destacada, crear artículos, editar estilos, modificar scripts ni incorporar salidas generadas.

El workflow puede guardar después del merge:

- `data/news-index.json`,
- `index.html`,
- `noticias.html`,
- `juegos.html`,
- `juegos/*.html`,
- `sitemap.xml` cuando el render de fichas lo requiera.

## Casos que deben bloquearse

No se publica y se solicita revisión cuando:

- las fuentes fiables se contradicen,
- falta una fuente primaria u oficial inequívoca y no puede localizarse una,
- no puede distinguirse entre hecho, información periodística y rumor,
- una alta automática no incluye un `addedAt` válido,
- la novedad pretende reemplazar la destacada,
- una actualización no puede conservar el identificador, `addedAt`, la fecha original o la estructura de la tarjeta,
- una supuesta corrección de fuentes intenta modificar además contenido editorial sin que exista una evolución sustancial,
- necesita una página individual o un cambio de diseño,
- el JSON está mal formado, repite un identificador o no cumple el esquema,
- una PR automática contiene más de dos noticias o cualquier otro archivo editorial no autorizado,
- la rama, el SHA o la lista de archivos cambian después de la validación protegida.

Cuando una validación protegida falla, la PR permanece abierta y el despachador publica el diagnóstico de GitHub Actions en la propia conversación. Si no hay novedades suficientemente importantes, no se modifica el repositorio ni se notifica.
