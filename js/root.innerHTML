document.getElementById("year").textContent = new Date().getFullYear();

async function loadArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const root = document.getElementById("article-root");

  if (!slug) {
    root.innerHTML = `<p>No story specified. <a href="index.html" class="back-link">Back to home</a></p>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    root.innerHTML = `<a href="index.html" class="back-link">&larr; Back to home</a><p>That story couldn't be found. It may have been removed.</p>`;
    return;
  }

  document.getElementById("page-title").textContent = `${data.title} | Davidgistmedia`;

  const paragraphs = (data.content || "")
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  root.innerHTML = `
    <a href="index.html" class="back-link">&larr; Back to home</a>
    <div class="cat">${escapeHtml(data.category)}</div>
    <h1>${escapeHtml(data.title)}</h1>
    <div class="meta">${escapeHtml(data.author || "Davidgistmedia")} · ${formatDate(data.published_at)}</div>
    ${data.image_url ? `<img class="hero-img" src="${escapeHtml(data.image_url)}" alt="">` : ""}
    <div class="article-body">${paragraphs}</div>
  `;
}

loadArticle();
