(() => {
  const NS = "http://www.w3.org/2000/svg";
  const colors = ["#0b4da2", "#e23835", "#8b5cf6", "#0f9d76", "#e69b18"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const JPY_PER_EUR = 185.08;

  const financial = [
    { year: "2022", period: "1 abr–30 jun 2022", sales: 25.2, profit: 12.0, margin: 47.8 },
    { year: "2023", period: "1 abr–30 jun 2023", sales: 43.8, profit: 24.0, margin: 54.8 },
    { year: "2024", period: "1 abr–30 jun 2024", sales: 29.5, profit: 12.8, margin: 43.5 },
    { year: "2025", period: "1 abr–30 jun 2025", sales: 45.5, profit: 24.5, margin: 54.1 },
    { year: "2026", period: "1 abr–30 jun 2026", sales: 70.4, profit: 41.1, margin: 58.3 }
  ];

  const games = [
    { name: "PRAGMATA", quarter: 2.51, cumulative: 2.51 },
    { name: "Resident Evil 4", quarter: 2.43, cumulative: 16.04 },
    { name: "Resident Evil 2", quarter: 1.42, cumulative: 19.75 },
    { name: "Devil May Cry 5", quarter: 1.29, cumulative: 14.24 },
    { name: "Resident Evil 3", quarter: 1.15, cumulative: 14.52 },
    { name: "Resident Evil Requiem", quarter: 1.14, cumulative: 8.06 },
    { name: "Resident Evil 7", quarter: 1.01, cumulative: 18.41 },
    { name: "Resident Evil Village", quarter: 0.93, cumulative: 15.86 },
    { name: "Monster Hunter World", quarter: 0.78, cumulative: 30.45 },
    { name: "Resident Evil 6", quarter: 0.71, cumulative: 17.60 }
  ];

  const dates = [
    { axis: "mar 2025", full: "31 mar 2025" },
    { axis: "jun 2025", full: "30 jun 2025" },
    { axis: "sep 2025", full: "30 sep 2025" },
    { axis: "dic 2025", full: "31 dic 2025" },
    { axis: "mar 2026", full: "31 mar 2026" },
    { axis: "jun 2026", full: "30 jun 2026" }
  ];

  const timeline = [
    { name: "Resident Evil 4", color: colors[0], values: [9.915, 10.621, 11.182, 12.255, 13.60, 16.04] },
    { name: "Resident Evil 2", color: colors[1], values: [15.409, 15.892, 16.342, 16.871, 18.32, 19.75] },
    { name: "Devil May Cry 5", color: colors[2], values: [9.133, 10.512, 10.784, 11.002, 12.94, 14.24] },
    { name: "Resident Evil 7", color: colors[3], values: [14.789, 15.425, 15.936, 16.471, 17.40, 18.41] },
    { name: "Resident Evil Village", color: colors[4], values: [11.305, 12.229, 12.872, 13.589, 14.93, 15.86] }
  ];

  const state = {
    financialMetric: "sales",
    gamesMetric: "quarter",
    selectedTitles: new Set(["Resident Evil 4", "Resident Evil 2", "Devil May Cry 5"])
  };

  const svgEl = (name, attrs = {}) => {
    const element = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  const format = value => new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: value < 10 && !Number.isInteger(value) ? 1 : 0,
    maximumFractionDigits: 2
  }).format(value);

  function clearChart(container) {
    container.replaceChildren();
    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.hidden = true;
    container.append(tooltip);
    return tooltip;
  }

  function positionTooltip(container, tooltip, target) {
    const targetBox = target.getBoundingClientRect();
    const hostBox = container.getBoundingClientRect();
    const gap = 10;
    const edge = 8;
    const scrollLeft = container.scrollLeft || 0;
    const scrollTop = container.scrollTop || 0;
    const targetLeft = targetBox.left - hostBox.left + scrollLeft;
    const targetTop = targetBox.top - hostBox.top + scrollTop;
    const targetBottom = targetBox.bottom - hostBox.top + scrollTop;
    const visibleLeft = scrollLeft + edge;
    const visibleRight = scrollLeft + container.clientWidth - edge;
    const visibleTop = scrollTop + edge;
    const visibleBottom = scrollTop + container.clientHeight - edge;
    const availableWidth = Math.max(1, visibleRight - visibleLeft);

    // Measure from a neutral position with an intrinsic width. Otherwise an
    // absolutely positioned tooltip near the right edge can shrink to one
    // character per line before its final coordinates are calculated.
    tooltip.style.left = "0px";
    tooltip.style.top = "0px";
    tooltip.style.width = "max-content";
    tooltip.style.maxWidth = `${Math.min(220, availableWidth)}px`;
    tooltip.style.whiteSpace = "normal";
    tooltip.style.overflowWrap = "normal";
    tooltip.style.wordBreak = "normal";

    const tooltipWidth = Math.min(tooltip.getBoundingClientRect().width, availableWidth);
    const tooltipHeight = tooltip.getBoundingClientRect().height;
    const centeredLeft = targetLeft + targetBox.width / 2 - tooltipWidth / 2;
    const maxLeft = Math.max(visibleLeft, visibleRight - tooltipWidth);
    const aboveTop = targetTop - tooltipHeight - gap;
    const belowTop = targetBottom + gap;

    tooltip.style.left = `${Math.max(visibleLeft, Math.min(centeredLeft, maxLeft))}px`;

    if (aboveTop >= visibleTop) {
      tooltip.dataset.placement = "above";
      tooltip.style.top = `${aboveTop}px`;
      return;
    }

    if (belowTop + tooltipHeight <= visibleBottom) {
      tooltip.dataset.placement = "below";
      tooltip.style.top = `${belowTop}px`;
      return;
    }

    tooltip.dataset.placement = "inside";
    tooltip.style.top = `${Math.max(visibleTop, Math.min(belowTop, visibleBottom - tooltipHeight))}px`;
  }

  function showTooltip(container, tooltip, target, title, value) {
    const heading = document.createElement("b");
    heading.textContent = title;
    tooltip.replaceChildren(heading, document.createTextNode(value));
    tooltip.hidden = false;
    positionTooltip(container, tooltip, target);
  }

  function bindTooltip(container, tooltip, target, title, value) {
    const show = () => showTooltip(container, tooltip, target, title, value);
    const hide = () => {
      tooltip.hidden = true;
    };
    target.addEventListener("mouseenter", show);
    target.addEventListener("focus", show);
    target.addEventListener("pointerdown", show);
    target.addEventListener("mouseleave", hide);
    target.addEventListener("blur", hide);
  }

  function restartReveal(container) {
    if (!container.classList.contains("is-revealed") || reducedMotion) return;
    container.classList.remove("is-revealed");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => container.classList.add("is-revealed"));
    });
  }

  function grid(svg, width, height, margin, max, ticks, suffix = "") {
    for (let index = 0; index <= ticks; index += 1) {
      const ratio = index / ticks;
      const y = height - margin.bottom - ratio * (height - margin.top - margin.bottom);
      svg.append(svgEl("line", {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: "chart-grid-line"
      }));
      const label = svgEl("text", {
        x: margin.left - 10,
        y: y + 4,
        "text-anchor": "end",
        class: "chart-axis-label"
      });
      label.textContent = `${format(max * ratio)}${suffix}`;
      svg.append(label);
    }
  }

  function renderFinancial(animate = false) {
    const container = document.getElementById("financialChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const width = Math.max(560, container.clientWidth || 560);
    const height = 330;
    const margin = { top: 24, right: 20, bottom: 48, left: 54 };
    const metric = state.financialMetric;
    const values = financial.map(item => item[metric]);
    const rawMax = Math.max(...values);
    const max = metric === "margin" ? 70 : Math.ceil(rawMax / 10) * 10;
    const ticks = metric === "margin" ? 7 : max / 10;
    const financialValue = value => metric === "margin"
      ? `${format(value)}%`
      : `${format(value)} mil millones de yenes (≈ ${format(Math.round(value * 1000 / JPY_PER_EUR))} millones de euros)`;
    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`
    });
    grid(svg, width, height, margin, max, ticks, metric === "margin" ? "%" : "");
    const plotWidth = width - margin.left - margin.right;
    const slot = plotWidth / financial.length;
    const barWidth = Math.min(66, slot * .56);

    financial.forEach((item, index) => {
      const value = item[metric];
      const barHeight = value / max * (height - margin.top - margin.bottom);
      const x = margin.left + slot * index + (slot - barWidth) / 2;
      const y = height - margin.bottom - barHeight;
      const rect = svgEl("rect", {
        x,
        y,
        width: barWidth,
        height: barHeight,
        rx: 7,
        class: "chart-bar",
        tabindex: "0",
        role: "graphics-symbol",
        "aria-label": `${item.period}, ${financialValue(value)}`
      });
      rect.style.setProperty("--animation-delay", `${index * 75}ms`);
      svg.append(rect);
      bindTooltip(container, tooltip, rect, item.period, financialValue(value));

      const valueText = svgEl("text", {
        x: x + barWidth / 2,
        y: Math.max(15, y - 8),
        "text-anchor": "middle",
        class: "chart-value-label"
      });
      valueText.textContent = metric === "margin" ? `${format(value)}%` : format(value);
      svg.append(valueText);

      const label = svgEl("text", {
        x: x + barWidth / 2,
        y: height - 20,
        "text-anchor": "middle",
        class: "chart-axis-label"
      });
      label.textContent = `Q1 ${item.year}`;
      svg.append(label);
    });

    container.prepend(svg);
    if (animate) restartReveal(container);
  }

  function renderGames(animate = false) {
    const container = document.getElementById("gamesChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const metric = state.gamesMetric;
    const isCumulative = metric === "cumulative";
    const orderedGames = [...games].sort((a, b) => b[metric] - a[metric]);
    const width = Math.max(650, container.clientWidth || 650);
    const height = 560;
    const margin = { top: 16, right: 72, bottom: 28, left: 175 };
    const max = isCumulative ? 35 : 3;
    const ticks = isCumulative ? 7 : 6;
    const plotWidth = width - margin.left - margin.right;
    const rowHeight = (height - margin.top - margin.bottom) / orderedGames.length;
    const title = document.getElementById("games-chart-title");
    const note = document.getElementById("games-chart-note");

    if (title) {
      title.textContent = isCumulative
        ? "Copias vendidas por juego hasta el 30 de junio de 2026"
        : "Copias vendidas por juego durante el Q1 de 2026";
    }
    if (note) {
      note.innerHTML = isCumulative
        ? "El gráfico muestra el <strong>total de copias vendidas desde el lanzamiento hasta el 30 de junio de 2026</strong>. Los juegos se reordenan y la escala cambia para esta vista. Las cifras agrupan versiones y adaptaciones adicionales según la tabla trimestral de Capcom."
        : "El gráfico muestra <strong>solo las copias vendidas en el Q1 de 2026</strong>, del 1 de abril al 30 de junio. Selecciona «Acumulado» para consultar el total desde el lanzamiento. Cada vista se ordena por separado y utiliza su propia escala.";
    }
    container.setAttribute(
      "aria-label",
      isCumulative
        ? "Copias vendidas de diez juegos de Capcom hasta el 30 de junio de 2026"
        : "Copias vendidas de los diez juegos de Capcom con más unidades entre el 1 de abril y el 30 de junio de 2026"
    );

    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`
    });

    for (let index = 0; index <= ticks; index += 1) {
      const x = margin.left + plotWidth * index / ticks;
      svg.append(svgEl("line", {
        x1: x,
        y1: margin.top,
        x2: x,
        y2: height - margin.bottom,
        class: "chart-grid-line"
      }));
      const label = svgEl("text", {
        x,
        y: height - 7,
        "text-anchor": "middle",
        class: "chart-axis-label"
      });
      label.textContent = `${format(max * index / ticks)} mill.`;
      svg.append(label);
    }

    orderedGames.forEach((item, index) => {
      const value = item[metric];
      const y = margin.top + index * rowHeight + rowHeight * .2;
      const barHeight = rowHeight * .58;
      const barWidth = value / max * plotWidth;
      const name = svgEl("text", {
        x: margin.left - 12,
        y: y + barHeight * .72,
        "text-anchor": "end",
        class: "chart-axis-label"
      });
      name.textContent = item.name;
      svg.append(name);

      const periodLabel = isCumulative
        ? "hasta el 30 de junio de 2026"
        : "entre el 1 de abril y el 30 de junio de 2026";
      const rect = svgEl("rect", {
        x: margin.left,
        y,
        width: barWidth,
        height: barHeight,
        rx: 6,
        class: "chart-bar",
        tabindex: "0",
        role: "graphics-symbol",
        "aria-label": `${item.name}, ${format(value)} mill. de copias vendidas ${periodLabel}`
      });
      rect.style.setProperty("--animation-delay", `${index * 45}ms`);
      svg.append(rect);
      bindTooltip(
        container,
        tooltip,
        rect,
        item.name,
        isCumulative
          ? `${format(value)} mill. de copias vendidas · hasta 30 jun 2026`
          : `${format(value)} mill. de copias vendidas · Q1 2026`
      );

      const valueText = svgEl("text", {
        x: Math.min(width - 8, margin.left + barWidth + 8),
        y: y + barHeight * .72,
        class: "chart-value-label"
      });
      valueText.textContent = `${format(value)} mill.`;
      svg.append(valueText);
    });

    container.prepend(svg);
    if (animate) restartReveal(container);
  }

  function renderPicker() {
    const picker = document.getElementById("titlePicker");
    if (!picker) return;
    picker.replaceChildren();
    timeline.forEach(item => {
      const button = document.createElement("button");
      const active = state.selectedTitles.has(item.name);
      button.type = "button";
      button.className = active ? "is-active" : "";
      button.style.setProperty("--series-color", item.color);
      button.setAttribute("aria-pressed", String(active));
      button.textContent = item.name;
      button.addEventListener("click", () => {
        if (state.selectedTitles.has(item.name)) {
          if (state.selectedTitles.size === 1) return;
          state.selectedTitles.delete(item.name);
        } else {
          state.selectedTitles.add(item.name);
        }
        renderPicker();
        renderTimeline(true);
      });
      picker.append(button);
    });
  }

  function renderTimeline(animate = false) {
    const container = document.getElementById("timelineChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const width = Math.max(650, container.clientWidth || 650);
    const height = 370;
    const margin = { top: 24, right: 24, bottom: 50, left: 52 };
    const selected = timeline.filter(item => state.selectedTitles.has(item.name));
    const min = 8;
    const max = 20;
    const svg = svgEl("svg", {
      viewBox: `0 0 ${width} ${height}`
    });
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    for (let index = 0; index <= 6; index += 1) {
      const y = margin.top + plotHeight * index / 6;
      const value = max - (max - min) * index / 6;
      svg.append(svgEl("line", {
        x1: margin.left,
        y1: y,
        x2: width - margin.right,
        y2: y,
        class: "chart-grid-line"
      }));
      const label = svgEl("text", {
        x: margin.left - 9,
        y: y + 4,
        "text-anchor": "end",
        class: "chart-axis-label"
      });
      label.textContent = `${format(value)} mill.`;
      svg.append(label);
    }

    dates.forEach((date, index) => {
      const x = margin.left + plotWidth * index / (dates.length - 1);
      const label = svgEl("text", {
        x,
        y: height - 17,
        "text-anchor": "middle",
        class: "chart-axis-label"
      });
      label.textContent = date.axis;
      svg.append(label);
    });

    selected.forEach((series, seriesIndex) => {
      const points = series.values.map((value, index) => {
        const x = margin.left + plotWidth * index / (dates.length - 1);
        const y = margin.top + (max - value) / (max - min) * plotHeight;
        return { x, y, value, date: dates[index] };
      });
      const path = svgEl("path", {
        d: points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" "),
        class: "chart-line",
        stroke: series.color
      });
      path.style.setProperty("--animation-delay", `${seriesIndex * 110}ms`);
      svg.append(path);
      const pathLength = path.getTotalLength();
      path.style.setProperty("--path-length", `${pathLength}`);

      points.forEach((point, pointIndex) => {
        const circle = svgEl("circle", {
          cx: point.x,
          cy: point.y,
          r: 5,
          fill: series.color,
          class: "chart-point",
          tabindex: "0",
          role: "graphics-symbol",
          "aria-label": `${series.name}, ${point.date.full}, ${format(point.value)} mill. de copias vendidas acumuladas`
        });
        circle.style.setProperty("--animation-delay", `${250 + seriesIndex * 90 + pointIndex * 45}ms`);
        svg.append(circle);
        bindTooltip(
          container,
          tooltip,
          circle,
          `${series.name} · ${point.date.full}`,
          `${format(point.value)} mill. de copias vendidas acumuladas`
        );
      });
    });

    container.prepend(svg);
    if (animate) restartReveal(container);
  }

  function setupBreakdownTooltips() {
    const segments = document.querySelectorAll("[data-breakdown-label]");
    const tooltips = [];

    segments.forEach(segment => {
      const card = segment.closest(".breakdown-card");
      if (!card) return;
      let tooltip = card.querySelector(".breakdown-tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.className = "breakdown-tooltip";
        tooltip.hidden = true;
        card.append(tooltip);
        tooltips.push(tooltip);
      }

      const show = () => {
        const heading = document.createElement("b");
        heading.textContent = segment.dataset.breakdownLabel;
        tooltip.replaceChildren(heading, document.createTextNode(segment.dataset.breakdownValue));
        tooltip.hidden = false;
        positionTooltip(card, tooltip, segment);
      };
      const hide = () => {
        tooltip.hidden = true;
      };

      segment.addEventListener("mouseenter", show);
      segment.addEventListener("focus", show);
      segment.addEventListener("pointerdown", show);
      segment.addEventListener("mouseleave", hide);
      segment.addEventListener("blur", hide);
    });

    document.addEventListener("pointerdown", event => {
      if (event.target.closest("[data-breakdown-label]")) return;
      tooltips.forEach(tooltip => {
        tooltip.hidden = true;
      });
    });
  }

  function setupRevealAnimations() {
    const targets = document.querySelectorAll("[data-chart-reveal]");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(target => target.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: .18,
      rootMargin: "0px 0px -8% 0px"
    });

    targets.forEach(target => observer.observe(target));
  }

  const financialMetric = document.getElementById("financialMetric");
  if (financialMetric) {
    financialMetric.addEventListener("change", () => {
      state.financialMetric = financialMetric.value;
      renderFinancial(true);
    });
  }

  const gamesMetric = document.getElementById("gamesMetric");
  if (gamesMetric) {
    gamesMetric.addEventListener("change", () => {
      state.gamesMetric = gamesMetric.value;
      renderGames(true);
    });
  }

  renderPicker();
  renderFinancial();
  renderGames();
  renderTimeline();
  setupBreakdownTooltips();
  setupRevealAnimations();

  let resizeTimer;
  const widths = new Map();
  const rerender = entries => {
    const changed = entries.some(entry => {
      const previous = widths.get(entry.target);
      const next = Math.round(entry.contentRect.width);
      widths.set(entry.target, next);
      return previous !== undefined && Math.abs(previous - next) > 1;
    });
    if (!changed) return;
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      renderFinancial();
      renderGames();
      renderTimeline();
    }, 140);
  };

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(rerender);
    ["financialChart", "gamesChart", "timelineChart"].forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      widths.set(element, Math.round(element.getBoundingClientRect().width));
      observer.observe(element);
    });
  } else {
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        renderFinancial();
        renderGames();
        renderTimeline();
      }, 140);
    }, { passive: true });
  }
})();
