/* Category pages: when a category tab is open, show every story in that category.
   Load this AFTER home.js. The Home tab still looks the same as before. */
(function () {
  var baseHero = renderHero;
  var baseTrending = renderTrending;
  var baseSections = renderCategorySections;

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
    if (activeCategory !== "all") {
      var t = document.getElementById("trending-section");
      if (t) t.innerHTML = "";
      return;
    }
    baseTrending();
  };

  /* A category page lists ALL of its stories, newest first, with no limit */
  renderCategorySections = function (list) {
    if (activeCategory === "all") {
      baseSections(list);
      return;
    }
    var cat = activeCategory;
    var items = list.filter(function (a) { return a.category === cat; });
    var box = document.getElementById("category-sections");
    box.innerHTML =
      '<section class="cat-section">' +
        '<div class="cat-head"><div class="left"><span class="bar"></span><h2>' + escapeHtml(cat) + "</h2></div></div>" +
        (items.length === 0
          ? '<div class="empty-state">No ' + escapeHtml(cat) + " stories yet.</div>"
          : '<div class="card-grid all">' + storyFeature(items[0]) + items.slice(1).map(storyRow).join("") + "</div>") +
      "</section>";
  };
})();
