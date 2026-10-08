/* ============================================================
   وصل | Wasl — app.js
   boot · sidebar · folders · stories · settings · palette · calls
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => UI.esc(s);
  let started = false;
  let activeFolder = "all";
  let searchQ = "";

  /* ================= shortcuts table (single source of truth) ================= */
  const SHORTCUTS = [
    { id: "search", keys: ["Ctrl", "K"], label: "k.search", run: () => openPalette() },
    { id: "new", keys: ["Ctrl", "E"], label: "k.new", run: () => openNewChat() },
    { id: "settings", keys: ["Ctrl", ","], label: "k.settings", run: () => openSettings() },
    { id: "theme", keys: ["Alt", "T"], label: "k.theme", run: () => cycleTheme() },
    { id: "lang", keys: ["Alt", "G"], label: "k.lang", run: () => toggleLang() },
    { id: "next", keys: ["Alt", "↓"], label: "k.next", run: () => stepChat(1) },
    { id: "prev", keys: ["Alt", "↑"], label: "k.prev", run: () => stepChat(-1) },
    { id: "close", keys: ["Esc"], label: "k.close", run: () => escapeTop() },
    { id: "inchat", keys: ["Ctrl", "Shift", "F"], label: "k.inchat", run: () => { if (CHAT.current) $("#btnChatSearch").click(); } },
    { id: "mute", keys: ["Ctrl", "Shift", "M"], label: "k.mute", run: () => toggleMute() },
    { id: "reply", keys: ["Ctrl", "Shift", "R"], label: "k.reply", run: () => replyLast() },
    { id: "attach", keys: ["Ctrl", "Shift", "O"], label: "k.attach", run: () => { if (CHAT.current) $("#btnAttach").click(); } },
    { id: "lock", keys: ["Ctrl", "Shift", "L"], label: "k.lock", run: () => lockNow() }
  ];

  /* ================= boot ================= */
  function applyStaticLocale() { I18N.applyStatic(); autoLabel(); }

  /* ---------- accessible names for icon-only controls (screen readers / audits) ---------- */
  const ICON_LABELS = {
    sbSearchClr: "close", btnBack: "back", icsClose: "close", icsPrev: "k.prev", icsNext: "k.next",
    pinnedClose: "close", drClose: "close", drMore: "ui.more", svClose: "close", svReact: "act.react",
    svMute: "act.mute", vwClose: "close", vwPrev: "k.prev", vwNext: "k.next", epClose: "close",
    btnChatSearch: "search", btnChatMenu: "ui.more", btnCall: "ui.call", btnVideoCall: "ui.videoCall",
    folderAdd: "ui.folders", btnAttach: "tip.attach", btnEmoji: "tip.emoji", btnNewChat: "ui.newChat",
    btnSend: "composer.send", sbSearchClr2: "close", btnSettings: "settings.title"
  };
  const CALL_LABELS = { mute: "tip.mic", cam: "tip.video", screen: "tip.screen", end: "tip.end" };
  function autoLabel() {
    const tr = k => { if (!k) return null; const s = I18N.t(k); return s === k ? null : s; };
    document.querySelectorAll("button, [role=button]").forEach(el => {
      if ((el.getAttribute("aria-label") || "").trim()) return;
      const txt = (el.textContent || "").trim();
      let name = el.id ? tr(ICON_LABELS[el.id]) : null;
      if (!name && el.dataset.ca) name = tr(CALL_LABELS[el.dataset.ca]);
      if (!name && el.dataset.a) name = tr("act." + el.dataset.a) || tr(el.dataset.a) ||
        (/^[a-z][a-z0-9]*$/.test(el.dataset.a) ? el.dataset.a : null);
      if (!name && el.dataset.att) name = tr("att." + el.dataset.att);
      if (!name && el.dataset.tip) name = tr("tip." + el.dataset.tip) || el.dataset.tip;
      if (!name && el.classList.contains("md-x")) name = tr("close");
      /* real text already names the control */
      if (!name && txt && !/^[▲▼◆•·…\s]+$/.test(txt)) return;
      if (!name) name = el.id || null;
      if (name) el.setAttribute("aria-label", name);
    });
  }

  (function preboot() {
    DB.load();
    let lang = null;
    try { lang = localStorage.getItem("wasl.lang"); } catch (e) {}
    I18N.setLang(lang || "ar");
    applyStaticLocale();
    UI.applyTheme(DB.state.settings.theme || "aurora");
    UI.applyFontScale(DB.state.settings.fontScale || 100);
    UI.applySpacing(DB.state.settings.spacing || "comfy");
    DB.sync.init();
    DB.on("db:remote", () => { renderChatList(); });
    AUTH.boot();
  })();

  /* ================= start after login ================= */
  function start(isNew) {
    applyStaticLocale();
    UI.applyTheme(DB.state.settings.theme);
    UI.applyFontScale(DB.state.settings.fontScale || 100);
    UI.applySpacing(DB.state.settings.spacing || "comfy");
    activeFolder = DB.state.settings.currentFolder || "all";
    if (!started) { CHAT.init(); bindGlobal(); started = true; }
    renderFolders(); renderStories(); renderChatList(); renderStats();
    const last = DB.ws().active;
    if (last && DB.chat(last)) openChat(last);
    else { CHAT.close(); }
    if (isNew) UI.toast(t("auth.welcome", { name: DB.me() ? DB.me().name : "" }), "ok");
    setTimeout(() => { if (!CHAT.current) $("#sbSearch") && $("#sbSearch").focus(); }, 200);
  }

  /* ================= chat list ================= */
  function chatTs(c) {
    if (c.ts) return c.ts;
    const m = DB.lastMsg(c.id);
    return m ? m.ts : 0;
  }
  function folderMatch(c, folderId) {
    const f = DB.folders().find(x => x.id === folderId);
    if (!f || f.id === "all") return true;
    if (f.chats && Array.isArray(f.chats)) return f.chats.includes(c.id);
    if (f.types) return f.types.includes(c.type);
    return true;
  }
  function visibleChats() {
    return DB.chats()
      .filter(c => folderMatch(c, activeFolder))
      .filter(c => {
        if (!searchQ) return true;
        const q = searchQ.toLowerCase();
        if (DB.chatTitle(c).toLowerCase().includes(q)) return true;
        const last = DB.lastMsg(c.id);
        return last && String(last.text || last.caption || last.name || "").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
        return chatTs(b) - chatTs(a);
      });
  }

  function rowHTML(c) {
    const last = DB.lastMsg(c.id);
    const ava = DB.chatAvatar(c);
    const u = c.type === "private" || c.type === "bot" ? DB.user(c.user) || {} : {};
    const typing = DB.sync.typingIn(c.id);
    const draft = DB.drafts()[c.id];
    let prev = "";
    if (typing) prev = '<span class="typing">' + t("st.typing") + "</span>";
    else if (draft) prev = '<span class="draft">' + t("pv.draft") + "</span>" + esc(draft.slice(0, 60));
    else if (last) prev = UI.preview(last, c);
    else prev = '<span style="opacity:.6">' + (c.type === "saved"
      ? (I18N.lang === "ar" ? "احفظ رسالتك الأولى ✨" : "Save your first note ✨")
      : (I18N.lang === "ar" ? "ابدأ المحادثة 👋" : "Say hello 👋")) + "</span>";

    let time = "";
    if (last) {
      const mine = last.from === DB.state.me;
      if (mine && DB.state.settings.receipts && (last.type === "text" || last.type === "image"))
        time += UI.icon("check2", last.read ? "ok" : "");
      time += "<span>" + UI.listTime(chatTs(c)) + "</span>";
    }

    const flags = (c.pinned ? '<svg class="ic pin-ic"><use href="#i-pin"/></svg>' : "") +
      (c.muted ? '<svg class="ic mut-ic"><use href="#i-bell-off"/></svg>' : "");
    const badge = (c.unread > 0)
      ? '<span class="badge' + (c.muted ? " muted" : "") + '">' + (c.unread > 99 ? "99+" : c.unread) + "</span>" : "";
    const botIc = c.type === "bot" || (u && u.bot) ? '<svg class="ic ci-bot"><use href="#i-bot"/></svg>' : "";

    return '<div class="chat-item' + (c.id === CHAT.current ? " active" : "") + (c.pinned ? " pinned" : "") +
      '" data-c="' + c.id + '" tabindex="0">' +
      '<div class="ci-avatar-wrap">' + UI.avatarHTML(c, { noOnline: false }) + "</div>" +
      '<div class="ci-body"><div class="ci-top"><span class="ci-title">' + esc(DB.chatTitle(c)) + botIc +
      '<span class="ci-time">' + time + "</span></div></div>" +
      '<div class="ci-bottom"><span class="ci-prev">' + prev + "</span>" + flags + badge + "</div></div>";
  }

  function renderChatList() {
    const box = $("#chatList");
    if (!box) return;
    const rows = visibleChats();
    box.innerHTML = rows.map(rowHTML).join("");
    const empty = $("#sbEmpty");
    empty.hidden = rows.length > 0;
    $("#sbSearchClr").hidden = !searchQ;
    renderFolderBadges();
    renderDockBadge();
  }

  function renderFolderBadges() {
    $$("#folders button[data-f]").forEach(b => {
      const id = b.dataset.f;
      const n = DB.chats().filter(c => folderMatch(c, id) && !c.muted).reduce((s, c) => s + (c.unread || 0), 0);
      let b2 = b.querySelector(".f-count");
      if (n > 0) {
        if (!b2) { b2 = document.createElement("span"); b2.className = "f-count"; b.appendChild(b2); }
        b2.textContent = n;
      } else if (b2) b2.remove();
    });
  }
  function renderDockBadge() { /* reserved for future badge */ }

  function renderFolders() {
    const wrap = $("#folders");
    wrap.innerHTML = DB.folders().map(f => {
      const name = f.builtin ? t("ui.folder" + f.id.charAt(0).toUpperCase() + f.id.slice(1)) :
        (I18N.lang === "en" ? (f.nameEn || f.name) : f.name);
      return '<button data-f="' + f.id + '" class="' + (f.id === activeFolder ? "on" : "") + '">' +
        "<span>" + esc(f.emoji || "📁") + "</span>" + esc(name) + "</button>";
    }).join("") +
      '<button class="f-add" id="folderAdd" data-tip="folders" title="' + t("ui.addTab") + '">' +
      '<svg class="ic"><use href="#i-plus"/></svg></button>';
    $$("#folders button[data-f]").forEach(b => b.addEventListener("click", () => {
      activeFolder = b.dataset.f;
      DB.state.settings.currentFolder = activeFolder;
      DB.save();
      renderFolders(); renderChatList(); UI.sound.click();
    }));
    $("#folderAdd").addEventListener("click", () => openFolderModal());
  }

  function renderStats() {
    const s = DB.stats();
    $("#esStats").innerHTML =
      "<div><b>" + s.chats + "</b><small>" + t("empty.stat1") + "</small></div>" +
      "<div><b>" + s.msgs + "</b><small>" + t("empty.stat2") + "</small></div>" +
      "<div><b>" + s.themes + "</b><small>" + t("empty.stat3") + "</small></div>";
  }

  /* ================= open / close chat ================= */
  function openChat(id) {
    $("#emptyState").hidden = true;
    $("#conversation").hidden = false;
    CHAT.open(id);
    renderChatList();
  }
  function closeChat() {
    CHAT.close();
    renderChatList(); renderStats();
  }

  /* ================= stories ================= */
  function renderStories() {
    const wrap = $("#stories");
    const list = DB.stories();
    wrap.hidden = false;
    wrap.innerHTML =
      '<div class="story" data-add="1"><div class="st-ring" style="background:conic-gradient(from 210deg,var(--accent),var(--accent-2))">' +
      '<span class="avatar" style="background:var(--surface-3)"><span>' + esc(DB.me().emoji || "🙂") + "</span></span>" +
      '<span class="st-add"><svg class="ic"><use href="#i-plus"/></svg></span></div>' +
      "<small>" + t("story.add") + "</small></div>" +
      list.map(s => {
        const u = DB.user(s.user) || {};
        return '<div class="story' + (s.seen ? " seen" : "") + '" data-s="' + s.id + '">' +
          '<div class="st-ring">' + UI.avatarHTML(u, { noOnline: true }) + "</div>" +
          "<small>" + esc(DB.memberName(s.user).split(" ")[0]) + "</small></div>";
      }).join("");
    wrap.onclick = e => {
      const add = e.target.closest("[data-add]");
      if (add) { addStory(); return; }
      const st = e.target.closest("[data-s]");
      if (st) openStory(st.dataset.s);
    };
  }

  async function addStory() {
    const text = await UI.prompt({ title: t("story.add"), placeholder: t("story.textPh"), max: 90, required: true });
    if (!text) return;
    const grads = ["linear-gradient(135deg,#5B8CFF,#8B5CF6)", "linear-gradient(135deg,#F59E0B,#EF4444)",
      "linear-gradient(135deg,#14B8A6,#22D3EE)", "linear-gradient(135deg,#EC4899,#8B5CF6)"];
    DB.stories().unshift({ id: DB.uid("st"), user: DB.state.me, ts: Date.now(), seen: true,
      items: [{ bg: grads[Math.floor(Math.random() * grads.length)], emoji: ["✨", "🌟", "🎉", "🚀"][Math.floor(Math.random() * 4)], text }] });
    DB.save(); DB.sync.send("db");
    renderStories();
    UI.toast(t("story.created"), "ok");
  }

  let storyTimer = null, storyAuthor = null;
  function openStory(id) {
    const list = DB.stories();
    let idx = list.findIndex(s => s.id === id);
    if (idx < 0) return;
    $("#storyView").hidden = false;
    const show = () => {
      const s = list[idx];
      if (!s) { closeStory(); return; }
      storyAuthor = s.user;
      const u = DB.user(s.user) || {};
      const av = $("#svAvatar");
      if (av) {
        const tmp = document.createElement("div");
        tmp.innerHTML = UI.avatarHTML(u, { size: "sm", noOnline: true });
        const src = tmp.firstElementChild;
        if (src) { av.className = src.className; av.setAttribute("style", src.getAttribute("style") || ""); av.innerHTML = src.innerHTML; }
      }
      $("#svName").textContent = DB.memberName(s.user);
      $("#svTime").textContent = UI.rel(s.ts);
      const item = s.items[0];
      $("#svStage").innerHTML = '<div class="sv-content" style="background:' + item.bg + '">' +
        (item.emoji ? '<div class="sv-emoji">' + esc(item.emoji) + "</div>" : "") +
        '<div class="sv-text">' + esc(item.text || "") + "</div></div>";
      $("#svProgress").innerHTML = list.map((x, i) =>
        '<i class="' + (i < idx ? "done" : i === idx ? "on" : "") + '"><b></b></i>').join("");
      if (!s.seen) { s.seen = true; DB.save(); }
      clearTimeout(storyTimer);
      storyTimer = setTimeout(() => { idx++; show(); }, 5000);
    };
    show();
    $("#svStage").onclick = e => {
      const r = $("#svStage").getBoundingClientRect();
      const rtl = document.documentElement.dir === "rtl";
      const clickLeft = (e.clientX - r.left) < r.width / 2;
      if (rtl ? !clickLeft : clickLeft) { idx--; } else { idx++; }
      if (idx < 0) idx = 0;
      if (idx >= list.length) { closeStory(); return; }
      show();
    };
  }
  function closeStory() { clearTimeout(storyTimer); $("#storyView").hidden = true; renderStories(); }

  /* ================= drawer (chat info) ================= */
  function openDrawer(chatId) {
    const c = DB.chat(chatId);
    if (!c) return;
    const body = $("#drBody");
    const a = DB.chatAvatar(c);
    const u = c.type === "private" || c.type === "bot" ? DB.user(c.user) || {} : {};
    const isMe = c.type === "saved";
    let hero = '<div class="dr-hero">' + UI.avatarHTML(c, { size: "xl", noOnline: true }) +
      "<h3>" + esc(DB.chatTitle(c)) + "</h3>";
    if (c.type === "private" || c.type === "bot") hero += '<div class="u">@' + esc(u.username || "—") + "</div>" +
      '<div class="st">' + esc(CHAT.statusLine(c)) + "</div>";
    else if (c.type === "group") hero += '<div class="st">' + t("st.nMembers", { n: (c.members || []).length }) + "</div>";
    else if (c.type === "channel") hero += '<div class="st">' + t("st.nSubs", { n: (c.subscribers || 0).toLocaleString("en-US") }) + "</div>";
    else hero += '<div class="st">' + t("st.saved") + "</div>";
    hero += "</div>";

    const actions = '<div class="dr-actions">' +
      '<button data-da="search"><i>' + UI.icon("search") + "</i><span>" + t("search") + "</span></button>" +
      '<button data-da="mute"><i>' + UI.icon(c.muted ? "bell" : "bell-off") + "</i><span>" +
      (c.muted ? t("act.unmute") : t("act.mute")) + "</span></button>" +
      (c.type === "private" ? '<button data-da="profile"><i>' + UI.icon("user") + "</i><span>" + t("act.profile") + "</span></button>" : "") +
      (c.type === "group" || c.type === "channel" ? '<button data-da="members"><i>' + UI.icon("users") + "</i><span>" + t("act.members") + "</span></button>" : "") +
      "</div>";

    const msgs = DB.msgs(c.id);
    const media = msgs.filter(m => m.type === "image" && (m.src || m.mediaId));
    const files = msgs.filter(m => m.type === "file");
    const voices = msgs.filter(m => m.type === "voice");
    const links = msgs.filter(m => m.type === "text" && /https?:\/\//.test(m.text));

    const tabs = '<div class="dr-tabs" id="drTabs">' +
      '<button data-t="media" class="on">' + t("chat.media") + "</button>" +
      '<button data-t="files">' + t("chat.files") + "</button>" +
      '<button data-t="links">' + t("chat.links") + "</button>" +
      '<button data-t="voice">' + t("chat.voice") + "</button></div>";

    const secAbout = (c.about || c.aboutEn || u.bio || u.bioEn)
      ? '<div class="dr-sec"><h3>' + t("chat.about") + "</h3>" +
        '<div class="dr-info">' + UI.icon("info") + "<div><small>" + esc(c.about || u.bio || "") +
        "</small></div></div></div>" : "";
    const secMembers = (c.type === "group") ? '<div class="dr-sec"><h3>' + t("chat.members") + "</h3>" +
      (c.members || []).slice(0, 8).map(id => '<div class="dr-member" data-u="' + id + '">' +
        UI.avatarHTML(DB.user(id) || { emoji: "🙂" }, { size: "sm" }) +
        "<div><b>" + esc(DB.memberName(id)) + "</b><small>@" + esc((DB.user(id) || {}).username || "—") + "</small></div>" +
        ((c.admins || []).includes(id) ? '<span class="role">' + (id === (c.admins || [])[0] ? t("members.owner") : t("members.admin")) + "</span>" : "") +
        "</div>").join("") +
      ((c.members || []).length > 8 ? '<div class="dr-member" data-all="1"><b>+ ' + ((c.members || []).length - 8) + "</b></div>" : "") +
      "</div>" : "";
    const secMeta = '<div class="dr-sec"><h3>' + t("chat.shared") + "</h3>" +
      '<div class="dr-info">' + UI.icon("image") + "<div><b>" + media.length + " " + t("chat.media") +
      "</b><small>" + files.length + " " + t("chat.files") + " · " + voices.length + " " + t("chat.voice") +
      " · " + links.length + " " + t("chat.links") + "</small></div></div></div>";

    body.innerHTML = hero + actions + tabs +
      '<div id="drTabBody">' + mediaSection(media) + "</div>" + secMeta + secMembers + secAbout;

    /* tab switching */
    $("#drTabs").onclick = e => {
      const b = e.target.closest("[data-t]"); if (!b) return;
      $("#drTabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      const kind = b.dataset.t;
      const map = { media: mediaSection(media), files: listSection(files, "file"),
        links: listSection(links, "link"), voice: listSection(voices, "voice") };
      $("#drTabBody").innerHTML = map[kind];
    };
    body.querySelector(".dr-actions").onclick = e => {
      const b = e.target.closest("[data-da]"); if (!b) return;
      const act = b.dataset.da;
      if (act === "mute") { c.muted = !c.muted; DB.save(); renderChatList(); openDrawer(chatId);
        UI.toast(c.muted ? t("to.muteOn") : t("to.muteOff"), "ok"); }
      else if (act === "search") { UI.closeModal($("#m-settings")); $("#drawer").hidden = true; $("#app").classList.remove("drawer-open");
        if (CHAT.current !== chatId) openChat(chatId); setTimeout(() => $("#btnChatSearch").click(), 120); }
      else if (act === "profile" && c.user) openProfile(c.user);
      else if (act === "members") $("#btnChatMenu").click();
    };
    body.querySelectorAll("[data-u]").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.u;
      if (id !== DB.state.me) openProfile(id);
    }));
    $("#drawer").hidden = false;
    $("#app").classList.add("drawer-open");
    $("#app").classList.add("drawer-open");
  }
  function closeDrawer() { $("#drawer").hidden = true; $("#app").classList.remove("drawer-open"); }

  function mediaSection(media) {
    if (!media.length) return '<div class="empty-sec"><div>🖼️</div>' + t("chat.noMedia") + "</div>";
    return '<div class="dr-sec"><div class="media-grid">' + media.map(m => {
      const url = m.src || DB.media.get(m.mediaId);
      return '<div class="mg" data-v="' + m.id + '">' + (url ? '<img src="' + esc(url) + '" loading="lazy">' : UI.icon("image")) + "</div>";
    }).join("") + "</div></div>";
  }
  function listSection(list, kind) {
    if (!list.length) {
      const empty = kind === "file" ? t("chat.noFiles") : kind === "link" ? t("chat.noLinks") : t("chat.noVoice");
      return '<div class="empty-sec"><div>' + (kind === "file" ? "📎" : kind === "link" ? "🔗" : "🎙️") + "</div>" + empty + "</div>";
    }
    return '<div class="dr-sec">' + list.map(m => {
      if (kind === "file") return '<div class="file-row"><div class="fi">' + UI.icon("file") +
        "</div><div><b>" + esc(m.name || "file") + "</b><small>" + UI.fmtSize(m.size || 0) + " · " + UI.rel(m.ts) + "</small></div></div>";
      if (kind === "voice") return '<div class="file-row"><div class="fi">' + UI.icon("mic") +
        "</div><div><b>" + t("pv.voice") + "</b><small>" + UI.fmtDur(m.dur || 0) + " · " + UI.rel(m.ts) + "</small></div></div>";
      const url = (m.text.match(/https?:\/\/\S+/) || [])[0] || "";
      return '<div class="link-row">' + UI.icon("link") + "<div><b>" + esc(url.slice(0, 54)) +
        "</b><small>" + UI.rel(m.ts) + "</small></div></div>";
    }).join("") + "</div>";
  }

  /* ================= new chat / create ================= */
  function openNewChat() {
    $("#ncSearch").value = "";
    renderNewChatList();
    UI.openModal("m-newchat");
  }
  function renderNewChatList() {
    const q = ($("#ncSearch").value || "").toLowerCase();
    const people = DB.personas().concat(DB.users().filter(u => u.real && u.id !== DB.state.me && !u.persona));
    const rows = people.filter(u => !q || (u.name || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q));
    $("#ncList").innerHTML = rows.map(u => {
      const isDevice = DB.accounts().some(a => a.userId === u.id);
      const online = DB.isOnline(u.id);
      return '<div class="pick-row" data-u="' + u.id + '">' + UI.avatarHTML(u, { size: "sm" }) +
        "<b>" + esc(u.name) + (u.bot ? " 🤖" : "") +
        "<small>@" + esc(u.username || "—") + (online ? " · " + t("st.online") : "") +
        (isDevice ? " · " + t("new.device") : "") + "</small></b></div>";
    }).join("") || '<div class="empty-sec"><div>🔍</div>' + t("search.none") + "</div>";
  }

  let createMode = "group", createPicked = new Set(), createEmoji = "👥";
  function openCreate(mode) {
    createMode = mode; createPicked = new Set(); createEmoji = mode === "group" ? "👥" : "📢";
    $("#createTitle").textContent = mode === "group" ? t("create.group") : t("create.channel");
    $("#createName").value = ""; $("#createAbout").value = "";
    renderCreateAva(); renderPickList();
    UI.openModal("m-create");
  }
  const EMOJI_PICK = ["👥", "🚀", "📢", "⚽", "🎨", "🔥", "💡", "🎯", "📚", "🎮", "🍕", "☕", "🌟", "🐱", "🌍", "💼"];
  function renderCreateAva() {
    $("#createAva").innerHTML = "<span>" + createEmoji + "</span>";
  }
  function renderPickList() {
    const people = DB.personas().concat(DB.users().filter(u => u.real && u.id !== DB.state.me && !u.persona));
    $("#pickList").innerHTML = people.map(u =>
      '<div class="pick-row' + (createPicked.has(u.id) ? " on" : "") + '" data-u="' + u.id + '">' +
      UI.avatarHTML(u, { size: "sm" }) + "<b>" + esc(u.name) + "<small>@" + esc(u.username || "—") +
      '</small></b><span class="chk">' + UI.icon("check") + "</span></div>").join("");
    $("#pickCount").textContent = createPicked.size + " / " + people.length;
  }

  /* ================= folder modal ================= */
  let folderEmoji = "📁";
  function openFolderModal() {
    folderEmoji = "📁";
    $("#folderName").value = "";
    $("#folderEmoji").innerHTML = ["📁", "⭐", "💼", "🎮", "❤️", "🔧", "📚", "🎧", "🌐", "💰"]
      .map(e => '<button data-e="' + e + '" class="' + (e === folderEmoji ? "on" : "") + '">' + e + "</button>").join("");
    $("#folderChats").innerHTML = DB.chats().map(c =>
      '<div class="pick-row" data-c="' + c.id + '">' + UI.avatarHTML(c, { size: "sm", noOnline: true }) +
      "<b>" + esc(DB.chatTitle(c)) + '</b><span class="chk">' + UI.icon("check") + "</span></div>").join("");
    UI.openModal("m-folder");
  }

  /* ================= profile ================= */
  function openProfile(userId) {
    const u = DB.user(userId);
    if (!u) return;
    const isMe = userId === DB.state.me;
    const body = $("#profBody"), foot = $("#profFoot");
    $("#profTitle").textContent = t("profile.title");
    body.innerHTML =
      '<div class="dr-hero">' + UI.avatarHTML(u, { size: "xl", noOnline: !isMe }) +
      "<h3>" + esc(u.name) + "</h3>" +
      '<div class="u">@' + esc(u.username || "—") + "</div>" +
      '<div class="st">' + (isMe ? t("st.self") : esc(CHAT.statusLine(DB.chatOfUser(userId) || { type: "private", user: userId }))) + "</div></div>" +
      '<div class="dr-sec"><div class="dr-info">' + UI.icon("info") + "<div><h3>" + t("chat.bio") +
      "</h3><small>" + esc(isMe ? (u.bio || (I18N.lang === "ar" ? "أضف نبذة من الإعدادات ← حسابي" : "Add a bio from Settings → My account")) : (u.bio || "—")) + "</small></div></div>" +
      (u.phone ? '<div class="dr-info">' + UI.icon("phone") + "<div><h3>" + t("chat.phone") +
        "</h3><small>" + esc(u.phone) + "</small></div></div>" : "") +
      '<div class="dr-info">' + UI.icon("globe") + "<div><h3>" + t("chat.username") +
      "</h3><small>@" + esc(u.username || "—") + "</small></div></div></div>";
    foot.innerHTML = isMe
      ? '<button class="btn ghost" data-p="edit">' + t("profile.edit") + "</button>" +
        '<button class="btn primary" data-p="settings">' + t("settings.title") + "</button>"
      : '<button class="btn ghost" data-p="call">' + t("act.call") + "</button>" +
        '<button class="btn primary" data-p="msg">' + t("chat.sendMessage") + "</button>";
    foot.onclick = async e => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      const act = b.dataset.p;
      if (act === "settings") { UI.closeModal($("#m-profile")); openSettings(); }
      else if (act === "edit") { UI.closeModal($("#m-profile")); openSettings("me"); }
      else if (act === "msg") {
        const chat = DB.openDM(userId);
        UI.closeModal($("#m-profile")); openChat(chat.id);
      } else if (act === "call") {
        const chat = DB.openDM(userId);
        UI.closeModal($("#m-profile")); openChat(chat.id);
        startCall(chat.id, "audio");
      }
    };
    UI.openModal("m-profile");
  }

  /* ================= settings ================= */
  let setSection = "me";
  function openSettings(section) {
    setSection = section || "me";
    $("#setNav").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.s === setSection));
    renderSetPane();
    UI.openModal("m-settings");
  }
  function renderSetPane() {
    const S = DB.state.settings, meU = DB.me(), st = DB.stats();
    const html = {
      me: () =>
        '<div class="set-sec"><h3>' + t("set.me") + "</h3><p>" + t("s.profile") + "</p>" +
        '<div class="me-hero">' + UI.avatarHTML(meU, { size: "lg", noOnline: true }) +
        "<div><b>" + esc(meU.name) + "</b><small>@" + esc(meU.username || "—") +
        (meU.phone ? " · " + esc(meU.phone) : "") + "</small></div>" +
        '<button class="btn primary sm" data-a="editme">' + t("profile.edit") + "</button></div>" +
        '<div class="set-card">' +
        row("user", t("s.devices"), t("s.devicesSub", { dev: (navigator.platform || "Web").slice(0, 22) }), "",
          '<button class="btn ghost sm" data-a="devices">' + t("ok") + "</button>") +
        row("key", t("s.pw"), t("s.pwSub"), "", '<button class="btn ghost sm" data-a="chpw">' + t("s.pwDo") + "</button>") +
        row("shield", t("s.lock"), t("s.lockSub"), "",
          S.lock ? '<button class="btn ghost sm" data-a="lockoff">' + t("s.lockOff") + "</button>" +
                   '<button class="btn ghost sm" data-a="lockchg">' + t("s.lockChange") + "</button>"
                 : '<button class="btn primary sm" data-a="lockon">' + t("s.lockSet") + "</button>") +
        row("logout", t("profile.logout"), "", "", '<button class="btn ghost sm" data-a="logout">' + t("ok") + "</button>") +
        row("trash", t("profile.deleteAcc"), (I18N.lang === "ar" ? "حذف نهائي لهذا الجهاز" : "Permanently remove from this device"), "",
          '<button class="btn danger sm" data-a="delacc">' + t("delete") + "</button>") +
        "</div></div>",
      privacy: () =>
        '<div class="set-sec"><h3>' + t("set.privacy") + "</h3><p>" + t("s.privacyNote") + "</p><div class=\"set-card\">" +
        sel("eye", t("s.lastSeen"), "", "lastSeen", [["everyone", t("s.everyone")], ["contacts", t("s.mycontacts")], ["nobody", t("s.nobody")]], S.lastSeen) +
        sel("forward", t("s.forward"), "", "forward", [["everyone", t("s.everyone")], ["contacts", t("s.mycontacts")], ["nobody", t("s.nobody")]], S.forward) +
        sw("edit", t("s.typingInd"), t("s.typingSub"), "typing", S.typing) +
        sw("check2", t("s.readReceipts"), t("s.readReceiptsSub"), "receipts", S.receipts) +
        "</div>" +
        '<p style="margin-top:14px;color:var(--text-3);font-size:12.4px">' +
        (I18N.lang === "ar" ? "سجل محاولات الدخول: " : "Login attempt log: ") +
        ((DB.state.loginLog || []).length) + "</p></div>",
      notif: () =>
        '<div class="set-sec"><h3>' + t("set.notif") + "</h3><p>" + t("s.notifSoundSub") + "</p><div class=\"set-card\">" +
        sw("bell", t("s.notifSound"), t("s.notifSoundSub"), "sound", S.sound) +
        sw("info", t("s.notifPreview"), t("s.notifPreviewSub"), "preview", S.preview) +
        sw("bolt", t("s.notifAll"), t("s.notifAllSub"), "notifyAll", S.notifyAll) +
        "</div><button class=\"btn ghost sm\" style=\"margin-top:14px\" data-a=\"testnotif\">" + t("s.testNotif") + "</button></div>",
      chat: () =>
        '<div class="set-sec"><h3>' + t("s.themes") + "</h3><p>" + t("s.themesSub") + "</p>" +
        '<div class="theme-grid">' + UI.THEMES.map(th =>
          '<button class="theme-card' + (S.theme === th.id ? " on" : "") + '" data-th="' + th.id + '">' +
          '<div class="tc-prev" style="background:' + th.s + ';--tc-surface:' + th.b + ';--tc-accent:' + th.a +
          ';--tc-bubble:' + (th.dark ? "#2B3550" : "#FFFFFF") + '"></div>' +
          "<b>" + th.label + (th.dark ? " 🌙" : " ☀️") + '</b><span class="tc-check">' + UI.icon("check") + "</span></button>").join("") +
        "</div>" +
        "<h4>" + t("s.accent") + "</h4><p>" + t("s.accentSub") + "</p>" +
        '<div class="swatches">' + Object.keys(UI.ACCENTS).map(k =>
          '<button class="swatch' + (S.accent === k ? " on" : "") + '" data-ac="' + k +
          '" style="background:linear-gradient(135deg,' + UI.ACCENTS[k][0] + "," + UI.ACCENTS[k][1] + ')"></button>').join("") +
        "</div>" +
        "<h4>" + t("s.wall") + "</h4><p>" + t("s.wallSub") + "</p>" +
        '<div class="wall-grid">' + ["pattern", "plain", "gradient", "dots"].map(w =>
          '<button class="wall-opt' + (S.wallpaper === w ? " on" : "") + '" data-wall="' + w + '" style="' +
          wallpaperStyle(w) + '">' + w + "</button>").join("") + "</div>" +
        "<h4 style=\"margin-top:18px\">" + t("s.font") + "</h4><p>" + t("s.fontSub") + "</p>" +
        '<div class="slider-row"><input type="range" min="85" max="130" step="5" value="' + (S.fontScale || 100) +
        '" data-sl="font"><b>' + (S.fontScale || 100) + "%</b></div>" +
        "<h4>" + t("s.bubbles") + "</h4><p>" + t("s.bubblesSub") + "</p>" +
        '<div style="display:flex;gap:10px;margin-bottom:8px">' +
        '<button class="btn ' + (S.spacing === "compact" ? "primary" : "ghost") + ' sm" data-sp="compact">' + t("s.compact") + "</button>" +
        '<button class="btn ' + (S.spacing !== "compact" ? "primary" : "ghost") + ' sm" data-sp="comfy">' + t("s.comfy") + "</button></div>" +
        sw("spark", t("s.anim"), t("s.animSub"), "anim", S.anim) +
        "</div>",
      lang: () =>
        '<div class="set-sec"><h3>' + t("s.langTitle") + "</h3><p>" + t("s.langSub") + "</p>" +
        '<div style="display:flex;gap:12px;margin-bottom:18px">' +
        '<button class="btn ' + (I18N.lang === "ar" ? "primary" : "ghost") + '" data-lg="ar">العربية 🇸🇾</button>' +
        '<button class="btn ' + (I18N.lang === "en" ? "primary" : "ghost") + '" data-lg="en">English 🇬🇧</button></div>' +
        '<div class="set-card">' + row("globe", I18N.lang === "ar" ? t("s.rtl") : t("s.ltr"), "",
          "", "") + "</div></div>",
      data: () =>
        '<div class="set-sec"><h3>' + t("set.data") + "</h3><p>" + t("s.storageSub",
          { n: UI.fmtSize(st.storage) }) + "</p><div class=\"set-card\">" +
        row("wallet", t("s.storage"), UI.fmtSize(st.storage) + " · " + st.media + " " + t("s.mediaCount"), "", "") +
        row("list", t("s.msgCount"), String(st.msgs), "", "") +
        row("folder", t("s.chatCount"), String(st.chats), "", "") +
        "</div><div style=\"display:flex;gap:11px;flex-wrap:wrap;margin-top:16px\">" +
        '<button class="btn primary" data-a="export">' + UI.icon("download") + t("s.export") + "</button>" +
        '<button class="btn ghost" data-a="import">' + UI.icon("upload") + t("s.import") + "</button>" +
        '<button class="btn danger" data-a="wipe">' + UI.icon("trash") + t("s.clearAll") + "</button></div>" +
        '<p style="color:var(--text-3);font-size:12.2px;margin-top:12px">' + t("s.exportSub") + "</p></div>",
      keys: () => '<div class="set-sec"><h3>' + t("keys.title") + "</h3><p>" + t("s.keysSub") +
        '</p><div class="keys-grid">' + SHORTCUTS.map(s =>
          '<div class="key-row"><span>' + t(s.label) + "</span>" +
          s.keys.map(k => "<kbd>" + k + "</kbd>").join("") + "</div>").join("") + "</div></div>",
      about: () =>
        '<div class="set-sec"><div class="about-logo" data-logo></div>' +
        '<p class="about-txt"><b>' + t("s.aboutTitle") + "</b> · " + t("s.version") + " 1.0.0<br>" +
        t("s.aboutSub") + "</p><div class=\"about-feats\">" +
        [["⚡", I18N.lang === "ar" ? "مزامنة فورية بين التبويبات عبر BroadcastChannel — جرّب فتح تبويبين." : "Instant tab-to-tab sync via BroadcastChannel — open two tabs and try it."],
         ["🤖", I18N.lang === "ar" ? "مساعد وصل يعمل بلا إنترنت: حسابات، نكت، أفكار، ومهام." : "Offline assistant: math, jokes, ideas and tasks."],
         ["🎨", I18N.lang === "ar" ? "10 ثيمات + 10 ألوان مميّزة + 4 خلفيات." : "10 themes + 10 accent colors + 4 wallpapers."],
         ["🔐", I18N.lang === "ar" ? "قفل PIN، رسائل تدمر ذاتياً، وتشفير محلي SHA-256." : "PIN lock, self-destructing messages, local SHA-256."],
         ["🔒", I18N.lang === "ar" ? "بلا خادم، بلا إعلانات، بلا تتبّع — بياناتك لا تغادر المتصفح." : "No server, no ads, no tracking — data never leaves the browser."]]
          .map(f => "<div><span>" + f[0] + "</span>" + f[1] + "</div>").join("") +
        "</div></div>"
    };
    $("#setPanes").innerHTML = (html[setSection] || html.me)();
    bindSetPane();
  }

  function row(icon, title, sub, key, action) {
    return '<div class="set-row"><span class="sr-ico">' + UI.icon(icon) + '</span><span class="sr-txt"><b>' +
      esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>" + (action || "") + "</div>";
  }
  function sw(icon, title, sub, key, val) {
    return '<label class="set-row"><span class="sr-ico">' + UI.icon(icon) + '</span><span class="sr-txt"><b>' +
      esc(title) + "</b><small>" + esc(sub) + '</small></span><input type="checkbox" data-sw="' + key +
      '"' + (val ? " checked" : "") + '><i class="sw"></i></label>';
  }
  function sel(icon, title, sub, key, opts, val) {
    return '<div class="set-row"><span class="sr-ico">' + UI.icon(icon) + '</span><span class="sr-txt"><b>' +
      esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><select data-sel="' + key + '">' +
      opts.map(o => '<option value="' + o[0] + '"' + (val === o[0] ? " selected" : "") + ">" + o[1] + "</option>").join("") +
      "</select></div>";
  }
  function wallpaperStyle(w) {
    const S = DB.state.settings;
    if (w === "plain") return "background:var(--surface-2)";
    if (w === "gradient") return "background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff";
    if (w === "dots") return "background:radial-gradient(circle at 20% 30%, var(--line-2) 1.5px, transparent 1.6px) 0 0/16px 16px, var(--surface-2)";
    return "background:var(--wall),var(--surface-2);background-size:auto";
  }
  function applyWallpaper(w) {
    $$(".conversation").forEach(el => {
      if (w === "plain") { el.style.background = "var(--surface-2)"; }
      else if (w === "gradient") { el.style.background = "linear-gradient(160deg,color-mix(in srgb,var(--accent) 14%,var(--bg)),color-mix(in srgb,var(--accent-2) 10%,var(--bg)))"; }
      else if (w === "dots") {
        el.style.background = "radial-gradient(circle at 20% 30%, var(--line-2) 1.5px, transparent 1.6px) 0 0/18px 18px, var(--surface-2)";
      } else { el.style.background = ""; }
    });
    $$(".empty-state").forEach(el => { if (w === "plain" || w === "gradient" || w === "dots") el.style.background = ""; });
  }

  function bindSetPane() {
    const pane = $("#setPanes");
    pane.onclick = async e => {
      const th = e.target.closest("[data-th]");
      if (th) { DB.state.settings.theme = th.dataset.th; DB.save(); UI.applyTheme(th.dataset.th);
        renderSetPane(); UI.toast(t("to.theme"), "ok"); return; }
      const ac = e.target.closest("[data-ac]");
      if (ac) { DB.state.settings.accent = ac.dataset.ac; DB.save(); UI.applyAccent(ac.dataset.ac); renderSetPane(); return; }
      const wl = e.target.closest("[data-wall]");
      if (wl) { DB.state.settings.wallpaper = wl.dataset.wall; DB.save(); applyWallpaper(wl.dataset.wall); renderSetPane(); return; }
      const sp = e.target.closest("[data-sp]");
      if (sp) { DB.state.settings.spacing = sp.dataset.sp; DB.save(); UI.applySpacing(sp.dataset.sp); renderSetPane(); return; }
      const lg = e.target.closest("[data-lg]");
      if (lg) { setLang(lg.dataset.lg); renderSetPane(); return; }
      const btn = e.target.closest("[data-a]");
      if (!btn) return;
      const a = btn.dataset.a;
      if (a === "editme") editMe();
      else if (a === "logout") { if (await UI.confirm(t("cf.logout"), { danger: false, ok: t("profile.logout") })) AUTH.logout(); }
      else if (a === "delacc") { if (await UI.confirm(I18N.lang === "ar" ? "سيُحذف الحساب ومساحة عمله نهائياً من هذا الجهاز. متأكد؟" : "This account and its workspace will be erased from this device. Sure?", { ok: t("delete") })) AUTH.deleteAccount(); }
      else if (a === "chpw") changePassword();
      else if (a === "lockon") { if (await AUTH.lock.enable()) renderSetPane(); }
      else if (a === "lockchg") { if (await AUTH.lock.change()) renderSetPane(); }
      else if (a === "lockoff") { if (await UI.confirm(t("cf.disableLock"), { ok: t("ok"), danger: false })) { AUTH.lock.disable(); renderSetPane(); } }
      else if (a === "devices") UI.toast(t("s.devicesSub", { dev: (navigator.platform || "Web").slice(0, 22) }), "ok");
      else if (a === "testnotif") { UI.sound.msg(); UI.toast(I18N.lang === "ar" ? "🔔 هذا إشعار تجريبي" : "🔔 This is a test notification", "ok"); }
      else if (a === "export") { DB.exportBackup(); UI.toast(t("to.backup"), "ok"); }
      else if (a === "import") $("#fileBackup").click();
      else if (a === "wipe") { if (await UI.confirm(t("cf.reset"), { ok: t("s.clearAll") })) DB.resetAll(true); }
    };
    pane.onchange = e => {
      const s = e.target.closest("[data-sw]");
      if (s) { DB.state.settings[s.dataset.sw] = s.checked; DB.save(); UI.sound.click();
        if (s.dataset.sw === "anim") document.body.classList.toggle("no-anim", !s.checked); return; }
      const sel2 = e.target.closest("[data-sel]");
      if (sel2) { DB.state.settings[sel2.dataset.sel] = sel2.value; DB.save(); return; }
      const sl = e.target.closest("[data-sl]");
      if (sl) { DB.state.settings.fontScale = +sl.value; DB.save(); UI.applyFontScale(+sl.value);
        sl.nextElementSibling.textContent = sl.value + "%"; }
    };
  }

  async function editMe() {
    const u = DB.me();
    const name = await UI.prompt({ title: t("create.name"), value: u.name, required: true, max: 40 });
    if (name == null) return;
    const username = await UI.prompt({ title: t("profile.username"), value: u.username || "", max: 24 });
    if (username == null) return;
    const bio = await UI.prompt({ title: t("profile.bio"), value: u.bio || "", max: 80 });
    u.name = name || u.name;
    u.username = (username || u.username || "").replace(/[^A-Za-z0-9_]/g, "").toLowerCase() || u.username;
    u.bio = bio || "";
    u.nameEn = u.name;
    DB.save(); DB.sync.send("db");
    renderChatList(); renderSetPane(); renderStories();
    UI.toast(t("to.edited"), "ok");
  }
  async function changePassword() {
    const old = await UI.prompt({ title: t("s.pwOld"), required: true, max: 64 });
    if (!old) return;
    const np = await UI.prompt({ title: t("s.pwNew"), required: true, max: 64 });
    if (!np) return;
    const r = await AUTH.changePassword(old, np);
    if (r.ok) UI.toast(t("to.passChanged"), "ok");
    else UI.toast(r.reason === "old" ? t("to.oldPass") : t("auth.errPassLen"), "err");
  }

  /* ================= palette ================= */
  let plItems = [], plIdx = 0;
  function openPalette() {
    $("#palette").hidden = false;
    $("#plInput").value = "";
    renderPalette();
    setTimeout(() => $("#plInput").focus(), 60);
  }
  function closePalette() { $("#palette").hidden = true; }
  function paletteCommands() {
    return [
      { g: "cmds", icon: "edit", label: t("palette.cmd.new"), run: openNewChat },
      { g: "cmds", icon: "users", label: t("palette.cmd.group"), run: () => openCreate("group") },
      { g: "cmds", icon: "mega", label: t("palette.cmd.channel"), run: () => openCreate("channel") },
      { g: "cmds", icon: "gear", label: t("palette.cmd.settings"), run: openSettings },
      { g: "cmds", icon: "palette", label: t("palette.cmd.theme"), run: cycleTheme },
      { g: "cmds", icon: "globe", label: t("palette.cmd.lang"), run: toggleLang },
      { g: "cmds", icon: "keyboard", label: t("palette.cmd.keys"), run: () => UI.openModal("m-shortcuts") },
      { g: "cmds", icon: "lock", label: t("palette.cmd.lock"), run: lockNow },
      { g: "cmds", icon: "download", label: t("palette.cmd.export"), run: () => { DB.exportBackup(); UI.toast(t("to.backup"), "ok"); } },
      { g: "cmds", icon: "image", label: t("palette.cmd.story"), run: addStory },
      { g: "cmds", icon: "bell-off", label: t("palette.cmd.mute"), run: toggleMute, need: () => !!CHAT.current },
      { g: "cmds", icon: "trash", label: t("palette.cmd.clear"), run: clearCurrent, need: () => !!CHAT.current }
    ].filter(c => !c.need || c.need());
  }
  function renderPalette() {
    const q = ($("#plInput").value || "").trim().toLowerCase();
    plItems = [];
    let html = "";
    /* commands */
    const cmds = paletteCommands().filter(c => !q || c.label.toLowerCase().includes(q));
    if (cmds.length) {
      html += '<div class="pl-group">' + t("palette.cmds") + "</div>";
      cmds.forEach(c => { plItems.push(c); html += plItem(c.icon, c.label, "", plItems.length - 1); });
    }
    /* chats */
    const chats = DB.chats().filter(c => !q || DB.chatTitle(c).toLowerCase().includes(q)).slice(0, 7);
    if (chats.length) {
      html += '<div class="pl-group">' + t("palette.chats") + "</div>";
      chats.forEach(c => {
        const item = { g: "chats", run: () => { closePalette(); openChat(c.id); } };
        plItems.push(item);
        html += '<div class="pl-item" data-i="' + (plItems.length - 1) + '">' + UI.avatarHTML(c, { size: "sm" }) +
          "<div><b>" + esc(DB.chatTitle(c)) + "</b><small>" + esc(CHAT.statusLine(c)) + "</small></div></div>";
      });
    }
    /* messages */
    if (q.length > 1) {
      const found = [];
      DB.chats().forEach(c => {
        DB.msgs(c.id).forEach(m => {
          const txt = String(m.text || m.caption || m.name || "");
          if (txt.toLowerCase().includes(q) && found.length < 8) found.push({ c, m, txt });
        });
      });
      if (found.length) {
        html += '<div class="pl-group">' + t("palette.msgs") + "</div>";
        found.forEach(f => {
          const item = { g: "msgs", run: () => { closePalette(); openChat(f.c.id); setTimeout(() => {
            const el = document.querySelector('.msg-row[data-id="' + f.m.id + '"]');
            if (el) { el.scrollIntoView({ block: "center" }); el.animate([{ filter: "brightness(1.7)" }, { filter: "none" }], 800); }
          }, 220); } };
          plItems.push(item);
          html += '<div class="pl-item" data-i="' + (plItems.length - 1) + '">' + UI.icon("search") +
            "<div><b>" + esc(DB.chatTitle(f.c)) + "</b><small>" + esc(f.txt.slice(0, 70)) + "</small></div></div>";
        });
      }
    }
    if (!plItems.length) html = '<div class="pl-empty">🔍 ' + t("search.none") + "</div>";
    $("#plResults").innerHTML = html;
    plIdx = 0; markPl();
  }
  function plItem(icon, label, hint, i) {
    return '<div class="pl-item" data-i="' + i + '">' + UI.icon(icon) +
      "<div><b>" + esc(label) + "</b></div>" + (hint ? '<span class="hint">' + hint + "</span>" : "") + "</div>";
  }
  function markPl() {
    $$("#plResults .pl-item").forEach((el, i) => el.classList.toggle("on", i === plIdx));
    const on = $("#plResults .pl-item.on");
    if (on) on.scrollIntoView({ block: "nearest" });
  }

  /* ================= calls ================= */
  let call = { active: false, kind: null, chat: null, stream: null, t0: 0, tick: null, muted: false, cam: true };
  async function startCall(chatId, kind) {
    const c = DB.chat(chatId);
    if (!c || call.active) return;
    call = Object.assign(call, { active: true, kind, chat: chatId, muted: false, cam: kind === "video", t0: 0 });
    const ov = $("#callOverlay");
    ov.hidden = false; ov.classList.remove("muted");
    const a = DB.chatAvatar(c);
    $("#callName").textContent = DB.chatTitle(c);
    $("#callAvatar").style.background = a.bg || "";
    $("#callAvatar").textContent = a.emoji || "🙂";
    $("#callStatus").textContent = t("ui.callOut");
    $("#selfVideo").hidden = true; $("#selfOff").hidden = false;
    $("#callActions").querySelectorAll("button").forEach(b => b.classList.toggle("off",
      (b.dataset.ca === "cam" && !call.cam)));
    UI.sound.call();
    DB.sync.send("call", { type: "start", chatId, kind, from: DB.state.me });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, video: kind === "video" ? { facingMode: "user" } : false
      });
      call.stream = stream;
      const v = $("#selfVideo");
      v.srcObject = stream; v.hidden = false; $("#selfOff").hidden = true;
      v.play().catch(() => {});
    } catch (e) {
      UI.toast(kind === "video" ? t("to.noCam") : t("to.noMic"), "err");
    }
    setTimeout(() => {
      if (!call.active) return;
      UI.sound.stopRing();
      $("#callStatus").textContent = t("ui.callConnecting");
      setTimeout(() => {
        if (!call.active) return;
        call.t0 = Date.now();
        $("#callStatus").textContent = t("ui.callConnected", { t: "0:00" });
        call.tick = setInterval(() => {
          const s = Math.floor((Date.now() - call.t0) / 1000);
          $("#callStatus").textContent = t("ui.callConnected", { t: UI.fmtDur(s) });
        }, 1000);
      }, 1300);
    }, 2200);
  }
  function endCall() {
    if (!call.active) return;
    call.active = false;
    UI.sound.stopRing();
    clearInterval(call.tick);
    if (call.stream) { call.stream.getTracks().forEach(tr => tr.stop()); call.stream = null; }
    DB.sync.send("call", { type: "end", chatId: call.chat, from: DB.state.me });
    const dur = call.t0 ? UI.fmtDur(Math.floor((Date.now() - call.t0) / 1000)) : "0:00";
    $("#callOverlay").hidden = true;
    call.chat = null;
    UI.toast(t("to.callEnded") + " · " + dur, "ok");
  }

  /* ================= misc actions ================= */
  function cycleTheme() {
    const next = UI.toggleQuickDark();
    UI.toast(t("to.theme") + ": " + next, "ok");
    if ($("#m-settings") && !$("#m-settings").hidden) renderSetPane();
  }
  function toggleLang() { setLang(I18N.lang === "ar" ? "en" : "ar"); }
  function setLang(l) {
    I18N.setLang(l);
    applyStaticLocale();
    UI.toast(t("to.lang"), "ok");
    if (started) {
      renderFolders(); renderStories(); renderChatList(); renderStats();
      if (CHAT.current) CHAT.open(CHAT.current);
      if (!$("#drawer").hidden) openDrawer(CHAT.current);
      if (!$("#m-settings").hidden) renderSetPane();
      if (!$("#palette").hidden) renderPalette();
      document.title = CHAT.current && DB.chat(CHAT.current)
        ? DB.chatTitle(DB.chat(CHAT.current)) + " · " + (I18N.lang === "ar" ? "وصل" : "Wasl")
        : "وصل | Wasl";
    }
  }
  function toggleMute() {
    const c = DB.chat(CHAT.current); if (!c) return;
    c.muted = !c.muted; DB.save(); renderChatList();
    UI.toast(c.muted ? t("to.muteOn") : t("to.muteOff"), "ok");
  }
  function clearCurrent() {
    const c = DB.chat(CHAT.current); if (!c) return;
    UI.confirm(t("cf.clearChat")).then(ok => {
      if (ok) { DB.clearChat(c.id); CHAT.render(); renderChatList(); UI.toast(t("to.deleted"), "ok"); }
    });
  }
  function replyLast() {
    const list = DB.msgs(CHAT.current || "");
    if (list.length) CHAT.setReply(list[list.length - 1]);
  }
  function lockNow() {
    if (!DB.state.settings.lock) { UI.toast(t("s.lockSub"), "err"); return; }
    AUTH.lock.show();
  }
  async function stepChat(dir) {
    const rows = visibleChats();
    if (!rows.length) return;
    let i = rows.findIndex(c => c.id === CHAT.current);
    i = Math.max(0, Math.min(rows.length - 1, (i < 0 ? 0 : i) + dir));
    openChat(rows[i].id);
    const el = document.querySelector('.chat-item[data-c="' + rows[i].id + '"]');
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function escapeTop() {
    if (!$("#ctxmenu").hidden) return CHAT.closeMenu();
    if (!$("#storyView").hidden) return closeStory();
    if (!$("#viewer").hidden) return UI.closeModal($("#viewer"));
    if (!$("#palette").hidden) return closePalette();
    if ($$(".modal:not([hidden])").length) return UI.closeModal();
    if (!$("#emojiPanel").hidden) { $("#emojiPanel").hidden = true; return; }
    if (!$("#attachMenu").hidden) { $("#attachMenu").hidden = true; return; }
    if (!$("#drawer").hidden) return closeDrawer();
    if (CHAT.current && window.innerWidth <= 760) return closeChat();
    if (CHAT.current && document.activeElement !== $("#msgInput")) return;
  }

  /* ================= global bindings ================= */
  function bindGlobal() {
    /* keep aria-labels in sync with controls rendered after boot */
    try {
      let labelT = null;
      new MutationObserver(() => { clearTimeout(labelT); labelT = setTimeout(autoLabel, 120); })
        .observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* no observer: static labels still apply */ }

    /* sidebar */
    $("#btnNewChat").addEventListener("click", openNewChat);
    $("#esNew").addEventListener("click", openNewChat);
    $("#esKeys").addEventListener("click", () => UI.openModal("m-shortcuts"));
    $("#sbSearch").addEventListener("input", e => { searchQ = e.target.value.trim(); renderChatList(); });
    $("#sbSearch").addEventListener("keydown", e => { if (e.key === "Escape") { e.target.value = ""; searchQ = ""; renderChatList(); e.target.blur(); } });
    $("#sbSearchClr").addEventListener("click", () => { $("#sbSearch").value = ""; searchQ = ""; renderChatList(); $("#sbSearch").focus(); });

    $("#btnMenu").addEventListener("click", e => {
      const r = e.currentTarget.getBoundingClientRect();
      CHAT.menu([
        { id: "profile", label: t("profile.title"), icon: "user", run: () => openProfile(DB.state.me) },
        { id: "settings", label: t("settings.title"), icon: "gear", run: openSettings },
        { sep: true },
        { id: "group", label: t("new.group"), icon: "users", run: () => openCreate("group") },
        { id: "channel", label: t("new.channel"), icon: "mega", run: () => openCreate("channel") },
        { id: "folder", label: t("ui.addTab"), icon: "folder", run: openFolderModal },
        { id: "story", label: t("story.add"), icon: "image", run: addStory },
        { sep: true },
        { id: "keys", label: t("keys.title"), icon: "keyboard", run: () => UI.openModal("m-shortcuts") },
        { id: "backup", label: t("s.export"), icon: "download", run: () => { DB.exportBackup(); UI.toast(t("to.backup"), "ok"); } },
        { sep: true },
        { id: "out", label: t("profile.logout"), icon: "logout", danger: true, run: async () => {
          if (await UI.confirm(t("cf.logout"), { ok: t("profile.logout"), danger: false })) AUTH.logout(); } }
      ], r.left, r.bottom + 8);
    });

    $("#dockSettings").addEventListener("click", () => openSettings());
    $("#dockFolders").addEventListener("click", openFolderModal);
    $("#dockLock").addEventListener("click", lockNow);
    $("#dockTheme").addEventListener("click", cycleTheme);
    $("#dockLang").addEventListener("click", toggleLang);
    $("#drClose").addEventListener("click", closeDrawer);
    $("#drMore").addEventListener("click", e => {
      const r = e.currentTarget.getBoundingClientRect();
      const c = DB.chat(CHAT.current);
      CHAT.menu([
        c && { id: "export", label: t("act.export"), icon: "download", run: () => $("#btnChatMenu").click() },
        { id: "profile", label: t("profile.title"), icon: "user", run: () => openProfile(DB.state.me) },
        { id: "settings", label: t("settings.title"), icon: "gear", run: openSettings }
      ].filter(Boolean), r.left - 150, r.bottom + 8);
    });

    /* chat list interactions */
    const list = $("#chatList");
    list.addEventListener("click", e => {
      const item = e.target.closest("[data-c]"); if (!item) return;
      openChat(item.dataset.c);
    });
    list.addEventListener("contextmenu", e => {
      const item = e.target.closest("[data-c]"); if (!item) return;
      e.preventDefault();
      const c = DB.chat(item.dataset.c);
      if (c) CHAT.rowMenu(c, e.clientX, e.clientY);
    });
    list.addEventListener("keydown", e => {
      if (e.key === "Enter") { const item = e.target.closest("[data-c]"); if (item) openChat(item.dataset.c); }
    });

    /* new chat modal */
    $("#ncSearch").addEventListener("input", renderNewChatList);
    $("#ncList").addEventListener("click", e => {
      const row = e.target.closest("[data-u]"); if (!row) return;
      const id = row.dataset.u;
      UI.closeModal($("#m-newchat"));
      const chat = DB.openDM(id);
      openChat(chat.id);
      if (DB.user(id) && DB.user(id).bot) setTimeout(() => $("#msgInput").focus(), 200);
    });
    $("#qGroup").addEventListener("click", () => { UI.closeModal($("#m-newchat")); openCreate("group"); });
    $("#qChannel").addEventListener("click", () => { UI.closeModal($("#m-newchat")); openCreate("channel"); });
    $("#qBot").addEventListener("click", () => {
      UI.closeModal($("#m-newchat"));
      const bot = DB.personas().find(u => u.bot);
      if (bot) { const chat = DB.openDM(bot.id); openChat(chat.id); }
    });

    /* create modal */
    $("#createAva").addEventListener("click", () => {
      const r = $("#createAva").getBoundingClientRect();
      CHAT.menu(EMOJI_PICK.map(e => ({ id: e, label: e, icon: "star", run: () => { createEmoji = e; renderCreateAva(); } })),
        r.left, r.bottom + 6);
    });
    $("#pickList").addEventListener("click", e => {
      const row = e.target.closest("[data-u]"); if (!row) return;
      const id = row.dataset.u;
      createPicked.has(id) ? createPicked.delete(id) : createPicked.add(id);
      renderPickList();
    });
    $("#createGo").addEventListener("click", () => {
      const name = $("#createName").value.trim();
      if (!name) { UI.toast(t("to.needName"), "err"); return; }
      if (!createPicked.size) { UI.toast(t("to.needMembers"), "err"); return; }
      const isGroup = createMode === "group";
      const chat = DB.createChat({
        type: createMode, title: name, titleEn: name, emoji: createEmoji,
        bg: "linear-gradient(135deg,var(--accent),var(--accent-2))",
        members: [DB.state.me].concat(Array.from(createPicked)),
        admins: [DB.state.me],
        about: $("#createAbout").value.trim() || "",
        subscribers: isGroup ? 0 : 1,
        folder: isGroup ? "groups" : "channels"
      });
      DB.addMsg(chat.id, { from: DB.state.me, type: "service",
        text: (I18N.lang === "ar" ? "أنشأ " : "created ") + "**" + name + "**",
        ts: Date.now() }, { route: false });
      UI.closeModal($("#m-create"));
      UI.toast(t("to.groupCreated", { name }), "ok");
      openChat(chat.id); renderFolders(); renderChatList();
    });

    /* folder modal */
    $("#folderEmoji").addEventListener("click", e => {
      const b = e.target.closest("[data-e]"); if (!b) return;
      folderEmoji = b.dataset.e;
      $$("#folderEmoji button").forEach(x => x.classList.toggle("on", x === b));
    });
    $("#folderChats").addEventListener("click", e => {
      const row = e.target.closest("[data-c]"); if (!row) return;
      row.classList.toggle("on");
    });
    $("#folderGo").addEventListener("click", () => {
      const name = $("#folderName").value.trim();
      if (!name) { UI.toast(t("folder.needName"), "err"); return; }
      const picked = $$("#folderChats .pick-row.on").map(r => r.dataset.c);
      DB.folders().push({ id: DB.uid("f"), name, nameEn: name, emoji: folderEmoji, chats: picked });
      DB.save(); renderFolders(); UI.closeModal($("#m-folder"));
      UI.toast(t("to.groupCreated", { name }), "ok");
    });

    /* settings navigation */
    $("#setNav").addEventListener("click", e => {
      const b = e.target.closest("button[data-s]"); if (!b) return;
      setSection = b.dataset.s;
      $("#setNav").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      renderSetPane();
      UI.sound.click();
    });

    /* shortcuts modal */
    $("#keysGrid").innerHTML = SHORTCUTS.map(s =>
      '<div class="key-row"><span>' + t(s.label) + "</span>" +
      s.keys.map(k => "<kbd>" + k + "</kbd>").join("") + "</div>").join("");

    /* palette */
    $("#plInput").addEventListener("input", renderPalette);
    $("#plInput").addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); plIdx = Math.min(plIdx + 1, plItems.length - 1); markPl(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); plIdx = Math.max(plIdx - 1, 0); markPl(); }
      else if (e.key === "Enter") { e.preventDefault(); const it = plItems[plIdx]; if (it && it.run) it.run(); }
    });
    $("#plResults").addEventListener("click", e => {
      const el = e.target.closest("[data-i]"); if (!el) return;
      const it = plItems[+el.dataset.i];
      if (it && it.run) it.run();
    });
    $("#palette").addEventListener("click", e => { if (e.target.id === "palette") closePalette(); });

    /* story */
    $("#svClose").addEventListener("click", closeStory);
    function storySend(text) {
      if (!text || !storyAuthor) return;
      const chat = DB.openDM(storyAuthor);
      DB.addMsg(chat.id, { type: "text", text, from: DB.state.me });
      renderChatList();
      if (CHAT.current === chat.id) CHAT.render();
      UI.toast(t("story.replySent"), "ok");
    }
    $("#svSend").addEventListener("click", () => {
      const v = $("#svReply").value.trim();
      if (!v) return;
      $("#svReply").value = "";
      storySend(v);
      closeStory();
    });
    $("#svReply").addEventListener("keydown", e => { if (e.key === "Enter") $("#svSend").click(); });
    $("#svReact").addEventListener("click", e => {
      const b = e.currentTarget;
      const on = b.classList.toggle("on");
      if (on) storySend(I18N.lang === "ar" ? "أعجبتني قصتك ❤️" : "Loved your story ❤️");
    });
    $("#svMute").addEventListener("click", e => e.currentTarget.classList.toggle("on"));

    /* call */
    $("#callActions").addEventListener("click", e => {
      const b = e.target.closest("[data-ca]"); if (!b) return;
      const a = b.dataset.ca;
      if (a === "end") return endCall();
      UI.sound.click();
      if (a === "mute") {
        call.muted = !call.muted;
        if (call.stream) call.stream.getAudioTracks().forEach(tr => tr.enabled = !call.muted);
        b.classList.toggle("off", call.muted);
        $("#callOverlay").classList.toggle("muted", call.muted);
      } else if (a === "cam") {
        call.cam = !call.cam;
        if (call.stream && call.kind === "video") call.stream.getVideoTracks().forEach(tr => tr.enabled = call.cam);
        b.classList.toggle("off", !call.cam);
        $("#selfVideo").hidden = !call.cam; $("#selfOff").hidden = call.cam;
      } else if (a === "screen") {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          navigator.mediaDevices.getDisplayMedia({ video: true }).then(s => {
            const v = $("#remoteVideo");
            v.srcObject = s; v.hidden = false; v.style.objectFit = "cover";
            s.getVideoTracks()[0].onended = () => { v.hidden = true; v.srcObject = null; };
            UI.toast(I18N.lang === "ar" ? "تمت مشاركة الشاشة" : "Screen sharing started", "ok");
          }).catch(() => {});
        }
      }
    });

    /* backup */
    $("#fileBackup").addEventListener("change", e => {
      const f = e.target.files[0]; e.target.value = "";
      if (!f) return;
      DB.importBackup(f, ok => UI.toast(ok ? t("to.import") : t("to.importFail"), ok ? "ok" : "err"));
    });

    /* keyboard */
    document.addEventListener("keydown", e => {
      const mod = e.ctrlKey || e.metaKey;
      const inField = /input|textarea/i.test((e.target.tagName || "")) || e.target.isContentEditable;
      if (mod && !e.shiftKey && (e.key === "k" || e.key === "K")) { e.preventDefault(); openPalette(); return; }
      if (mod && !e.shiftKey && (e.key === "e" || e.key === "E")) { e.preventDefault(); openNewChat(); return; }
      if (mod && !e.shiftKey && e.key === ",") { e.preventDefault(); openSettings(); return; }
      if (mod && e.shiftKey && (e.key === "L" || e.key === "l")) { e.preventDefault(); lockNow(); return; }
      if (mod && e.shiftKey && (e.key === "F" || e.key === "f")) { e.preventDefault(); if (CHAT.current) $("#btnChatSearch").click(); return; }
      if (mod && e.shiftKey && (e.key === "M" || e.key === "m")) { e.preventDefault(); toggleMute(); return; }
      if (mod && e.shiftKey && (e.key === "R" || e.key === "r")) { e.preventDefault(); replyLast(); return; }
      if (mod && e.shiftKey && (e.key === "O" || e.key === "o")) { e.preventDefault(); if (CHAT.current) $("#btnAttach").click(); return; }
      if (e.altKey && e.key === "t") { e.preventDefault(); cycleTheme(); return; }
      if (e.altKey && e.key === "g") { e.preventDefault(); toggleLang(); return; }
      if (e.altKey && e.key === "ArrowDown") { e.preventDefault(); stepChat(1); return; }
      if (e.altKey && e.key === "ArrowUp") { e.preventDefault(); stepChat(-1); return; }
      if (e.key === "Escape") { if (!$("#palette").hidden) { closePalette(); e.preventDefault(); return; } escapeTop(); }
      if (!inField && !mod && !e.altKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        if (CHAT.current) { e.preventDefault(); stepChat(e.key === "ArrowDown" ? 1 : -1); }
      }
      if (!inField && !mod && !e.altKey && e.key === "/") { e.preventDefault(); $("#sbSearch").focus(); }
      if (!inField && !mod && !e.altKey && e.key.toLowerCase() === "n" && !CHAT.current) { e.preventDefault(); openNewChat(); }
    });

    /* responsive: keep layout sane on resize */
    let rz;
    window.addEventListener("resize", () => {
      clearTimeout(rz);
      rz = setTimeout(() => {
        if (window.innerWidth > 760) { $("#sidebar").classList.remove("l-hidden"); $("#main").classList.remove("l-hidden"); }
        else if (!CHAT.current) { $("#sidebar").classList.remove("l-hidden"); $("#main").classList.add("l-hidden"); }
      }, 150);
    });

    /* welcome / ambient: occasional persona says hi in a muted way? no — keep silent */

    /* close modals on backdrop */
    document.addEventListener("click", e => {
      if (e.target.classList && e.target.classList.contains("modal")) UI.closeModal(e.target);
    });
    $$(".modal .md-x").forEach(b => b.addEventListener("click", () => UI.closeModal(b.closest(".modal"))));
  }

  /* ================= public ================= */
  window.APP = {
    start, applyStaticLocale, renderChatList, renderFolders, renderStories, openChat, closeChat,
    openDrawer, closeDrawer, openSettings, openProfile, cycleTheme, toggleLang, setLang,
    startCall, endCall, openPalette, SHORTCUTS, applyWallpaper, addStory, openNewChat
  };
})();
