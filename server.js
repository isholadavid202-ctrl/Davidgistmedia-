const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

function readConfig() {
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
  return { url, key };
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

app.use((req, res, next) => {
  if (/^\/(server\.js|package(-lock)?\.json|node_modules)/i.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

app.get(["/article.html", "/article"], async (req, res) => {
  let html = fs.readFileSync(path.join(ROOT, "article.html"), "utf8");
  const slug = req.query.slug;

  if (slug) {
    try {
      const { url, key } = readConfig();
      const api =
        `${url}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}` +
        `&select=title,excerpt,image_url,author&limit=1`;
      const r = await fetch(api, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      const rows = await r.json();
      const a = Array.isArray(rows) ? rows[0] : null;

      if (a) {
        const origin = "https://" + req.get("host");
        const pageUrl = origin + req.originalUrl;
        const title = a.title || "Davidgistmedia";
        const desc = a.excerpt || "Read the full story on Davidgistmedia.";
        let img = a.image_url || "";
        if (img && !/^https?:\/\//i.test(img)) {
          img = origin + "/" + img.replace(/^\/+/, "");
        }

        const tags = `
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
  <meta name="description" content="${esc(desc)}">
`;
        html = html.replace(
          /<title[^>]*>[\s\S]*?<\/title>/i,
          `<title id="page-title">${esc(title)} | Davidgistmedia</title>`
        );
        html = html.replace("</head>", tags + "</head>");
      }
    } catch (e) {
      console.error("Preview tags failed:", e.message);
    }
  }

  res.set("Cache-Control", "no-cache");
  res.type("html").send(html);
});

app.use(express.static(ROOT, { extensions: ["html"] }));

app.listen(PORT, () => console.log("Davidgistmedia running on port " + PORT));
