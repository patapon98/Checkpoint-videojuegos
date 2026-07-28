# Reglas permanentes de Final Secreto

Este documento reúne las decisiones editoriales, visuales y técnicas que deben respetarse en cualquier cambio del proyecto. Las listas operativas específicas, como la del calendario, complementan estas reglas.

## 1. Identidad y enfoque

- El nombre oficial es **Final Secreto** y debe escribirse siempre separado.
- El dominio oficial es **finalsecreto.com**.
- No usar Moderloder en textos, interfaz, metadatos, SEO o referencias públicas, salvo cuando sea imprescindible explicar el historial del proyecto.
- El sitio y sus contenidos se publican únicamente en español. No añadir traducciones al inglés ni nuevas estructuras de internacionalización.
- Final Secreto no pretende competir como medio generalista. Sus pilares son la selección editorial, un calendario realmente útil, las reseñas propias y el análisis de industria.
- Prestar especial atención a la propiedad, el formato físico, el acceso y la preservación de videojuegos.

### Títulos SEO

- La portada puede mantener la marca en el título SEO.
- Las páginas principales de sección pueden usar el sufijo `| Final Secreto` cuando el título sea corto y no provoque truncamientos.
- Las reseñas y noticias individuales no deben añadir `| Final Secreto` a `<title>` ni a `og:title`. Todo el espacio debe dedicarse al título específico del contenido.
- La marca debe seguir identificándose mediante `og:site_name`, el editor de los datos estructurados, el dominio y la cabecera del sitio.
- Esta regla se aplica también a toda nueva reseña o noticia individual.

## 2. Flujo obligatorio para asistentes

- Consultar siempre la versión más reciente de `main` antes de analizar, proponer o aplicar cambios.
- Trabajar en una rama nueva y abrir una PR, preferiblemente en borrador.
- No modificar directamente `main` ni hacer merge. La decisión de fusionar corresponde al usuario.
- Solo se puede omitir este flujo cuando el usuario autorice de forma expresa una excepción concreta. La excepción no modifica la regla general para trabajos futuros.
- Revisar el diff completo y comprobar la vista previa o el despliegue de prueba antes de entregar.
- Los cambios directos que haga el propio usuario mediante Replit, GitHub Desktop u otras herramientas quedan fuera de esta restricción.

## 3. Criterios editoriales generales

- Escribir para un lector interesado en videojuegos, pero no asumir que conoce todos los juegos, sagas, estudios o antecedentes.
- Explicar brevemente un término o referencia la primera vez que aparezca cuando sea necesario para entender la información.
- Evitar los dos puntos en el texto visible. Se permiten cuando sean necesarios en horas, URLs, código, metadatos y títulos oficiales.
- Usar titulares factuales, claros y sin exageraciones.
- Distinguir expresamente entre hechos confirmados, información periodística y rumores.
- Priorizar fuentes oficiales y añadir medios solventes cuando aporten contexto o contraste.
- No publicar rumores débiles, polémicas menores de redes sociales, parches, skins, tráileres rutinarios o noticias demasiado pequeñas.
- No presentar una inferencia como un hecho confirmado.

## 4. Categorías de noticias

| Categoría | Uso principal |
|---|---|
| Juegos | Información sobre títulos concretos cuando el núcleo no sea su fecha de lanzamiento |
| Lanzamientos | Fechas, ventanas, adelantos, retrasos o cambios de lanzamiento |
| Plataformas | PlayStation, Xbox, Nintendo, Steam y cambios en servicios o ecosistemas |
| Industria | Empresas, adquisiciones, despidos, cierres, estrategia, regulación y propiedad |

- Cada noticia debe tener una única categoría principal según el núcleo de la información.
- Los colores y estilos deben derivarse automáticamente de la categoría, sin excepciones manuales por tarjeta.

## 5. Tarjetas de noticias

- Los controles «Ampliar» y «Volver» deben ocupar exactamente la misma posición, abajo a la derecha.
- Las tarjetas sin «Relevante» o «Última hora» deben reservar el espacio de la insignia para mantener la alineación vertical.
- Mostrar la fecha exacta y el tiempo relativo, por ejemplo «Hace 2 días».
- No usar «Actualizado» como sustituto de la fecha de publicación.
- Mantener la misma tipografía, tamaño y color para las fechas del anverso y el reverso.
- Separar suficientemente el cuerpo de texto, las fuentes y «Leer análisis completo».
- Si una cara no tiene contenido interno adicional, la rueda del ratón debe desplazar la página. Si existe scroll interno, al alcanzar su límite debe continuar el scroll de la página.
- Las animaciones de aparición y volteo deben ser fluidas en Chromium y Firefox.
- La solución debe aplicarse a las clases y componentes genéricos para que las tarjetas futuras hereden el comportamiento.
- La noticia destacada debe diferenciarse visualmente sin generar una altura excesiva ni grandes huecos vacíos.
- Usar «Relevante» y «Última hora» con moderación y solo cuando estén justificadas.
- «Última hora» no se asigna manualmente. Se muestra automáticamente solo si la noticia tiene prioridad alta (`important: true`) y un `publishedAt` ISO 8601 de hace menos de 24 horas; al cumplirse las 24 horas debe desaparecer, incluso con la página abierta. Las noticias sin hora confirmada no llevan esta insignia.
- Toda noticia incluida en el ticker debe declarar `ticker.keyword` y `ticker.copy`. `ticker.keyword` será la palabra o nombre propio más importante de la noticia —por ejemplo, Xbox, PlayStation, God of War Laufey o Fallout— y el componente la mostrará siempre en negrita naranja.
- «ESENCIAL» debe conservar el mismo diseño en la portada y en Noticias.

## 6. Interfaz permanente

- El menú sticky de portada debe mostrar «Actualidad», «Calendario» y «Reseñas».
- No permitir texto cortado ni scroll horizontal accidental en móvil.
- Mantener el modo oscuro y los colores particulares de cada reseña.
- Toda reseña individual debe incluir un bloque «Lo mejor / Lo peor» inmediatamente antes del desglose de puntuación, con puntos concretos y coherentes con el análisis.
- Revisar tanto la portada como las páginas individuales cuando compartan componentes o estilos.
- Evitar soluciones vinculadas a identificadores concretos cuando la regla deba aplicarse también al contenido futuro.

## 7. Reglas técnicas

- Centralizar los datos y comportamientos reutilizables.
- No mantener copias del ticker ni palabras clave en listas manuales dentro del renderizador; deben vivir junto a cada noticia en los datos compartidos.
- No duplicar manualmente reglas que puedan derivarse de los datos, las categorías o las clases comunes.
- El sitemap se genera con `scripts/generate-sitemap.mjs`. Al publicar una reseña, la automatización de GitHub debe incorporar su URL canónica y actualizar `lastmod`; no mantener a mano una lista paralela de reseñas.
- Actualizar las versiones de caché de todos los recursos modificados que se carguen con parámetros de versión.
- Revisar escritorio y móvil, modo claro y oscuro, Chromium y Firefox cuando el cambio afecte a la interfaz.
- Comprobar sintaxis, enlaces, accesibilidad básica y ausencia de huecos invisibles.
- No introducir dependencias, servicios externos o cambios de arquitectura sin una razón clara y sin informar al usuario.

## 8. Calendario de lanzamientos

- Todo cambio relacionado con lanzamientos debe aplicar obligatoriamente [`docs/CALENDAR_UPDATE_CHECKLIST.md`](CALENDAR_UPDATE_CHECKLIST.md).
- La actualización debe contemplar el calendario completo y el calendario de portada cuando corresponda.
- La tarea de vigilancia detecta y propone novedades. La incorporación a la web comienza después de la aprobación del usuario.

## 9. Prioridad y mantenimiento

1. La petición más reciente y explícita del usuario prevalece.
2. Las checklists específicas prevalecen dentro de su ámbito.
3. Después se aplican estas reglas generales.
4. Si una nueva decisión cambia una regla permanente, este documento debe actualizarse en la misma PR o cambio autorizado.
