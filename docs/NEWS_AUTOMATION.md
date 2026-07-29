# Automatización editorial de Noticias

La vigilancia automática mantiene exclusivamente las tarjetas de Noticias de Final Secreto. Una entrada válida en `js/news-data.js` alimenta de forma simultánea:

- la noticia destacada de la portada,
- las cuatro noticias recientes de la portada,
- el reverso de esas tarjetas,
- la cuadrícula y la lista del archivo de Noticias,
- la paginación,
- los filtros por categoría,
- el ticker superior,
- las insignias «Relevante» y «Última hora».

No se crean ni modifican artículos individuales. Las páginas dentro de `noticias/` se gestionan mediante un flujo separado y una noticia automática no debe incluir `article.url` salvo que esa página ya exista en `main`.

## Fuente de datos

`js/news-data.js` es la única fuente editorial de las tarjetas. La automatización no debe editar `index.html`, `noticias.html`, `js/news.js`, `js/news-grid.js`, `js/news-flip.js`, estilos ni otros archivos para publicar una noticia ordinaria.

La interfaz ordena las noticias por fecha, mantiene una única destacada y muestra en portada la destacada más las cuatro noticias recientes que no tengan `home: false`.

## Criterio editorial

Solo se publican acontecimientos nuevos, verificados y de relevancia amplia:

- grandes decisiones estratégicas o empresariales,
- adquisiciones, cierres, despidos o reestructuraciones importantes,
- cambios sustanciales en PlayStation, Xbox, Nintendo, Steam u otras plataformas principales,
- anuncios, fechas, adelantos, retrasos o cancelaciones de juegos de gran interés,
- consolas, hardware o servicios relevantes,
- cuestiones importantes sobre propiedad, acceso, licencias o preservación.

Se excluyen rumores débiles, filtraciones sin corroboración suficiente, polémicas menores de redes sociales, parches, skins, temporadas, tráileres rutinarios y noticias de supernicho.

Una información periodística sin confirmación oficial puede publicarse únicamente cuando proceda de un medio de máxima solvencia, tenga relevancia excepcional y se identifique con claridad como información periodística no confirmada. Los rumores no se presentan como hechos.

## Fuentes y verificación

Antes de publicar:

1. Consultar la versión más reciente de `main`.
2. Revisar todas las entradas de `js/news-data.js`.
3. Revisar las PR abiertas cuya rama empiece por `bot/news-`.
4. Comprobar las notificaciones previas disponibles.
5. Buscar una fuente oficial inequívoca siempre que exista.
6. Añadir uno o dos medios solventes cuando aporten contexto, alcance o verificación independiente.

No se duplica una noticia ya cubierta por un cambio de titular, una segunda pieza periodística o un detalle menor. Una entrada existente se actualiza solo cuando hay un cambio material posterior, como una nueva fecha, retraso, cancelación, cambio de plataforma, alcance empresarial distinto o información oficial comparable.

La fecha de God of War Laufey del 16 de febrero de 2027 se considera cubierta. Solo se actualiza ante un cambio sustancial posterior.

## Estructura de una entrada

Las nuevas entradas se redactan en español. Deben conservar el formato existente y contener, como mínimo:

- `id` único, estable y descriptivo en kebab-case,
- `category.es`, usando únicamente `Juegos`, `Plataformas`, `Industria` o `Lanzamientos`,
- `date` en formato `AAAA-MM-DD`,
- `publishedAt` en ISO UTC cuando se conoce una hora fiable,
- `featured: false` salvo decisión editorial extraordinaria,
- `tone`, reutilizando un tono ya existente y compatible,
- `title.es`,
- `summary.es`,
- `why.es`,
- `sources`, con etiqueta, tipo y URL directa,
- `emphasis.es`, con frases literales que existan dentro del resumen, la explicación o el texto ampliado.

Puede incluir:

- `important: true` para una noticia de prioridad alta,
- `ticker` cuando merece formar parte de las cuatro noticias del ticker,
- `trailer` únicamente si el vídeo oficial forma parte material de un anuncio, fecha o presentación relevante,
- `updated` cuando una noticia existente recibe una actualización material,
- `home: false` cuando debe permanecer en el archivo pero no competir por la portada.

No se añade `article` a una noticia nueva. El reverso de portada utilizará automáticamente `summary.es` y `why.es` cuando no exista un texto ampliado específico en el código.

## Categorías

- `Lanzamientos`: fechas, ventanas, adelantos, retrasos, cancelaciones o cambios de plataforma ligados al lanzamiento.
- `Juegos`: noticias relevantes centradas en un título concreto que no consisten principalmente en su fecha.
- `Plataformas`: cambios de servicios, tiendas, ecosistemas, hardware, propiedad, acceso o preservación.
- `Industria`: adquisiciones, resultados, estrategia empresarial, cierres, despidos y reestructuraciones.

El color visible se deriva de la categoría. No se debe modificar CSS para adaptar una noticia concreta.

## Prioridad, ticker y destacada

`important: true` se reserva para acontecimientos de prioridad alta. Si además existe `publishedAt`, la interfaz muestra «Última hora» durante las primeras 24 horas.

El ticker debe utilizar un `keyword.es` breve que aparezca literalmente dentro de `copy.es`. No todas las noticias necesitan ticker. Se reserva para novedades recientes y ampliamente relevantes.

Debe existir exactamente una noticia con `featured: true`. Una nueva noticia solo sustituye a la destacada cuando su relevancia estructural y duración editorial superan claramente a la actual. Al cambiar el campo `featured`, el ribbon y la posición destacada se actualizan automáticamente tanto en portada como en Noticias.

## Flujo automático de GitHub

Cuando existe una novedad válida:

1. Crear una rama desde el `main` más reciente con nombre `bot/news-AAAA-MM-DD-HHMM`.
2. Modificar exclusivamente `js/news-data.js`.
3. Añadir la entrada sin reformatear ni reordenar innecesariamente el resto del archivo.
4. Comprobar que los identificadores sean únicos.
5. Comprobar que exista exactamente una noticia destacada.
6. Comprobar que todas las frases de `emphasis.es` aparezcan realmente en el contenido correspondiente.
7. Comprobar que las URLs sean directas y HTTPS.
8. Revisar el diff completo y verificar que no haya cambios fuera de alcance.
9. Abrir una PR no borrador con un título factual, resumen editorial y fuentes.
10. Fusionar mediante squash únicamente si el cambio es inequívoco, el diff se limita al archivo autorizado y no existe conflicto con `main`.
11. Confirmar después del merge que la nueva entrada está presente en `main`.

Si una PR `bot/news-*` ya cubre la misma novedad, se actualiza esa PR en vez de crear otra.

## Casos que deben bloquearse

No se fusiona automáticamente y se solicita revisión cuando:

- las fuentes fiables se contradicen,
- la información depende de una interpretación dudosa,
- no puede distinguirse entre hecho, información periodística y rumor,
- se pretende reemplazar la noticia destacada y la decisión no es claramente superior,
- el cambio requiere editar diseño, scripts o artículos individuales,
- el diff incluye archivos ajenos a `js/news-data.js`,
- GitHub no permite revisar o fusionar la PR con seguridad.

Si no hay novedades suficientemente importantes, no se modifica el repositorio y no se genera ninguna notificación. Si el proceso termina correctamente, puede permanecer silencioso. Solo se debe avisar cuando la automatización queda bloqueada o necesita una decisión editorial humana.
