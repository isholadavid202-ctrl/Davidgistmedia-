document.getElementById("year").textContent = new Date().getFullYear();

const BADGE_NAME = "Ishola David";
const BADGE_TITLE = "Founder & CEO, Davidgistmedia";
const BADGE_SVG = (() => {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 9.2 + 1.1 * Math.cos(8 * a);
    pts.push((12 + r * Math.cos(a)).toFixed(2) + "," + (12 + r * Math.sin(a)).toFixed(2));
  }
  return `<svg viewBox="0 0 24 24" width="22" height="22" role="img" aria-label="${BADGE_TITLE}" style="display:inline-block;vertical-align:-3px;margin-left:6px"><title>${BADGE_TITLE}</title><polygon points="${pts.join(" ")}" fill="#f97316"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
})();

async function loadAuthorStories() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const root = document.getElementById("author-root");
  const heading = document.getElementById("author-heading");

  if (!name) {
    root.innerHTML = `<div class="empty-state">No author specified.</div>`;
    return;
  }

  const isCeo = name.trim().toLowerCase() === BADGE_NAME.toLowerCase();
  heading.innerHTML = escapeHtml(name) + (isCeo ? BADGE_SVG : "");
  document.getElementById("page-title").textContent = `${name} | Davidgistmedia`;

  const { data, error } = await supabaseClient
    .from("articles")
    .select("*")
    .eq("author", name)
    .order("published_at", { ascending: false });

  if (error) {
    root.innerHTML = `<div class="empty-state">Couldn't load stories right now.</div>`;
    return;
  }
  if (!data || data.length === 0) {
    root.innerHTML = `<div class="empty-state">No stories from ${escapeHtml(name)} yet.</div>`;
    return;
  }

  root.innerHTML = `
    <div class="card-grid">
      ${data.map((a) => `
        <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
          ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="">` : ""}
          <div class="body">
            <div class="cat">${escapeHtml(a.category)}</div>
            <h3>${escapeHtml(a.title)}</h3>
            <div class="meta">${formatDate(a.published_at)}</div>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

loadAuthorStories();
