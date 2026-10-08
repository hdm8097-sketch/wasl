/* ============================================================
   وصل | Wasl — ui.js  (dom helpers, markdown, toasts, time, emoji)
   ============================================================ */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس",
    "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* ---------------- emoji data ---------------- */
  const EMOJI = {
    "ep.smileys": ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","🤖"],
    "ep.gestures": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","💪","🦾","🖕","✍️","💅","🤳","💃","🕺","🚶","🏃","🧘"],
    "ep.objects": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","🔥","⭐","🌟","✨","⚡","💥","💢","💦","💨","🎉","🎊","🎯","🏆","🥇","🎁","🎈"," Cake ".trim(),"🍕","🍔","🍟","🌮","🍣","🍩","🍪","☕","🍵","🧃","🍺","🍻","🥂","🍷","🥤","🍦","🌈","☀️","🌙","⭐","☁️","🌧️","❄️","🌊","🌵","🌴","🐶","🐱","🦊","🐻","🐼","🐨","🦁","🐮","🐷","🐵","🦄","🐝","🦋","🐢","🐙","🦄","🎈","🎁","🏆","📚","📝","💡","📌","📎","🔒","🔑","📱","💻","🎮","🎧","📷","🚀","✈️","🚗","🏠","⚽","🏀","🎮","🎲","🎵","🎸"],
    "ep.symbols": ["✅","❌","⚠️","❓","❗","💯","🔁","▶️","⏸️","⏩","⏪","⏰","🕐","🔢","#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟥","🟧","🟨","🟩","🟦","🟪","⬛","⬜","💠","🔷","🔶","🔘","▶️","◀️","⬆️","⬇️","↗️","↘️","↙️","↖️","🔀","🔂","🔄","🔃","➕","➖","✖️","➗","🟰","♾️","💲","💱","™️","©️","®️","🔕","🔇","🔊","📢","📣","💬","💭","🗯️","♠️","♣️","♥️","♦️","🃏","🀄","🕐","🕑"],
    "ep.flags": ["🇸🇾","🇱🇧","🇯🇴","🇪🇬","🇸🇦","🇦🇪","🇶🇦","🇰🇼","🇮🇶","🇾🇪","🇵🇸","🇲🇦","🇩🇿","🇹🇳","🇱🇾","🇸🇩","🇲🇷","🇹🇷","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇪🇸","🇮🇹","🇷🇺","🇨🇳","🇯🇵","🇰🇷","🇮🇳","🇧🇷","🇨🇦","🇦🇺","🇳🇴","🇸🇪","🇳🇱","🇵🇹","🇬🇷","🇺🇦","🇵🇱"]
  };
  const STICKERS = ["😻","🔥","😂","😍","👍","🥳","😎","🤯","💯","🎉","😱","🤖","👻","🌈","⚽","🍕","☕","🚀","🌙","💀","🤔","🙌","👏","❤️","⭐","🦋","🐢","🎧","🏆","😎","😴","🥵","🤯","🖕","💋","🤒","🧠","👀","💥","🫶","🤝","🙏","💪","🧃","🍬","🌙","🦄","🌧️"];
  const QUICK_RX = ["👍","❤️","🔥","😂","😮","😍","🎉","😢","👏","🤔"];

  let recentEmoji = [];
  try { recentEmoji = JSON.parse(localStorage.getItem("wasl.emoji") || "[]"); } catch (e) {}

  /* ---------------- markdown ---------------- */
  function md(src) {
    if (src == null) return "";
    let s = String(src);
    /* escape first */
    s = esc(s);
    const blocks = [];
    s = s.replace(/```([\s\S]*?)```/g, (g, code) => {
      blocks.push("<pre>" + code.replace(/^\n+|\n+$/g, "") + "</pre>");
      return "\u0000B" + (blocks.length - 1) + "\u0000";
    });
    /* links */
    s = s.replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<]+)/g, (g, pre, url) => {
      const href = url.indexOf("http") === 0 ? url : "https://" + url;
      return pre + '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + "</a>";
    });
    /* inline */
    s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    s = s.replace(/\|\|([\s\S]+?)\|\|/g, '<span class="spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
    s = s.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<em class="b i">$1</em>');
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<b class="b">$1</b>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, "$1<i>$2</i>");
    s = s.replace(/__([^_\n]+)__/g, "<u>$1</u>");
    s = s.replace(/~~([^~\n]+)~~/g, '<span class="s">$1</span>');
    s = s.replace(/(^|[\s>])@([A-Za-z0-9_]{3,})/g, '$1<span class="mention">@$2</span>');
    s = s.replace(/\u0000B(\d+)\u0000/g, (g, i) => blocks[+i]);
    return s;
  }

  /* ---------------- time ---------------- */
  function clock(ts) {
    const d = new Date(ts);
    let h = d.getHours(); const m = d.getMinutes();
    const am = h < 12; h = h % 12 || 12;
    const t = h + ":" + String(m).padStart(2, "0");
    if (I18N.lang === "ar") return t + (am ? " ص" : " م");
    return t + (am ? " AM" : " PM");
  }
  function sameDay(a, b) { const x = new Date(a), y = new Date(b); return x.toDateString() === y.toDateString(); }
  function dayKey(ts) {
    const d = new Date(ts), today = new Date();
    const y = new Date(today.getTime() - 86400000);
    if (sameDay(ts, today)) return t("today");
    if (sameDay(ts, y)) return t("yesterday");
    if (I18N.lang === "ar") return d.getDate() + " " + MONTHS_AR[d.getMonth()] + (d.getFullYear() !== today.getFullYear() ? " " + d.getFullYear() : "");
    return d.getDate() + " " + MONTHS_EN[d.getMonth()] + (d.getFullYear() !== today.getFullYear() ? " " + d.getFullYear() : "");
  }
  /** short label shown on chat list rows */
  function listTime(ts) {
    if (!ts) return "";
    const d = new Date(ts), today = new Date();
    if (sameDay(ts, today)) return clock(ts);
    if (sameDay(ts, today.getTime() - 86400000)) return I18N.lang === "en" ? "Yesterday" : "أمس";
    if (I18N.lang === "ar") return d.getDate() + "/" + (d.getMonth() + 1);
    return d.getDate() + "/" + (d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(2);
  }
  function rel(ts) {
    if (!ts) return t("ui.never");
    const diff = Date.now() - ts;
    if (diff < 60000) return t("ui.justNow");
    const u = I18N.lang === "ar"
      ? { h: "ساعة", m: "دقيقة", d: "يوم" } : { h: "hour", m: "minute", d: "day" };
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t("ui.ago", { n: mins, u: mins === 1 ? u.m : (I18N.lang === "ar" ? "دقائق" : "minutes") });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t("ui.ago", { n: hrs, u: hrs === 1 ? u.h : (I18N.lang === "ar" ? "ساعات" : "hours") });
    const days = Math.floor(hrs / 24);
    return t("ui.ago", { n: days, u: days === 1 ? u.d : (I18N.lang === "ar" ? "أيام" : "days") });
  }

  /* ---------------- misc formatters ---------------- */
  function fmtSize(b) {
    if (!b && b !== 0) return "";
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
    if (b < 1073741824) return (b / 1048576).toFixed(1) + " MB";
    return (b / 1073741824).toFixed(2) + " GB";
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function wave(seed, bars) {
    let h = hash(String(seed)); const out = [];
    for (let i = 0; i < (bars || 34); i++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      out.push(22 + (h % 78));
    }
    return out;
  }

  /* ---------------- avatars ---------------- */
  function avatarHTML(entity, opts) {
    opts = opts || {};
    let emoji = "🙂", bg = "linear-gradient(135deg,#5B8CFF,#8B5CF6)", online = false, bot = false;
    if (typeof entity === "string") {
      const c = DB.chat(entity); if (c) entity = c; else { const u = DB.user(entity); entity = u || {}; }
    }
    if (entity && entity.id && entity.type) { /* chat */
      const a = DB.chatAvatar(entity);
      emoji = a.emoji; bg = a.bg;
      if (entity.type === "private" || entity.type === "bot") {
        const u = DB.user(entity.user) || {};
        online = DB.isOnline(u.id); bot = !!u.bot;
      } else online = false;
    } else if (entity && (entity.emoji || entity.username || entity.name)) { /* user */
      emoji = entity.emoji || "🙂"; bg = entity.bg || bg;
      online = DB.isOnline(entity.id); bot = !!entity.bot;
    } else if (entity && entity.emoji) { emoji = entity.emoji; bg = entity.bg || bg; }
    const size = opts.size ? " " + opts.size : "";
    const img = entity && entity.photo ? '<img src="' + esc(entity.photo) + '" alt="">' : "";
    return '<span class="avatar' + size + '" style="background:' + (bg || "") + '">' + img +
      "<span>" + esc(emoji || "🙂") + "</span>" +
      (online && !opts.noOnline ? '<i class="online-dot"></i>' : "") +
      (bot && !opts.noBot ? '<i class="bot-badge"><svg class="ic"><use href="#i-bot"/></svg></i>' : "") +
      "</span>";
  }

  function icon(name, cls) { return '<svg class="ic ' + (cls || "") + '"><use href="#i-' + name + '"/></svg>'; }

  /* ---------------- toasts ---------------- */
  function toast(msg, type) {
    const wrap = $("#toasts");
    if (!wrap) return;
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    const ic = type === "err" ? "close" : type === "ok" ? "check" : "spark";
    el.innerHTML = icon(ic) + "<span>" + msg + "</span>";
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 240); }, 2600);
    while (wrap.children.length > 4) wrap.firstChild.remove();
  }

  /* ---------------- modals ---------------- */
  let modalStack = [];
  function openModal(id) {
    const el = typeof id === "string" ? $("#" + id) : id;
    if (!el) return null;
    $$(".modal").forEach(m => { if (m !== el && !m.hidden) m.style.display = "none"; });
    el.hidden = false; el.style.display = "";
    modalStack.push(el);
    const f = el.querySelector("input:not([type=hidden]),textarea");
    if (f && window.innerWidth > 760) setTimeout(() => f.focus(), 90);
    return el;
  }
  function closeModal(el) {
    el = el || modalStack[modalStack.length - 1];
    if (!el) return;
    el.hidden = true;
    modalStack = modalStack.filter(m => m !== el);
    const prev = modalStack[modalStack.length - 1];
    if (prev) prev.style.display = "";
  }
  function closeAllModals() { $$(".modal").forEach(m => { m.hidden = true; m.style.display = ""; }); modalStack = []; }

  function confirmBox(text, opts) {
    opts = opts || {};
    return new Promise(res => {
      const box = $("#m-confirm");
      $("#cfTitle").textContent = opts.title || t("cf.title");
      $("#cfText").textContent = text;
      const go = $("#cfGo");
      go.textContent = opts.ok || t("delete");
      go.className = "btn " + (opts.danger === false ? "primary" : "danger");
      const onClose = () => { go.removeEventListener("click", onGo); res(false); };
      const onGo = () => { cleanup(); closeModal(box); res(true); };
      const onCancel = () => { cleanup(); closeModal(box); res(false); };
      function cleanup() {
        go.removeEventListener("click", onGo);
        box.querySelectorAll(".md-x").forEach(b => b.removeEventListener("click", onCancel));
      }
      go.addEventListener("click", onGo);
      box.querySelectorAll(".md-x").forEach(b => b.addEventListener("click", onCancel));
      openModal(box);
    });
  }

  function promptBox(opts) {
    opts = opts || {};
    return new Promise(res => {
      const box = $("#m-input");
      $("#inpTitle").textContent = opts.title || t("dlg.prompt");
      const field = $("#inpField");
      field.value = opts.value || "";
      field.placeholder = opts.placeholder || "";
      field.maxLength = opts.max || 120;
      $("#inpErr").hidden = true;
      const go = $("#inpGo");
      const done = (val) => { cleanup(); closeModal(box); res(val); };
      const onGo = () => {
        const v = field.value.trim();
        if (opts.required && !v) { const e = $("#inpErr"); e.textContent = t("dlg.required"); e.hidden = false; return; }
        done(v);
      };
      const onKey = (e) => { if (e.key === "Enter") onGo(); };
      function cleanup() { go.removeEventListener("click", onGo); field.removeEventListener("keydown", onKey); }
      go.addEventListener("click", onGo);
      field.addEventListener("keydown", onKey);
      box.querySelectorAll(".md-x").forEach(b => b.addEventListener("click", () => done(null)));
      openModal(box);
      setTimeout(() => { field.focus(); field.select(); }, 80);
    });
  }

  /* ---------------- sounds ---------------- */
  let actx = null;
  function tone(freq, dur, type, gain) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(gain || 0.06, actx.currentTime + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + (dur || 0.18));
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + (dur || 0.18) + 0.02);
    } catch (e) {}
  }
  const sound = {
    on() { return DB.state && DB.state.settings.sound; },
    click() { if (sound.on()) tone(880, 0.06, "triangle", 0.03); },
    send() { if (sound.on()) { tone(660, 0.09, "sine", 0.05); setTimeout(() => tone(990, 0.12, "sine", 0.04), 70); } },
    msg() { if (sound.on()) { tone(587, 0.1, "sine", 0.05); setTimeout(() => tone(784, 0.14, "sine", 0.045), 90); } },
    call() { if (sound.on()) { let i = 0; const id = setInterval(() => { tone(i % 2 ? 440 : 520, 0.25, "sine", 0.05); if (++i > 8) clearInterval(id); }, 420); sound._ring = id; } },
    stopRing() { clearInterval(sound._ring); },
    err() { if (sound.on()) tone(200, 0.2, "square", 0.04); }
  };

  /* ---------------- image compression ---------------- */
  function compressImage(file, max) {
    max = max || 1280;
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const isPng = file.type === "image/png" && Math.min(w, h) < 260;
          const out = c.toDataURL(isPng ? "image/png" : "image/jpeg", isPng ? undefined : 0.78);
          URL.revokeObjectURL(url);
          res(out);
        } catch (e) { URL.revokeObjectURL(url); rej(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
      img.src = url;
    });
  }

  /* ---------------- clipboard ---------------- */
  function copy(text) {
    const done = () => toast(t("to.copied"), "ok");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else fallback();
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      ta.remove();
    }
  }

  /* ---------------- message preview text ---------------- */
  function preview(msg, chat) {
    if (!msg) return "";
    const prefix = msg.from === DB.state.me ? t("pv.you") : "";
    let body = "";
    if (msg.type === "image") body = t("pv.photo") + (msg.caption ? " " + msg.caption : "");
    else if (msg.type === "file") body = t("pv.file") + " " + (msg.name || "");
    else if (msg.type === "voice") body = t("pv.voice");
    else if (msg.type === "poll") body = t("pv.poll") + " " + ((msg.poll && msg.poll.q) || "");
    else if (msg.type === "task") body = t("pv.task") + " " + ((msg.task && msg.task.title) || "");
    else if (msg.type === "sticker") body = msg.text || t("pv.sticker");
    else body = String(msg.text || "").replace(/\s+/g, " ");
    return esc(prefix) + esc(body);
  }

  /* ---------------- themes ---------------- */
  const ACCENTS = {
    blue: ["#5B8CFF", "#8B5CF6"], violet: ["#8B5CF6", "#EC4899"], teal: ["#14B8A6", "#22D3EE"],
    green: ["#22C55E", "#84CC16"], orange: ["#F59E0B", "#F97316"], rose: ["#F43F5E", "#FB7185"],
    cyan: ["#06B6D4", "#3B82F6"], gold: ["#EAB308", "#F97316"], pink: ["#EC4899", "#F472B6"],
    slate: ["#64748B", "#94A3B8"]
  };
  const THEMES = [
    { id: "aurora", label: "Aurora", dark: true, s: "#0E1526", a: "#5B8CFF", b: "#1B2540" },
    { id: "midnight", label: "Midnight", dark: true, s: "#0A141F", a: "#38BDF8", b: "#17293A" },
    { id: "graphite", label: "Graphite", dark: true, s: "#151719", a: "#94A3B8", b: "#24282C" },
    { id: "forest", label: "Forest", dark: true, s: "#0A1A12", a: "#34D399", b: "#15301F" },
    { id: "sunset", label: "Sunset", dark: true, s: "#1D1219", a: "#FB7185", b: "#31202B" },
    { id: "violet", label: "Violet", dark: true, s: "#130E24", a: "#A78BFA", b: "#231B40" },
    { id: "light", label: "Light", dark: false, s: "#FFFFFF", a: "#5B8CFF", b: "#E7EBF2" },
    { id: "ocean", label: "Ocean", dark: false, s: "#FFFFFF", a: "#0EA5E9", b: "#E1EDF7" },
    { id: "cream", label: "Cream", dark: false, s: "#FFFDF8", a: "#C9A227", b: "#EDE6DA" },
    { id: "mint", label: "Mint", dark: false, s: "#FFFFFF", a: "#10B981", b: "#DFF1E9" }
  ];
  function applyTheme(id) {
    const th = THEMES.find(x => x.id === id) || THEMES[0];
    document.documentElement.dataset.theme = th.id;
    applyAccent((DB.state.settings.accent || "blue"), th);
    try { localStorage.setItem("wasl.theme", th.id); } catch (e) {}
    return th;
  }
  /* ---------- contrast-aware accent colors (WCAG 4.5:1) ---------- */
  function _c2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function _clum(h) {
    const c = _c2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function _contrast(a, b) { const x = _clum(a), y = _clum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function _rgb2hex(a) {
    return "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  function _toHsl(hex) {
    const [r0, g0, b0] = _c2rgb(hex).map(v => v / 255);
    const mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r0 ? (g0 - b0) / d + (g0 < b0 ? 6 : 0) : mx === g0 ? (b0 - r0) / d + 2 : (r0 - g0) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function _fromHsl(h, s, l) {
    if (s <= 0) { const v = l * 255; return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  function _shiftLight(hex, dir, ok) {
    const [h, s, l] = _toHsl(hex);
    for (let i = 0; i <= 500; i++) {
      const nl = l + dir * i * 0.002;
      if (nl < 0 || nl > 1) break;
      const cand = _rgb2hex(_fromHsl(h, s, nl));
      if (ok(cand)) return cand;
    }
    return _rgb2hex(_fromHsl(h, s, dir > 0 ? 1 : 0));
  }
  /** background color that keeps white text at >= 4.5:1 */
  function accentSolid(hex) {
    return _contrast("#FFFFFF", hex) >= 4.55 ? hex : _shiftLight(hex, -1, c => _contrast("#FFFFFF", c) >= 4.55);
  }
  /** accent used as text/icon on the theme surface at >= 4.5:1 */
  function accentText(hex, bg, dark) {
    if (_contrast(hex, bg) >= 4.55) return hex;
    return _shiftLight(hex, dark ? 1 : -1, c => _contrast(c, bg) >= 4.55);
  }

  function applyAccent(name, theme) {
    const pair = ACCENTS[name] || ACCENTS.blue;
    const th = theme || THEMES.find(x => x.id === document.documentElement.dataset.theme) || THEMES[0];
    const root = document.documentElement.style;
    const ref = th.b || th.s;
    root.setProperty("--accent", accentText(pair[0], ref, !!th.dark));
    root.setProperty("--accent-2", pair[1]);
    root.setProperty("--accent-solid", accentSolid(pair[0]));
    root.setProperty("--accent-2-solid", accentSolid(pair[1]));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = th.dark ? th.s : th.a;
  }
  function applyFontScale(pct) {
    document.documentElement.style.setProperty("--fs", (15 * (pct / 100)).toFixed(1) + "px");
  }
  function applySpacing(v) {
    document.documentElement.style.setProperty("--msg-gap", v === "compact" ? "0px" : "2px");
  }

  window.UI = {
    $, $$, esc, md, icon, avatarHTML, toast, openModal, closeModal, closeAllModals,
    confirm: confirmBox, prompt: promptBox, clock, dayKey, listTime, rel, fmtSize, fmtDur, wave,
    compressImage, copy, preview, sound, EMOJI, STICKERS, QUICK_RX,
    THEMES, ACCENTS, applyTheme, applyAccent, applyFontScale, applySpacing,
    emojiList() {
      const out = [];
      if (recentEmoji.length) out.push({ key: "ep.recent", list: recentEmoji.slice(0, 24) });
      for (const k in EMOJI) out.push({ key: k, list: EMOJI[k] });
      return out;
    },
    pushRecentEmoji(e) {
      recentEmoji = [e].concat(recentEmoji.filter(x => x !== e)).slice(0, 24);
      try { localStorage.setItem("wasl.emoji", JSON.stringify(recentEmoji)); } catch (err) {}
    },
    searchEmoji(q) {
      q = (q || "").trim();
      if (!q) return null;
      const all = [];
      for (const k in EMOJI) all.push(...EMOJI[k]);
      return all;
    },
    isDark() {
      const id = document.documentElement.dataset.theme;
      const th = THEMES.find(x => x.id === id);
      return th ? th.dark : true;
    },
    toggleQuickDark() {
      const cur = document.documentElement.dataset.theme;
      const th = THEMES.find(x => x.id === cur);
      const next = th && !th.dark ? "aurora" : "light";
      DB.state.settings.theme = next;
      DB.save();
      applyTheme(next);
      return next;
    }
  };
})();
