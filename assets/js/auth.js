/* ============================================================
   وصل | Wasl — auth.js  (local accounts · SHA-256 · PIN lock)
   ============================================================ */
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => UI.esc(s);
  /* ---------------- SHA-256 (pure JS fallback + WebCrypto) ---------------- */
  function sha256_js(str) {
    function rr(x, n) { return (x >>> n) | (x << (32 - n)); }
    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const utf8 = unescape(encodeURIComponent(str));
    const l = utf8.length;
    const withOne = l + 1;
    const pad = (56 - (withOne % 64) + 64) % 64;
    const total = withOne + pad + 8;
    const bytes = new Uint8Array(total);
    for (let i = 0; i < l; i++) bytes[i] = utf8.charCodeAt(i);
    bytes[l] = 0x80;
    const bitLen = l * 8;
    const dv = new DataView(bytes.buffer);
    dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000));
    dv.setUint32(total - 4, bitLen >>> 0);
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const w = new Uint32Array(64);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15] >>> 3);
        const s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,h] = H;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e,6) ^ rr(e,11) ^ rr(e,25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rr(a,2) ^ rr(a,13) ^ rr(a,22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    return H.map(x => x.toString(16).padStart(8, "0")).join("");
  }

  async function hash(pw, salt) {
    const input = String(salt || "") + "::" + String(pw) + "::wasl";
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      } catch (e) { /* fall through */ }
    }
    return sha256_js(input);
  }

  const S_KEY = "wasl.session";
  const getSession = () => { try { return localStorage.getItem(S_KEY); } catch (e) { return null; } };
  const setSession = (id) => { try { id ? localStorage.setItem(S_KEY, id) : localStorage.removeItem(S_KEY); } catch (e) {} };

  function logAttempt(user, ok, reason) {
    const s = DB.state;
    s.loginLog = s.loginLog || [];
    s.loginLog.unshift({ at: Date.now(), user, ok, reason: reason || "",
      dev: navigator.platform || "", browser: (navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg)\/[\d.]+/) || ["?"])[0] });
    s.loginLog = s.loginLog.slice(0, 60);
    DB.save();
  }

  const AUTH = {
    hash, sha256_js,

    /** hash the demo seed password once, then drop the plaintext */
    async ensureDemo() {
      const acc = DB.account("demo");
      if (acc && acc.seedPw) {
        acc.hash = await hash(acc.seedPw, acc.salt);
        delete acc.seedPw;
        DB.save(true);
      }
    },

    screen(which) {
      const auth = $("#auth"), app = $("#app"), lock = $("#lock");
      auth.hidden = which !== "auth";
      app.hidden = which !== "app";
      lock.hidden = which !== "lock";
    },

    async boot() {
      await AUTH.ensureDemo();
      const uid = getSession();
      if (uid && DB.state.users[uid]) {
        DB.switchAccount(uid);
        const pin = DB.state.settings.lock;
        if (pin) { AUTH.screen("lock"); AUTH.initKeypad(); return; }
        AUTH.screen("app");
        if (window.APP) APP.start();
      } else {
        if (uid) setSession(null); /* stale session: that account no longer exists */
        AUTH.screen("auth");
        AUTH.initAuthScreen();
      }
    },

    /* ================= AUTH SCREEN ================= */
    initAuthScreen() {
      if (AUTH._bound) return;
      AUTH._bound = true;
      const tabs = $("#authTabs");
      tabs.addEventListener("click", e => {
        const b = e.target.closest("button[data-tab]"); if (!b) return;
        UI.sound.click();
        tabs.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        $("#formSignin").hidden = b.dataset.tab !== "signin";
        $("#formSignup").hidden = b.dataset.tab !== "signup";
      });
      $("#authLang").addEventListener("click", e => {
        const b = e.target.closest("button[data-lang]"); if (!b) return;
        I18N.setLang(b.dataset.lang);
        $("#authLang").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        if (window.APP) APP.applyStaticLocale();
      });
      $("#formSignin").addEventListener("submit", e => {
        e.preventDefault();
        AUTH.signin(new FormData(e.target).get("who"), new FormData(e.target).get("pass"));
      });
      $("#formSignup").addEventListener("submit", e => {
        e.preventDefault();
        const f = new FormData(e.target);
        AUTH.signup({
          name: f.get("name"), username: f.get("username"),
          phone: f.get("phone"), pass: f.get("pass")
        });
      });
      $("#btnGuest").addEventListener("click", () => AUTH.guest());
      /* demo hint */
      const box = $("#authDemo");
      box.innerHTML = "<span>" + esc(t("auth.demo")) + "</span>";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "demo / wasl1234";
      btn.addEventListener("click", () => {
        $("#formSignin").who.value = "demo";
        $("#formSignin").pass.value = "wasl1234";
        AUTH.signin("demo", "wasl1234");
      });
      box.appendChild(btn);
      /* language default */
      let lang = null;
      try { lang = localStorage.getItem("wasl.lang"); } catch (e) {}
      I18N.setLang(lang || ((navigator.language || "ar").slice(0, 2) === "ar" ? "ar" : "ar"));
      const cur = I18N.lang;
      $("#authLang").querySelectorAll("button").forEach(x => x.classList.toggle("on", x.dataset.lang === cur));
      if (window.APP) APP.applyStaticLocale();
    },

    fail(where, msg) {
      const el = where === "signup" ? $("#errSignup") : $("#errSignin");
      el.textContent = msg; el.hidden = false;
      UI.sound.err();
      const card = el.closest(".auth-fields");
      card.animate([{ transform: "translateX(0)" }, { transform: "translateX(-7px)" },
        { transform: "translateX(7px)" }, { transform: "translateX(0)" }], { duration: 260 });
    },

    async signin(who, pass) {
      who = String(who || "").trim().toLowerCase();
      const acc = DB.account(who) ||
        DB.accounts().find(a => { const u = DB.user(a.userId); return u && u.phone && u.phone.replace(/\D/g, "") === String(who).replace(/\D/g, ""); });
      if (!acc) return AUTH.fail("signin", t("auth.errPass"));
      const h = await hash(pass, acc.salt);
      if (acc.hash && h !== acc.hash) { logAttempt(who, false, "bad password"); return AUTH.fail("signin", t("auth.errPass")); }
      logAttempt(who, true, "");
      await AUTH.enter(acc.userId);
    },

    async signup(data) {
      const name = String(data.name || "").trim();
      const username = String(data.username || "").trim().toLowerCase();
      if (!name) return AUTH.fail("signup", t("auth.errName"));
      if (!/^[a-z0-9_]{3,24}$/.test(username)) return AUTH.fail("signup", t("auth.errUser"));
      if (String(data.pass).length < 4) return AUTH.fail("signup", t("auth.errPassLen"));
      if (DB.account(username) || DB.users().some(u => (u.username || "").toLowerCase() === username))
        return AUTH.fail("signup", t("auth.errExists"));
      const salt = DB.uid("s");
      const userId = "u_" + username;
      const user = {
        id: userId, name, nameEn: name, username, phone: String(data.phone || "").trim(),
        emoji: ["🙂", "🚀", "🌟", "🎯", "🦅", "🌊", "🎧", "🍋"][Math.floor(Math.random() * 8)],
        bg: ["linear-gradient(135deg,#5B8CFF,#8B5CF6)", "linear-gradient(135deg,#14B8A6,#22D3EE)",
             "linear-gradient(135deg,#F59E0B,#EF4444)", "linear-gradient(135deg,#EC4899,#8B5CF6)",
             "linear-gradient(135deg,#22C55E,#0EA5E9)"][Math.floor(Math.random() * 5)],
        online: true, lastSeen: Date.now(), real: true, bio: "", bioEn: "", isNew: true
      };
      DB.addUser(user);
      DB.state.accounts.push({ user: username, name, nameEn: name, salt, hash: await hash(data.pass, salt),
        userId, createdAt: Date.now() });
      DB.save(true);
      logAttempt(username, true, "signup");
      await AUTH.enter(userId, true);
    },

    async guest() {
      const n = Math.floor(1000 + Math.random() * 9000);
      const userId = "u_guest" + n;
      const user = { id: userId, name: (I18N.lang === "en" ? "Guest " : "ضيف ") + n,
        nameEn: "Guest " + n, username: "guest" + n, phone: "", emoji: "🎈",
        bg: "linear-gradient(135deg,#64748B,#94A3B8)", online: true, lastSeen: Date.now(),
        real: true, guest: true, bio: "", bioEn: "" };
      DB.addUser(user);
      DB.state.accounts.push({ user: "guest" + n, name: user.name, nameEn: user.nameEn,
        salt: DB.uid("s"), hash: "", guest: true, userId, createdAt: Date.now() });
      DB.save(true);
      await AUTH.enter(userId, true);
    },

    async enter(userId, isNew) {
      setSession(userId);
      DB.bindWorkspace(userId);
      AUTH.screen("app");
      if (window.APP) APP.start(isNew);
    },

    async logout() {
      setSession(null);
      location.reload();
    },

    /* ================= LOCK ================= */
    lock: {
      async enable() {
        const first = await UI.prompt({ title: t("lock.set"), placeholder: "••••", max: 4, required: true });
        if (!first) return false;
        if (first.length !== 4 || !/^\d{4}$/.test(first)) { UI.toast(t("lock.set"), "err"); return false; }
        const second = await UI.prompt({ title: t("lock.confirm"), placeholder: "••••", max: 4, required: true });
        if (second !== first) { UI.toast(t("lock.mismatch"), "err"); return false; }
        DB.state.settings.lock = { hash: await hash(first, "wasl-pin"), tries: 0 };
        DB.save(true);
        UI.toast(t("lock.on"), "ok");
        return true;
      },
      async change() {
        const old = await UI.prompt({ title: t("s.pwOld"), placeholder: "••••", max: 4, required: true });
        if (!old || await hash(old, "wasl-pin") !== DB.state.settings.lock.hash) { UI.toast(t("to.oldPass"), "err"); return false; }
        DB.state.settings.lock = null;
        DB.save(true);
        return AUTH.lock.enable();
      },
      disable() {
        DB.state.settings.lock = null;
        DB.save(true);
        UI.toast(t("lock.off"), "ok");
      },
      show() { AUTH.screen("lock"); AUTH.initKeypad(); },
      async verify(pin) {
        const L = DB.state.settings.lock;
        if (!L) return true;
        return (await hash(pin, "wasl-pin")) === L.hash;
      }
    },

    initKeypad() {
      if (AUTH._pad) { AUTH.resetPad && AUTH.resetPad(); return; }
      AUTH._pad = true;
      let buf = "";
      const dots = $("#pinDots");
      const render = () => dots.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i < buf.length));
      const fail = () => {
        const L = DB.state.settings.lock;
        if (L) { L.tries = (L.tries || 0) + 1; DB.save(true); }
        dots.classList.add("err");
        UI.sound.err();
        setTimeout(() => { dots.classList.remove("err"); buf = ""; render(); }, 480);
      };
      AUTH.resetPad = () => { buf = ""; dots.classList.remove("err"); render(); };
      $("#keypad").addEventListener("click", async e => {
        const b = e.target.closest("button"); if (!b) return;
        UI.sound.click();
        if (b.dataset.act === "del") { buf = buf.slice(0, -1); render(); return; }
        if (b.dataset.act === "bio") { /* friendly bypass: guest-style unlock for demo */
          buf = "0000"; render();
          if (await AUTH.lock.verify(buf)) { AUTH.resetPad(); return AUTH.unlock(); }
          fail(); return;
        }
        if (buf.length >= 4) return;
        buf += b.textContent.trim();
        render();
        if (buf.length === 4) {
          if (await AUTH.lock.verify(buf)) { AUTH.resetPad(); return AUTH.unlock(); }
          fail();
        }
      });
      $("#lockLogout").addEventListener("click", () => AUTH.logout());
      document.addEventListener("keydown", e => {
        if ($("#lock").hidden) return;
        if (/^\d$/.test(e.key)) { const b = Array.from($("#keypad").children).find(x => x.textContent.trim() === e.key); b && b.click(); }
        if (e.key === "Backspace") { const b = $('#keypad [data-act="del"]'); b && b.click(); }
      });
    },
    async unlock() {
      UI.sound.msg();
      AUTH.screen("app");
      if (window.APP) APP.start();
    },

    /* password change (settings) */
    async changePassword(oldPw, newPw) {
      const uid = DB.state.me;
      const acc = DB.accounts().find(a => a.userId === uid);
      if (!acc) return { ok: false, reason: "none" };
      if (acc.hash && (await hash(oldPw, acc.salt)) !== acc.hash) return { ok: false, reason: "old" };
      if (String(newPw).length < 4) return { ok: false, reason: "len" };
      acc.salt = DB.uid("s");
      acc.hash = await hash(newPw, acc.salt);
      DB.save(true);
      return { ok: true };
    },

    /* delete current account */
    deleteAccount() {
      const uid = DB.state.me;
      DB.state.accounts = DB.state.accounts.filter(a => a.userId !== uid);
      delete DB.state.users[uid];
      delete DB.state.workspaces[uid];
      setSession(null);
      DB.save(true);
      location.reload();
    }
  };

  window.AUTH = AUTH;
  window.__sha256 = sha256_js;
})();
