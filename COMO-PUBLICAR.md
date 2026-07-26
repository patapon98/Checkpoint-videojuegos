# Cómo publicar Final Secreto (Cloudflare)

Tu web está en: **https://finalsecreto.com/**

## Actualizar la web (flujo con GitHub — automático)

1. Abre **GitHub Desktop**: los cambios pendientes aparecen en la pestaña Changes.
2. Escribe un mensajito en "Summary" (ej.: "nueva reseña de X") y pulsa **Commit to main**.
3. Pulsa **Push origin**.
4. Cloudflare construye y publica solo en ~1 minuto. Nada más que hacer.

Puedes ver el estado del despliegue en dash.cloudflare.com → finalsecreto →
Deployments → View build history.

## Dominio propio: finalsecreto.com

Ya tienes el dominio comprado. Falta conectarlo al Worker desde el panel de
Cloudflare (Workers & Pages → finalsecreto → Settings → Domains & Routes →
Add → Custom domain) y esperar a que el certificado se active. El código ya
apunta a finalsecreto.com en el sitemap, robots.txt y las URLs canónicas.

## Después del dominio: Google

Date de alta en Google Search Console (search.google.com/search-console),
añade tu dominio y envía el sitemap. Pídeme ayuda cuando llegues aquí.

## Publicar una reseña nueva

Escríbela en tu doc de Google como siempre y dímelo en una sesión de Cowork
con esta carpeta seleccionada: yo la extraigo, creo la página con su tema de
color, la enlazo en portada y actualizo el sitemap. Después solo tienes que
volver a subir la carpeta a Cloudflare.

## Nota sobre copias antiguas

La copia antigua en moderlode.netlify.app ya no se actualizará: puedes
borrar el sitio desde tu panel de Netlify cuando quieras. Lo mismo aplica
a moderlode.alexanderblanc3.workers.dev en cuanto finalsecreto.com quede
conectado como dominio del Worker.
