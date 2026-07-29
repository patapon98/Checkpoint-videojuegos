# Automatización del calendario de lanzamientos

El calendario utiliza `data/calendar.json` como única fuente de datos. `calendario.html` y la selección de lanzamientos de `index.html` son salidas generadas y no deben editarse manualmente para cambiar títulos, fechas, plataformas, imágenes, etiquetas o tráilers.

## Componentes

- `data/calendar.json` contiene todos los lanzamientos y su procedencia.
- `scripts/generate-release-calendar.mjs` genera el calendario completo, el calendario de portada y la cuenta atrás.
- `scripts/update-release-calendar.mjs` revisa fichas oficiales compatibles y aplica cambios inequívocos de fecha o imagen.
- `scripts/validate-release-calendar.mjs` ejecuta los controles deterministas de la checklist.
- `scripts/validate-calendar-change.mjs` compara los cambios editoriales con `main` y valida fuentes, evidencia, imágenes y alcance.
- `.github/workflows/update-release-calendar.yml` ejecuta el mantenimiento diario y publica en `main` cuando existe un cambio real.
- `.github/workflows/validate-release-calendar.yml` genera y valida las ramas editoriales automáticas.
- `.github/workflows/auto-merge-release-calendar.yml` fusiona las ramas `bot/calendar-*` cuando el commit validado sigue siendo la cabecera de la PR y solo se han modificado los archivos autorizados.

## Mantenimiento diario de GitHub

GitHub Actions ejecuta una revisión diaria. El proceso:

1. Descarga la última versión de `main`.
2. Comprueba la sintaxis de los scripts.
3. Consulta fichas oficiales y APIs compatibles.
4. Actualiza solo fechas o imágenes que puedan verificarse sin ambigüedad.
5. Recalcula el estado temporal del calendario.
6. Marca como «Ya disponible» los lanzamientos cuya fecha ya ha pasado.
7. Divide el mes actual entre lanzamientos pasados y próximos cuando sea necesario.
8. Mantiene un margen de archivo visible y conserva el resto de meses en el JSON.
9. Regenera la portada y la cuenta atrás desde los mismos datos.
10. Ejecuta la checklist automática.
11. Publica en `main` únicamente si el diff se limita a `data/calendar.json`, `calendario.html` e `index.html`.

Si no cambia ningún dato ni estado temporal, el workflow termina sin crear un commit.

## Descubrimiento editorial

No existe una fuente oficial única que reúna todos los lanzamientos relevantes de PlayStation, Xbox, Nintendo, Steam y otras editoras. La búsqueda de altas nuevas y anuncios se mantiene separada del mantenimiento determinista.

La tarea programada de vigilancia:

1. Revisa anuncios oficiales y contrasta la relevancia editorial.
2. Consulta primero `main` y `data/calendar.json` para evitar duplicados.
3. Descarta rumores, ventanas aproximadas, títulos sin fecha exacta y lanzamientos demasiado pequeños para el enfoque de Final Secreto.
4. Crea o actualiza una rama `bot/calendar-*`.
5. Modifica únicamente `data/calendar.json`.
6. Abre una PR. GitHub genera las páginas y ejecuta las validaciones.
7. La PR se fusiona automáticamente cuando el workflow termina correctamente.

La vigilancia no puede editar scripts, estilos, noticias, reseñas ni otros documentos. Cualquier intento queda bloqueado por el workflow de alcance.

## Campos obligatorios para una entrada nueva

Una entrada editorial automática debe incluir al menos:

- `id` estable y único.
- `title` y `headingHtml`.
- `date` en formato `AAAA-MM-DD`.
- `platformKeys` y `platformsHtml`.
- Imagen oficial HTTPS con texto alternativo.
- Ficha oficial o enlace de tienda.
- Tráiler oficial cuando exista.
- Prioridad y etiqueta editorial coherentes.
- `legacy: false`.
- `source.official: true`.
- `source.url` y `source.checkedAt`.
- `source.evidence.title`.
- `source.evidence.releaseDate`.
- `source.evidence.platforms`.

La evidencia estructurada no sustituye la URL oficial. Sirve para que el workflow pueda detectar contradicciones internas antes de fusionar.

## Archivo y estados

Las entradas no se eliminan del JSON cuando pasa su fecha. El generador decide qué meses siguen visibles mediante `settings.archiveMonths`. Esto permite:

- mantener un historial reutilizable,
- evitar que el HTML crezca indefinidamente,
- mover automáticamente lanzamientos entre estados,
- recuperar una entrada si cambia su fecha,
- impedir que una automatización borre información histórica por error.

Las cancelaciones no se eliminan automáticamente. Requieren una revisión editorial explícita y una fuente oficial.

## Imágenes heredadas

Algunas entradas anteriores a esta automatización conservan imágenes de RAWG u otras fuentes. Están marcadas como `legacy: true` y generan advertencias, no fallos, para permitir una migración progresiva. Cuando una ficha oficial compatible ofrece una imagen estable, el mantenimiento diario sustituye la imagen heredada.

Las entradas nuevas no pueden utilizar RAWG, miniaturas de YouTube ni otros agregadores.

## Recuperación ante fallos

- Si falla una fuente concreta, el workflow conserva los datos anteriores y continúa con las demás fichas.
- Si la checklist falla, no se publica ningún cambio.
- Si aparecen archivos fuera del alcance permitido, el workflow se detiene.
- Si una rama automática avanza después de una validación, el workflow de fusión espera la validación del nuevo commit.
- Todos los cambios quedan registrados en Git y pueden revertirse mediante el commit correspondiente.

## Cambios de arquitectura

La automatización solo mantiene contenido. Cualquier cambio en diseño, estilos, estructura, filtros, animaciones o scripts debe seguir el flujo manual habitual de rama, PR, vista previa y decisión del usuario.
