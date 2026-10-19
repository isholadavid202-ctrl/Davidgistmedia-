/* Year (footer) and today's date (top strip). Safe if either is missing. */
(function () {
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  var t = document.getElementById("today");
  if (t) t.textContent = new Date().toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
})();

/* Styles for the top story slideshow live here so this file is all you need to change */
(function () {
  var st = document.createElement("style");
  st.textContent = `
    .hero-grid .lead-story.lead-multi .lead-slides{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .hero-grid .lead-story.lead-multi .lead-slides::-webkit-scrollbar{display:none}
    .hero-grid .lead-story.lead-multi .lead-slides img{flex:0 0 100% !important;scroll-snap-align:start}
    .hero-grid .lead-story.lead-multi .overlay{pointer-events:none}
    .hero-grid .lead-story .lead-count{position:absolute;top:12px;right:12px;z-index:2;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font-size:.8rem;font-weight:700}
    .lead-count svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
  `;
  document.head.appendChild(st);
})();

/* Date and time of upload, shown in Nigeria time (for example: 10 Oct 2026, 8:15 PM) */
function formatWhen(d) {
  try {
    const t = new Date(d);
    if (isNaN(t.getTime())) return "";
    const day = t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
    const time = t.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" })
      .replace(/am|pm/i, (m) => m.toUpperCase());
    return day + ", " + time;
  } catch (e) {
    return "";
  }
}

/* Short time like the BBC: "39 mins ago", "7 hrs ago", "2 days ago".
   Stories older than a week show the date (for example: 10 Oct 2026). */
function timeAgo(d) {
  try {
    const t = new Date(d);
    if (isNaN(t.getTime())) return "";
    const ms = Date.now() - t.getTime();
    if (ms < 0) return "Just now";
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + (mins === 1 ? " min" : " mins") + " ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? " hr" : " hrs") + " ago";
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + (days === 1 ? " day" : " days") + " ago";
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  } catch (e) {
    return "";
  }
}

/* ---- Verification badges (data-driven) ---- */
const DGB = (() => {
  const map = {};
  let loaded = null;
  const key = (n) => String(n || "").trim().toLowerCase();
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function load() {
    if (loaded) return loaded;
    loaded = (async () => {
      try {
        const { data } = await supabaseClient.from("verified_authors").select("name,title,kind");
        (data || []).forEach((r) => { map[key(r.name)] = r; });
      } catch (e) {}
    })();
    return loaded;
  }
  function get(name) { return map[key(name)] || null; }
  function svg(b, size) {
    const color = b.kind === "owner" ? "#f97316" : "#1d9bf0";
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const r = 9.2 + 1.1 * Math.cos(8 * a);
      pts.push((12 + r * Math.cos(a)).toFixed(2) + "," + (12 + r * Math.sin(a)).toFixed(2));
    }
    const t = esc(b.title);
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" role="img" aria-label="' + t +
      '" style="display:inline-block;vertical-align:-3px;margin-left:5px"><title>' + t + '</title>' +
      '<polygon points="' + pts.join(" ") + '" fill="' + color + '"/>' +
      '<path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  return { load, get, svg };
})();

function authorHtml(name) {
  const n = name || "Davidgistmedia";
  const b = DGB.get(n);
  return escapeHtml(n) + (b ? DGB.svg(b, 16) : "");
}

/* ---- Pictures for the top story ---- */
function isHttpsUrl(u) {
  return /^https:\/\//i.test(String(u || ""));
}
function pictureList(v) {
  let list = v;
  if (typeof list === "string") {
    try { list = JSON.parse(list); } catch (e) { list = []; }
  }
  return Array.isArray(list) ? list.filter(isHttpsUrl) : [];
}
/* The main picture first, then the extra ones (up to 6 in the slideshow) */
function leadPictures(a) {
  return [a.image_url].concat(pictureList(a.images)).filter(isHttpsUrl).slice(0, 6);
}

const CATEGORIES = ["nigeria", "politics", "entertainment", "sports", "business", "technology", "world", "local"];
let allArticles = [];
let commentCounts = {};
let activeCategory = "all";
let searchQuery = "";

/* The homepage only needs these fields (not the full story text) */
const LIST_COLUMNS = "id,slug,title,excerpt,image_url,category,author,published_at,likes,featured";
const CACHE_KEY = "dg_home_cache_v1";

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return c && Array.isArray(c.articles) ? c.articles : null;
  } catch {
    return null;
  }
}
function writeCache(list) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), articles: list }));
  } catch {}
}

/* ---- Comment counts ---- */
async function loadCommentCounts() {
  try {
    const { data } = await supabaseClient.from("comments").select("article_id");
    commentCounts = {};
    (data || []).forEach((c) => {
      commentCounts[c.article_id] = (commentCounts[c.article_id] || 0) + 1;
    });
  } catch (e) {}
}

/* Grey placeholder rows, shown only when the page arrives with no stories in it */
function showPlaceholders() {
  const bar = (w, mb) => `<div style="height:14px;background:var(--line);width:${w};margin-bottom:${mb}px"></div>`;
  const row = `
    <div style="display:grid;grid-template-columns:38% 1fr;gap:16px;padding:16px 0;border-bottom:1px solid var(--line)">
      <div style="aspect-ratio:16/9;background:var(--line)"></div>
      <div style="padding-top:4px">${bar("100%", 10)}${bar("80%", 10)}${bar("55%", 0)}</div>
    </div>`;
  document.getElementById("hero-section").innerHTML = row.repeat(5);
}

async function fetchStories() {
  // Ask for the extra pictures too. If that column isn't there yet, ask without it.
  let res = await supabaseClient
    .from("articles")
    .select(LIST_COLUMNS + ",images")
    .order("published_at", { ascending: false })
    .limit(100);
  if (res.error && /images/i.test(res.error.message || "")) {
    res = await supabaseClient
      .from("articles")
      .select(LIST_COLUMNS)
      .order("published_at", { ascending: false })
      .limit(100);
  }
  return res;
}

async function loadArticles() {
  // 1. If we have stories saved from the last visit, show them instantly
  const cached = readCache();
  if (cached && cached.length) {
    allArticles = cached;
    renderPage();
  } else if (!document.getElementById("hero-section").children.length) {
    // Nothing from the server either, so show grey placeholders
    showPlaceholders();
  }

  // 2. Ask for fresh stories (headline fields only, newest 100)
  const { data, error } = await fetchStories();

  if (error) {
    if (!cached || !cached.length) {
      document.getElementById("hero-section").innerHTML =
        `<div class="empty-state">Couldn't load stories right now (${escapeHtml(error.message)}). Check that config.js has your Supabase URL and key set.</div>`;
    }
    return;
  }

  // 3. Show the fresh stories, save them for next time, then fill in counts and badges
  const fresh = data || [];
  const changed = JSON.stringify(fresh) !== JSON.stringify(cached || []);
  allArticles = fresh;
  writeCache(fresh);
  if (changed || !cached) renderPage();
  Promise.all([DGB.load(), loadCommentCounts()]).then(renderPage);
}

function getFiltered() {
  const q = searchQuery.trim().toLowerCase();
  return allArticles.filter((a) => {
    const matchesCat = activeCategory === "all" || a.category === activeCategory;
    const matchesQuery = !q || a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
}

function renderPage() {
  const filtered = getFiltered();
  renderTrending();
  renderHero(filtered);
  renderCategorySections(filtered);
}

function renderTrending() {
  const container = document.getElementById("trending-section");
  if (!container) return;
  const top = [...allArticles].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
  const hasEngagement = top.some((a) => (a.likes || 0) > 0);

  if (top.length === 0 || !hasEngagement) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <section class="cat-section">
      <div class="cat-head">
        <div class="left"><span class="bar"></span><h2>Trending</h2></div>
      </div>
      <div class="card-grid">
        ${top.map((a) => `
          <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
            ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" loading="lazy" decoding="async">` : ""}
            <div class="body">
              <div class="cat">${escapeHtml(a.category)}</div>
              <h3>${escapeHtml(a.title)}</h3>
              <div class="meta" title="${formatWhen(a.published_at)}">${timeAgo(a.published_at)}</div>
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

/* Keeps the "1/4" counter in step while the reader swipes through the pictures */
function wireSlides(section) {
  section.querySelectorAll(".lead-slides").forEach((slides) => {
    const counter = slides.parentElement.querySelector(".lead-count span");
    if (!counter) return;
    slides.addEventListener("scroll", () => {
      const w = slides.clientWidth || 1;
      counter.textContent = String(Math.round(slides.scrollLeft / w) + 1);
    }, { passive: true });
  });
}

function renderHero(list) {
  const section = document.getElementById("hero-section");
  if (list.length === 0) {
    section.innerHTML = `<div class="empty-state">No stories yet${searchQuery ? " matching your search" : ""}. Post your first story from the <a href="admin.html" style="color:var(--red);font-weight:700">newsroom login</a>.</div>`;
    return;
  }
  const lead = list.find((a) => a.featured) || list[0];
  const secondary = list.filter((a) => a.id !== lead.id).slice(0, 4);

  // One picture shows as before. Several pictures become a slideshow the reader can swipe.
  const pics = leadPictures(lead);
  const multi = pics.length > 1;
  const camera = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg>';
  const leadMedia = multi
    ? `<div class="lead-slides">${pics.map((u, i) =>
        `<img src="${escapeHtml(u)}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
      ).join("")}</div>
      <div class="lead-count" aria-hidden="true">${camera}<span>1</span>/${pics.length}</div>`
    : (lead.image_url ? `<img src="${escapeHtml(lead.image_url)}" alt="" fetchpriority="high" decoding="async">` : "");

  section.innerHTML = `
    <div class="hero-grid">
      <a class="lead-story${multi ? " lead-multi" : ""}" href="article.html?slug=${encodeURIComponent(lead.slug)}">
        ${leadMedia}
        <div class="overlay">
          <span class="lead-tag">${escapeHtml(lead.category)}</span>
          <h1>${escapeHtml(lead.title)}</h1>
          <p>${escapeHtml(lead.excerpt || "")}</p>
          <div class="lead-meta">${authorHtml(lead.author)} · ${formatWhen(lead.published_at)}</div>
        </div>
      </a>
      <div class="secondary-list">
        ${secondary.map((a) => `
          <a class="secondary-item" href="article.html?slug=${encodeURIComponent(a.slug)}">
            ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" loading="lazy" decoding="async">` : `<div style="background:#eee;border-radius:4px"></div>`}
            <div>
              <div class="cat">${escapeHtml(a.category)}</div>
              <h3>${escapeHtml(a.title)}</h3>
              <div class="meta" title="${formatWhen(a.published_at)}">${timeAgo(a.published_at)}</div>
            </div>
          </a>
        `).join("")}
      </div>
    </div>
  `;
  wireSlides(section);
}

function storyRow(a) {
  return `
    <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
      ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" loading="lazy" decoding="async">` : ""}
      <div class="body">
        <div class="cat">${escapeHtml(a.category)}</div>
        <h3>${escapeHtml(a.title)}</h3>
        <div class="meta" title="${formatWhen(a.published_at)}">${timeAgo(a.published_at)}</div>
      </div>
    </a>`;
}

function storyFeature(a) {
  return `
    <a class="story-card feature" href="article.html?slug=${encodeURIComponent(a.slug)}">
      ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" loading="lazy" decoding="async">` : ""}
      <div class="body">
        <div class="cat">${escapeHtml(a.category)}</div>
        <h3>${escapeHtml(a.title)}</h3>
        ${a.excerpt ? `<p class="excerpt">${escapeHtml(a.excerpt)}</p>` : ""}
        <div class="meta" title="${formatWhen(a.published_at)}">${timeAgo(a.published_at)}</div>
      </div>
    </a>`;
}

function renderCategorySections(list) {
  const container = document.getElementById("category-sections");
  const cats = activeCategory === "all" ? CATEGORIES : [activeCategory];

  container.innerHTML = cats.map((cat) => {
    const items = list.filter((a) => a.category === cat).slice(0, 6);
    return `
      <section class="cat-section">
        <div class="cat-head">
          <div class="left"><span class="bar"></span><h2><a href="#${cat}">${escapeHtml(cat)}</a></h2></div>
        </div>
        ${items.length === 0
          ? `<div class="empty-state">No ${escapeHtml(cat)} stories yet.</div>`
          : `<div class="card-grid">${storyFeature(items[0])}${items.slice(1).map(storyRow).join("")}</div>`}
      </section>
    `;
  }).join("");
}

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.cat;
  renderPage();
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  searchQuery = document.getElementById("search-input").value;
  renderPage();
});
document.getElementById("search-input").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderPage();
});

// Open the category from the link (for example index.html#nigeria)
(function () {
  const cat = window.location.hash.replace("#", "");
  if (!cat) return;
  const btn = document.querySelector('#tabs button[data-cat="' + cat + '"]');
  if (!btn) return;
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = cat;
})();

// When a footer or section link (for example #sports) is tapped on the homepage, open that section
window.addEventListener("hashchange", function () { location.reload(); });

loadArticles();
