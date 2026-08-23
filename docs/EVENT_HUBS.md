# Especiales de eventos

Los grandes eventos de videojuegos se cubren mediante páginas vivas generadas desde `data/events/`. La fuente de verdad es un JSON por evento, la salida pública se guarda en `eventos/<id>.html` y el archivo general se genera en `eventos.html`.

## Estados

- `upcoming`: cuenta atrás, emisión oficial y presencias confirmadas antes del evento.
- `live`: cronología de anuncios actualizada durante la emisión.
- `finished`: resumen permanente una vez finalizada la cobertura.

## Reglas editoriales

- Antes de la gala, separar las presencias confirmadas de cualquier predicción. Los rumores no entran en la página.
- Clasificar las presencias con una de estas cuatro etiquetas: `World Premiere` para estrenos o primeros vistazos, `Actualización` para novedades de juegos ya anunciados, `Expansión` para contenido adicional y `Actuación` para intervenciones musicales. El detalle concreto se explica en el resumen, no creando etiquetas nuevas.
- Durante la emisión, cada novedad debe incluir hora, tipo, titular factual, resumen y fuente.
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
