/* One script for both pages.
   live.html sets nothing, so it runs in video mode.
   live-audio.html sets window.LIVE_MODE = "audio" before loading this file. */
const MODE = window.LIVE_MODE === "audio" ? "audio" : "video";
const SETTING_KEY = MODE === "audio" ? "live_audio_url" : "live_stream_url";
const ROOM = MODE;
const SHARE_TITLE = MODE === "audio"
  ? "Listen live on Davidgistmedia"
  : "Watch live on Davidgistmedia";

var yr = document.getElementById("year");
if (yr) yr.textContent = new Date().getFullYear();

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ================= Styles ================= */

function liveStyles() {
  if (document.getElementById("live-style")) return;
  const st = document.createElement("style");
  st.id = "live-style";
  st.textContent =
    /* audio player with picture */
    ".la{border-radius:8px;background:#161617;color:#fff;text-align:center;padding:24px 18px}" +
    ".la-live{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:#ff5c72;margin-bottom:16px}" +
    ".la-dot{width:9px;height:9px;border-radius:50%;background:#ff5c72;display:inline-block;animation:lapulse 1.4s infinite}" +
    ".la-cover{width:150px;height:150px;margin:0 auto 14px;border-radius:12px;overflow:hidden;background:#2a2a2d;display:grid;place-items:center}" +
    ".la-cover img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".la-cover.la-noimg::after{content:'DG';font-family:var(--serif);font-weight:700;font-size:2.6rem;color:#fff}" +
    ".la-bars{display:flex;align-items:flex-end;justify-content:center;gap:4px;height:28px;margin:0 auto 14px}" +
    ".la-bars span{width:5px;height:28px;background:#e8344c;border-radius:2px;transform-origin:bottom;animation:labar 1s ease-in-out infinite}" +
    ".la-bars span:nth-child(1){animation-delay:-.4s}.la-bars span:nth-child(2){animation-delay:-.2s}" +
    ".la-bars span:nth-child(3){animation-delay:-.6s}.la-bars span:nth-child(4){animation-delay:-.1s}" +
    ".la-bars span:nth-child(5){animation-delay:-.5s}" +
    "@keyframes labar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}" +
    "@keyframes lapulse{50%{opacity:.3}}" +
    "@media(prefers-reduced-motion:reduce){.la-bars span,.la-dot{animation:none}}" +
    ".la-title{font-family:var(--serif);font-weight:700;font-size:1.15rem;margin:0 0 4px}" +
    ".la-sub{color:#c9c9c6;font-size:.92rem;margin:0 0 16px}" +
    ".la audio{width:100%}" +
    /* player wrapper */
    ".lv-container{position:relative;width:100%;padding-top:56.25%;border-radius:8px;overflow:hidden;background:#000}" +
    ".lv-container iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    ".lv-top-shield{position:absolute;top:0;left:0;right:0;height:60px;z-index:10}" +
    ".lv-bottom-shield{position:absolute;bottom:0;right:0;width:180px;height:50px;z-index:10}" +
    /* full shield + custom controls (blocks every YouTube link) */
    ".lv-container:fullscreen{padding-top:0;height:100%;border-radius:0}" +
    ".lv-container:-webkit-full-screen{padding-top:0;height:100%;border-radius:0}" +
    ".lv-shield{position:absolute;inset:0;z-index:10}" +
    ".lv-controls{position:absolute;left:0;right:0;bottom:0;z-index:11;display:flex;gap:8px;padding:28px 10px 10px;background:linear-gradient(transparent,rgba(0,0,0,.7))}" +
    ".lv-btn{border:0;border-radius:6px;background:rgba(0,0,0,.6);color:#fff;font:inherit;font-weight:700;font-size:.85rem;padding:8px 14px;cursor:pointer}" +
    ".lv-btn.lv-unmute{background:var(--red)}" +
    /* like, views and share */
    ".lx-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-top:18px}" +
    ".lx-group{display:flex;gap:10px}" +
    ".lx-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid var(--line);border-radius:4px;background:var(--paper);color:var(--ink);font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}" +
    ".lx-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".lx-btn:hover{border-color:var(--ink)}" +
    ".lx-btn.liked{color:var(--red);border-color:var(--red)}" +
    ".lx-views{display:inline-flex;align-items:center;gap:6px;font-size:.9rem;font-weight:700;color:var(--muted);padding:0 4px}" +
    ".lx-views svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".lx-icons{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px}" +
    ".lx-icons a{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:1.05rem;background:var(--paper);text-decoration:none}" +
    ".lx-icons a:hover{border-color:var(--ink);color:var(--red)}" +
    /* chat */
    ".lc{margin-top:22px;border:1px solid var(--line);border-radius:8px;background:var(--paper);overflow:hidden}" +
    ".lc-head{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line);font-weight:800;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase}" +
    ".lc-dot{width:8px;height:8px;border-radius:50%;background:var(--red);display:inline-block}" +
    ".lc-list{height:320px;overflow-y:auto;padding:12px 16px;-webkit-overflow-scrolling:touch}" +
    ".lc-msg{margin:0 0 12px;line-height:1.4;overflow-wrap:anywhere}" +
    ".lc-name{font-weight:800;margin-right:6px;display:inline-flex;align-items:center;gap:4px}" +
    ".lc-name a{color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:4px}" +
    ".lc-name a:hover{text-decoration:underline}" +
    ".lc-vbadge{width:15px;height:15px;display:inline-block;vertical-align:middle;flex-shrink:0}" +
    ".lc-time{color:var(--muted);font-size:.75rem;margin-left:6px;white-space:nowrap}" +
    ".lc-text{color:var(--ink)}" +
    ".lc-empty{color:var(--muted);font-size:.92rem}" +
    ".lc-form{display:flex;flex-direction:column;gap:8px;padding:12px 16px;border-top:1px solid var(--line)}" +
    ".lc-form input,.lc-form textarea{width:100%;padding:10px 12px;border:1px solid #8a8a8a;border-radius:4px;font:inherit;font-size:.95rem;background:var(--paper);color:var(--ink);box-sizing:border-box}" +
    ".lc-form textarea{resize:none;height:64px}" +
    ".lc-form input:focus,.lc-form textarea:focus{outline:2px solid var(--red);outline-offset:1px}" +
    ".lc-row{display:flex;align-items:center;justify-content:space-between;gap:10px}" +
    ".lc-form button{background:var(--red);color:#fff;font-weight:800;padding:10px 20px;border:0;border-radius:4px;cursor:pointer}" +
    ".lc-form button:disabled{opacity:.6}" +
    ".lc-status{font-size:.82rem;color:var(--muted);min-height:1em}";
  document.head.appendChild(st);
}

/* ================= Player ================= */

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    let videoId = null;
    if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      if (u.searchParams.get("v")) videoId = u.searchParams.get("v");
      else {
        const parts = u.pathname.split("/").filter(Boolean);
        if ((parts[0] === "live" || parts[0] === "embed") && parts[1]) videoId = parts[1];
      }
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    }
  } catch {
    return null;
  }
  return url;
}

function playerFor(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;

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

  if (/<iframe/i.test(value)) {
    const src = value.match(/src\s*=\s*["']([^"']+)["']/i);
    const h = value.match(/height\s*=\s*["']?(\d+)/i);
    if (!src) return { type: "bad" };
    const url = src[1].replace(/&amp;/g, "&");
    if (!/^https:\/\//i.test(url)) return { type: "bad" };

    /* a pasted YouTube iframe gets the same protection as a plain link */
    if (/youtube\.com|youtube-nocookie\.com|youtu\.be/i.test(url)) {
      const e = toEmbedUrl(url);
      if (e && e !== url) return { type: "video", url: e };
    }

    const height = Math.min(Math.max(parseInt(h && h[1], 10) || 200, 80), 600);
    return { type: "frame", url: url, height: height };
  }

  const embed = toEmbedUrl(value);
  if (!embed || !/^https:\/\//i.test(embed)) return { type: "bad" };
  return { type: "video", url: embed };
}

/* ---- YouTube control (own buttons, no YouTube links reachable) ---- */

let ytPlayer = null;
let ytApiPromise = null;

function loadYTApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (prev) prev();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return ytApiPromise;
}

function stopYT() {
  if (ytPlayer && ytPlayer.destroy) {
    try { ytPlayer.destroy(); } catch (e) {}
  }
  ytPlayer = null;
}

function startYT(root) {
  const box = root.querySelector("#lv-box");
  const frame = root.querySelector("#lv-frame");
  const muteBtn = root.querySelector("#lv-mute");
  const fullBtn = root.querySelector("#lv-full");
  const canFull = box.requestFullscreen || box.webkitRequestFullscreen;
  if (!canFull) fullBtn.style.display = "none";

  function fallback() {
    /* if the YouTube API can't load, use the small corner shields instead */
    const shield = box.querySelector(".lv-shield");
    const controls = box.querySelector(".lv-controls");
    if (shield) shield.remove();
    if (controls) controls.remove();
    box.insertAdjacentHTML("afterbegin", '<div class="lv-top-shield"></div><div class="lv-bottom-shield"></div>');
  }

  loadYTApi().then(() => {
    ytPlayer = new YT.Player(frame, {
      events: {
        onReady: () => {
          muteBtn.style.display = ytPlayer.isMuted() ? "" : "none";
        },
        onStateChange: (ev) => {
          /* keep the broadcast live: if it ever gets paused, play it again */
          if (ev.data === 2) ytPlayer.playVideo();
        }
      }
    });
  }).catch(fallback);

  muteBtn.addEventListener("click", () => {
    if (!ytPlayer || !ytPlayer.unMute) return;
    ytPlayer.unMute();
    ytPlayer.setVolume(100);
    muteBtn.style.display = "none";
  });

  fullBtn.addEventListener("click", () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      (box.requestFullscreen || box.webkitRequestFullscreen).call(box);
    }
  });
}

const NO_LIVE = MODE === "audio"
  ? `<div class="empty-state">No live audio right now. Check back soon, or follow our social channels for a notification when we go live.</div>`
  : `<div class="empty-state">No live broadcast right now. Check back soon, or follow our social channels for a notification when we go live.</div>`;
const BAD_LINK = `<div class="empty-state">The live stream link couldn't be loaded.</div>`;

function render(root, p) {
  stopYT();

  if (p.type === "audio") {
    root.innerHTML = `
      <div class="la">
        <div class="la-live"><span class="la-dot"></span> Live now</div>
        <div class="la-cover">
          <img src="apple-touch-icon.png" alt="Davidgistmedia" onerror="this.parentNode.classList.add('la-noimg');this.remove()">
        </div>
        <div class="la-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
        <p class="la-title">Davidgistmedia Live Audio</p>
        <p class="la-sub">Press play to listen to our live broadcast.</p>
        <audio controls preload="none" src="${esc(p.url)}"></audio>
      </div>
    `;
    return;
  }

  if (p.type === "video") {
    root.innerHTML = `
      <div class="lv-container" id="lv-box">
        <iframe id="lv-frame" src="${esc(p.url)}" title="Live broadcast" allow="autoplay; encrypted-media; picture-in-picture"></iframe>
        <div class="lv-shield"></div>
        <div class="lv-controls">
          <button type="button" class="lv-btn lv-unmute" id="lv-mute">🔊 Tap to unmute</button>
          <button type="button" class="lv-btn" id="lv-full" style="margin-left:auto" aria-label="Fullscreen">⛶</button>
        </div>
      </div>
    `;
    startYT(root);
    return;
  }

  if (p.type === "frame") {
    root.innerHTML = `
      <div class="lv-container">
        <div class="lv-top-shield"></div>
        <div class="lv-bottom-shield"></div>
        <iframe src="${esc(p.url)}" title="Live broadcast" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
    return;
  }

  root.innerHTML = BAD_LINK;
}

/* ================= Stats, Share & Chat ================= */

const CHAT_MAX_SHOWN = 50;
const CHAT_WINDOW_HOURS = 12;
const CHAT_COOLDOWN_MS = 4000;
const CHAT_POLL_MS = 4000;

let extrasEl = null;
let chatEl = null;
let chatTimer = null;
let chatBusy = false;
let chatLastSig = "";
let chatLastSent = 0;
let pollTicks = 0;
let likeBusy = false;

function savedChatName() {
  try { return localStorage.getItem("dg_chat_name") || ""; } catch (e) { return ""; }
}
function saveChatName(n) {
  try { localStorage.setItem("dg_chat_name", n); } catch (e) {}
}

function getLiveLiked() {
  try { return localStorage.getItem("dg_live_liked_" + ROOM) === "1"; } catch (e) { return false; }
}
function setLiveLiked(on) {
  try {
    if (on) localStorage.setItem("dg_live_liked_" + ROOM, "1");
    else localStorage.removeItem("dg_live_liked_" + ROOM);
  } catch (e) {}
}

function chatTime(d) {
  const t = new Date(d);
  if (isNaN(t.getTime())) return "";
  return t.toLocaleTimeString("en-GB", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos"
  }).replace(/am|pm/i, (m) => m.toUpperCase());
}

async function refreshStats() {
  if (!extrasEl || likeBusy || document.hidden) return;
  try {
    const r = await supabaseClient
      .from("live_stats")
      .select("likes, viewers")
      .eq("room", ROOM)
      .maybeSingle();
    if (!r.error && r.data && extrasEl) {
      const likesEl = extrasEl.querySelector("#lx-like-count");
      const viewsEl = extrasEl.querySelector("#lx-view-count");
      if (likesEl) likesEl.textContent = r.data.likes || 0;
      if (viewsEl) viewsEl.textContent = r.data.viewers || 1;
    }
  } catch (e) {}
}

async function registerViewer(isEntering) {
  try {
    await supabaseClient.rpc("live_view", {
      p_room: ROOM,
      p_delta: isEntering ? 1 : -1
    });
  } catch (e) {}
}

async function handleLiveLike() {
  if (!extrasEl || likeBusy) return;
  likeBusy = true;

  const btn = extrasEl.querySelector("#lx-like");
  const countEl = extrasEl.querySelector("#lx-like-count");
  const wasLiked = getLiveLiked();
  const before = parseInt(countEl.textContent, 10) || 0;
  const after = wasLiked ? Math.max(before - 1, 0) : before + 1;

  btn.classList.toggle("liked", !wasLiked);
  btn.setAttribute("aria-pressed", String(!wasLiked));
  countEl.textContent = after;

  let failed = false;
  let newCount = null;
  try {
    const r = await supabaseClient.rpc("live_like", {
      p_room: ROOM,
      p_delta: wasLiked ? -1 : 1
    });
    if (r.error) failed = true;
    else if (typeof r.data === "number") newCount = r.data;
  } catch (e) {
    failed = true;
  }

  if (failed) {
    btn.classList.toggle("liked", wasLiked);
    btn.setAttribute("aria-pressed", String(wasLiked));
    countEl.textContent = before;
    alert("Couldn't save that. Please try again.");
  } else {
    setLiveLiked(!wasLiked);
    if (newCount !== null) countEl.textContent = newCount;
  }
  likeBusy = false;
}

function handleLiveShare() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title: SHARE_TITLE, url: url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => alert("Link copied to clipboard."));
  }
}

function shareIconsHtml() {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(SHARE_TITLE);
  return `
    <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f"></i></a>
    <a href="https://x.com/intent/post?text=${title}&url=${url}&via=Davidgistmedian" target="_blank" rel="noopener noreferrer" aria-label="Share on X"><i class="fa-brands fa-x-twitter"></i></a>
    <a href="mailto:?subject=${title}&body=${title}%0A${url}" aria-label="Share by email"><i class="fa-solid fa-envelope"></i></a>
    <a href="https://t.me/share/url?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" aria-label="Share on Telegram"><i class="fa-brands fa-telegram"></i></a>
    <a href="https://wa.me/?text=${title}%20${url}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
  `;
}

/* Orange SVG Verified Badge Icon */
const VERIFIED_BADGE_SVG = `<svg class="lc-vbadge" viewBox="0 0 24 24" title="Verified Publisher"><path fill="#ff5722" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"/><path fill="#ffffff" d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4z"/></svg>`;

function drawChat(list) {
  if (!chatEl) return;
  const box = chatEl.querySelector(".lc-list");
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  const first = !box.dataset.drawn;

  if (!list.length) {
    box.innerHTML = `<div class="lc-empty">No messages yet. Say hello!</div>`;
  } else {
    box.innerHTML = list.map((m) => {
      const rawName = m.name || "Guest";
      const isAdmin = rawName.toLowerCase() === "ishola david" || rawName.toLowerCase() === "david gist media";

      const displayName = isAdmin
        ? `<a href="author.html" target="_blank" rel="noopener noreferrer">${esc(rawName)}${VERIFIED_BADGE_SVG}</a>`
        : esc(rawName);

      return `
        <div class="lc-msg">
          <span class="lc-name">${displayName}</span><span class="lc-text">${esc(m.content)}</span><span class="lc-time">${esc(chatTime(m.created_at))}</span>
        </div>
      `;
    }).join("");
  }

  box.dataset.drawn = "1";
  if (first || nearBottom) box.scrollTop = box.scrollHeight;
}

async function pollChat() {
  if (!chatEl || document.hidden || chatBusy) return;
  chatBusy = true;
  try {
    const since = new Date(Date.now() - CHAT_WINDOW_HOURS * 3600 * 1000).toISOString();
    const res = await supabaseClient
      .from("live_messages")
      .select("id,name,content,created_at")
      .eq("room", ROOM)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(CHAT_MAX_SHOWN);

    if (res.error || !res.data || !chatEl) return;

    const list = res.data.slice().reverse();
    const sig = list.map((m) => m.id).join(",");
    if (sig === chatLastSig) return;
    chatLastSig = sig;
    drawChat(list);
  } catch (e) {
  } finally {
    chatBusy = false;
  }
}

async function sendChat(e) {
  e.preventDefault();
  const nameIn = chatEl.querySelector(".lc-name-input");
  const textIn = chatEl.querySelector(".lc-text-input");
  const btn = chatEl.querySelector(".lc-send");
  const status = chatEl.querySelector(".lc-status");

  const content = textIn.value.trim();
  if (!content) return;

  if (Date.now() - chatLastSent < CHAT_COOLDOWN_MS) {
    status.textContent = "Please wait a few seconds before sending another message.";
    return;
  }

  const name = (nameIn.value.trim() || "Guest").slice(0, 40);
  btn.disabled = true;
  status.textContent = "";

  let error = null;
  try {
    const r = await supabaseClient
      .from("live_messages")
      .insert({ name: name, content: content.slice(0, 300), room: ROOM });
    error = r.error;
  } catch (err) {
    error = err;
  }

  btn.disabled = false;

  if (error) {
    status.textContent = "Couldn't send your message. Please try again.";
    return;
  }

  saveChatName(name === "Guest" ? "" : name);
  chatLastSent = Date.now();
  textIn.value = "";
  chatLastSig = "";
  pollChat();
}

function showExtras() {
  if (extrasEl) return;
  const root = document.getElementById("live-root");
  if (!root) return;

  const liked = getLiveLiked();

  extrasEl = document.createElement("div");
  extrasEl.id = "live-extras";
  extrasEl.innerHTML = `
    <div class="lx-actions">
      <div class="lx-group">
        <button type="button" class="lx-btn ${liked ? "liked" : ""}" id="lx-like" aria-pressed="${liked}">
          <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          <span id="lx-like-count">0</span> Like
        </button>
        <div class="lx-views" title="Current viewers watching on the site">
          <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span id="lx-view-count">1</span> Watching
        </div>
      </div>
      <button type="button" class="lx-btn" id="lx-share">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg>
        Share
      </button>
    </div>
    <div class="lx-icons" aria-label="Share this live broadcast">${shareIconsHtml()}</div>

    <section class="lc" aria-label="Live chat">
      <div class="lc-head"><span class="lc-dot"></span> Live chat</div>
      <div class="lc-list" aria-live="polite"><div class="lc-empty">Loading chat…</div></div>
      <form class="lc-form">
        <input class="lc-name-input" type="text" maxlength="40" placeholder="Your name (optional)" value="${esc(savedChatName())}" aria-label="Your name">
        <textarea class="lc-text-input" maxlength="300" placeholder="Write a message…" required aria-label="Your message"></textarea>
        <div class="lc-row">
          <span class="lc-status" role="status"></span>
          <button class="lc-send" type="submit">Send</button>
        </div>
      </form>
    </section>
  `;
  root.insertAdjacentElement("afterend", extrasEl);

  chatEl = extrasEl.querySelector(".lc");
  extrasEl.querySelector("#lx-like").addEventListener("click", handleLiveLike);
  extrasEl.querySelector("#lx-share").addEventListener("click", handleLiveShare);
  chatEl.querySelector(".lc-form").addEventListener("submit", sendChat);

  registerViewer(true);
  refreshStats();
  pollChat();
  pollTicks = 0;
  chatTimer = setInterval(function () {
    pollChat();
    pollTicks++;
    if (pollTicks % 5 === 0) refreshStats();
  }, CHAT_POLL_MS);

  window.addEventListener("beforeunload", function () {
    registerViewer(false);
  });
}

function hideExtras() {
  if (chatTimer) {
    clearInterval(chatTimer);
    chatTimer = null;
  }
  if (extrasEl) {
    registerViewer(false);
    extrasEl.remove();
    extrasEl = null;
  }
  chatEl = null;
  chatLastSig = "";
}

let lastValue = null;

async function loadLive() {
  const root = document.getElementById("live-root");
  if (!root) return;

  liveStyles();

  let res;
  try {
    res = await supabaseClient
      .from("settings")
      .select("value")
      .eq("key", SETTING_KEY)
      .maybeSingle();
  } catch (e) {
    res = { error: e };
  }

  const data = res.data;
  const error = res.error;

  if (error) {
    if (lastValue === null) {
      stopYT();
      root.innerHTML = NO_LIVE;
      hideExtras();
    }
    return;
  }

  const value = data && data.value ? String(data.value).trim() : "";

  if (value === lastValue) return;
  lastValue = value;

  if (!value) {
    stopYT();
    root.innerHTML = NO_LIVE;
    hideExtras();
    return;
  }

  const player = playerFor(value);
  if (!player) {
    stopYT();
    root.innerHTML = NO_LIVE;
    hideExtras();
    return;
  }

  render(root, player);

  if (player.type === "bad") hideExtras();
  else showExtras();
}

loadLive();
setInterval(loadLive, 30000);
