/* Davidgistmedia: header for the About, Contact, Terms, Privacy, Cookies, Accessibility,
   Editorial Policy, Advertise and Help pages. Put this file in your js/ folder.
   To change the header or menu on all of these pages, change it here once. */
(function () {
  /* night mode before the page is drawn, so it does not flash white */
  try {
    var saved = localStorage.getItem("dg_theme") || localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}

  function icon(inner, size) {
    size = size || 18;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }
  var MOON = icon('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>');
  var SUN = icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
  var MENU = icon('<path d="M4 6h16M4 12h16M4 18h16"/>');
  var USER = icon('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>', 14);

  var HEADER =
    '<div class="sp-util"><div class="in"><span id="today"></span>' +
      '<a class="sp-account" href="profile.html" id="top-account-link">' + USER + "<span>Sign in</span></a></div></div>" +
    '<div class="sp-top"><div class="in">' +
      '<button type="button" class="sp-btn" id="menu-btn" aria-label="Menu" aria-expanded="false">' + MENU + "</button>" +
      '<a class="sp-brand" href="index.html">David<span>gistmedia</span></a><span class="sp-spacer"></span>' +
      '<button type="button" class="sp-btn" id="theme-toggle-btn" aria-label="Switch between light and dark"><span id="theme-icon" style="display:grid;place-items:center"></span></button>' +
    "</div></div>" +
    '<div class="sp-drawer" id="drawer" hidden><div class="in">' +
      '<a href="about.html">About</a><a href="contact.html">Contact</a><a href="editorial-policy.html">Editorial Policy</a>' +
      '<a href="privacy-policy.html">Privacy</a><a href="terms.html">Terms</a><a href="staff.html">Staff login</a><a href="admin.html">Admin login</a>' +
    "</div></div>" +
    '<nav class="sp-nav" aria-label="News sections"><div class="in">' +
      '<a href="index.html">Home</a><a href="index.html#nigeria">Nigeria</a><a href="index.html#africa">Africa</a>' +
      '<a href="index.html#politics">Politics</a><a href="index.html#entertainment">Entertainment</a><a href="sport.html">Sport</a>' +
      '<a href="index.html#business">Business</a><a href="index.html#technology">Technology</a><a href="index.html#science">Science</a>' +
      '<a href="index.html#education">Education</a><a href="index.html#fashion">Fashion</a><a href="index.html#europe">Europe</a>' +
      '<a href="index.html#world">World</a><a href="index.html#local">Local News</a><a href="podcasts.html">Podcasts</a>' +
      '<a href="live.html">Live</a><a href="videos.html">Videos</a>' +
    "</div></nav>";

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function build() {
    var slot = document.getElementById("site-header");
    if (!slot) return;
    slot.innerHTML = HEADER;

    /* date */
    var short = window.innerWidth < 600;
    document.getElementById("today").textContent = new Date().toLocaleDateString("en-NG", short
      ? { weekday: "short", day: "numeric", month: "short", year: "numeric" }
      : { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    /* menu button */
    var menuBtn = document.getElementById("menu-btn");
    var drawer = document.getElementById("drawer");
    menuBtn.addEventListener("click", function () {
      drawer.hidden = !drawer.hidden;
      menuBtn.setAttribute("aria-expanded", String(!drawer.hidden));
    });

    /* night mode button */
    var themeIcon = document.getElementById("theme-icon");
    function syncIcon() {
      themeIcon.innerHTML = document.documentElement.getAttribute("data-theme") === "dark" ? SUN : MOON;
    }
    syncIcon();
    document.getElementById("theme-toggle-btn").addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") !== "dark";
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
      syncIcon();
      try { localStorage.setItem("dg_theme", dark ? "dark" : "light"); localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    });
  }

  /* the signed-in name in the top strip */
  async function account() {
    var btn = document.getElementById("top-account-link");
    if (!btn || typeof supabaseClient === "undefined") return;
    try {
      var r = await supabaseClient.auth.getUser();
      var user = r.data && r.data.user;
      if (!user) return;
      var name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || "My account";
      var avatar = null;
      try {
        var p = await supabaseClient.from("profiles").select("full_name, avatar_url").eq("id", user.id).single();
        if (p.data) { name = p.data.full_name || name; avatar = p.data.avatar_url; }
      } catch (e) {}
      btn.innerHTML = (avatar ? '<img src="' + esc(avatar) + '" alt="" style="width:18px;height:18px;border-radius:50%;object-fit:cover;border:1px solid var(--line)">' : USER) +
        "<span>" + esc(name) + "</span>";
    } catch (e) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  window.addEventListener("load", account);
})();
