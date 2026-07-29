# Automatización del calendario de lanzamientos

El calendario utiliza `data/calendar.json` como única fuente de datos. `calendario.html` y la selección de lanzamientos de `index.html` son salidas generadas y no deben editarse manualmente para cambiar títulos, fechas, plataformas, imágenes, etiquetas o tráilers.

La referencia temporal del calendario es siempre **España peninsular**, mediante la zona IANA `Europe/Madrid`. La ubicación actual del usuario, la zona UTC del servidor y los cambios entre horario de invierno y verano no alteran cuándo un lanzamiento pasa a «Sale hoy» o «Ya disponible».

## Componentes

- `data/calendar.json` contiene todos los lanzamientos y su procedencia.
- `scripts/generate-release-calendar.mjs` genera el calendario completo, el calendario de portada, los estados temporales, la atribución de imágenes y la cuenta atrás.
- `js/calendar-today.js` mantiene el estado del día sincronizado en el navegador mediante `Europe/Madrid`, incluso si la página permanece abierta durante el cambio de fecha.
- `css/calendar-today.css` contiene el tratamiento visual de «Sale hoy», la atribución de fuentes visuales y el soporte de `prefers-reduced-motion`.
- `scripts/rawg-images.mjs` selecciona una ficha inequívoca de RAWG y normaliza sus metadatos.
- `scripts/resolve-rawg-calendar-images.mjs` obtiene las imágenes solicitadas usando el secreto `RAWG_API_KEY`.
- `scripts/update-release-calendar.mjs` revisa únicamente las fuentes que autorizan expresamente una actualización automática.
- `scripts/validate-release-calendar.mjs` ejecuta los controles deterministas de la checklist.
- `scripts/validate-calendar-today.mjs` simula una fecha real del calendario y comprueba que la ficha permanece activa, muestra «Sale hoy» y conserva el mismo estado en la portada cuando corresponde.
- `scripts/validate-rawg-images.mjs` prueba la selección de RAWG con datos simulados, sin usar una clave real ni depender de la red.
- `scripts/validate-calendar-change.mjs` compara los cambios editoriales con `main` y valida fuentes, evidencia, imágenes y alcance.
- `.github/workflows/update-release-calendar.yml` ejecuta el mantenimiento diario y publica en `main` cuando existe un cambio real.
- `.github/workflows/validate-release-calendar.yml` genera y valida las ramas editoriales automáticas.
- `.github/workflows/auto-merge-release-calendar.yml` fusiona las ramas `bot/calendar-*` cuando el commit validado sigue siendo la cabecera de la PR y solo se han modificado los archivos autorizados.

## Mantenimiento diario de GitHub

GitHub Actions ejecuta una revisión diaria con `TZ=Europe/Madrid`. El proceso:

1. Descarga la última versión de `main`.
2. Comprueba la sintaxis de los scripts.
3. Resuelve las imágenes marcadas con `image.provider: "rawg"` mediante el secreto del repositorio.
4. Revisa únicamente las fuentes oficiales configuradas para actualización automática.
5. No usa Steam ni RAWG para corregir fechas.
6. Solo sustituye una imagen mediante Steam cuando la entrada declara `source.autoImageUpdate: true` y el nombre coincide exactamente.
7. Solo cambia una fecha cuando la entrada declara `source.autoDateUpdate: true` y una página oficial ofrece una única fecha estructurada e inequívoca.
8. Recalcula el estado temporal del calendario con la fecha civil de España peninsular.
9. Mantiene como «Sale hoy» los lanzamientos cuya fecha coincide con el día actual.
10. A partir del día siguiente los marca como «Ya disponible».
11. Divide el mes actual entre lanzamientos ya disponibles y lanzamientos activos o próximos cuando sea necesario.
12. Mantiene un margen de archivo visible y conserva el resto de meses en el JSON.
13. Regenera la portada y la cuenta atrás desde los mismos datos.
14. Ejecuta la checklist automática.
15. Publica en `main` únicamente si el diff se limita a `data/calendar.json`, `calendario.html` e `index.html`.

Si no cambia ningún dato ni estado temporal, el workflow termina sin crear un commit. El script del navegador comprueba la fecha de Madrid cada minuto y al recuperar el foco. De este modo, el estado visible cambia correctamente aunque el workflow diario todavía no se haya ejecutado.

## Imágenes mediante RAWG

La clave nunca se escribe en HTML, JavaScript público, documentación ni `data/calendar.json`. Debe guardarse en GitHub como secreto del repositorio con el nombre exacto `RAWG_API_KEY`.

Las entradas nuevas que quieran utilizar RAWG declaran inicialmente:

```json
"image": {
  "provider": "rawg",
  "query": "Título exacto del juego",
  "src": "",
  "alt": "Título exacto del juego",
  "className": "",
  "gridArt": "",
  "poster": "",
  "legacy": false
}
```

El workflow busca exclusivamente coincidencias exactas. Si hay varias, prioriza la misma fecha y las plataformas compatibles. Cuando la selección siga siendo ambigua, la PR se bloquea y debe añadirse `image.rawgId` manualmente. Tras resolverla, el JSON conserva `rawgId`, `rawgSlug`, `rawgPage` y la URL pública de la imagen.

RAWG se utiliza solo como proveedor visual. El título, la fecha, las plataformas y cualquier otro dato editorial deben seguir verificándose en una fuente oficial. Las páginas que muestran una imagen alojada por RAWG incluyen automáticamente un enlace de atribución conforme a sus condiciones de uso.

## Descubrimiento editorial

No existe una fuente oficial única que reúna todos los lanzamientos relevantes de PlayStation, Xbox, Nintendo, Steam y otras editoras. La búsqueda de altas nuevas y anuncios se mantiene separada del mantenimiento determinista.

La tarea programada de vigilancia:

1. Revisa anuncios oficiales y contrasta la relevancia editorial.
2. Consulta primero `main` y `data/calendar.json` para evitar duplicados.
3. Descarta rumores, ventanas aproximadas, títulos sin fecha exacta y lanzamientos demasiado pequeños para el enfoque de Final Secreto.
4. Crea o actualiza una rama `bot/calendar-*`.
5. Modifica únicamente `data/calendar.json`.
6. Abre una PR. GitHub resuelve las imágenes solicitadas, genera las páginas y ejecuta las validaciones.
7. La PR se fusiona automáticamente cuando el workflow termina correctamente.

La vigilancia no puede editar scripts, estilos, noticias, reseñas ni otros documentos. Cualquier intento queda bloqueado por el workflow de alcance.

## Campos obligatorios para una entrada nueva

Una entrada editorial automática debe incluir al menos:

- `id` estable y único.
- `title` y `headingHtml`.
- `date` en formato `AAAA-MM-DD`, interpretada como fecha civil de España peninsular.
- `platformKeys` y `platformsHtml`.
- Imagen HTTPS o una solicitud RAWG con `image.provider: "rawg"`.
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

## Imágenes heredadas y rendimiento

Algunas entradas anteriores a esta automatización conservan imágenes antiguas de RAWG u otras fuentes. Están marcadas como `legacy: true` y generan advertencias, no fallos, para permitir una migración progresiva.

No se sustituyen en bloque. Cada migración debe conservar una correspondencia inequívoca con el juego y la atribución requerida. Las entradas nuevas no pueden utilizar miniaturas de YouTube ni agregadores distintos de RAWG.

Cuando una imagen alojada en Azure Blob resulta especialmente pesada o lenta y la entrada dispone de una ficha inequívoca de Steam, el generador puede servir la cabecera equivalente desde el CDN de Steam sin modificar la fecha ni la fuente editorial del lanzamiento. Esta optimización se deriva del dominio y del identificador de la tienda, no de una excepción ligada al nombre de un juego concreto.

## Recuperación ante fallos

- Si falla una fuente concreta, el workflow conserva los datos anteriores y continúa con las demás fichas.
- Si RAWG no encuentra una coincidencia exacta o devuelve varias fichas indistinguibles, la actualización se detiene sin publicar datos incorrectos.
- Si falta `RAWG_API_KEY` y existe una imagen pendiente de RAWG, la validación falla expresamente.
- Si la checklist falla, no se publica ningún cambio.
- Si aparecen archivos fuera del alcance permitido, el workflow se detiene.
- Si una rama automática avanza después de una validación, el workflow de fusión espera la validación del nuevo commit.
- Todos los cambios quedan registrados en Git y pueden revertirse mediante el commit correspondiente.

## Cambios de arquitectura

La automatización solo mantiene contenido. Cualquier cambio en diseño, estilos, estructura, filtros, animaciones o scripts debe seguir el flujo manual habitual de rama, PR, vista previa y decisión del usuario.
