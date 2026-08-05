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
- La automatización de PlayStation Plus definida en `.github/workflows/update-playstation-plus.yml` es una excepción permanente y expresamente autorizada. Puede escribir directamente en `main` únicamente datos oficiales de PlayStation Plus, páginas mensuales generadas, documentación derivada y sitemap, siempre después de superar sus validaciones automáticas.
- La automatización del calendario de lanzamientos definida en `.github/workflows/update-release-calendar.yml` es otra excepción permanente y expresamente autorizada. Puede publicar directamente mantenimiento determinista de `data/calendar.json`, `calendario.html` e `index.html` después de superar la checklist automática. Las altas y cambios editoriales deben pasar por ramas `bot/calendar-*`, generación controlada, validación de fuentes y fusión automática limitada a esos tres archivos.
- Revisar el diff completo y comprobar la vista previa o el despliegue de prueba antes de entregar.
- Los cambios directos que haga el propio usuario mediante Replit, GitHub Desktop u otras herramientas quedan fuera de esta restricción.

## 3. Criterios editoriales generales

- Escribir para un lector interesado en videojuegos, pero no asumir que conoce todos los juegos, sagas, estudios o antecedentes.
- Explicar brevemente un término o referencia la primera vez que aparezca cuando sea necesario para entender la información.
- Evitar los dos puntos en el texto visible. Se permiten cuando sean necesarios en horas, URLs, código, metadatos y títulos oficiales.
- No usar el punto y coma en el cuerpo editorial ni en otros textos visibles. Sustituirlo por punto o coma, salvo cuando forme parte de una cita literal, código, estilos, una URL, una entidad HTML o un dato técnico que deba conservarse.
- Usar titulares factuales, claros y sin exageraciones.
- Distinguir expresamente entre hechos confirmados, información periodística y rumores.
- Priorizar fuentes oficiales y añadir medios solventes cuando aporten contexto o contraste.
- No publicar rumores débiles, polémicas menores de redes sociales, parches, skins, tráileres rutinarios o noticias demasiado pequeñas.
- No presentar una inferencia como un hecho confirmado.
- En artículos extensos, escribir los títulos de videojuegos en *cursiva* y usar **negritas** selectivas para cifras, hechos y conclusiones que ayuden a escanear el texto; no aplicar énfasis de forma indiscriminada.

### Artículos de análisis

- Antes de redactar, revisar íntegramente las fuentes primarias y consultar la cobertura de varios medios solventes para detectar contexto, antecedentes y posibles errores de interpretación. Las cifras y los hechos deben proceder de la fuente original cuando esté disponible.
- Definir antes de escribir cuál es la idea central del artículo y por qué importa. No limitarse a reorganizar un comunicado corporativo.
- Abrir los artículos complejos con unas claves breves que permitan comprender la conclusión principal antes de entrar en los detalles.
- Organizar la información de forma progresiva. Primero se explica el periodo, concepto o contexto necesario. Después se presentan los datos y, finalmente, su interpretación.
- Cada sección debe responder a una pregunta concreta. No agrupar bajo un mismo encabezado dimensiones diferentes, como formato, plataforma y territorio.
- No asumir conocimientos previos. Las siglas y los conceptos especializados deben explicarse la primera vez. Una vez definidos, pueden alternarse de forma natural la denominación completa y la abreviatura para evitar repeticiones.
- Separar con claridad los resultados de toda la empresa y los de una división, los ingresos y las copias vendidas, los datos de un periodo y las cifras acumuladas, y los hechos publicados por la fuente y la interpretación editorial de Final Secreto.
- Si una empresa utiliza un término potencialmente ambiguo, explicar qué incluye exactamente en ese documento. No trasladar su terminología corporativa al artículo sin aclararla.
- No generalizar una conclusión a toda la industria a partir de los datos de una sola empresa, plataforma, trimestre o territorio. Se puede relacionar con debates más amplios, pero indicando los límites de la comparación.
- Incorporar enlaces internos cuando aporten contexto real a la lectura. La relación debe explicarse en el texto y no añadirse como una referencia aislada.
- La publicación de una pieza nueva no la convierte automáticamente en «Esencial» ni debe desplazar otra más importante. La prioridad se decide por relevancia editorial, no solo por recencia.

### Cifras y unidades

- En información financiera o cuantitativa, indicar siempre las fechas exactas del periodo y explicar qué significa el trimestre fiscal antes de analizarlo.
- Cuando una cifra se refiera al número de videojuegos comercializados, escribir «copias vendidas» o «unidades», no «ventas» a secas. Reservar «ventas» para contextos monetarios o generales en los que no pueda confundirse con ingresos.
- Mantener la misma unidad y el mismo criterio dentro de cada comparación.
- Escribir «millones» en la primera mención y en las frases principales. Usar «mill.» en gráficos, tablas, etiquetas y repeticiones donde mejore la legibilidad.
- Cuando se utilice una moneda poco familiar para el público español, conservar la cifra original y añadir una equivalencia aproximada en euros junto a las cantidades principales. Indicar la fecha o referencia del tipo de cambio y no repetir la conversión en cada aparición.
- En información financiera, diferenciar siempre ingresos, beneficio operativo y margen. Añadir un glosario breve junto al gráfico cuando los conceptos puedan resultar desconocidos.

### Gráficos e infografías

- Todo gráfico debe indicar claramente en el título o subtítulo la métrica, la unidad y el periodo representados.
- Añadir junto a cada visualización la fuente, la fecha de corte y una nota metodológica cuando sea necesaria para interpretarla correctamente.
- No mostrar simultáneamente datos de un periodo y cifras acumuladas como si fueran comparables. Pueden compartir un componente si aparecen como estados excluyentes y, al cambiar de vista, se actualizan el título, el orden, la escala, las unidades, los *tooltips* y la explicación metodológica.
- No presentar repartos que se solapan como si fueran partes de un único total. Cada visualización debe mantener una unidad, un periodo y un criterio comparables.
- Cuando un control sustituya completamente una representación por otra, usar preferentemente un desplegable compacto. Mantener botones cuando permitan activar varias series simultáneamente.
- Evitar repetir de forma visible una tabla que reproduzca exactamente el gráfico. Conservar una alternativa accesible mediante texto, semántica o datos no redundantes.
- Los *tooltips* deben calcular los límites superior, inferior y laterales del gráfico. Deben comprobarse expresamente las barras superiores, los puntos extremos y las visualizaciones cercanas a los bordes.
- Toda interacción debe funcionar con ratón, teclado y pantalla táctil.
- Las animaciones deben ayudar a entender la aparición o el cambio de los datos y respetar `prefers-reduced-motion`.
- Validar los gráficos en el despliegue real, tanto en escritorio como en móvil. Comprobar cambios de vista, escalas, textos, desbordamientos y caché.

### Imágenes en artículos

- Comprobar las imágenes en la página desplegada, no solo mediante la existencia del archivo.
- Evitar recortes accidentales, deformaciones, fondos añadidos, marcos negros o zonas importantes fuera del encuadre.
- Ajustar `object-fit`, `object-position` y el contenedor según la composición de cada imagen. Si el recurso no funciona correctamente, sustituirlo por otro adecuado.
- Toda imagen debe tener procedencia clara, resolución suficiente y texto alternativo descriptivo.

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
- Toda nueva noticia debe declarar `ticker.keyword` y `ticker.copy`. `ticker.keyword` será la palabra o nombre propio más importante de la noticia —por ejemplo, Xbox, PlayStation, God of War Laufey o Fallout— y el componente la mostrará siempre en negrita naranja.
- El ticker debe mostrar automáticamente y en orden las cuatro noticias más recientes; nunca se mantiene mediante una selección manual de identificadores.
- Las noticias con página individual deben declarar `article.url`. Ese dato alimenta tanto el botón blanco «Leer noticia completa» como el archivo cronológico situado al final de Noticias.
- Toda tarjeta de portada asociada a una noticia con `article.url` debe mostrar «Leer noticia completa» en el anverso y el reverso. El enlace debe derivarse de los datos compartidos, nunca de una lista manual de identificadores.
- El rojo queda reservado para la acción «Ver tráiler»; «Leer noticia completa» debe usar el tratamiento blanco.
- «ESENCIAL» debe conservar el mismo diseño en la portada y en Noticias.
- Cuando una noticia cambie de estado, se actualizará la tarjeta existente sin cambiar su identificador ni crear un duplicado. Debe mantener la fecha original, mostrar una señal discreta con la fecha de actualización y conservar las versiones anteriores en un historial desplegable dentro del reverso, tanto en portada como en Noticias.

## 6. Interfaz permanente

- El menú sticky de portada debe mostrar «Actualidad», «Próximos lanzamientos», «Fichas» y «Últimas reseñas», siguiendo el orden de las secciones y enlazando a sus anclas reales.
- La tarjeta superior de la portada es un bloque editorial de «Novedades», no una reseña fija. Puede destacar una noticia, un artículo o una reseña reciente según su relevancia. Su etiqueta, imagen, título, resumen y enlace deben describir el tipo de contenido seleccionado, y no debe conservar elementos propios de una reseña, como la nota, cuando destaque otra clase de pieza.
- La portada debe incluir un bloque compacto «Juegos en seguimiento» con un máximo de tres fichas vivas seleccionadas editorialmente. La tarjeta superior también puede destacar una ficha cuando haya recibido una actualización relevante; debe identificarse como «Ficha actualizada» y enlazar directamente a ella.
- No permitir texto cortado ni scroll horizontal accidental en móvil.
- Mantener el modo oscuro y los colores particulares de cada reseña.
- Todo bloque visible nuevo añadido a portada, noticias, calendario, reseñas o páginas especiales debe incorporar desde su primera versión la animación de aparición existente mediante `reveal`, `stagger` o un comportamiento equivalente. Los bloques creados dinámicamente deben registrarse en el observador o ejecutar una transición equivalente después de insertarse. Siempre se debe respetar `prefers-reduced-motion`.
- Las reseñas individuales deben mantener una composición editorial común: cabecera cinematográfica con el título y los metadatos sobre la imagen principal, «Hitpoints» en una banda técnica, columna de lectura contenida y primer párrafo tratado como entradilla. El sistema debe conservar los colores propios de cada juego, funcionar en modo claro y oscuro y no copiar la identidad visual de otro medio.
- Los pies de las imágenes del cuerpo de las reseñas deben aparecer centrados. Las imágenes interiores deben poder ampliarse mediante clic, toque o teclado en un visor accesible; el visor debe cerrarse con un control visible, al pulsar fuera o mediante la tecla Escape. La imagen principal de cabecera queda fuera de este comportamiento.
- Toda reseña individual debe incluir un bloque «Lo mejor / Lo peor» inmediatamente antes del desglose de puntuación, con puntos concretos y coherentes con el análisis.
- El bloque «Hitpoints» de toda reseña debe contener exactamente estos cuatro campos y en este orden: «Fecha de lanzamiento», «Desarrollador», «Plataformas» y «Tiempo de juego». No sustituirlos por la nota, el género, la dificultad u otros datos.
- «Fecha de lanzamiento» debe indicar la fecha comercial del juego, «Desarrollador» el estudio responsable y «Plataformas» todas las plataformas en las que se publicó, no solo aquella en la que se realizó la reseña.
- «Tiempo de juego» debe reflejar el tiempo real del autor cuando se conozca. Si no se dispone de él, usar una estimación contrastada con HowLongToBeat u otra fuente solvente y anteponer «Aprox.» para distinguirla de una medición propia.
- Revisar tanto la portada como las páginas individuales cuando compartan componentes o estilos.
- Evitar soluciones vinculadas a identificadores concretos cuando la regla deba aplicarse también al contenido futuro.

## 7. Reglas técnicas

- Centralizar los datos y comportamientos reutilizables.
- La fuente de verdad de Noticias es `data/news/`, con un JSON independiente por noticia. `data/news-index.json` se genera automáticamente y los clientes lo cargan con `fetch()`. No crear ni editar `js/news-data.js`.
- Una entrega automática de Noticias puede añadir uno o dos JSON nuevos en `data/news/` o actualizar exactamente uno existente. Una actualización debe conservar el identificador, añadir una instantánea exacta de la versión sustituida y no puede alterar el historial previo. El workflow único valida la PR y, después del push a `main`, genera el índice, la caché, la portada, Noticias y las relaciones con fichas. No usar bandejas, importadores, movimientos, reintentos programados, `workflow_dispatch`, comprobaciones de SHA ni auto-merge.
- No mantener copias del ticker ni palabras clave en listas manuales dentro del renderizador; deben vivir junto a cada noticia en los datos compartidos.
- No duplicar manualmente reglas que puedan derivarse de los datos, las categorías o las clases comunes.
- El sitemap se genera con `scripts/generate-sitemap.mjs`. Al publicar una reseña, la automatización de GitHub debe incorporar su URL canónica y actualizar `lastmod`; no mantener a mano una lista paralela de reseñas.
- Las páginas mensuales de PlayStation Plus se generan desde `data/playstation-plus.json` mediante `scripts/generate-ps-plus-pages.mjs`. No deben editarse manualmente ni mantener datos duplicados fuera del archivo central.
- El calendario completo, la selección de portada, la cuenta atrás, las fechas, plataformas, imágenes, etiquetas y tráilers deben derivarse de `data/calendar.json` mediante `scripts/generate-release-calendar.mjs`. No mantener listas paralelas en el HTML o en scripts de corrección por título.
- Actualizar las versiones de caché de todos los recursos modificados que se carguen con parámetros de versión.
- Revisar escritorio y móvil, modo claro y oscuro, Chromium y Firefox cuando el cambio afecte a la interfaz.
- Comprobar sintaxis, enlaces, accesibilidad básica y ausencia de huecos invisibles.
- No introducir dependencias, servicios externos o cambios de arquitectura sin una razón clara y sin informar al usuario.

## 8. Calendario de lanzamientos

- Todo cambio relacionado con lanzamientos debe aplicar obligatoriamente [`docs/CALENDAR_UPDATE_CHECKLIST.md`](CALENDAR_UPDATE_CHECKLIST.md).
- En las tarjetas del calendario, las plataformas deben aparecer siempre con esta prioridad: PS5, Xbox, PC y Switch. Si una ficha incluye PS4, se coloca inmediatamente después de PS5. El orden debe derivarse de la configuración central y aplicarse también a futuras entradas.
- La actualización debe contemplar siempre la fuente central, el calendario completo, la portada y la cuenta atrás cuando corresponda.
- La vigilancia editorial mantiene el calendario de forma autónoma mediante ramas `bot/calendar-*`. Puede dar de alta juegos relevantes, corregir o mover fechas, incorporar plataformas o ediciones confirmadas y ajustar etiquetas, prioridad, selección de portada y cuenta atrás cuando la evidencia oficial y el criterio editorial sean inequívocos. No necesita aprobación previa para esos cambios.
- Solo se admiten fechas exactas, ediciones inequívocas, plataformas confirmadas, imágenes estables y evidencia estructurada de una fuente oficial. Una entrada heredada que reciba cualquier cambio material debe migrar en ese mismo cambio a `legacy: false` y completar toda la procedencia exigida.
- El mantenimiento temporal se ejecuta cerca del cambio de día de España peninsular y puede mover automáticamente lanzamientos a «Sale hoy» o «Ya disponible», plegar o retirar del render meses antiguos, reordenar fichas y regenerar portada y cuenta atrás. Estos estados temporales se derivan de los datos y nunca se mantienen a mano. Los datos históricos permanecen en `data/calendar.json`.
- Las cancelaciones, contradicciones entre fuentes oficiales y coincidencias ambiguas deben bloquear la edición automática y requerir revisión.
- Los juegos de PlayStation Plus se mantienen en su página específica y no se mezclan con los lanzamientos comerciales del calendario general.

## 9. Prioridad y mantenimiento

1. La petición más reciente y explícita del usuario prevalece.
2. Las checklists específicas prevalecen dentro de su ámbito.
3. Después se aplican estas reglas generales.
4. Si una nueva decisión cambia una regla permanente, este documento debe actualizarse en la misma PR o cambio autorizado.
