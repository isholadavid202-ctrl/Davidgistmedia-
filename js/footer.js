(function () {
  var year = new Date().getFullYear();
  var html = `
<footer class="dgf" aria-label="Davidgistmedia site footer">
  <div class="dgf-inner">

    <nav class="dgf-sections" aria-label="Sections">
      <a href="podcasts.html">Podcasts</a>
      <a href="live.html">Live</a>
      <a href="index.html#entertainment">Entertainment</a>
      <a href="index.html#sports">Sports</a>
      <a href="index.html#business">Business</a>
    </nav>

    <details class="dgf-more">
      <summary>More sections</summary>
      <div>
        <a href="index.html#nigeria">Nigeria</a>
        <a href="index.html#politics">Politics</a>
        <a href="index.html#technology">Technology</a>
        <a href="index.html#world">World</a>
        <a href="index.html#local">Local News</a>
      </div>
    </details>

    <hr class="dgf-rule">

    <h2 class="dgf-title">Follow Davidgistmedia on:</h2>

    <div class="dgf-social">
      <a href="https://x.com/YOUR_HANDLE" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
      <a href="https://www.facebook.com/YOUR_PAGE" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
      <a href="https://www.instagram.com/davidgistmediang/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
      <a href="https://www.tiktok.com/@davidgistmediang" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
      <a href="https://www.linkedin.com/company/YOUR_PAGE" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
      <a href="https://www.youtube.com/@davidgistmediang" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
    </div>

    <nav class="dgf-links" aria-label="Footer">
      <a href="terms.html">Terms of Use</a>
      <a href="about.html">About Davidgistmedia</a>
      <a href="privacy-policy.html">Privacy Policy</a>
      <a href="cookies.html">Cookies</a>
      <a href="accessibility.html">Accessibility Help</a>
      <a href="contact.html">Contact Davidgistmedia</a>
      <a href="advertise.html">Advertise with us</a>
      <a href="help.html">Help &amp; FAQs</a>
      <a href="editorial-policy.html">Editorial Policy</a>
      <a href="corrections.html">Corrections</a>
    </nav>

    <p class="dgf-copy">
      Copyright <span id="year">${year}</span> Davidgistmedia. All rights reserved.
      Davidgistmedia is not responsible for the content of external sites.
      <a href="editorial-policy.html">Read about our approach to external linking.</a>
    </p>
  </div>
</footer>`;

  var slot = document.getElementById("site-footer");
  if (slot) slot.outerHTML = html;
})();
