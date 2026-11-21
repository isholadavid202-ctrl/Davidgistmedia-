/* Davidgistmedia news alerts: asks readers once, politely, then keeps them subscribed. */
(function () {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;

  var path = location.pathname;
  var topic = /sport/i.test(path) ? "sports" : /yoruba/i.test(path) ? "yoruba" : "main";
  var yo = topic === "yoruba";
  var COLORS = { main: "#c8102e", sports: "#0b2f6b", yoruba: "#006a3d" };
  var TEXT = yo
    ? { title: "Ìfitónilétí ìròyìn", body: "Mọ̀ ní kíákíá nígbà tí a bá tẹ ìròyìn tuntun jáde.", yes: "Tan án", no: "Rárá", done: "A ti tan ìfitónilétí ìròyìn." }
    : { title: "Get news alerts", body: "Be the first to know when we publish a new story.", yes: "Turn on", no: "Not now", done: "News alerts are on." };
  var DISMISS_KEY = "dg_push_dismiss_" + topic;
  var SYNC_KEY = "dg_push_sync_" + topic;

  function b64ToBytes(s) {
    var pad = "=".repeat((4 - (s.length % 4)) % 4);
    var raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function whenActive(reg) {
    return new Promise(function (resolve) {
      var sw = reg.installing || reg.waiting || reg.active;
      if (!sw || sw.state === "activated") return resolve(reg);
      sw.addEventListener("statechange", function () { if (sw.state === "activated") resolve(reg); });
    });
  }

  async function subscribe() {
    var k = await (await fetch("/api/push/key", { cache: "no-store" })).json();
    if (!k || !k.key) throw new Error("alerts are not set up");
    var reg = await navigator.serviceWorker.register("/push-sw.js?topic=" + topic, { scope: "/push-scope/" + topic + "/" });
    await whenActive(reg);
    var sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(k.key) });
    var res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint, topic: topic })
    });
    if (!res.ok) throw new Error("could not save");
    try { localStorage.setItem(SYNC_KEY, String(Date.now())); } catch (e) {}
  }

  function toast(text) {
    var t = document.createElement("div");
    t.textContent = text;
    t.setAttribute("style", "position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:100000;background:#111;color:#fff;padding:12px 18px;border-radius:999px;font:600 14px/1.2 system-ui,Arial,sans-serif;max-width:90vw;box-shadow:0 6px 20px rgba(0,0,0,.3)");
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  function showBanner() {
    if (document.getElementById("dg-push")) return;
    var color = COLORS[topic];
    var b = document.createElement("div");
    b.id = "dg-push";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", TEXT.title);
    var lift = document.getElementById("dgm-install") ? 96 : 0;
    b.setAttribute("style", "position:fixed;left:12px;right:12px;bottom:calc(" + (12 + lift) + "px + env(safe-area-inset-bottom));z-index:99990;max-width:460px;margin:0 auto;background:#fff;color:#141414;border:1px solid #e3e3e3;border-top:4px solid " + color + ";border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif");
    b.innerHTML =
      '<div style="flex:1;min-width:0"><b style="display:block;font-size:15px;margin:0 0 2px">' + TEXT.title + '</b><span style="display:block;font-size:13px;line-height:1.35;color:#555">' + TEXT.body + '</span></div>' +
      '<button type="button" data-y style="flex:0 0 auto;border:0;border-radius:999px;background:' + color + ';color:#fff;font:700 14px system-ui,Arial,sans-serif;padding:10px 16px;cursor:pointer">' + TEXT.yes + '</button>' +
      '<button type="button" data-n aria-label="' + TEXT.no + '" style="flex:0 0 auto;border:0;background:none;color:#777;font:600 13px system-ui,Arial,sans-serif;padding:8px 4px;cursor:pointer">' + TEXT.no + '</button>';
    document.body.appendChild(b);
    b.querySelector("[data-n]").addEventListener("click", function () {
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
      b.remove();
    });
    b.querySelector("[data-y]").addEventListener("click", async function () {
      var btn = this; btn.disabled = true;
      try {
        var perm = await Notification.requestPermission();
        if (perm === "granted") { await subscribe(); toast(TEXT.done); }
        else { try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {} }
      } catch (e) {}
      b.remove();
    });
  }

  function start() {
    var perm = Notification.permission;
    if (perm === "denied") return;
    if (perm === "granted") {
      /* already allowed: quietly make sure the server still knows about this phone (once a day) */
      var last = 0;
      try { last = Number(localStorage.getItem(SYNC_KEY) || 0); } catch (e) {}
      if (Date.now() - last > 24 * 3600 * 1000) subscribe().catch(function () {});
      return;
    }
    var dismissed = 0;
    try { dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0); } catch (e) {}
    if (dismissed && Date.now() - dismissed < 3 * 24 * 3600 * 1000) return;
    var app = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    setTimeout(showBanner, app ? 7000 : 15000);   /* after the opening screen, and not straight away */
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
