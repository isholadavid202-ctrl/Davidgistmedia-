(function () {
  const CEO = {
    name: "Ishola David",
    title: "Founder & CEO, Davidgistmedia",
    photo: "Snapchat-1872033241%20(1)_1748345725348.jpg",
    bio: "Ishola David is the Founder and CEO of Davidgistmedia, a Nigerian news and entertainment platform. He writes and publishes stories on entertainment, sports, business and breaking news."
  };

  const CSS = `
  .dg-ticker{display:flex;align-items:stretch;background:var(--red);color:#fff;overflow:hidden;font-size:.82rem}
  .dg-tick-label{flex:0 0 auto;display:flex;align-items:center;gap:7px;background:var(--ink);color:#fff;font-weight:800;font-size:.7rem;letter-spacing:.8px;text-transform:uppercase;padding:0 14px}
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

  .dg-author-box{display:flex;gap:16px;align-items:center;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:18px;margin:26px 0;box-shadow:var(--shadow-sm)}
  .dg-ab-photo{width:72px;height:72px;border-radius:50%;object-fit:cover;flex:0 0 auto;border:3px solid #f97316}
  .dg-ab-init{display:flex;align-items:center;justify-content:center;background:#fff3e8;color:#c2570c;font-family:var(--serif);font-size:1.5rem;font-weight:700}
  .dg-ab-role{color:#c2570c;font-weight:800;font-size:.7rem;letter-spacing:.4px;text-transform:uppercase}
  .dg-ab-name{font-family:var(--serif);font-weight:700;font-size:1.1rem}
  .dg-ab-name:hover{color:var(--red)}
  .dg-author-box p{font-size:.9rem;line-height:1.55;color:#3d3d3a;margin-top:4px}
  @media(max-width:480px){.dg-author-box{flex-direction:column;text-align:center}}`;
  const st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fmt(d) {
    try { return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return ""; }
  }
  function db() { return typeof supabaseClient !== "undefined" ? supabaseClient : null; }

  const BADGE = (() => {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 9.2 + 1.1 * Math.cos(8 * a);
      pts.push((12 + r * Math.cos(a)).toFixed(2) + "," + (12 + r * Math.sin(a)).toFixed(2));
    }
    return `<svg viewBox="0 0 24 24" width="16" height="16" style="display:inline-block;vertical-align:-3px;margin-left:5px"><title>${CEO.title}</title><polygon points="${pts.join(" ")}" fill="#f97316"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  })();

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
  const slug = new URLSearchParams(location.search).get("slug");

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

  let extrasDone = false;
  async function addExtras() {
    if (extrasDone) return;
    const body = root.querySelector(".article-body");
    if (!body) return;
    extrasDone = true;
    const client = db();
    if (!client || !slug) return;

    const { data: art } = await client
      .from("articles").select("slug,category,author").eq("slug", slug).limit(1);
    const a = art && art[0];
    if (!a) return;

    const name = a.author || "Davidgistmedia";
    const isCeo = name.trim().toLowerCase() === CEO.name.toLowerCase();
    const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    const box = document.createElement("div");
    box.className = "dg-author-box";
    const initEl = document.createElement("div");
    initEl.className = "dg-ab-photo dg-ab-init";
    initEl.textContent = initials;
    let photoEl = initEl;
    if (isCeo) {
      photoEl = document.createElement("img");
      photoEl.className = "dg-ab-photo";
      photoEl.alt = name;
      photoEl.src = CEO.photo;
      photoEl.onerror = () => photoEl.replaceWith(initEl);
    }
    const text = document.createElement("div");
    text.innerHTML =
      `<div class="dg-ab-role">${isCeo ? esc(CEO.title) : "Written by"}</div>` +
      `<a class="dg-ab-name" href="author.html?name=${encodeURIComponent(name)}">${esc(name)}</a>${isCeo ? BADGE : ""}` +
      `<p>${isCeo ? esc(CEO.bio) : "See more stories from " + esc(name) + "."}</p>`;
    box.appendChild(photoEl);
    box.appendChild(text);
    body.insertAdjacentElement("afterend", box);

    const { data: rel } = await client
      .from("articles").select("title,slug,image_url,category,published_at")
      .eq("category", a.category).neq("slug", slug)
      .order("published_at", { ascending: false }).limit(3);
    if (rel && rel.length) {
      const sec = document.createElement("section");
      sec.className = "cat-section";
      sec.innerHTML =
        `<div class="cat-head"><div class="left"><span class="bar"></span><h2>Related stories</h2></div></div>` +
        `<div class="card-grid">` +
        rel.map((r) => `
          <a class="story-card" href="article.html?slug=${encodeURIComponent(r.slug)}">
            ${r.image_url ? `<img src="${esc(r.image_url)}" alt="" loading="lazy">` : ""}
            <div class="body">
              <div class="cat">${esc(r.category)}</div>
              <h3>${esc(r.title)}</h3>
              <div class="meta">${fmt(r.published_at)}</div>
            </div>
          </a>`).join("") +
        `</div>`;
      root.appendChild(sec);
    }
  }

  progress();
  const run = () => { readingTime(); addExtras(); };
  run();
  new MutationObserver(run).observe(root, { childList: true, subtree: true });
})();
