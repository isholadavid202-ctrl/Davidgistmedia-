/* Picture and video uploads for the newsroom pages */
(function () {
  var BUCKET = "article-media";
  var MAX_PICTURES = 12;
  var MAX_VIDEO_MB = 50;
  var MAX_SIDE = 1600;

  var state = { pictures: [], video: "", busy: 0 };
  var el = {};

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function isHttps(u) { return /^https:\/\//i.test(String(u || "").trim()); }
  function isOurFile(u) { return String(u || "").indexOf("/storage/v1/object/public/" + BUCKET + "/") > -1; }
  function isVideoFile(u) { return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(String(u || "")); }

  function say(text, kind) {
    el.status.textContent = text || "";
    el.status.className = "admin-status mu-status" + (kind ? " " + kind : "");
  }

  function injectCss() {
    if (document.getElementById("mu-css")) return;
    var st = document.createElement("style");
    st.id = "mu-css";
    st.textContent = `
      .mu [hidden]{display:none !important}
      .mu-hint{margin:2px 0 8px;font-size:.82rem;color:var(--muted)}
      .mu-count{margin:6px 0;font-size:.82rem;color:var(--muted)}
      .mu-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:10px;margin:8px 0}
      .mu-item{position:relative;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#f1f1f1}
      .mu-item img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover}
      .mu-badge{position:absolute;left:6px;top:6px;background:#c8102e;color:#fff;font-size:.65rem;font-weight:700;padding:2px 6px;border-radius:4px}
      .mu-x{position:absolute;right:4px;top:4px;width:26px;height:26px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:16px;line-height:1;cursor:pointer}
      .mu-main{position:absolute;left:4px;bottom:4px;padding:4px 7px;border:0;border-radius:4px;background:rgba(0,0,0,.65);color:#fff;font-size:.68rem;cursor:pointer}
      .mu-up{position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,255,255,.75);color:#111;font-size:.75rem;font-weight:700}
      .mu-row{display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap}
      .mu-row input[type=text]{flex:1 1 180px;min-width:0;width:auto}
      .mu-btn{display:inline-flex;align-items:center;justify-content:center;margin:0;padding:10px 14px;border:1px solid var(--ink);border-radius:6px;font-weight:700;font-size:.88rem;cursor:pointer;background:transparent;color:var(--ink)}
      .mu-row button{padding:10px 14px;border:1px solid var(--ink);border-radius:6px;background:transparent;color:var(--ink);font-weight:700;cursor:pointer}
      .mu-progress{height:8px;background:#e4e4e4;border-radius:4px;overflow:hidden;margin:8px 0}
      .mu-progress div{height:100%;width:0;background:#c8102e;transition:width .15s}
      .mu-video{border:1px solid var(--line);border-radius:8px;padding:10px;margin:8px 0;font-size:.85rem;word-break:break-all}
      .mu-video .mu-vtop{display:flex;gap:10px;align-items:center;justify-content:space-between}
      .mu-video video{display:block;width:100%;max-height:220px;margin-top:8px;border-radius:6px;background:#000}
    `;
    document.head.appendChild(st);
  }

  function mount(id) {
    var host = document.getElementById(id);
    if (!host) return;
    injectCss();
    host.innerHTML =
      '<div class="mu">' +
        '<label>Pictures</label>' +
        '<p class="mu-hint">Choose as many pictures as you like. The first one is the main picture on the homepage. Pictures are shrunk automatically so they load fast.</p>' +
        '<div class="mu-grid"></div>' +
        '<p class="mu-count"></p>' +
        '<div class="mu-row"><label class="mu-btn">Add pictures<input class="mu-pics" type="file" accept="image/*" multiple hidden></label></div>' +
        '<div class="mu-row"><input class="mu-pic-url" type="text" placeholder="Or paste a picture link (https://...)"><button type="button" class="mu-pic-add">Add link</button></div>' +
        '<label style="margin-top:18px">Video</label>' +
        '<p class="mu-hint">Upload a video file (up to ' + MAX_VIDEO_MB + ' MB), or paste a YouTube link.</p>' +
        '<div class="mu-videobox"></div>' +
        '<div class="mu-row"><label class="mu-btn">Upload a video<input class="mu-vid" type="file" accept="video/*" hidden></label></div>' +
        '<div class="mu-row"><input class="mu-vid-url" type="text" placeholder="Or paste a YouTube link (https://...)"><button type="button" class="mu-vid-add">Use link</button></div>' +
        '<div class="mu-progress" hidden><div></div></div>' +
        '<p class="admin-status mu-status"></p>' +
      '</div>';

    el.grid = host.querySelector(".mu-grid");
    el.count = host.querySelector(".mu-count");
    el.pics = host.querySelector(".mu-pics");
    el.picUrl = host.querySelector(".mu-pic-url");
    el.picAdd = host.querySelector(".mu-pic-add");
    el.videoBox = host.querySelector(".mu-videobox");
    el.vid = host.querySelector(".mu-vid");
    el.vidUrl = host.querySelector(".mu-vid-url");
    el.vidAdd = host.querySelector(".mu-vid-add");
    el.progress = host.querySelector(".mu-progress");
    el.bar = host.querySelector(".mu-progress div");
    el.status = host.querySelector(".mu-status");

    el.pics.addEventListener("change", function (e) { addPictures(e.target.files); });
    el.vid.addEventListener("change", function (e) { addVideo(e.target.files && e.target.files[0]); });

    el.picAdd.addEventListener("click", function () {
      var u = el.picUrl.value.trim();
      if (!u) return;
      if (!isHttps(u)) { say("Picture links must start with https://", "error"); return; }
      if (state.pictures.length >= MAX_PICTURES) { say("You can add up to " + MAX_PICTURES + " pictures.", "error"); return; }
      state.pictures.push({ url: u });
      el.picUrl.value = "";
      say("");
      render();
    });

    el.vidAdd.addEventListener("click", function () {
      var u = el.vidUrl.value.trim();
      if (!u) return;
      if (!isHttps(u)) { say("Video links must start with https://", "error"); return; }
      state.video = u;
      el.vidUrl.value = "";
      say("");
      render();
    });

    el.grid.addEventListener("click", function (e) {
      var del = e.target.closest("[data-del]");
      var main = e.target.closest("[data-main]");
      if (del) {
        state.pictures.splice(Number(del.dataset.del), 1);
        render();
      } else if (main) {
        var item = state.pictures.splice(Number(main.dataset.main), 1)[0];
        if (item) state.pictures.unshift(item);
        render();
      }
    });

    el.videoBox.addEventListener("click", function (e) {
      if (e.target.closest("[data-vdel]")) { state.video = ""; render(); }
    });

    render();
  }

  function render() {
    if (!el.grid) return;
    el.grid.innerHTML = state.pictures.map(function (p, i) {
      var src = p.url || p.preview || "";
      return '<div class="mu-item">' +
        (src ? '<img src="' + esc(src) + '" alt="">' : "") +
        (i === 0 ? '<span class="mu-badge">Main</span>' : "") +
        (p.uploading ? '<div class="mu-up">Uploading...</div>' : "") +
        '<button type="button" class="mu-x" data-del="' + i + '" aria-label="Remove picture">&times;</button>' +
        (i > 0 && p.url ? '<button type="button" class="mu-main" data-main="' + i + '">Make main</button>' : "") +
        "</div>";
    }).join("");

    var n = state.pictures.length;
    el.count.textContent = n ? n + (n === 1 ? " picture" : " pictures") : "No pictures yet.";

    if (state.video) {
      var label = isOurFile(state.video) ? "Uploaded video" : esc(state.video);
      el.videoBox.innerHTML =
        '<div class="mu-video"><div class="mu-vtop"><span>' + label + '</span>' +
        '<button type="button" data-vdel="1">Remove</button></div>' +
        (isVideoFile(state.video) ? '<video src="' + esc(state.video) + '" controls playsinline preload="metadata"></video>' : "") +
        "</div>";
    } else {
      el.videoBox.innerHTML = "";
    }
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("unreadable")); };
      img.src = url;
    });
  }

  async function compress(file) {
    if (file.type === "image/gif") return file;
    try {
      var img = await loadImage(file);
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, MAX_SIDE / Math.max(w, h));
      var cw = Math.max(1, Math.round(w * scale));
      var ch = Math.max(1, Math.round(h * scale));
      var c = document.createElement("canvas");
      c.width = cw;
      c.height = ch;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      var blob = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.85); });
      return blob || file;
    } catch (e) {
      return file;
    }
  }

  async function upload(blob, kind, ext, type, onProgress) {
    var sess = (await supabaseClient.auth.getSession()).data.session;
    if (!sess) throw new Error("Please log in again.");
    var path = kind + "/" + sess.user.id + "/" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8) + "." + ext;
    var base = supabaseClient.supabaseUrl;
    var key = supabaseClient.supabaseKey;

    if (base && key) {
      await new Promise(function (resolve, reject) {
        var fd = new FormData();
        fd.append("cacheControl", "31536000");
        fd.append("", new Blob([blob], { type: type }), "upload." + ext);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", base + "/storage/v1/object/" + BUCKET + "/" + path);
        xhr.setRequestHeader("Authorization", "Bearer " + sess.access_token);
        xhr.setRequestHeader("apikey", key);
        xhr.setRequestHeader("x-upsert", "false");
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
        };
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) return resolve();
          var m = "Upload failed (" + xhr.status + ").";
          try { var j = JSON.parse(xhr.responseText); m = j.message || j.error || m; } catch (e) {}
          reject(new Error(m));
        };
        xhr.onerror = function () { reject(new Error("Network error while uploading.")); };
        xhr.send(fd);
      });
    } else {
      var r = await supabaseClient.storage.from(BUCKET).upload(path, blob, { contentType: type, upsert: false });
      if (r.error) throw r.error;
    }
    return supabaseClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function addPictures(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!files.length) { say("Please choose picture files.", "error"); return; }
    var room = MAX_PICTURES - state.pictures.length;
    if (room <= 0) { say("You can add up to " + MAX_PICTURES + " pictures.", "error"); el.pics.value = ""; return; }
    if (files.length > room) {
      say("Only " + MAX_PICTURES + " pictures fit. The extra ones were skipped.", "error");
      files = files.slice(0, room);
    } else {
      say("");
    }

    var items = files.map(function (file) {
      var item = { url: "", preview: URL.createObjectURL(file), uploading: true };
      state.pictures.push(item);
      return { file: file, item: item };
    });
    state.busy += items.length;
    render();

    for (var i = 0; i < items.length; i++) {
      var file = items[i].file;
      var item = items[i].item;
      try {
        var blob = await compress(file);
        var type = blob.type || file.type || "image/jpeg";
        var ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type] || "jpg";
        var url = await upload(blob, "pictures", ext, type);
        item.url = url;
      } catch (err) {
        var at = state.pictures.indexOf(item);
        if (at > -1) state.pictures.splice(at, 1);
        say("A picture could not be uploaded: " + (err && err.message ? err.message : err), "error");
      } finally {
        item.uploading = false;
        if (item.preview) { URL.revokeObjectURL(item.preview); item.preview = ""; }
        state.busy--;
        render();
      }
    }
    el.pics.value = "";
  }

  function showProgress(p) {
    el.progress.hidden = false;
    el.bar.style.width = Math.round(p * 100) + "%";
  }

  async function addVideo(file) {
    if (!file) return;
    if (!/^video\//.test(file.type)) { say("Please choose a video file.", "error"); el.vid.value = ""; return; }
    var mb = file.size / 1048576;
    if (mb > MAX_VIDEO_MB) {
      say("That video is " + Math.round(mb) + " MB and the limit is " + MAX_VIDEO_MB + " MB. Trim it or lower its quality, or paste a YouTube link instead.", "error");
      el.vid.value = "";
      return;
    }
    var ext = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" }[file.type] || "mp4";
    state.busy++;
    showProgress(0);
    say("Uploading video. Please keep this page open...");
    try {
      state.video = await upload(file, "videos", ext, file.type, showProgress);
      say("Video uploaded.", "ok");
    } catch (err) {
      say("The video could not be uploaded: " + (err && err.message ? err.message : err), "error");
    } finally {
      state.busy--;
      el.progress.hidden = true;
      el.vid.value = "";
      render();
    }
  }

  function toList(v) {
    var list = v;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch (e) { list = []; } }
    return Array.isArray(list) ? list : [];
  }

  window.DGMedia = {
    mount: mount,
    isBusy: function () { return state.busy > 0; },
    getValues: function () {
      var urls = state.pictures.filter(function (p) { return p.url && !p.uploading; }).map(function (p) { return p.url; });
      return { image_url: urls[0] || null, images: urls.slice(1), video_url: state.video || null };
    },
    setValues: function (v) {
      v = v || {};
      var urls = [v.image_url].concat(toList(v.images)).filter(function (u) { return typeof u === "string" && u; });
      state.pictures = urls.map(function (u) { return { url: u }; });
      state.video = v.video_url || "";
      if (el.status) say("");
      render();
    },
    reset: function () {
      state.pictures = [];
      state.video = "";
      if (el.status) say("");
      render();
    }
  };
})();
