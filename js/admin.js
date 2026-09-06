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
  loadLiveUrl();
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
