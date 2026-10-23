/* CNN-style computer layout. Load AFTER category-view.js.
   Computers: top row gets Watch, Listen, search and Sign in; the home page is drawn like CNN's.
   v3: starts at 900px and has advertisement slots in the open spaces. */
(function () {
  var mq = window.matchMedia("(min-width: 900px)");
  var baseHero = renderHero, baseTrending = renderTrending, baseSections = renderCategorySections;

  /* ===== ADVERTISEMENT SLOTS =====
     key = your Adsterra ad key. All start with your existing 300x250 key.
     Later you can paste a separate key for each slot. Set key to "" to turn a slot off. */
  var KEY = "1de90f316aa8dede9349d9abffc48ea9";
  var ADS = {
    l1: { key: KEY, w: 300, h: 250 },   /* left column, under the picture story */
    l2: { key: KEY, w: 300, h: 250 },   /* left column, bottom                  */
    r1: { key: KEY, w: 300, h: 250 },   /* right column, under the first story  */
    r2: { key: KEY, w: 300, h: 250 },   /* right column, bottom                 */
    b3: { key: KEY, w: 300, h: 250 }    /* third column of the lower band, top  */
  };
  var lastHtml = "";

  function adSlot(id) {
    var c = ADS[id];
    if (!c || !c.key) return "";
    return '<div class="d-ad" data-ad="' + id + '"><small>Advertisement</small><div class="d-adbox"></div></div>';
  }
  function fit(el, c) {
    var box = el.querySelector(".d-adbox");
    var f = box && box.firstChild;
    if (!f) return;
    var s = Math.min(1, el.clientWidth / c.w);
    box.style.width = Math.round(c.w * s) + "px";
    box.style.height = Math.round(c.h * s) + "px";
    f.style.transform = "scale(" + s + ")";
  }
  function mountAds(root) {
    root.querySelectorAll(".d-ad").forEach(function (el) {
      var c = ADS[el.getAttribute("data-ad")];
      var box = el.querySelector(".d-adbox");
      if (!c || !box || box.firstChild) return;
      var f = document.createElement("iframe");
      f.width = c.w; f.height = c.h;
      f.setAttribute("scrolling", "no");
      f.setAttribute("frameborder", "0");
      f.title = "Advertisement";
      f.style.cssText = "border:0;display:block;position:absolute;left:0;top:0;transform-origin:0 0";
      f.srcdoc = '<!DOCTYPE html><html><body style="margin:0"><script>atOptions={"key":"' + c.key +
        '","format":"iframe","height":' + c.h + ',"width":' + c.w + ',"params":{}};<\/script>' +
        '<script src="https://bauval.org/22/' + c.key + '"><\/script></body></html>';
      box.appendChild(f);
      fit(el, c);
    });
  }
  window.addEventListener("resize", function () {
    document.querySelectorAll(".d-ad").forEach(function (el) {
      var c = ADS[el.getAttribute("data-ad")];
      if (c) fit(el, c);
    });
  });

  /* ===== Top row: Watch, Listen, search, Sign in ===== */
  var acct = document.querySelector(".topbar .acct");
  var icons = document.querySelector(".topbar .icons");
  var search = document.getElementById("search-btn");
  var watch = document.createElement("a");
  watch.className = "top-extra";
  watch.href = "live.html";
  watch.innerHTML = '<i class="d-dot"></i>Watch';
  var listen = document.createElement("a");
  listen.className = "top-extra";
  listen.href = "podcasts.html";
  listen.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>Listen';

  function header() {
    if (!acct) return;
    if (mq.matches) {
      acct.insertBefore(watch, acct.firstChild);
      acct.insertBefore(listen, watch.nextSibling);
      if (search) acct.insertBefore(search, listen.nextSibling);
    } else {
      watch.remove();
      listen.remove();
      if (search && icons) icons.appendChild(search);
    }
  }

  /* ===== Small helpers ===== */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function href(a) { return "article.html?slug=" + encodeURIComponent(a.slug); }
  function vid(a) { return /^https:\/\//i.test(String(a.video_url || "")) ? '<span class="d-vid"></span>' : ""; }
  function img(a) { return a.image_url ? '<img src="' + esc(a.image_url) + '" alt="" loading="lazy" decoding="async">' : ""; }

  /* Bold label above a headline: Breaking News / Live Updates (red) or Analysis, from the story's tags */
  function labelText(a) {
    var t = tagList(a);
    if (t.indexOf("breaking") > -1) return ["Breaking News", true];
    if (t.indexOf("live") > -1 || t.indexOf("live updates") > -1) return ["Live Updates", true];
    if (t.indexOf("analysis") > -1) return ["Analysis", false];
    return null;
  }
  function label(a) {
    var l = labelText(a);
    return l ? '<span class="d-lab' + (l[1] ? " red" : "") + '">' + l[0] + "</span>" : "";
  }

  /* Story pieces */
  function tText(a, cls) {
    return '<a class="d-item ' + (cls || "") + '" href="' + href(a) + '">' + label(a) + "<h3>" + esc(a.title) + "</h3>" +
      (!cls && a.excerpt ? "<p>" + esc(a.excerpt) + "</p>" : "") + vid(a) + "</a>";
  }
  function tImg(a) {
    return '<a class="d-item" href="' + href(a) + '">' + (a.image_url ? '<span class="d-ph">' + img(a) + "</span>" : "") +
      label(a) + "<h3>" + esc(a.title) + "</h3>" + vid(a) + "</a>";
  }
  function tRow(a) {
    return '<a class="d-row" href="' + href(a) + '">' + (a.image_url ? '<span class="d-th">' + img(a) + "</span>" : "") +
      '<span class="d-tx">' + label(a) + '<span class="d-t">' + esc(a.title) + "</span>" + vid(a) + "</span></a>";
  }
  function head(t) { return '<h2 class="d-head"><span></span>' + esc(t) + "</h2>"; }
  function lead(a) {
    var l = labelText(a);
    var cap = '<span class="d-cap"><span class="d-pill">' + esc(l ? l[0] : a.category) + '</span><span class="d-capt">' +
      esc(a.excerpt || a.title) + "</span></span>";
    return '<a class="d-lead" href="' + href(a) + '"><h1>' + esc(a.title) + "</h1>" +
      (a.image_url ? '<span class="d-leadimg">' + img(a) + (vid(a) ? '<span class="d-play"></span>' : "") + cap + "</span>" : "") + "</a>";
  }
  function overlay(a) {
    return '<a class="d-ovl" href="' + href(a) + '"><span class="d-leadimg">' + img(a) +
      '<span class="d-cap"><span class="d-bar"></span><span class="d-capt">' + esc(a.title) + "</span></span></span></a>";
  }

  /* ===== The home page, arranged like CNN ===== */
  function home(list) {
    var lead0 = list.find(function (a) { return a.featured; }) || list[0];
    var rest = list.filter(function (a) { return a.id !== lead0.id; });
    var used = {};
    used[lead0.id] = 1;

    function take(n, cat) {
      var out = [];
      for (var i = 0; i < rest.length && out.length < n; i++) {
        var a = rest[i];
        if (!used[a.id] && (!cat || a.category === cat)) { used[a.id] = 1; out.push(a); }
      }
      return out;
    }
    function topCat() {
      var c = {};
      rest.forEach(function (a) { if (!used[a.id]) c[a.category] = (c[a.category] || 0) + 1; });
      var k = Object.keys(c).sort(function (x, y) { return c[y] - c[x]; });
      return k[0] || null;
    }

    /* Top section: three columns */
    var L = take(3);
    var C = take(2);
    var cat1 = topCat();
    var S = cat1 ? take(3, cat1) : [];
    var R1 = take(1)[0], R2 = take(1)[0], R3 = take(4);

    /* LEFT: story, picture story, AD, story, AD */
    var left = '<div class="d-left">' + L.map(function (a, i) {
      return (i === 1 ? tImg(a) + adSlot("l1") : tText(a));
    }).join("") + adSlot("l2") + "</div>";

    var center = '<div class="d-center">' + lead(lead0) +
      '<div class="d-two">' + C.map(function (a) { return tText(a, "sm"); }).join("") + "</div>" +
      (S.length ? '<section class="d-sec">' + head(cat1) + '<div class="d-three">' + S.map(tImg).join("") + "</div></section>" : "") + "</div>";

    /* RIGHT: picture story, AD, bold story, small rows, AD */
    var right = '<div class="d-right">' + (R1 ? tImg(R1) : "") + adSlot("r1") + (R2 ? tText(R2, "bold") : "") +
      '<div class="d-rows">' + R3.map(tRow).join("") + "</div>" + adSlot("r2") + "</div>";

    /* Band of three sections */
    var A1 = take(1)[0], A2 = take(3);
    var cat2 = topCat(); var B1 = cat2 ? take(1, cat2)[0] : null;
    var cat3 = topCat(); var B2 = cat3 ? take(3, cat3) : [];
    var cat4 = topCat(); var D1 = cat4 ? take(1, cat4)[0] : null; var D2 = cat4 ? take(2, cat4) : [];

    var col1 = (A1 || A2.length) ? '<section class="d-sec">' + head("More top stories") + (A1 ? tImg(A1) : "") + A2.map(function (a) { return tText(a, "sm"); }).join("") + "</section>" : "";
    var col2 = B1 ? '<section class="d-sec">' + head(cat2) + overlay(B1) +
      (B2.length ? head(cat3) + '<div class="d-three">' + B2.map(tImg).join("") + "</div>" : "") + "</section>" : "";
    /* THIRD COLUMN: AD sits on top, like the grey box above Health */
    var col3 = D1 ? '<section class="d-sec">' + adSlot("b3") + head(cat4) + tImg(D1) + D2.map(function (a) { return tText(a, "sm"); }).join("") + "</section>" : "";
    var band = (col1 || col2 || col3) ? '<div class="d-band">' + col1 + col2 + col3 + "</div>" : "";

    /* Any stories left over: one row per category */
    var more = CATEGORIES.map(function (c) {
      var g = take(3, c);
      return g.length ? '<section class="d-sec d-wide">' + head(c) + '<div class="d-three">' + g.map(tImg).join("") + "</div></section>" : "";
    }).join("");

    return '<div class="d-home"><div class="d-top">' + left + center + right + "</div>" + band + more + "</div>";
  }

  /* ===== Switch between the computer layout and the phone layout ===== */
  renderHero = function (list) {
    if (!mq.matches || activeCategory !== "all" || !list.length) { lastHtml = ""; baseHero(list); return; }
    document.body.classList.remove("cat-view");
    var section = document.getElementById("hero-section");
    var html = home(list);
    /* Same content as before: keep what is on screen, so the ads are not reloaded */
    if (html === lastHtml && section.querySelector(".d-home")) return;
    lastHtml = html;
    section.innerHTML = html;
    mountAds(section);
  };
  renderTrending = function () {
    if (mq.matches && activeCategory === "all") {
      var t = document.getElementById("trending-section");
      if (t) t.innerHTML = "";
      return;
    }
    baseTrending();
  };
  renderCategorySections = function (list) {
    if (mq.matches && activeCategory === "all" && list.length) {
      document.getElementById("category-sections").innerHTML = "";
      return;
    }
    baseSections(list);
  };

  function onChange() {
    header();
    if (typeof renderPage === "function" && allArticles.length) renderPage();
  }
  header();
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
  if (mq.matches && allArticles.length) renderPage();
})();
