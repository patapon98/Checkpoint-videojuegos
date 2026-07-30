# Automatización del calendario de lanzamientos

El calendario utiliza `data/calendar.json` como única fuente de datos. `calendario.html` y la selección de lanzamientos de `index.html` son salidas generadas y no deben editarse manualmente para cambiar títulos, fechas, plataformas, imágenes, etiquetas o tráilers.

La referencia temporal del calendario es siempre **España peninsular**, mediante la zona IANA `Europe/Madrid`. La ubicación actual del usuario, la zona UTC del servidor y los cambios entre horario de invierno y verano no alteran cuándo un lanzamiento pasa a «Sale hoy» o «Ya disponible».

## Componentes

- `data/calendar.json` contiene todos los lanzamientos y su procedencia.
- `scripts/generate-release-calendar.mjs` genera el calendario completo, el calendario de portada, los estados temporales, la atribución de imágenes y la cuenta atrás.
- `js/calendar-today.js` mantiene el estado del día sincronizado en el navegador mediante `Europe/Madrid`, incluso si la página permanece abierta durante el cambio de fecha.
- `css/calendar-today.css` contiene el tratamiento visual de «Sale hoy», la atribución de fuentes visuales y el soporte de `prefers-reduced-motion`.
- `scripts/rawg-images.mjs` selecciona una ficha inequívoca de RAWG y normaliza sus metadatos.
- `scripts/resolve-rawg-calendar-images.mjs` obtiene las imágenes solicitadas mediante una clave temporal enmascarada o, opcionalmente, el secreto `RAWG_API_KEY` del repositorio.
- `scripts/update-release-calendar.mjs` revisa únicamente las fuentes que autorizan expresamente una actualización automática.
- `scripts/validate-release-calendar.mjs` ejecuta los controles deterministas de la checklist.
- `scripts/validate-calendar-today.mjs` simula una fecha real del calendario y comprueba que la ficha permanece activa, muestra «Sale hoy» y conserva el mismo estado en la portada cuando corresponde.
- `scripts/validate-rawg-images.mjs` prueba la selección de RAWG con datos simulados, sin usar una clave real ni depender de la red.
- `scripts/validate-calendar-change.mjs` compara los cambios editoriales con `main` y valida fuentes, evidencia, imágenes y alcance.
- `.github/workflows/update-release-calendar.yml` ejecuta el mantenimiento diario y publica en `main` cuando existe un cambio real.
- `.github/workflows/validate-release-calendar.yml` resuelve las imágenes solicitadas, genera las páginas, valida el resultado final y fusiona las ramas editoriales automáticas cuando la cabecera remota coincide exactamente con el commit comprobado.

## Mantenimiento temporal de GitHub

GitHub Actions ejecuta dos pasadas UTC con `TZ=Europe/Madrid`, a las 22:17 y 23:17 UTC. Así una de ellas cae poco después de medianoche tanto con horario CEST como CET, sin depender de una conversión fija que quede desfasada con el cambio estacional. El proceso:

1. Descarga la última versión de `main`.
2. Comprueba la sintaxis de los scripts.
3. Comprueba las imágenes RAWG que ya estén resueltas. Si excepcionalmente llega una solicitud pendiente a `main`, puede resolverla mediante el secreto opcional `RAWG_API_KEY`.
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

Si no cambia ningún dato ni estado temporal, el workflow termina sin crear un commit. La segunda pasada actúa como comprobación idempotente y no genera ruido. El script del navegador comprueba la fecha de Madrid cada minuto y al recuperar el foco. De este modo, el estado visible cambia correctamente aunque GitHub Actions todavía no haya terminado.

## Imágenes mediante RAWG

RAWG se utiliza solo como proveedor visual. El título, la edición, la fecha, las plataformas y cualquier otro dato editorial deben seguir verificándose en una fuente oficial.

La tarea programada de descubrimiento conserva la clave autorizada fuera del repositorio. Cuando crea una PR automática que contiene una imagen pendiente, añade la clave mediante un comentario HTML temporal y oculto en la descripción de la PR. El workflow:

1. Lee la clave antes de ejecutar el resolutor.
2. La enmascara en los registros de GitHub Actions.
3. Elimina inmediatamente el comentario de la descripción de la PR.
4. Guarda únicamente el identificador de la ficha, el slug, la URL pública de RAWG y la atribución.

La clave no se escribe en `data/calendar.json`, HTML, JavaScript público, scripts, documentación ni commits. El secreto de repositorio `RAWG_API_KEY` queda como mecanismo opcional de respaldo, no como una acción manual necesaria para el funcionamiento habitual.

Las entradas nuevas que quieran utilizar RAWG deben conservar también una imagen oficial HTTPS como respaldo:

```json
"image": {
  "provider": "rawg",
  "query": "Título exacto del juego",
  "src": "https://fuente-oficial.example/imagen.jpg",
  "alt": "Título exacto del juego",
  "className": "",
  "gridArt": "",
  "poster": "",
  "legacy": false
}
```

El workflow busca exclusivamente coincidencias exactas. Si hay varias, prioriza la misma fecha y las plataformas compatibles. Cuando la selección siga siendo ambigua, la PR se bloquea y debe añadirse `image.rawgId` después de confirmar inequívocamente la ficha correcta.

Si la ficha seleccionada tiene `background_image`, se utiliza ese recurso. Si no lo tiene, el resolutor prueba las capturas asociadas a la ficha. Si RAWG todavía no ofrece ninguna imagen, conserva el recurso oficial de respaldo y continúa con el resto de la actualización. Esa ausencia no bloquea el calendario ni sustituye la imagen por un recurso incorrecto.

Tras resolver una imagen, el JSON conserva `rawgId`, `rawgSlug`, `rawgPage`, `rawgImageType` y la URL pública. Las páginas que muestran una imagen alojada por RAWG incluyen automáticamente un enlace de atribución.

## Descubrimiento editorial

No existe una fuente oficial única que reúna todos los lanzamientos relevantes de PlayStation, Xbox, Nintendo, Steam y otras editoras. La búsqueda de altas nuevas y anuncios se mantiene separada del mantenimiento determinista.

La tarea programada de vigilancia:

1. Revisa anuncios oficiales y aplica los criterios de relevancia de Final Secreto.
2. Consulta primero `main`, `data/calendar.json` y las PR `bot/calendar-*` abiertas para evitar duplicados y trabajar sobre el estado vigente.
3. Detecta altas, fechas nuevas, adelantos, retrasos, correcciones, plataformas o ediciones adicionales y cambios objetivos que afecten a etiquetas, prioridad, portada o cuenta atrás.
4. Descarta rumores, ventanas aproximadas, títulos sin fecha exacta y lanzamientos demasiado pequeños para el enfoque de Final Secreto.
5. Mantiene el identificador estable de una entrada existente. Si cambia materialmente una entrada heredada, la migra a `legacy: false` y completa toda la evidencia oficial.
6. Crea o actualiza una rama `bot/calendar-*` y modifica únicamente `data/calendar.json`.
7. No espera aprobación previa cuando el cambio oficial y la decisión editorial son inequívocos. Las cancelaciones, contradicciones y coincidencias ambiguas se bloquean para revisión.
8. Abre una PR e incorpora la credencial temporal solo cuando existe una imagen RAWG pendiente.
9. GitHub resuelve las imágenes solicitadas, genera las páginas y ejecuta las validaciones en la misma ejecución.
10. Si la generación cambia el JSON o los HTML, GitHub guarda primero ese resultado en la rama y obtiene su SHA final.
11. Antes de fusionar, GitHub vuelve a consultar la PR y exige que siga abierta, no sea borrador, apunte a `main`, conserve una rama `bot/calendar-*`, solo modifique los tres archivos autorizados y mantenga exactamente el SHA verificado.
12. La misma ejecución fusiona ese commit con `--match-head-commit` y elimina la rama. No depende de que un segundo workflow apruebe o valide el commit generado.
13. No se notifica si no hubo cambios o todo terminó correctamente.

La vigilancia no puede editar scripts, estilos, noticias, reseñas ni otros documentos. Cualquier intento queda bloqueado por el workflow de alcance.

## Campos obligatorios para altas y cambios materiales

Una entrada nueva o una entrada heredada modificada por la vigilancia automática debe incluir al menos:

- `id` estable y único.
- `title` y `headingHtml`.
- `date` en formato `AAAA-MM-DD`, interpretada como fecha civil de España peninsular.
- `platformKeys` y `platformsHtml`.
- Imagen oficial HTTPS de respaldo y, preferentemente, una solicitud RAWG mediante `image.provider: "rawg"`.
- Ficha oficial o enlace de tienda.
- Tráiler oficial cuando exista.
- Prioridad y etiqueta editorial coherentes. Las etiquetas describen condiciones objetivas ya contempladas por el calendario y no se usan como relleno.
- `legacy: false`.
- `source.official: true`.
- `source.url` y `source.checkedAt`.
- `source.evidence.title`.
- `source.evidence.releaseDate`.
- `source.evidence.platforms`.

La evidencia estructurada no sustituye la URL oficial. Sirve para que el workflow pueda detectar contradicciones internas antes de fusionar. Si el cambio altera claramente qué juegos deben destacar, la misma PR puede actualizar `settings.homePinnedIds` y `settings.countdownId`; el validador exige que sus identificadores existan y no estén repetidos.

«Sale hoy», «Ya disponible», el archivo de meses, el orden visible, la portada y la cuenta atrás se recalculan desde el JSON. La vigilancia editorial no edita esos estados directamente en los HTML generados.

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
- Si RAWG identifica la ficha pero todavía no dispone de imágenes, se conserva el respaldo oficial y la actualización continúa.
- Si falta una clave temporal y existe una imagen RAWG sin resolver, la validación falla antes de publicar cambios incompletos.
- Si la checklist falla, no se publica ningún cambio.
- Si aparecen archivos fuera del alcance permitido, el workflow se detiene.
- Si la cabecera remota cambia después de calcular el SHA final, la fusión se detiene. Nunca se fusiona un commit distinto del que acaba de validar la ejecución.
- Todos los cambios quedan registrados en Git y pueden revertirse mediante el commit correspondiente.

## Cambios de arquitectura

La automatización solo mantiene contenido. Cualquier cambio en diseño, estilos, estructura, filtros, animaciones o scripts debe seguir el flujo manual habitual de rama, PR, vista previa y decisión del usuario.
