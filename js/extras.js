document.addEventListener("DOMContentLoaded", async function () {
  // 1. Place "My account" cleanly at the top right of the utility bar (next to the date)
  const utilWrap = document.querySelector(".util-bar .wrap");
  if (utilWrap && !document.getElementById("top-util-acct")) {
    const acctLink = document.createElement("a");
    acctLink.id = "top-util-acct";
    acctLink.href = "profile.html";
    acctLink.style.cssText = "float:right; color:var(--red,#bb1919); font-weight:700; text-decoration:none; font-size:0.85rem; display:inline-flex; align-items:center; gap:6px;";
    acctLink.textContent = "My account";
    utilWrap.appendChild(acctLink);

    // Update with user name/avatar if signed in
    if (window.supabaseClient) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single();

          const name = profile?.full_name || user.user_metadata?.full_name || "My account";
          
          if (profile?.avatar_url) {
            acctLink.innerHTML = `<img src="${profile.avatar_url}" alt="" style="width:20px; height:20px; border-radius:50%; object-fit:cover; border:1px solid var(--red,#bb1919);"> <span>${escapeHtml(name)}</span>`;
          } else {
            acctLink.textContent = name;
          }
        }
      } catch (e) {
        console.error("Extras auth error:", e);
      }
    }
  }

  // Helper function to safely handle display names
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
