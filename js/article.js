var yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

/* Safe fallback so this file works even before the page script defines escapeHtml */
var escapeHtml = window.escapeHtml || function (str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};

/* Share-button, comment-box and story-picture styles live here so this file is all you need to change */
(function () {
  var st = document.createElement("style");
  st.textContent =
    ".share-row{display:flex;flex-wrap:wrap;gap:14px;margin:0 0 22px}" +
    ".share-row a{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:1.05rem;text-decoration:none;background:var(--paper)}" +
    ".share-row a:hover{border-color:var(--ink);color:var(--red)}" +
    ".comment-gate{border:1px solid var(--line);border-radius:10px;padding:18px;margin:0 0 20px;background:var(--paper)}" +
    ".comment-gate p{margin:0 0 12px;color:var(--muted);font-size:.95rem}" +
    ".comment-gate p strong{color:var(--ink);font-size:1.05rem}" +
    ".comment-gate a.engage-btn{display:inline-flex;align-items:center;text-decoration:none}" +
    ".comment-as{margin:0 0 10px;color:var(--muted);font-size:.92rem}" +
    ".comment-as a{text-decoration:underline;text-underline-offset:3px}" +
    ".story-photo{margin:22px 0}" +
    ".story-photo img{display:block;width:100%;height:auto;border-radius:8px}" +
    ".story-video{display:block;width:100%;border-radius:8px;background:#000;margin:0 0 20px}" +
    /* Main story picture with the red caption bar under it */
    ".hero-fig{margin:0 0 20px}" +
    ".hero-fig .hero-img{display:block;width:100%;margin:0 !important}" +
    ".hero-fig.has-cap .hero-img{border-bottom-left-radius:0 !important;border-bottom-right-radius:0 !important}" +
    ".photo-cap{display:block;box-sizing:border-box;margin:0;padding:14px 20px;background:var(--red,#bb1919);color:#fff;font-size:1.05rem;font-weight:700;line-height:1.3;border-radius:0 0 8px 8px}" +
    "@media(max-width:520px){.photo-cap{padding:12px 16px;font-size:1rem}}";
  document.head.appendChild(st);
})();

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

/* ---- Verification badges (data-driven, from the verified_authors table) ---- */
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

/* The badge drawn next to an author's name (empty if the author is not verified) */
function badgeFor(name) {
  const b = DGB.get(name);
  return b ? DGB.svg(b, 18) : "";
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

/* ---- Extra pictures and uploaded video ---- */
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
function figureHtml(url) {
  return `<figure class="story-photo"><img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async"></figure>`;
}
/* Puts the extra pictures between the paragraphs, then any left over at the end */
function bodyWithPictures(paragraphs, pictures) {
  if (!pictures.length) return paragraphs.join("");
  const out = [];
  const gap = Math.max(2, Math.floor(paragraphs.length / (pictures.length + 1)));
  let next = 0;
  paragraphs.forEach((p, i) => {
    out.push(p);
    if (next < pictures.length && (i + 1) % gap === 0) out.push(figureHtml(pictures[next++]));
  });
  while (next < pictures.length) out.push(figureHtml(pictures[next++]));
  return out.join("");
}

/* The main story picture, with a red caption bar under it when the story has a caption */
function heroHtml(data) {
  const cap = String(data.image_caption || "").trim();
  return `<figure class="hero-fig${cap ? " has-cap" : ""}">` +
    `<img class="hero-img" src="${escapeHtml(data.image_url)}" alt="${escapeHtml(cap)}">` +
    (cap ? `<figcaption class="photo-cap">${escapeHtml(cap)}</figcaption>` : "") +
    `</figure>`;
}

/* ---- Share row: Facebook, X, email, Telegram, WhatsApp ---- */
function shareRowHtml(data) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(data.title || "");
  return `
    <div class="share-row" aria-label="Share this story">
      <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="https://x.com/intent/post?text=${title}&url=${url}&via=Davidgistmedian" target="_blank" rel="noopener noreferrer" aria-label="Share on X"><i class="fa-brands fa-x-twitter"></i></a>
      <a href="mailto:?subject=${title}&body=${title}%0A${url}" aria-label="Share by email"><i class="fa-solid fa-envelope"></i></a>
      <a href="https://t.me/share/url?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram"><i class="fa-brands fa-telegram"></i></a>
      <a href="https://wa.me/?text=${title}%20${url}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
    </div>`;
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
  setMeta("name", "twitter:site", "@Davidgistmedian");

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
  const allPictures = [data.image_url].concat(pictureList(data.images)).filter(isHttpsUrl);
  if (allPictures.length) ld.image = allPictures;
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

  // Fetch the story and the verified-author list at the same time,
  // so the badge is ready before the byline is drawn
  const [{ data, error }] = await Promise.all([
    supabaseClient.from("articles").select("*").eq("slug", slug).single(),
    DGB.load()
  ]);

  if (error || !data) {
    root.innerHTML = `<a href="index.html" class="back-link">&larr; Back to home</a><p>That story couldn't be found. It may have been removed.</p>`;
    return;
  }

  currentArticle = data;
  document.getElementById("page-title").textContent = `${data.title} | Davidgistmedia`;
  addSeo(data);

  const paraList = (data.content || "")
    .split(/\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${escapeHtml(p)}</p>`);
  const paragraphs = bodyWithPictures(paraList, pictureList(data.images));

  const liked = getLikedIds().includes(data.id);

  // Video: an uploaded file plays in a normal player, a link (such as YouTube) is embedded
  const videoUrl = data.video_url || "";
  const videoIsFile = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(videoUrl) && isHttpsUrl(videoUrl);
  const videoEmbed = videoUrl && !videoIsFile ? toEmbedUrl(videoUrl) : null;
  const fileVideoBlock = videoIsFile
    ? `<video class="story-video" controls playsinline preload="metadata"${data.image_url ? ` poster="${escapeHtml(data.image_url)}"` : ""} src="${escapeHtml(videoUrl)}"></video>`
    : "";
  const embedBlock = videoEmbed
    ? `<div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-md);background:#000;margin-bottom:20px">
         <iframe src="${escapeHtml(videoEmbed)}" title="Story video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
           style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
       </div>`
    : "";
  const videoBlock = fileVideoBlock || embedBlock;

  // Reading time (about 200 words a minute)
  const words = String(data.content || "").trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(words / 200));
  const authorName = data.author || "Davidgistmedia";

  // "Updated" date: only shown if the story was edited at least an hour after it was published
  let updatedHtml = "";
  if (data.updated_at && data.published_at) {
    const pub = nigeriaParts(data.published_at);
    const upd = nigeriaParts(data.updated_at);
    if (pub && upd && upd.t - pub.t > 3600000 && upd.day !== pub.day) {
      updatedHtml = `<span class="by-bar" aria-hidden="true"></span><span><em>Updated ${upd.day}</em></span>`;
    }
  }

  root.innerHTML = `
    <a href="index.html" class="back-link">&larr; Back to home</a>
    <div class="cat">${escapeHtml(data.category)}</div>
    <h1>${escapeHtml(data.title)}</h1>
    <div class="meta byline">
      <div class="byline-author">By <a href="author.html?name=${encodeURIComponent(authorName)}" style="color:inherit;font-weight:700">${escapeHtml(authorName)}</a>${badgeFor(authorName)}</div>
      <div class="byline-info">
        ${whenHtml(data.published_at)}
        ${updatedHtml}
        <span class="by-bar" aria-hidden="true"></span>
        <span>${readMins} min read</span>
      </div>
    </div>
    ${videoBlock
      ? videoBlock
      : (data.image_url ? heroHtml(data) : "")}
    ${shareRowHtml(data)}
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
      <div id="comment-box"></div>
      <div id="comments-list"></div>
    </div>
  `;

  document.getElementById("like-btn").addEventListener("click", handleLike);
  document.getElementById("share-btn").addEventListener("click", handleShare);
  renderCommentBox();
  loadComments();
  loadRelated();
}

/* ---- Related Stories: same look as the homepage cards (photo, headline, time | category) ---- */
async function loadRelated() {
  const container = document.getElementById("related-section");
  const { data, error } = await supabaseClient
    .from("articles")
    .select("id,slug,title,image_url,category,published_at")
    .eq("category", currentArticle.category)
    .neq("id", currentArticle.id)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) {
    container.innerHTML = "";
    return;
  }

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
            </div>
          </a>
        `).join("")}
      </div>
    </section>
  `;
}

/* ---- Who is signed in (comments need an account) ---- */
async function getUser() {
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data && data.session ? data.session.user : null;
  } catch (e) {
    return null;
  }
}
function savedName(user) {
  const m = (user && user.user_metadata) || {};
  return String(m.full_name || m.name || "").trim();
}

async function renderCommentBox() {
  const box = document.getElementById("comment-box");
  if (!box) return;
  const user = await getUser();

  if (!user) {
    box.innerHTML = `
      <div class="comment-gate">
        <p><strong>Join the conversation</strong></p>
        <p>Sign in or create a free account to leave a comment. After you sign in, come back to this story.</p>
        <a class="engage-btn" href="profile.html">Sign in or create account</a>
      </div>`;
    return;
  }

  const name = savedName(user);
  box.innerHTML = `
    <form id="comment-form" class="comment-form">
      <input id="comment-website" name="website" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" aria-hidden="true">
      ${name
        ? `<p class="comment-as">Commenting as <strong>${escapeHtml(name)}</strong> &middot; <a href="profile.html">Change</a></p>`
        : `<input id="comment-name" placeholder="Your name (shown with your comment)" maxlength="60" required>`}
      <textarea id="comment-text" placeholder="Write a comment..." required maxlength="1000"></textarea>
      <button class="engage-btn" type="submit" id="comment-submit-btn">Post comment</button>
      <p class="admin-status" id="comment-status"></p>
    </form>`;
  document.getElementById("comment-form").addEventListener("submit", handleCommentSubmit);
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

function commentStatus(el, text, kind) {
  if (!el) return;
  el.textContent = text || "";
  el.className = "admin-status" + (kind ? " " + kind : "");
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
    commentStatus(status, "Comment posted.", "ok");
    if (textInput) textInput.value = "";
    return;
  }

  const user = await getUser();
  if (!user) {
    commentStatus(status, "Please sign in to comment.", "error");
    renderCommentBox();
    return;
  }

  const name = String(nameInput ? nameInput.value : savedName(user)).replace(/\s+/g, " ").trim();
  const content = String(textInput ? textInput.value : "").trim();

  if (!name) { commentStatus(status, "Please enter your name.", "error"); return; }
  if (!content) { commentStatus(status, "Please write a comment first.", "error"); return; }
  if (content.length > 1000) { commentStatus(status, "Comments can be up to 1000 characters.", "error"); return; }

  btn.disabled = true;
  commentStatus(status, "Posting...");

  let res = await supabaseClient
    .from("comments")
    .insert({ article_id: currentArticle.id, name: name, content: content, user_id: user.id });

  // If the comments table has no user_id column, post without it
  if (res.error && /user_id|column|schema cache/i.test(res.error.message || "")) {
    res = await supabaseClient
      .from("comments")
      .insert({ article_id: currentArticle.id, name: name, content: content });
  }

  btn.disabled = false;

  if (res.error) {
    commentStatus(status, "We couldn't post your comment. Please try again.", "error");
    return;
  }

  if (textInput) textInput.value = "";
  commentStatus(status, "Comment posted.", "ok");
  loadComments();
}

/* ---- Like button: tap to like, tap again to remove your like ---- */
async function handleLike() {
  if (!currentArticle || likeBusy) return;
  likeBusy = true;

  const btn = document.getElementById("like-btn");
  const countEl = document.getElementById("like-count");
  const id = currentArticle.id;
  const wasLiked = getLikedIds().includes(id);
  const before = Number(countEl.textContent) || 0;
  const after = Math.max(0, before + (wasLiked ? -1 : 1));

  // Show the change straight away
  countEl.textContent = String(after);
  btn.classList.toggle("liked", !wasLiked);
  btn.setAttribute("aria-pressed", String(!wasLiked));

  try {
    const { error } = await supabaseClient.from("articles").update({ likes: after }).eq("id", id);
    if (error) throw error;
    if (wasLiked) unmarkLiked(id); else markLiked(id);
    currentArticle.likes = after;
  } catch (err) {
    // Put everything back if it could not be saved
    countEl.textContent = String(before);
    btn.classList.toggle("liked", wasLiked);
    btn.setAttribute("aria-pressed", String(wasLiked));
  }

  likeBusy = false;
}

/* ---- Share button: opens the phone's share sheet, or copies the link ---- */
async function handleShare() {
  const url = window.location.href;
  const title = (currentArticle && currentArticle.title) || document.title;

  if (navigator.share) {
    try {
      await navigator.share({ title: title, url: url });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }

  const btn = document.getElementById("share-btn");
  try {
    await navigator.clipboard.writeText(url);
    if (btn) {
      const old = btn.innerHTML;
      btn.textContent = "Link copied";
      setTimeout(() => { btn.innerHTML = old; }, 1800);
    }
  } catch (err) {
    window.prompt("Copy this link:", url);
  }
}

loadArticle();
