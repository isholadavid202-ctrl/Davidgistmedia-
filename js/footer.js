(function () {
  var year = new Date().getFullYear();

  /* ---------- Social links ----------
     Replace the YOUR_ placeholders with your real pages.
     Any link that still contains "YOUR_" is hidden automatically,
     so visitors never see an icon that leads nowhere. */
  var social = [
    { name: "X",         icon: "fa-x-twitter",    url: "https://x.com/Davidgistmedian" },
    { name: "Facebook",  icon: "fa-facebook-f",   url: "https://www.facebook.com/YOUR_PAGE" },
    { name: "Instagram", icon: "fa-instagram",    url: "https://www.instagram.com/davidgistmediang/" },
    { name: "TikTok",    icon: "fa-tiktok",       url: "https://www.tiktok.com/@davidgistmediang" },
    { name: "LinkedIn",  icon: "fa-linkedin-in",  url: "https://www.linkedin.com/company/YOUR_PAGE" },
    { name: "YouTube",   icon: "fa-youtube",      url: "https://www.youtube.com/@davidgistmediang" }
  ];

  var socialHtml = social
    .filter(function (s) { return s.url.indexOf("YOUR_") === -1; })
    .map(function (s) {
      return '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.name + '"><i class="fa-brands ' + s.icon + '"></i></a>';
    })
    .join("");

  var css = `
/* Pull the footer close to the last story, like CNN */
main,main.wrap{margin-bottom:0 !important;padding-bottom:0 !important}
#category-sections,#category-sections .cat-section:last-child,.cat-section:last-child,.card-grid:last-child{margin-bottom:0 !important;padding-bottom:0 !important}
.story-card:last-child{margin-bottom:0 !important;padding-bottom:0 !important;border-bottom:0 !important}
footer.dgx{margin:24px 0 0 !important;padding:0 !important;background:#111;color:#e6e6e6;font-family:var(--font,"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif);line-height:1.4}

.dgx,.dgx *{box-sizing:border-box}
.dgx a{color:inherit;text-decoration:none}
.dgx-inner{max-width:1200px;margin:0 auto;padding:0 20px}

.dgx-news{padding:28px 0 24px;border-bottom:1px solid #2b2b2b}
.dgx-news h3{margin:0 0 6px;font-size:1.4rem;font-weight:700;color:#fff;letter-spacing:-.01em}
.dgx-news p{margin:0 0 16px;font-size:.95rem;color:#b4b4b4}
.dgx-form{display:flex;gap:8px;max-width:480px}
.dgx-form input{flex:1;min-width:0;padding:13px 14px;border:1px solid #474747;border-radius:8px;background:#1b1b1b;color:#fff;font-size:1rem;font-family:inherit}
.dgx-form input::placeholder{color:#8a8a8a}
.dgx-form input:focus{outline:2px solid #fff;outline-offset:1px}
.dgx-form button{padding:13px 20px;border:0;border-radius:8px;background:#fff;color:#111;font-weight:700;font-size:.95rem;font-family:inherit;cursor:pointer}
.dgx-form button:hover{background:#e2e2e2}
.dgx-form button:disabled{opacity:.6;cursor:default}
.dgx-status{margin:10px 0 0 !important;min-height:1.2em;font-size:.9rem !important;color:#b4b4b4}

.dgx-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 20px;padding:28px 0 26px}
.dgx-col h4{display:flex;align-items:center;margin:0 0 10px;font-size:.8rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff}
.dgx-col h4::before{content:"";display:inline-block;width:5px;height:1.1em;background:#fff;margin-right:9px}
.dgx-col a{display:block;padding:6px 0;font-size:.95rem;color:#c9c9c9}
.dgx-col a:hover{color:#fff;text-decoration:underline}

.dgx-social-row{display:flex;flex-wrap:wrap;align-items:center;gap:14px 18px;padding:22px 0;border-top:1px solid #2b2b2b}
.dgx-social-row h2{margin:0;font-size:1rem;font-weight:700;color:#fff}
.dgx-social{display:flex;flex-wrap:wrap;gap:10px}
.dgx-social a{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid #474747;border-radius:50%;font-size:1.05rem;color:#fff;transition:background .15s,color .15s}
.dgx-social a:hover{background:#fff;color:#111}

.dgx-copy{margin:0;padding:20px 0 30px;border-top:1px solid #2b2b2b;font-size:.82rem;line-height:1.6;color:#8f8f8f}
.dgx-copy a{color:#d4d4d4;text-decoration:underline}

@media (min-width:820px){
  .dgx-cols{grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 32px;padding:36px 0 30px}
  .dgx-news .dgx-inner{display:flex;align-items:center;justify-content:space-between;gap:40px}
  .dgx-news-text{flex:1}
  .dgx-news p{margin-bottom:0}
  .dgx-form{flex:1;max-width:460px}
  .dgx-status{position:absolute}
}
@media (max-width:420px){
  .dgx-form{flex-direction:column}
  .dgx-form button{width:100%}
}`;

  var html = `
<footer class="dgx" aria-label="Davidgistmedia site footer">

  <div class="dgx-news">
    <div class="dgx-inner">
      <div class="dgx-news-text">
        <h3>Never Miss a Story</h3>
        <p>Get new stories delivered to your inbox. No spam, unsubscribe anytime.</p>
      </div>
      <div>
        <form class="dgx-form" id="dgx-news-form">
          <input type="email" id="dgx-news-email" placeholder="you@example.com" required aria-label="Your email address">
          <button type="submit" id="dgx-news-btn">Subscribe</button>
        </form>
        <p class="dgx-status" id="dgx-news-status" role="status"></p>
      </div>
    </div>
  </div>

  <div class="dgx-inner">

    <div class="dgx-cols">
      <nav class="dgx-col" aria-label="Sections">
        <h4>Sections</h4>
        <a href="podcasts.html">Podcasts</a>
        <a href="live.html">Live</a>
        <a href="live-audio.html">Live Audio</a>
        <a href="index.html#entertainment">Entertainment</a>
        <a href="index.html#sports">Sports</a>
        <a href="index.html#business">Business</a>
      </nav>

      <nav class="dgx-col" aria-label="More sections">
        <h4>More</h4>
        <a href="index.html#nigeria">Nigeria</a>
        <a href="index.html#africa">Africa</a>
        <a href="index.html#politics">Politics</a>
        <a href="index.html#technology">Technology</a>
        <a href="index.html#science">Science</a>
        <a href="index.html#education">Education</a>
        <a href="index.html#fashion">Fashion</a>
        <a href="index.html#europe">Europe</a>
        <a href="index.html#world">World</a>
        <a href="index.html#local">Local News</a>
      </nav>

      <nav class="dgx-col" aria-label="Company">
        <h4>Company</h4>
        <a href="about.html">About Davidgistmedia</a>
        <a href="contact.html">Contact Davidgistmedia</a>
        <a href="advertise.html">Advertise with us</a>
        <a href="help.html">Help &amp; FAQs</a>
      </nav>

      <nav class="dgx-col" aria-label="Legal and policies">
        <h4>Legal</h4>
        <a href="terms.html">Terms of Use</a>
        <a href="privacy-policy.html">Privacy Policy</a>
        <a href="cookies.html">Cookies</a>
        <a href="accessibility.html">Accessibility Help</a>
        <a href="editorial-policy.html">Editorial Policy</a>
        <a href="editorial-policy.html#corrections">Corrections</a>
      </nav>
    </div>

    <div class="dgx-social-row">
      <h2>Follow Davidgistmedia on:</h2>
      <div class="dgx-social">${socialHtml}</div>
    </div>

    <p class="dgx-copy">
      Copyright <span id="year">${year}</span> Davidgistmedia. All rights reserved.
      Davidgistmedia is not responsible for the content of external sites.
      <a href="editorial-policy.html">Read about our approach to external linking.</a>
    </p>
  </div>
</footer>`;

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var slot = document.getElementById("site-footer");
  if (slot) slot.outerHTML = html;

  /* ---------- Remove the empty space above the footer ----------
     Walks up from the footer through the last element of each block above it
     and removes its bottom margin, padding and line. It runs again whenever
     the page redraws its stories, so the gap cannot come back. */
  function skip(el) {
    return !el || /^(SCRIPT|STYLE|LINK|TEMPLATE|NOSCRIPT)$/.test(el.tagName) ||
      getComputedStyle(el).display === "none";
  }
  function lastReal(el) {
    var c = el.lastElementChild;
    while (c && skip(c)) c = c.previousElementSibling;
    return c;
  }
  function tighten() {
    var f = document.querySelector("footer.dgx");
    if (!f) return;
    var prev = f.previousElementSibling;
    while (prev && skip(prev)) prev = prev.previousElementSibling;
    while (prev) {
      prev.style.setProperty("margin-bottom", "0", "important");
      prev.style.setProperty("padding-bottom", "0", "important");
      prev.style.setProperty("border-bottom", "0", "important");
      prev = lastReal(prev);
    }
  }
  tighten();
  window.addEventListener("load", tighten);

  var mainEl = document.querySelector("main");
  if (mainEl && window.MutationObserver) {
    var waiting = false;
    new MutationObserver(function () {
      if (waiting) return;
      waiting = true;
      requestAnimationFrame(function () { waiting = false; tighten(); });
    }).observe(mainEl, { childList: true, subtree: true });
  }

  /* ---------- Newsletter signup ---------- */
  var form = document.getElementById("dgx-news-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var input = document.getElementById("dgx-news-email");
    var btn = document.getElementById("dgx-news-btn");
    var status = document.getElementById("dgx-news-status");
    var email = input.value.trim();
    if (!email) return;

    if (typeof supabaseClient === "undefined") {
      status.textContent = "Signing up isn't available on this page. Please try from the home page.";
      status.style.color = "#ff6b6b";
      return;
    }

    btn.disabled = true;
    status.textContent = "Subscribing...";
    status.style.color = "";

    var res = await supabaseClient.from("subscribers").insert({ email: email });
    btn.disabled = false;

    if (res.error) {
      if (res.error.code === "23505") {
        status.textContent = "You're already subscribed.";
      } else {
        status.textContent = "Something went wrong. Try again.";
        status.style.color = "#ff6b6b";
      }
      return;
    }
    status.textContent = "Thanks for subscribing!";
    input.value = "";
  });
})();
