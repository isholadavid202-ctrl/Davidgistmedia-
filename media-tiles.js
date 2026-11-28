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
    /* live broadcast on the homepage */
    ".dgm-stage{margin:0 0 28px}" +
    ".dgm-stage-in{display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:radial-gradient(120% 120% at 100% 0%,#5e0b17 0%,#1d0509 55%,#0b0204 100%);color:#fff}" +
    ".dgm-sp{position:relative;aspect-ratio:16/9;background:#000}" +
    ".dgm-sp iframe,.dgm-sp video{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}" +
    ".dgm-sthumb{position:absolute;inset:0;width:100%;height:100%;padding:0;border:0;cursor:pointer;background:#111 center/cover no-repeat;display:block}" +
    ".dgm-sthumb::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),rgba(0,0,0,.05) 55%)}" +
    ".dgm-splay{position:absolute;left:50%;top:50%;z-index:1;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;background:#c8102e;border:3px solid #fff;display:grid;place-items:center;box-shadow:0 6px 22px rgba(0,0,0,.5);transition:transform .15s}" +
    ".dgm-sthumb:hover .dgm-splay{transform:scale(1.07)}" +
    ".dgm-sthumb:focus-visible{outline:3px solid #fff;outline-offset:-6px}" +
    ".dgm-splay svg{width:32px;height:32px;fill:#fff;margin-left:3px}" +
    ".dgm-sinfo{padding:18px 18px 20px}" +
    ".dgm-live2{display:inline-flex;align-self:flex-start;align-items:center;gap:7px;padding:4px 10px;border-radius:3px;background:#c8102e;color:#fff;font:800 .72rem/1.2 system-ui,Arial,sans-serif;letter-spacing:.09em}" +
    ".dgm-live2::before{content:'';width:7px;height:7px;border-radius:50%;background:#fff;animation:dgmpulse 1.4s ease-in-out infinite}" +
    ".dgm-sinfo h2{margin:10px 0 6px;font-size:1.45rem;font-weight:800;line-height:1.2;color:#fff}" +
    ".dgm-sinfo p{margin:0;font-size:.95rem;line-height:1.45;color:rgba(255,255,255,.82)}" +
    ".dgm-sacts{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}" +
    ".dgm-sbtn{display:inline-flex;align-items:center;justify-content:center;padding:11px 18px;border-radius:999px;border:2px solid #fff;background:transparent;color:#fff;font:800 .88rem/1.2 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;text-decoration:none;cursor:pointer}" +
    ".dgm-sbtn.solid{background:#fff;color:#111}" +
    ".dgm-sbtn:hover{opacity:.9}" +
    "body.dgm-has-stage #dg-livebar{display:none}" +
    "@media (min-width:900px){.dgm-stage-in{flex-direction:row;align-items:stretch}.dgm-sp{flex:0 0 66%;aspect-ratio:16/9}.dgm-sinfo{flex:1;display:flex;flex-direction:column;justify-content:center;padding:28px 34px}.dgm-sinfo h2{font-size:1.9rem}}" +
    /* episodes list (Live and Live Audio pages) */
    ".dgm-eps-bar{display:flex;align-items:center;flex-wrap:wrap;gap:12px 16px;margin:0 0 16px}" +
    ".dgm-lbtn{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border:0;border-radius:999px;background:#c8102e;color:#fff;font:800 .95rem system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(200,16,46,.35)}" +
    ".dgm-lbtn:hover{background:#a80d26}" +
    ".dgm-lbtn:focus-visible,.dgm-epplay:focus-visible{outline:3px solid #141414;outline-offset:2px}" +
    ".dgm-lbtn svg{width:20px;height:20px;fill:currentColor}" +
    ".dgm-lbtn .i-pause,.dgm-lbtn .t-pause{display:none}" +
    ".dgm-lbtn.is-playing .i-play,.dgm-lbtn.is-playing .t-play{display:none}" +
    ".dgm-lbtn.is-playing .i-pause{display:block}" +
    ".dgm-lbtn.is-playing .t-pause{display:inline}" +
    ".dgm-count{font-size:.85rem;color:var(--muted,var(--h-muted,#666))}" +
    ".dgm-all{margin-left:auto;font-size:.88rem;font-weight:700;color:var(--muted,var(--h-muted,#666));text-decoration:none}" +
    ".dgm-all:hover{color:#c8102e}" +
    ".dgm-eps{display:grid;grid-template-columns:1fr;gap:12px;padding-bottom:30px}" +
    ".dgm-ep{display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--line,var(--h-line,#e3e3e3));border-radius:12px;background:var(--h-card,var(--card,#f4f4f4))}" +
    ".dgm-ep .th{flex:0 0 auto;display:block}" +
    ".dgm-ep .th img,.dgm-ep .th .ph{display:grid;place-items:center;width:84px;height:84px;border-radius:8px;object-fit:cover;background:var(--line,var(--h-line,#e3e3e3));color:#888;font-size:1.6rem}" +
    ".dgm-ep .bd{flex:1;min-width:0;color:inherit;text-decoration:none}" +
    ".dgm-ep .bd b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:1rem;font-weight:700;line-height:1.3}" +
    ".dgm-ep .bd small{display:block;margin-top:4px;font-size:.8rem;color:var(--muted,var(--h-muted,#666));line-height:1.3}" +
    ".dgm-ep .bd:hover b{text-decoration:underline}" +
    ".dgm-epplay{flex:0 0 auto;width:48px;height:48px;border-radius:50%;border:0;background:#c8102e;color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.25)}" +
    ".dgm-epplay:hover{background:#a80d26}" +
    ".dgm-epplay svg{width:22px;height:22px;fill:currentColor}" +
    ".dgm-epplay .i-pause{display:none}" +
    ".dgm-epplay.is-playing .i-pause{display:block}" +
    ".dgm-pod .cw{position:relative;display:block}" +
    ".dgm-pod .cw a{display:block}" +
    ".dgm-pod .tt{color:inherit;text-decoration:none}" +
    ".dgm-pod .pc-play{width:36px;height:36px;right:6px;bottom:6px}" +
    "@media (max-width:520px){.dgm-count{display:none}}" +
    "@media (min-width:900px){.dgm-eps{grid-template-columns:1fr 1fr;gap:14px 20px}}" +
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

  function subOf(p) { return (p.host || "Davidgistmedia") + (p.duration ? " \u00b7 " + p.duration : ""); }
  function attrs(p) {
    return ' data-dgplay data-id="' + esc(p.id) + '" data-src="' + esc(p.audio_url) + '" data-title="' + esc(p.title) + '" data-sub="' + esc(subOf(p)) + '" data-cover="' + esc(p.cover_url || "") + '"';
  }
  function epRow(p) {
    var link = 'podcast.html?id=' + encodeURIComponent(p.id);
    var cv = p.cover_url
      ? '<img src="' + esc(p.cover_url) + '" alt="" loading="lazy" decoding="async">'
      : '<span class="ph">&#127908;</span>';
    return '<div class="dgm-ep"><a class="th" href="' + link + '" tabindex="-1" aria-hidden="true">' + cv + '</a>' +
      '<a class="bd" href="' + link + '"><b>' + esc(p.title) + '</b><small>' + esc(subOf(p)) + ' &middot; ' + day(p.published_at) + '</small></a>' +
      (p.audio_url ? '<button type="button" class="dgm-epplay"' + attrs(p) + ' aria-label="Play ' + esc(p.title) + '">' + PLAY + PAUSE + '</button>' : '') + '</div>';
  }
  async function loadEpisodes(box) {
    if (typeof supabaseClient === "undefined") { box.innerHTML = '<p class="dgm-msg">Podcasts are not available right now.</p>'; return; }
    box.innerHTML = '<p class="dgm-msg">Loading episodes&hellip;</p>';
    try {
      var r = await supabaseClient.from("podcasts").select("*").order("published_at", { ascending: false }).limit(12);
      if (r.error) throw r.error;
      var rows = r.data || [];
      if (!rows.length) { box.innerHTML = '<p class="dgm-msg">No episodes yet. Check back soon.</p>'; return; }
      var first = rows.filter(function (p) { return p.audio_url; })[0];
      box.innerHTML = '<div class="dgm-eps-bar">' +
        (first ? '<button type="button" class="dgm-lbtn"' + attrs(first) + '>' + PLAY + PAUSE + '<span class="t-play">Play latest episode</span><span class="t-pause">Pause</span></button>' : '') +
        '<span class="dgm-count">' + rows.length + (rows.length === 1 ? ' episode' : ' episodes') + '</span>' +
        '<a class="dgm-all" href="podcasts.html">See all &rsaquo;</a></div>' +
        '<div class="dgm-eps">' + rows.map(epRow).join("") + '</div>';
    } catch (e) {
      box.innerHTML = '<p class="dgm-msg">Couldn\'t load podcasts right now.</p>';
    }
  }

  async function loadPods() {
    var row = document.getElementById("dgm-pods");
    if (!row) return;
    if (typeof supabaseClient === "undefined") { row.innerHTML = '<p class="dgm-msg">Podcasts are not available right now.</p>'; return; }
    try {
      var r = await supabaseClient.from("podcasts").select("*")
        .order("published_at", { ascending: false }).limit(10);
      if (r.error) throw r.error;
      var list = r.data || [];
      if (!list.length) { row.innerHTML = '<p class="dgm-msg">New episodes coming soon.</p>'; return; }
      row.innerHTML = list.map(function (p) {
        var link = 'podcast.html?id=' + encodeURIComponent(p.id);
        var cv = p.cover_url
          ? '<img class="cv" src="' + esc(p.cover_url) + '" alt="" loading="lazy" decoding="async">'
          : '<span class="cv ph">&#127908;</span>';
        return '<div class="dgm-pod"><div class="cw"><a href="' + link + '" tabindex="-1" aria-hidden="true">' + cv + '</a>' +
          (p.audio_url ? '<button type="button" class="pc-play"' + attrs(p) + ' aria-label="Play ' + esc(p.title) + '">' + PLAY + PAUSE + '</button>' : '') + '</div>' +
          '<a class="tt" href="' + link + '"><b>' + esc(p.title) + '</b></a><small>' + day(p.published_at) + (p.duration ? ' &middot; ' + esc(p.duration) : '') + '</small></div>';
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
  function ytId(u) {
    try {
      var x = new URL(u), id = "";
      if (x.hostname.indexOf("youtu.be") > -1) id = x.pathname.slice(1);
      else if (x.hostname.indexOf("youtube.com") > -1) {
        id = x.searchParams.get("v") || "";
        var m = x.pathname.match(/\/(live|embed|shorts)\/([\w-]+)/);
        if (!id && m) id = m[2];
      }
      return /^[\w-]{6,20}$/.test(id) ? id : "";
    } catch (e) { return ""; }
  }
  var stageKey = null;
  function renderStage(v, a) {
    var stage = document.getElementById("dg-live-stage");
    if (!stage) return;
    var key = v + "|" + (a ? 1 : 0);
    if (key === stageKey) return;
    stageKey = key;
    var yt = v ? ytId(v) : "";
    var isFile = v && /^https:\/\/\S+\.(mp4|webm|mov|m4v)(\?\S*)?$/i.test(v);
    if (!yt && !isFile) { stage.innerHTML = ""; document.body.classList.remove("dgm-has-stage"); return; }
    var player = yt
      ? '<button type="button" class="dgm-sthumb" data-yt="' + yt + '" aria-label="Play the live broadcast" style="background-image:url(\'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg\')"><span class="dgm-splay">' + PLAY + '</span></button>'
      : '<video controls playsinline preload="metadata" src="' + esc(v) + '"></video>';
    stage.innerHTML = '<section class="dgm-stage" aria-label="Live broadcast"><div class="dgm-stage-in">' +
      '<div class="dgm-sp">' + player + '</div>' +
      '<div class="dgm-sinfo"><span class="dgm-live2">LIVE NOW</span><h2>Davidgistmedia Live</h2>' +
      '<p>We are live right now. Watch the broadcast as it happens.</p>' +
      '<div class="dgm-sacts"><a class="dgm-sbtn solid" href="live.html">Open the live page</a>' +
      (a ? '<button type="button" class="dgm-sbtn" data-dglive>Listen to audio only</button>' : '') + '</div></div></div></section>';
    document.body.classList.add("dgm-has-stage");
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
    renderStage(v, a);
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
    var eps = document.getElementById("dgm-eps");
    if (!boxes.length && !home && !eps && !document.getElementById("dg-live-stage")) return;
    if (eps) loadEpisodes(eps);
    boxes.forEach(function (b) { b.innerHTML = tilesHtml(); });
    if (home) { home.innerHTML = homeHtml(); loadPods(); wireVisibility(home); }
    var stageBox = document.getElementById("dg-live-stage");
    if (stageBox) {
      wireVisibility(stageBox);
      stageBox.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest(".dgm-sthumb") : null;
        if (!b) return;
        var f = document.createElement("iframe");
        f.src = "https://www.youtube-nocookie.com/embed/" + b.getAttribute("data-yt") + "?autoplay=1&playsinline=1&rel=0";
        f.title = "Davidgistmedia live broadcast";
        f.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
        f.setAttribute("allowfullscreen", "");
        b.parentNode.replaceChild(f, b);
      });
    }
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
