# Checklist de actualización del calendario

Esta lista debe completarse antes de abrir una PR y repetirse antes de que el usuario la fusione.

## 1. Flujo de trabajo

- Consultar primero la versión más reciente de `main`.
- Trabajar en una rama nueva creada desde el `main` actualizado.
- No modificar directamente `main` ni hacer merge. La decisión de fusionar corresponde al usuario.
- Incorporar únicamente los lanzamientos aprobados por el usuario.

## 2. Fuente y datos

- Verificar fecha, plataformas y región en una fuente oficial.
- No publicar rumores, filtraciones ni fechas aproximadas.
- Comprobar si la entrada ya existe o si se trata de una nueva plataforma, edición, remaster, expansión o DLC.
- Confirmar que el nombre corresponde a la edición o versión exacta anunciada.
- Mantener el orden cronológico dentro del mes.
- Si se añade o elimina un mes, actualizar también el selector mensual y su orden.

## 3. Imagen

- Priorizar imágenes oficiales de la editora, fabricante de plataforma o canal oficial.
- No usar RAWG, agregadores u otras fuentes de terceros cuando exista una imagen oficial estable.
- Evitar imágenes móviles, previews comprimidas y parámetros como `output=preview`.
- Evitar miniaturas con rótulos añadidos como `4K`, `tráiler`, `gameplay`, fechas superpuestas o marcas editoriales.
- Evitar Steam como fuente de imagen salvo que no exista una alternativa estable.
- Comprobar nitidez, relación de aspecto y recorte en portada, lista y cuadrícula.
- Confirmar que la URL carga sin autenticación, hotlink bloqueado o respuesta intermitente.

## 4. Ficha completa

- Fecha visible correcta.
- Plataformas visibles y `data-plat` coherentes.
- Enlace de tienda o ficha oficial válido y correspondiente a la edición correcta.
- Etiqueta editorial centralizada y no duplicada en la línea de plataformas.
- Tráiler oficial añadido cuando exista.
- Texto alternativo de imagen correcto y útil.
- Enlaces externos con los atributos de seguridad y accesibilidad usados por el resto del sitio.

## 5. Interfaz y comportamiento

- Ninguna ficha con clase `reveal` puede quedar sin registrar en el observador.
- Comprobar que las animaciones siguen funcionando al cargar, filtrar, buscar y cambiar entre lista y cuadrícula.
- Comprobar que no aparecen huecos invisibles.
- Comprobar filtros por plataforma, búsqueda y selector de mes, incluidos los estados sin resultados.
- Revisar las vistas de lista y cuadrícula.
- Revisar escritorio y móvil, incluido el scroll horizontal.
- Revisar modo claro y modo oscuro.
- Revisar al menos Chromium y Firefox cuando se modifiquen estructura, estilos o animaciones.

## 6. Calendario de la portada

- Comprobar siempre si los cambios alteran los próximos lanzamientos o los títulos destacados de la portada.
- Cuando corresponda, actualizar también `#calendario #releases` en la portada, no solo la página `/calendario`.
- Mantener sincronizados título, fecha, plataformas, imagen, enlace y etiqueta entre portada y calendario completo.
- Revisar visualmente las imágenes de portada para descartar desenfoque, recortes malos, rótulos añadidos o fuentes inestables.
- Confirmar que el orden de los destacados de portada sigue siendo editorialmente coherente después de añadir, mover o retirar lanzamientos.
- Si cambia el lanzamiento usado como cuenta atrás, actualizar y probar el contador tanto en la portada como en el calendario completo.

## 7. Cierre de la actualización

- Actualizar el texto `Calendario actualizado a ...` con la fecha real de la revisión.
- Incrementar las versiones de caché de todos los scripts y estilos modificados que usen parámetros de versión.
- Revisar el diff completo de la rama contra el `main` más reciente.
- Abrir una PR, preferiblemente en borrador, con resumen de cambios, fuentes oficiales y elementos descartados.
- Comprobar visualmente el despliegue de prueba o la vista previa disponible.
- Confirmar que la rama no se ha quedado atrás respecto a `main` antes de entregar.
- No hacer merge. Entregar la PR al usuario para su revisión y decisión final.
