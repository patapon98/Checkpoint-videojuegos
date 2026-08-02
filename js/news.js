(function () {
  const script = document.createElement("script");
  script.src = "/js/news-core.js";
  script.onerror = function () {
    console.error("No se pudo cargar el motor de Noticias.");
  };
  document.head.appendChild(script);
})();
