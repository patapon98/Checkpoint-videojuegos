# Checklist de actualización del calendario

Esta lista debe completarse antes de abrir o fusionar cualquier cambio relacionado con lanzamientos.

## 1. Fuente y datos

- Consultar primero la versión más reciente de `main`.
- Verificar fecha, plataformas y región en una fuente oficial.
- No publicar rumores, filtraciones ni fechas aproximadas.
- Comprobar si la entrada ya existe o si se trata de una nueva plataforma, edición, remaster, expansión o DLC.
- Mantener el orden cronológico dentro del mes.

## 2. Imagen

- Priorizar imágenes oficiales de la editora, fabricante de plataforma o canal oficial.
- Evitar imágenes móviles, previews comprimidas y parámetros como `output=preview`.
- Evitar miniaturas con rótulos añadidos como `4K`, `tráiler`, `gameplay`, fechas superpuestas o marcas editoriales.
- Evitar Steam como fuente de imagen salvo que no exista una alternativa estable.
- Comprobar nitidez, relación de aspecto y recorte en portada, lista y cuadrícula.
- Confirmar que la URL carga sin autenticación, hotlink bloqueado o respuesta intermitente.

## 3. Ficha completa

- Fecha visible correcta.
- Plataformas visibles y `data-plat` coherentes.
- Enlace de tienda o ficha oficial válido.
- Etiqueta editorial centralizada y no duplicada en la línea de plataformas.
- Tráiler oficial añadido cuando exista.
- Texto alternativo de imagen correcto.

## 4. Interfaz y comportamiento

- Ninguna ficha con clase `reveal` puede quedar sin registrar en el observador.
- Comprobar que no aparecen huecos invisibles.
- Comprobar filtros por plataforma, búsqueda y selector de mes.
- Revisar las vistas de lista y cuadrícula.
- Revisar escritorio y móvil, incluido scroll horizontal.

## 5. Calendario de la portada

- Comprobar siempre si los cambios alteran los próximos lanzamientos o los títulos destacados de la portada.
- Cuando corresponda, actualizar también `#calendario #releases` en la portada, no solo la página `/calendario`.
- Mantener sincronizados título, fecha, plataformas, imagen, enlace y etiqueta entre portada y calendario completo.
- Revisar visualmente las imágenes de portada para descartar desenfoque, recortes malos, rótulos añadidos o fuentes inestables.
- Confirmar que el orden de los destacados de portada sigue siendo editorialmente coherente después de añadir, mover o retirar lanzamientos.

## 6. Cierre de la actualización

- Actualizar el texto `Calendario actualizado a ...` con la fecha de la revisión.
- Incrementar las versiones de caché de los scripts modificados.
- Revisar el diff completo de la rama contra `main`.
- Abrir una PR con resumen de cambios, fuentes y elementos descartados.
- No fusionar hasta comprobar visualmente el despliegue de prueba o la vista previa disponible.
