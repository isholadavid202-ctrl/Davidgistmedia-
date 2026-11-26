/* Shows a slim red "LIVE NOW" bar under the header whenever a live video or live audio link is set. */
(function () {
  if (typeof supabaseClient === "undefined") return;
  if (/\/live(-audio)?\.html$/i.test(location.pathname)) return;
  var DISMISS = "dg_livebar_dismissed";
  var bar = null, lastKey = "";

  async function setting(key) {
    try {
      var r = await supabaseClient.from("settings").select("value").eq("key", key).maybeSingle();
      return r && r.data && r.data.value ? String(r.data.value).trim() : "";
    } catch (e) { return ""; }
  }
  function build(kind) {
    var video = kind === "video";
    var b = document.createElement("div");
    b.id = "dg-livebar";
    b.setAttribute("style", "background:#c8102e;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif");
    b.innerHTML =
      '<div style="max-width:1400px;margin:0 auto;padding:9px 16px;display:flex;align-items:center;gap:12px">' +
      '<span style="display:inline-flex;align-items:center;gap:7px;font-weight:800;font-size:.78rem;letter-spacing:.1em"><i style="width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;animation:dglive 1.3s ease-in-out infinite"></i>' + (video ? "LIVE NOW" : "LIVE AUDIO") + '</span>' +
      '<a href="' + (video ? "live.html" : "live-audio.html") + '" style="flex:1;min-width:0;color:#fff;text-decoration:none;font-weight:700;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (video ? "Davidgistmedia is live. Tap to watch" : "Davidgistmedia is live on audio. Tap to listen") + ' &rsaquo;</a>' +
      '<button type="button" aria-label="Close" style="border:0;background:none;color:#fff;font-size:1.3rem;line-height:1;cursor:pointer;padding:2px 6px">&times;</button></div>';
    b.querySelector("button").addEventListener("click", function () {
      try { sessionStorage.setItem(DISMISS, lastKey); } catch (e) {}
      b.remove(); bar = null;
    });
    return b;
  }
  async function check() {
    var v = await setting("live_stream_url");
    var a = v ? "" : await setting("live_audio_url");
    var key = v ? "video:" + v : a ? "audio:" + a : "";
    lastKey = key;
    var dismissed = ""; try { dismissed = sessionStorage.getItem(DISMISS) || ""; } catch (e) {}
    if (!key || dismissed === key) { if (bar) { bar.remove(); bar = null; } return; }
    if (bar && bar.getAttribute("data-key") === key) return;
    if (bar) bar.remove();
    bar = build(v ? "video" : "audio");
    bar.setAttribute("data-key", key);
    var nav = document.querySelector(".sp-nav");
    if (nav && nav.parentNode) nav.parentNode.insertBefore(bar, nav.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
  }
  var css = document.createElement("style");
  css.textContent = "@keyframes dglive{50%{opacity:.25}}";
  document.head.appendChild(css);
  check();
  setInterval(check, 60000);
})();
