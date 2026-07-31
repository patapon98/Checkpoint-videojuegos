(function () {
  const id = "playstation-resultados-abril-junio-2026";
  const items = Array.isArray(window.FINALSECRETO_NEWS) ? window.FINALSECRETO_NEWS : [];
  if (!items.some(item => item.id === id)) {
    items.unshift({
      id,
      important: true,
      emphasis: { es: ["el beneficio operativo de PlayStation aumentó un 37%", "alcanzó 202.000 millones de yenes", "125 millones de usuarios activos mensuales"] },
      category: { es: "Industria" },
      date: "2026-07-31",
      featured: false,
      ticker: { keyword: { es: "PlayStation" }, copy: { es: "El beneficio operativo de PlayStation creció un 37% pese a la caída del hardware" } },
      tone: "playstation",
      title: { es: "El beneficio operativo de PlayStation creció un 37% pese a la caída del hardware" },
      summary: { es: "Entre abril y junio de 2026, el beneficio operativo de PlayStation aumentó un 37% y alcanzó 202.000 millones de yenes. Sony registró 125 millones de usuarios activos mensuales, mientras las ventas de PS5 bajaron hasta 1,6 millones de unidades." },
      why: { es: "La división mejora su rentabilidad aunque vende menos consolas y el tiempo total de juego retrocede un 4%. Sony ha elevado su previsión anual para el negocio de videojuegos y servicios de red." },
      sources: [
        { label: "Sony Group", type: { es: "Resultados oficiales del primer trimestre fiscal" }, url: "https://www.sony.com/en/SonyInfo/IR/library/presen/er/" },
        { label: "Reuters", type: { es: "Resultados, previsiones y ventas de PS5" }, url: "https://www.reuters.com/world/asia-pacific/sony-posts-40-rise-q1-profit-beating-estimates-2026-07-31/" }
      ]
    });
  }
  const expanded = [
    "Los ingresos del segmento se mantuvieron prácticamente planos. El crecimiento del beneficio procedió de una combinación más favorable de software y servicios, control de costes y efectos del tipo de cambio, no de un aumento en la venta de consolas.",
    "Sony vendió 1,6 millones de PS5 frente a 2,4 millones un año antes. La base mensual alcanzó un récord de 125 millones de cuentas, pero el tiempo total de juego cayó un 4%, una señal de que el alcance de la plataforma y la intensidad de uso no evolucionaron en la misma dirección."
  ];
  function patchExpandedCopy() {
    document.querySelectorAll(`[data-news-id="${id}"] .news-home-expanded-copy`).forEach(container => {
      container.innerHTML = expanded.map(paragraph => `<p>${paragraph}</p>`).join("");
    });
  }
  const script = document.createElement("script");
  script.src = "/js/news-core.js?v=20260801-1";
  script.onload = function () {
    patchExpandedCopy();
    if (typeof window.renderNews === "function") {
      const originalRenderNews = window.renderNews;
      window.renderNews = function (lang) {
        originalRenderNews(lang);
        patchExpandedCopy();
      };
    }
  };
  script.onerror = function () { console.error("No se pudo cargar el motor de Noticias."); };
  document.head.appendChild(script);
})();
