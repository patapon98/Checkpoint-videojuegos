# Especiales de eventos

Los grandes eventos de videojuegos se cubren mediante páginas vivas generadas desde `data/events/`. La fuente de verdad es un JSON por evento, la salida pública se guarda en `eventos/<id>.html` y el archivo general se genera en `eventos.html`.

## Estados

- `upcoming`: cuenta atrás, emisión oficial y presencias confirmadas antes del evento.
- `live`: cronología de anuncios actualizada durante la emisión.
- `finished`: resumen permanente una vez finalizada la cobertura.

## Reglas editoriales

- Antes de la gala, separar las presencias confirmadas de cualquier predicción. Los rumores no entran en la página.
- Clasificar las presencias con estas etiquetas: `World Premiere` cuando se estrena el primer tráiler sustancial de un juego, incluyendo casos que solo contaban con un teaser o una cinemática; `Nuevo tráiler` cuando ya existía un tráiler completo o gameplay previo; `Actualización` cuando la presencia confirmada no implica necesariamente un tráiler; `Expansión` para contenido adicional y `Actuación` para intervenciones musicales. El detalle concreto se explica en el resumen, no creando etiquetas nuevas.
- Durante la emisión, cada novedad debe incluir hora, tipo, titular factual, resumen y fuente.
- Al finalizar la emisión, conservar el archivo completo en `announcements` y sustituir la cronología por dos vistas: una selección de `highlights` ordenada de mayor a menor relevancia y un archivo alfabético buscable con filtros para gala y pre-show. El resumen final no muestra horas.
- Cada elemento del resumen final debe presentar primero su etiqueta, título y descripción, y después su imagen oficial con el tráiler individual de YouTube reproducible dentro de la página. `extraTrailers` permite añadir un segundo vídeo cuando un mismo anuncio agrupa dos novedades estrechamente relacionadas.
- Enlazar una ficha viva o noticia cuando exista y aporte contexto real.
- No crear una noticia independiente para cada tráiler rutinario. La cronología del evento es el lugar natural para los anuncios menores.
- Las fechas de lanzamiento o cambios relevantes también deben trasladarse al calendario, la ficha o la noticia correspondiente.
- Los horarios visibles se expresan únicamente en la hora de España peninsular.
- La navegación principal incluye «Eventos» entre «Juegos» y «Reseñas».

## Flujo

1. Editar `data/events/<id>.json`.
2. Ejecutar `node scripts/render-events.mjs`.
3. Ejecutar `node scripts/validate-events.mjs`.
4. Comprobar que el evento aparece en el archivo general de `/eventos`.
5. Regenerar y validar el sitemap.
6. Revisar la página, el archivo y cualquier presencia temporal en portada tanto en escritorio como en móvil.
