(function () {
  const news = Array.isArray(window.FINALSECRETO_NEWS) ? window.FINALSECRETO_NEWS : [];
  const locale = { es: "es-ES", en: "en-GB" };
  const homeDetails = {
    "playstation-fin-formato-fisico": {
      es: [
        "La medida solo afectará a los juegos nuevos publicados desde enero de 2028. Los títulos estrenados antes de esa fecha podrán seguir fabricándose y vendiéndose en disco, por lo que el corte no elimina de inmediato todo el catálogo físico existente.",
        "Los lanzamientos posteriores dependerán de PlayStation Store: no podrán prestarse ni revenderse como un disco y quedarán más expuestos al cierre de servidores, la retirada de licencias o cambios de precio."
      ],
      en: [
        "The measure will only affect new games released from January 2028. Titles launched before that date may continue to be manufactured and sold on disc, so the change will not immediately remove the existing physical catalogue.",
        "Later releases will depend on PlayStation Store: they cannot be lent or resold like a disc and will be more exposed to server closures, licence withdrawals and price changes."
      ]
    },
    "god-of-war-laufey-fecha": {
      es: [
        "God of War Laufey llegará en exclusiva a PS5 el 16 de febrero de 2027 y estará centrado en Faye, ampliando su historia antes de los acontecimientos vividos junto a Kratos y Atreus.",
        "Cory Barlog también ha confirmado que la entrega posterior recuperará a Kratos como protagonista y conectará directamente con Laufey. El anuncio ordena la continuidad narrativa de los próximos dos juegos."
      ],
      en: [
        "God of War Laufey will launch exclusively on PS5 on February 16, 2027 and will focus on Faye, expanding her story before the events experienced alongside Kratos and Atreus.",
        "Cory Barlog has also confirmed that the following instalment will bring Kratos back as protagonist and connect directly with Laufey. The announcement establishes the narrative order of the next two games."
      ]
    },
    "ea-compra-autorizacion-ue": {
      es: [
        "La Comisión Europea ha autorizado la adquisición de Electronic Arts bajo el Reglamento de concentraciones tras concluir que el cambio de propiedad no plantea problemas de competencia.",
        "La autorización no cierra todavía la operación. Bruselas mantiene una revisión separada sobre subvenciones extranjeras; si también la supera, EA pasará a ser una compañía privada dentro de una compra valorada en 55.000 millones de dólares."
      ],
      en: [
        "The European Commission has cleared the acquisition of Electronic Arts under the EU Merger Regulation after concluding that the ownership change raises no competition concerns.",
        "The clearance does not complete the deal. Brussels is conducting a separate foreign-subsidies review; if that is also cleared, EA will become a private company in a transaction valued at $55 billion."
      ]
    },
    "xbox-nube-gratis-anuncios": {
      es: [
        "La prueba permite a Xbox Insiders retransmitir una selección de juegos que ya poseen sin pagar por el acceso a la nube. Los anuncios se muestran antes de comenzar y cada sesión tiene un límite de una hora.",
        "Microsoft presenta el sistema como una forma opcional de reducir el coste de entrada. De momento no existe confirmación de que la prueba vaya a convertirse en un nivel comercial permanente."
      ],
      en: [
        "The test lets Xbox Insiders stream selected games they already own without paying for cloud access. Ads play before the session begins and each session is limited to one hour.",
        "Microsoft presents the system as an optional way to lower the cost of entry. There is currently no confirmation that the test will become a permanent commercial tier."
      ]
    },
    "amazon-luna-prime-video": {
      es: [
        "Amazon ha añadido una pestaña de juegos dentro de Prime Video para los miembros de Prime que utilizan Fire TV en Estados Unidos y Reino Unido. Pueden iniciar juegos de Luna con un mando o con el teléfono, sin descargas ni pagos adicionales.",
        "El cambio integra el juego en el mismo espacio donde Amazon distribuye películas, series y deportes. La compañía promete ampliar dispositivos, países y catálogo, pero España y Japón no forman parte del despliegue inicial."
      ],
      en: [
        "Amazon has added a games tab inside Prime Video for Prime members using Fire TV in the US and UK. They can launch Luna games with a controller or phone, without downloads or additional payments.",
        "The change integrates gaming into the same space where Amazon distributes films, series and sports. The company plans to expand devices, countries and the catalogue, but Spain and Japan are not part of the initial rollout."
      ]
    }
  };

  function text(value, lang) {
    if (typeof value === "string") return value;
    return value?.[lang] || value?.es || "";
  }

  function categoryKey(item) {
    return ({
      Juegos: "games",
      Plataformas: "platforms",
      Industria: "industry",
      Lanzamientos: "releases"
    })[item.category?.es] || "industry";
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function emphasizedHTML(value, item, lang) {
    const raw = text(value, lang);
    const phrases = item.emphasis?.[lang] || item.emphasis?.es || [];
    if (!phrases.length) return escapeHTML(raw);
    const matches = phrases
      .map(phrase => ({ phrase, index: raw.indexOf(phrase) }))
      .filter(match => match.index >= 0)
      .sort((a, b) => a.index - b.index);
    if (!matches.length) return escapeHTML(raw);
    let cursor = 0;
    let html = "";
    matches.forEach(match => {
      if (match.index < cursor) return;
      html += escapeHTML(raw.slice(cursor, match.index));
      html += `<strong>${escapeHTML(match.phrase)}</strong>`;
      cursor = match.index + match.phrase.length;
    });
    return html + escapeHTML(raw.slice(cursor));
  }

  function formatDate(value, lang) {
    return new Intl.DateTimeFormat(locale[lang] || locale.es, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(value + "T12:00:00Z"));
  }

  function relativeDate(item, lang) {
    const hasTime = Boolean(item.publishedAt);
    const published = new Date(hasTime ? item.publishedAt : item.date + "T12:00:00Z");
    const now = new Date();
    const exact = new Intl.DateTimeFormat(locale[lang] || locale.es, {
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(hasTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "UTC"
    }).format(published);
    const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const publishedDay = Date.UTC(published.getUTCFullYear(), published.getUTCMonth(), published.getUTCDate());
    const days = Math.max(0, Math.floor((dayStart - publishedDay) / 864e5));
    let label;

    if (hasTime) {
      const hours = Math.max(0, Math.floor((now - published) / 36e5));
      if (hours < 1) label = lang === "en" ? "Less than an hour ago" : "Hace menos de una hora";
      else if (hours < 24) label = lang === "en" ? `${hours} hour${hours === 1 ? "" : "s"} ago` : `Hace ${hours} hora${hours === 1 ? "" : "s"}`;
    }
    if (!label) {
      if (days === 0) label = lang === "en" ? "Today" : "Hoy";
      else if (days === 1) label = lang === "en" ? "Yesterday" : "Ayer";
      else label = lang === "en" ? `${days} days ago` : `Hace ${days} días`;
    }
    return `<time class="news-relative-time" datetime="${escapeHTML(item.publishedAt || item.date)}" title="${escapeHTML(exact)}">${escapeHTML(label)}</time>`;
  }

  /* Solo las noticias con tráiler propio (anuncios, fechas, lanzamientos) lo incluyen. */
  function trailerLink(item, lang) {
    if (!item.trailer?.url) return "";
    const label = text(item.trailer.label, lang) || (lang === "en" ? "Watch trailer" : "Ver tráiler");
    const title = text(item.title, lang);
    const aria = lang === "en"
      ? `Watch the official ${title} trailer on YouTube`
      : `Ver el tráiler oficial de ${title} en YouTube`;
    return `
      <a class="news-trailer" href="${escapeHTML(item.trailer.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${escapeHTML(aria)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>
        <span>${escapeHTML(label)}</span>
      </a>`;
  }

  function sourceLinks(item, lang, compact) {
    const label = lang === "en" ? "Sources:" : "Fuentes:";
    const links = item.sources.map(source => `
      <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${escapeHTML(text(source.type, lang))}. ${escapeHTML(source.label)}">
        <span>${escapeHTML(source.label)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5"/></svg>
      </a>`).join("");
    return `<div class="news-sources${compact ? " compact" : ""}"><b>${label}</b>${links}${trailerLink(item, lang)}</div>`;
  }

  function latestBadge(item, lang) {
    if (!item.latest) return "";
    return `<span class="news-latest"><i aria-hidden="true"></i>${lang === "en" ? "Breaking" : "Última hora"}</span>`;
  }

  function importanceBadge(item, lang) {
    if (!item.important || item.featured) return "";
    return `<span class="news-important"><i aria-hidden="true">★</i>${lang === "en" ? "Major" : "Relevante"}</span>`;
  }

  function homeFlipButton(item, lang, back) {
    const title = text(item.title, lang);
    const label = back
      ? (lang === "en" ? "Back" : "Volver")
      : (lang === "en" ? "More" : "Ampliar");
    const aria = back
      ? (lang === "en" ? `Return to the summary of ${title}` : `Volver al resumen de ${title}`)
      : (lang === "en" ? `Show more information about ${title}` : `Mostrar más información sobre ${title}`);
    return `
      <button class="news-home-flip-button" type="button" data-home-flip aria-expanded="${back ? "true" : "false"}"
              aria-label="${escapeHTML(aria)}">
        <span>${label}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v6h6"/></svg>
      </button>`;
  }

  function homeBack(item, lang, compact) {
    const paragraphs = homeDetails[item.id]?.[lang] || [text(item.summary, lang), text(item.why, lang)];
    return `
      <section class="news-home-flip-face news-home-flip-back${compact ? " compact" : ""}" aria-hidden="true" inert>
        <div class="news-home-back-meta">
          <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
          ${importanceBadge(item, lang)}
          ${relativeDate(item, lang)}
        </div>
        <h3>${escapeHTML(text(item.title, lang))}</h3>
        <div class="news-home-expanded-copy">${paragraphs.map(paragraph => `<p>${emphasizedHTML(paragraph, item, lang)}</p>`).join("")}</div>
        ${homeFlipButton(item, lang, true)}
      </section>`;
  }

  function homeShell(item, lang, front, compact) {
    return `
      <article class="news-home-flip ${compact ? "news-home-flip-brief" : "news-home-flip-featured"} news-category-${categoryKey(item)} news-tone-${escapeHTML(item.tone)}"
               data-news-id="${escapeHTML(item.id)}">
        <div class="news-home-flip-inner">
          ${front}
          ${homeBack(item, lang, compact)}
        </div>
      </article>`;
  }

  function featuredCard(item, lang) {
    const updated = item.updated
      ? `<span>${lang === "en" ? "Updated" : "Actualizado"} ${formatDate(item.updated, lang)}</span>`
      : "";
    const front = `
      <section class="news-home-flip-face news-home-flip-front news-lead news-tone-${escapeHTML(item.tone)}" aria-hidden="false">
        <div class="news-lead-signal" aria-hidden="true">
          <span>${escapeHTML(text(item.category, lang))}</span>
          <strong>${lang === "en" ? "ESSENTIAL" : "ESENCIAL"}</strong>
        </div>
        <div class="news-lead-copy">
          <div class="news-meta">
            <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
            ${latestBadge(item, lang)}
            ${importanceBadge(item, lang)}
            ${relativeDate(item, lang)}
            ${updated}
          </div>
          <h3>${escapeHTML(text(item.title, lang))}</h3>
          <p>${escapeHTML(text(item.summary, lang))}</p>
          <div class="news-why">
            <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
            <span>${escapeHTML(text(item.why, lang))}</span>
          </div>
          ${sourceLinks(item, lang, false)}
          ${homeFlipButton(item, lang, false)}
        </div>
      </section>`;
    return homeShell(item, lang, front, false);
  }

  function briefCard(item, lang) {
    const front = `
      <section class="news-home-flip-face news-home-flip-front news-brief" aria-hidden="false">
        <div class="news-meta">
          <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
          ${latestBadge(item, lang)}
          ${importanceBadge(item, lang)}
          ${relativeDate(item, lang)}
        </div>
        <h3>${escapeHTML(text(item.title, lang))}</h3>
        <p>${escapeHTML(text(item.summary, lang))}</p>
        <div class="news-brief-why">
          <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
          ${escapeHTML(text(item.why, lang))}
        </div>
        ${sourceLinks(item, lang, true)}
        ${homeFlipButton(item, lang, false)}
      </section>`;
    return homeShell(item, lang, front, true);
  }

  function setHomeFlip(card, flipped, moveFocus) {
    const front = card.querySelector(".news-home-flip-front");
    const back = card.querySelector(".news-home-flip-back");
    card.classList.toggle("is-flipped", flipped);
    front?.setAttribute("aria-hidden", String(flipped));
    back?.setAttribute("aria-hidden", String(!flipped));
    if (front) front.inert = flipped;
    if (back) back.inert = !flipped;
    front?.querySelector("[data-home-flip]")?.setAttribute("aria-expanded", String(flipped));
    back?.querySelector("[data-home-flip]")?.setAttribute("aria-expanded", String(flipped));
    if (moveFocus) {
      card.querySelector(flipped ? ".news-home-flip-back [data-home-flip]" : ".news-home-flip-front [data-home-flip]")
        ?.focus({ preventScroll: true });
    }
  }

  function bindHomeCarousel(home) {
    const carousel = home.querySelector("[data-news-carousel]");
    const viewport = carousel?.querySelector(".news-brief-viewport");
    const track = carousel?.querySelector("[data-news-carousel-track]");
    const slides = [...(carousel?.querySelectorAll(".news-brief-slide") || [])];
    if (!viewport || !track || slides.length < 2) return;
    let current = 0;
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    const mobileQuery = window.matchMedia("(max-width: 800px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let perView = mobileQuery.matches ? 1 : 2;
    let pageCount = Math.ceil(slides.length / perView);
    let pointerState = null;

    const offsetForPage = index => {
      const firstVisible = index * perView;
      return slides[firstVisible]?.offsetLeft || 0;
    };

    const setTrackPosition = (offset, dragOffset = 0) => {
      track.style.transform = `translate3d(${Math.round(-offset + dragOffset)}px, 0, 0)`;
    };

    const clearDrag = () => {
      pointerState = null;
      carousel.classList.remove("is-dragging");
      track.classList.remove("is-dragging");
    };

    const show = index => {
      current = Math.max(0, Math.min(index, pageCount - 1));
      const firstVisible = current * perView;
      track.classList.remove("peek-nudge");
      clearDrag();
      setTrackPosition(offsetForPage(current));
      slides.forEach((slide, slideIndex) => {
        const hidden = slideIndex < firstVisible || slideIndex >= firstVisible + perView;
        slide.setAttribute("aria-hidden", String(hidden));
        slide.inert = hidden;
      });
      [...dotsContainer.querySelectorAll("[data-carousel-page]")].forEach((dot, dotIndex) => {
        const active = dotIndex === current;
        dot.classList.toggle("on", active);
        dot.setAttribute("aria-pressed", String(active));
      });
      previous.disabled = current === 0;
      next.disabled = current === pageCount - 1;
    };

    const buildDots = () => {
      dotsContainer.innerHTML = Array.from({ length: pageCount }, (_, index) =>
        `<button type="button" data-carousel-page="${index}" aria-label="${
          mobileQuery.matches
            ? `Mostrar noticia ${index + 1} de ${slides.length}`
            : `Mostrar grupo ${index + 1} de noticias`
        }" aria-pressed="${index === current}"></button>`
      ).join("");
    };

    const refreshLayout = () => {
      const firstVisible = current * perView;
      clearDrag();
      perView = mobileQuery.matches ? 1 : 2;
      pageCount = Math.ceil(slides.length / perView);
      current = Math.min(Math.floor(firstVisible / perView), pageCount - 1);
      buildDots();
      show(current);
    };

    previous.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    dotsContainer.addEventListener("click", event => {
      const dot = event.target.closest("[data-carousel-page]");
      if (dot) show(Number(dot.dataset.carouselPage));
    });

    viewport.addEventListener("pointerdown", event => {
      if (!mobileQuery.matches || !event.isPrimary || event.button !== 0) return;
      if (event.target.closest("a,button")) return;
      track.classList.remove("peek-nudge");
      carousel.querySelector("[data-news-swipe-hint]")?.classList.remove("show");
      pointerState = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        baseOffset: offsetForPage(current),
        axis: null
      };
      try { viewport.setPointerCapture(event.pointerId); } catch (e) {}
    });

    viewport.addEventListener("pointermove", event => {
      if (!pointerState || event.pointerId !== pointerState.id) return;
      const deltaX = event.clientX - pointerState.x;
      const deltaY = event.clientY - pointerState.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (!pointerState.axis) {
        if (Math.max(absX, absY) < 7) return;
        if (absX > absY * 1.08) pointerState.axis = "x";
        else if (absY > absX) pointerState.axis = "y";
        else return;
      }
      if (pointerState.axis !== "x") return;

      event.preventDefault();
      carousel.classList.add("is-dragging");
      track.classList.add("is-dragging");

      let dragOffset = deltaX;
      const beyondFirst = current === 0 && deltaX > 0;
      const beyondLast = current === pageCount - 1 && deltaX < 0;
      if (beyondFirst || beyondLast) dragOffset *= 0.28;
      const limit = viewport.clientWidth * 0.92;
      dragOffset = Math.max(-limit, Math.min(limit, dragOffset));
      setTrackPosition(pointerState.baseOffset, dragOffset);
    }, { passive: false });

    const finishPointer = (event, cancelled) => {
      if (!pointerState || event.pointerId !== pointerState.id) return;
      const state = pointerState;
      const deltaX = event.clientX - state.x;
      const elapsed = Math.max(1, performance.now() - state.startedAt);
      const velocity = deltaX / elapsed;
      const horizontal = state.axis === "x";
      clearDrag();
      try {
        if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      } catch (e) {}

      if (!horizontal) return;
      const threshold = Math.min(90, viewport.clientWidth * 0.18);
      const shouldAdvance = !cancelled &&
        (Math.abs(deltaX) >= threshold || Math.abs(velocity) >= 0.5);
      const target = shouldAdvance
        ? current + (deltaX < 0 ? 1 : -1)
        : current;

      /* Fuerza un fotograma entre el arrastre sin transición y el ajuste final. */
      void track.offsetWidth;
      show(target);
    };

    viewport.addEventListener("pointerup", event => finishPointer(event, false));
    viewport.addEventListener("pointercancel", event => finishPointer(event, true));

    let resizeFrame = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(refreshLayout);
    }, { passive: true });
    refreshLayout();

    const swipeHintKey = "finalsecreto:seen-carousel-hint-v3";
    let seenSwipeHint = false;
    try {
      seenSwipeHint = sessionStorage.getItem(swipeHintKey) === "1";
    } catch (e) {}
    if (mobileQuery.matches && !reducedMotionQuery.matches && !seenSwipeHint) {
      const arrow = carousel.querySelector("[data-news-swipe-hint]");
      let hintStarted = false;
      const triggerSwipeHint = () => {
        if (hintStarted) return;
        hintStarted = true;

        /* Reinicia las clases para que la animación arranque incluso tras un render previo. */
        track.classList.remove("peek-nudge");
        arrow?.classList.remove("show");
        void track.offsetWidth;

        const completeSwipeHint = event => {
          if (event.animationName !== "news-carousel-peek") return;
          track.classList.remove("peek-nudge");
          try { sessionStorage.setItem(swipeHintKey, "1"); } catch (e) {}
        };
        track.addEventListener("animationend", completeSwipeHint, { once: true });
        track.classList.add("peek-nudge");

        if (arrow) {
          arrow.classList.add("show");
          arrow.addEventListener("animationend", () => arrow.classList.remove("show"), { once: true });
        }
      };

      if ("IntersectionObserver" in window && arrow) {
        const hintObserver = new IntersectionObserver(entries => {
          const arrowIsVisible = entries.some(entry =>
            entry.isIntersecting && entry.intersectionRatio >= 0.9
          );
          if (!arrowIsVisible) return;
          hintObserver.disconnect();
          requestAnimationFrame(() => requestAnimationFrame(triggerSwipeHint));
        }, { threshold: [0.9], rootMargin: "-10% 0px -10% 0px" });
        hintObserver.observe(arrow);
      } else {
        triggerSwipeHint();
      }
    }
  }

  function bindHomeFlips(home) {
    if (home.dataset.flipBound === "true") return;
    home.dataset.flipBound = "true";
    home.addEventListener("click", event => {
      const button = event.target.closest("[data-home-flip]");
      const card = button?.closest(".news-home-flip");
      if (!card) return;
      setHomeFlip(card, !card.classList.contains("is-flipped"), true);
    });
    home.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const card = event.target.closest(".news-home-flip.is-flipped");
      if (!card) return;
      setHomeFlip(card, false, true);
    });
  }

  function archiveCard(item, lang) {
    const published = `<time class="news-published-date" datetime="${escapeHTML(item.date)}">${escapeHTML(formatDate(item.date, lang))}</time>`;
    const archiveBadges = `${latestBadge(item, lang)}${importanceBadge(item, lang)}`;
    return `
      <article class="news-archive-card reveal" id="${escapeHTML(item.id)}">
        <div class="news-archive-date${archiveBadges ? " has-badges" : ""}">
          ${archiveBadges}
        </div>
        <div class="news-archive-body">
          <div class="news-card-heading">
            <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
            <span class="news-card-date">
              ${published}
              ${relativeDate(item, lang)}
            </span>
          </div>
          <h2>${escapeHTML(text(item.title, lang))}</h2>
          <p>${escapeHTML(text(item.summary, lang))}</p>
          <div class="news-why">
            <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
            <span>${escapeHTML(text(item.why, lang))}</span>
          </div>
          ${sourceLinks(item, lang, false)}
        </div>
      </article>`;
  }

  function tickerCopy(item, lang) {
    const copy = {
      "god-of-war-laufey-fecha": {
        es: ["God of War Laufey", " llegará a PS5 el 16 de febrero de 2027"],
        en: ["God of War Laufey", " comes to PS5 on February 16, 2027"]
      },
      "bethesda-futuro-fallout": {
        es: ["Fallout", " confirma remasterizaciones de Fallout 3 y New Vegas y un nuevo proyecto de Obsidian"],
        en: ["Fallout", " confirms Fallout 3 and New Vegas remasters and a new Obsidian project"]
      },
      "playstation-fin-formato-fisico": {
        es: ["PlayStation", " dejará de producir discos para nuevos juegos en 2028"],
        en: ["PlayStation", " will stop producing discs for new games in 2028"]
      },
      "xbox-retrocompatibilidad-pc": {
        es: ["Xbox", " estrena la retrocompatibilidad de sus clásicos en PC"],
        en: ["Xbox", " brings backward-compatible classics to PC"]
      },
      "ea-compra-autorizacion-ue": {
        es: ["Electronic Arts", " supera el control europeo de competencia para su compra"],
        en: ["Electronic Arts", " clears the EU merger review for its acquisition"]
      },
      "xbox-nube-gratis-anuncios": {
        es: ["Xbox", " prueba el juego en la nube gratuito con anuncios"],
        en: ["Xbox", " tests free ad-supported cloud gaming"]
      },
      "xbox-reestructuracion-despidos": {
        es: ["Industria", " Xbox recortará 3.200 empleos durante su reestructuración"],
        en: ["Industry", " Xbox will cut 3,200 jobs in its restructuring"]
      }
    };
    const parts = copy[item.id]?.[lang];
    if (!parts) return escapeHTML(text(item.title, lang));
    return `<b>${escapeHTML(parts[0])}</b>${escapeHTML(parts[1])}`;
  }

  function renderNews(lang) {
    const selectedLang = lang === "en" ? "en" : "es";
    const featured = news.find(item => item.featured) || news[0];
    const rest = news
      .filter(item => item !== featured && item.home !== false)
      .sort((a, b) => b.date.localeCompare(a.date));

    const home = document.getElementById("newsHome");
    if (home && featured) {
      bindHomeFlips(home);
      const recent = rest.slice(0, 4);
      home.innerHTML = `
        ${featuredCard(featured, selectedLang)}
        <div class="news-brief-carousel" data-news-carousel>
          <div class="news-brief-viewport">
            <div class="news-brief-track" data-news-carousel-track>
              ${recent.map((item, index) => `
                <div class="news-brief-slide" aria-hidden="${index > 1}">
                  ${briefCard(item, selectedLang)}
                </div>`).join("")}
            </div>
            <span class="news-swipe-hint" data-news-swipe-hint aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </span>
          </div>
          ${recent.length > 2 ? `
            <div class="news-carousel-controls" aria-label="${selectedLang === "en" ? "More recent news" : "Más noticias recientes"}">
              <button type="button" data-carousel-prev aria-label="${selectedLang === "en" ? "Previous news" : "Noticias anteriores"}" disabled>←</button>
              <div class="news-carousel-dots" data-carousel-dots></div>
              <button type="button" data-carousel-next aria-label="${selectedLang === "en" ? "Next news" : "Noticias siguientes"}">→</button>
            </div>` : ""}
        </div>`;
      bindHomeCarousel(home);
    }

    const archive = document.getElementById("newsArchive");
    if (archive) {
      const ordered = [...news].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.date.localeCompare(a.date);
      });
      archive.innerHTML = ordered.map(item => archiveCard(item, selectedLang)).join("");
    }

    const ticker = document.getElementById("ticker");
    if (ticker) {
      const tickerItems = news.filter(item => item.ticker);
      const tickerLinks = tickerItems.map(item =>
        `<a href="noticias.html#${escapeHTML(item.id)}">${tickerCopy(item, selectedLang)}</a>`
      ).join("");
      ticker.innerHTML = tickerLinks + tickerItems.map(item =>
        `<a href="noticias.html#${escapeHTML(item.id)}" aria-hidden="true" tabindex="-1">${tickerCopy(item, selectedLang)}</a>`
      ).join("");
    }
  }

  window.renderNews = renderNews;
  renderNews(document.documentElement.lang);
})();
