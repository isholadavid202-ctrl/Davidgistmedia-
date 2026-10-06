(function () {
  const loginView = document.getElementById("login-view");
  const appView = document.getElementById("app-view");
  const loginStatus = document.getElementById("login-status");
  const form = document.getElementById("story-form");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const saveStatus = document.getElementById("save-status");
  const formTitle = document.getElementById("form-title");
  const nameInput = document.getElementById("display-name");
  const nameBtn = document.getElementById("name-save-btn");
  const nameStatus = document.getElementById("name-status");
  const nameNote = document.getElementById("name-note");
  let me = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slugOf(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "story";
  }
  function dateOf(d) {
    try { return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch (e) { return ""; }
  }
  function cleanUrl(v) {
    const u = (v || "").trim();
    if (!u) return null;
    return /^https:\/\//i.test(u) ? u : false;
  }
  function setStatus(el, text, cls) {
    el.textContent = text;
    el.className = "admin-status" + (cls ? " " + cls : "");
  }

  function updateNameUi() {
    document.getElementById("welcome").textContent = me.nameSet
      ? "Signed in as " + me.name
      : "Welcome - please add your name";
    nameNote.textContent = me.nameSet
      ? "This name appears as the author on every story you publish. If you change it, your earlier stories are updated too."
      : "Add your name below before you publish. It will appear as the author on every story you publish.";
    saveBtn.disabled = !me.nameSet;
    nameInput.value = me.nameSet ? me.name : nameInput.value;
  }

  function showLogin(msg) {
    loginView.style.display = "";
    appView.style.display = "none";
    if (msg) setStatus(loginStatus, msg, "error");
  }

  async function enter(user) {
    const { data } = await supabaseClient
      .from("staff_roles").select("role,display_name,name_set")
      .eq("user_id", user.id).maybeSingle();
    if (!data || (data.role !== "staff" && data.role !== "admin")) {
      await supabaseClient.auth.signOut();
      showLogin("This account isn't set up as staff. Ask the admin to add you.");
      return;
    }
    me = { id: user.id, role: data.role, name: data.display_name, nameSet: !!data.name_set };
    loginView.style.display = "none";
    appView.style.display = "";
    document.getElementById("admin-note").style.display = me.role === "admin" ? "" : "none";
    nameInput.value = me.nameSet ? me.name : "";
    setStatus(loginStatus, "");
    setStatus(nameStatus, "");
    updateNameUi();
    loadMine();
  }

  async function start() {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) enter(data.session.user);
    else showLogin();
  }

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("login-btn");
    btn.disabled = true;
    setStatus(loginStatus, "Logging in...");
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    btn.disabled = false;
    if (error) { setStatus(loginStatus, error.message, "error"); return; }
    enter(data.user);
  });

  document.getElementById("logout-link").addEventListener("click", async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signOut();
    me = null;
    resetForm();
    showLogin();
  });

  nameBtn.addEventListener("click", async () => {
    if (!me) return;
    const v = nameInput.value.replace(/\s+/g, " ").trim();
    if (v.length < 2 || v.length > 60) {
      setStatus(nameStatus, "Your name must be between 2 and 60 characters.", "error");
      return;
    }
    if (/[<>"&]/.test(v)) {
      setStatus(nameStatus, "Please use letters, spaces, hyphens or apostrophes only.", "error");
      return;
    }
    nameBtn.disabled = true;
    setStatus(nameStatus, "Saving...");
    const { data, error } = await supabaseClient.rpc("set_my_display_name", { new_name: v });
    nameBtn.disabled = false;
    if (error) { setStatus(nameStatus, error.message, "error"); return; }
    me.name = data || v;
    me.nameSet = true;
    nameInput.value = me.name;
    updateNameUi();
    setStatus(nameStatus, "Name saved.", "ok");
    loadMine();
  });

  function resetForm() {
    form.reset();
    document.getElementById("story-id").value = "";
    formTitle.textContent = "New story";
    saveBtn.textContent = "Publish story";
    cancelBtn.style.display = "none";
  }
  cancelBtn.addEventListener("click", () => { resetForm(); setStatus(saveStatus, ""); });

  async function uniqueSlug(base) {
    let attempt = 0;
    while (true) {
      const candidate = attempt === 0 ? base : base + "-" + attempt;
      const { data } = await supabaseClient.from("articles").select("id").eq("slug", candidate).maybeSingle();
      if (!data) return candidate;
      attempt++;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!me) return;
    if (!me.nameSet) { setStatus(saveStatus, "Please save your name above before publishing.", "error"); return; }
    const id = document.getElementById("story-id").value;
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const image = cleanUrl(document.getElementById("image_url").value);
    const video = cleanUrl(document.getElementById("video_url").value);

    if (!title || !content) { setStatus(saveStatus, "Headline and full story are required.", "error"); return; }
    if (image === false || video === false) { setStatus(saveStatus, "Picture and video links must start with https://", "error"); return; }

    const payload = {
      title,
      category: document.getElementById("category").value,
      author: me.name,
      image_url: image,
      video_url: video,
      tags: document.getElementById("tags").value.trim() || null,
      excerpt: document.getElementById("excerpt").value.trim(),
      content
    };

    saveBtn.disabled = true;
    setStatus(saveStatus, "Saving...");
    let result;
    if (id) {
      payload.updated_at = new Date().toISOString();
      result = await supabaseClient.from("articles").update(payload).eq("id", id);
    } else {
      payload.slug = await uniqueSlug(slugOf(title));
      result = await supabaseClient.from("articles").insert(payload);
    }
    saveBtn.disabled = !me.nameSet;

    if (result.error) { setStatus(saveStatus, result.error.message, "error"); return; }
    setStatus(saveStatus, id ? "Story updated." : "Story published.", "ok");
    resetForm();
    loadMine();
  });

  async function loadMine() {
    const list = document.getElementById("my-list");
    const { data, error } = await supabaseClient
      .from("articles").select("*").eq("created_by", me.id)
      .order("published_at", { ascending: false });
    if (error) { list.innerHTML = `<p class="admin-status error">${esc(error.message)}</p>`; return; }
    if (!data || !data.length) {
      list.innerHTML = `<p style="color:var(--muted);font-size:0.9rem">You haven't published any stories yet.</p>`;
      return;
    }
    list.innerHTML = data.map((a) => `
      <div class="admin-list-item">
        <div>
          <h4>${esc(a.title)}</h4>
          <div class="meta">${esc(a.category)} · ${dateOf(a.published_at)}</div>
        </div>
        <div class="actions">
          <a href="article.html?slug=${encodeURIComponent(a.slug)}" target="_blank" rel="noopener" style="border:1px solid var(--line);padding:7px 11px;border-radius:4px;font-size:0.78rem;font-weight:700">View</a>
          <button data-edit="${a.id}">Edit</button>
        </div>
      </div>`).join("");
    list.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = data.find((x) => String(x.id) === btn.dataset.edit);
        if (!a) return;
        document.getElementById("story-id").value = a.id;
        document.getElementById("title").value = a.title || "";
        document.getElementById("category").value = a.category;
        document.getElementById("image_url").value = a.image_url || "";
        document.getElementById("video_url").value = a.video_url || "";
        document.getElementById("tags").value = a.tags || "";
        document.getElementById("excerpt").value = a.excerpt || "";
        document.getElementById("content").value = a.content || "";
        formTitle.textContent = "Edit story";
        saveBtn.textContent = "Save changes";
        cancelBtn.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  start();
})();
