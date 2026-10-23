var yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

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
    ".story-video{display:block;width:100%;border-radius:8px;background:#000;margin:0 0 20px}";
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
