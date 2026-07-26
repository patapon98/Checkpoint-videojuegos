# Final Secreto

Blog de videojuegos en español: reseñas, calendario de lanzamientos y noticias.

- Sitio en producción: https://finalsecreto.com/
- Hosting: Cloudflare Workers (assets estáticos)
- Despliegue: automático con cada push a `main` en GitHub

## Cómo correr en Replit

El workflow **"Start application"** sirve el sitio estático con `python3 -m http.server 5000`.  
Ábrelo en la pestaña Preview para ver los cambios en tiempo real (recarga el navegador tras editar).

## Estructura

```
index.html          — Portada
calendario.html     — Calendario de lanzamientos
contacto.html       — Contacto
404.html            — Página de error
css/                — Hojas de estilo por sección
js/                 — Scripts del sitio
img/                — Imágenes organizadas por juego
```

## Flujo de publicación

1. Edita aquí los archivos HTML/CSS/JS.
2. Haz commit y push a GitHub (GitHub Desktop o `git push`).
3. Cloudflare despliega automáticamente en ~1 minuto.

Ver `COMO-PUBLICAR.md` para instrucciones detalladas.

## Preferencias de usuario

*(Añade aquí tus preferencias para que el agente las recuerde.)*
