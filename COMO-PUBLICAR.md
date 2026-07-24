# Cómo publicar Moderlode (Cloudflare)

Tu web está en: **https://moderlode.alexanderblanc3.workers.dev/**

## Actualizar la web (flujo con GitHub — automático)

1. Abre **GitHub Desktop**: los cambios pendientes aparecen en la pestaña Changes.
2. Escribe un mensajito en "Summary" (ej.: "nueva reseña de X") y pulsa **Commit to main**.
3. Pulsa **Push origin**.
4. Cloudflare construye y publica solo en ~1 minuto. Nada más que hacer.

Puedes ver el estado del despliegue en dash.cloudflare.com → moderlode →
Deployments → View build history.

## Cuando compres el dominio

Puedes comprarlo en el propio Cloudflare (Domain Registration, precio de coste)
y conectarlo al proyecto en un par de clics. Avísame: yo actualizaré el
sitemap, robots.txt y las URLs canónicas al dominio nuevo.

## Después del dominio: Google

Date de alta en Google Search Console (search.google.com/search-console),
añade tu dominio y envía el sitemap. Pídeme ayuda cuando llegues aquí.

## Publicar una reseña nueva

Escríbela en tu doc de Google como siempre y dímelo en una sesión de Cowork
con esta carpeta seleccionada: yo la extraigo, creo la página con su tema de
color, la enlazo en portada y actualizo el sitemap. Después solo tienes que
volver a subir la carpeta a Cloudflare.

## Nota sobre Netlify

La copia antigua en moderlode.netlify.app ya no se actualizará.
Puedes borrar el sitio desde tu panel de Netlify cuando quieras.
