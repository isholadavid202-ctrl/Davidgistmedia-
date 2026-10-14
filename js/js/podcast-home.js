(function () {
  var box = document.getElementById("podcast-home");
  if (!box) return;

  /* Styles for this section only */
  var st = document.createElement("style");
  st.textContent =
    ".ph-sec{border-top:2px solid var(--ink);padding-top:16px;margin:0 0 8px}" +
    ".ph-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}" +
    ".ph-head h2{font-family:var(--serif);font-size:1.5rem}" +
    ".ph-head a{color:var(--ink);font-size:.9rem;text-decoration:underline;text-underline-offset:3px}" +
    ".ph-item{display:grid;grid-template-columns:104px 1fr;gap:0 16px;padding:16px 0;border-bottom:1px solid var(--line)}" +
    ".ph-cover{width:104px;height:104px;object-fit:cover;background:var(--line);display:block}" +
    ".ph-cover.ph{display:grid;place-items:center;color:var(--muted);font-size:1.7rem}" +
    ".ph-item h3{font-family:var(--serif);font-size:1.08rem;line-height:1.22;font-weight:600;margin:0 0 6px}" +
    ".ph-meta{color:var(--muted);font-size:.85rem;margin:0}" +
    ".ph-item audio{grid-column:1 / -1;width:100%;margin-top:12px}" +
    "@media(min-width:820px){.ph-list{display:grid;grid-template-columns:repeat(3,1fr);gap:0 24px}" +
    ".ph-item{grid-template-columns:1fr;border-bottom:0;padding:16px 0 20px}" +
    ".ph-cover{width:100%;height:auto;aspect-ratio:1/1;margin-bottom:12px}}";
  document.head.appendChild(st);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function day(d) {
    var t = new Date(d);
    if (isNaN(t.getTime())) return "";
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  }
  function item(p) {
    return '<article class="ph-item">' +
      (p.cover_url
        ? '<img class="ph-cover" src="' + esc(p.cover_url) + '" alt="" loading="lazy" decoding="async">'
        : '<div class="ph-cover ph"><i class="fa-solid fa-microphone"></i></div>') +
      '<div><h3>' + esc(p.title) + '</h3>' +
      '<p class="ph-meta">' + day(p.published_at) + (p.duration ? ' | ' + esc(p.duration) : '') + '</p></div>' +
      '<audio controls preload="none" src="' + esc(p.audio_url) + '"></audio>' +
    '</article>';
  }

  async function load() {
    try {
      var res = await supabaseClient.from("podcasts")
        .select("id,title,audio_url,cover_url,duration,published_at")
        .order("published_at", { ascending: false }).limit(3);
      if (res.error || !res.data || !res.data.length) return;

      box.innerHTML =
        '<section class="ph-sec">' +
          '<div class="ph-head"><h2>Podcasts</h2><a href="podcasts.html">See all</a></div>' +
          '<div class="ph-list">' + res.data.map(item).join("") + '</div>' +
        '</section>';

      /* Only one episode plays at a time */
      var players = box.querySelectorAll("audio");
      players.forEach(function (p) {
        p.addEventListener("play", function () {
          players.forEach(function (o) { if (o !== p) o.pause(); });
        });
      });
    } catch (e) {}
  }

  /* Show the section on Home only, hide it when a category tab is chosen */
  var tabs = document.getElementById("tabs");
  if (tabs) {
    tabs.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (!b) return;
      box.style.display = b.dataset.cat === "all" ? "" : "none";
    });
  }

  load();
})();
