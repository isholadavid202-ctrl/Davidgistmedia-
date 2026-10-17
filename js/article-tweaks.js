(function () {
  var root = document.getElementById("article-root");
  if (!root) return;

  function move() {
    var by = root.querySelector(".byline");
    var hero = root.querySelector("img.hero-img") || root.querySelector('div[style*="56.25%"]');
    if (!by || !hero || by.parentNode !== root) return;

    var top = hero;
    while (top.parentNode && top.parentNode !== root) top = top.parentNode;
    if (top.parentNode !== root) return;

    var photoComesAfter = by.compareDocumentPosition(top) & Node.DOCUMENT_POSITION_FOLLOWING;
    if (photoComesAfter) root.insertBefore(by, top.nextSibling);
  }

  var timer;
  new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(move, 0);
  }).observe(root, { childList: true, subtree: true });

  move();
})();
