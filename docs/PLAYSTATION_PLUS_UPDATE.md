# Actualización de PlayStation Plus

La página pública vive en `/playstation-plus` y sus datos se centralizan en `data/playstation-plus.json`.

## Fuente y alcance

- Usar únicamente publicaciones oficiales de PlayStation Blog.
- La referencia editorial es España y Europa.
- Distinguir siempre Essential, Extra y Premium.
- Indicar las consolas y el periodo de disponibilidad.
- Mantener el enlace a la publicación oficial en cada juego.
- Cuando un plan todavía no se haya anunciado, mostrar el estado pendiente en lugar de completar datos por inferencia.

## Automatización

El flujo `.github/workflows/update-playstation-plus.yml` revisa cada día el feed oficial de PlayStation Plus.

Cuando detecta una publicación mensual nueva:

1. Extrae títulos, planes, plataformas, fechas e imágenes oficiales.
2. Actualiza `data/playstation-plus.json`.
3. Abre o actualiza una PR en borrador desde `bot/playstation-plus-auto`.
4. Nunca fusiona la PR ni modifica `main` directamente.

## Revisión antes del merge

- Confirmar que la información coincide con la publicación oficial.
- Comprobar posibles diferencias regionales.
- Revisar que las imágenes cargan y tienen un recorte correcto.
- Probar filtros, selector mensual y enlaces.
- Revisar escritorio y móvil, modo claro y oscuro.
- Comprobar que no existe scroll horizontal accidental.
