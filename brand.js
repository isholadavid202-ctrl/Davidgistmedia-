/* Davidgistmedia brand + phone app bars
   - the one-line logo:  [mic-globe]  DAVID GIST MEDIA   (replaces every ".sp-brand" link)
   - phones only: a white sticky top bar (search left, logo, menu right) and a sticky bottom bar
     (Home, Search, Live, Saved, Profile) that sits under the audio player
   - "Saved" stories kept on the device (window.DGSave)
   Add one script line for brand.js to a page, after the page's own scripts. */
(function () {
  if (window.__dgBrand) return; window.__dgBrand = true;
  var path = location.pathname.replace(/\/+$/, "").split("/").pop() || "index.html";
  if (path.indexOf(".") < 0) path = "index.html";
  if (/^(admin|staff|login)/i.test(path)) return;

  var RED = "#c8102e", TAG = "Truth From The Street, To The World";

  /* ---------- icon + logo ---------- */
  var ICON = '<svg class="dgl-ic" viewBox="0 0 32 32" aria-hidden="true" focusable="false">' +
    '<circle cx="16" cy="16" r="13.2" fill="none" stroke="' + RED + '" stroke-width="2"/>' +
    '<ellipse cx="16" cy="16" rx="5.6" ry="13.2" fill="none" stroke="' + RED + '" stroke-width="1.2" opacity=".45"/>' +
    '<path d="M3 16h26M5.2 9.6h21.6M5.2 22.4h21.6" fill="none" stroke="' + RED + '" stroke-width="1.2" opacity=".45"/>' +
    '<rect x="12.4" y="6.4" width="7.2" height="12" rx="3.6" fill="' + RED + '" stroke="var(--dgl-halo,#fff)" stroke-width="1.8"/>' +
    '<path d="M9.6 15.2v1a6.4 6.4 0 0012.8 0v-1M16 22.6v3.4M12.6 26h6.8" fill="none" stroke="var(--dgl-halo,#fff)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M9.6 15.2v1a6.4 6.4 0 0012.8 0v-1M16 22.6v3.4M12.6 26h6.8" fill="none" stroke="' + RED + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var WORD = '<span class="dgl-w"><span class="dgl-d">DAVID</span><span class="dgl-g">GIST</span><span class="dgl-m">MEDIA</span></span>';
  window.DG_LOGO = function (tag) {
    return '<span class="dgl">' + ICON + '<span class="dgl-tx">' + WORD + (tag ? '<small class="dgl-tag">' + TAG + '</small>' : '') + '</span></span>';
  };

  /* ---------- styles ---------- */
  var css = [
    ".dgl{display:inline-flex;align-items:center;gap:.5em;font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;line-height:1;white-space:nowrap}",
    ".dgl-ic{width:1.9em;height:1.9em;flex:none;display:block}",
    ".dgl-tx{display:flex;flex-direction:column;gap:.42em;min-width:0}",
    ".dgl-w{display:inline-flex;gap:.36em;font-weight:800;letter-spacing:.075em;text-transform:uppercase}",
    ".dgl-d,.dgl-m{color:var(--dgl-ink,currentColor)}.dgl-g{color:" + RED + "}",
    ".dgl-tag{display:none;font-weight:500;font-size:.5em;letter-spacing:.03em;color:var(--dgl-sub,#6b6b6b);text-transform:none}",
    "html[data-theme='dark'] .dgl{--dgl-ink:#f4f4f4;--dgl-halo:#111;--dgl-sub:#a9a9a9}",
    "a.sp-brand.dgl-on{font:800 1rem/1 Inter,system-ui,sans-serif;letter-spacing:0;margin-left:0;color:var(--dgl-ink,#141414);display:inline-flex;align-items:center;text-decoration:none}",
    "a.sp-brand.dgl-on span{color:inherit}",
    "a.sp-brand.dgl-on .dgl-g{color:" + RED + "}",
    "a.sp-brand.dgl-on .dgl-d,a.sp-brand.dgl-on .dgl-m{color:var(--dgl-ink,#141414)}",
    /* computers */
    "@media (min-width:900px){a.sp-brand.dgl-on{font-size:1.5rem;margin-left:12px}.sp-brand .dgl-tag{display:block}}",
    /* phones: top bar */
    "@media (max-width:899px){",
    ":root{--dgtb:56px;--bn:62px}",
    ".sp-top{position:sticky;top:0;z-index:60;background:#fff;color:#141414;border-bottom:1px solid #ececec;box-shadow:0 2px 10px rgba(0,0,0,.07)}",
    "html[data-theme='dark'] .sp-top{background:#111;color:#f2f2f2;border-color:#262626;box-shadow:0 2px 10px rgba(0,0,0,.5)}",
    ".sp-top .in{padding:0 6px;min-height:var(--dgtb);gap:0}",
    "#search-btn{order:0}.sp-brand{order:1;margin:0 auto!important}.sp-spacer{display:none}.sp-desk-link{display:none!important}#theme-toggle-btn{display:none!important}#menu-btn{order:3}",
    "#menu-btn,#search-btn{width:44px;height:44px;color:inherit}",
    "a.sp-brand.dgl-on{font-size:clamp(.8rem,4.3vw,1.1rem)}",
    ".sp-nav{top:var(--dgtb)}",
    ".sp-drawer,.sp-search{position:fixed;left:0;right:0;top:var(--dgtop,56px);z-index:55;max-height:calc(100vh - var(--dgtop,56px) - var(--bn));overflow:auto;box-shadow:0 14px 28px rgba(0,0,0,.18)}",
    ".sp-drawer{background:#fff;border-top:1px solid #ececec}.sp-drawer a{color:#141414;border-color:#ececec}.sp-drawer a:hover{color:" + RED + "}",
    "html[data-theme='dark'] .sp-drawer{background:#161616;border-color:#262626}html[data-theme='dark'] .sp-drawer a{color:#eee;border-color:#262626}",
    ".dg-night{display:flex;align-items:center;gap:10px}",
    /* phones: bottom bar */
    "body.dg-bn-on{padding-bottom:calc(var(--bn) + 14px + env(safe-area-inset-bottom))!important}",
    "body.dg-bn-on.dg-mp-on{padding-bottom:calc(var(--bn) + 200px + env(safe-area-inset-bottom))!important}",
    "body.dg-bn-on #dg-mp{bottom:calc(var(--bn) + env(safe-area-inset-bottom));border-radius:16px 16px 0 0;padding-bottom:14px!important}",
    "body.dg-bn-on #dg-toast{bottom:calc(var(--bn) + 24px + env(safe-area-inset-bottom))}",
    "body.dg-bn-on #dgm-install{bottom:calc(var(--bn) + 12px + env(safe-area-inset-bottom))!important}",
    "#dg-bn{position:fixed;left:0;right:0;bottom:0;z-index:9400;display:flex;height:calc(var(--bn) + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:#fff;border-top:1px solid #e6e6e6;box-shadow:0 -3px 14px rgba(0,0,0,.07);font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}",
    "html[data-theme='dark'] #dg-bn{background:#111;border-color:#262626;box-shadow:0 -3px 14px rgba(0,0,0,.5)}",
    "#dg-bn a{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#6b6b6b;font-size:.66rem;font-weight:700;text-decoration:none;position:relative;-webkit-tap-highlight-color:transparent}",
    "html[data-theme='dark'] #dg-bn a{color:#a5a5a5}",
    "#dg-bn a svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}",
    "#dg-bn a.on{color:" + RED + "}",
    "html[data-theme='dark'] #dg-bn a.on{color:#ff4d63}",
    "#dg-bn a.on::before{content:'';position:absolute;top:0;left:30%;right:30%;height:3px;border-radius:0 0 3px 3px;background:" + RED + "}",
    "#dg-bn .lv-dot{position:absolute;top:9px;left:calc(50% + 7px);width:9px;height:9px;border-radius:50%;background:" + RED + ";border:2px solid #fff;display:none}",
    "html[data-theme='dark'] #dg-bn .lv-dot{border-color:#111}",
    "#dg-bn.is-live .lv-dot{display:block;animation:dgbp 1.4s ease-in-out infinite}",
    "@keyframes dgbp{50%{opacity:.35}}",
    "body.dg-kb #dg-bn{display:none}",
    "}",
    "@media (min-width:900px){#dg-bn{display:none!important}.dg-night{display:none!important}}",
    /* save buttons */
    ".item{position:relative}",
    ".dg-bk{position:absolute;right:0;bottom:12px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line,#e3e3e3);background:var(--bg,#fff);color:var(--muted,#6b6b6b);display:grid;place-items:center;cursor:pointer;padding:0;z-index:2}",
    ".dg-bk svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".dg-bk.on{color:" + RED + ";border-color:" + RED + "}.dg-bk.on svg{fill:" + RED + "}",
    "#dg-fab{position:fixed;right:14px;bottom:calc(var(--bn,0px) + 16px + env(safe-area-inset-bottom));z-index:9000;display:inline-flex;align-items:center;gap:7px;padding:11px 16px;border-radius:999px;border:0;background:#111;color:#fff;font:700 .85rem/1 Inter,system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.3);cursor:pointer}",
    "#dg-fab svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    "#dg-fab.on{background:" + RED + "}#dg-fab.on svg{fill:#fff}",
    "@media (min-width:900px){#dg-fab{bottom:24px}}"
  ].join("\n");
  var st = document.createElement("style"); st.id = "dg-brand-css"; st.textContent = css; document.head.appendChild(st);

  /* ---------- saved stories ---------- */
  var KEY = "dg_saved";
  function readSaved() { try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function writeSaved(a) { try { localStorage.setItem(KEY, JSON.stringify(a.slice(0, 200))); } catch (e) {} }
  window.DGSave = {
    list: readSaved,
    has: function (slug) { return readSaved().some(function (x) { return x.slug === slug; }); },
    remove: function (slug) { writeSaved(readSaved().filter(function (x) { return x.slug !== slug; })); },
    toggle: function (o) {
      if (!o || !o.slug) return false;
      var a = readSaved(), i = a.findIndex(function (x) { return x.slug === o.slug; });
      if (i > -1) { a.splice(i, 1); writeSaved(a); toast("Removed from Saved"); return false; }
      a.unshift({ slug: o.slug, title: o.title || "Story", img: o.img || "", t: Date.now() }); writeSaved(a); toast("Saved to read later"); return true;
    }
  };
  function toast(m) { if (window.DGPlayer && DGPlayer.toast) { DGPlayer.toast(m); return; } }

  var BK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  function slugOf(h) { var m = /[?&]slug=([^&#]+)/.exec(h || ""); return m ? decodeURIComponent(m[1]) : ""; }
  function decorate() {
    var els = document.querySelectorAll("a.item:not([data-bk])");
    for (var i = 0; i < els.length; i++) {
      var a = els[i]; a.setAttribute("data-bk", "1");
      var slug = slugOf(a.getAttribute("href")); if (!slug) continue;
      var b = document.createElement("button"); b.type = "button"; b.className = "dg-bk" + (DGSave.has(slug) ? " on" : "");
      b.setAttribute("aria-label", "Save story"); b.innerHTML = BK;
      b.addEventListener("click", (function (a, slug, b) { return function (e) {
        e.preventDefault(); e.stopPropagation();
        var t = a.querySelector(".t"), im = a.querySelector("img");
        b.classList.toggle("on", DGSave.toggle({ slug: slug, title: t ? t.textContent.trim() : "", img: im ? im.getAttribute("src") : "" }));
      }; })(a, slug, b));
      a.appendChild(b);
    }
  }
  var dt; function later() { clearTimeout(dt); dt = setTimeout(decorate, 150); }

  /* ---------- the logo in the header ---------- */
  function logo() {
    var els = document.querySelectorAll("a.sp-brand:not(.dgl-on)");
    for (var i = 0; i < els.length; i++) { els[i].classList.add("dgl-on"); els[i].innerHTML = DG_LOGO(true); els[i].setAttribute("aria-label", "Davidgistmedia home"); }
  }

  /* ---------- phones: bottom bar ---------- */
  var I = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7.5L21 11"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-6h4v6"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    live: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2.2"/><path d="M7.8 7.8a6 6 0 000 8.4M16.2 7.8a6 6 0 010 8.4M4.9 4.9a10 10 0 000 14.2M19.1 4.9a10 10 0 010 14.2"/></svg>',
    saved: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>'
  };
  var onHome = path === "index.html";
  function activeKey() {
    if (/^live(-audio)?\.html$/.test(path)) return "live";
    if (/^saved\.html$/.test(path)) return "saved";
    if (/^profile\.html$/.test(path)) return "profile";
    if (onHome && !/[?&]s=1/.test(location.search)) return "home";
    return "";
  }
  var bn;
  function buildBar() {
    bn = document.createElement("nav"); bn.id = "dg-bn"; bn.setAttribute("aria-label", "App navigation");
    var k = activeKey();
    function a(key, href, label, icon) { return '<a data-k="' + key + '" href="' + href + '"' + (k === key ? ' class="on" aria-current="page"' : '') + '>' + icon + '<span>' + label + '</span>' + (key === "live" ? '<i class="lv-dot"></i>' : '') + '</a>'; }
    bn.innerHTML = a("home", "index.html", "Home", I.home) + a("search", "index.html?s=1", "Search", I.search) +
      a("live", "live.html", "Live", I.live) + a("saved", "saved.html", "Saved", I.saved) + a("profile", "profile.html", "Profile", I.user);
    document.body.appendChild(bn);
    document.body.classList.add("dg-bn-on");
    bn.querySelector('[data-k="search"]').addEventListener("click", function (e) {
      var sb = document.getElementById("search-btn"); if (!sb) return;
      e.preventDefault(); window.scrollTo(0, 0);
      var bar = document.getElementById("search-bar");
      if (bar && bar.hidden) sb.click();
      setTimeout(function () { var i = document.getElementById("search-input"); if (i) i.focus(); place(); }, 60);
    });
    bn.querySelector('[data-k="home"]').addEventListener("click", function (e) {
      if (onHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    });
    document.addEventListener("focusin", function (e) { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) document.body.classList.add("dg-kb"); });
    document.addEventListener("focusout", function () { document.body.classList.remove("dg-kb"); });
  }
  function watchPlayer() {
    var upd = function () { var m = document.getElementById("dg-mp"); document.body.classList.toggle("dg-mp-on", !!(m && m.classList.contains("on"))); };
    var go = function () {
      var m = document.getElementById("dg-mp");
      if (!m) { setTimeout(go, 400); return; }
      new MutationObserver(upd).observe(m, { attributes: true, attributeFilter: ["class"] }); upd();
    };
    go();
  }

  /* ---------- phones: the menu and search panels hang under the sticky top bar ---------- */
  function place() {
    var t = document.querySelector(".sp-top"), root = document.documentElement;
    if (!t || window.innerWidth >= 900) { root.style.removeProperty("--dgtop"); return; }
    var b = Math.max(0, Math.round(t.getBoundingClientRect().bottom));
    root.style.setProperty("--dgtop", b + "px");
  }
  var raf; function placeSoon() { cancelAnimationFrame(raf); raf = requestAnimationFrame(place); }
  function menuExtras() {
    var d = document.querySelector("#drawer .in"); if (!d || d.querySelector(".dg-night")) return;
    var n = document.createElement("a"); n.href = "#"; n.className = "dg-night"; n.textContent = "Night mode";
    n.addEventListener("click", function (e) { e.preventDefault(); var tb = document.getElementById("theme-toggle-btn"); if (tb) tb.click(); });
    d.insertBefore(n, d.firstChild);
    [["Podcasts", "podcasts.html"], ["Live Audio", "live-audio.html"], ["Brand", "brand.html"]].forEach(function (x) {
      if (d.querySelector('a[href="' + x[1] + '"]')) return;
      var l = document.createElement("a"); l.href = x[1]; l.textContent = x[0]; d.insertBefore(l, d.querySelector(".dg-night").nextSibling);
    });
  }

  /* ---------- the red dot on "Live" ---------- */
  function liveDot() {
    var sb = window.supabaseClient; if (!sb || !bn) return;
    Promise.all(["live_stream_url", "live_audio_url"].map(function (k) {
      return sb.from("settings").select("value").eq("key", k).maybeSingle().then(function (r) { return r && r.data && r.data.value ? String(r.data.value).trim() : ""; }, function () { return ""; });
    })).then(function (v) { bn.classList.toggle("is-live", !!(v[0] || v[1])); }, function () {});
  }

  /* ---------- the Save button on a story page ---------- */
  function fab() {
    if (!/^article\.html$/.test(path)) return;
    var slug = (new URLSearchParams(location.search)).get("slug"); if (!slug) return;
    var b = document.createElement("button"); b.type = "button"; b.id = "dg-fab"; b.setAttribute("aria-label", "Save story");
    var paint = function () { var on = DGSave.has(slug); b.classList.toggle("on", on); b.innerHTML = BK + "<span>" + (on ? "Saved" : "Save") + "</span>"; };
    paint();
    b.addEventListener("click", function () {
      var h = document.querySelector("h1"), og = document.querySelector('meta[property="og:image"]');
      DGSave.toggle({ slug: slug, title: h ? h.textContent.trim() : document.title.replace(/\s*[|\-–].*$/, ""), img: og ? og.content : "" }); paint();
    });
    document.body.appendChild(b);
  }

  function init() {
    logo(); menuExtras(); buildBar(); watchPlayer(); decorate(); fab(); place(); liveDot();
    setInterval(liveDot, 60000);
    new MutationObserver(function () { logo(); later(); }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", placeSoon, { passive: true });
    window.addEventListener("resize", placeSoon);
    var d = document.getElementById("drawer"), s = document.getElementById("search-bar");
    [d, s].forEach(function (el) { if (el) new MutationObserver(placeSoon).observe(el, { attributes: true, attributeFilter: ["hidden"] }); });
    if (/[?&]s=1/.test(location.search)) setTimeout(function () {
      var sb = document.getElementById("search-btn"), bar = document.getElementById("search-bar");
      if (sb && bar && bar.hidden) sb.click();
      var i = document.getElementById("search-input"); if (i) i.focus(); place();
    }, 400);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
