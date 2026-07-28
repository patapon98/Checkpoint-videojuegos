(() => {
  const NS = "http://www.w3.org/2000/svg";
  const colors = ["#0b4da2", "#e23835", "#8b5cf6", "#0f9d76", "#e69b18"];

  const financial = [
    { label: "Jun 2022", sales: 25.2, profit: 12.0, margin: 47.8 },
    { label: "Jun 2023", sales: 43.8, profit: 24.0, margin: 54.8 },
    { label: "Jun 2024", sales: 29.5, profit: 12.8, margin: 43.5 },
    { label: "Jun 2025", sales: 45.5, profit: 24.5, margin: 54.1 },
    { label: "Jun 2026", sales: 70.4, profit: 41.0, margin: 58.3 }
  ];

  const games = [
    { name: "PRAGMATA", quarter: 2.51, lifetime: 2.51 },
    { name: "Resident Evil 4", quarter: 2.43, lifetime: 16.04 },
    { name: "Resident Evil 2", quarter: 1.42, lifetime: 19.75 },
    { name: "Devil May Cry 5", quarter: 1.29, lifetime: 14.24 },
    { name: "Resident Evil 3", quarter: 1.15, lifetime: 14.52 },
    { name: "Resident Evil Requiem", quarter: 1.14, lifetime: 8.06 },
    { name: "Resident Evil 7", quarter: 1.01, lifetime: 18.41 },
    { name: "Resident Evil Village", quarter: 0.93, lifetime: 15.86 },
    { name: "Monster Hunter World", quarter: 0.78, lifetime: 30.45 },
    { name: "Resident Evil 6", quarter: 0.71, lifetime: 17.60 }
  ];

  const dates = ["Mar 2025", "Jun 2025", "Sep 2025", "Dic 2025", "Mar 2026", "Jun 2026"];
  const timeline = [
    { name: "Resident Evil 4", color: colors[0], values: [9.915, 10.621, 11.182, 12.255, 13.60, 16.04] },
    { name: "Resident Evil 2", color: colors[1], values: [15.409, 15.892, 16.342, 16.871, 18.32, 19.75] },
    { name: "Devil May Cry 5", color: colors[2], values: [9.133, 10.512, 10.784, 11.002, 12.94, 14.24] },
    { name: "Resident Evil 7", color: colors[3], values: [14.789, 15.425, 15.936, 16.471, 17.40, 18.41] },
    { name: "Resident Evil Village", color: colors[4], values: [11.305, 12.229, 12.872, 13.589, 14.93, 15.86] }
  ];

  const state = {
    financialMetric: "sales",
    gameMetric: "quarter",
    selectedTitles: new Set(["Resident Evil 4", "Resident Evil 2", "Devil May Cry 5"])
  };

  const svgEl = (name, attrs = {}) => {
    const element = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  const format = value => new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: value < 10 ? 1 : 0,
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

  function showTooltip(container, tooltip, target, title, value) {
    const box = target.getBoundingClientRect();
    const host = container.getBoundingClientRect();
    tooltip.innerHTML = `<b>${title}</b>${value}`;
    tooltip.hidden = false;
    tooltip.style.left = `${box.left - host.left + box.width / 2 + container.scrollLeft}px`;
    tooltip.style.top = `${box.top - host.top + container.scrollTop}px`;
  }

  function bindTooltip(container, tooltip, target, title, value) {
    const show = () => showTooltip(container, tooltip, target, title, value);
    const hide = () => { tooltip.hidden = true; };
    target.addEventListener("mouseenter", show);
    target.addEventListener("focus", show);
    target.addEventListener("mouseleave", hide);
    target.addEventListener("blur", hide);
  }

  function grid(svg, width, height, margin, max, ticks, suffix = "") {
    for (let index = 0; index <= ticks; index += 1) {
      const ratio = index / ticks;
      const y = height - margin.bottom - ratio * (height - margin.top - margin.bottom);
      svg.append(svgEl("line", {
        x1: margin.left, y1: y, x2: width - margin.right, y2: y, class: "chart-grid-line"
      }));
      const label = svgEl("text", {
        x: margin.left - 10, y: y + 4, "text-anchor": "end", class: "chart-axis-label"
      });
      label.textContent = `${format(max * ratio)}${suffix}`;
      svg.append(label);
    }
  }

  function renderFinancial() {
    const container = document.getElementById("financialChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const width = Math.max(560, container.clientWidth || 560);
    const height = 330;
    const margin = { top: 24, right: 20, bottom: 48, left: 54 };
    const metric = state.financialMetric;
    const suffix = metric === "margin" ? "%" : " mil M¥";
    const values = financial.map(item => item[metric]);
    const rawMax = Math.max(...values);
    const max = metric === "margin" ? 70 : Math.ceil(rawMax / 10) * 10;
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    grid(svg, width, height, margin, max, metric === "margin" ? 7 : max / 10, metric === "margin" ? "%" : "");
    const plotWidth = width - margin.left - margin.right;
    const slot = plotWidth / financial.length;
    const barWidth = Math.min(66, slot * .56);

    financial.forEach((item, index) => {
      const value = item[metric];
      const barHeight = value / max * (height - margin.top - margin.bottom);
      const x = margin.left + slot * index + (slot - barWidth) / 2;
      const y = height - margin.bottom - barHeight;
      const rect = svgEl("rect", {
        x, y, width: barWidth, height: barHeight, rx: 7, class: "chart-bar",
        tabindex: "0", role: "graphics-symbol",
        "aria-label": `${item.label}, ${format(value)}${suffix}`
      });
      svg.append(rect);
      bindTooltip(container, tooltip, rect, item.label, `${format(value)}${suffix}`);
      const valueText = svgEl("text", {
        x: x + barWidth / 2, y: Math.max(15, y - 8), "text-anchor": "middle", class: "chart-value-label"
      });
      valueText.textContent = metric === "margin" ? `${format(value)}%` : format(value);
      svg.append(valueText);
      const label = svgEl("text", {
        x: x + barWidth / 2, y: height - 20, "text-anchor": "middle", class: "chart-axis-label"
      });
      label.textContent = item.label;
      svg.append(label);
    });
    container.prepend(svg);
  }

  function renderGames() {
    const container = document.getElementById("gamesChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const width = Math.max(650, container.clientWidth || 650);
    const height = 560;
    const margin = { top: 16, right: 62, bottom: 28, left: 170 };
    const metric = state.gameMetric;
    const values = games.map(item => item[metric]);
    const max = Math.ceil(Math.max(...values) / 5) * 5 || 5;
    const plotWidth = width - margin.left - margin.right;
    const rowHeight = (height - margin.top - margin.bottom) / games.length;
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });

    for (let index = 0; index <= 5; index += 1) {
      const x = margin.left + plotWidth * index / 5;
      svg.append(svgEl("line", { x1: x, y1: margin.top, x2: x, y2: height - margin.bottom, class: "chart-grid-line" }));
      const label = svgEl("text", { x, y: height - 7, "text-anchor": "middle", class: "chart-axis-label" });
      label.textContent = `${format(max * index / 5)} M`;
      svg.append(label);
    }

    games.forEach((item, index) => {
      const value = item[metric];
      const y = margin.top + index * rowHeight + rowHeight * .2;
      const barHeight = rowHeight * .58;
      const barWidth = value / max * plotWidth;
      const name = svgEl("text", {
        x: margin.left - 12, y: y + barHeight * .72, "text-anchor": "end", class: "chart-axis-label"
      });
      name.textContent = item.name;
      svg.append(name);
      const rect = svgEl("rect", {
        x: margin.left, y, width: barWidth, height: barHeight, rx: 6, class: "chart-bar",
        tabindex: "0", role: "graphics-symbol",
        "aria-label": `${item.name}, ${format(value)} millones`
      });
      svg.append(rect);
      bindTooltip(container, tooltip, rect, item.name, `${format(value)} millones de unidades`);
      const valueText = svgEl("text", {
        x: Math.min(width - 8, margin.left + barWidth + 8), y: y + barHeight * .72, class: "chart-value-label"
      });
      valueText.textContent = `${format(value)} M`;
      svg.append(valueText);
    });
    container.prepend(svg);
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
        renderTimeline();
      });
      picker.append(button);
    });
  }

  function renderTimeline() {
    const container = document.getElementById("timelineChart");
    if (!container) return;
    const tooltip = clearChart(container);
    const width = Math.max(650, container.clientWidth || 650);
    const height = 370;
    const margin = { top: 24, right: 24, bottom: 50, left: 52 };
    const selected = timeline.filter(item => state.selectedTitles.has(item.name));
    const allValues = selected.flatMap(item => item.values);
    const min = Math.max(0, Math.floor(Math.min(...allValues) - 2));
    const max = Math.ceil(Math.max(...allValues) + 1);
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, "aria-hidden": "true" });
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    for (let index = 0; index <= 5; index += 1) {
      const y = margin.top + plotHeight * index / 5;
      const value = max - (max - min) * index / 5;
      svg.append(svgEl("line", { x1: margin.left, y1: y, x2: width - margin.right, y2: y, class: "chart-grid-line" }));
      const label = svgEl("text", { x: margin.left - 9, y: y + 4, "text-anchor": "end", class: "chart-axis-label" });
      label.textContent = `${format(value)} M`;
      svg.append(label);
    }

    dates.forEach((date, index) => {
      const x = margin.left + plotWidth * index / (dates.length - 1);
      const label = svgEl("text", { x, y: height - 17, "text-anchor": "middle", class: "chart-axis-label" });
      label.textContent = date;
      svg.append(label);
    });

    selected.forEach(series => {
      const points = series.values.map((value, index) => {
        const x = margin.left + plotWidth * index / (dates.length - 1);
        const y = margin.top + (max - value) / (max - min) * plotHeight;
        return { x, y, value, date: dates[index] };
      });
      const path = svgEl("path", {
        d: points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" "),
        class: "chart-line", stroke: series.color
      });
      svg.append(path);
      points.forEach(point => {
        const circle = svgEl("circle", {
          cx: point.x, cy: point.y, r: 5, fill: series.color, class: "chart-point",
          tabindex: "0", role: "graphics-symbol",
          "aria-label": `${series.name}, ${point.date}, ${format(point.value)} millones`
        });
        svg.append(circle);
        bindTooltip(container, tooltip, circle, `${series.name} · ${point.date}`, `${format(point.value)} millones acumulados`);
      });
    });
    container.prepend(svg);
  }

  document.querySelectorAll("[data-financial-metric]").forEach(button => {
    button.addEventListener("click", () => {
      state.financialMetric = button.dataset.financialMetric;
      document.querySelectorAll("[data-financial-metric]").forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderFinancial();
    });
  });

  document.querySelectorAll("[data-game-metric]").forEach(button => {
    button.addEventListener("click", () => {
      state.gameMetric = button.dataset.gameMetric;
      document.querySelectorAll("[data-game-metric]").forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderGames();
    });
  });

  renderPicker();
  renderFinancial();
  renderGames();
  renderTimeline();

  let resizeTimer;
  const rerender = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      renderFinancial();
      renderGames();
      renderTimeline();
    }, 120);
  };
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(rerender);
    ["financialChart", "gamesChart", "timelineChart"].forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
  } else {
    window.addEventListener("resize", rerender, { passive: true });
  }
})();
