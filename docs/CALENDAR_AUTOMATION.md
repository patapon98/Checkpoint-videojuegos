# Automatización del calendario de lanzamientos

El calendario utiliza `data/calendar.json` como única fuente de datos. `calendario.html` y la selección de lanzamientos de `index.html` son salidas generadas y no deben editarse manualmente para cambiar títulos, fechas, plataformas, imágenes, etiquetas o tráilers.

La referencia temporal del calendario es siempre **España peninsular**, mediante la zona IANA `Europe/Madrid`. La ubicación actual del usuario, la zona UTC del servidor y los cambios entre horario de invierno y verano no alteran cuándo un lanzamiento pasa a «Sale hoy» o «Ya disponible».

## Componentes

- `data/calendar.json` contiene todos los lanzamientos y su procedencia.
- `scripts/generate-release-calendar.mjs` genera el calendario completo, el calendario de portada, los estados temporales y la cuenta atrás.
- `js/calendar-today.js` mantiene el estado del día sincronizado en el navegador mediante `Europe/Madrid`, incluso si la página permanece abierta durante el cambio de fecha.
- `css/calendar-today.css` contiene el tratamiento visual de «Sale hoy» y respeta `prefers-reduced-motion`.
- `scripts/update-release-calendar.mjs` revisa únicamente las fuentes que autorizan expresamente una actualización automática.
- `scripts/validate-release-calendar.mjs` ejecuta los controles deterministas de la checklist.
- `scripts/validate-calendar-change.mjs` compara los cambios editoriales con `main` y valida fuentes, evidencia, imágenes y alcance.
- `.github/workflows/update-release-calendar.yml` ejecuta el mantenimiento diario y publica en `main` cuando existe un cambio real.
- `.github/workflows/validate-release-calendar.yml` genera y valida las ramas editoriales automáticas.
- `.github/workflows/auto-merge-release-calendar.yml` fusiona las ramas `bot/calendar-*` cuando el commit validado sigue siendo la cabecera de la PR y solo se han modificado los archivos autorizados.

## Mantenimiento diario de GitHub

GitHub Actions ejecuta una revisión diaria con `TZ=Europe/Madrid`. El proceso:

1. Descarga la última versión de `main`.
2. Comprueba la sintaxis de los scripts.
3. Revisa únicamente las fuentes oficiales configuradas para actualización automática.
4. No usa Steam para corregir fechas.
5. Solo sustituye una imagen mediante Steam cuando la entrada declara `source.autoImageUpdate: true` y el nombre coincide exactamente.
6. Solo cambia una fecha cuando la entrada declara `source.autoDateUpdate: true` y una página oficial ofrece una única fecha estructurada e inequívoca.
7. Recalcula el estado temporal del calendario con la fecha civil de España peninsular.
8. Mantiene como «Sale hoy» los lanzamientos cuya fecha coincide con el día actual.
9. A partir del día siguiente los marca como «Ya disponible».
10. Divide el mes actual entre lanzamientos ya disponibles y lanzamientos activos o próximos cuando sea necesario.
11. Mantiene un margen de archivo visible y conserva el resto de meses en el JSON.
12. Regenera la portada y la cuenta atrás desde los mismos datos.
13. Ejecuta la checklist automática.
14. Publica en `main` únicamente si el diff se limita a `data/calendar.json`, `calendario.html` e `index.html`.

Si no cambia ningún dato ni estado temporal, el workflow termina sin crear un commit. El script del navegador comprueba la fecha de Madrid cada minuto y al recuperar el foco. De este modo, el estado visible cambia correctamente aunque el workflow diario todavía no se haya ejecutado.

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
- `date` en formato `AAAA-MM-DD`, interpretada como fecha civil de España peninsular.
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
- mostrar «Sale hoy» durante toda la fecha civil de España peninsular,
- mover automáticamente el lanzamiento a «Ya disponible» al día siguiente,
- recuperar una entrada si cambia su fecha,
- impedir que una automatización borre información histórica por error.

Las cancelaciones no se eliminan automáticamente. Requieren una revisión editorial explícita y una fuente oficial.

## Imágenes y rendimiento

Algunas entradas anteriores a esta automatización conservan imágenes de RAWG u otras fuentes. Están marcadas como `legacy: true` y generan advertencias, no fallos, para permitir una migración progresiva.

No se sustituyen en bloque. Cada migración automática debe autorizarse por entrada mediante `source.autoImageUpdate: true`. Las entradas nuevas no pueden utilizar RAWG, miniaturas de YouTube ni otros agregadores.

Cuando una imagen alojada en Azure Blob resulta especialmente pesada o lenta y la entrada dispone de una ficha inequívoca de Steam, el generador puede servir la cabecera equivalente desde el CDN de Steam sin modificar la fecha ni la fuente editorial del lanzamiento. Esta optimización se deriva del dominio y del identificador de la tienda, no de una excepción ligada al nombre de un juego concreto.

## Recuperación ante fallos

- Si falla una fuente concreta, el workflow conserva los datos anteriores y continúa con las demás fichas.
- Si la checklist falla, no se publica ningún cambio.
- Si aparecen archivos fuera del alcance permitido, el workflow se detiene.
- Si una rama automática avanza después de una validación, el workflow de fusión espera la validación del nuevo commit.
- Todos los cambios quedan registrados en Git y pueden revertirse mediante el commit correspondiente.

## Cambios de arquitectura

La automatización solo mantiene contenido. Cualquier cambio en diseño, estilos, estructura, filtros, animaciones o scripts debe seguir el flujo manual habitual de rama, PR, vista previa y decisión del usuario.
