/* ============================================================
   وصل | Wasl — chat.js
   conversation rendering · composer · message actions · media
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => UI.esc(s);
  const me = () => DB.state.me;

  let current = null;         /* chatId */
  let replyTo = null;         /* message being replied to */
  let editing = null;         /* message being edited */
  let mediaGallery = [];      /* ids of media messages for the viewer */
  let galleryIndex = 0;
  let searchMatches = [], searchIdx = -1;
  let rec = null;             /* voice recorder */
  let recTimer = null;
  let typingUser = null, typingTimer = null;
  let bound = false;

  /* ================= helpers ================= */
  function statusLine(chat) {
    if (!chat) return "";
    if (chat.type === "saved") return t("st.saved");
    if (chat.type === "bot") return t("st.botInfo");
    if (chat.type === "channel") return t("st.nSubs", { n: (chat.subscribers || 0).toLocaleString("en-US") });
    if (chat.type === "group") return t("st.nMembers", { n: (chat.members || []).length });
    const u = DB.user(chat.user) || {};
    if (DB.sync.typingIn(chat.id)) return t("st.typing");
    if (DB.isOnline(u.id) || u.online === true) return t("st.online");
    if (u.lastSeen) return t("st.lastSeen", { t: UI.rel(u.lastSeen) });
    return t("st.lastSeenRecently");
  }

  function scrollBottom(force) {
    const box = $("#msgs");
    if (!box) return;
    const near = box.scrollHeight - box.scrollTop - box.clientHeight < 260;
    if (force || near) box.scrollTop = box.scrollHeight;
  }

  function msgById(id) { return DB.msgs(current).find(m => m.id === id) || null; }

  function canAdmin(chat) {
    if (!chat) return false;
    if (chat.type === "channel") return true;
    if (chat.type === "group") return (chat.admins || []).includes(me());
    if (chat.type === "saved") return true;
    return true;
  }

  /* ================= menu primitive (shared with app.js) ================= */
  function menu(items, x, y) {
    const el = $("#ctxmenu");
    el.innerHTML = items.filter(Boolean).map(it => {
      if (it.sep) return '<div class="ctx-sep"></div>';
      if (it.header) return '<div class="ctx-hdr">' + esc(it.header) + "</div>";
      return '<button data-a="' + it.id + '" class="' + (it.danger ? "danger" : "") + '">' +
        UI.icon(it.icon || "check") + "<span>" + esc(it.label) + "</span></button>";
    }).join("");
    el.hidden = false;
    el.style.visibility = "hidden";
    el.style.left = "0px"; el.style.top = "0px";
    const r = el.getBoundingClientRect();
    let px = x, py = y;
    px = Math.min(px, window.innerWidth - r.width - 8);
    py = Math.min(py, window.innerHeight - r.height - 8);
    el.style.left = Math.max(8, px) + "px";
    el.style.top = Math.max(8, py) + "px";
    el.style.visibility = "visible";
    el._items = items;
    el._openAt = Date.now();
    clearTimeout(el._close);
  }
  function closeMenu() { const el = $("#ctxmenu"); el.hidden = true; el._items = null; }

  function reactPop(anchor, msg) {
    const el = $("#reactPop");
    el.innerHTML = UI.QUICK_RX.map(e => '<button data-r="' + e + '">' + e + "</button>").join("");
    el.hidden = false;
    el.style.visibility = "hidden";
    const r = el.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    let px = a.left + a.width / 2 - r.width / 2;
    let py = a.top - r.height - 8;
    if (py < 6) py = a.bottom + 8;
    el.style.left = Math.max(8, Math.min(px, window.innerWidth - r.width - 8)) + "px";
    el.style.top = Math.max(8, Math.min(py, window.innerHeight - r.height - 8)) + "px";
    el.style.visibility = "visible";
    el._msg = msg;
  }
  function closeReact() { $("#reactPop").hidden = true; $("#reactPop")._msg = null; }

  /* ================= bubble builders ================= */
  function meta(msg, chat) {
    const isOut = msg.from === me();
    let right = "";
    if (msg.edited) right += '<span class="edited">' + (I18N.lang === "ar" ? "تعديل" : "edited") + "</span>";
    if (chat.type === "channel") {
      right += '<span class="views">' + UI.icon("eye") + (msg.views || 1).toLocaleString("en-US") + "</span>";
    } else if (isOut && DB.state.settings.receipts) {
      if (msg.type === "poll" || msg.type === "task") right += "";
      right += UI.icon(msg.read ? "check2" : "check2", msg.read ? "ok" : "");
    }
    if (msg.type === "voice" && msg.unread) right = '<span class="v-unread"></span>' + right;
    right += '<span class="m-time">' + UI.clock(msg.ts) + "</span>";
    return '<div class="m-meta">' + right + "</div>";
  }

  function bubbleInner(msg, chat) {
    const isOut = msg.from === me();
    let html = "";

    /* forwarded */
    if (msg.fwd) html += '<div class="fwd-head">' + UI.icon("forward") + esc(msg.fwd) + "</div>";

    /* reply quote */
    if (msg.replyTo) {
      const src = msgById(msg.replyTo.id) || msg.replyTo;
      const who = src && src.from ? DB.memberName(src.from) : (msg.replyTo.name || "");
      const txt = src ? (src.type === "text" ? String(src.text || "") :
        src.type === "image" ? t("pv.photo") : src.type === "voice" ? t("pv.voice") :
        src.type === "file" ? (src.name || t("pv.file")) : src.type === "poll" ? t("pv.poll") :
        src.type === "task" ? t("pv.task") : t("pv.sticker")) : "";
      html += '<div class="reply-q" data-jump="' + esc(msg.replyTo.id) + '">' +
        UI.avatarHTML(src && src.from ? src.from : "x", { size: "xs", noOnline: true }).replace("<span class=\"avatar", "<span class=\"avatar rq-ava") +
        "<div><b>" + esc(who) + "</b><small>" + esc(String(txt).slice(0, 90)) + "</small></div></div>";
    }

    /* body by type */
    if (msg.type === "sticker") {
      html += '<div class="sticker-lg">' + esc(msg.text) + "</div>";
      return html;
    }
    if (msg.type === "image" && (msg.src || msg.mediaId)) {
      const url = msg.src || DB.media.get(msg.mediaId);
      html += '<div class="m-media" data-view="' + esc(msg.id) + '">' +
        '<img src="' + esc(url) + '" alt="" loading="lazy">' +
        '<div class="play-badge" hidden></div></div>';
      if (msg.caption) html += '<div class="m-caption">' + UI.md(msg.caption) + "</div>";
    } else if (msg.type === "file") {
      const url = msg.mediaId ? DB.media.get(msg.mediaId) : null;
      const ext = (msg.name || "").split(".").pop().toUpperCase().slice(0, 4) || "FILE";
      html += '<div class="m-media" data-file="' + esc(msg.id) + '"><div class="file-card">' +
        '<div class="file-ico">' + UI.icon("file") + "</div>" +
        "<div><b>" + esc(msg.name || "file") + "</b><small>" + esc(ext) + " · " + UI.fmtSize(msg.size || 0) +
        (url ? "" : " · " + (I18N.lang === "ar" ? "بيانات غير محفوظة" : "meta only")) + "</small></div>" +
        "</div></div>";
    } else if (msg.type === "voice") {
      const url = msg.mediaId ? DB.media.get(msg.mediaId) : null;
      const bars = UI.wave(msg.id, 30);
      html += '<div class="voice" data-voice="' + esc(msg.id) + '" data-url="' + esc(url || "") + '">' +
        '<button class="v-play">' + UI.icon("play") + "</button>" +
        '<div class="v-wave">' + bars.map(h => '<i style="height:' + Math.round(h / 3) + 'px"></i>').join("") + "</div>" +
        '<div class="v-meta"><span class="v-dur">' + UI.fmtDur(msg.dur || 0) + "</span>" +
        (isOut ? UI.icon("check2", "ok") : "") + "</div></div>";
    } else if (msg.type === "poll" && msg.poll) {
      const p = msg.poll;
      const total = p.opts.reduce((s, o) => s + (o.v || 0), 0);
      html += '<div class="poll" data-poll="' + esc(msg.id) + '"><div class="p-q">' + esc(p.q) + "</div>";
      p.opts.forEach((o, i) => {
        const pct = total ? Math.round((o.v || 0) / total * 100) : 0;
        const voted = (o.mine ? " voted" : "") + (p.multi ? " multi" : "");
        html += '<div class="poll-opt' + voted + '" data-opt="' + i + '">' +
          '<div class="p-bar" style="width:' + pct + "%;transform:translateX(" + (document.documentElement.dir === "rtl" ? "100%" : "-100%") + ')"></div>' +
          '<span class="p-dot"></span><span>' + esc(o.t) + "</span><b>" + pct + "%</b></div>";
      });
      html += '<div class="poll-foot"><span>' + t("poll.total", { n: total }) + "</span></div></div>";
    } else if (msg.type === "task" && msg.task) {
      const k = msg.task.items.filter(i => i.done).length;
      html += '<div class="task" data-task="' + esc(msg.id) + '"><div class="t-title">' + UI.icon("list") +
        esc(msg.task.title) + "</div>";
      msg.task.items.forEach((it, i) => {
        html += '<div class="task-item' + (it.done ? " done" : "") + '" data-item="' + i + '">' +
          '<span class="t-box"></span><span>' + esc(it.t) + "</span></div>";
      });
      html += '<div class="t-prog"><i style="width:' + (msg.task.items.length ? k / msg.task.items.length * 100 : 0) + '%"></i></div>' +
        '<div class="poll-foot"><span>' + t("task.done", { a: k, b: msg.task.items.length }) + "</span></div></div>";
    } else {
      const text = msg.type === "text" ? (msg.showTr && msg.tr ? msg.tr : msg.text) : (msg.caption || "");
      html += '<div class="m-text">' + (text ? UI.md(text) : "") + "</div>";
      if (msg.showTr && msg.tr) html += '<div class="edited">🌐 ' + esc(I18N.lang === "ar" ? "الترجمة" : "Translation") + "</div>";
    }

    /* reactions */
    if (msg.reactions && Object.keys(msg.reactions).length) {
      html += '<div class="reactions">' + Object.keys(msg.reactions).map(e => {
        const mine = msg.reactions[e].includes(me());
        return '<button class="rx' + (mine ? " mine" : "") + '" data-rx="' + e + '">' + e +
          "<b>" + msg.reactions[e].length + "</b></button>";
      }).join("") + "</div>";
    }
    return html;
  }

  function renderMessage(msg, prev, next, chat) {
    const isOut = msg.from === me();
    const sameAsPrev = prev && prev.from === msg.from && (msg.ts - prev.ts) < 5 * 60000 && prev.type !== "service";
    const inGroup = chat.type === "group" || chat.type === "channel";
    const showAva = !isOut && inGroup && chat.type !== "channel";

    if (msg.type === "service") {
      return '<div class="svc ' + (msg.warn ? "warn" : "") + '" data-id="' + msg.id + '">' + UI.md(msg.text) + "</div>";
    }
    let slot = "";
    if (!isOut && showAva) {
      slot = '<div class="avatar-slot">' + (sameAsPrev ? "" : UI.avatarHTML(msg.from, { noOnline: true })) + "</div>";
    }
    const cls = ["msg-row", isOut ? "out" : "in"];
    if (sameAsPrev) cls.push("grouped");
    if (msg.type === "sticker") cls.push("sticker");
    if (msg.sd) cls.push("sd");

    return '<div class="' + cls.join(" ") + '" data-id="' + msg.id + '" data-from="' + esc(msg.from) + '">' +
      slot +
      '<div class="bubble">' + bubbleInner(msg, chat) + meta(msg, chat) + "</div>" +
      '<div class="msg-actions">' +
      '<button data-a="reply">' + UI.icon("reply") + "</button>" +
      '<button data-a="react">' + UI.icon("heart") + "</button>" +
      '<button data-a="more">' + UI.icon("more") + "</button>" +
      "</div></div>";
  }

  function render() {
    const box = $("#msgs");
    if (!current) return;
    const chat = DB.chat(current);
    if (!chat) { APP.closeChat(); return; }
    const list = DB.msgs(current);
    if (!list.length) {
      box.innerHTML = '<div class="svc" style="margin:auto">' +
        (chat.type === "saved" ? (I18N.lang === "ar" ? "احفظ هنا ملاحظاتك، روابطك، ومهامك ✨" : "Keep your notes, links and tasks here ✨")
          : (I18N.lang === "ar" ? "لا رسائل بعد — كن أول من يبدأ 👋" : "No messages yet — be the first to say hi 👋")) + "</div>";
      return;
    }
    let html = "", lastDay = "";
    list.forEach((msg, i) => {
      const day = new Date(msg.ts).toDateString();
      if (day !== lastDay) { html += '<div class="date-sep"><span>' + UI.dayKey(msg.ts) + "</span></div>"; lastDay = day; }
      html += renderMessage(msg, list[i - 1], list[i + 1], chat);
    });
    box.innerHTML = html;
    box.classList.remove("reveal"); void box.offsetWidth; box.classList.add("reveal");
    applySearchHighlights();
    scrollBottom(true);
    startDoomTimers();
  }

  /* self-destructing messages */
  const doomedTimers = {};
  function startDoomTimers() {
    DB.msgs(current).forEach(msg => {
      if (!msg.sd || doomedTimers[msg.id]) return;
      const row = document.querySelector('.msg-row[data-id="' + msg.id + '"]');
      if (!row) return;
      doomedTimers[msg.id] = setTimeout(() => {
        row.classList.add("doomed");
        setTimeout(() => {
          delete doomedTimers[msg.id];
          if (current) DB.delMsg(current, msg.id);
        }, 700);
      }, msg.sd * 1000);
    });
  }
  function clearDoomTimers() { Object.values(doomedTimers).forEach(clearTimeout); Object.keys(doomedTimers).forEach(k => delete doomedTimers[k]); }

  /* ================= header ================= */
  function renderHeader() {
    const chat = DB.chat(current);
    if (!chat) return;
    $("#chatAvatar").outerHTML = UI.avatarHTML(chat).replace('class="avatar"', 'class="avatar" id="chatAvatar"');
    $("#chatTitle").textContent = DB.chatTitle(chat);
    const st = $("#chatStatus");
    st.textContent = statusLine(chat);
    st.classList.toggle("live", !!(DB.isOnline(chat.user) || DB.sync.typingIn(chat.id)));
    /* pinned bar */
    const pb = $("#pinnedBar");
    if (chat.pinnedMsg) {
      const pm = msgById(chat.pinnedMsg);
      if (pm) {
        pb.hidden = false;
        $("#pinnedTitle").textContent = DB.memberName(pm.from);
        $("#pinnedText").textContent = (pm.type === "text" ? pm.text : pm.caption || t("pv.photo") || "").slice(0, 110);
      } else pb.hidden = true;
    } else pb.hidden = true;
    document.title = DB.chatTitle(chat) + " · " + (I18N.lang === "ar" ? "وصل" : "Wasl");
  }

  /* ================= open / close ================= */
  function open(chatId) {
    const chat = DB.chat(chatId);
    if (!chat) return;
    clearDoomTimers();
    current = chatId;
    DB.state.settings.activeChat = chatId;
    DB.ws().active = chatId;
    chat.unread = 0;
    DB.save();
    cancelReply(); cancelEdit();
    closeSearch();
    $("#inChatSearch").hidden = true;
    /* restore draft */
    const d = DB.drafts()[chatId];
    $("#msgInput").value = d || "";
    autoGrow(); updateSendState();
    renderHeader(); render();
    APP.renderChatList();
    if (window.innerWidth <= 760) { $("#sidebar").classList.add("l-hidden"); $("#main").classList.remove("l-hidden"); }
    /* read receipts for their messages */
    DB.msgs(chatId).forEach(m => { if (m.from !== me() && m.unread) DB.patchMsg(chatId, m.id, { unread: false }); });
    setTimeout(() => $("#msgInput").focus(), 60);
  }

  function close() {
    clearDoomTimers();
    current = null;
    DB.state.settings.activeChat = null;
    DB.save();
    cancelReply(); cancelEdit();
    $("#conversation").hidden = true;
    $("#emptyState").hidden = false;
    document.title = "وصل | Wasl";
  }

  /* ================= sending ================= */
  function updateSendState() {
    const has = $("#msgInput").value.trim().length > 0;
    $("#composer").classList.toggle("has-text", has);
  }
  function autoGrow() {
    const el = $("#msgInput");
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 132) + "px";
  }
  function saveDraft() {
    if (!current) return;
    const v = $("#msgInput").value;
    if (v.trim()) DB.drafts()[current] = v; else delete DB.drafts()[current];
    DB.save();
  }

  function push(msg) {
    const chat = DB.chat(current);
    if (!chat) return null;
    msg.from = me();
    msg.id = DB.uid("m");
    msg.ts = Date.now();
    msg.read = false;
    const out = DB.addMsg(current, msg);
    UI.sound.send();
    render(); scrollBottom(true);
    APP.renderChatList();
    /* delivered → read ticks */
    setTimeout(() => {
      const m = DB.msgs(current).find(x => x.id === out.id);
      if (m && !m.read) { DB.patchMsg(current, out.id, { read: true }); if (current === chat.id) render(); }
    }, 900);
    if (msg.type === "text") scheduleReply(chat, out);
    return out;
  }

  function sendText() {
    const el = $("#msgInput");
    const text = el.value.trim();
    if (!text || !current) return;
    if (editing) {
      const id = editing;
      cancelEdit();
      el.value = ""; autoGrow(); updateSendState(); saveDraft();
      DB.patchMsg(current, id, { text, edited: true, tr: undefined });
      UI.toast(t("to.edited"), "ok");
      render();
      return;
    }
    const msg = { type: "text", text };
    if (replyTo) { msg.replyTo = { id: replyTo.id, from: replyTo.from }; cancelReply(); }
    el.value = ""; autoGrow(); updateSendState(); saveDraft();
    push(msg);
  }

  /* ---------- auto replies ---------- */
  const pending = {};
  function scheduleReply(chat, sentMsg) {
    if (!BOT.shouldReply(chat, sentMsg.text || "")) return;
    BOT.respond(chat, sentMsg).then(r => {
      if (!r || !DB.chat(chat.id)) return;
      clearTimeout(pending[chat.id]);
      pending[chat.id] = setTimeout(() => {
        const text = typeof r.text === "string" ? r.text : String(r.text);
        const isOpen = current === chat.id;
        if (isOpen) showTyping(r.user, 600);
        setTimeout(() => {
          hideTyping();
          if (!DB.chat(chat.id)) return;
          const m = DB.addMsg(chat.id, { from: r.user, type: "text", text });
          const my = DB.msgs(chat.id).find(x => x.id === sentMsg.id);
          if (my && !my.read) DB.patchMsg(chat.id, sentMsg.id, { read: true });
          if (current === chat.id) {
            render(); scrollBottom();
            DB.patchMsg(chat.id, m.id, { read: true });
            if (document.hidden || !document.hasFocus()) UI.sound.msg();
            renderHeader();
          } else {
            DB.chat(chat.id).unread = (DB.chat(chat.id).unread || 0) + 1;
            DB.save(); UI.sound.msg();
          }
          APP.renderChatList();
        }, Math.min(900, r.delay || 700));
      }, Math.min(r.delay || 800, 2600));
    }).catch(() => {});
  }

  function showTyping(userId, ms) {
    const bar = $("#typingBar");
    const u = DB.user(userId);
    typingUser = userId;
    $("#typingText").textContent = (u ? DB.memberName(userId) : "") + " " + t("st.typing");
    bar.hidden = false;
    clearTimeout(typingTimer);
    if (ms) typingTimer = setTimeout(hideTyping, ms);
    const st = $("#chatStatus"); if (st && current) st.textContent = t("st.typing");
  }
  function hideTyping() {
    typingUser = null;
    $("#typingBar").hidden = true;
    const st = $("#chatStatus");
    if (st && current) st.textContent = statusLine(DB.chat(current));
  }

  /* ================= reply / edit ================= */
  function setReply(msg) {
    replyTo = msg;
    $("#replyStrip").hidden = false;
    $("#rsName").textContent = DB.memberName(msg.from);
    $("#rsText").textContent = msg.type === "text" ? String(msg.text).slice(0, 120)
      : msg.type === "image" ? t("pv.photo") : msg.type === "file" ? msg.name : msg.type === "voice" ? t("pv.voice")
      : msg.type === "poll" ? t("pv.poll") : msg.type === "task" ? t("pv.task") : t("pv.sticker");
    $("#msgInput").focus();
  }
  function cancelReply() { replyTo = null; $("#replyStrip").hidden = true; }
  function setEdit(msg) {
    editing = msg.id;
    $("#editStrip").hidden = false;
    $("#esText").textContent = String(msg.text || "").slice(0, 120);
    $("#msgInput").value = msg.text || "";
    autoGrow(); updateSendState();
    $("#msgInput").focus();
  }
  function cancelEdit() { editing = null; $("#editStrip").hidden = true; }

  /* ================= message actions ================= */
  function msgMenu(msg, x, y) {
    const chat = DB.chat(current);
    const isOut = msg.from === me();
    const items = [];
    items.push({ id: "reply", label: t("act.reply"), icon: "reply", run: () => setReply(msg) });
    if (msg.type === "text") items.push({ id: "copy", label: t("act.copy"), icon: "copy", run: () => UI.copy(msg.text) });
    if (chat.type !== "saved" || true) items.push({ id: "fwd", label: t("act.forward"), icon: "forward", run: () => openForward(msg) });
    if (msg.tr) items.push({ id: "tr", label: msg.showTr ? (I18N.lang === "ar" ? "إظهار الأصل" : "Show original") : t("act.translate"),
      icon: "lang", run: () => { DB.patchMsg(current, msg.id, { showTr: !msg.showTr }); render(); } });
    if (isOut && msg.type === "text" && !msg.fwd) items.push({ id: "edit", label: t("act.edit"), icon: "edit", run: () => setEdit(msg) });
    items.push({ id: "sd", label: t("act.sd"), icon: "timer", run: () => {
      const copy = JSON.parse(JSON.stringify(msg));
      delete copy.id; copy.ts = Date.now(); copy.sd = 5; copy.from = me(); copy.read = false;
      DB.addMsg(current, copy); render(); scrollBottom(true); UI.toast(t("to.selfDestruct"));
    } });
    if (canAdmin(chat)) items.push({ id: "pin", label: chat.pinnedMsg === msg.id ? t("act.unpin") : t("act.pin"),
      icon: "pin", run: () => {
        DB.state && (DB.chat(current).pinnedMsg = chat.pinnedMsg === msg.id ? null : msg.id);
        DB.save(); renderHeader();
        UI.toast(chat.pinnedMsg === msg.id ? t("to.pinned") : t("to.unpinned"), "ok");
      } });
    if (current !== "c_saved") items.push({ id: "save", label: t("act.save"), icon: "bookmark", run: () => {
      const saved = DB.chat("c_saved") || DB.createChat({ id: "c_saved", type: "saved", members: [me()] });
      const copy = JSON.parse(JSON.stringify(msg)); delete copy.id; copy.ts = Date.now(); copy.from = me();
      DB.addMsg("c_saved", copy);
      UI.toast(t("to.saved"), "ok"); APP.renderChatList();
    } });
    items.push({ sep: true });
    if (isOut) items.push({ id: "del", label: t("act.delete"), icon: "trash", danger: true, run: async () => {
      if (await UI.confirm(t("cf.deleteMsg"))) { DB.delMsg(current, msg.id); render(); APP.renderChatList(); UI.toast(t("to.deleted"), "ok"); }
    } });
    else items.push({ id: "unread", label: t("act.unread"), icon: "info", run: () => {
      DB.chat(current).unread = 1; DB.save(); APP.renderChatList(); UI.toast(t("ui.unread"), "ok");
    } });
    menu(items, x, y);
  }

  /* ================= forward ================= */
  let fwdMsg = null, fwdPicked = new Set();
  function openForward(msg) {
    fwdMsg = msg; fwdPicked = new Set();
    $("#fwdSearch").value = "";
    $("#fwdGo").disabled = true;
    $("#fwdPrev").textContent = msg.type === "text" ? String(msg.text).slice(0, 60) : t("pv.photo");
    renderForwardList();
    UI.openModal("m-forward");
  }
  function renderForwardList() {
    const q = ($("#fwdSearch").value || "").toLowerCase();
    const rows = DB.chats().filter(c => c.id !== current)
      .filter(c => !q || DB.chatTitle(c).toLowerCase().includes(q));
    $("#fwdList").innerHTML = rows.map(c => {
      const a = DB.chatAvatar(c);
      return '<div class="pick-row' + (fwdPicked.has(c.id) ? " on" : "") + '" data-c="' + c.id + '">' +
        UI.avatarHTML(c, { size: "sm", noOnline: true }) +
        "<b>" + esc(DB.chatTitle(c)) + '</b><span class="chk">' + UI.icon("check") + "</span></div>";
    }).join("") || '<div class="empty-sec"><div>🔍</div>' + t("search.none") + "</div>";
  }

  /* ================= media viewer ================= */
  function collectGallery() {
    mediaGallery = DB.msgs(current).filter(m => m.type === "image" && (m.src || m.mediaId)).map(m => m.id);
  }
  function openViewer(msgId) {
    collectGallery();
    galleryIndex = Math.max(0, mediaGallery.indexOf(msgId));
    showViewer();
    UI.openModal("viewer");
  }
  function showViewer() {
    const id = mediaGallery[galleryIndex];
    const msg = msgById(id);
    if (!msg) return;
    const url = msg.src || DB.media.get(msg.mediaId);
    $("#vwStage").innerHTML = '<img src="' + esc(url) + '" alt="">';
    $("#vwTitle").textContent = DB.memberName(msg.from);
    $("#vwSub").textContent = UI.clock(msg.ts);
    $("#vwCaption").textContent = msg.caption || "";
    $("#vwPrev").hidden = $("#vwNext").hidden = mediaGallery.length < 2;
  }

  /* ================= voice ================= */
  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { UI.toast(t("to.noMic"), "err"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop());
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        const dur = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const fr = new FileReader();
        fr.onload = () => {
          const mediaId = DB.media.put(fr.result);
          push({ type: "voice", mediaId, dur });
        };
        fr.readAsDataURL(blob);
      };
      let startedAt = Date.now();
      mr.start();
      rec = mr;
      $("#composer").classList.add("recording");
      $("#recStrip").hidden = false;
      $("#recTime").textContent = "0:00";
      recTimer = setInterval(() => {
        $("#recTime").textContent = UI.fmtDur((Date.now() - startedAt) / 1000);
      }, 400);
      UI.sound.click();
    } catch (e) { UI.toast(t("to.noMic"), "err"); }
  }
  function stopRec(send) {
    clearInterval(recTimer);
    $("#composer").classList.remove("recording");
    $("#recStrip").hidden = true;
    if (!rec) return;
    try { send === false ? rec.stop() && (rec = null) : rec.stop(); } catch (e) {}
    if (send === false) { /* cancelled: discard by removing last voice msg is complex — stop fires ondataavailable anyway */ }
    rec = null;
  }

  /* audio playback */
  let audioEl = null, playingId = null;
  function toggleVoice(row) {
    const id = row.dataset.voice, url = row.dataset.url;
    if (!url) { UI.toast(t("to.mediaFail"), "err"); return; }
    if (playingId === id && audioEl && !audioEl.paused) { audioEl.pause(); return; }
    if (audioEl) { audioEl.pause(); }
    audioEl = new Audio(url);
    playingId = id;
    const bars = row.querySelectorAll(".v-wave i");
    const durEl = row.querySelector(".v-dur");
    const btn = row.querySelector(".v-play");
    btn.innerHTML = UI.icon("pause");
    audioEl.ontimeupdate = () => {
      const p = audioEl.currentTime / (audioEl.duration || 1);
      bars.forEach((b, i) => b.classList.toggle("on", i / bars.length <= p));
      durEl.textContent = UI.fmtDur(audioEl.duration ? audioEl.duration - audioEl.currentTime : 0);
    };
    audioEl.onended = () => {
      btn.innerHTML = UI.icon("play");
      bars.forEach(b => b.classList.remove("on"));
      playingId = null;
      durEl.textContent = UI.fmtDur((msgById(id) || {}).dur || 0);
    };
    audioEl.play().catch(() => UI.toast(t("to.mediaFail"), "err"));
  }

  /* ================= polls & tasks ================= */
  function votePoll(msgId, optIdx) {
    const msg = msgById(msgId);
    if (!msg || !msg.poll) return;
    const p = msg.poll;
    const o = p.opts[optIdx];
    if (!o) return;
    if (p.multi) {
      if (o.mine) { o.mine = false; o.v = Math.max(0, (o.v || 0) - 1); }
      else { o.mine = true; o.v = (o.v || 0) + 1; }
    } else {
      if (o.mine) return;
      p.opts.forEach(x => { if (x.mine) { x.mine = false; x.v = Math.max(0, (x.v || 0) - 1); } });
      o.mine = true; o.v = (o.v || 0) + 1;
      UI.sound.click();
    }
    DB.patchMsg(current, msgId, { poll: p });
    render();
  }
  function toggleTask(msgId, idx) {
    const msg = msgById(msgId);
    if (!msg || !msg.task) return;
    const it = msg.task.items[idx];
    if (!it) return;
    it.done = !it.done;
    DB.patchMsg(current, msgId, { task: msg.task });
    UI.sound.click();
    render();
  }

  /* poll modal */
  function pollOptsRender(opts) {
    $("#pollOpts").innerHTML = opts.map((v, i) =>
      '<div class="po"><input type="text" value="' + esc(v) + '" placeholder="' + (I18N.lang === "ar" ? "خيار " : "Option ") + (i + 1) + '" dir="auto">' +
      '<button data-rm="' + i + '">' + UI.icon("close") + "</button></div>").join("");
  }
  function openPollModal() {
    $("#pollQ").value = "";
    pollOptsRender(["", ""]);
    $("#pollMulti").checked = false;
    $("#pollAnon").checked = true;
    UI.openModal("m-poll");
  }
  function openTaskModal() {
    $("#taskTitle").value = "";
    $("#taskItems").innerHTML = "";
    taskAddRow(""); taskAddRow("");
    UI.openModal("m-task");
  }
  function taskAddRow(v) {
    const wrap = document.createElement("div");
    wrap.className = "po";
    wrap.innerHTML = '<input type="text" value="' + esc(v || "") + '" dir="auto" placeholder="' +
      (I18N.lang === "ar" ? "مهمة…" : "Task…") + '">' +
      '<button data-rm="' + $("#taskItems").children.length + '">' + UI.icon("close") + "</button>";
    $("#taskItems").appendChild(wrap);
  }

  /* ================= in-chat search ================= */
  function openSearch() {
    $("#inChatSearch").hidden = false;
    $("#icsInput").focus();
  }
  function closeSearch() {
    $("#inChatSearch").hidden = true;
    $("#icsInput").value = "";
    searchMatches = []; searchIdx = -1;
    if (current) render();
  }
  function applySearchHighlights() {
    const q = ($("#icsInput").value || "").trim();
    if (!q) { $("#icsCount").textContent = ""; return; }
    const box = $("#msgs");
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    let count = 0;
    box.querySelectorAll(".m-text, .m-caption, .p-q").forEach(el => {
      if (rx.test(el.textContent)) {
        const html = UI.esc(el.textContent).replace(rx, m => "<mark>" + m + "</mark>");
        el.innerHTML = html;
        count += (el.innerHTML.match(/<mark>/g) || []).length;
      }
    });
    searchMatches = Array.from(box.querySelectorAll("mark"));
    searchIdx = searchMatches.length ? 0 : -1;
    $("#icsCount").textContent = searchMatches.length ? t("chat.matches", { a: 1, b: searchMatches.length }) : t("search.none");
    focusMatch();
  }
  function focusMatch() {
    if (!searchMatches.length) return;
    const el = searchMatches[Math.max(0, Math.min(searchIdx, searchMatches.length - 1))];
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      $("#icsCount").textContent = t("chat.matches", { a: searchIdx + 1, b: searchMatches.length });
    }
  }
  function stepSearch(dir) {
    if (!searchMatches.length) return;
    searchIdx = (searchIdx + dir + searchMatches.length) % searchMatches.length;
    focusMatch();
  }

  /* ================= chat row menu (used by app.js) ================= */
  function rowMenu(chat, x, y) {
    const items = [];
    items.push({ id: "open", label: t("ui.selectChat"), icon: "bookmark", run: () => APP.openChat(chat.id) });
    items.push({ id: "unread", label: chat.unread ? t("act.read") : t("act.unread"), icon: "check2", run: () => {
      chat.unread = chat.unread ? 0 : 1; DB.save(); APP.renderChatList();
    } });
    items.push({ id: "mute", label: chat.muted ? t("act.unmute") : t("act.mute"), icon: chat.muted ? "bell" : "bell-off",
      run: () => { chat.muted = !chat.muted; DB.save(); APP.renderChatList(); UI.toast(chat.muted ? t("to.muteOn") : t("to.muteOff"), "ok"); } });
    items.push({ id: "pin", label: chat.pinned ? t("chat.unpin") : t("chat.pin"), icon: "pin", run: () => {
      chat.pinned = !chat.pinned; DB.save(); APP.renderChatList();
    } });
    if (chat.type === "group" && (chat.admins || []).includes(me()))
      items.push({ sep: true }, { id: "info", label: t("act.info"), icon: "info", run: () => APP.openDrawer(chat.id) });
    items.push({ sep: true });
    items.push({ id: "clear", label: t("act.clear"), icon: "trash", danger: true, run: async () => {
      if (await UI.confirm(t("cf.clearChat"))) { DB.clearChat(chat.id); if (current === chat.id) render(); APP.renderChatList(); UI.toast(t("to.deleted"), "ok"); }
    } });
    items.push({ id: "del", label: t("act.deleteChat"), icon: "trash", danger: true, run: async () => {
      if (await UI.confirm(t("cf.deleteChat"))) {
        DB.removeChat(chat.id);
        if (current === chat.id) APP.closeChat();
        APP.renderChatList();
      }
    } });
    menu(items, x, y);
  }

  /* ================= wiring ================= */
  function init() {
    if (bound) return;
    bound = true;

    /* composer */
    const input = $("#msgInput");
    input.addEventListener("input", () => { autoGrow(); updateSendState(); saveDraft(); if (current) DB.sync.amTyping(current); });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); }
    });
    $("#btnSend").addEventListener("click", () => {
      if ($("#composer").classList.contains("recording")) { stopRec(true); return; }
      if (input.value.trim()) sendText(); else startRec();
    });
    $("#rsClose").addEventListener("click", cancelReply);
    $("#esClose").addEventListener("click", () => { cancelEdit(); input.value = ""; autoGrow(); updateSendState(); });

    /* attach menu */
    $("#btnAttach").addEventListener("click", e => {
      e.stopPropagation();
      const menuEl = $("#attachMenu");
      menuEl.hidden = !menuEl.hidden;
      $("#emojiPanel").hidden = true;
      UI.sound.click();
    });
    $("#attachMenu").addEventListener("click", e => {
      const b = e.target.closest("button[data-att]"); if (!b) return;
      $("#attachMenu").hidden = true;
      const kind = b.dataset.att;
      if (kind === "image") $("#fileImage").click();
      else if (kind === "file") $("#fileAny").click();
      else if (kind === "poll") openPollModal();
      else if (kind === "task") openTaskModal();
      else if (kind === "sticker") { openEmoji("sticker"); }
    });
    $("#fileImage").addEventListener("change", async e => {
      const f = e.target.files[0]; e.target.value = "";
      if (!f || !current) return;
      if (f.type.startsWith("video")) {
        /* keep videos as file-style message */
        if (f.size > 900 * 1024) { UI.toast(t("to.storageFull"), "err"); return; }
        readAsData(f, d => push({ type: "file", name: f.name, size: f.size, mediaId: DB.media.put(d) }));
        return;
      }
      try {
        const d = await UI.compressImage(f);
        const mediaId = DB.media.put(d);
        push({ type: "image", mediaId });
      } catch (err) { UI.toast(t("to.mediaFail"), "err"); }
    });
    $("#fileAny").addEventListener("change", e => {
      const f = e.target.files[0]; e.target.value = "";
      if (!f || !current) return;
      if (f.size > 900 * 1024) {
        push({ type: "file", name: f.name, size: f.size });
        UI.toast(I18N.lang === "ar"
          ? "الملف أكبر من 900KB — حُفظت بياناته الوصفية فقط"
          : "File exceeds 900KB — only its metadata was stored", "err");
        return;
      }
      readAsData(f, d => push({ type: "file", name: f.name, size: f.size, mediaId: DB.media.put(d) }));
    });
    function readAsData(file, cb) { const fr = new FileReader(); fr.onload = () => cb(fr.result); fr.readAsDataURL(file); }

    /* recording */
    $("#recCancel").addEventListener("click", () => stopRec(false));
    $("#recSend").addEventListener("click", () => stopRec(true));

    /* emoji panel */
    $("#btnEmoji").addEventListener("click", e => {
      e.stopPropagation();
      const p = $("#emojiPanel");
      p.hidden = !p.hidden;
      $("#attachMenu").hidden = true;
      if (!p.hidden) renderEmoji("emoji");
    });
    $("#epClose").addEventListener("click", () => { $("#emojiPanel").hidden = true; });
    $("#epTabs").addEventListener("click", e => {
      const b = e.target.closest("button[data-ep]"); if (!b) return;
      $("#epTabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      renderEmoji(b.dataset.ep);
    });
    $("#epSearch").addEventListener("input", () => renderEmoji(currentEpKind));
    $("#epBody").addEventListener("click", e => {
      const em = e.target.closest("button[data-e]");
      if (em) {
        const val = em.dataset.e;
        if (currentEpKind === "sticker") {
          if (current) push({ type: "sticker", text: val });
          $("#emojiPanel").hidden = true;
        } else {
          const el = $("#msgInput");
          const s = el.selectionStart || el.value.length;
          el.value = el.value.slice(0, s) + val + el.value.slice(s);
          el.focus(); el.selectionStart = el.selectionEnd = s + val.length;
          UI.pushRecentEmoji(val); autoGrow(); updateSendState(); saveDraft();
        }
        return;
      }
      const cat = e.target.closest("[data-clear]");
      if (cat) { $("#epSearch").value = ""; renderEmoji(currentEpKind); }
    });

    /* messages: click delegation */
    $("#msgs").addEventListener("click", e => {
      const jump = e.target.closest("[data-jump]");
      if (jump) {
        const target = document.querySelector('.msg-row[data-id="' + jump.dataset.jump + '"], .svc[data-id="' + jump.dataset.jump + '"]');
        if (target) { target.scrollIntoView({ block: "center", behavior: "smooth" }); target.animate([{ filter: "brightness(1.6)" }, { filter: "none" }], 700); }
        return;
      }
      const row = e.target.closest(".msg-row");
      if (!row) return;
      const msg = msgById(row.dataset.id);
      if (!msg) return;
      const act = e.target.closest("[data-a]");
      if (act) {
        const a = act.dataset.a;
        if (a === "reply") setReply(msg);
        else if (a === "react") reactPop(act, msg);
        else if (a === "more") { const r = act.getBoundingClientRect(); msgMenu(msg, r.left, r.bottom + 6); }
        return;
      }
      const rx = e.target.closest("[data-rx]");
      if (rx) { toggleReaction(msg, rx.dataset.rx); return; }
      const media = e.target.closest("[data-view]");
      if (media) { openViewer(media.dataset.view); return; }
      const file = e.target.closest("[data-file]");
      if (file) { const m = msgById(file.dataset.file); downloadFile(m); return; }
      const voice = e.target.closest("[data-voice]");
      if (voice) { toggleVoice(voice); return; }
      const opt = e.target.closest("[data-opt]");
      if (opt) { votePoll(row.dataset.id, +opt.dataset.opt); return; }
      const item = e.target.closest("[data-item]");
      if (item) { toggleTask(row.dataset.id, +item.dataset.item); return; }
    });

    $("#msgs").addEventListener("contextmenu", e => {
      const row = e.target.closest(".msg-row"); if (!row) return;
      e.preventDefault();
      const msg = msgById(row.dataset.id);
      if (msg) msgMenu(msg, e.clientX, e.clientY);
    });
    $("#msgs").addEventListener("scroll", () => { /* keep sticky date nice */ }, { passive: true });

    /* chat header actions */
    $("#chatIdBtn").addEventListener("click", () => APP.openDrawer(current));
    $("#btnBack").addEventListener("click", () => APP.closeChat());
    $("#btnChatSearch").addEventListener("click", openSearch);
    $("#icsClose").addEventListener("click", closeSearch);
    $("#icsInput").addEventListener("input", () => { clearTimeout(window._icsT); window._icsT = setTimeout(applySearchHighlights, 160); });
    $("#icsPrev").addEventListener("click", () => stepSearch(-1));
    $("#icsNext").addEventListener("click", () => stepSearch(1));
    $("#btnChatMenu").addEventListener("click", e => {
      const chat = DB.chat(current); if (!chat) return;
      const r = e.currentTarget.getBoundingClientRect();
      const items = [
        { id: "info", label: t("act.info"), icon: "info", run: () => APP.openDrawer(current) },
        { id: "members", label: t("act.members"), icon: "users", run: () => openMembers(chat) },
        { id: "pins", label: t("act.pinnedList"), icon: "pin", run: () => openPinned(chat) },
        { id: "search", label: t("k.inchat"), icon: "search", run: openSearch },
        { sep: true },
        { id: "mute", label: chat.muted ? t("act.unmute") : t("act.mute"), icon: chat.muted ? "bell" : "bell-off",
          run: () => { chat.muted = !chat.muted; DB.save(); APP.renderChatList(); UI.toast(chat.muted ? t("to.muteOn") : t("to.muteOff"), "ok"); } },
        { id: "pin", label: chat.pinned ? t("chat.unpin") : t("chat.pin"), icon: "pin",
          run: () => { chat.pinned = !chat.pinned; DB.save(); APP.renderChatList(); } },
        { id: "export", label: t("act.export"), icon: "download", run: () => exportChat(chat) },
        { sep: true },
        { id: "clear", label: t("act.clear"), icon: "trash", danger: true, run: async () => {
          if (await UI.confirm(t("cf.clearChat"))) { DB.clearChat(current); render(); APP.renderChatList(); } } },
        { id: "leave", label: chat.type === "group" ? t("act.leave") : t("act.deleteChat"), icon: "logout", danger: true,
          run: async () => {
            if (await UI.confirm(chat.type === "group" ? t("cf.leave") : t("cf.deleteChat"))) {
              DB.removeChat(current); APP.closeChat(); APP.renderChatList();
            } } }
      ];
      menu(items, r.left, r.bottom + 6);
    });
    $("#pinnedClose").addEventListener("click", () => { DB.chat(current).pinnedMsg = null; DB.save(); renderHeader(); });
    $("#pinnedBar").addEventListener("click", e => {
      if (e.target.closest("#pinnedClose")) return;
      const chat = DB.chat(current);
      const el = document.querySelector('.msg-row[data-id="' + chat.pinnedMsg + '"]');
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    $("#btnCall").addEventListener("click", () => APP.startCall(current, "audio"));
    $("#btnVideoCall").addEventListener("click", () => APP.startCall(current, "video"));

    /* poll modal */
    $("#pollAdd").addEventListener("click", () => {
      const vals = Array.from($("#pollOpts").querySelectorAll("input")).map(i => i.value);
      if (vals.length >= 10) return;
      vals.push(""); pollOptsRender(vals);
      const inputs = $("#pollOpts").querySelectorAll("input");
      inputs[inputs.length - 1].focus();
    });
    $("#pollOpts").addEventListener("click", e => {
      const rm = e.target.closest("[data-rm]");
      if (rm) {
        const vals = Array.from($("#pollOpts").querySelectorAll("input")).map(i => i.value);
        if (vals.length <= 2) return;
        vals.splice(+rm.dataset.rm, 1); pollOptsRender(vals);
      }
    });
    $("#pollGo").addEventListener("click", () => {
      const q = $("#pollQ").value.trim();
      const opts = Array.from($("#pollOpts").querySelectorAll("input")).map(i => i.value.trim()).filter(Boolean);
      if (!q) { UI.toast(t("dlg.required"), "err"); return; }
      if (!opts.length) { UI.toast(t("to.pollEmpty"), "err"); return; }
      UI.closeModal($("#m-poll"));
      push({ type: "poll", poll: { q, multi: $("#pollMulti").checked, anon: $("#pollAnon").checked,
        opts: opts.map(o => ({ t: o, v: 0, mine: false })) } });
    });

    /* task modal */
    $("#taskAdd").addEventListener("click", () => { taskAddRow(""); $("#taskItems").lastChild.querySelector("input").focus(); });
    $("#taskItems").addEventListener("click", e => {
      const rm = e.target.closest("[data-rm]");
      if (rm && $("#taskItems").children.length > 1) rm.parentNode.remove();
    });
    $("#taskGo").addEventListener("click", () => {
      const title = $("#taskTitle").value.trim() || (I18N.lang === "ar" ? "قائمة مهام" : "Task list");
      const items = Array.from($("#taskItems").querySelectorAll("input")).map(i => i.value.trim()).filter(Boolean)
        .map(x => ({ t: x, done: false }));
      if (!items.length) { UI.toast(t("to.pollEmpty"), "err"); return; }
      UI.closeModal($("#m-task"));
      push({ type: "task", task: { title, items } });
    });

    /* forward modal */
    $("#fwdSearch").addEventListener("input", renderForwardList);
    $("#fwdList").addEventListener("click", e => {
      const row = e.target.closest("[data-c]"); if (!row) return;
      const id = row.dataset.c;
      fwdPicked.has(id) ? fwdPicked.delete(id) : fwdPicked.add(id);
      renderForwardList();
      $("#fwdGo").disabled = !fwdPicked.size;
    });
    $("#fwdGo").addEventListener("click", () => {
      if (!fwdMsg || !fwdPicked.size) return;
      const copy = JSON.parse(JSON.stringify(fwdMsg));
      delete copy.id; copy.ts = Date.now(); copy.from = me(); copy.read = false;
      copy.fwd = DB.memberName(fwdMsg.from);
      let n = 0;
      fwdPicked.forEach(cid => { if (DB.chat(cid)) { DB.addMsg(cid, copy); n++; } });
      UI.closeModal($("#m-forward"));
      UI.toast(t("to.forwarded", { n }), "ok");
      APP.renderChatList();
      fwdMsg = null; fwdPicked = new Set();
    });

    /* context menu actions */
    $("#ctxmenu").addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      const el = $("#ctxmenu");
      const items = el._items || [];
      const it = items.find(x => x.id === b.dataset.a);
      closeMenu();
      if (it && typeof it.run === "function") { try { it.run(); } catch (err) { console.error(err); } }
    });

    /* global click closers */
    document.addEventListener("click", e => {
      const cm = $("#ctxmenu");
      /* ignore the same click that just opened the menu */
      if (!e.target.closest("#ctxmenu") && Date.now() - (cm._openAt || 0) > 250) closeMenu();
      if (!e.target.closest("#reactPop") && !e.target.closest('[data-a="react"]')) closeReact();
      if (!e.target.closest("#attachMenu") && !e.target.closest("#btnAttach")) $("#attachMenu").hidden = true;
      if (!e.target.closest("#emojiPanel") && !e.target.closest("#btnEmoji")) $("#emojiPanel").hidden = true;
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenu(); closeReact(); } });

    /* reaction popup */
    $("#reactPop").addEventListener("click", e => {
      const b = e.target.closest("[data-r]"); if (!b) return;
      const msg = $("#reactPop")._msg;
      closeReact();
      if (msg) toggleReaction(msg, b.dataset.r);
    });

    /* viewer */
    $("#vwClose").addEventListener("click", () => UI.closeModal($("#viewer")));
    $("#vwPrev").addEventListener("click", () => { galleryIndex = (galleryIndex - 1 + mediaGallery.length) % mediaGallery.length; showViewer(); });
    $("#vwNext").addEventListener("click", () => { galleryIndex = (galleryIndex + 1) % mediaGallery.length; showViewer(); });
    $("#vwDl").addEventListener("click", () => {
      const msg = msgById(mediaGallery[galleryIndex]); if (!msg) return;
      const url = msg.src || DB.media.get(msg.mediaId);
      const a = document.createElement("a"); a.href = url; a.download = "wasl-" + msg.id + ".jpg"; a.click();
    });
    $("#viewer").addEventListener("click", e => { if (e.target.id === "viewer") UI.closeModal($("#viewer")); });

    /* members / pinned modals */
    $("#memSearch").addEventListener("input", () => renderMembers(DB.chat(current)));

    /* DB events */
    DB.on("msg", data => {
      if (data.chatId === current && data.msg.from !== me()) { render(); scrollBottom(); renderHeader(); }
      APP.renderChatList();
      if (data.incoming && data.chatId !== current) {
        const chat = DB.chat(data.chatId);
        if (chat && !chat.muted && document.hidden) UI.sound.msg();
      }
    });
    DB.on("msg:update", data => { if (data.chatId === current) render(); });
    DB.on("msg:del", data => { if (data.chatId === current) render(); });
    DB.on("chat:clear", id => { if (id === current) render(); });
    DB.on("typing", data => {
      if (data.chatId !== current) return;
      if (DB.sync.typingIn(current)) showTyping(null, 4200);
      else hideTyping();
      if (!DB.sync.typingIn(current)) { const st = $("#chatStatus"); if (st) st.textContent = statusLine(DB.chat(current)); }
    });
    DB.on("presence", () => { if (current) renderHeader(); });
    DB.on("db:remote", () => { if (current) { renderHeader(); render(); } APP.renderChatList(); });
    DB.on("quota", () => UI.toast(t("to.storageFull"), "err"));
  }

  /* ---- reactions ---- */
  function toggleReaction(msg, emoji) {
    const r = msg.reactions ? JSON.parse(JSON.stringify(msg.reactions)) : {};
    const list = r[emoji] ? r[emoji].slice() : [];
    const i = list.indexOf(me());
    if (i > -1) list.splice(i, 1); else { list.push(me()); UI.sound.click(); }
    if (list.length) r[emoji] = list; else delete r[emoji];
    DB.patchMsg(current, msg.id, { reactions: r });
    render();
  }

  function downloadFile(msg) {
    if (!msg) return;
    const url = msg.mediaId ? DB.media.get(msg.mediaId) : null;
    if (!url) { UI.toast(t("to.mediaFail"), "err"); return; }
    const a = document.createElement("a"); a.href = url; a.download = msg.name || "file"; a.click();
  }

  /* ---- members & pinned ---- */
  function openMembers(chat) {
    renderMembers(chat);
    UI.openModal("m-members");
  }
  function renderMembers(chat) {
    if (!chat) return;
    const q = ($("#memSearch").value || "").toLowerCase();
    const ids = (chat.members || []).filter(id => !q || (DB.memberName(id) || "").toLowerCase().includes(q));
    $("#memList").innerHTML = ids.map(id => {
      const u = DB.user(id) || {};
      const isOwner = (chat.admins || [])[0] === id;
      const isAdmin = (chat.admins || []).includes(id);
      return '<div class="pick-row" data-u="' + id + '">' + UI.avatarHTML(u, { size: "sm" }) +
        "<b>" + esc(DB.memberName(id)) + (id === me() ? "" : "") +
        "<small>@" + esc(u.username || "—") + "</small></b>" +
        (isOwner ? '<span class="role">' + t("members.owner") + "</span>" :
          isAdmin ? '<span class="role">' + t("members.admin") + "</span>" : "") +
        "</div>";
    }).join("") || '<div class="empty-sec"><div>👥</div>' + t("search.none") + "</div>";
  }
  function openPinned(chat) {
    const list = DB.msgs(chat.id).filter(m => false);
    const pm = chat.pinnedMsg ? msgById(chat.pinnedMsg) : null;
    $("#pinList").innerHTML = pm
      ? '<div class="pick-row"><div class="fi">' + UI.icon("pin") + "</div><b>" +
        esc((pm.text || pm.caption || t("pv.photo")).slice(0, 80)) + "</b></div>"
      : '<div class="empty-sec"><div>📌</div>' + t("pinned.none") + "</div>";
    UI.openModal("m-pinned");
  }
  function exportChat(chat) {
    const lines = DB.msgs(chat.id).map(m =>
      "[" + UI.clock(m.ts) + "] " + DB.memberName(m.from) + ": " +
      (m.type === "text" ? m.text : m.type === "image" ? "[image] " + (m.caption || "") :
        m.type === "file" ? "[file] " + m.name : m.type === "voice" ? "[voice]" :
        m.type === "poll" ? "[poll] " + m.poll.q : m.type === "task" ? "[task] " + m.task.title : "[sticker] " + m.text));
    const blob = new Blob(["# " + DB.chatTitle(chat) + "\n\n" + lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wasl-chat.txt"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    UI.toast(t("to.backup"), "ok");
  }

  /* ---- emoji panel ---- */
  let currentEpKind = "emoji";
  function openEmoji(kind) {
    currentEpKind = kind || "emoji";
    $("#emojiPanel").hidden = false;
    $("#epTabs").querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.ep === currentEpKind));
    renderEmoji(currentEpKind);
  }
  function renderEmoji(kind) {
    currentEpKind = kind;
    const body = $("#epBody");
    if (kind === "sticker") {
      body.innerHTML = '<div class="ep-cat">' + t("ep.sticker") + "</div>" +
        '<div class="sticker-grid">' + UI.STICKERS.map(s =>
          '<button data-e="' + s + '">' + s + "</button>").join("") + "</div>";
      return;
    }
    const q = ($("#epSearch").value || "").trim().toLowerCase();
    if (q) {
      const list = UI.searchEmoji(q);
      body.innerHTML = '<div class="ep-cat">' + t("ep.searchPh") + "</div>" +
        '<div class="emoji-grid">' + list.map(s => '<button data-e="' + s + '">' + s + "</button>").join("") + "</div>";
      return;
    }
    body.innerHTML = UI.emojiList().map(g =>
      '<div class="ep-cat">' + t(g.key) + "</div>" +
      '<div class="emoji-grid">' + g.list.map(s => '<button data-e="' + s + '">' + s + "</button>").join("") + "</div>"
    ).join("");
    body.scrollTop = 0;
  }

  /* ================= public ================= */
  window.CHAT = {
    init, open, close, render, sendText, focusInput: () => $("#msgInput").focus(),
    openTaskModal, openPollModal, menu, rowMenu, closeMenu, showTyping, hideTyping,
    get current() { return current; },
    get replyTo() { return replyTo; },
    statusLine, setReply
  };
})();
