(function () {
  const ticker = document.getElementById("ticker");
  let tickerObserver = null;
  if (ticker) {
    tickerObserver = new MutationObserver(() => {
      ticker.classList.add("is-hydrated");
      tickerObserver?.disconnect();
    });
    tickerObserver.observe(ticker, { childList: true });
  }

  const script = document.createElement("script");
  const loaderUrl = new URL(document.currentScript?.src || location.href, location.href);
  const coreUrl = new URL("/js/news-core.js", location.href);
  const version = loaderUrl.searchParams.get("v");
  if (version) coreUrl.searchParams.set("v", version);
  script.src = coreUrl;
  script.onerror = function () {
    tickerObserver?.disconnect();
    ticker?.classList.add("is-hydrated");
    console.error("No se pudo cargar el motor de Noticias.");
  };
  document.head.appendChild(script);
})();
