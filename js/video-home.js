(function () {
  var sb = typeof supabaseClient !== "undefined" ? supabaseClient : null;
  var root = document.getElementById("video-home");
  if (!root || !sb) return;

  /* ---------- Styles ---------- */
  var css = `
#video-home[hidden]{display:none !important}
#video-home .cat-section{border-top:1px solid var(--line);margin-top:30px;padding-top:22px}
#video-home .cat-section:first-child{margin-top:30px}

.dgv-row{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 0 6px}
.dgv-row::-webkit-scrollbar{display:none}
.dgv-short{position:relative;display:block;flex:0 0 150px;aspect-ratio:9/16;border-radius:10px;overflow:hidden;background:#111;color:#fff;scroll-snap-align:start}
.dgv-short img,.dgv-short video,.dgv-thumb img,.dgv-thumb video{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover}
.dgv-short .dgv-cap{position:absolute;left:0;right:0;bottom:0;padding:46px 10px 10px;background:linear-gradient(to top,rgba(0,0,0,.88),rgba(0,0,0,0))}
.dgv-short .dgv-cap b{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:.9rem;line-height:1.25;font-weight:700;color:#fff}
.dgv-short .dgv-cap span{display:block;margin-top:4px;font-size:.72rem;color:#cfcfcf}
.dgv-badge{position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:.7rem;padding-left:2px}

.dgv-long-grid{display:grid;grid-template-columns:1fr}
.dgv-lcard{display:flex;flex-direction:column;padding:22px 0 26px;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.dgv-lcard h3{order:1;margin:0 0 16px;padding:0;font-family:var(--font);font-weight:500;font-size:1.45rem;line-height:1.25;letter-spacing:-.005em;color:var(--ink)}
.dgv-thumb{order:2;position:relative;aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:#111}
.dgv-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.dgv-play i{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;font-size:1.2rem;padding-left:3px}
.dgv-lcard .dgv-meta{order:3;margin:12px 0 0;font-size:.85rem;color:var(--muted)}
.dgv-more{display:inline-block;margin:14px 0 0;font-weight:700;font-size:.9rem;color:var(--ink);text-decoration:none}
.dgv-more:hover{text-decoration:underline}

@media(min-width:820px){
  .dgv-short{flex-basis:190px}
  .dgv-long-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 32px}
}`;
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function isHttps(u) { return /^https:\/\//i.test(String(u || "")); }
  function isFile(u) { return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(String(u || "")); }
  function ytId(url) {
    try {
      var u = new URL(url);
      if (u.hostname.indexOf("youtu.be") > -1) return u.pathname.slice(1);
      if (u.hostname.indexOf("youtube.com") > -1) {
        if (u.searchParams.get("v")) return u.searchParams.get("v");
        var m = u.pathname.match(/\/(shorts|embed)\/([\w-]+)/);
        if (m) return m[2];
      }
    } catch (e) {}
    return null;
  }
  function ago(d) {
    var t = new Date(d);
    if (isNaN(t.getTime())) return "";
    var mins = Math.floor((Date.now() - t.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + (mins === 1 ? " min" : " mins") + " ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? " hr" : " hrs") + " ago";
    var days = Math.floor(hrs / 24);
    if (days < 7) return days + (days === 1 ? " day" : " days") + " ago";
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  }
  function viewsText(n) {
    n = Number(n) || 0;
    return n + (n === 1 ? " view" : " views");
  }
  function cover(v) {
    var id = ytId(v.video_url);
    var img = v.thumbnail_url || (id ? "https://img.youtube.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg" : "");
    if (img && isHttps(img)) return '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">';
    if (isFile(v.video_url)) return '<video src="' + esc(v.video_url) + '#t=0.5" preload="metadata" muted playsinline></video>';
    return "";
  }
  function heading(text, href) {
    return '<div class="cat-head"><div class="left"><span class="bar"></span><h2><a href="' + href + '">' + text + '</a></h2></div></div>';
  }

  /* ---------- Render ---------- */
  function render(shorts, longs) {
    var html = "";

    if (shorts.length) {
      html += '<section class="cat-section">' + heading("Short Videos", "videos.html#short") +
        '<div class="dgv-row">' + shorts.map(function (v) {
          return '<a class="dgv-short" href="videos.html#short">' + cover(v) +
            '<span class="dgv-badge"><i class="fa-solid fa-play"></i></span>' +
            '<div class="dgv-cap"><b>' + esc(v.title) + '</b><span>' + viewsText(v.views) + '</span></div></a>';
        }).join("") + '</div></section>';
    }

    if (longs.length) {
      html += '<section class="cat-section">' + heading("Long Videos", "videos.html#long") +
        '<div class="dgv-long-grid">' + longs.map(function (v) {
          return '<a class="dgv-lcard" href="videos.html#long"><h3>' + esc(v.title) + '</h3>' +
            '<div class="dgv-thumb">' + cover(v) + '<div class="dgv-play"><i class="fa-solid fa-play"></i></div></div>' +
            '<div class="dgv-meta">' + ago(v.created_at) + ' | ' + viewsText(v.views) + '</div></a>';
        }).join("") + '</div>' +
        '<a class="dgv-more" href="videos.html#long">More long videos &rsaquo;</a></section>';
    }

    root.innerHTML = html;
  }

  /* Hide the video sections while a news category tab is open */
  function sync() {
    var a = document.querySelector("#tabs button.active");
    root.hidden = !!(a && a.getAttribute("data-cat") !== "all");
  }
  var tabs = document.getElementById("tabs");
  if (tabs) tabs.addEventListener("click", function () { setTimeout(sync, 0); });
  sync();

  /* ---------- Load ---------- */
  sb.from("videos")
    .select("id,title,kind,video_url,thumbnail_url,views,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(30)
    .then(function (r) {
      if (r.error || !r.data) return;
      var all = r.data.filter(function (v) { return isHttps(v.video_url); });
      var shorts = all.filter(function (v) { return v.kind === "short"; }).slice(0, 8);
      var longs = all.filter(function (v) { return v.kind === "long"; }).slice(0, 4);
      render(shorts, longs);
    }, function () {});
})();
