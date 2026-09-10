# Arquitectura de información de las fichas vivas

Estas reglas complementan `docs/GAME_HUBS.md` y se aplican a todas las fichas publicadas bajo `juegos/`, tanto actuales como futuras.

## Objetivo

Una ficha puede conservar mucha información sin mostrarla toda con la misma prioridad. La interfaz debe permitir entender el juego rápidamente y dejar el detalle técnico, documental o histórico disponible cuando el lector lo solicite.

La regla editorial base es que un dato importante se explica una vez. Si el mismo dato necesita aparecer en otro lugar, debe resumirse como valor, etiqueta o referencia breve, no desarrollarse de nuevo con otro párrafo equivalente.

## Jerarquía visible

La navegación interna se reduce a cinco destinos principales, en este orden visual:

1. `Información`
2. `Multimedia`
3. `Noticias`
4. `Ediciones`
5. `Detalles`

Las secciones internas existentes pueden conservar sus identificadores para mantener compatibilidad con el render, los enlaces y la indexación. No deben reaparecer como diez destinos equivalentes en la navegación.

### Información

El primer bloque funciona como una lectura rápida. La premisa se presenta antes que los datos rápidos y estos deben aparecer antes del contexto adicional. La información verificada continúa organizada por temas mediante `knowledgeSections`.

`spotlight` actúa como resumen de claves y no como una segunda explicación completa de los mismos temas. El título y el valor principal permanecen visibles. Su explicación adicional puede mostrarse bajo demanda.

En cada `knowledgeSection`, el título y el resumen deben bastar para saber de qué trata el bloque. Los `highlights` aportan el segundo nivel de detalle y pueden permanecer plegados inicialmente. Esta presentación no permite escribir resúmenes vagos o incompletos solo porque exista un desplegable.

### Multimedia

Vídeos y galería pertenecen a una misma categoría mental aunque mantengan secciones y carruseles independientes. La navegación enlaza a `Multimedia` y la galería continúa inmediatamente después como parte del mismo recorrido.

### Noticias y ediciones

Las noticias relacionadas siguen siendo una sección propia porque responden a la actualidad del juego. Las ediciones y precios siguen visibles cuando existan porque responden directamente a una posible decisión de compra.

### Detalles

El historial editorial, los requisitos de PC y las fuentes forman el nivel secundario de consulta.

- El historial muestra cinco entradas por página, empezando por las más recientes. El resto se consulta mediante paginación dentro del propio bloque.
- Los requisitos de PC permanecen cerrados inicialmente y se despliegan a petición del lector.
- Las fuentes y la verificación permanecen cerradas inicialmente y se despliegan a petición del lector.
- El HTML inicial debe seguir conteniendo toda esta información. La divulgación progresiva es una decisión de interfaz, no una excusa para eliminar contenido indexable o depender de JavaScript para entregar el texto esencial.

## Implementación compartida

La arquitectura debe aplicarse mediante componentes y recursos comunes, nunca mediante excepciones por juego.

- `scripts/apply-game-hub-information-architecture.mjs` aplica la navegación compacta, las agrupaciones y los recursos comunes después de los renderizadores de contenido, requisitos y ediciones.
- `css/game-hub-compact.css` controla la reducción de densidad y la jerarquía visual.
- `js/game-hub-compact.js` añade la paginación y los controles de divulgación progresiva.
- Cualquier cambio de estos recursos debe propagarse a todas las fichas y actualizar su versión de caché cuando corresponda.

Si JavaScript no se ejecuta, el lector debe seguir teniendo acceso a todo el contenido estático de la ficha.

## Accesibilidad y responsive

Los controles de expansión y paginación deben ser botones nativos, exponer `aria-expanded` o estados equivalentes cuando corresponda y funcionar con teclado y pantalla táctil. Las animaciones deben respetar `prefers-reduced-motion`.

En móvil, la navegación de cinco destinos puede desplazarse horizontalmente sin provocar scroll horizontal de la página. Ninguna reducción de densidad puede cortar títulos, valores, plataformas o contenido técnico.
