(function () {
  var root = document.getElementById("article-root");
  if (!root) return;

  function move() {
    var wrap = root.querySelector(".ssr-article") || root;
    var by = wrap.querySelector(".byline") || wrap.querySelector(".meta");
    var hero = wrap.querySelector("img.hero-img") || wrap.querySelector('div[style*="56.25%"]');
    if (!by || !hero || by.parentNode !== wrap) return;

    var top = hero;
    while (top.parentNode && top.parentNode !== wrap) top = top.parentNode;
    if (top.parentNode !== wrap) return;

    var photoComesFirst = by.compareDocumentPosition(top) & Node.DOCUMENT_POSITION_PRECEDING;
    if (photoComesFirst) wrap.insertBefore(by, top);
  }

  new MutationObserver(move).observe(root, { childList: true, subtree: true });
  move();
})();
