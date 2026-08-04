(function () {
  const script = document.createElement("script");
  const loaderUrl = new URL(document.currentScript?.src || location.href, location.href);
  const coreUrl = new URL("/js/news-core.js", location.href);
  const version = loaderUrl.searchParams.get("v");
  if (version) coreUrl.searchParams.set("v", version);
  script.src = coreUrl;
  script.onerror = function () {
    console.error("No se pudo cargar el motor de Noticias.");
  };
  document.head.appendChild(script);
})();
