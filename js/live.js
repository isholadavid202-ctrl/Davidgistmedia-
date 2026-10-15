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

/* ================= Live chat ================= */

const CHAT_MAX_SHOWN = 50;        // newest messages shown
const CHAT_WINDOW_HOURS = 12;     // older messages are not shown
const CHAT_COOLDOWN_MS = 4000;    // wait between two messages from one person
const CHAT_POLL_MS = 4000;        // how often new messages are fetched

let chatEl = null;
let chatTimer = null;
let chatBusy = false;
let chatLastSig = "";
let chatLastSent = 0;

function chatStyles() {
  if (document.getElementById("live-chat-style")) return;
  const st = document.createElement("style");
  st.id = "live-chat-style";
  st.textContent =
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

function savedChatName() {
  try { return localStorage.getItem("dg_chat_name") || ""; } catch (e) { return ""; }
}
function saveChatName(n) {
  try { localStorage.setItem("dg_chat_name", n); } catch (e) {}
}

function chatTime(d) {
  const t = new Date(d);
  if (isNaN(t.getTime())) return "";
  return t.toLocaleTimeString("en-GB", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos"
  }).replace(/am|pm/i, (m) => m.toUpperCase());
}

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
      .insert({ name: name, content: content.slice(0, 300) });
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

function showChat() {
  if (chatEl) return;
  const root = document.getElementById("live-root");
  if (!root) return;

  chatStyles();
  chatEl = document.createElement("section");
  chatEl.id = "live-chat";
  chatEl.className = "lc";
  chatEl.setAttribute("aria-label", "Live chat");
  chatEl.innerHTML = `
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
  `;
  root.insertAdjacentElement("afterend", chatEl);

  chatEl.querySelector(".lc-form").addEventListener("submit", sendChat);

  pollChat();
  chatTimer = setInterval(pollChat, CHAT_POLL_MS);
}

function hideChat() {
  if (chatTimer) {
    clearInterval(chatTimer);
    chatTimer = null;
  }
  if (chatEl) {
    chatEl.remove();
    chatEl = null;
  }
  chatLastSig = "";
}

/* ================= Live page ================= */

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
    if (lastValue === null) {
      root.innerHTML = NO_LIVE;
      hideChat();
    }
    return;
  }

  const value = data && data.value ? String(data.value).trim() : "";

  /* Nothing changed, so leave the player alone (re-drawing would restart the stream) */
  if (value === lastValue) return;
  lastValue = value;

  if (!value) {
    root.innerHTML = NO_LIVE;
    hideChat();
    return;
  }

  const player = playerFor(value);
  if (!player) {
    root.innerHTML = NO_LIVE;
    hideChat();
    return;
  }

  render(root, player);

  if (player.type === "bad") hideChat();
  else showChat();
}

loadLive();
setInterval(loadLive, 30000);
