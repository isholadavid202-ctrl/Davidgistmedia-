var yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "live" && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
    }
  } catch {
    return null;
  }
  return url;
}

/* Works out what kind of player to show from the saved setting */
function playerFor(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;

  /* 1. Audio: "audio:https://..." or a direct audio file link */
  let audioUrl = null;
  if (/^audio:/i.test(value)) {
    audioUrl = value.replace(/^audio:\s*/i, "");
  } else if (/^https?:\/\/\S+\.(mp3|aac|ogg|m4a|wav)(\?\S*)?$/i.test(value)) {
    audioUrl = value;
  }
  if (audioUrl) {
    if (!/^https:\/\//i.test(audioUrl)) return { type: "bad" };
    return { type: "audio", url: audioUrl };
  }

  /* 2. Embed code pasted from a radio service: <iframe src="...">  */
  if (/<iframe/i.test(value)) {
    const src = value.match(/src\s*=\s*["']([^"']+)["']/i);
    const h = value.match(/height\s*=\s*["']?(\d+)/i);
    if (!src) return { type: "bad" };
    const url = src[1].replace(/&amp;/g, "&");
    if (!/^https:\/\//i.test(url)) return { type: "bad" };
    const height = Math.min(Math.max(parseInt(h && h[1], 10) || 200, 80), 600);
    return { type: "frame", url: url, height: height };
  }

  /* 3. Video: YouTube link (or another page that allows embedding) */
  const embed = toEmbedUrl(value);
  if (!embed || !/^https:\/\//i.test(embed)) return { type: "bad" };
  return { type: "video", url: embed };
}

const NO_LIVE = `<div class="empty-state">No live broadcast right now. Check back soon, or follow our social channels for a notification when we go live.</div>`;
const BAD_LINK = `<div class="empty-state">The live stream link couldn't be loaded.</div>`;

function render(root, p) {
  if (p.type === "audio") {
    root.innerHTML = `
      <div style="border:1px solid var(--line);border-radius:8px;padding:22px 18px;background:var(--paper);text-align:center">
        <div style="display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--red);margin-bottom:12px">
          <span style="width:9px;height:9px;border-radius:50%;background:var(--red);display:inline-block"></span> Live now
        </div>
        <p style="margin:0 0 16px;color:var(--muted)">Press play to listen to our live broadcast.</p>
        <audio controls preload="none" src="${esc(p.url)}" style="width:100%"></audio>
      </div>
    `;
    return;
  }

  if (p.type === "frame") {
    root.innerHTML = `
      <iframe src="${esc(p.url)}" title="Live broadcast" allow="autoplay; encrypted-media"
        style="width:100%;height:${p.height}px;border:0;border-radius:8px;background:var(--paper)"></iframe>
    `;
    return;
  }

  if (p.type === "video") {
    root.innerHTML = `
      <div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-md);background:#000">
        <iframe src="${esc(p.url)}" title="Live broadcast" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
          style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
      </div>
    `;
    return;
  }

  root.innerHTML = BAD_LINK;
}

let lastValue = null;

async function loadLive() {
  const root = document.getElementById("live-root");
  if (!root) return;

  let res;
  try {
    res = await supabaseClient
      .from("settings")
      .select("value")
      .eq("key", "live_stream_url")
      .maybeSingle();
  } catch (e) {
    res = { error: e };
  }

  const data = res.data;
  const error = res.error;

  /* A short hiccup must not wipe a stream that is already playing */
  if (error) {
    if (lastValue === null) root.innerHTML = NO_LIVE;
    return;
  }

  const value = data && data.value ? String(data.value).trim() : "";

  /* Nothing changed, so leave the player alone (re-drawing would restart the stream) */
  if (value === lastValue) return;
  lastValue = value;

  if (!value) {
    root.innerHTML = NO_LIVE;
    return;
  }

  const player = playerFor(value);
  if (!player) {
    root.innerHTML = NO_LIVE;
    return;
  }
  render(root, player);
}

loadLive();
setInterval(loadLive, 30000);
