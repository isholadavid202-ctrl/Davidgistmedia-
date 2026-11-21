/* Davidgistmedia news alerts: this small worker only shows notifications.
   The browser wakes it when the server sends an alert. It then asks the server for the newest story. */
var TOPIC = new URL(self.location.href).searchParams.get("topic") || "main";
var ICON = TOPIC === "sports" ? "/icon-sport-192.png" : TOPIC === "yoruba" ? "/icon-yoruba-192.png" : "/icon-192.png";

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (event) {
  event.waitUntil((async function () {
    var d = null;
    try { if (event.data) d = event.data.json(); } catch (e) {}
    if (!d || !d.title) {
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 8000);
        var r = await fetch("/api/push/latest?topic=" + encodeURIComponent(TOPIC) + "&t=" + Date.now(), { cache: "no-store", signal: ctrl.signal });
        clearTimeout(timer);
        if (r.ok) d = await r.json();
      } catch (e) {}
    }
    if (!d || !d.title) d = { title: "Davidgistmedia", body: "A new story has just been published.", url: "/" };
    var opts = {
      body: d.body || "",
      icon: ICON,
      badge: ICON,
      tag: d.url || "dg-news",
      renotify: true,
      data: { url: d.url || "/" }
    };
    if (d.image) opts.image = d.image;
    await self.registration.showNotification(d.title, opts);
  })());
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil((async function () {
    var list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      try {
        if (c.url && c.url.indexOf(self.location.origin) === 0 && "navigate" in c) {
          await c.navigate(url);
          return c.focus();
        }
      } catch (e) {}
    }
    return self.clients.openWindow(url);
  })());
});
