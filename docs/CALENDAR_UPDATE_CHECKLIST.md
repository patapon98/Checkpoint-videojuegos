# Checklist de actualización del calendario

Esta lista se aplica tanto a cambios manuales como a las actualizaciones automáticas. Los controles que pueden comprobarse de forma determinista están implementados en `scripts/validate-release-calendar.mjs`. Las altas y cambios editoriales automáticos añaden además la validación de `scripts/validate-calendar-change.mjs`.

## 1. Flujo de trabajo

### Cambios manuales

- Consultar primero la versión más reciente de `main`.
- Trabajar en una rama nueva creada desde el `main` actualizado.
- No modificar directamente `main` ni hacer merge. La decisión de fusionar corresponde al usuario.
- Incorporar únicamente los lanzamientos aprobados por el usuario.

### Cambios automáticos autorizados

- El mantenimiento determinista puede publicar directamente en `main` únicamente cuando se limita a `data/calendar.json`, `calendario.html` e `index.html` y supera toda la checklist automática.
- Se considera mantenimiento determinista el cambio de estado a «Sale hoy» o «Ya disponible», el archivo de meses pasados, el orden cronológico, la selección de portada, la cuenta atrás y una imagen que pueda confirmarse de forma inequívoca mediante RAWG, una API autorizada o una ficha oficial.
- Los anuncios nuevos y los cambios editoriales deben partir de una rama `bot/calendar-*` y modificar solo `data/calendar.json`. GitHub resuelve las imágenes solicitadas, genera las páginas, valida las fuentes y fusiona la PR automáticamente si el resultado es correcto.
- Ninguna automatización puede inferir fechas aproximadas, relevancia, plataformas o ediciones a partir de rumores, agregadores o coincidencias ambiguas.
- RAWG se utiliza únicamente como proveedor visual. Nunca sustituye la verificación oficial de título, fecha, plataformas o región.
- Una PR automática que altere scripts, estilos, reglas, reseñas, noticias u otros archivos debe bloquearse y requerir revisión manual.

## 2. Fuente y datos

- Verificar fecha, plataformas y región en una fuente oficial.
- No publicar rumores, filtraciones ni fechas aproximadas.
- Comprobar si la entrada ya existe o si se trata de una nueva plataforma, edición, remaster, expansión o DLC.
- Confirmar que el nombre corresponde a la edición o versión exacta anunciada.
- Mantener el orden cronológico dentro del mes.
- Si se añade o elimina un mes, actualizar también el selector mensual y su orden.
- Las altas y modificaciones automáticas deben declarar `source.official`, `source.url`, `source.checkedAt` y `source.evidence`. La evidencia debe repetir de forma estructurada el título exacto, la fecha exacta y las plataformas confirmadas.
- No eliminar automáticamente entradas históricas. Los retrasos cambian la fecha y las cancelaciones deben conservarse o revisarse manualmente con una explicación explícita.

## 3. Imagen

- Para nuevas entradas del calendario, usar preferentemente RAWG como proveedor visual cuando exista una coincidencia exacta y estable.
- La API key debe almacenarse solo en el secreto de GitHub `RAWG_API_KEY`. Nunca debe escribirse en el repositorio, el HTML ni el JavaScript público.
- Una solicitud automática a RAWG debe declarar `image.provider: "rawg"` y el título exacto en `image.query`. Si la búsqueda es ambigua, declarar `image.rawgId`.
- Tras resolverla, la imagen debe conservar `rawgId`, `rawgSlug`, `rawgPage`, una URL HTTPS de `media.rawg.io` y texto alternativo útil.
- Las páginas que muestran imágenes RAWG deben incluir el enlace de atribución generado automáticamente.
- No usar miniaturas de YouTube ni otros agregadores para entradas nuevas.
- Evitar imágenes móviles, previews comprimidas y parámetros como `output=preview`.
- Evitar miniaturas con rótulos añadidos como `4K`, `tráiler`, `gameplay`, fechas superpuestas o marcas editoriales.
- Steam puede utilizarse como alternativa cuando RAWG no disponga de una ficha inequívoca o para sustituir un alojamiento especialmente lento, siempre sin derivar fechas desde Steam.
- Comprobar nitidez, relación de aspecto y recorte en portada, lista y cuadrícula.
- Confirmar que la URL carga sin autenticación, hotlink bloqueado, redirecciones costosas o respuesta intermitente.

## 4. Ficha completa

- Fecha visible correcta.
- Plataformas visibles y `data-plat` coherentes.
- Enlace de tienda o ficha oficial válido y correspondiente a la edición correcta.
- Etiqueta editorial centralizada y no duplicada en la línea de plataformas.
- Tráiler oficial añadido cuando exista.
- Texto alternativo de imagen correcto y útil.
- Enlaces externos con los atributos de seguridad y accesibilidad usados por el resto del sitio.
- Cada entrada debe tener un identificador estable y único para que los cambios de fecha no creen duplicados.

## 5. Interfaz y comportamiento

- Ninguna ficha con clase `reveal` puede quedar sin registrar en el observador.
- Comprobar que las animaciones siguen funcionando al cargar, filtrar, buscar y cambiar entre lista y cuadrícula.
- Comprobar que no aparecen huecos invisibles.
- Comprobar filtros por plataforma, búsqueda y selector de mes, incluidos los estados sin resultados.
- Revisar las vistas de lista y cuadrícula.
- Revisar escritorio y móvil, incluido el scroll horizontal.
- Revisar modo claro y modo oscuro.
- Revisar al menos Chromium y Firefox cuando se modifiquen estructura, estilos o animaciones.
- El lanzamiento cuya fecha coincide con el día actual en `Europe/Madrid` debe permanecer en el bloque activo, mostrar «Sale hoy» y llevar el tratamiento visual especial en lista y cuadrícula.
- La fecha de «Sale hoy» debe conservar un fondo claro, texto oscuro de alto contraste y legibilidad completa sobre cualquier imagen.
- El halo y la etiqueta de «Sale hoy» deben seguir siendo legibles en móvil, modo claro y modo oscuro, y deben respetar `prefers-reduced-motion`.
- El mantenimiento rutinario no debe modificar estructura ni estilos. Si una actualización automática provoca ese tipo de diff, debe bloquearse.

## 6. Calendario de la portada

- Comprobar siempre si los cambios alteran los próximos lanzamientos o los títulos destacados de la portada.
- La portada debe generarse desde los mismos datos que `/calendario`, nunca desde una lista paralela.
- Mantener sincronizados título, fecha, plataformas, imagen, enlace y etiqueta entre portada y calendario completo.
- Revisar visualmente las imágenes de portada para descartar desenfoque, recortes malos, rótulos añadidos o fuentes inestables.
- Confirmar que el orden de los destacados de portada sigue siendo editorialmente coherente después de añadir, mover o retirar lanzamientos.
- La cuenta atrás debe resolverse desde los datos estructurados y mantenerse sincronizada en la portada y el calendario completo.
- Si un lanzamiento de portada sale hoy, debe heredar «Sale hoy» y el tratamiento visual correspondiente sin depender de una lista manual.
- Si la portada muestra una imagen RAWG, debe mostrar también la atribución enlazada.

## 7. Archivo y paso del tiempo

- Las fichas cuya fecha coincide con el día actual deben mostrarse como «Sale hoy» durante toda la fecha civil de España peninsular.
- Solo a partir del día siguiente deben mostrarse como «Ya disponible».
- El mes actual puede dividirse en un bloque de lanzamientos ya disponibles y otro de lanzamientos activos o próximos.
- Los meses anteriores deben quedar plegados en la interfaz según `Europe/Madrid`. Los meses anteriores al margen de archivo configurado dejan de renderizarse, pero permanecen en `data/calendar.json`.
- El selector de mes, la búsqueda, los filtros y el contador deben seguir encontrando correctamente los meses históricos que todavía se muestran.
- La tarea diaria debe ser idempotente. Si no cambia ningún dato ni estado temporal, no debe crear un commit.
- El estado visible debe corregirse también con la página abierta cuando cambia el día en España peninsular.

## 8. Cierre de la actualización

- Actualizar el texto `Calendario actualizado a ...` con la fecha real de la revisión que haya cambiado datos o estado.
- Incrementar las versiones de caché de todos los scripts y estilos modificados que usen parámetros de versión.
- Revisar el diff completo contra el `main` más reciente.
- En cambios manuales, abrir una PR, preferiblemente en borrador, con resumen, fuentes oficiales y elementos descartados.
- Comprobar visualmente el despliegue de prueba o la vista previa disponible cuando cambie la interfaz o se incorporen imágenes nuevas.
- Confirmar que la rama no se ha quedado atrás respecto a `main` antes de entregar.
- Los cambios manuales no se fusionan sin decisión del usuario. Las ramas automáticas `bot/calendar-*` quedan expresamente autorizadas para fusionarse solo después de superar los workflows de generación, alcance y validación.
