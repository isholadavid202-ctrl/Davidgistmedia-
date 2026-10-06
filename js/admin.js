// ---- Relabel "Newsroom" as "Admin login" ----
(function () {
  document.title = document.title
    .replace(/newsroom login/i, "Admin login")
    .replace(/newsroom/i, "Admin login");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    const tag = n.parentNode && n.parentNode.nodeName;
    if (tag === "SCRIPT" || tag === "STYLE") return;
    const t = n.nodeValue;
    if (/^\s*newsroom\s*$/i.test(t)) {
      n.nodeValue = t.replace(/newsroom/i, "Admin login");
    } else if (/newsroom login/i.test(t)) {
      n.nodeValue = t.replace(/newsroom login/i, "Admin login");
    }
  });
})();

const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");

async function ensureAdmin() {
  const { data: s } = await supabaseClient.auth.getSession();
  if (!s.session) return false;
  const { data } = await supabaseClient
    .from("staff_roles")
    .select("role")
    .eq("user_id", s.session.user.id)
    .maybeSingle();
  if (data && data.role === "admin") return true;
  await supabaseClient.auth.signOut();
  return false;
}

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    if (await ensureAdmin()) {
      showApp();
    } else {
      loginView.style.display = "";
      appView.style.display = "none";
      const status = document.getElementById("login-status");
      status.textContent = "This login isn't an admin account. Staff should use staff.html.";
      status.className = "admin-status error";
    }
  } else {
    loginView.style.display = "";
    appView.style.display = "none";
  }
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const btn = document.getElementById("login-btn");
  const status = document.getElementById("login-status");

  btn.disabled = true;
  status.textContent = "Logging in...";
  status.className = "admin-status";

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    btn.disabled = false;
    status.textContent = error.message;
    status.className = "admin-status error";
    return;
  }
  if (!(await ensureAdmin())) {
    btn.disabled = false;
    status.textContent = "This login isn't an admin account. Staff should use staff.html.";
    status.className = "admin-status error";
    return;
  }
  btn.disabled = false;
  status.textContent = "";
  showApp();
});

document.getElementById("logout-link").addEventListener("click", async (e) => {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  loginView.style.display = "";
  appView.style.display = "none";
});

function showApp() {
  loginView.style.display = "none";
  appView.style.display = "";
  ensureBadgeCard();
  loadBadgeManager();
  loadAdminList();
  loadLiveUrl();
  loadCommentsAdmin();
}

// ---- Staff verification badges ----
function ensureBadgeCard() {
  if (document.getElementById("badge-card")) return;
  const card = document.createElement("details");
  card.id = "badge-card";
  card.className = "admin-card";
  card.style.marginBottom = "18px";
  card.innerHTML = `
    <summary style="cursor:pointer;font-weight:800;font-family:var(--serif);font-size:1.15rem">Staff verification badges</summary>
    <p style="margin:10px 0 4px;color:var(--muted);font-size:0.85rem">Give a staff member a blue badge next to their name on stories, the home page and their author page. You can add a title (for example Senior Reporter) and remove the badge at any time. Your own orange badge can't be changed here.</p>
    <div id="badge-list" style="margin-top:12px"></div>
  `;
  appView.insertBefore(card, appView.firstChild);
}

function badgeIcon() {
  const pts = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = 9.2 + 1.1 * Math.cos(8 * a);
    pts.push((12 + r * Math.cos(a)).toFixed(2) + "," + (12 + r * Math.sin(a)).toFixed(2));
  }
  return `<svg viewBox="0 0 24 24" width="16" height="16" style="display:inline-block;vertical-align:-3px;margin-left:4px"><polygon points="${pts.join(" ")}" fill="#1d9bf0"/><path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

async function loadBadgeManager() {
  const list = document.getElementById("badge-list");
  if (!list) return;
  const { data, error } = await supabaseClient
    .from("staff_roles")
    .select("user_id,display_name,role,verified,badge_title")
    .order("display_name");

  if (error) {
    list.innerHTML = `<p class="admin-status error">${escapeHtml(error.message)}</p>`;
    return;
  }
  const staff = (data || []).filter((s) => s.role === "staff");
  if (staff.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No staff accounts yet.</p>`;
    return;
  }

  list.innerHTML = staff.map((s) => `
    <div class="admin-list-item" style="flex-wrap:wrap">
      <div style="min-width:0;flex:1 1 160px">
        <h4>${escapeHtml(s.display_name)}${s.verified ? badgeIcon() : ""}</h4>
        <div class="meta">${s.verified ? "Verified" : "Not verified"}</div>
      </div>
      <div class="actions" style="flex:1 1 100%;flex-wrap:wrap">
        <input data-title="${s.user_id}" maxlength="60" placeholder="Title (optional), e.g. Senior Reporter"
          value="${escapeHtml(s.badge_title || "")}"
          style="flex:1 1 180px;min-width:0;padding:8px 10px;border:1px solid var(--line);border-radius:4px;font:inherit;font-size:0.85rem">
        ${s.verified
          ? `<button data-badge="${s.user_id}" data-make="1">Save title</button>
             <button data-badge="${s.user_id}" data-make="0" class="danger">Remove badge</button>`
          : `<button data-badge="${s.user_id}" data-make="1">Give badge</button>`}
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-badge]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.badge;
      const make = btn.dataset.make === "1";
      const input = list.querySelector(`[data-title="${id}"]`);
      if (!make && !confirm("Remove this badge?")) return;
      btn.disabled = true;
      const { error: err } = await supabaseClient.rpc("admin_set_badge", {
        target: id,
        make_verified: make,
        new_title: input ? input.value.trim() : ""
      });
      if (err) {
        alert(err.message);
        btn.disabled = false;
        return;
      }
      loadBadgeManager();
    });
  });
}

// ---- Comment moderation ----
async function loadCommentsAdmin() {
  const list = document.getElementById("comments-admin-list");
  const { data, error } = await supabaseClient
    .from("comments")
    .select("*, articles(title, slug)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    list.innerHTML = `<p class="admin-status error">${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No comments yet.</p>`;
    return;
  }

  list.innerHTML = data.map((c) => `
    <div class="admin-list-item">
      <div>
        <h4>${escapeHtml(c.name || "Anonymous")} <span class="meta">on "${escapeHtml((c.articles && c.articles.title) || "a story")}"</span></h4>
        <div class="meta" style="margin-top:4px">${escapeHtml(c.content)}</div>
      </div>
      <div class="actions">
        <button data-comment-id="${c.id}" class="danger">Delete</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-comment-id]").forEach((btn) => {
    btn.addEventListener("click", () => deleteComment(btn.dataset.commentId));
  });
}

async function deleteComment(id) {
  if (!confirm("Delete this comment? This can't be undone.")) return;
  const { error } = await supabaseClient.from("comments").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  loadCommentsAdmin();
}

// ---- Live broadcast ----
async function loadLiveUrl() {
  const { data } = await supabaseClient
    .from("settings")
    .select("value")
    .eq("key", "live_stream_url")
    .maybeSingle();
  document.getElementById("live_url").value = (data && data.value) || "";
}

document.getElementById("live-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("live-save-btn");
  const status = document.getElementById("live-status");
  const value = document.getElementById("live_url").value.trim();

  btn.disabled = true;
  status.textContent = "Saving...";
  status.className = "admin-status";

  const { error } = await supabaseClient
    .from("settings")
    .update({ value })
    .eq("key", "live_stream_url");

  btn.disabled = false;

  if (error) {
    status.textContent = error.message;
    status.className = "admin-status error";
    return;
  }
  status.textContent = value ? "Live link saved." : "Live link cleared.";
  status.className = "admin-status ok";
});

// ---- Publish / edit form ----
const form = document.getElementById("article-form");
const saveBtn = document.getElementById("save-btn");
const saveStatus = document.getElementById("save-status");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");

function resetForm() {
  form.reset();
  document.getElementById("article-id").value = "";
  formTitle.textContent = "New story";
  saveBtn.textContent = "Publish story";
  cancelEditBtn.style.display = "none";
  saveStatus.textContent = "";
}

cancelEditBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("article-id").value;
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const author = document.getElementById("author").value.trim() || "Davidgistmedia";
  const image_url = document.getElementById("image_url").value.trim() || null;
  const video_url = document.getElementById("video_url").value.trim() || null;
  const tags = document.getElementById("tags").value.trim() || null;
  const excerpt = document.getElementById("excerpt").value.trim();
  const content = document.getElementById("content").value.trim();
  const featured = document.getElementById("featured").checked;

  if (!title || !content) {
    saveStatus.textContent = "Title and full story are required.";
    saveStatus.className = "admin-status error";
    return;
  }

  saveBtn.disabled = true;
  saveStatus.textContent = "Saving...";
  saveStatus.className = "admin-status";

  const payload = { title, category, author, image_url, video_url, tags, excerpt, content, featured };

  let result;
  if (id) {
    payload.updated_at = new Date().toISOString();
    result = await supabaseClient.from("articles").update(payload).eq("id", id);
  } else {
    payload.slug = await uniqueSlug(slugify(title));
    result = await supabaseClient.from("articles").insert(payload);
  }

  saveBtn.disabled = false;

  if (result.error) {
    saveStatus.textContent = result.error.message;
    saveStatus.className = "admin-status error";
    return;
  }

  saveStatus.textContent = id ? "Story updated." : "Story published.";
  saveStatus.className = "admin-status ok";
  resetForm();
  loadAdminList();
});

async function uniqueSlug(base) {
  let slug = base || "story";
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const { data } = await supabaseClient.from("articles").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    attempt++;
  }
}

async function loadAdminList() {
  const list = document.getElementById("admin-list");
  const { data, error } = await supabaseClient
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    list.innerHTML = `<p class="admin-status error">${escapeHtml(error.message)}</p>`;
    return;
  }
  if (!data || data.length === 0) {
    list.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">No stories published yet.</p>`;
    return;
  }

  list.innerHTML = data.map((a) => `
    <div class="admin-list-item">
      <div>
        <h4>${escapeHtml(a.title)}</h4>
        <div class="meta">${escapeHtml(a.category)} · ${formatDate(a.published_at)}${a.featured ? " · Featured" : ""}</div>
      </div>
      <div class="actions">
        <button data-action="edit" data-id="${a.id}">Edit</button>
        <button data-action="delete" data-id="${a.id}" class="danger">Delete</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => editArticle(btn.dataset.id, data));
  });
  list.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => deleteArticle(btn.dataset.id));
  });
}

function editArticle(id, list) {
  const a = list.find((x) => x.id === id);
  if (!a) return;
  document.getElementById("article-id").value = a.id;
  document.getElementById("title").value = a.title;
  document.getElementById("category").value = a.category;
  document.getElementById("author").value = a.author || "";
  document.getElementById("image_url").value = a.image_url || "";
  document.getElementById("video_url").value = a.video_url || "";
  document.getElementById("tags").value = a.tags || "";
  document.getElementById("excerpt").value = a.excerpt || "";
  document.getElementById("content").value = a.content || "";
  document.getElementById("featured").checked = !!a.featured;
  formTitle.textContent = "Edit story";
  saveBtn.textContent = "Save changes";
  cancelEditBtn.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteArticle(id) {
  if (!confirm("Delete this story? This can't be undone.")) return;
  const { error } = await supabaseClient.from("articles").delete().eq("id", id);
  if (error) {
    alert(error.message);
    return;
  }
  loadAdminList();
}

checkSession();
