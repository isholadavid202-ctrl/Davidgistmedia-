(function () {
  const root = document.getElementById('article-root');
  if (!root) return;

  const BADGE_NAME  = 'Ishola David';
  const BADGE_TITLE = 'Founder & CEO, Davidgistmedia';

  const css = `
  .share-bar{display:flex;justify-content:center;gap:16px;margin:24px 0}
  .share-bar a{width:100px;height:64px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;text-decoration:none;cursor:pointer}
  .share-bar .fb{background:#4267b2}
  .share-bar .x{background:#000}
  .share-bar .em{background:#777}
  .share-bar .tg{background:#0088cc}
  .share-bar .wa{background:#25d366}
  @media(max-width:480px){.share-bar{gap:8px}.share-bar a{width:18%}}
  .ceo-badge{position:relative;display:inline-block;width:18px;height:18px;margin-left:5px;vertical-align:-3px;cursor:help}
  .ceo-badge .seal{position:absolute;left:0;top:0;font-size:18px;line-height:18px;color:#f97316}
  .ceo-badge .tick{position:absolute;left:0;top:0;width:18px;text-align:center;font-size:9px;line-height:18px;color:#fff}`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

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

  function addBadge() {
    if (root.querySelector('.ceo-badge')) return true;
    const area = root.querySelector('.meta') || root;
    const walker = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const i = node.nodeValue.indexOf(BADGE_NAME);
      if (i === -1) continue;
      node.splitText(i + BADGE_NAME.length);
      const badge = document.createElement('span');
      badge.className = 'ceo-badge';
      badge.title = BADGE_TITLE;
      badge.setAttribute('aria-label', BADGE_TITLE);
      badge.innerHTML = '<i class="fa-solid fa-certificate seal"></i><i class="fa-solid fa-check tick"></i>';
      node.parentNode.insertBefore(badge, node.nextSibling);
      return true;
    }
    return false;
  }

  function run() { insertBar(); addBadge(); }
  run();
  new MutationObserver(run).observe(root, { childList: true, subtree: true });
})();
