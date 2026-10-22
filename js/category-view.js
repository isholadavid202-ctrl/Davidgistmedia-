/* CNN-style sections and category pages. Load this AFTER home.js.
   Home tab: each section = one big story (headline above the photo) + three headline links.
   Category tab: every story in that category, headline above the photo. */
(function () {
  var baseHero = renderHero;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function href(a) { return "article.html?slug=" + encodeURIComponent(a.slug); }
  function isVideo(a) { return /^https:\/\//i.test(String(a.video_url || "")); }

  /* Big story: time, optional "Analysis" label, headline, then the photo */
  function bigCard(a) {
    var pic = a.image_url
      ? '<span class="cnn-img"><img src="' + esc(a.image_url) + '" alt="" loading="lazy" decoding="async">' +
        (isVideo(a) ? '<span class="cnn-play"></span>' : "") + "</span>"
      : "";
    return '<a class="cnn-main" href="' + href(a) + '">' +
      '<span class="cnn-time">' + timeAgo(a.published_at) + "</span>" +
      kickerHtml(a) + "<h3>" + esc(a.title) + "</h3>" + pic + "</a>";
  }

  /* Plain headline link with a short grey line above it */
  function linkItem(a) {
    return '<a class="cnn-item" href="' + href(a) + '">' + kickerHtml(a) +
      '<span class="cnn-t">' + esc(a.title) + "</span>" +
      (isVideo(a) ? ' <span class="cnn-vid"></span>' : "") + "</a>";
  }

  function head(title, hash) {
    var t = hash ? '<a href="#' + esc(hash) + '">' + esc(title) + "</a>" : esc(title);
    return '<div class="cat-head"><div class="left"><h2>' + t + "</h2></div></div>";
  }

  function block(title, hash, items) {
    if (!items.length) return "";
    return '<section class="cat-section cnn-sec">' + head(title, hash) + bigCard(items[0]) +
      (items.length > 1 ? '<div class="cnn-list">' + items.slice(1, 4).map(linkItem).join("") + "</div>" : "") +
      "</section>";
  }

  /* On a category page the big top-story block is hidden, so no story shows twice */
  renderHero = function (list) {
    var inCat = activeCategory !== "all";
    document.body.classList.toggle("cat-view", inCat);
    if (inCat) {
      document.getElementById("hero-section").innerHTML = "";
      return;
    }
    baseHero(list);
  };

  renderTrending = function () {
    var box = document.getElementById("trending-section");
    if (!box) return;
    if (activeCategory !== "all") { box.innerHTML = ""; return; }
    var top = allArticles.slice().sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); }).slice(0, 4);
    var hasLikes = top.some(function (a) { return (a.likes || 0) > 0; });
    box.innerHTML = hasLikes ? block("Trending", "", top) : "";
  };

  renderCategorySections = function (list) {
    var box = document.getElementById("category-sections");
    if (activeCategory !== "all") {
      var items = list.filter(function (a) { return a.category === activeCategory; });
      box.innerHTML = '<section class="cat-section cnn-sec">' + head(activeCategory) +
        (items.length
          ? '<div class="cnn-all">' + items.map(bigCard).join("") + "</div>"
          : '<div class="empty-state">No ' + esc(activeCategory) + " stories yet.</div>") +
        "</section>";
      return;
    }
    var html = CATEGORIES.map(function (c) {
      return block(c, c, list.filter(function (a) { return a.category === c; }));
    }).join("");
    box.innerHTML = html || '<div class="empty-state">No stories yet.</div>';
  };
})();
