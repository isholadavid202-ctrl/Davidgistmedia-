const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

let CONFIG = null;
function readConfig() {
  if (CONFIG) return CONFIG;
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    try {
      const txt = fs.readFileSync(path.join(ROOT, "js", "config.js"), "utf8");
      if (!url) {
        const m = txt.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i);
        if (m) url = m[0];
      }
      if (!key) {
        const m = txt.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+/);
        if (m) key = m[0];
      }
    } catch (e) {}
  }
  CONFIG = { url, key };
  return CONFIG;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return "";
  }
}

function isoDate(d) {
  const t = new Date(d);
  return isNaN(t.getTime()) ? null : t.toISOString();
}

async function sb(query) {
  const { url, key } = readConfig();
  const r = await fetch(`${url}/rest/v1/${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!r.ok) throw new Error("Supabase " + r.status);
  return r.json();
}

const cache = {};
async function cached(name, ttlMs, loader) {
  const hit = cache[name];
  if (hit && Date.now() - hit.t < ttlMs) return hit.v;
  const v = await loader();
  cache[name] = { t: Date.now(), v };
  return v;
}

function originOf(req) {
  return "https://" + req.get("host");
}

function ldJson(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

app.use((req, res, next) => {
  if (/^\/(server\.js|package(-lock)?\.json|node_modules)/i.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

app.get("/robots.txt", (req, res) => {
  const o = originOf(req);
  res
    .type("text/plain")
    .send(
      `User-agent: *\nAllow: /\nDisallow: /admin.html\n\n` +
        `Sitemap: ${o}/sitemap.xml\nSitemap: ${o}/news-sitemap.xml\n`
    );
});

app.get("/sitemap.xml", async (req, res) => {
  const origin = originOf(req);
  try {
    const rows = await cached("sitemap", 10 * 60 * 1000, () =>
      sb("articles?select=slug,published_at,updated_at&order=published_at.desc&limit=1000")
    );
    const urls = [];
    const pages = ["", "about.html", "contact.html", "editorial-policy.html", "privacy-policy.html", "terms.html"];
    pages.forEach((p) => {
      if (p === "" || fs.existsSync(path.join(ROOT, p))) {
        urls.push(`<url><loc>${esc(origin + "/" + p)}</loc></url>`);
      }
    });
    (Array.isArray(rows) ? rows : []).forEach((a) => {
      if (!a.slug) return;
      const last = isoDate(a.updated_at || a.published_at);
      urls.push(
        `<url><loc>${esc(origin + "/article.html?slug=" + encodeURIComponent(a.slug))}</loc>` +
          (last ? `<lastmod>${last}</lastmod>` : "") +
          `</url>`
      );
    });
    res
      .type("application/xml")
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (e) {
    console.error("Sitemap failed:", e.message);
    res.status(500).type("text/plain").send("Sitemap unavailable");
  }
});

app.get("/news-sitemap.xml", async (req, res) => {
  const origin = originOf(req);
  try {
    const rows = await cached("newsmap", 5 * 60 * 1000, () => {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      return sb(
        `articles?select=title,slug,published_at` +
          `&published_at=gte.${encodeURIComponent(since)}` +
          `&order=published_at.desc&limit=1000`
      );
    });
    const items = [];
    (Array.isArray(rows) ? rows : []).forEach((a) => {
      const pub = isoDate(a.published_at);
      if (!a.slug || !a.title || !pub) return;
      items.push(
        `<url>` +
          `<loc>${esc(origin + "/article.html?slug=" + encodeURIComponent(a.slug))}</loc>` +
          `<news:news>` +
          `<news:publication><news:name>Davidgistmedia</news:name><news:language>en</news:language></news:publication>` +
          `<news:publication_date>${pub}</news:publication_date>` +
          `<news:title>${esc(a.title)}</news:title>` +
          `</news:news>` +
          `</url>`
      );
    });
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n` +
          `${items.join("\n")}\n</urlset>`
      );
  } catch (e) {
    console.error("News sitemap failed:", e.message);
    res.status(500).type("text/plain").send("News sitemap unavailable");
  }
});

app.get(["/", "/index.html"], async (req, res) => {
  let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  try {
    const rows = await cached("home", 60 * 1000, () =>
      sb("articles?select=title,slug,excerpt&order=published_at.desc&limit=20")
    );
    if (Array.isArray(rows) && rows.length) {
      const list = rows
        .map(
          (a) =>
            `<li style="margin:0 0 12px"><a href="article.html?slug=${encodeURIComponent(a.slug)}" style="font-weight:700">${esc(a.title)}</a>` +
            (a.excerpt ? `<br><span style="color:var(--muted);font-size:.9rem">${esc(a.excerpt)}</span>` : "") +
            `</li>`
        )
        .join("");
      const block = `<h2 style="font-family:var(--serif);margin-bottom:12px">Latest stories</h2><ul style="list-style:none">${list}</ul>`;
      html = html.replace(/(<section[^>]*id="hero-section"[^>]*>)\s*(<\/section>)/i, (m, open, close) => open + block + close);
    }
  } catch (e) {
    console.error("Home render failed:", e.message);
  }
  res.set("Cache-Control", "no-cache");
  res.type("html").send(html);
});

app.get(["/article.html", "/article"], async (req, res) => {
  let html = fs.readFileSync(path.join(ROOT, "article.html"), "utf8");
  const slug = req.query.slug ? String(req.query.slug) : "";
  let status = 200;

  if (slug) {
    try {
      const rows = await sb(
        `articles?slug=eq.${encodeURIComponent(slug)}` +
          `&select=title,excerpt,image_url,author,category,content,published_at,updated_at&limit=1`
      );
      const a = Array.isArray(rows) ? rows[0] : null;

      if (Array.isArray(rows) && !a) {
        status = 404;
      }

      if (a) {
        const origin = originOf(req);
        const pageUrl = `${origin}/article.html?slug=${encodeURIComponent(slug)}`;
        const title = a.title || "Davidgistmedia";
        const author = a.author || "Davidgistmedia";
        const plain = String(a.content || "").replace(/\s+/g, " ").trim();
        const desc = a.excerpt || (plain ? plain.slice(0, 160) : "Read the full story on Davidgistmedia.");
        let img = a.image_url || "";
        if (img && !/^https?:\/\//i.test(img)) {
          img = origin + "/" + img.replace(/^\/+/, "");
        }

        const ld = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title.slice(0, 110),
          description: desc,
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          image: img ? [img] : undefined,
          datePublished: isoDate(a.published_at) || undefined,
          dateModified: isoDate(a.updated_at || a.published_at) || undefined,
          author: {
            "@type": "Person",
            name: author,
            url: `${origin}/author.html?name=${encodeURIComponent(author)}`,
          },
          publisher: {
            "@type": "Organization",
            name: "Davidgistmedia",
            url: origin + "/",
            logo: { "@type": "ImageObject", url: origin + "/favicon.png" },
          },
        };

        const tags = `
  <link rel="canonical" href="${esc(pageUrl)}">
  <meta name="description" content="${esc(desc)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Davidgistmedia">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(pageUrl)}">
  ${img ? `<meta property="og:image" content="${esc(img)}">` : ""}
  <meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  ${img ? `<meta name="twitter:image" content="${esc(img)}">` : ""}
  <style>.ssr-body{font-size:1.06rem;line-height:1.8}.ssr-body p{margin-bottom:19px}</style>
  <script type="application/ld+json">${ldJson(ld)}</script>
`;
        html = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, () => `<title id="page-title">${esc(title)} | Davidgistmedia</title>`);
        html = html.replace("</head>", () => tags + "</head>");

        const paragraphs = String(a.content || "")
          .split(/\n+/)
          .filter((p) => p.trim())
          .map((p) => `<p>${esc(p)}</p>`)
          .join("");
        const ssr =
          `<div class="ssr-article">` +
          `<a href="index.html" class="back-link">&larr; Back to home</a>` +
          `<div class="cat">${esc(a.category)}</div>` +
          `<h1>${esc(title)}</h1>` +
          `<div class="meta">${esc(author)} · ${esc(fmtDate(a.published_at))}</div>` +
          (img ? `<img class="hero-img" src="${esc(img)}" alt="${esc(title)}">` : "") +
          `<div class="ssr-body">${paragraphs}</div>` +
          `</div>`;
        html = html.replace(/(<main[^>]*id="article-root"[^>]*>)[\s\S]*?(<\/main>)/i, (m, open, close) => open + ssr + close);
      }
    } catch (e) {
      console.error("Article render failed:", e.message);
    }
  }

  res.set("Cache-Control", "no-cache");
  res.status(status).type("html").send(html);
});

app.use(express.static(ROOT, { extensions: ["html"] }));

app.listen(PORT, () => console.log("Davidgistmedia running on port " + PORT));
