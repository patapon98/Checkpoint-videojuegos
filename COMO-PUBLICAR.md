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

### Noticias

Comprueba la categoría, la fecha, las fuentes, el reverso ampliado, las insignias y el comportamiento en portada y en la página de Noticias. Las tarjetas nuevas deben heredar las reglas generales sin ajustes ligados a identificadores concretos.

### Calendario

Toda actualización debe seguir [`docs/CALENDAR_UPDATE_CHECKLIST.md`](docs/CALENDAR_UPDATE_CHECKLIST.md). La checklist cubre el calendario completo, la portada, las fechas, plataformas, imágenes, enlaces, tráileres, filtros, vistas, animaciones, móvil, caché y validación final.

### Reseñas

Al publicar una reseña nueva:

1. Crea o actualiza la página individual.
2. Conserva la identidad visual específica del juego en modo claro y oscuro.
3. Añade el bloque «Lo mejor / Lo peor» inmediatamente antes del desglose de puntuación, con puntos concretos respaldados por el análisis.
4. Añade la reseña a los listados y secciones correspondientes.
5. Revisa metadatos, URL canónica y datos estructurados.
6. Comprueba que la automatización de GitHub ha incorporado la URL nueva y actualizado las fechas en `sitemap.xml`.
7. Comprueba escritorio, móvil, Chromium y Firefox.
8. Actualiza la caché de los recursos modificados cuando corresponda.

### Sitemap automático

El flujo `.github/workflows/update-sitemap.yml` se activa con cada `push` que añada o modifique una reseña individual o el archivo `resenas.html`. Ejecuta `scripts/generate-sitemap.mjs`, lee las URL canónicas de las páginas públicas, excluye las páginas con `noindex`, calcula `lastmod` desde el historial de Git y guarda `sitemap.xml` solo cuando exista un cambio real.

Si se publica directamente en `main`, la automatización añadirá un segundo commit con el sitemap actualizado y Cloudflare desplegará ese estado. Si se trabaja en una rama, el commit automático quedará incluido en la misma PR. No edites manualmente el sitemap al publicar una reseña, salvo para reparar un fallo de la automatización.

## Si algo sale mal

No borres cambios ni fuerces el historial. Identifica primero el commit y el despliegue afectados. Si el problema procede de una PR recién fusionada, utiliza una reversión mediante GitHub o prepara una nueva rama correctiva. Antes de actuar, comprueba que no haya cambios posteriores de otras personas o asistentes.
