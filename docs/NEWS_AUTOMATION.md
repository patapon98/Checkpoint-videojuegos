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
- `date` y, cuando la hora sea fiable, `publishedAt`,
- `featured: false` en las altas automáticas,
- `tone`, `title.es`, `summary.es` y `why.es`,
- `homeDetails.es` con exactamente dos párrafos que aporten contexto nuevo,
- `emphasis.es` con dos o tres fragmentos literales del anverso,
- `sources` con URL HTTPS, etiqueta, `type.es` y al menos una fuente oficial inequívoca,
- `ticker.keyword.es` y `ticker.copy.es`.

Cuando una noticia publicada cambia de estado, se actualiza su mismo JSON y se conserva la URL y el identificador. La versión nueva debe añadir:

- `updated` con una fecha posterior a la versión vigente,
- título, resumen, contexto, ampliación, énfasis, ticker y fuentes adaptados al nuevo hecho.

La tarjeta conserva la fecha original y muestra una señal discreta con la fecha de actualización. No se crea ni se conserva `versionHistory`.

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

## Flujo único

La automatización diaria de ChatGPT se limita a:

1. consultar el `main` más reciente y las PR abiertas `bot/news-*`,
2. crear una rama `bot/news-AAAA-MM-DD-HHMM-slug`,
3. añadir uno o dos JSON nuevos en `data/news/` o actualizar exactamente uno ya existente,
4. abrir una PR contra `main`.

El único workflow de Noticias, `.github/workflows/validate-news.yml`, actúa en dos momentos:

- En la PR valida que una rama automática solo añada uno o dos JSON o actualice exactamente uno. Comprueba duplicados, recencia, fuente oficial y estructura editorial, y genera todas las salidas únicamente dentro del entorno de comprobación. No hace commits adicionales en la rama del PR.
- Tras el `push` a `main` genera `data/news-index.json`, actualiza la caché de portada y Noticias, renderiza las noticias relacionadas, ejecuta todas las validaciones y hace un commit únicamente si cambió algún archivo generado.

La `Commit Preview URL` no necesita que esos archivos generados estén versionados en la rama. `serve.py` ejecuta los mismos generadores al arrancar el entorno de preview, de modo que portada, Noticias, ticker y relacionadas reflejan el JSON de la rama sin ensuciar el diff del PR.

No hay bandeja de entrada, archivo histórico separado, importador, movimientos de archivos, reintentos programados, ejecución manual, comprobaciones de SHA ni fusión automática.

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
- falta una fuente primaria u oficial inequívoca,
- no puede distinguirse entre hecho, información periodística y rumor,
- la novedad pretende reemplazar la destacada,
- una actualización no puede conservar el identificador, la fecha original o la estructura de la tarjeta,
- necesita una página individual o un cambio de diseño,
- el JSON está mal formado, repite un identificador o no cumple el esquema,
- una PR automática contiene más de dos noticias o cualquier otro archivo editorial no autorizado.

Si no hay novedades suficientemente importantes, no se modifica el repositorio ni se notifica.
