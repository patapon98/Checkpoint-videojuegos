# Fichas vivas de juegos

Estas reglas se aplican a todas las páginas situadas en `juegos/` y a sus archivos de datos en `data/game-hubs/`.

## Qué significa «haz la ficha de X juego»

Cuando el usuario pida crear la ficha de un juego, el asistente debe interpretar la petición como el flujo completo descrito en este documento. No debe limitarse a crear una página aislada ni volver a preguntar por decisiones técnicas ya documentadas.

El resultado debe incluir:

1. investigación y contraste de los datos;
2. archivo JSON completo;
3. registro de la ficha en el índice central;
4. página HTML con contenido inicial indexable;
5. metadatos y datos estructurados;
6. galería, vídeos, fuentes e historial de cambios;
7. enlaces a otras fichas relacionadas;
8. integración en calendario, noticias o portada cuando corresponda;
9. validación automática y revisión visual;
10. rama, vista previa y PR según `COMO-PUBLICAR.md`.

## Fuente única y archivos implicados

- Copia `data/game-hubs/_template.json` como `data/game-hubs/<slug>.json` y completa todos sus campos.
- Añade la ficha a `data/game-hubs/index.json`. Este archivo relaciona la ficha con calendario y noticias.
- Crea `juegos/<slug>.html` reutilizando la estructura de una ficha existente, sin conservar textos, enlaces, imágenes ni metadatos del juego usado como base.
- Si la ficha merece visibilidad editorial, actualiza el bloque «Juegos en seguimiento» de `index.html`. La portada no es un listado automático de todas las fichas.
- Ejecuta `node scripts/validate-game-hubs.mjs` antes de entregar. La misma comprobación se ejecuta en GitHub Actions.

El JSON es la referencia editorial. El HTML inicial debe reflejarlo literalmente en los campos críticos que valida el script. Si cambia la información, se actualizan ambos en el mismo commit.

## Investigación y redacción

- Contrasta fecha, plataformas, desarrolladora, editora, reservas, tráileres y características con fuentes primarias: web oficial, editora, desarrolladora, tienda oficial o comunicado corporativo.
- Utiliza medios secundarios únicamente para contexto o para localizar una fuente primaria. No conviertas rumores en datos confirmados.
- Separa con claridad `confirmed` y `pending`.
- `premise` debe explicar el juego; `context` debe explicar por qué importa. Ambos textos deben ser originales de Final Secreto.
- No repitas en `confirmed` la fecha, plataformas, desarrolladora o editora cuando esos datos ya aparecen en el resumen y los datos rápidos. Reserva esa lista para características, sistemas y contenido que aporten información nueva.
- Utiliza `spotlight` para el tema que mejor define al juego, como estructura jugable, combate, plantel o modos. Mantén el mismo bloque visual entre fichas aunque cambie su enfoque editorial.
- Si el precio es solo un dato de compra, guárdalo en el campo opcional `price` y muéstralo de forma sintética en «Datos del juego». Resérvalo para `spotlight` únicamente cuando exista una discusión editorial relevante sobre su política de precios, como ocurre en GTA VI.
- `updatedAt` solo cambia cuando la ficha recibe una modificación editorial real.
- Cada modificación real añade una entrada a `changes` con fecha, título breve y descripción concreta. El historial registra cambios de la ficha, no inventa acontecimientos del juego.
- `newsTerms` debe contener únicamente términos suficientemente específicos para evitar noticias no relacionadas.

## HTML inicial y SEO

El contenido principal no puede depender exclusivamente de JavaScript. Al abrir el código fuente deben existir ya:

- premisa y contexto;
- fecha, género, plataformas y desarrolladora;
- listas de confirmado y pendiente;
- historial de cambios;
- fuentes visibles;
- datos rápidos laterales;
- enlaces a fichas relacionadas.

JavaScript puede volver a sincronizar estos bloques desde el JSON y aportar cuenta atrás, carrusel, visor o noticias dinámicas, pero no debe ser la única capa que entregue el texto esencial.

Cada ficha debe incluir:

- `title`, descripción y descripción social únicas en `seo`;
- canonical absoluta y `robots` indexable;
- `og:image` y `twitter:image` coherentes con `heroImage`;
- encabezados descriptivos que incluyan el nombre del juego donde resulte natural;
- JSON-LD con un grafo `WebPage`, `VideoGame` y `BreadcrumbList`;
- `dateModified` sincronizado con `updatedAt`;
- descripción, plataformas, género, creadora, editora, imagen, fecha y vídeos coherentes con el JSON;
- `article:modified_time` sincronizado con `updatedAt`.

No se debe repetir el nombre del juego de forma mecánica en todos los párrafos. Los encabezados específicos sirven para aclarar el contenido, no para rellenar palabras clave.

## Cabecera

- La cabecera debe utilizar el arte promocional principal del juego o un fondo promocional equivalente.
- La imagen debe estar limpia. No puede llevar el logotipo del juego, el título, fechas, llamadas a la acción, clasificación por edades, marcas de agua, interfaz ni otros textos incrustados.
- El título y los metadatos pertenecen al HTML de Final Secreto y nunca deben formar parte de la imagen.
- La cabecera es un recurso independiente de la galería. No se reutiliza automáticamente la primera captura como fondo.
- En el JSON debe declararse `heroImageKind: "promotional-key-art"` cuando sea arte promocional y `heroImageKind: "official-screenshot"` cuando sea una captura oficial elegida por su composición; en ambos casos, `heroImageHasEmbeddedText` debe ser `false`.
- `seo.heroImageAlt` debe describir la escena y no asumir que todo recurso es arte promocional.
- Antes de publicar, hay que comprobar visualmente el recurso desplegado en escritorio y móvil. No basta con revisar la URL o el nombre del archivo.
- Deben ajustarse `background-position` y el degradado cuando la composición lo requiera, sin ocultar al personaje o elemento principal.
- Cada ficha define `theme.accent` y `theme.accentSoft` a partir del color principal asociado al juego. Estos colores sustituyen el acento genérico en botones, enlaces, etiquetas y bloques editoriales, también en modo oscuro.

## Galería y vídeos

- La galería debe reunir imágenes distintas, nítidas y representativas. No se permiten duplicados ni variantes prácticamente idénticas.
- No existe un límite fijo de cuatro imágenes. Incluye las capturas oficiales que aporten variedad real, sin alargar la galería con relleno.
- Comprueba las dimensiones efectivas que recibe el navegador. Para cabeceras y capturas horizontales se recomienda un mínimo real de 1600 píxeles de ancho; no basta con que la URL contenga una etiqueta de alta resolución.
- Las capturas deben mostrarse completas, sin deformaciones ni recortes accidentales, y poder ampliarse.
- Los valores de las tarjetas de `spotlight` deben adaptarse al ancho disponible: usa una cuadrícula flexible, tipografía fluida y corte seguro de palabras largas. Comprueba especialmente zoom de navegador, escritorio estrecho y móvil.
- El visor ampliado debe centrar la imagen horizontal y verticalmente en el viewport. Debe funcionar con ratón, teclado y pantalla táctil, y cerrarse mediante botón, clic exterior y Escape.
- No se permiten pantallas negras, fotogramas de transición, imágenes rotas ni recursos promocionales de calidad inferior cuando existen capturas adecuadas.
- Utiliza capturas publicadas por la desarrolladora, la editora o una tienda oficial. RAWG no debe emplearse como fuente ni aparecer en el texto visible de la ficha.
- Conserva la URL de procedencia en `sources` y comprueba que el CDN entrega el archivo original, no una miniatura ampliada.
- Cuando una ficha antigua se actualice, migra también su galería y sus bloques editoriales al estándar vigente; no mantengas excepciones heredadas por haber sido creada antes.
- Las imágenes promocionales con texto pueden utilizarse excepcionalmente dentro de la galería si aportan información real, pero nunca como cabecera.
- Cada vídeo necesita título, etiqueta, fecha de publicación e identificador correctos.
- Los vídeos se presentan mediante el slider común de multimedia. Muestra un vídeo por pasada, conserva navegación por arrastre y sitúa flechas y puntos abajo a la derecha. Cuando solo existe un vídeo, no debe mostrar controles inútiles.
- Los controles de galería y multimedia deben quedar posicionados dentro de su propio contenedor. Nunca pueden aparecer sobre la cabecera ni sobre otra sección.
- No se aceptan marcos, lienzos o bandas blancas incorporadas en la propia imagen. Para automatizar la selección, inspecciona el 4 % exterior de los cuatro lados y descarta el recurso cuando una zona casi blanca o uniforme ocupe la mayor parte del perímetro sin formar parte de la escena. Si un CDN añade relleno al solicitar más tamaño que el nativo, pide la resolución nativa en lugar de ampliar el lienzo.
- Los contenedores de galería y tarjetas usan un fondo oscuro neutro como protección, pero no deben utilizarse para ocultar una mala elección de imagen. La solución prioritaria es seleccionar una alternativa limpia y a sangre.

## Fichas relacionadas

- Cada ficha debe terminar con el bloque «Más juegos en seguimiento».
- `relatedGameIds` define una selección editorial de una o más fichas existentes. No puede incluir la propia ficha, duplicados ni identificadores inexistentes.
- Prioriza relaciones útiles: género, estudio, saga, proximidad de lanzamiento o interés editorial. No elijas enlaces solo para completar el espacio.
- Los enlaces deben existir en el HTML inicial y mostrar título, estado y fecha de lanzamiento.

## Visibilidad en portada

- La portada muestra en un slider hasta las nueve fichas actualizadas más recientemente. Mientras existan menos de nueve, se muestran todas las disponibles sin inventar tarjetas ni fichas.
- El menú sticky de la portada debe incluir «Fichas» y enlazar a `#juegos-seguimiento`.
- Cada tarjeta debe enlazar directamente a la ficha y mostrar su estado, fecha de lanzamiento y fecha real de última actualización.
- La tarjeta editorial superior puede destacar una ficha cuando haya una novedad sustancial, como una fecha, un tráiler importante, reservas o nueva información confirmada. Debe identificarse como «Ficha actualizada».
- No se debe modificar `updatedAt` ni presentar una ficha como actualizada si su contenido no ha cambiado de forma real.
- El bloque debe conservar enlaces rastreables en el HTML inicial, permitir desplazamiento horizontal aunque falle JavaScript y mostrar una pista visual de la siguiente tarjeta en móvil.
- El slider reutiliza el comportamiento de las noticias recientes: tres fichas por pasada en escritorio, dos en tableta y una con pista visual en móvil. Flechas y puntos se colocan debajo, alineados a la derecha.
- Debe existir separación visual suficiente entre este bloque y el encabezado de «Análisis».

## Validación obligatoria

Ejecuta:

```bash
node scripts/validate-game-hubs.mjs
```

La validación comprueba, entre otras cosas:

- correspondencia entre índice, JSON y HTML;
- campos obligatorios, fechas y relaciones;
- ausencia de duplicados en la galería;
- presencia y sincronización del bloque editorial `spotlight`;
- uso exclusivo de fuentes oficiales para las imágenes;
- contenido SEO crítico presente en el HTML inicial;
- historial y enlaces relacionados sincronizados;
- metadatos y datos estructurados coherentes.

Después revisa la vista previa en escritorio y móvil, modo claro y oscuro. Comprueba la cabecera, el menú sticky, la cuenta atrás, vídeos, carrusel, visor centrado, fuentes, enlaces internos y ausencia de desbordamiento horizontal.
