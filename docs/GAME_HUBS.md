# Fichas vivas de juegos

Estas reglas se aplican a todas las páginas situadas en `juegos/` y a sus archivos de datos en `data/game-hubs/`.

## Cabecera

- La cabecera debe utilizar el arte promocional principal del juego o un fondo promocional equivalente.
- La imagen debe estar limpia. No puede llevar el logotipo del juego, el título, fechas, llamadas a la acción, clasificación por edades, marcas de agua, interfaz ni otros textos incrustados.
- El título y los metadatos pertenecen al HTML de Final Secreto y nunca deben formar parte de la imagen.
- La cabecera es un recurso independiente de la galería. No se reutiliza automáticamente la primera captura como fondo.
- En el JSON de cada ficha deben declararse `heroImageKind: "promotional-key-art"` y `heroImageHasEmbeddedText: false`.
- Antes de publicar, hay que comprobar visualmente el recurso desplegado en escritorio y móvil. No basta con revisar la URL o el nombre del archivo.
- Deben ajustarse `background-position` y el degradado cuando la composición lo requiera, sin ocultar al personaje o elemento principal.

## Galería

- La galería debe reunir imágenes distintas, nítidas y representativas. No se permiten duplicados ni variantes prácticamente idénticas.
- Las capturas deben mostrarse completas, sin deformaciones ni recortes accidentales, y poder ampliarse.
- No se permiten pantallas negras, fotogramas de transición, imágenes rotas ni recursos promocionales de calidad inferior cuando existen capturas del juego adecuadas.
- Si RAWG reúne una galería completa y funcional, se puede utilizar directamente sin mezclarla con fotogramas de tráiler.
- Si se utilizan imágenes de RAWG, la ficha debe incluir una atribución visible y enlazada a RAWG.
- Cuando se combinen recursos oficiales y RAWG, el crédito debe indicar con precisión ambas procedencias.
- Las imágenes promocionales con texto pueden utilizarse excepcionalmente dentro de la galería si aportan información real, pero nunca como cabecera.

## Metadatos

- `og:image`, `twitter:image`, los datos estructurados y la imagen inicial escrita en el HTML deben utilizar el mismo arte promocional limpio declarado en `heroImage`.
- El texto alternativo de la cabecera debe identificarla como arte promocional del juego, no como una captura si no lo es.
- Toda modificación de la cabecera debe actualizar simultáneamente el JSON, el HTML y los metadatos sociales.
