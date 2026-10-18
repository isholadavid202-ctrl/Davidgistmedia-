document.addEventListener("DOMContentLoaded", async function () {
  // Update top utility account link safely to profile.html
  const topLink = document.getElementById("top-account-link");
  if (topLink) {
    topLink.href = "profile.html";
  }

  if (window.supabaseClient) {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user && topLink) {
        topLink.href = "profile.html";
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();

        const name = profile?.full_name || user.user_metadata?.full_name || "My account";
        
        if (profile?.avatar_url) {
          topLink.innerHTML = `<img src="${profile.avatar_url}" alt="" style="width:18px; height:18px; border-radius:50%; object-fit:cover; border:1px solid #bb1919;"> <span>${escapeHtml(name)}</span>`;
        } else {
          topLink.textContent = name;
        }
      } else if (topLink) {
        topLink.textContent = "Sign in";
        topLink.href = "profile.html";
      }
    } catch (e) {
      console.error("Extras auth error:", e);
    }
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
});
