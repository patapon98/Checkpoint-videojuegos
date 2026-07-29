# Final Secreto · Reglas del proyecto

Estas normas forman parte del comportamiento esperado del proyecto. Antes de realizar cualquier cambio, deben leerse junto con `AGENTS.md` y, cuando corresponda, con las guías específicas enlazadas desde ese archivo.

## Flujo de trabajo

- Partir siempre de la versión más reciente de `main`.
- Los asistentes deben trabajar en una rama y abrir una PR. No deben hacer merge salvo autorización excepcional y expresa para esa intervención concreta.
- El usuario puede publicar correcciones pequeñas directamente en `main`; para cambios amplios conviene utilizar una rama y una vista previa.
- Antes de entregar, revisar el diff completo, validar la vista previa y comprobar los flujos automáticos afectados.
- No borrar, sobrescribir ni revertir trabajo ajeno para resolver un conflicto. Hay que identificar primero el estado actual y adaptar el cambio.

## SEO y metadatos

- Cada página pública debe tener un `<title>` y una descripción únicos y coherentes con su contenido.
- La portada puede mantener la marca en el título SEO.
- Las páginas individuales deben usar canonical absoluta y coherente con su URL pública.
- `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card` y `twitter:image` deben describir la página concreta, no la portada genérica.
- Los datos estructurados deben coincidir con lo que ve el usuario. No se deben declarar plataformas, fechas, notas o entidades distintas de las mostradas en el contenido.
- Las páginas que no deban indexarse deben declararlo expresamente; las demás deben conservar `index,follow` y, cuando proceda, `max-image-preview:large`.
- Las URLs públicas nuevas deben incorporarse al sitemap mediante la automatización existente. No mantener un sitemap paralelo manual.

## Artículos de análisis

- La idea central y su relevancia deben entenderse desde el inicio.
- Separar hechos, datos, interpretación editorial y opinión. Las inferencias deben estar apoyadas por evidencia y redactadas como tales.
- Contrastar las cifras con fuentes primarias y revisar varios medios solventes para obtener contexto.
- Cada cifra debe incluir la métrica, unidad, periodo y fecha de corte necesarios para interpretarla.
- Distinguir claramente cifras del periodo, acumuladas, distribuidas o estimadas.
- No comparar magnitudes incompatibles dentro de la misma escala sin explicarlo y sin una representación visual que evite conclusiones engañosas.
- Los títulos y subtítulos deben ser informativos, específicos y coherentes con el contenido de la sección.
- Los enlaces a fuentes deben ser directos, legibles y próximos a la afirmación que respaldan.

## Cifras y unidades

- Usar la misma unidad para magnitudes comparables dentro de una visualización.
- Si una cifra se transforma, redondea o normaliza, explicarlo en la metodología.
- No mezclar porcentajes con valores absolutos dentro de la misma escala.
- Las fechas, monedas y separadores decimales deben seguir la convención española, salvo que reproducir el formato original sea imprescindible para evitar ambigüedad.
- Evitar una precisión aparente mayor que la de la fuente.

## Gráficos e infografías

- Un gráfico debe aportar una relación que sea más clara visualmente que en texto.
- Título, escala, orden, unidades, leyenda, `tooltips` y nota metodológica deben actualizarse juntos cuando cambie la vista o el filtro.
- Los `tooltips` deben mantenerse dentro del viewport, incluidas barras superiores, puntos extremos y tamaños móviles.
- Las interacciones deben funcionar con ratón, teclado y pantalla táctil.
- Las animaciones deben respetar `prefers-reduced-motion`.
- Debe existir una alternativa textual accesible para la información esencial del gráfico.
- Los colores no pueden ser el único recurso para comunicar una diferencia importante.
- No utilizar escalas truncadas o proporciones visuales que exageren cambios sin una indicación clara.

## Imágenes en artículos

- Comprobar la imagen desplegada, no solo el nombre o la URL del recurso.
- Ajustar encuadre, resolución, texto alternativo y procedencia.
- Evitar recortes que oculten el sujeto principal o texto incrustado importante.
- No utilizar una imagen decorativa como evidencia de un dato.
- Las leyendas deben explicar qué se ve y acreditar la fuente cuando sea necesario.
- Revisar el resultado en escritorio y móvil, modo claro y oscuro.

## Noticias

- La categoría, fecha, insignias, titular, resumen y reverso ampliado deben derivarse de los datos compartidos.
- Toda tarjeta con `article.url` debe mostrar «Leer noticia completa» en el anverso y el reverso.
- El enlace debe derivarse de los datos compartidos, nunca de una lista manual de identificadores.
- La insignia «ESENCIAL» debe conservar el mismo diseño en portada y Noticias.
- Las tarjetas nuevas deben heredar las reglas generales sin ajustes ligados a identificadores concretos.
- Al añadir una noticia, comprobar portada, página de Noticias, ticker, enlaces y anclas.

## Reseñas

- Cada reseña debe tener una página individual, una identidad visual específica y una cabecera cinematográfica legible.
- La banda «Hitpoints» debe incluir exactamente, y en este orden: «Fecha de lanzamiento», «Desarrollador», «Plataformas» y «Tiempo de juego».
- Fecha, estudio y plataformas deben contrastarse con fuentes oficiales.
- Usar el tiempo real del autor cuando exista o una estimación externa marcada con «Aprox.» cuando no se conozca.
- Añadir «Lo mejor / Lo peor» inmediatamente antes del desglose de puntuación, con puntos concretos respaldados por el análisis.
- Las imágenes interiores deben poder ampliarse con ratón, teclado y pantalla táctil. El visor debe cerrar mediante botón, clic exterior y Escape.
- Los pies de imagen deben estar centrados.
- Los datos estructurados `VideoGame` deben coincidir con los «Hitpoints».
- Al publicar una reseña, añadirla a los listados correspondientes y comprobar que la automatización actualiza el sitemap.

## Portada

- El menú sticky de portada debe mostrar «Actualidad», «Próximos lanzamientos», «Fichas» y «Últimas reseñas», siguiendo el orden de las secciones y enlazando a sus anclas reales.
- La tarjeta superior de la portada es un bloque editorial de «Novedades», no una reseña fija. Puede destacar una noticia, un artículo o una reseña reciente según su relevancia. Su etiqueta, imagen, título, resumen y enlace deben describir el tipo de contenido seleccionado, y no debe conservar elementos propios de una reseña, como la nota, cuando destaque otra clase de pieza.
- La portada debe incluir un bloque compacto «Juegos en seguimiento» con un máximo de tres fichas vivas seleccionadas editorialmente. La tarjeta superior también puede destacar una ficha cuando haya recibido una actualización relevante; debe identificarse como «Ficha actualizada» y enlazar directamente a ella.
- Cada tarjeta del bloque debe mostrar estado, lanzamiento y fecha real de actualización, y enlazar directamente a la ficha. La implementación debe ser rastreable en HTML, sin carrusel y con una sola columna en móvil. Las reglas completas están en `docs/GAME_HUBS.md`.
- Todo bloque visible nuevo añadido a portada, noticias, calendario, reseñas o páginas especiales debe incorporar desde su primera versión la animación de aparición existente mediante `reveal`, `stagger` o un comportamiento equivalente. Los bloques creados dinámicamente deben registrarse en el observador o ejecutar una transición equivalente después de insertarse. Siempre se debe respetar `prefers-reduced-motion`.

## Accesibilidad e interacción

- Todos los controles interactivos deben tener nombre accesible y estado perceptible.
- Los elementos activables deben mostrar `focus-visible`.
- Los enlaces deben conservar semántica de enlace y los botones, semántica de botón.
- Las imágenes informativas necesitan texto alternativo; las decorativas deben declararse como tales.
- Las interacciones no deben depender únicamente de `hover`.
- Revisar navegación por teclado, Escape, flechas y orden de foco cuando exista un diálogo o carrusel.
- Respetar `prefers-reduced-motion`.

## Validación visual y técnica

- Revisar tanto la portada como las páginas individuales cuando compartan componentes o estilos.
- Comprobar escritorio y móvil, modo claro y oscuro, Chromium y Firefox.
- Revisar desbordamiento horizontal, recortes, saltos de layout, caché, enlaces e imágenes rotas.
- Actualizar los parámetros de versión de CSS o JavaScript cuando sea necesario evitar una copia antigua en caché.
- Si hay automatizaciones asociadas, comprobar sus ejecuciones y logs antes de entregar.
- No considerar terminada una tarea solo porque el archivo fuente sea válido: debe revisarse el resultado desplegado.

## Calendario

- El calendario completo, la selección de portada, la cuenta atrás, las fechas, plataformas, imágenes, etiquetas y tráilers deben derivarse de `data/calendar.json` mediante `scripts/generate-release-calendar.mjs`. No mantener listas paralelas en el HTML o en scripts de corrección por título.
- Cada actualización debe seguir `docs/CALENDAR_UPDATE_CHECKLIST.md`.
- Las fechas deben contrastarse con fuentes oficiales y marcarse como pendientes cuando no estén confirmadas.
- Los filtros, vistas y agrupaciones deben seguir funcionando después de cualquier cambio de datos.
- Revisar portada y calendario completo, incluido móvil, animaciones y caché.

## Automatizaciones de contenido

- La actualización diaria de calendario puede modificar únicamente datos verificables y la representación derivada de esos datos.
- La actualización debe contemplar siempre la fuente central, el calendario completo, la portada y la cuenta atrás cuando corresponda.
- El mantenimiento diario puede mover automáticamente lanzamientos a «Ya disponible», plegar o retirar del render meses antiguos, reordenar fichas y aplicar cambios verificables mediante fuentes oficiales. Los datos históricos permanecen en `data/calendar.json`.
- Las automatizaciones no deben inventar fechas, plataformas, titulares o atribuciones.
- Toda automatización debe poder ejecutarse más de una vez sin producir duplicados ni cambios falsos.
- Si una automatización crea un commit en una rama, ese commit debe quedar dentro de la misma PR.
