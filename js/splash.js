(function () {
  var p = location.pathname;
  if (!(p === "/" || /\/(index\.html)?$/.test(p))) return; // homepage only
  try {
    if (sessionStorage.getItem("dg_splash")) return;       // once per session
    sessionStorage.setItem("dg_splash", "1");
  } catch (e) {}

  var SECONDS = 4;           // change this number to make it shorter or longer
  var RED = "#C8102E";
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var css = document.createElement("style");
  css.textContent =
    "#dg-splash{position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:0 24px calc(32px + env(safe-area-inset-bottom));font-family:'Source Sans 3',Arial,sans-serif;color:#1a1a1a;transition:opacity .5s ease}" +
    "#dg-splash.out{opacity:0;pointer-events:none}" +
    "#dg-splash .top{height:4px;background:" + RED + ";width:100vw}" +
    "#dg-splash .mid{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}" +
    "#dg-splash .logo{width:96px;height:96px;background:" + RED + ";color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}" +
    "#dg-splash .logo b{font:700 60px/54px Georgia,'Times New Roman',serif}" +
    "#dg-splash .logo i{display:block;width:48px;height:2px;background:#fff}" +
    "#dg-splash h1{margin:0;font:700 30px Georgia,'Times New Roman',serif}" +
    "#dg-splash .tag{font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#5a5a5a}" +
    "#dg-splash .news{width:100%;max-width:420px;display:flex;flex-direction:column;gap:10px}" +
    "#dg-splash .item{border-left:4px solid " + RED + ";padding:6px 12px;background:#f6f6f7;min-height:54px}" +
    "#dg-splash .item small{display:block;font-size:11px;font-weight:700;letter-spacing:1.2px;color:" + RED + ";text-transform:uppercase}" +
    "#dg-splash .item span{display:block;font:600 15px/20px Georgia,serif;margin-top:2px}" +
    "#dg-splash .bar{width:160px;height:3px;background:#e6e6e6;margin:18px auto 0;overflow:hidden}" +
    "#dg-splash .bar div{height:100%;width:40%;background:" + RED + ";animation:dgload 1.1s ease-in-out infinite}" +
    "@keyframes dgload{0%{margin-left:-40%}100%{margin-left:100%}}";
  document.head.appendChild(css);

  var el = document.createElement("div");
  el.id = "dg-splash";
  el.innerHTML =
    '<div class="top"></div>' +
    '<div class="mid"><div class="logo"><b>D</b><i></i><i></i></div>' +
    '<h1>Davidgistmedia</h1><div class="tag">Breaking News · Entertainment</div>' +
    '<div class="bar"><div></div></div></div>' +
    '<div class="news" id="dg-splash-news"></div>';
  (document.body || document.documentElement).appendChild(el);

  function show(list) {
    if (!list || !list.length) return;
    var lead = list.filter(function (a) { return a.featured; })[0] || list[0];
    var ent = list.filter(function (a) { return a.category === "entertainment"; })[0];
    var html = '<div class="item"><small>Breaking</small><span>' + esc(lead.title) + "</span></div>";
    if (ent && ent.title !== lead.title)
      html += '<div class="item"><small>Entertainment</small><span>' + esc(ent.title) + "</span></div>";
    var box = document.getElementById("dg-splash-news");
    if (box) box.innerHTML = html;
  }

  // 1) instant: stories saved by the homepage on the last visit
  try {
    var c = JSON.parse(localStorage.getItem("dg_home_cache_v1") || "null");
    if (c && c.articles) show(c.articles);
  } catch (e) {}

  // 2) fresh: ask Supabase once it is ready
  var tries = 0;
  var wait = setInterval(function () {
    tries++;
    if (typeof supabaseClient !== "undefined") {
      clearInterval(wait);
      supabaseClient.from("articles")
        .select("title,category,featured")
        .order("published_at", { ascending: false }).limit(30)
        .then(function (r) { if (r && r.data) show(r.data); });
    } else if (tries > 40) {
      clearInterval(wait);
    }
  }, 100);

  // fade out after the chosen number of seconds
  setTimeout(function () {
    el.classList.add("out");
    setTimeout(function () { el.remove(); }, 600);
  }, SECONDS * 1000);
})();
