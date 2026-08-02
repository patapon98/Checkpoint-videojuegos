# Automatización editorial de Noticias

La vigilancia automática mantiene las tarjetas de Noticias de Final Secreto. Una entrada válida en `js/news-data.js` alimenta simultáneamente:

- la noticia destacada y las tarjetas recientes de la portada,
- el reverso ampliado de cada tarjeta,
- la cuadrícula y la lista de la sección Noticias,
- los filtros, la paginación y el ticker,
- las insignias «Relevante» y «Última hora»,
- las noticias relacionadas de las fichas de juego.

Las páginas individuales dentro de `noticias/` quedan fuera de la publicación automática. Una rama `bot/news-*` no puede crear `article.url` ni modificar artículos.

## Fuente estructurada única

`js/news-data.js` es la única fuente editorial. Cada entrada contiene tanto el anverso como el reverso de la tarjeta mediante `homeDetails`. El motor `js/news-core.js` solo interpreta estos datos y `js/news.js` se limita a cargarlo.

Una noticia nueva debe incluir:

- `id` único en kebab-case,
- `category.es`, usando `Juegos`, `Lanzamientos`, `Plataformas` o `Industria`,
- `date` y, cuando la hora sea fiable, `publishedAt`,
- `featured: false`,
- `tone`, `title.es`, `summary.es` y `why.es`,
- `homeDetails.es` con exactamente dos párrafos que aporten contexto nuevo,
- `emphasis.es` con dos o tres fragmentos literales del anverso,
- `sources` con URL HTTPS, etiqueta y tipo,
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
3. Añadir una o dos entradas nuevas modificando exclusivamente `js/news-data.js`.
4. Abrir una PR no borrador contra `main`.
5. El workflow de Noticias comprueba fuentes, estructura, fechas, categorías, énfasis, reversos, duplicados y alcance.
6. El workflow actualiza automáticamente las versiones de caché de portada y Noticias.
7. El workflow regenera las noticias relacionadas de las fichas de juego.
8. El workflow guarda únicamente las salidas derivadas autorizadas.
9. Comprueba de nuevo la lista de archivos y el SHA exacto de la cabecera.
10. Fusiona mediante squash y elimina la rama sin depender del Auto-merge nativo de GitHub.

Las ramas automáticas pueden añadir como máximo dos noticias recientes por PR. No pueden eliminar ni reescribir noticias existentes, cambiar la destacada, crear artículos, editar estilos o modificar scripts. Una actualización material de una noticia ya publicada requiere revisión humana.

## Archivos autorizados

El bot modifica inicialmente solo:

- `js/news-data.js`.

El workflow puede derivar y guardar:

- `index.html`,
- `noticias.html`,
- `juegos.html`,
- `juegos/*.html` cuando cambien las noticias relacionadas.

Cualquier otro archivo bloquea la fusión automática.

## Casos que deben bloquearse

No se publica y se solicita revisión cuando:

- las fuentes fiables se contradicen,
- falta una fuente primaria u oficial inequívoca,
- no puede distinguirse entre hecho, información periodística y rumor,
- la novedad pretende reemplazar la destacada,
- requiere actualizar una noticia existente,
- necesita una página individual, un cambio de diseño o un script nuevo,
- el diff contiene archivos no autorizados,
- GitHub no puede validar o fusionar el commit exacto con seguridad.

Si no hay novedades suficientemente importantes, no se modifica el repositorio ni se notifica. Si el proceso termina correctamente, puede permanecer silencioso.
