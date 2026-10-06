(function () {
  const root = document.getElementById('article-root');
  if (!root) return;

  /* ---- Verification badges (data-driven) ---- */
  const DGB = (() => {
    const map = {};
    let loaded = null;
    const key = (n) => String(n || '').trim().toLowerCase();
    const esc = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    function load() {
      if (loaded) return loaded;
      loaded = (async () => {
        try {
          const { data } = await supabaseClient.from('verified_authors').select('name,title,kind');
          (data || []).forEach((r) => { map[key(r.name)] = r; });
        } catch (e) {}
      })();
      return loaded;
    }
    function get(name) { return map[key(name)] || null; }
    function svg(b, size) {
      const color = b.kind === 'owner' ? '#f97316' : '#1d9bf0';
      const pts = [];
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const r = 9.2 + 1.1 * Math.cos(8 * a);
        pts.push((12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2));
      }
      const t = esc(b.title);
      return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" role="img" aria-label="' + t +
        '" style="display:inline-block;vertical-align:-3px;margin-left:5px"><title>' + t + '</title>' +
        '<polygon points="' + pts.join(' ') + '" fill="' + color + '"/>' +
        '<path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    return { load, get, svg };
  })();

  const css = `
  .share-bar{display:flex;justify-content:center;gap:16px;margin:24px 0}
  .share-bar a{width:100px;height:64px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;text-decoration:none;cursor:pointer}
  .share-bar .fb{background:#4267b2}
  .share-bar .x{background:#000}
  .share-bar .em{background:#777}
  .share-bar .tg{background:#0088cc}
  .share-bar .wa{background:#25d366}
  @media(max-width:480px){.share-bar{gap:8px}.share-bar a{width:18%}}`;
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
    const meta = root.querySelector('.meta');
    if (!meta || meta.querySelector('.dg-vbadge')) return;
    const a = meta.querySelector('a[href*="author.html"]');
    if (!a) return;
    const b = DGB.get(a.textContent);
    if (!b) return;
    const span = document.createElement('span');
    span.className = 'dg-vbadge';
    span.innerHTML = DGB.svg(b, 16);
    a.insertAdjacentElement('afterend', span);
  }

  function run() { insertBar(); addBadge(); }
  run();
  new MutationObserver(run).observe(root, { childList: true, subtree: true });
  DGB.load().then(run);
})();
