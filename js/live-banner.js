(function () {
  var KEY = "live_stream_url";
  var host = document.getElementById("live-banner");
  if (!host || typeof supabaseClient === "undefined") return;

  var css = document.createElement("style");
  css.textContent =
    ".lb-card{position:relative;display:flex;flex-direction:column;justify-content:flex-end;min-height:260px;margin:16px 0;padding:22px 20px;border-radius:16px;overflow:hidden;color:#fff;text-decoration:none;background:#0d0d0d linear-gradient(135deg,#1a1a1d,#3a0a14);background-size:cover;background-position:center}" +
    ".lb-card::before{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.88),rgba(0,0,0,.35))}" +
    ".lb-card>*{position:relative}" +
    ".lb-pill{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;background:#e8344c;color:#fff;font-weight:800;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;padding:7px 14px;border-radius:999px;margin-bottom:14px}" +
    ".lb-dot{width:9px;height:9px;border-radius:50%;background:#fff;display:inline-block;animation:lbpulse 1.4s infinite}" +
    "@keyframes lbpulse{50%{opacity:.25}}" +
    "@media(prefers-reduced-motion:reduce){.lb-dot{animation:none}}" +
    ".lb-title{font-family:var(--serif,Georgia,serif);font-weight:800;font-size:clamp(1.6rem,6vw,2.2rem);line-height:1.15;margin:0 0 8px;text-decoration:underline;text-underline-offset:4px}" +
    ".lb-sub{margin:0 0 16px;color:#e4e4e4;font-size:.98rem}" +
    ".lb-btn{align-self:flex-start;background:#fff;color:#111;font-weight:800;padding:10px 20px;border-radius:999px;font-size:.95rem}";
  document.head.appendChild(css);

  /* Keep the live card right after the big headline card */
  function place() {
    var hero = document.getElementById("hero-section");
    if (!hero) return;
    var first = hero.firstElementChild;
    if (!first || first === host) return;
    if (first.nextElementSibling !== host) {
      first.insertAdjacentElement("afterend", host);
    }
  }

  var heroEl = document.getElementById("hero-section");
  if (heroEl && window.MutationObserver) {
    new MutationObserver(place).observe(heroEl, { childList: true });
  }
  place();

  function videoId(v) {
    var s = String(v || "");
    var src = s.match(/src\s*=\s*["']([^"']+)["']/i);
    if (src) s = src[1];
    var m = s.match(/(?:youtu\.be\/|[?&]v=|\/live\/|\/embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  var last = null;

  async function check() {
    var value = "";
    try {
      var r = await supabaseClient
        .from("settings")
        .select("value")
        .eq("key", KEY)
        .maybeSingle();
      if (r.error) return;
      value = r.data && r.data.value ? String(r.data.value).trim() : "";
    } catch (e) {
      return;
    }

    if (value === last) return;
    last = value;

    if (!value) {
      host.innerHTML = "";
      return;
    }

    var id = videoId(value);
    var bg = id
      ? ' style="background-image:url(https://img.youtube.com/vi/' + id + '/hqdefault.jpg)"'
      : "";

    host.innerHTML =
      '<a class="lb-card" href="live.html"' + bg + '>' +
        '<span class="lb-pill"><span class="lb-dot"></span> Live now</span>' +
        '<h2 class="lb-title">Watch Davidgistmedia Live</h2>' +
        '<p class="lb-sub">Tap to join the live broadcast and chat.</p>' +
        '<span class="lb-btn">Watch now →</span>' +
      '</a>';

    place();
  }

  check();
  setInterval(check, 30000);
})();
