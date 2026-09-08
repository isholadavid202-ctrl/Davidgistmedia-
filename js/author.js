document.getElementById("year").textContent = new Date().getFullYear();

async function loadAuthorStories() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const root = document.getElementById("author-root");
  const heading = document.getElementById("author-heading");

  if (!name) {
    root.innerHTML = `<div class="empty-state">No author specified.</div>`;
    return;
  }

  heading.textContent = name;
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
