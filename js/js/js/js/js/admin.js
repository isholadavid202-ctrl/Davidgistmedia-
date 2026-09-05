const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showApp();
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
  btn.disabled = false;

  if (error) {
    status.textContent = error.message;
    status.className = "admin-status error";
    return;
  }
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
  loadAdminList();
}

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

  const payload = { title, category, author, image_url, excerpt, content, featured };

  let result;
  if (id) {
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
