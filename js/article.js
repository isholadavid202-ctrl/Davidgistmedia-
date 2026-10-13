document.getElementById("year").textContent = new Date().getFullYear();

/* Date and time in Nigeria time. formatWhen gives text such as "10 Oct 2026, 8:15 PM";
   whenHtml gives the same inside a <time> tag with a small clock icon, for the byline. */
function nigeriaParts(d) {
  const t = new Date(d);
  if (isNaN(t.getTime())) return null;
  const day = t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  const clock = t.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" })
    .replace(/am|pm/i, (m) => m.toUpperCase());
  return { t, day, clock };
}
function formatWhen(d) {
  const p = nigeriaParts(d);
  return p ? p.day + ", " + p.clock : "";
}
function whenHtml(d) {
  const p = nigeriaParts(d);
  if (!p) return "";
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  return `<time datetime="${p.t.toISOString()}">${icon}${p.day}, ${p.clock}</time>`;
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

function getLikedIds() {
  try {
    return JSON.parse(localStorage.getItem("dg_liked_v2") || "[]");
  } catch {
    return [];
  }
}
function markLiked(id) {
  const liked = getLikedIds();
  if (!liked.includes(id)) {
    liked.push(id);
    localStorage.setItem("dg_liked_v2", JSON.stringify(liked));
  }
}
function unmarkLiked(id) {
  const liked = getLikedIds().filter((x) => x !== id);
  localStorage.setItem("dg_liked_v2", JSON.stringify(liked));
}

let currentArticle = null;
let likeBusy = false;

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

/* ---- Search / Google News details for each story ---- */
function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function addSeo(data) {
  const site = "https://davidgistmedia.onrender.com";
  const url = `${site}/article.html?slug=${encodeURIComponent(data.slug)}`;
  const plain = (data.content || "").replace(/\s+/g, " ").trim();
  const description = (data.excerpt && data.excerpt.trim()) || plain.slice(0, 160);
  const authorName = data.author || "Davidgistmedia";

  // Canonical link
  let canon = document.head.querySelector('link[rel="canonical"]');
  if (!canon) {
    canon = document.createElement("link");
    canon.setAttribute("rel", "canonical");
    document.head.appendChild(canon);
  }
  canon.setAttribute("href", url);

  // Description and sharing tags
  setMeta("name", "description", description);
  setMeta("property", "og:title", data.title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", "article");
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", data.image_url);
  setMeta("name", "twitter:card", "summary_large_image");

  // NewsArticle details for Google
  const author = authorName === "Davidgistmedia"
    ? { "@type": "Organization", name: "Davidgistmedia", url: site + "/" }
    : { "@type": "Person", name: authorName, url: `${site}/author.html?name=${encodeURIComponent(authorName)}` };

  const ld = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: (data.title || "").slice(0, 110),
    description: description,
    datePublished: data.published_at,
    dateModified: data.updated_at || data.published_at,
    author: author,
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Davidgistmedia",
      url: site + "/",
      logo: { "@type": "ImageObject", url: site + "/icon-512.png" }
    }
  };
  if (data.image_url) ld.image = [data.image_url];
  if (data.category) ld.articleSection = data.category;

  const old = document.getElementById("article-ld");
  if (old) old.remove();
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.id = "article-ld";
  s.textContent = JSON.stringify(ld).replace(/</g, "\\u003c");
  document.head.appendChild(s);
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
  addSeo(data);

  const paragraphs = (data.content || "")
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  const liked = getLikedIds().includes(data.id);
  const videoEmbed = data.video_url ? toEmbedUrl(data.video_url) : null;

  // Reading time (about 200 words a minute)
  const words = String(data.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(words / 200));
  const authorName = data.author || "Davidgistmedia";

  root.innerHTML = `
    <a href="index.html" class="back-link">&larr; Back to home</a>
    <div class="cat">${escapeHtml(data.category)}</div>
    <h1>${escapeHtml(data.title)}</h1>
    <div class="meta byline">
      <div class="byline-author">By <a href="author.html?name=${encodeURIComponent(authorName)}" style="color:inherit;font-weight:700">${escapeHtml(authorName)}</a></div>
      <div class="byline-info">
        ${whenHtml(data.published_at)}
        <span class="by-bar" aria-hidden="true"></span>
        <span>${readMins} min read</span>
      </div>
    </div>
    ${videoEmbed
      ? `<div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-md);background:#000;margin-bottom:20px">
           <iframe src="${videoEmbed}" title="Story video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
             style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
         </div>`
      : (data.image_url ? `<img class="hero-img" src="${escapeHtml(data.image_url)}" alt="">` : "")}
    <div class="article-body">${paragraphs}</div>
    <div id="related-section"></div>
    <div class="engage-row">
      <button class="engage-btn ${liked ? "liked" : ""}" id="like-btn" aria-pressed="${liked}">
        <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
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
        <input id="comment-website" name="website" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
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
  loadRelated();
}

/* ---- Related Stories: each card has like, comment and share, like the homepage ---- */
const ICON_LIKE = '<svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>';
const ICON_COMMENT = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
const ICON_SHARE = '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg>';

const relatedData = {};
const relatedBusy = new Set();

function relatedEngageHtml(a, commentCount) {
  const liked = getLikedIds().map(String).includes(String(a.id));
  return `
    <div class="engage-row" onclick="event.preventDefault(); event.stopPropagation();">
      <button class="engage-btn ${liked ? "liked" : ""}" data-r-like="${escapeHtml(String(a.id))}" aria-pressed="${liked}">
        ${ICON_LIKE}<span data-like-count>${a.likes || 0}</span>
      </button>
      <button class="engage-btn" data-r-comment="${escapeHtml(a.slug)}" aria-label="Comments">
        ${ICON_COMMENT}<span>${commentCount || 0}</span>
      </button>
      <button class="engage-btn" data-r-share="${escapeHtml(a.slug)}" data-r-title="${escapeHtml(a.title)}">
        ${ICON_SHARE}<span>Share</span>
      </button>
    </div>`;
}

async function handleRelatedLike(idStr, btn) {
  const row = relatedData[idStr];
  if (!row || relatedBusy.has(idStr)) return;
  relatedBusy.add(idStr);

  const countEl = btn.querySelector("[data-like-count]");
  const wasLiked = getLikedIds().map(String).includes(idStr);
  const before = row.likes || 0;
  const after = wasLiked ? Math.max(before - 1, 0) : before + 1;

  // Show the change straight away, and undo it if Supabase says no.
  btn.classList.toggle("liked", !wasLiked);
  btn.setAttribute("aria-pressed", String(!wasLiked));
  if (countEl) countEl.textContent = after;

  let failed = false;
  try {
    const { error } = await supabaseClient.rpc(
      wasLiked ? "decrement_likes" : "increment_likes",
      { article_id: row.id }
    );
    if (error) failed = true;
  } catch (e) {
    failed = true;
  }

  if (failed) {
    btn.classList.toggle("liked", wasLiked);
    btn.setAttribute("aria-pressed", String(wasLiked));
    if (countEl) countEl.textContent = before;
    alert("Couldn't save that. Please try again.");
  } else {
    row.likes = after;
    if (wasLiked) unmarkLiked(row.id); else markLiked(row.id);
  }
  relatedBusy.delete(idStr);
}

function handleRelatedShare(title, slug) {
  const url = location.origin + "/article.html?slug=" + encodeURIComponent(slug);
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard."));
  }
}

function wireRelated(container) {
  container.querySelectorAll("[data-r-like]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleRelatedLike(btn.dataset.rLike, btn);
    });
  });
  container.querySelectorAll("[data-r-comment]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = "article.html?slug=" + encodeURIComponent(btn.dataset.rComment);
    });
  });
  container.querySelectorAll("[data-r-share]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleRelatedShare(btn.dataset.rTitle, btn.dataset.rShare);
    });
  });
}

async function loadRelated() {
  const container = document.getElementById("related-section");
  const { data, error } = await supabaseClient
    .from("articles")
    .select("id,slug,title,image_url,category,published_at,likes")
    .eq("category", currentArticle.category)
    .neq("id", currentArticle.id)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) {
    container.innerHTML = "";
    return;
  }

  // Comment counts for these few stories
  const counts = {};
  try {
    const res = await supabaseClient
      .from("comments")
      .select("article_id")
      .in("article_id", data.map((a) => a.id));
    (res.data || []).forEach((c) => {
      counts[c.article_id] = (counts[c.article_id] || 0) + 1;
    });
  } catch (e) {}

  data.forEach((a) => { relatedData[String(a.id)] = a; });

  container.innerHTML = `
    <section class="cat-section">
      <div class="cat-head">
        <div class="left"><span class="bar"></span><h2>Related Stories</h2></div>
      </div>
      <div class="card-grid">
        ${data.map((a) => `
          <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
            ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" loading="lazy" decoding="async">` : ""}
            <div class="body">
              <div class="cat">${escapeHtml(a.category)}</div>
              <h3>${escapeHtml(a.title)}</h3>
              <div class="meta" title="${formatWhen(a.published_at)}">${timeAgo(a.published_at)}</div>
              ${relatedEngageHtml(a, counts[a.id])}
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
  wireRelated(container);
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
      <div class="comment-head"><strong>${escapeHtml(c.name || "Anonymous")}</strong><span class="meta">${formatWhen(c.created_at)}</span></div>
      <p>${escapeHtml(c.content)}</p>
    </div>
  `).join("");
}

async function handleCommentSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("comment-name");
  const textInput = document.getElementById("comment-text");
  const honeypot = document.getElementById("comment-website");
  const btn = document.getElementById("comment-submit-btn");
  const status = document.getElementById("comment-status");

  if (honeypot && honeypot.value.trim()) {
    // Likely a bot. Pretend it worked, but don't actually post it.
    textInput.value = "";
    status.textContent = "";
    return;
  }

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
  if (!currentArticle || likeBusy) return;
  likeBusy = true;

  const id = currentArticle.id;
  const btn = document.getElementById("like-btn");
  const countEl = document.getElementById("like-count");
  const wasLiked = getLikedIds().includes(id);
  const before = currentArticle.likes || 0;
  const after = wasLiked ? Math.max(before - 1, 0) : before + 1;

  // Show the change straight away, and undo it if Supabase says no.
  btn.classList.toggle("liked", !wasLiked);
  btn.setAttribute("aria-pressed", String(!wasLiked));
  countEl.textContent = after;

  let failed = false;
  try {
    const { error } = await supabaseClient.rpc(
      wasLiked ? "decrement_likes" : "increment_likes",
      { article_id: id }
    );
    if (error) failed = true;
  } catch (e) {
    failed = true;
  }

  if (failed) {
    btn.classList.toggle("liked", wasLiked);
    btn.setAttribute("aria-pressed", String(wasLiked));
    countEl.textContent = before;
    alert("Couldn't save that. Please try again.");
  } else {
    currentArticle.likes = after;
    if (wasLiked) unmarkLiked(id); else markLiked(id);
  }
  likeBusy = false;
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
