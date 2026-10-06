(function () {
  const CSS = `
  .dg-ticker{display:flex;align-items:stretch;background:var(--red);color:#fff;overflow:hidden;font-size:.82rem}
  .dg-tick-label{flex:0 0 auto;display:flex;align-items:center;gap:7px;background:var(--ink);color:var(--paper);font-weight:800;font-size:.7rem;letter-spacing:.8px;text-transform:uppercase;padding:0 14px}
  .dg-tick-label::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--red);animation:dgpulse 1.4s infinite}
  .dg-tick-view{flex:1;min-width:0;overflow:hidden}
  .dg-tick-track{display:flex;width:max-content;animation:dgscroll 60s linear infinite}
  .dg-tick-track:hover,.dg-tick-track:active{animation-play-state:paused}
  .dg-tick-set{display:flex;align-items:center;flex:0 0 auto;white-space:nowrap}
  .dg-tick-set a{padding:9px 0;font-weight:600}
  .dg-tick-set a:hover{text-decoration:underline}
  .dg-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.65);margin:0 18px;flex:0 0 auto}
  @keyframes dgscroll{to{transform:translateX(-50%)}}
  @keyframes dgpulse{50%{opacity:.25}}
  @media(prefers-reduced-motion:reduce){.dg-tick-track{animation:none}.dg-tick-view{overflow-x:auto}}

  .story-card img{height:auto;aspect-ratio:16/9;object-fit:cover}
  .secondary-item img{object-fit:cover}

  .dg-progress{position:fixed;top:0;left:0;height:3px;width:0;background:var(--red);z-index:9999;transition:width .1s linear}
  .dg-read{white-space:nowrap}
  .article-page .meta a:hover,.article-page .meta a:active{color:var(--red) !important}

  .dg-theme-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--ink);cursor:pointer;padding:0;flex:0 0 auto}
  .dg-theme-btn:hover{border-color:var(--red);color:var(--red)}
  .dg-theme-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  .dg-theme-float{position:absolute;top:8px;right:10px;z-index:6}
  .util-bar .dg-theme-btn{width:30px;height:30px;color:#d6d6d4;border-color:#3a3a37}
  .util-bar .dg-theme-btn svg{width:16px;height:16px}
  .util-bar .wrap{gap:8px}
  .dg-util-left{display:flex;align-items:center;gap:12px;min-width:0}
  .dg-util-right{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-left:auto}

  .dg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease;z-index:10000}
  .dg-overlay.open{opacity:1;visibility:visible}
  .dg-drawer{position:fixed;top:0;left:0;bottom:0;width:min(290px,82vw);background:#161617;color:#ececea;z-index:10001;transform:translateX(-100%);visibility:hidden;transition:transform .28s ease,visibility .28s ease;box-shadow:12px 0 32px rgba(0,0,0,.45);display:flex;flex-direction:column;padding:18px 16px}
  .dg-drawer.open{transform:none;visibility:visible}
  .dg-dr-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #2f2f31}
  .dg-dr-title{font-family:var(--serif);font-weight:700;font-size:1.05rem}
  .dg-dr-close{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid #3a3a37;background:transparent;color:#d6d6d4;cursor:pointer;padding:0}
  .dg-dr-close svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
  .dg-drawer a{display:block;padding:14px 12px;border-radius:6px;color:#d6d6d4;font-weight:700;font-size:.92rem}
  .dg-drawer a:hover,.dg-drawer a:focus-visible{background:rgba(255,255,255,.09);color:#fff}

  html[data-theme="dark"]{--ink:#ececea;--paper:#1b1b1d;--page:#121213;--line:#2f2f31;--muted:#a3a3a0;--near-black:#0a0a0b;--red:#e8344c;--red-dark:#c8102e;color-scheme:dark}
  html[data-theme="dark"] .search-row input,
  html[data-theme="dark"] .newsletter-form input,
  html[data-theme="dark"] .comment-form input,
  html[data-theme="dark"] .comment-form textarea,
  html[data-theme="dark"] .admin-card input,
  html[data-theme="dark"] .admin-card textarea,
  html[data-theme="dark"] .admin-card select{background:#242427;color:var(--ink);border-color:#3a3a3d}
  html[data-theme="dark"] .engage-btn{color:#d6d6d3}
  html[data-theme="dark"] .engage-btn.liked{background:rgba(232,52,76,.16)}
  html[data-theme="dark"] .empty-state{background:#18181a;border-color:#3a3a3d}
  html[data-theme="dark"] .secondary-item > div[style]{background:#2a2a2d !important}
  html[data-theme="dark"] .about-block{border:1px solid var(--line)}
  html[data-theme="dark"] .author-profile .ap-bio{color:#cfcfcc}
  html[data-theme="dark"] .author-profile .ap-initials{background:#3a2412;color:#f5a45d}
  html[data-theme="dark"] .author-profile .ap-title{color:#f5a45d}`;
  const st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function db() { return typeof supabaseClient !== "undefined" ? supabaseClient : null; }

  /* ---------- Dark mode toggle + left-side login menu (all pages) ---------- */
  const MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const BURGER = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function savedTheme() {
    try { return localStorage.getItem("dg_theme"); } catch (e) { return null; }
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0a0a0b" : "#0d0d0d");
    const btn = document.getElementById("dg-theme-btn");
    if (btn) {
      btn.innerHTML = t === "dark" ? SUN : MOON;
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.title = t === "dark" ? "Light mode" : "Dark mode";
    }
  }

  function buildLoginMenu(group, links) {
    const burger = document.createElement("button");
    burger.type = "button";
    burger.className = "dg-theme-btn dg-burger";
    burger.innerHTML = BURGER;
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-expanded", "false");

    const overlay = document.createElement("div");
    overlay.className = "dg-overlay";

    const drawer = document.createElement("aside");
    drawer.className = "dg-drawer";
    drawer.setAttribute("aria-label", "Menu");
    drawer.setAttribute("aria-hidden", "true");

    const head = document.createElement("div");
    head.className = "dg-dr-head";
    head.innerHTML = '<span class="dg-dr-title">Davidgistmedia</span>';
    const close = document.createElement("button");
    close.type = "button";
    close.className = "dg-dr-close";
    close.innerHTML = CLOSE;
    close.setAttribute("aria-label", "Close menu");
    head.appendChild(close);
    drawer.appendChild(head);
    links.forEach((l) => drawer.appendChild(l));

    function setOpen(open) {
      overlay.classList.toggle("open", open);
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", () => setOpen(true));
    close.addEventListener("click", () => setOpen(false));
    overlay.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    group.appendChild(burger);
  }

  function initTheme() {
    let t = savedTheme();
    if (t !== "dark" && t !== "light") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", t);

    if (document.getElementById("dg-theme-btn")) return applyTheme(t);
    const btn = document.createElement("button");
    btn.id = "dg-theme-btn";
    btn.type = "button";
    btn.className = "dg-theme-btn";
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try { localStorage.setItem("dg_theme", next); } catch (e) {}
      applyTheme(next);
    });

    const bar = document.querySelector(".util-bar .wrap");
    const links = bar ? Array.from(bar.querySelectorAll("a")) : [];
    if (bar && links.length) {
      const dateEl = bar.querySelector("#today");
      const left = document.createElement("div");
      left.className = "dg-util-left";
      bar.insertBefore(left, bar.firstChild);
      buildLoginMenu(left, links);
      if (dateEl) left.appendChild(dateEl);

      const right = document.createElement("div");
      right.className = "dg-util-right";
      right.appendChild(btn);
      bar.appendChild(right);
    } else {
      const header = document.querySelector("header.masthead") || document.querySelector("header");
      if (header) {
        btn.classList.add("dg-theme-float");
        header.appendChild(btn);
      } else {
        document.body.appendChild(btn);
        btn.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:9999;background:var(--paper)";
      }
    }
    applyTheme(t);
  }
  initTheme();

  /* ---------- Breaking news ticker (all pages) ---------- */
  async function addTicker() {
    const client = db();
    const header = document.querySelector("header.masthead") || document.querySelector("header");
    if (!client || !header || document.getElementById("dg-ticker")) return;
    const { data, error } = await client
      .from("articles").select("title,slug")
      .order("published_at", { ascending: false }).limit(8);
    if (error || !data || !data.length) return;

    const items = data.map((a) =>
      `<a href="article.html?slug=${encodeURIComponent(a.slug)}">${esc(a.title)}</a>`
    ).join('<span class="dg-dot"></span>');
    const set = items + '<span class="dg-dot"></span>';

    const bar = document.createElement("div");
    bar.id = "dg-ticker";
    bar.className = "dg-ticker";
    bar.innerHTML =
      `<div class="dg-tick-label">Breaking</div>` +
      `<div class="dg-tick-view"><div class="dg-tick-track">` +
      `<div class="dg-tick-set">${set}</div>` +
      `<div class="dg-tick-set" aria-hidden="true">${set}</div>` +
      `</div></div>`;
    header.insertAdjacentElement("afterend", bar);

    const chars = data.reduce((n, a) => n + (a.title || "").length, 0);
    bar.querySelector(".dg-tick-track").style.animationDuration = Math.max(25, chars * 0.12) + "s";
  }
  addTicker();

  /* ---------- Article page extras ---------- */
  const root = document.getElementById("article-root");
  if (!root) return;

  function progress() {
    if (document.getElementById("dg-progress")) return;
    const bar = document.createElement("div");
    bar.id = "dg-progress";
    bar.className = "dg-progress";
    document.body.appendChild(bar);
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const y = window.scrollY || h.scrollTop;
      bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function readingTime() {
    const body = root.querySelector(".article-body");
    const meta = root.querySelector(".meta");
    if (!body || !meta || meta.querySelector(".dg-read")) return;
    const words = (body.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    if (words < 20) return;
    const span = document.createElement("span");
    span.className = "dg-read";
    span.textContent = " · " + Math.max(1, Math.ceil(words / 200)) + " min read";
    meta.appendChild(span);
  }

  progress();
  readingTime();
  new MutationObserver(readingTime).observe(root, { childList: true, subtree: true });
})();
