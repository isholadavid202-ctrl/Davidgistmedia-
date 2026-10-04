(function () {
  const root = document.getElementById('article-root');
  if (!root) return;

  const buttons = [
    { cls: 'fb', name: 'Facebook', icon: 'fa-brands fa-facebook-f',
      url: (u, t) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { cls: 'x', name: 'X', icon: 'fa-brands fa-x-twitter',
      url: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { cls: 'em', name: 'Email', icon: 'fa-solid fa-envelope', same: true,
      url: (u, t) => `mailto:?subject=${t}&body=${u}` },
    { cls: 'tg', name: 'Telegram', icon: 'fa-brands fa-telegram',
      url: (u, t) => `https://t.me/share/url?url=${u}&text=${t}` },
    { cls: 'wa', name: 'WhatsApp', icon: 'fa-brands fa-whatsapp',
      url: (u, t) => `https://wa.me/?text=${t}%20${u}` }
  ];

  function link(b) {
    return b.url(encodeURIComponent(location.href), encodeURIComponent(document.title));
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.className = 'share-bar';
    bar.id = 'share-bar';
    buttons.forEach(b => {
      const a = document.createElement('a');
      a.className = b.cls;
      a.setAttribute('aria-label', 'Share on ' + b.name);
      if (!b.same) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = `<i class="${b.icon}"></i>`;
      a.href = link(b);
      // refresh right before opening, in case the title changed after load
      a.addEventListener('click', () => { a.href = link(b); });
      bar.appendChild(a);
    });
    return bar;
  }

  function insertBar() {
    if (document.getElementById('share-bar')) return true;
    const anchor = root.querySelector('img') || root.querySelector('h1');
    if (!anchor) return false;
    anchor.insertAdjacentElement('afterend', buildBar());
    return true;
  }

  if (!insertBar()) {
    const obs = new MutationObserver(() => { if (insertBar()) obs.disconnect(); });
    obs.observe(root, { childList: true, subtree: true });
  }
})();
