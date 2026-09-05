document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("today").textContent = new Date().toLocaleDateString("en-NG", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

const CATEGORIES = ["nigeria", "entertainment", "sports", "business"];
let allArticles = [];
let activeCategory = "all";
let searchQuery = "";

async function loadArticles() {
  const { data, error } = await supabaseClient
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    document.getElementById("hero-section").innerHTML =
      `<div class="empty-state">Couldn't load stories right now (${escapeHtml(error.message)}). Check that config.js has your Supabase URL and key set.</div>`;
    return;
  }
  allArticles = data || [];
  renderTicker();
  renderPage();
}

function renderTicker() {
  const track = document.getElementById("ticker-track");
  const headlines = allArticles.slice(0, 8).map((a) => a.title);
  if (headlines.length === 0) {
    track.innerHTML = "<span>No breaking headlines right now — check back soon.</span>";
    return;
  }
  const doubled = [...headlines, ...headlines];
  track.innerHTML = doubled.map((h) => `<span>${escapeHtml(h)}</span>`).join("");
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
  renderHero(filtered);
  renderCategorySections(filtered);
}

function renderHero(list) {
  const section = document.getElementById("hero-section");
  if (list.length === 0) {
    section.innerHTML = `<div class="empty-state">No stories yet${searchQuery ? " matching your search" : ""}. Post your first story from the <a href="admin.html" style="color:var(--red);font-weight:700">newsroom login</a>.</div>`;
    return;
  }
  const lead = list.find((a) => a.featured) || list[0];
  const secondary = list.filter((a) => a.id !== lead.id).slice(0, 4);

  section.innerHTML = `
    <div class="hero-grid">
      <a class="lead-story" href="article.html?slug=${encodeURIComponent(lead.slug)}">
        ${lead.image_url ? `<img src="${escapeHtml(lead.image_url)}" alt="">` : ""}
        <div class="overlay">
          <span class="lead-tag">${escapeHtml(lead.category)}</span>
          <h1>${escapeHtml(lead.title)}</h1>
          <p>${escapeHtml(lead.excerpt || "")}</p>
          <div class="lead-meta">${escapeHtml(lead.author || "Davidgistmedia")} · ${formatDate(lead.published_at)}</div>
        </div>
      </a>
      <div class="secondary-list">
        ${secondary.map((a) => `
          <a class="secondary-item" href="article.html?slug=${encodeURIComponent(a.slug)}">
            ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="">` : `<div style="background:#eee;border-radius:4px"></div>`}
            <div>
              <div class="cat">${escapeHtml(a.category)}</div>
              <h3>${escapeHtml(a.title)}</h3>
              <div class="meta">${formatDate(a.published_at)}</div>
            </div>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderCategorySections(list) {
  const container = document.getElementById("category-sections");
  const cats = activeCategory === "all" ? CATEGORIES : [activeCategory];

  container.innerHTML = cats.map((cat) => {
    const items = list.filter((a) => a.category === cat).slice(0, 6);
    return `
      <section class="cat-section">
        <div class="cat-head">
          <div class="left"><span class="bar"></span><h2>${escapeHtml(cat)}</h2></div>
        </div>
        ${items.length === 0
          ? `<div class="empty-state">No ${escapeHtml(cat)} stories yet.</div>`
          : `<div class="card-grid">${items.map((a) => `
              <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
                ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="">` : ""}
                <div class="body">
                  <div class="cat">${escapeHtml(a.category)}</div>
                  <h3>${escapeHtml(a.title)}</h3>
                  <div class="meta">${formatDate(a.published_at)}</div>
                </div>
              </a>
            `).join("")}</div>`}
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

loadArticles();
