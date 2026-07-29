# Actualización automática de PlayStation Plus

La sección de PlayStation Plus se mantiene a partir de publicaciones oficiales de PlayStation Blog y se despliega sin intervención manual cuando hay información nueva verificable.

## Fuente de datos

- El archivo central es `data/playstation-plus.json`.
- Las fuentes deben ser publicaciones oficiales de PlayStation Blog.
- No se completan planes, fechas, plataformas o juegos mediante rumores o inferencias.
- Cuando un plan todavía no se ha anunciado, se conserva un estado pendiente visible.

## Flujo automático

El workflow `.github/workflows/update-playstation-plus.yml` se ejecuta diariamente y también puede lanzarse manualmente.

1. Descarga la última versión de `main`.
2. Consulta el feed oficial de PlayStation Plus.
3. Actualiza el archivo de datos solo cuando detecta publicaciones nuevas.
4. Genera una página individual por cada mes con información oficial mediante `scripts/generate-ps-plus-pages.mjs`.
5. Regenera `sitemap.xml`.
6. Comprueba sintaxis, estructura de datos, páginas generadas y diff.
7. Si hay cambios, hace commit y push directamente a `main`.

Este push directo es una excepción autorizada a la regla general de trabajar mediante PR. La automatización solo puede modificar datos y páginas de PlayStation Plus y el sitemap derivado. Cloudflare despliega el resultado tras el push a `main`.

## URLs

- Hub general: `/playstation-plus`
- Página mensual: `/playstation-plus/AAAA-MM`

Las páginas mensuales se crean cuando el mes contiene al menos un juego oficial. Se eliminan automáticamente las páginas generadas que ya no correspondan a un mes presente en los datos.

## Revisión técnica

- El workflow de validación comprueba la sintaxis JavaScript.
- El generador debe ser idempotente. Ejecutarlo sin cambios en los datos no puede alterar los archivos.
- Las imágenes deben proceder de la fuente oficial y conservar un texto alternativo útil.
- La interfaz debe funcionar en móvil y escritorio, modo claro y oscuro y con `prefers-reduced-motion`.
