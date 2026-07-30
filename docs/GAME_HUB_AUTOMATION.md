# Automatización de fichas de juego

Este sistema mantiene las fichas vivas de `data/game-hubs/` sin convertirlas en textos generados sin control. La vigilancia externa propone únicamente cambios factuales y GitHub publica solo el resultado que supera las validaciones deterministas.

## Arquitectura

1. Una tarea programada consulta cada seis horas la versión más reciente de `main` y lee `data/game-hubs/index.json`.
2. Solo vigila juegos que ya tienen ficha. Las altas de fichas nuevas siguen siendo editoriales y manuales.
3. La tarea contrasta novedades con páginas oficiales de la desarrolladora, editora o plataforma y con canales oficiales de YouTube.
4. Cuando existe un cambio inequívoco, crea una rama `bot/game-hubs-*`, modifica únicamente los JSON afectados y abre una PR no borrador.
5. `.github/workflows/validate-game-hubs.yml` localiza esas PR, verifica su procedencia y limita los archivos antes de descargar la rama.
6. `scripts/validate-game-hub-change.mjs` compara el cambio con `origin/main`, valida fuentes, campos autorizados, duplicados y límites editoriales.
7. GitHub regenera las páginas mediante `scripts/render-game-hubs.mjs`, ejecuta `scripts/validate-game-hubs.mjs`, guarda el HTML resultante y fusiona la PR solo si la cabecera remota coincide exactamente con el commit validado.
8. Cloudflare despliega el nuevo `main` mediante la integración existente.

El sondeo de GitHub se ejecuta cada diez minutos porque los eventos creados por automatizaciones pueden no iniciar otro workflow de PR. `workflow_dispatch` permite procesar la rama desde el workflow confiable almacenado en `main`.

## Cambios autorizados

La automatización puede modificar:

- estado, fecha de lanzamiento y plataformas;
- precio, enlace de tienda y tráiler principal;
- hechos confirmados y cuestiones pendientes;
- galería, con un máximo de tres imágenes oficiales nuevas por ejecución;
- multimedia, con un máximo de tres vídeos oficiales nuevos por ejecución;
- fuentes, historial de cambios y `updatedAt`.

No puede modificar automáticamente:

- título, subtítulo, identidad del juego, desarrolladora, editora o género;
- premisa, contexto, resumen editorial o bloque destacado;
- SEO, tema visual, imagen de cabecera, relaciones internas o términos de noticias;
- el registro `data/game-hubs/index.json`;
- scripts, estilos, noticias, reseñas, calendario, portada o sitemap.

La imagen principal queda fuera porque su sustitución requiere valorar composición, recorte y legibilidad. Las imágenes automáticas se incorporan únicamente a la galería.

## Procedencia obligatoria

Cada actualización automática añade exactamente una entrada nueva al principio de `changes`. Esa entrada debe incluir:

```json
{
  "date": "2026-07-31",
  "title": "Publicado un nuevo tráiler de la campaña",
  "description": "La editora mostró una nueva zona y confirmó el modo cooperativo.",
  "sourceUrls": [
    "https://dominio-oficial.example/noticia"
  ]
}
```

`sourceUrls` admite entre una y cuatro URLs HTTPS. El dominio debe coincidir con una fuente oficial ya verificada en la ficha o ser un subdominio relacionado. YouTube se admite solo cuando la vigilancia ha comprobado que el vídeo pertenece al canal oficial correspondiente.

No se admiten como fuente primaria Reddit, RAWG, X, filtraciones, agregadores ni medios. Tampoco se permiten miniaturas de YouTube, imágenes de RAWG, previews comprimidas o alojamientos visuales nuevos que no puedan relacionarse con los ya verificados.

## Reglas incrementales

- No se eliminan ni reescriben imágenes, vídeos, fuentes, hechos confirmados o entradas históricas anteriores.
- Una ejecución puede afectar como máximo a tres fichas.
- No se abre una PR para cambiar solo `updatedAt` y el historial.
- Los vídeos necesitan ID de YouTube, título, etiqueta y fecha de publicación.
- Las imágenes necesitan URL HTTPS y texto alternativo descriptivo.
- Las plataformas, imágenes, vídeos y fuentes no pueden contener duplicados.
- `updatedAt` y la nueva entrada de `changes` deben usar la fecha civil vigente en `Europe/Madrid`.
- Las contradicciones, cancelaciones, cambios de identidad, sustituciones de cabecera y fuentes nuevas ambiguas se bloquean para revisión manual.

## Modelo de seguridad

Las ramas automáticas solo pueden proceder del propio repositorio, apuntar a `main`, estar abiertas y no ser borrador. Antes y después de generar el HTML se comprueba el alcance de archivos. La fusión utiliza `--match-head-commit`, por lo que cualquier modificación concurrente invalida el resultado.

Las PR manuales conservan el flujo normal. Deben incluir el HTML ya generado y no se fusionan automáticamente.

## Recuperación

Si una PR automática falla:

1. no se fusiona ni se publica;
2. el log indica el campo, fuente o archivo bloqueado;
3. puede corregirse manteniendo la misma rama si el cambio sigue siendo inequívoco;
4. si requiere criterio editorial, se cierra la PR automática y se prepara una rama manual.

El proceso es idempotente. Cuando no existe una novedad oficial fiable, la tarea no modifica el repositorio ni abre una PR.
