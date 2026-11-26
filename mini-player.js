/* Davidgistmedia audio player: a bar at the bottom of the screen for podcasts and live audio.
   Any button with data-dgplay (a podcast episode) or data-dglive (the live audio stream) starts it. */
(function () {
  if (window.DGPlayer) return;

  var SPEEDS = [1, 1.25, 1.5, 2];
  var ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
  var ICON_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.2" text-anchor="middle" font-size="7.2" font-weight="800" font-family="Arial,sans-serif">10</text></svg>';

  var css = document.createElement("style");
  css.textContent =
    ".cw{position:relative}" +
    ".pc-play{position:absolute;right:8px;bottom:8px;width:40px;height:40px;border-radius:50%;border:0;background:rgba(0,0,0,.72);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 2px 8px rgba(0,0,0,.35);z-index:3}" +
    ".pc-play svg{width:20px;height:20px;fill:currentColor}" +
    ".pc-play .i-pause,.is-playing .i-play{display:none}" +
    ".pc-play.is-playing .i-pause{display:block}" +
    ".pc-play.is-playing{background:#c8102e}" +
    ".pc-play.ctr{left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%);width:62px;height:62px;border:2px solid #fff;background:rgba(110,0,0,.62)}" +
    ".pc-play.ctr svg{width:28px;height:28px}" +
    "#dg-mp{position:fixed;left:0;right:0;bottom:0;z-index:9500;max-width:860px;margin:0 auto;background:#fff;color:#141414;border-radius:16px 16px 0 0;box-shadow:0 -8px 30px rgba(0,0,0,.22);padding:14px 20px calc(14px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;transform:translateY(115%);transition:transform .3s ease}" +
    "#dg-mp.on{transform:none}" +
    "html[data-theme='dark'] #dg-mp{background:#1b1b1d;color:#f0f0f0}" +
    "#dg-mp .t{font-weight:800;font-size:1rem;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:34px}" +
    "#dg-mp .s{font-size:.8rem;color:#777;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    "#dg-mp .x{position:absolute;top:8px;right:10px;width:34px;height:34px;border:0;background:none;font-size:1.6rem;line-height:1;color:inherit;opacity:.55;cursor:pointer}" +
    "#dg-mp .c{display:flex;align-items:center;justify-content:center;gap:36px;margin:10px 0 4px}" +
    "#dg-mp .b{border:0;background:none;color:inherit;cursor:pointer;display:grid;place-items:center;padding:0}" +
    "#dg-mp .rw{width:50px;height:50px}#dg-mp .rw svg{width:46px;height:46px}" +
    "#dg-mp .big{width:70px;height:70px}#dg-mp .big svg{width:58px;height:58px;fill:currentColor}" +
    "#dg-mp .sp{min-width:50px;font-weight:800;font-size:1.2rem}" +
    "#dg-mp .p{display:flex;align-items:center;gap:12px;font-size:.9rem;color:#777}" +
    "#dg-mp .p span{min-width:42px}" +
    "#dg-mp .p span:last-child{text-align:right}" +
    "#dg-mp input[type=range]{flex:1;min-width:0;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;margin:0;outline:none;background:linear-gradient(#c8102e,#c8102e) 0/var(--pct,0%) 100% no-repeat #cfcfcf}" +
    "#dg-mp input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#c8102e;border:0}" +
    "#dg-mp input[type=range]::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#c8102e;border:0}" +
    "#dg-mp.live .rw,#dg-mp.live .sp{visibility:hidden}" +
    "#dg-mp.live input[type=range]{background:#c8102e;pointer-events:none}" +
    "#dg-mp.live .p span:last-child{color:#c8102e;font-weight:800}" +
    "#dg-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:100000;background:#111;color:#fff;padding:12px 18px;border-radius:999px;font:600 14px/1.2 system-ui,Arial,sans-serif;max-width:90vw;box-shadow:0 6px 20px rgba(0,0,0,.3)}";
  document.head.appendChild(css);

  var audio = new Audio();
  audio.preload = "none";
  var cur = null, bar = null, speedIx = 0, listeners = [], lastSave = 0;

  function $(id) { return document.getElementById(id); }
  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60), h = Math.floor(m / 60);
    return h ? h + ":" + ("0" + (m % 60)).slice(-2) + ":" + ("0" + s).slice(-2) : m + ":" + ("0" + s).slice(-2);
  }
  function toast(text) {
    var old = $("dg-toast"); if (old) old.remove();
    var t = document.createElement("div"); t.id = "dg-toast"; t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  function build() {
    if (bar) return bar;
    bar = document.createElement("div");
    bar.id = "dg-mp";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Audio player");
    bar.innerHTML =
      '<button type="button" class="x" aria-label="Close player">&times;</button>' +
      '<div class="t" id="mp-t"></div><div class="s" id="mp-s"></div>' +
      '<div class="c"><button type="button" class="b rw" id="mp-rw" aria-label="Back 10 seconds">' + ICON_BACK + '</button>' +
      '<button type="button" class="b big" id="mp-pp" aria-label="Play or pause"></button>' +
      '<button type="button" class="b sp" id="mp-sp" aria-label="Playback speed">1x</button></div>' +
      '<div class="p"><span id="mp-cur">0:00</span><input type="range" id="mp-seek" min="0" max="1000" value="0" aria-label="Seek"><span id="mp-end">0:00</span></div>';
    document.body.appendChild(bar);
    bar.querySelector(".x").addEventListener("click", close);
    $("mp-pp").addEventListener("click", toggle);
    $("mp-rw").addEventListener("click", function () { audio.currentTime = Math.max(0, audio.currentTime - 10); });
    $("mp-sp").addEventListener("click", function () {
      speedIx = (speedIx + 1) % SPEEDS.length;
      audio.playbackRate = SPEEDS[speedIx];
      $("mp-sp").textContent = SPEEDS[speedIx] + "x";
    });
    $("mp-seek").addEventListener("input", function () {
      if (isFinite(audio.duration) && audio.duration > 0) audio.currentTime = (this.value / 1000) * audio.duration;
    });
    return bar;
  }
  function paintButton() {
    var pp = $("mp-pp"); if (!pp) return;
    pp.innerHTML = audio.paused ? ICON_PLAY : ICON_PAUSE;
  }
  function emit() {
    var playing = !audio.paused;
    var els = document.querySelectorAll("[data-dgplay],[data-dglive],[data-dgstate]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], mine = false;
      if (cur) {
        if (el.hasAttribute("data-dglive") || el.getAttribute("data-dgstate") === "live") mine = !!cur.live;
        else mine = !cur.live && el.getAttribute("data-id") === cur.id;
      }
      el.classList.toggle("is-playing", !!(mine && playing));
    }
    paintButton();
    for (var k = 0; k < listeners.length; k++) { try { listeners[k]({ playing: playing, item: cur }); } catch (e) {} }
  }
  function show() {
    build();
    $("mp-t").textContent = cur.title || "";
    $("mp-s").textContent = cur.sub || "";
    bar.classList.toggle("live", !!cur.live);
    $("mp-end").textContent = cur.live ? "Live" : "0:00";
    bar.classList.add("on");
    document.body.style.paddingBottom = "190px";
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: cur.title || "Davidgistmedia", artist: cur.sub || "Davidgistmedia",
          artwork: cur.cover ? [{ src: cur.cover, sizes: "512x512" }] : []
        });
        navigator.mediaSession.setActionHandler("play", function () { audio.play(); });
        navigator.mediaSession.setActionHandler("pause", function () { audio.pause(); });
        if (!cur.live) {
          navigator.mediaSession.setActionHandler("seekbackward", function () { audio.currentTime = Math.max(0, audio.currentTime - 10); });
          navigator.mediaSession.setActionHandler("seekforward", function () { audio.currentTime = audio.currentTime + 10; });
        }
      } catch (e) {}
    }
  }
  function toggle() {
    if (!cur) return;
    if (audio.paused) audio.play().catch(function () { toast("Couldn't play this audio."); });
    else audio.pause();
  }
  function close() {
    audio.pause();
    if (bar) bar.classList.remove("on");
    document.body.style.paddingBottom = "";
    cur = null;
    emit();
  }
  function countPlay(item) {
    if (item.kind !== "podcast" || !item.id || typeof supabaseClient === "undefined") return;
    try {
      var k = "dg_pod_played", arr = JSON.parse(localStorage.getItem(k) || "[]");
      if (arr.indexOf(item.id) > -1) return;
      arr.push(item.id); localStorage.setItem(k, JSON.stringify(arr));
      supabaseClient.rpc("increment_podcast_plays", { p_id: item.id }).then(function () {}, function () {});
    } catch (e) {}
  }
  function play(item) {
    if (!item || !item.src) return;
    if (cur && cur.src === item.src) { toggle(); show(); return; }
    cur = item;
    audio.src = item.src;
    audio.playbackRate = SPEEDS[speedIx];
    if (!item.live && item.id) {
      var pos = 0;
      try { pos = Number(localStorage.getItem("dg_pos_" + item.id) || 0); } catch (e) {}
      if (pos > 5) audio.addEventListener("loadedmetadata", function once() { audio.removeEventListener("loadedmetadata", once); try { audio.currentTime = pos; } catch (e) {} });
    }
    show();
    audio.play().catch(function () { toast("Couldn't play this audio."); });
    countPlay(item);
  }
  async function setting(key) {
    try {
      var r = await supabaseClient.from("settings").select("value").eq("key", key).maybeSingle();
      return r && r.data && r.data.value ? String(r.data.value).trim() : "";
    } catch (e) { return ""; }
  }
  async function playLive() {
    if (typeof supabaseClient === "undefined") return;
    var v = await setting("live_audio_url");
    var m = v.match(/^audio:\s*(https:\/\/\S+)/i);
    var src = m ? m[1] : (/^https:\/\/\S+$/i.test(v) && !/youtu/i.test(v) ? v : "");
    if (src) {
      play({ id: "live-audio", live: true, src: src, title: "Davidgistmedia Live Audio", sub: "Live now", cover: location.origin + "/icon-512.png" });
    } else if (v) {
      location.href = "live-audio.html";
    } else {
      toast("No live audio right now. Turn on alerts to know when we go live.");
    }
  }

  audio.addEventListener("play", emit);
  audio.addEventListener("pause", emit);
  audio.addEventListener("ended", function () { if (cur && cur.id) { try { localStorage.removeItem("dg_pos_" + cur.id); } catch (e) {} } emit(); });
  audio.addEventListener("error", function () { if (cur) { toast("Couldn't play this audio."); } emit(); });
  audio.addEventListener("loadedmetadata", function () {
    if (!cur || cur.live) return;
    if (isFinite(audio.duration)) $("mp-end").textContent = fmt(audio.duration);
    else { cur.live = true; bar.classList.add("live"); $("mp-end").textContent = "Live"; }
  });
  audio.addEventListener("timeupdate", function () {
    if (!cur || !bar) return;
    $("mp-cur").textContent = fmt(audio.currentTime);
    if (!cur.live && isFinite(audio.duration) && audio.duration > 0) {
      var pct = (audio.currentTime / audio.duration) * 100;
      var seek = $("mp-seek"); seek.value = Math.round(pct * 10);
      seek.style.setProperty("--pct", pct + "%");
      if (cur.id && Date.now() - lastSave > 5000) { lastSave = Date.now(); try { localStorage.setItem("dg_pos_" + cur.id, String(Math.floor(audio.currentTime))); } catch (e) {} }
    }
  });

  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest ? e.target.closest("[data-dgplay],[data-dglive]") : null;
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute("data-dglive")) playLive();
    else play({ id: b.getAttribute("data-id"), src: b.getAttribute("data-src"), title: b.getAttribute("data-title"), sub: b.getAttribute("data-sub"), cover: b.getAttribute("data-cover"), kind: "podcast" });
  }, true);

  window.DGPlayer = { play: play, playLive: playLive, toggle: toggle, close: close, on: function (fn) { listeners.push(fn); }, toast: toast };
})();
