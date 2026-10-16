(function () {
  var p = location.pathname;
  if (!(p === "/" || /\/(index\.html)?$/.test(p))) return; // homepage only
  try {
    if (sessionStorage.getItem("dg_splash")) return;       // once per session
    sessionStorage.setItem("dg_splash", "1");
  } catch (e) {}

  var SECONDS = 15;          // change this number to make it shorter or longer
  var RED = "#C8102E";

  var css = document.createElement("style");
  css.textContent =
    "#dg-splash{position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-family:Arial,sans-serif;color:#1a1a1a;transition:opacity .5s ease}" +
    "#dg-splash.out{opacity:0;pointer-events:none}" +
    "#dg-splash .top,#dg-splash .bottom{flex:1;display:flex;align-items:flex-end;justify-content:center}" +
    "#dg-splash .mid{flex:0 0 auto;display:flex;align-items:center;justify-content:center}" +
    "#dg-splash .logo{width:120px;height:120px;background:" + RED + ";color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}" +
    "#dg-splash .logo b{font:700 74px/66px Georgia,'Times New Roman',serif}" +
    "#dg-splash .logo i{display:block;width:60px;height:2px;background:#fff}" +
    "#dg-splash .bottom{align-items:flex-end;padding-bottom:calc(48px + env(safe-area-inset-bottom))}" +
    "#dg-splash .name{font-size:26px;letter-spacing:.5px}";
  document.head.appendChild(css);

  var el = document.createElement("div");
  el.id = "dg-splash";
  el.innerHTML =
    '<div class="top"></div>' +
    '<div class="mid"><div class="logo"><b>D</b><i></i><i></i></div></div>' +
    '<div class="bottom"><div class="name">Davidgistmedia</div></div>';
  (document.body || document.documentElement).appendChild(el);

  setTimeout(function () {
    el.classList.add("out");
    setTimeout(function () { el.remove(); }, 600);
  }, SECONDS * 1000);
})();
