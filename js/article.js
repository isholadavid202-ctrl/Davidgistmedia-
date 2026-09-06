document.getElementById("year").textContent = new Date().getFullYear();

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

let currentArticle = null;

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
  } catch {
    return null;
  }
  return url;
}

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

  currentArticle = data;
  document.getElementById("page-title").textContent = `${data.title} | Davidgistmedia`;

  const paragraphs = (data.content || "")
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  const liked = getLikedIds().includes(data.id);
  const videoEmbed = data.video_url ? toEmbedUrl(data.video_url) : null;

  root.innerHTML = `
    <a href="index.html" class="back-link">&larr; Back to home</a>
    <div class="cat">${escapeHtml(data.category)}</div>
    <h1>${escapeHtml(data.title)}</h1>
    <div class="meta">${escapeHtml(data.author || "Davidgistmedia")} · ${formatDate(data.published_at)}</div>
    ${videoEmbed
      ? `<div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-md);background:#000;margin-bottom:20px">
           <iframe src="${videoEmbed}" title="Story video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
             style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
         </div>`
      : (data.image_url ? `<img class="hero-img" src="${escapeHtml(data.image_url)}" alt="">` : "")}
    <div class="article-body">${paragraphs}</div>
    <div class="engage-row">
      <button class="engage-btn ${liked ? "liked" : ""}" id="like-btn" ${liked ? "disabled" : ""}>
        <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-9.5-9C.7 8 2 4 6 4c2 0 3.5 1.2 4 2.5C10.5 5.2 12 4 14 4c4 0 5.3 4 3.5 8-2.5 4.5-9.5 9-9.5 9z"/></svg>
        <span id="like-count">${data.likes || 0}</span> Like
      </button>
      <button class="engage-btn" id="share-btn">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg>
        Share
      </button>
    </div>

    <div class="comments-section">
      <h3 id="comments-heading">Comments</h3>
      <form id="comment-form" class="comment-form">
        <input id="comment-name" placeholder="Your name (optional)" maxlength="60">
        <textarea id="comment-text" placeholder="Write a comment..." required maxlength="1000"></textarea>
        <button class="engage-btn" type="submit" id="comment-submit-btn">Post comment</button>
        <p class="admin-status" id="comment-status"></p>
      </form>
      <div id="comments-list"></div>
    </div>
  `;

  document.getElementById("like-btn").addEventListener("click", handleLike);
  document.getElementById("share-btn").addEventListener("click", handleShare);
  document.getElementById("comment-form").addEventListener("submit", handleCommentSubmit);
  loadComments();
}

async function loadComments() {
  const list = document.getElementById("comments-list");
  const { data, error } = await supabaseClient
    .from("comments")
    .select("*")
    .eq("article_id", currentArticle.id)
    .order("created_at", { ascending: false });

  document.getElementById("comments-heading").textContent = `Comments${data && data.length ? ` (${data.length})` : ""}`;

  if (error) {
    list.innerHTML = `<p class="admin-status error">Couldn't load comments.</p>`;
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No comments yet — be the first to say something.</p>`;
    return;
  }

  list.innerHTML = data.map((c) => `
    <div class="comment-item">
      <div class="comment-head"><strong>${escapeHtml(c.name || "Anonymous")}</strong><span class="meta">${formatDate(c.created_at)}</span></div>
      <p>${escapeHtml(c.content)}</p>
    </div>
  `).join("");
}

async function handleCommentSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("comment-name");
  const textInput = document.getElementById("comment-text");
  const btn = document.getElementById("comment-submit-btn");
  const status = document.getElementById("comment-status");

  const content = textInput.value.trim();
  if (!content) return;

  btn.disabled = true;
  status.textContent = "Posting...";
  status.className = "admin-status";

  const { error } = await supabaseClient.from("comments").insert({
    article_id: currentArticle.id,
    name: nameInput.value.trim() || "Anonymous",
    content,
  });

  btn.disabled = false;

  if (error) {
    status.textContent = "Couldn't post your comment. Try again.";
    status.className = "admin-status error";
    return;
  }

  status.textContent = "";
  textInput.value = "";
  loadComments();
}

async function handleLike() {
  if (!currentArticle || getLikedIds().includes(currentArticle.id)) return;
  markLiked(currentArticle.id);
  const btn = document.getElementById("like-btn");
  btn.classList.add("liked");
  btn.disabled = true;
  currentArticle.likes = (currentArticle.likes || 0) + 1;
  document.getElementById("like-count").textContent = currentArticle.likes;
  await supabaseClient.rpc("increment_likes", { article_id: currentArticle.id }).catch(() => {});
}

function handleShare() {
  if (!currentArticle) return;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: currentArticle.title, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard."));
  }
}

loadArticle();
