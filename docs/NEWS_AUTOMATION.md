# Automatización editorial de Noticias

La vigilancia automática mantiene las tarjetas de Noticias de Final Secreto sin editar directamente el archivo editorial grande desde ChatGPT. El bot entrega una o dos candidatas pequeñas en `data/news-inbox/` y GitHub las valida, importa y archiva.

Una entrada incorporada a `js/news-data.js` alimenta simultáneamente:

- la noticia destacada y las tarjetas recientes de la portada,
- el reverso ampliado de cada tarjeta,
- la cuadrícula y la lista de la sección Noticias,
- los filtros, la paginación y el ticker,
- las insignias «Relevante» y «Última hora»,
- las noticias relacionadas de las fichas de juego.

Las páginas individuales dentro de `noticias/` quedan fuera de la publicación automática. Una rama `bot/news-*` no puede crear `article.url` ni modificar artículos.

## Bandeja de entrada

Cada noticia automática se entrega como un archivo JSON nuevo:

`data/news-inbox/AAAA-MM-DD-slug.json`

El archivo contiene directamente el objeto completo de la noticia. No incluye un contenedor adicional ni instrucciones para modificar otros archivos. Una PR puede añadir uno o, como máximo, dos JSON.

La automatización externa solo debe crear estos archivos. No debe editar `js/news-data.js`, HTML, scripts, estilos, sitemap ni datos ya publicados.

El workflow protegido ejecuta `scripts/import-news-candidates.mjs`, que:

1. comprueba el nombre y la sintaxis de cada JSON,
2. bloquea identificadores existentes o repetidos,
3. exige `featured: false` y rechaza `article.url`,
4. inserta las candidatas al comienzo de `window.FINALSECRETO_NEWS` sin reformatear las entradas existentes,
5. mueve cada JSON a `data/news-archive/AAAA/MM/`,
6. entrega el resultado a las validaciones editoriales ya existentes.

El archivo histórico conserva exactamente el objeto recibido por la automatización y permite auditar o reconstruir cada incorporación.

## Fuente estructurada publicada

`js/news-data.js` sigue siendo la fuente editorial consumida por la web. Cada entrada contiene tanto el anverso como el reverso de la tarjeta mediante `homeDetails`. El motor `js/news-core.js` solo interpreta estos datos y `js/news.js` se limita a cargarlo.

Una noticia candidata debe incluir:

- `id` único en kebab-case,
- `category.es`, usando `Juegos`, `Lanzamientos`, `Plataformas` o `Industria`,
- `date` y, cuando la hora sea fiable, `publishedAt`,
- `featured: false`,
- `tone`, `title.es`, `summary.es` y `why.es`,
- `homeDetails.es` con exactamente dos párrafos que aporten contexto nuevo,
- `emphasis.es` con dos o tres fragmentos literales del anverso,
- `sources` con URL HTTPS, etiqueta y `type.es`,
- `ticker` cuando la relevancia justifique aparecer entre las cuatro últimas.

`important: true` se reserva para prioridad alta. Junto con `publishedAt`, activa «Última hora» durante 24 horas. Una rama automática nunca puede cambiar la noticia `featured`.

## Criterio editorial

Se publican únicamente novedades nuevas, verificadas y de relevancia amplia:

- grandes decisiones estratégicas o empresariales,
- adquisiciones, cierres, despidos o reestructuraciones importantes,
- cambios sustanciales en PlayStation, Xbox, Nintendo, Steam u otras plataformas principales,
- anuncios, fechas, adelantos, retrasos o cancelaciones de juegos de gran interés,
- hardware o servicios relevantes,
- cuestiones importantes sobre propiedad, acceso, licencias o preservación.

Se excluyen rumores débiles, filtraciones no corroboradas, polémicas menores, parches, skins, temporadas, tráileres rutinarios y noticias de supernicho. Una información periodística sin confirmación oficial solo puede publicarse cuando proceda de un medio de máxima solvencia, tenga relevancia excepcional y se atribuya con claridad.

La fecha de God of War Laufey del 16 de febrero de 2027 se considera cubierta. Solo se actualiza ante un cambio sustancial posterior.

## Flujo protegido de GitHub

Cuando existe una noticia inequívoca:

1. Consultar el `main` más reciente, el historial y las PR abiertas `bot/news-*`.
2. Crear una rama `bot/news-AAAA-MM-DD-HHMM-slug` desde `main`.
3. Añadir uno o dos JSON nuevos exclusivamente en `data/news-inbox/`.
4. Abrir una PR no borrador contra `main`.
5. El workflow comprueba procedencia, rama y archivos antes de descargarla.
6. El importador incorpora las candidatas a `js/news-data.js` y las archiva.
7. Las validaciones comprueban fuentes, estructura, fechas, categorías, énfasis, reversos, duplicados y alcance.
8. El workflow actualiza las versiones de caché de portada y Noticias.
9. Regenera las noticias relacionadas y las secciones derivadas de las fichas de juego.
10. Guarda únicamente la importación, el archivo histórico y las salidas derivadas autorizadas.
11. Comprueba de nuevo la lista de archivos y el SHA exacto de la cabecera.
12. Fusiona mediante squash y elimina la rama sin depender del Auto-merge nativo de GitHub.

Las ramas automáticas pueden añadir como máximo dos noticias recientes por PR. No pueden eliminar ni reescribir noticias existentes, cambiar la destacada, crear artículos, editar estilos o modificar scripts. Una actualización material de una noticia ya publicada requiere revisión humana.

## Archivos autorizados

El bot añade inicialmente solo:

- `data/news-inbox/AAAA-MM-DD-slug.json`.

El workflow puede transformar y guardar:

- `js/news-data.js`,
- `data/news-archive/AAAA/MM/AAAA-MM-DD-slug.json`,
- `index.html`,
- `noticias.html`,
- `juegos.html`,
- `juegos/*.html` cuando cambien las noticias relacionadas.

El JSON de entrada desaparece de la bandeja al quedar archivado. Cualquier otro archivo bloquea la fusión automática.

## Casos que deben bloquearse

No se publica y se solicita revisión cuando:

- las fuentes fiables se contradicen,
- falta una fuente primaria u oficial inequívoca,
- no puede distinguirse entre hecho, información periodística y rumor,
- la novedad pretende reemplazar la destacada,
- requiere actualizar una noticia existente,
- necesita una página individual o un cambio de diseño,
- el JSON está mal formado, repite un identificador o no cumple el esquema,
- el diff contiene archivos no autorizados,
- GitHub no puede validar o fusionar el commit exacto con seguridad.

Si no hay novedades suficientemente importantes, no se modifica el repositorio ni se notifica. Si el proceso termina correctamente, puede permanecer silencioso.
