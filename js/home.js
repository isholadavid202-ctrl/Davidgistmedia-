document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("today").textContent = new Date().toLocaleDateString("en-NG", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

const CATEGORIES = ["nigeria", "politics", "entertainment", "sports", "business", "technology", "world", "local"];
let allArticles = [];
let activeCategory = "all";
let searchQuery = "";

function getLikedIds() {
  try {
    return JSON.parse(localStorage.getItem("dg_liked") || "[]");
  } catch {
    return [];
  }
}
function markLiked(id) {
  const liked = getLikedIds();
  if (!liked.includes(id)) {
    liked.push(id);
    localStorage.setItem("dg_liked", JSON.stringify(liked));
  }
}

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
  wireEngageButtons();
}

function engageRowHtml(article) {
  const liked = getLikedIds().includes(article.id);
  return `
    <div class="engage-row" onclick="event.preventDefault(); event.stopPropagation();">
      <button class="engage-btn ${liked ? "liked" : ""}" data-like-id="${article.id}" ${liked ? "disabled" : ""}>
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C.7 8 2 4 6 4c2 0 3.5 1.2 4 2.5C10.5 5.2 12 4 14 4c4 0 5.3 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>
        <span data-like-count="${article.id}">${article.likes || 0}</span>
      </button>
      <button class="engage-btn" data-share-id="${article.id}" data-share-title="${escapeHtml(article.title)}" data-share-slug="${escapeHtml(article.slug)}">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg>
        <span>Share</span>
      </button>
    </div>
  `;
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
          ${engageRowHtml(lead)}
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
              ${engageRowHtml(a)}
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
                  ${engageRowHtml(a)}
                </div>
              </a>
            `).join("")}</div>`}
      </section>
    `;
  }).join("");
}

async function handleLike(id, btn) {
  if (getLikedIds().includes(id)) return;
  markLiked(id);
  btn.classList.add("liked");
  btn.disabled = true;
  const countEl = btn.querySelector(`[data-like-count="${id}"]`);
  const current = allArticles.find((a) => a.id === id);
  if (current) {
    current.likes = (current.likes || 0) + 1;
    if (countEl) countEl.textContent = current.likes;
  }
  await supabaseClient.rpc("increment_likes", { article_id: id }).catch(() => {});
}

function handleShare(id, title, slug) {
  const url = `${window.location.origin}${window.location.pathname.replace("index.html", "")}article.html?slug=${encodeURIComponent(slug)}`;
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard."));
  }
}

function wireEngageButtons() {
  document.querySelectorAll("[data-like-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleLike(btn.dataset.likeId, btn);
    });
  });
  document.querySelectorAll("[data-share-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleShare(btn.dataset.shareId, btn.dataset.shareTitle, btn.dataset.shareSlug);
    });
  });
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

document.getElementById("newsletter-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("newsletter-email");
  const btn = document.getElementById("newsletter-btn");
  const status = document.getElementById("newsletter-status");
  const email = input.value.trim();
  if (!email) return;

  btn.disabled = true;
  status.textContent = "Subscribing...";
  status.style.color = "";

  const { error } = await supabaseClient.from("subscribers").insert({ email });

  btn.disabled = false;

  if (error) {
    if (error.code === "23505") {
      status.textContent = "You're already subscribed.";
    } else {
      status.textContent = "Something went wrong. Try again.";
      status.style.color = "var(--red)";
    }
    return;
  }
  status.textContent = "Thanks for subscribing!";
  input.value = "";
});

loadArticles();
