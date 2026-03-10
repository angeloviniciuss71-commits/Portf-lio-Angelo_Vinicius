(() => {
  "use strict";

  (function () {
    const links = Array.from(document.querySelectorAll(".nav__link"));
    if (!links.length) return;

    const sections = links
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    function setActiveById(id) {
      links.forEach((l) =>
        l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`)
      );
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) setActiveById(visible.target.id);
      },
      { threshold: [0.2, 0.35, 0.5, 0.65] }
    );

    sections.forEach((sec) => observer.observe(sec));
  })();

  (function () {
    const menuBtn = document.getElementById("menuBtn");
    const mobileNav = document.getElementById("mobileNav");
    if (!menuBtn || !mobileNav) return;

    function close() {
      mobileNav.hidden = true;
      menuBtn.setAttribute("aria-expanded", "false");
    }

    menuBtn.addEventListener("click", () => {
      const open = !mobileNav.hidden;
      mobileNav.hidden = open;
      menuBtn.setAttribute("aria-expanded", String(!open));
    });

    mobileNav.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });
  })();

  (function () {
    document.documentElement.classList.add("preload");
    const els = Array.from(document.querySelectorAll(".reveal"));

    if (els.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("is-in");
            obs.unobserve(e.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
      );

      els.forEach((el) => obs.observe(el));
    }

    window.addEventListener("load", () => {
      document.documentElement.classList.remove("preload");
      requestAnimationFrame(() => {
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
            el.classList.add("is-in");
          }
        });
      });
    });
  })();

  (function () {
    window.addEventListener("load", () => {
      const el = document.querySelector(".prompt");
      if (!el) return;

      const text = el.textContent.trim();
      if (!text) return;

      el.textContent = "";
      let i = 0;

      function type() {
        el.textContent = text.slice(0, i);
        i++;
        if (i <= text.length) setTimeout(type, 70);
      }

      setTimeout(type, 600);
    });
  })();

  (function () {
    const tabs = document.querySelectorAll(".showcase__tab");
    const panels = document.querySelectorAll(".showcase__panel");
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        tabs.forEach((t) => t.classList.remove("is-active"));
        panels.forEach((p) => p.classList.remove("is-active"));

        tab.classList.add("is-active");
        document
          .querySelector(`.showcase__panel[data-panel="${target}"]`)
          ?.classList.add("is-active");
      });
    });
  })();

  // ✅ LIGHTBOX (substitui o antigo) - abre certificado e post; post mostra botão "Ver postagem"
  (function () {
    const lb = document.getElementById("lightbox");
    const img = document.getElementById("lightboxImg");
    const linkBtn = document.getElementById("lightboxLink");
    if (!lb || !img) return;

    // estado inicial do botão
    if (linkBtn) linkBtn.style.display = "none";

    document.querySelectorAll(".cert-card").forEach((card) => {
      card.addEventListener("click", () => {
        const full = card.dataset.full;
        if (!full) return;

        img.src = full;
        img.alt = card.querySelector("img")?.alt || "Imagem";

        const href = card.dataset.link;

        // ✅ se for post (tem data-link) mostra botão; se for certificado, esconde
        if (linkBtn) {
          if (href) {
            linkBtn.href = href;
            linkBtn.style.display = "inline-block";
          } else {
            linkBtn.href = "#";
            linkBtn.style.display = "none";
          }
        }

        lb.classList.add("is-open");
        lb.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });

    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      img.src = "";

      if (linkBtn) {
        linkBtn.href = "#";
        linkBtn.style.display = "none";
      }
    }

    lb.addEventListener("click", (e) => {
      if (
        e.target.matches('[data-close="true"]') ||
        e.target.classList.contains("lightbox__backdrop")
      ) {
        close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  })();

  (function () {
    const reelsGrid = document.getElementById("reelsGrid");
    const modal = document.getElementById("reelModal");
    const body = document.getElementById("reelModalBody");
    if (!reelsGrid || !modal || !body) return;

    const isOpen = () => modal.classList.contains("is-open");

    function ensureInstagramEmbedScript(cb) {
      if (window.instgrm?.Embeds?.process) {
        cb?.();
        return;
      }

      if (window.__igEmbedLoading) return;
      if (window.__igEmbedLoaded) return;

      window.__igEmbedLoading = true;
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      s.onload = () => {
        window.__igEmbedLoaded = true;
        window.__igEmbedLoading = false;
        cb?.();
      };
      s.onerror = () => {
        window.__igEmbedLoading = false;
      };
      document.body.appendChild(s);
    }

    function processEmbed() {
      window.instgrm?.Embeds?.process?.();
    }

    function openReel(permalink) {
      if (!permalink || permalink.includes("SEU_ID")) {
        alert("Troque SEU_ID pelo link real do Reel no data-permalink.");
        return;
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");

      body.innerHTML = `
        <div class="reelLoader">
          <div class="spinner"></div>
          <p>Carregando vídeo…</p>
        </div>
      `;

      const embed = document.createElement("blockquote");
      embed.className = "instagram-media";
      embed.setAttribute("data-instgrm-permalink", permalink);
      embed.setAttribute("data-instgrm-version", "14");
      embed.style.width = "100%";
      embed.style.margin = "0";

      body.innerHTML = "";
      body.appendChild(embed);

      ensureInstagramEmbedScript(() => {
        processEmbed();
        setTimeout(processEmbed, 300);
        setTimeout(processEmbed, 900);
        setTimeout(processEmbed, 1500);
      });
    }

    function closeReel() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      body.innerHTML = "";
    }

    reelsGrid.addEventListener("click", (e) => {
      const card = e.target.closest(".nf-card[data-permalink]");
      if (!card) return;
      e.preventDefault();

      const permalink = card.getAttribute("data-permalink");
      openReel(permalink);
    });

    modal.addEventListener("click", (e) => {
      if (e.target.matches('[data-close="true"]')) closeReel();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) closeReel();
    });
  })();
})();

window.googleTranslateElementInit = function () {
  if (!document.getElementById("google_translate_element")) return;

  new google.translate.TranslateElement(
    {
      pageLanguage: "pt",
      includedLanguages: "pt,en,zh-CN,es,fr",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    "google_translate_element"
  );
};

(function () {
  "use strict";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  // pega seu carrossel pelo atributo data-carousel
  var carousel = qs("[data-carousel]");
  if (!carousel) return;

  var viewport = qs("[data-viewport]", carousel);
  var track = qs("[data-track]", carousel);
  var prevBtn = qs("[data-prev]", carousel);
  var nextBtn = qs("[data-next]", carousel);

  if (!viewport || !track) return;

  var index = 0;

  function getCards() {
    // ✅ garante que só conta os 6 cards reais que existem no DOM
    return qsa(".nc-card", track).filter(function (el) {
      return el && el.offsetParent !== null; // ignora elementos escondidos (display:none)
    });
  }

  function getStepWidth() {
    var cards = getCards();
    if (!cards.length) return 0;

    // mede o step real (inclui gap) usando a distância entre o 1º e 2º card
    if (cards.length >= 2) {
      var a = cards[0].getBoundingClientRect();
      var b = cards[1].getBoundingClientRect();
      var step = b.left - a.left;
      if (step > 0) return step;
    }

    // fallback: largura do card
    return cards[0].getBoundingClientRect().width;
  }

  function getMaxIndex() {
    // ✅ versão robusta: nunca deixa passar do fim real (evita "card fantasma"/espaço branco)
    var step = getStepWidth();
    if (!step) return 0;

    var maxPx = track.scrollWidth - viewport.clientWidth;
    if (maxPx <= 0) return 0;

    // arredondamento pra baixo pra não "passar 1 passo"
    var max = Math.floor(maxPx / step);

    if (max < 0) max = 0;
    return max;
  }

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function updateButtons() {
    var max = getMaxIndex();
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= max;
  }

  function applyTransform() {
    var step = getStepWidth();
    // se step der 0 (layout ainda não mediu), não tenta mover
    if (!step) {
      track.style.transform = "translateX(0px)";
      return;
    }
    track.style.transform = "translateX(" + (-index * step) + "px)";
  }

  function update() {
    var max = getMaxIndex();
    index = clamp(index, 0, max);
    applyTransform();
    updateButtons();
  }

  function goPrev() {
    index -= 1;
    update();
  }

  function goNext() {
    index += 1;
    update();
  }

  if (prevBtn)
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      goPrev();
    });

  if (nextBtn)
    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      goNext();
    });

  // drag (mouse)
  var isDown = false;
  var startX = 0;
  var startIndex = 0;
  var threshold = 40;

  function onDown(clientX) {
    isDown = true;
    startX = clientX;
    startIndex = index;
  }

  function onMove(clientX) {
    if (!isDown) return;
    var dx = clientX - startX;
    if (Math.abs(dx) < threshold) return;

    index = dx > 0 ? startIndex - 1 : startIndex + 1;
    isDown = false;
    update();
  }

  function onUp() {
    isDown = false;
  }

  viewport.addEventListener("mousedown", function (e) {
    onDown(e.clientX);
  });
  window.addEventListener("mousemove", function (e) {
    onMove(e.clientX);
  });
  window.addEventListener("mouseup", onUp);

  // touch
  viewport.addEventListener(
    "touchstart",
    function (e) {
      if (!e.touches || !e.touches[0]) return;
      onDown(e.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    function (e) {
      if (!e.touches || !e.touches[0]) return;
      onMove(e.touches[0].clientX);
    },
    { passive: true }
  );

  viewport.addEventListener("touchend", onUp);

  window.addEventListener("resize", function () {
    update();
  });

  // espera imagens carregarem (pra medir certo)
  qsa("img", track).forEach(function (img) {
    if (img.complete) return;
    img.addEventListener("load", function () {
      update();
    });
  });

  // também atualiza quando fontes/layout terminarem de ajustar (ajuda em alguns browsers)
  window.addEventListener("load", function () {
    update();
    // 2 rafs pra pegar layout final após render
    requestAnimationFrame(function () {
      requestAnimationFrame(update);
    });
  });

  update();
})();