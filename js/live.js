/* One script for both pages.
   live.html sets nothing, so it runs in video mode.
   live-audio.html sets window.LIVE_MODE = "audio" before loading this file. */
const MODE = window.LIVE_MODE === "audio" ? "audio" : "video";
const SETTING_KEY = MODE === "audio" ? "live_audio_url" : "live_stream_url";
const ROOM = MODE;
const SHARE_TITLE = MODE === "audio"
  ? "Listen live on Davidgistmedia"
  : "Watch live on Davidgistmedia";

/* ===== GIFT BOX: your bank details =====
   Leave all three empty ("") to hide the gift box. */
const GIFT_BANK = "Zenith Bank";
const GIFT_ACCOUNT_NAME = "Ishola David";
const GIFT_ACCOUNT_NUMBER = "4242274467";
/* ======================================= */

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
    /* like and share */
    ".lx-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}" +
    ".lx-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid var(--line);border-radius:4px;background:var(--paper);color:var(--ink);font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}" +
    ".lx-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}" +
    ".lx-btn:hover{border-color:var(--ink)}" +
    ".lx-btn.liked{color:var(--red);border-color:var(--red)}" +
    ".lx-icons{display:flex;flex-wrap:wrap;gap:12px;margin-top:14px}" +
    ".lx-icons a{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:8px;color:var(--ink);font-size:1.05rem;background:var(--paper);text-decoration:none}" +
    ".lx-icons a:hover{border-color:var(--ink);color:var(--red)}" +
    /* gift box */
    ".lg{margin-top:22px;border:1px solid var(--line);border-left:4px solid var(--ink);border-radius:8px;background:var(--paper);padding:16px}" +
    ".lg h3{font-family:var(--font);font-size:.95rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;margin:0 0 6px}" +
    ".lg p{margin:0 0 12px;font-size:.9rem;line-height:1.5;color:var(--muted)}" +
    ".lg-rows{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0 0 12px;font-size:.95rem}" +
    ".lg-rows dt{color:var(--muted)}" +
    ".lg-rows dd{margin:0;font-weight:700;overflow-wrap:anywhere}" +
    ".lg-num{font-size:1.15rem;letter-spacing:.06em}" +
    ".lg-copy{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid var(--ink);border-radius:4px;background:var(--paper);color:var(--ink);font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}" +
    ".lg-copy:hover{background:var(--ink);color:var(--paper)}" +
    ".lg-note{margin:12px 0 0;font-size:.8rem;color:var(--muted)}" +
    /* chat */
    ".lc{margin-top:22px;border:1px solid var(--line);border-radius:8px;background:var(--paper);overflow:hidden}" +
    ".lc-head{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--line);font-weight:800;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase}" +
    ".lc-dot{width:8px;height:8px;border-radius:50%;background:var(--red);display:inline-block}" +
    ".lc-list{height:320px;overflow-y:auto;padding:12px 16px;-webkit-overflow-scrolling:touch}" +
    ".lc-msg{margin:0 0 12px;line-height:1.4;overflow-wrap:anywhere}" +
    ".lc-name{font-weight:800;margin-right:6px}" +
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

  /* 2. Embed code pasted from a streaming service: <iframe src="...">  */
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

const NO_LIVE = MODE === "audio"
  ? `<div class="empty-state">No live audio right now. Check back soon, or follow our social channels for a notification when we go live.</div>`
  : `<div class="empty-state">No live broadcast right now. Check back soon, or follow our social channels for a notification when we go live.</div>`;
const BAD_LINK = `<div class="empty-state">The live stream link couldn't be loaded.</div>`;

function render(root, p) {
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

/* ================= Like, share, gift and chat (each page has its own room) ================= */

const CHAT_MAX_SHOWN = 50;        // newest messages shown
const CHAT_WINDOW_HOURS = 12;     // older messages are not shown
const CHAT_COOLDOWN_MS = 4000;    // wait between two messages from one person
const CHAT_POLL_MS = 4000;        // how often new messages are fetched

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

/* ---- Likes ---- */
async function refreshLikes() {
  if (!extrasEl || likeBusy || document.hidden) return;
  try {
    const r = await supabaseClient
      .from("live_stats")
      .select("likes")
      .eq("room", ROOM)
      .maybeSingle();
    if (!r.error && r.data && extrasEl) {
      extrasEl.querySelector("#lx-like-count").textContent = r.data.likes || 0;
    }
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

  /* Show the change straight away, and undo it if Supabase says no */
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

/* ---- Share ---- */
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

/* ---- Gift box (bank transfer) ---- */
function giftEnabled() {
  return !!(GIFT_BANK.trim() && GIFT_ACCOUNT_NAME.trim() && GIFT_ACCOUNT_NUMBER.trim());
}

function giftHtml() {
  if (!giftEnabled()) return "";
  return `
    <section class="lg" aria-label="Send a gift to the host">
      <h3>Send a gift to the host</h3>
      <p>Gifts are optional and voluntary. They do not buy coverage and do not influence what we report.</p>
      <dl class="lg-rows">
        <dt>Bank</dt><dd>${esc(GIFT_BANK.trim())}</dd>
        <dt>Account name</dt><dd>${esc(GIFT_ACCOUNT_NAME.trim())}</dd>
        <dt>Account number</dt><dd class="lg-num" id="lg-number">${esc(GIFT_ACCOUNT_NUMBER.trim())}</dd>
      </dl>
      <button type="button" class="lg-copy" id="lg-copy">Copy account number</button>
      <p class="lg-note">Send a transfer from your bank app. Davidgistmedia will never ask you for your card details or PIN in the chat.</p>
    </section>
  `;
}

function copyGiftNumber() {
  const num = GIFT_ACCOUNT_NUMBER.trim();
  const btn = extrasEl && extrasEl.querySelector("#lg-copy");

  function done() {
    if (!btn) return;
    btn.textContent = "Copied";
    setTimeout(function () { if (btn) btn.textContent = "Copy account number"; }, 2000);
  }
  function fallback() {
    try {
      const ta = document.createElement("textarea");
      ta.value = num;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done();
    } catch (e) {
      alert("Account number: " + num);
    }
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).then(done).catch(fallback);
  } else {
    fallback();
  }
}

/* ---- Chat ---- */
function drawChat(list) {
  if (!chatEl) return;
  const box = chatEl.querySelector(".lc-list");
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
  const first = !box.dataset.drawn;

  if (!list.length) {
    box.innerHTML = `<div class="lc-empty">No messages yet. Say hello!</div>`;
  } else {
    box.innerHTML = list.map((m) => `
      <div class="lc-msg">
        <span class="lc-name">${esc(m.name || "Guest")}</span><span class="lc-text">${esc(m.content)}</span><span class="lc-time">${esc(chatTime(m.created_at))}</span>
      </div>
    `).join("");
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
    /* ignore, the next poll will try again */
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

/* ---- Everything under the player: like, share, gift, chat ---- */
function showExtras() {
  if (extrasEl) return;
  const root = document.getElementById("live-root");
  if (!root) return;

  const liked = getLiveLiked();

  extrasEl = document.createElement("div");
  extrasEl.id = "live-extras";
  extrasEl.innerHTML = `
    <div class="lx-actions">
      <button type="button" class="lx-btn ${liked ? "liked" : ""}" id="lx-like" aria-pressed="${liked}">
        <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        <span id="lx-like-count">0</span> Like
      </button>
      <button type="button" class="lx-btn" id="lx-share">
        <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5"/></svg>
        Share
      </button>
    </div>
    <div class="lx-icons" aria-label="Share this live broadcast">${shareIconsHtml()}</div>

    ${giftHtml()}

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
  const copyBtn = extrasEl.querySelector("#lg-copy");
  if (copyBtn) copyBtn.addEventListener("click", copyGiftNumber);
  chatEl.querySelector(".lc-form").addEventListener("submit", sendChat);

  refreshLikes();
  pollChat();
  pollTicks = 0;
  chatTimer = setInterval(function () {
    pollChat();
    pollTicks++;
    if (pollTicks % 5 === 0) refreshLikes();
  }, CHAT_POLL_MS);
}

function hideExtras() {
  if (chatTimer) {
    clearInterval(chatTimer);
    chatTimer = null;
  }
  if (extrasEl) {
    extrasEl.remove();
    extrasEl = null;
  }
  chatEl = null;
  chatLastSig = "";
}

/* ================= Live page ================= */

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

  /* A short hiccup must not wipe a stream that is already playing */
  if (error) {
    if (lastValue === null) {
      root.innerHTML = NO_LIVE;
      hideExtras();
    }
    return;
  }

  const value = data && data.value ? String(data.value).trim() : "";

  /* Nothing changed, so leave the player alone (re-drawing would restart the stream) */
  if (value === lastValue) return;
  lastValue = value;

  if (!value) {
    root.innerHTML = NO_LIVE;
    hideExtras();
    return;
  }

  const player = playerFor(value);
  if (!player) {
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
