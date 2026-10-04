document.getElementById("year").textContent = new Date().getFullYear();

const BADGE_NAME = "Ishola David";
const BADGE_TITLE = "Founder & CEO, Davidgistmedia";
const BADGE_SVG = (() => {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 9.2 + 1.1 * Math.cos(8 * a);
    pts.push((12 + r * Math.cos(a)).toFixed(2) + "," + (12 + r * Math.sin(a)).toFixed(2));
  }
  return `<svg viewBox="0 0 24 24" width="22" height="22" role="img" aria-label="${BADGE_TITLE}" style="display:inline-block;vertical-align:-3px;margin-left:6px"><title>${BADGE_TITLE}</title><polygon points="${pts.join(" ")}" fill="#f97316"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
})();

const PROFILES = {
  "ishola david": {
    title: "Founder & CEO, Davidgistmedia",
    photo: "YOUR-PHOTO-FILE-NAME.jpg",
    bio: "Ishola David is the Founder and CEO of Davidgistmedia, a Nigerian news and entertainment platform. He writes and publishes stories on entertainment, sports, business and breaking news, with a focus on keeping readers informed quickly and accurately."
  }
};

const profileCss = `
.author-profile{display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;background:var(--paper);border:1px solid var(--line);border-radius:8px;padding:26px 20px;margin:0 0 26px;box-shadow:var(--shadow-sm)}
.author-profile .ap-photo,.author-profile .ap-initials{width:112px;height:112px;border-radius:50%;border:3px solid #f97316;object-fit:cover;flex-shrink:0}
.author-profile .ap-initials{display:flex;align-items:center;justify-content:center;background:#fff3e8;color:#c2570c;font-family:var(--serif);font-size:2.2rem;font-weight:700}
.author-profile .ap-title{color:#c2570c;font-weight:800;font-size:0.82rem;letter-spacing:0.4px;text-transform:uppercase}
.author-profile .ap-bio{max-width:560px;font-size:0.97rem;line-height:1.7;color:#3d3d3a}
@media(min-width:640px){.author-profile{flex-direction:row;text-align:left;align-items:center;padding:28px}}`;
const profileStyle = document.createElement("style");
profileStyle.textContent = profileCss;
document.head.appendChild(profileStyle);

function renderProfile(name) {
  const p = PROFILES[name.trim().toLowerCase()];
  if (!p || document.getElementById("author-profile")) return;

  const card = document.createElement("div");
  card.id = "author-profile";
  card.className = "author-profile";

  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const fallback = document.createElement("div");
  fallback.className = "ap-initials";
  fallback.textContent = initials;

  const img = document.createElement("img");
  img.className = "ap-photo";
  img.alt = name;
  img.src = p.photo;
  img.onerror = () => img.replaceWith(fallback);

  const text = document.createElement("div");
  text.innerHTML = `<div class="ap-title">${escapeHtml(p.title)}</div><p class="ap-bio" style="margin-top:8px">${escapeHtml(p.bio)}</p>`;

  card.appendChild(img);
  card.appendChild(text);
  document.getElementById("author-root").insertAdjacentElement("beforebegin", card);
}

async function loadAuthorStories() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const root = document.getElementById("author-root");
  const heading = document.getElementById("author-heading");

  if (!name) {
    root.innerHTML = `<div class="empty-state">No author specified.</div>`;
    return;
  }

  const isCeo = name.trim().toLowerCase() === BADGE_NAME.toLowerCase();
  heading.innerHTML = escapeHtml(name) + (isCeo ? BADGE_SVG : "");
  document.getElementById("page-title").textContent = `${name} | Davidgistmedia`;
  renderProfile(name);

  const { data, error } = await supabaseClient
    .from("articles")
    .select("*")
    .eq("author", name)
    .order("published_at", { ascending: false });

  if (error) {
    root.innerHTML = `<div class="empty-state">Couldn't load stories right now.</div>`;
    return;
  }
  if (!data || data.length === 0) {
    root.innerHTML = `<div class="empty-state">No stories from ${escapeHtml(name)} yet.</div>`;
    return;
  }

  root.innerHTML = `
    <div class="card-grid">
      ${data.map((a) => `
        <a class="story-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
          ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="">` : ""}
          <div class="body">
            <div class="cat">${escapeHtml(a.category)}</div>
            <h3>${escapeHtml(a.title)}</h3>
            <div class="meta">${formatDate(a.published_at)}</div>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

loadAuthorStories();
