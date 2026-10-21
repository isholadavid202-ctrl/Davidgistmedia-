const CACHE = "dgm-v4";
const WAIT_MS = 3000;      // how long to wait for the server before showing the saved copy
const MAX_ENTRIES = 200;   // how many saved files to keep on the phone

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/"])).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Keeps the saved files from growing forever (the home page copy is never removed)
function trim() {
  return caches.open(CACHE).then((c) =>
    c.keys().then((keys) => {
      const old = keys.filter((k) => new URL(k.url).pathname !== "/");
      const extra = old.length - MAX_ENTRIES;
      if (extra > 0) return Promise.all(old.slice(0, extra).map((k) => c.delete(k)));
    })
  );
}

function save(req, res) {
  if (!res || !res.ok || res.type === "opaque") return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).then(trim).catch(() => {});
}

// Pages: ask the server, but if it takes longer than WAIT_MS (for example because
// it is waking up), show the copy saved on the phone and keep updating it behind the scenes.
function pageRequest(req) {
  return new Promise((resolve) => {
    let answered = false;
    const answer = (r) => {
      if (!answered && r) {
        answered = true;
        resolve(r);
      }
    };

    const timer = setTimeout(() => {
      caches.match(req).then(answer);
    }, WAIT_MS);

    fetch(req, { cache: "no-cache" })
      .then((res) => {
        clearTimeout(timer);
        if (res.status >= 500) {
          return caches.match(req).then((c) => answer(c || res));
        }
        save(req, res);
        answer(res);
      })
      .catch(() => {
        clearTimeout(timer);
        caches.match(req)
          .then((r) => r || caches.match("/"))
          .then((r) => answer(r || Response.error()));
      });
  });
}

// Styles, scripts and pictures: show the saved copy at once and refresh it in the background.
// Files with a new ?v= number are different files, so they are always fetched fresh.
function assetRequest(req) {
  return caches.match(req).then((cached) => {
    const refresh = fetch(req, { cache: "no-cache" }).then((res) => {
      save(req, res);
      return res;
    });
    if (cached) {
      refresh.catch(() => {});
      return cached;
    }
    return refresh;
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (
    /\.(xml|zip)$/i.test(url.pathname) ||
    url.pathname === "/robots.txt" ||
    url.pathname === "/ads.txt" ||
    url.pathname === "/service-worker.js" ||
    url.pathname.indexOf("/.well-known") === 0
  ) return;

  if (req.mode === "navigate") {
    e.respondWith(pageRequest(req));
    return;
  }
  e.respondWith(assetRequest(req));
});
