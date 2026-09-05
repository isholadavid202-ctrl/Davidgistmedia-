document.getElementById("year").textContent = new Date().getFullYear();

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

async function loadLive() {
  const root = document.getElementById("live-root");
  const { data, error } = await supabaseClient
    .from("settings")
    .select("value")
    .eq("key", "live_stream_url")
    .maybeSingle();

  if (error || !data || !data.value || !data.value.trim()) {
    root.innerHTML = `<div class="empty-state">No live broadcast right now. Check back soon, or follow our social channels for a notification when we go live.</div>`;
    return;
  }

  const embed = toEmbedUrl(data.value.trim());
  if (!embed) {
    root.innerHTML = `<div class="empty-state">The live stream link couldn't be loaded.</div>`;
    return;
  }

  root.innerHTML = `
    <div style="position:relative;padding-top:56.25%;border-radius:8px;overflow:hidden;box-shadow:var(--shadow-md);background:#000">
      <iframe src="${embed}" title="Live broadcast" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen
        style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>
    </div>
  `;
}

loadLive();
