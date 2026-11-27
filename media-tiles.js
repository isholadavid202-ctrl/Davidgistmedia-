/* Davidgistmedia media tiles
   - Live Audio / Live Video tiles (podcasts.html, live-audio.html): tapping Live Audio opens the bottom mini-player
   - "Watch & Listen" section on the home page (live video, live audio, latest podcasts)
   Needs: supabase-client.js and mini-player.js loaded BEFORE this file. */
(function () {
  if (window.__dgMedia) return;
  window.__dgMedia = true;

  var ICON = "/icon-192.png";
  var PLAY = '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
  var state = { video: false, audio: false, playing: false };

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function qsa(sel) { return [].slice.call(document.querySelectorAll(sel)); }
  function day(d) {
    var t = new Date(d);
    return isNaN(t.getTime()) ? "" : t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
  }

  /* ---------- styles ---------- */
  var css = document.createElement("style");
  css.textContent =
    "@keyframes dgmpulse{50%{opacity:.25}}" +
    /* tiles (podcasts.html, live-audio.html) */
    ".dgm-tile{display:block;width:148px;color:inherit;text-decoration:none;text-align:left;background:none;border:0;padding:0;font:inherit}" +
    ".dgm-art{position:relative;display:block;width:148px;height:148px;border-radius:10px;overflow:hidden;background:#c8102e;padding:0;border:0;cursor:pointer;font:inherit;color:#fff;box-shadow:0 2px 10px rgba(0,0,0,.18)}" +
    ".dgm-art img{display:block;width:100%;height:100%;object-fit:cover}" +
    ".dgm-art:focus-visible{outline:3px solid #141414;outline-offset:2px}" +
    ".dgm-ico{position:absolute;right:8px;bottom:8px;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.72);box-shadow:0 2px 8px rgba(0,0,0,.35);display:grid;place-items:center}" +
    ".dgm-ico svg{width:20px;height:20px;fill:#fff}" +
    ".is-playing .dgm-ico{background:#c8102e}" +
    ".dgm-ico .i-pause{display:none}" +
    ".is-playing .dgm-ico .i-play{display:none}" +
    ".is-playing .dgm-ico .i-pause{display:block}" +
    ".dgm-live{position:absolute;left:8px;top:8px;z-index:2;display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:3px;background:#c8102e;color:#fff;font:800 .66rem/1.2 system-ui,Arial,sans-serif;letter-spacing:.08em;box-shadow:0 1px 4px rgba(0,0,0,.35)}" +
    ".dgm-live::before{content:'';width:6px;height:6px;border-radius:50%;background:#fff;animation:dgmpulse 1.4s ease-in-out infinite}" +
    ".dgm-live[hidden]{display:none}" +
    ".dgm-name{display:block;margin-top:8px;font-size:.84rem;font-weight:700;line-height:1.3}" +
    ".dgm-sub{display:block;margin-top:2px;font-size:.74rem;color:var(--muted,var(--h-muted,#666));line-height:1.3}" +
    ".dgm-tile.is-on .dgm-sub{color:#c8102e;font-weight:700}" +
    /* home section */
    ".dgm-sec{margin:34px 0 6px}" +
    ".dgm-head{display:flex;align-items:center;gap:10px;margin:0 0 16px}" +
    ".dgm-head::before{content:'';width:6px;height:1.3em;background:#c8102e;border-radius:2px}" +
    ".dgm-head h2{margin:0;font-size:1.3rem;font-weight:800}" +
    ".dgm-grid{display:grid;grid-template-columns:1fr;gap:14px}" +
    ".dgm-card{position:relative;display:flex;align-items:center;gap:16px;width:100%;min-height:104px;padding:14px 16px;border:0;border-radius:12px;color:#fff;text-align:left;text-decoration:none;cursor:pointer;font:inherit;overflow:hidden}" +
    ".dgm-card.video{background:linear-gradient(135deg,#7a0010,#e30018)}" +
    ".dgm-card.audio{background:linear-gradient(135deg,#161616,#3c3c3c)}" +
    ".dgm-card:focus-visible{outline:3px solid #e8344c;outline-offset:2px}" +
    ".dgm-card .logo{flex:0 0 auto;width:76px;height:76px;border-radius:14px;object-fit:cover;box-shadow:0 4px 14px rgba(0,0,0,.35)}" +
    ".dgm-card .tx{flex:1;min-width:0}" +
    ".dgm-card .tt{display:block;font-size:1.1rem;font-weight:800;line-height:1.25}" +
    ".dgm-card .st{display:block;margin-top:3px;font-size:.84rem;opacity:.88}" +
    ".dgm-card .dgm-live{position:static;display:inline-flex;margin:0 0 6px;box-shadow:none;background:#fff;color:#c8102e}" +
    ".dgm-card .dgm-live::before{background:#c8102e}" +
    ".dgm-card.audio .dgm-live{background:#c8102e;color:#fff}" +
    ".dgm-card.audio .dgm-live::before{background:#fff}" +
    ".dgm-card .go{position:relative;flex:0 0 auto;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid #fff;display:grid;place-items:center}" +
    ".dgm-card .go svg{width:24px;height:24px;fill:#fff}" +
    ".dgm-card .go .i-pause{display:none}" +
    ".dgm-card.is-playing .go .i-play{display:none}" +
    ".dgm-card.is-playing .go .i-pause{display:block}" +
    ".dgm-card.is-playing{box-shadow:0 0 0 3px #e8344c}" +
    ".dgm-ph{display:flex;align-items:center;justify-content:space-between;margin:26px 0 12px}" +
    ".dgm-ph h3{margin:0;font-size:1.05rem;font-weight:800}" +
    ".dgm-ph a{font-size:.85rem;font-weight:700;color:var(--muted,var(--h-muted,#666));text-decoration:none}" +
    ".dgm-ph a:hover{color:#c8102e}" +
    ".dgm-row{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 0 8px;scrollbar-width:none;-webkit-overflow-scrolling:touch}" +
    ".dgm-row::-webkit-scrollbar{display:none}" +
    ".dgm-pod{flex:0 0 138px;scroll-snap-align:start;color:inherit;text-decoration:none;min-width:0}" +
    ".dgm-pod .cv{display:block;width:138px;height:138px;border-radius:8px;object-fit:cover;background:var(--line,var(--h-line,#e3e3e3))}" +
    ".dgm-pod .cv.ph{display:grid;place-items:center;color:#888;font-size:2rem}" +
    ".dgm-pod b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:8px;font-size:.88rem;font-weight:700;line-height:1.3}" +
    ".dgm-pod small{display:block;margin-top:2px;font-size:.74rem;color:var(--muted,var(--h-muted,#666))}" +
    ".dgm-pod:hover b{text-decoration:underline}" +
    ".dgm-msg{color:var(--muted,var(--h-muted,#666));font-size:.9rem;padding:6px 0}" +
    "@media (min-width:640px){.dgm-grid{grid-template-columns:1fr 1fr}.dgm-pod{flex-basis:160px}.dgm-pod .cv{width:160px;height:160px}}" +
    "@media (min-width:900px){.dgm-tile{width:176px}.dgm-art{width:176px;height:176px}.dgm-sec{margin-top:44px}.dgm-head h2{font-size:.82rem;letter-spacing:.07em;text-transform:uppercase}.dgm-head::before{width:4px;height:1.15em}}";
  document.head.appendChild(css);

  /* ---------- tiles ---------- */
  function tilesHtml() {
    return '' +
      '<div class="dgm-tile" data-kind="audio">' +
        '<button type="button" class="dgm-art" data-dglive aria-label="Play Davidgistmedia Live Audio">' +
          '<img src="' + ICON + '" alt=""><span class="dgm-live" hidden>LIVE</span>' +
          '<span class="dgm-ico">' + PLAY + PAUSE + '</span></button>' +
        '<span class="dgm-name">Davidgistmedia Live Audio</span><span class="dgm-sub" data-sub></span>' +
      '</div>' +
      '<a class="dgm-tile" href="live.html" data-kind="video">' +
        '<span class="dgm-art"><img src="' + ICON + '" alt=""><span class="dgm-live" hidden>LIVE</span>' +
        '<span class="dgm-ico">' + PLAY + '</span></span>' +
        '<span class="dgm-name">Davidgistmedia Live (video)</span><span class="dgm-sub" data-sub></span>' +
      '</a>';
  }

  /* ---------- home section ---------- */
  function homeHtml() {
    return '' +
      '<section class="dgm-sec" aria-label="Watch and listen">' +
        '<div class="dgm-head"><h2>Watch &amp; Listen</h2></div>' +
        '<div class="dgm-grid">' +
          '<a class="dgm-card video" href="live.html" data-kind="video">' +
            '<img class="logo" src="' + ICON + '" alt="">' +
            '<span class="tx"><span class="dgm-live" hidden>LIVE</span><span class="tt">Davidgistmedia Live</span><span class="st" data-sub></span></span>' +
            '<span class="go">' + PLAY + '</span></a>' +
          '<button type="button" class="dgm-card audio" data-kind="audio" data-dglive aria-label="Play Davidgistmedia Live Audio">' +
            '<img class="logo" src="' + ICON + '" alt="">' +
            '<span class="tx"><span class="dgm-live" hidden>LIVE</span><span class="tt">Live Audio</span><span class="st" data-sub></span></span>' +
            '<span class="go">' + PLAY + PAUSE + '</span></button>' +
        '</div>' +
        '<div class="dgm-ph"><h3>Podcasts</h3><a href="podcasts.html">See all &rsaquo;</a></div>' +
        '<div class="dgm-row" id="dgm-pods"><p class="dgm-msg">Loading episodes…</p></div>' +
      '</section>';
  }

  async function loadPods() {
    var row = document.getElementById("dgm-pods");
    if (!row) return;
    if (typeof supabaseClient === "undefined") { row.innerHTML = '<p class="dgm-msg">Podcasts are not available right now.</p>'; return; }
    try {
      var r = await supabaseClient.from("podcasts").select("id,title,cover_url,duration,published_at")
        .order("published_at", { ascending: false }).limit(10);
      if (r.error) throw r.error;
      var list = r.data || [];
      if (!list.length) { row.innerHTML = '<p class="dgm-msg">New episodes coming soon.</p>'; return; }
      row.innerHTML = list.map(function (p) {
        var cv = p.cover_url
          ? '<img class="cv" src="' + esc(p.cover_url) + '" alt="" loading="lazy" decoding="async">'
          : '<span class="cv ph">&#127908;</span>';
        return '<a class="dgm-pod" href="podcast.html?id=' + encodeURIComponent(p.id) + '">' + cv +
          '<b>' + esc(p.title) + '</b><small>' + day(p.published_at) + (p.duration ? ' &middot; ' + esc(p.duration) : '') + '</small></a>';
      }).join("");
    } catch (e) {
      row.innerHTML = '<p class="dgm-msg">Couldn\'t load podcasts right now.</p>';
    }
  }

  /* ---------- live status ---------- */
  function paint() {
    qsa('[data-kind="audio"]').forEach(function (el) {
      var on = state.audio;
      var badge = el.querySelector(".dgm-live"); if (badge) badge.hidden = !on;
      var sub = el.querySelector("[data-sub]");
      if (sub) sub.textContent = state.playing ? "Now playing" : on ? "Live now. Tap to listen" : "Off air right now";
      el.classList.toggle("is-on", on || state.playing);
    });
    qsa('[data-kind="video"]').forEach(function (el) {
      var on = state.video;
      var badge = el.querySelector(".dgm-live"); if (badge) badge.hidden = !on;
      var sub = el.querySelector("[data-sub]");
      if (sub) sub.textContent = on ? "Live now. Tap to watch" : "Off air. Watch our videos";
      el.classList.toggle("is-on", on);
    });
  }
  async function setting(key) {
    try {
      var r = await supabaseClient.from("settings").select("value").eq("key", key).maybeSingle();
      return r && r.data && r.data.value ? String(r.data.value).trim() : "";
    } catch (e) { return ""; }
  }
  async function refresh() {
    if (typeof supabaseClient === "undefined") { paint(); return; }
    var v = await setting("live_stream_url");
    var a = await setting("live_audio_url");
    state.video = !!v;
    state.audio = !!a;
    paint();
  }

  /* hide the home section on category pages and while searching */
  function wireVisibility(box) {
    function sync() {
      var h = location.hash.replace("#", "");
      var si = document.getElementById("search-input");
      var searching = si && si.value.trim() !== "";
      box.hidden = !!((h && h !== "sports" && h !== "yoruba") || searching);
    }
    window.addEventListener("hashchange", sync);
    var si = document.getElementById("search-input");
    if (si) si.addEventListener("input", sync);
    var nav = document.getElementById("sp-nav");
    if (nav) nav.addEventListener("click", function () { setTimeout(sync, 0); });
    sync();
  }

  function init() {
    var boxes = qsa(".pc-tiles");
    var home = document.getElementById("dg-media");
    if (!boxes.length && !home) return;
    boxes.forEach(function (b) { b.innerHTML = tilesHtml(); });
    if (home) { home.innerHTML = homeHtml(); loadPods(); wireVisibility(home); }
    paint();
    refresh();
    setInterval(refresh, 60000);
    if (window.DGPlayer && window.DGPlayer.on) {
      window.DGPlayer.on(function (s) {
        state.playing = !!(s.playing && s.item && s.item.live);
        /* live-audio.html has its own player: stop it when the mini-player starts */
        if (state.playing) qsa("#la-player audio").forEach(function (a) { try { a.pause(); } catch (e) {} });
        paint();
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
