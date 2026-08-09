# Cómo publicar Final Secreto

La web está disponible en **https://finalsecreto.com/** y se despliega mediante Cloudflare Workers Builds. Cada cambio que llega a `main` inicia automáticamente un nuevo despliegue.

Antes de modificar cualquier archivo, parte siempre de la versión más reciente de `main`.

## Cambios realizados por el usuario

Si haces una corrección pequeña mediante Replit, GitHub Desktop u otra herramienta, puedes guardarla directamente en `main`:

1. Sincroniza o actualiza el proyecto para obtener el último `main`.
2. Modifica los archivos necesarios.
3. Revisa el diff antes de publicar.
4. Escribe un mensaje de commit que describa el cambio.
5. Haz push a `main`.
6. Comprueba que el despliegue de Cloudflare termina correctamente y revisa el resultado en la web.

Para cambios amplios o que afecten a varias secciones, es preferible usar una rama y revisar una vista previa antes de fusionar.

## Cambios realizados por asistentes

Salvo autorización expresa para una excepción concreta, cualquier asistente debe seguir este flujo:

1. Consultar la última versión de `main`.
2. Crear una rama nueva desde ese estado.
3. Aplicar y validar únicamente los cambios solicitados.
4. Revisar el diff completo.
5. Comprobar la vista previa o el despliegue de prueba.
6. Abrir una PR, preferiblemente en borrador.
7. Entregar al usuario el enlace a la PR y a la vista previa.

El asistente no debe modificar directamente `main` ni hacer merge. La decisión de fusionar corresponde al usuario. Una autorización excepcional no cambia esta regla para trabajos futuros.

Las reglas completas están en [`docs/PROJECT_RULES.md`](docs/PROJECT_RULES.md).

## Después de hacer merge o push a main

Cloudflare debería iniciar el despliegue automáticamente. Comprueba:

- que la compilación termina sin errores;
- que el último despliegue corresponde al commit esperado;
- que la página modificada carga correctamente;
- que no aparece una versión antigua por la caché;
- que las imágenes, enlaces y recursos actualizados funcionan.

El estado se consulta en Cloudflare, dentro del proyecto de Final Secreto, en el historial de despliegues.

Si el cambio no aparece, revisa primero que el commit esté realmente en `main`, que el despliegue haya finalizado y que se hayan actualizado los parámetros de versión de los recursos modificados cuando corresponda.

## Publicar contenido nuevo

### Artículos de análisis

Las reglas editoriales completas están en las secciones «Artículos de análisis», «Cifras y unidades», «Gráficos e infografías» e «Imágenes en artículos» de [`docs/PROJECT_RULES.md`](docs/PROJECT_RULES.md).

Antes de entregar o publicar un artículo de análisis:

1. Comprueba que la idea central y su relevancia se entienden desde el inicio.
2. Contrasta los datos con las fuentes primarias y revisa varios medios solventes para obtener contexto.
3. Verifica que se distinguen los hechos, la interpretación editorial, los datos del periodo y las cifras acumuladas.
4. Confirma que cada cifra indica la métrica, la unidad, el periodo y la fecha de corte necesarios para interpretarla.
5. Revisa que cada gráfico mantiene magnitudes comparables y que sus cambios de vista actualizan título, escala, orden, unidades, *tooltips* y nota metodológica.
6. Prueba todos los *tooltips* en los límites superior, inferior y laterales. Comprueba también barras superiores y puntos extremos.
7. Verifica las interacciones con ratón, teclado y pantalla táctil, y comprueba que las animaciones respetan `prefers-reduced-motion`.
8. Revisa en el despliegue real el encuadre, la resolución, el texto alternativo y la procedencia de todas las imágenes.
9. Comprueba los enlaces internos, las fuentes, los metadatos, la URL canónica y los datos estructurados.
10. Valida el resultado en escritorio y móvil, modo claro y oscuro, Chromium y Firefox. Revisa desbordamientos, caché y cambios de vista.

### Noticias

Cada noticia se guarda como un JSON independiente en `data/news/`. No edites `data/news-index.json` ni mantengas un archivo JavaScript paralelo. Comprueba la categoría, la fecha, la fuente oficial, el reverso ampliado, el ticker, las insignias y el comportamiento en portada, Noticias y las fichas relacionadas. Cuando una noticia cambie de estado, actualiza su mismo JSON, conserva su identificador y fecha original, y añade `updated`. La tarjeta mostrará que fue actualizada sin conservar un historial de versiones. Las tarjetas nuevas y actualizadas deben heredar las reglas generales sin ajustes ligados a identificadores concretos.

### Calendario

Toda actualización debe seguir [`docs/CALENDAR_UPDATE_CHECKLIST.md`](docs/CALENDAR_UPDATE_CHECKLIST.md). La checklist cubre el calendario completo, la portada, las fechas, plataformas, imágenes, enlaces, tráileres, filtros, vistas, animaciones, móvil, caché y validación final.

### Fichas vivas de juegos

Cuando se pida «haz la ficha de X juego», sigue el flujo completo de [`docs/GAME_HUBS.md`](docs/GAME_HUBS.md). Parte de `data/game-hubs/_template.json`, registra la ficha en el índice central, escribe el contenido crítico en el HTML inicial, añade historial y fichas relacionadas, y ejecuta `node scripts/validate-game-hubs.mjs` antes de revisar la vista previa.

### Reseñas

Al publicar una reseña nueva:

1. Crea o actualiza la página individual.
2. Conserva la identidad visual específica del juego en modo claro y oscuro.
3. Comprueba que la cabecera cinematográfica mantiene el título, los metadatos y la nota legibles sobre la imagen, sin recortes problemáticos en escritorio ni móvil.
4. Verifica que la banda «Hitpoints», la entradilla y las imágenes anchas respetan la jerarquía común y no provocan desbordamiento horizontal.
5. Comprueba que todos los pies de imagen están centrados y que las imágenes interiores se amplían con ratón, pantalla táctil y teclado. Prueba también el cierre mediante botón, clic exterior y Escape.
6. Incluye el bloque «Hitpoints» con exactamente estos campos y en este orden: «Fecha de lanzamiento», «Desarrollador», «Plataformas» y «Tiempo de juego».
7. Contrasta la fecha, el estudio y todas las plataformas con fuentes oficiales. Usa el tiempo real del autor cuando exista o una estimación externa marcada con «Aprox.» cuando no se conozca.
8. Añade el bloque «Lo mejor / Lo peor» inmediatamente antes del desglose de puntuación, con puntos concretos respaldados por el análisis.
9. Añade la reseña a los listados y secciones correspondientes.
10. Revisa metadatos, URL canónica y datos estructurados. Las plataformas de `VideoGame` deben coincidir con las de «Hitpoints».
11. Comprueba que la automatización de GitHub ha incorporado la URL nueva y actualizado las fechas en `sitemap.xml`.
12. Comprueba escritorio, móvil, Chromium y Firefox.
13. Actualiza la caché de los recursos modificados cuando corresponda.

### Sitemap automático

El flujo `.github/workflows/update-sitemap.yml` se activa con cada `push` que añada o modifique una página pública cubierta por el generador, incluidas portada, Noticias, Reseñas, Calendario, fichas de juegos, PlayStation Plus, Sobre mí, Contacto y Privacidad. Ejecuta `scripts/generate-sitemap.mjs`, lee las URL canónicas, excluye las páginas con `noindex`, calcula `lastmod` desde el historial de Git o desde la fecha editorial de las fichas y guarda `sitemap.xml` solo cuando existe un cambio real.

Si se publica directamente en `main`, la automatización puede añadir un segundo commit con el sitemap actualizado y Cloudflare desplegará ese estado. Si se trabaja en una rama, el commit automático quedará incluido en la misma PR. No edites manualmente el sitemap salvo para reparar un fallo de la automatización.

## Si algo sale mal

No borres cambios ni fuerces el historial. Identifica primero el commit y el despliegue afectados. Si el problema procede de una PR recién fusionada, utiliza una reversión mediante GitHub o prepara una nueva rama correctiva. Antes de actuar, comprueba que no haya cambios posteriores de otras personas o asistentes.
