(function () {
  var APK = "/davidgistmedia.apk";
  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua);

  // Do nothing inside the installed app, or on a computer
  var inApp =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true ||
    (document.referrer || "").indexOf("android-app://") === 0;
  if (inApp || !(isAndroid || isIOS)) return;

  // Stay hidden for 7 days after the visitor closes it
  try {
    var t = localStorage.getItem("dgm_install_hidden");
    if (t && Date.now() - Number(t) < 7 * 24 * 3600 * 1000) return;
  } catch (e) {}

  function hideFor7Days() {
    try { localStorage.setItem("dgm_install_hidden", String(Date.now())); } catch (e) {}
    var el = document.getElementById("dgm-install");
    if (el) el.remove();
  }

  function show() {
    var css = document.createElement("style");
    css.textContent =
      "#dgm-install{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));" +
      "max-width:520px;margin:0 auto;z-index:9999;background:#fff;color:#1a1a1a;border:1px solid #ddd;" +
      "border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:10px 12px;display:flex;" +
      "align-items:center;gap:10px;font-family:system-ui,-apple-system,Arial,sans-serif}" +
      "#dgm-install img{width:40px;height:40px;border-radius:8px;flex:0 0 40px}" +
      "#dgm-install .dgm-txt{flex:1;min-width:0}" +
      "#dgm-install strong{display:block;font-size:14px;line-height:1.25}" +
      "#dgm-install span{display:block;font-size:12px;color:#555;line-height:1.3;margin-top:2px}" +
      "#dgm-install .dgm-btn{background:#c8102e;color:#fff;text-decoration:none;font-weight:700;" +
      "font-size:13px;padding:9px 14px;border-radius:6px;white-space:nowrap}" +
      "#dgm-install .dgm-x{background:none;border:0;font-size:24px;line-height:1;color:#666;" +
      "padding:0 4px;cursor:pointer}";
    document.head.appendChild(css);

    var bar = document.createElement("div");
    bar.id = "dgm-install";
    var sub = isAndroid
      ? "Read breaking news faster, right from your home screen."
      : "Tap the Share button, then Add to Home Screen.";
    bar.innerHTML =
      '<img src="favicon.png" alt="">' +
      '<div class="dgm-txt"><strong>Get the Davidgistmedia app</strong><span>' + sub + "</span></div>" +
      (isAndroid ? '<a class="dgm-btn" href="' + APK + '" download>Download</a>' : "") +
      '<button class="dgm-x" type="button" aria-label="Close">&times;</button>';
    document.body.appendChild(bar);

    bar.querySelector(".dgm-x").addEventListener("click", hideFor7Days);
    var dl = bar.querySelector(".dgm-btn");
    if (dl) dl.addEventListener("click", function () { setTimeout(hideFor7Days, 500); });
  }

  setTimeout(show, 2000);
})();
