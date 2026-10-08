/* ============================================================
   وصل | Wasl — store.js
   state · workspaces (per account) · persistence · seed · sync
   ============================================================ */
(function () {
  const K_DB = "wasl.db.v1", K_MEDIA = "wasl.media.v1";
  const CLIENT = Math.random().toString(36).slice(2, 10);
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;

  const uid = (p) => (p || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const now = () => Date.now();
  const ago = (ms) => now() - ms;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function svgPhoto(c1, c2, emoji, label) {
    const s = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
      `<rect width="640" height="420" fill="url(#g)"/>` +
      `<circle cx="530" cy="86" r="132" fill="#fff" opacity=".13"/>` +
      `<circle cx="86" cy="344" r="172" fill="#000" opacity=".12"/>` +
      `<text x="320" y="212" font-size="118" text-anchor="middle">${emoji}</text>` +
      `<text x="320" y="300" font-family="sans-serif" font-size="26" font-weight="700" fill="#fff" ` +
      `opacity=".93" text-anchor="middle">${label || ""}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  }

  /* ================= SEED: users ================= */
  function seedUsers() {
    return {
      u_sara: { id: "u_sara", name: "سارة الخطيب", nameEn: "Sara Al-Khatib", username: "sara_k",
        phone: "+963 912 345 678", emoji: "👩‍💻", bg: "linear-gradient(135deg,#FF7BAC,#FF9F6E)",
        online: true, lastSeen: now(), persona: "warm",
        bio: "مصممة واجهات · أحب القهوة والتمارين", bioEn: "UI designer · coffee & workouts" },
      u_ahmed: { id: "u_ahmed", name: "أحمد المنصور", nameEn: "Ahmed Al-Mansour", username: "ahmed_m",
        phone: "+963 933 112 233", emoji: "🧑‍🚀", bg: "linear-gradient(135deg,#5B8CFF,#22D3EE)",
        online: false, lastSeen: ago(24 * MIN), persona: "chill",
        bio: "مطوّر باك إند · مهتم بالذكاء الاصطناعي", bioEn: "Backend dev · AI enthusiast" },
      u_layla: { id: "u_layla", name: "ليلى ناصر", nameEn: "Layla Nasser", username: "layla_draws",
        phone: "+963 944 556 677", emoji: "🎨", bg: "linear-gradient(135deg,#A78BFA,#F472B6)",
        online: false, lastSeen: ago(3 * HOUR), persona: "creative",
        bio: "رسّامة رقمية · صانعة ملصقات", bioEn: "Digital artist · sticker maker" },
      u_omar: { id: "u_omar", name: "عمر الحربي", nameEn: "Omar Al-Harbi", username: "omar_dev",
        phone: "+963 955 889 900", emoji: "🧑‍🎓", bg: "linear-gradient(135deg,#34D399,#0EA5E9)",
        online: true, lastSeen: now(), persona: "techie",
        bio: "مهندس برمجيات · أحب المفاجآت التقنية", bioEn: "Software engineer · tech surprises" },
      u_nour: { id: "u_nour", name: "نور سعيد", nameEn: "Nour Saeed", username: "nour_s",
        phone: "+963 966 223 344", emoji: "🌟", bg: "linear-gradient(135deg,#FBBF24,#F97316)",
        online: false, lastSeen: ago(5 * HOUR), persona: "formal",
        bio: "مديرة مشاريع", bioEn: "Project manager" },
      u_waslai: { id: "u_waslai", name: "مساعد وصل", nameEn: "Wasl Assistant", username: "waslai",
        phone: "", emoji: "🤖", bg: "linear-gradient(135deg,#5B8CFF,#8B5CF6)", online: true,
        lastSeen: now(), bot: true, persona: "assistant",
        bio: "مساعد ذكي يعمل محلياً — بدون إنترنت", bioEn: "Smart assistant running locally — no internet" }
    };
  }

  function demoUser() {
    return { id: "u_me", name: "مستخدم تجريبي", nameEn: "Demo User", username: "demo",
      phone: "+963 900 000 000", emoji: "🧑‍💻", bg: "linear-gradient(135deg,#6366F1,#0EA5E9)",
      online: true, lastSeen: now(), real: true, bio: "حساب تجريبي لتجربة وصل", bioEn: "Demo account for trying Wasl" };
  }

  function seedAccounts() {
    /* seedPw is hashed to SHA-256 by AUTH on first boot */
    return [{ user: "demo", name: "مستخدم تجريبي", nameEn: "Demo User", salt: "d3m0s@lt-wasl",
      seedPw: "wasl1234", hash: "", userId: "u_me", createdAt: ago(30 * DAY) }];
  }

  /* ================= SEED: workspace template ================= */
  function seedFolders() {
    return [
      { id: "all", name: "الكل", nameEn: "All", emoji: "✨", builtin: true },
      { id: "personal", name: "خاص", nameEn: "Personal", emoji: "💬", builtin: true, types: ["private"] },
      { id: "groups", name: "مجموعات", nameEn: "Groups", emoji: "👥", builtin: true, types: ["group"] },
      { id: "channels", name: "قنوات", nameEn: "Channels", emoji: "📢", builtin: true, types: ["channel"] },
      { id: "bots", name: "روبوتات", nameEn: "Bots", emoji: "🤖", builtin: true, types: ["bot"] }
    ];
  }

  function m(from, text, ts, extra) {
    return Object.assign({ id: uid("m"), from, type: "text", text, ts }, extra || {});
  }

  function seedChats() {
    return [
      { id: "c_sara", type: "private", user: "u_sara", members: ["u_me", "u_sara"], pinned: true, unread: 2, folder: "personal" },
      { id: "c_ai", type: "bot", user: "u_waslai", members: ["u_me", "u_waslai"], pinned: true, unread: 0, folder: "bots" },
      { id: "c_team", type: "group", title: "فريق وصل", titleEn: "Wasl Team", emoji: "🚀",
        bg: "linear-gradient(135deg,#5B8CFF,#22D3EE)", members: ["u_me", "u_sara", "u_ahmed", "u_omar", "u_nour"],
        admins: ["u_me", "u_nour"], about: "فريق بناء وصل — تصميم وتطوير 🛠️", aboutEn: "Wasl team — design & build 🛠️",
        unread: 0, folder: "groups" },
      { id: "c_fantasy", type: "group", title: "دوري الفانتسي ⚽", titleEn: "Fantasy League ⚽", emoji: "⚽",
        bg: "linear-gradient(135deg,#34D399,#10B981)", members: ["u_me", "u_sara", "u_ahmed", "u_omar", "u_nour"],
        admins: ["u_nour"], about: "منافسة سنوية — التشكيلة تُغلق الجمعة", aboutEn: "Annual competition — lineups lock Friday",
        unread: 7, folder: "groups" },
      { id: "c_tech", type: "channel", title: "تقنية بالعربي", titleEn: "Tech in Arabic", emoji: "🚀",
        bg: "linear-gradient(135deg,#8B5CF6,#EC4899)", members: ["u_me"], subscribers: 12480, unread: 3,
        about: "أخبار التقنية والذكاء الاصطناعي يومياً 📡", aboutEn: "Daily tech & AI news 📡", folder: "channels" },
      { id: "c_tips", type: "channel", title: "إلهام يومي", titleEn: "Daily Spark", emoji: "🌅",
        bg: "linear-gradient(135deg,#F59E0B,#EF4444)", members: ["u_me"], subscribers: 8421, muted: true,
        unread: 0, about: "فكرة واحدة كل صباح ☀️", aboutEn: "One idea every morning ☀️", folder: "channels" },
      { id: "c_ahmed", type: "private", user: "u_ahmed", members: ["u_me", "u_ahmed"], unread: 0, folder: "personal" },
      { id: "c_layla", type: "private", user: "u_layla", members: ["u_me", "u_layla"], muted: true, unread: 0, folder: "personal" },
      { id: "c_omar", type: "private", user: "u_omar", members: ["u_me", "u_omar"], unread: 0, folder: "personal" },
      { id: "c_saved", type: "saved", members: ["u_me"], pinned: true, unread: 0, folder: "personal" }
    ];
  }

  function seedMessages() {
    const M = {};

    M.c_sara = [
      m("u_sara", "صباح الخير يا موحي ☀️ جهّزت القهوة؟", ago(DAY + 2 * HOUR), { tr: "Good morning ☀️ did you make the coffee?" }),
      m("u_me", "صباح النور! على النار حالياً ☕", ago(DAY + 1.9 * HOUR), { tr: "Good morning! It's brewing right now ☕" }),
      m("u_sara", "تذكّر إن عندنا اجتماع الساعة 11", ago(DAY + 1.5 * HOUR)),
      m("u_me", "أكيد، جهّزت العرض من أمس 👌", ago(DAY + 1.4 * HOUR)),
      m("u_sara", "ممتاز 👏", ago(DAY + 1.3 * HOUR)),
      m("u_sara", "وين وصلت بتصميم الصفحة الجديدة؟", ago(6 * HOUR), { tr: "How far are you with the new page design?" }),
      m("u_me", "خلّصت الهيكل، باقي الألوان والحركة ✨", ago(5.8 * HOUR)),
      m("u_sara", "أرسل لي لقطة لما تجهز", ago(5.6 * HOUR)),
      m("u_me", "تمام 👍", ago(5.5 * HOUR)),
      m("u_sara", "إيه رأيك نضيف وضع ليلي للتطبيق؟", ago(90 * MIN)),
      m("u_me", "أصلاً فيه **13 ثيمات** 😄 جرّبي ثيم *Golden* أو *Coffee*", ago(86 * MIN),
        { tr: "There are actually **13 themes** 😄 try *Golden* or *Coffee*" }),
      m("u_sara", "واو! وين خيار اللغة؟", ago(80 * MIN)),
      m("u_me", "زر 🌐 في الشريط السفلي — عربي/إنجليزي مع اتجاه تلقائي", ago(76 * MIN),
        { tr: "The 🌐 button in the bottom bar — Arabic/English with automatic direction" }),
      m("u_sara", "احسّنت 👌 لنجرّبه الآن", ago(70 * MIN)),
      m("u_sara", "أرسلت لك ملف التصاميم الجديد 📎", ago(22 * MIN),
        { type: "file", name: "wasl-ui-kit.fig", size: 4820000 }),
      m("u_sara", "شوفه وقل لي رأيك 👀", ago(20 * MIN), { tr: "Take a look and tell me what you think 👀" })
    ];

    M.c_team = [
      m("u_omar", "صباح الخير الفريق 👋", ago(DAY + 4 * HOUR)),
      m("u_ahmed", "صباح النور، جاهز للاجتماع؟", ago(DAY + 3.9 * HOUR)),
      m("u_omar", "جاهز 100%", ago(DAY + 3.8 * HOUR)),
      m("u_nour", "تذكير: التسليم النهائي بعد 3 أيام ⏰", ago(DAY + 2 * HOUR),
        { tr: "Reminder: final delivery in 3 days ⏰" }),
      m("u_sara", "", ago(7 * HOUR), {
        type: "poll", poll: { q: "متى نطلق النسخة التجريبية؟", multi: false, anon: true,
          opts: [{ t: "الأسبوع القادم", v: 3, voted: [] }, { t: "بعد أسبوعين", v: 1, voted: [] },
                 { t: "نحتاج وقتاً أكثر", v: 0, voted: [] }] }
      }),
      m("u_me", "أصوّت للأسبوع القادم 👍", ago(6.9 * HOUR)),
      m("u_omar", "الآن أعرف لماذا كانت الخدمة بطيئة أمس 😅", ago(3 * HOUR)),
      m("u_ahmed", "تم إصلاحها — أضفت **ذاكرة مؤقتة** للطلبات", ago(2.9 * HOUR),
        { tr: "Fixed it — I added a **cache** for requests" }),
      m("u_nour", "ممتاز، وثّقها في الـ wiki من فضلك", ago(2.8 * HOUR)),
      m("u_sara", "", ago(40 * MIN), { type: "image", src: svgPhoto("#8B5CF6", "#EC4899", "🎨", "Wasl UI — v2.4"),
        caption: "الواجهة الجديدة بثيم بنفسجي ✨" }),
      m("u_omar", "تحفّ يا سارة 🔥🔥", ago(35 * MIN)),
      m("u_me", "جميلة جداً! خصوصاً تدرّج الأزرار", ago(30 * MIN))
    ];

    M.c_ai = [
      m("u_waslai", "أهلاً بك 👋 أنا **مساعد وصل** — أعمل بالكامل داخل جهازك بلا إنترنت.", ago(2 * DAY),
        { tr: "Hello 👋 I'm the **Wasl assistant** — I run entirely on your device, no internet." }),
      m("u_waslai", "جرّب مثلاً:\n• `2+2*8` → أحسب لك الناتج\n• `نكتة` أو `joke` → أضحكك\n• `الوقت` أو `time` → أخبرك بالساعة\n• `/help` → قائمة الأوامر كاملة", ago(2 * DAY - MIN)),
      m("u_me", "نكتة", ago(DAY)),
      m("u_waslai", "قال مبرمج لحاسوبه: لماذا لا تنام؟ قال: عندي **bug** في الحلم 🐛 أحسّني أن ألغي النوم… فاستيقظ الحاسوب متعباً!", ago(DAY - MIN)),
      m("u_me", "2+2*8", ago(5 * HOUR)),
      m("u_waslai", "`2 + 2 × 8 = 18` 🧮 — الأولوية للضرب أولاً.", ago(5 * HOUR - MIN)),
      m("u_waslai", "أستطيع أيضاً تحويل أي رسالة إلى **قائمة مهام** ✅ — اختر «قائمة مهام» من زر الإرفاق 📎.", ago(4 * HOUR))
    ];

    M.c_tech = [
      m("u_waslai", "📢 **إطلاق وصل 1.0** — تطبيق دردشة يعمل بلا خادم، 13 ثيمات، ومساعد ذكي مدمج.",
        ago(DAY + 6 * HOUR), { views: 12430 }),
      m("u_waslai", "🔥 5 أسباب تجعل المتصفح أسرع من التطبيقات الأصلية:\n1. لا تحديثات\n2. لا تثبيت\n3. لا حسابات سحابية\n4. فتح فوري\n5. بياناتك لا تخرج من جهازك",
        ago(8 * HOUR), { views: 9820 }),
      m("u_waslai", "💡 هل تعلم؟ الضغط على `Ctrl + K` يفتح البحث الشامل في وصل — جرّبه الآن.",
        ago(3 * HOUR), { views: 7611 }),
      m("u_waslai", "🎨 ثيم جديد: *Mint Light* — خفيف ومريح للعين نهاراً.", ago(45 * MIN), { views: 3120 })
    ];

    M.c_ahmed = [
      m("u_ahmed", "يا عم تفشل 😂", ago(DAY)),
      m("u_me", "هههههه شو صار؟", ago(DAY - MIN)),
      m("u_ahmed", "السيرفر وقع وأنا أشرب قهوة… يعني الذنب قهوة ☕", ago(DAY - 2 * MIN)),
      m("u_me", "سبب وراء كل مشكلة 😄", ago(DAY - 3 * MIN)),
      m("u_ahmed", "بعدين، جربت «التدمير الذاتي» بالتطبيق الجديد؟", ago(4 * HOUR)),
      m("u_me", "إيه، سخّنها من قائمة الرسالة 🔥", ago(3.9 * HOUR)),
      m("u_ahmed", "خطر… أول ما أرسلها لزوجتي 💀", ago(3.8 * HOUR))
    ];

    M.c_fantasy = [
      m("u_nour", "⚽ انطّلقت الجولة! التشكيلة تُغلق مساء الجمعة", ago(DAY)),
      m("u_omar", "خلّصت التشكيلة، مافي لاعبين مصابين الحمد لله", ago(DAY - 30 * MIN)),
      m("u_ahmed", "أنا رفعت الكابتن لـ *صلاح* 🔥", ago(6 * HOUR)),
      m("u_sara", "مين فيكم متابع مباريات الليلة؟ 📺", ago(2 * HOUR)),
      m("u_me", "أنا! بس لازم أخلص شغلي الأول 😅", ago(110 * MIN)),
      m("u_omar", "التقييم عندي 54.2 — أحسنتوا 👏", ago(30 * MIN)),
      m("u_nour", "😂😂😂", ago(28 * MIN)),
      m("u_ahmed", "انتظروا… نسيت أغيّر قائد الفريق 💀", ago(25 * MIN)),
      m("u_sara", "ههههههههه 💀💀", ago(24 * MIN)),
      m("u_omar", "حظ أوفر في الجولة القادمة 🍀", ago(20 * MIN)),
      m("u_nour", "منافسة شرسة هالسنة ⚡", ago(18 * MIN))
    ];

    M.c_layla = [
      m("u_layla", "بدّك أحطّها ضمن حزمة *Midnight*؟", ago(2 * DAY)),
      m("u_me", "أكيد! رهيبة 😍", ago(2 * DAY - 12 * MIN)),
      m("u_layla", "أرسلت لك 3 ملصقات جديدة 🐈", ago(DAY)),
      m("u_me", "واو! أحلاها القطة 😻", ago(DAY - 10 * MIN)),
      { id: uid("m"), from: "u_layla", type: "sticker", text: "😻", ts: ago(5 * HOUR) }
    ];

    M.c_tips = [
      m("u_waslai", "🌅 ابدأ يومك بـ 3 أسطر: اكتب 3 أشياء تشكرها عليها اليوم.", ago(DAY + 3 * HOUR), { views: 5420 }),
      m("u_waslai", "🧠 قاعدة دقيقتين: إن كان العمل يستغرق أقل من دقيقتين — افعله الآن.", ago(9 * HOUR), { views: 4310 }),
      m("u_waslai", "📵 خصّص ساعة بلا إشعارات… ستدهشك النتيجة.", ago(4 * HOUR), { views: 3877 })
    ];

    M.c_omar = []; /* محادثة فارغة لعرض الحالة الفارغة */
    M.c_saved = [
      { id: uid("m"), from: "u_me", type: "task", ts: ago(DAY - 40 * MIN), task: {
        title: "مهام اليوم", items: [
          { t: "مراجعة تصميم الواجهة", done: true },
          { t: "الردّ على رسائل الفريق", done: true },
          { t: "تجربة الثيمات الجديدة", done: false },
          { t: "تصدير نسخة احتياطية", done: false }] } },
      m("u_me", "💡 فكرة: إضافة اختصار `Ctrl + L` لقفل التطبيق", ago(DAY - 90 * MIN)),
      m("u_me", "🔐 رمز استعادة: `WL-2026-DEMO` (احفظه في مكان آمن)", ago(3 * DAY))
    ];
    return M;
  }

  function seedStories() {
    return [
      { id: uid("st"), user: "u_sara", ts: ago(2 * HOUR), seen: false,
        items: [{ bg: "linear-gradient(135deg,#FF7BAC,#FF9F6E)", emoji: "☕", text: "قهوة الصباح = أفكار أفضل" }] },
      { id: uid("st"), user: "u_omar", ts: ago(5 * HOUR), seen: false,
        items: [{ bg: "linear-gradient(135deg,#34D399,#0EA5E9)", emoji: "🚀", text: "نشرنا الإصدار الجديد!" }] },
      { id: uid("st"), user: "u_layla", ts: ago(9 * HOUR), seen: false,
        items: [{ bg: "linear-gradient(135deg,#A78BFA,#F472B6)", emoji: "🎨", text: "ملصقات منتصف الليل قريبًا" }] },
      { id: uid("st"), user: "u_ahmed", ts: ago(DAY + 3 * HOUR), seen: true,
        items: [{ bg: "linear-gradient(135deg,#5B8CFF,#22D3EE)", emoji: "🐛", text: "السيرفر عاد… للتو 😅" }] }
    ];
  }

  function buildWorkspace(userId) {
    const ws = { chats: seedChats(), messages: seedMessages(), drafts: {}, stories: seedStories(),
      folders: seedFolders(), active: null };
    ws.chats.forEach(c => {
      if (c.members) c.members = c.members.map(x => x === "u_me" ? userId : x);
      if (c.admins) c.admins = c.admins.map(x => x === "u_me" ? userId : x);
      c.owner = userId;
    });
    Object.keys(ws.messages).forEach(k => {
      ws.messages[k].forEach(msg => { if (msg.from === "u_me") msg.from = userId; });
    });
    return ws;
  }

  function defaultState() {
    return {
      v: 2, createdAt: now(), me: null,
      users: Object.assign(seedUsers(), { u_me: demoUser() }),
      accounts: seedAccounts(),
      workspaces: {},
      settings: {
        theme: "aurora", accent: "blue", wallpaper: "pattern", fontScale: 100, spacing: "comfy",
        anim: true, sound: true, preview: true, notifyAll: false, typing: true, receipts: true,
        lastSeen: "everyone", forward: "everyone", lock: null, currentFolder: "all"
      },
      stats: { sent: 0 }
    };
  }

  /* ================= persistence ================= */
  let state = null, media = {}, saveTimer = null;
  const listeners = {};

  const DB = {
    CLIENT, uid, now, svgPhoto, MIN, HOUR, DAY,
    get state() { return state; },
    get media() { return media; },

    load() {
      let raw = null;
      try { raw = localStorage.getItem(K_DB); } catch (e) { raw = null; }
      let parsed = null, corrupt = false;
      if (raw) {
        try { parsed = JSON.parse(raw); } catch (e) { corrupt = true; }
        if (parsed && parsed.v !== 2) corrupt = true;
      }
      /* never silently destroy data: keep the unreadable copy aside */
      if (corrupt && raw) {
        try {
          localStorage.setItem(K_DB + ".bak", JSON.stringify({ at: now(), raw: raw.slice(0, 2000000) }));
          console.warn("[wasl] unreadable database backed up to " + K_DB + ".bak");
        } catch (e) { /* backup is best-effort */ }
      }
      state = parsed && !corrupt ? parsed : null;
      if (!state) state = defaultState();
      const d = defaultState();
      ["users", "accounts", "workspaces", "settings"].forEach(k => { if (state[k] == null) state[k] = d[k]; });
      state.settings = Object.assign({}, d.settings, state.settings);
      try { media = JSON.parse(localStorage.getItem(K_MEDIA) || "{}"); } catch (e) { media = {}; }
      return state;
    },

    save(immediate) {
      clearTimeout(saveTimer);
      const write = () => { try { localStorage.setItem(K_DB, JSON.stringify(state)); } catch (e) { DB.emit("quota"); } };
      if (immediate) write(); else saveTimer = setTimeout(write, 220);
    },

    saveMedia() {
      try { localStorage.setItem(K_MEDIA, JSON.stringify(media)); return true; }
      catch (e) {
        const keys = Object.keys(media);
        if (keys.length > 6) {
          keys.slice(0, Math.ceil(keys.length / 3)).forEach(k => delete media[k]);
          try { localStorage.setItem(K_MEDIA, JSON.stringify(media)); return true; } catch (e2) {}
        }
        DB.emit("quota");
        return false;
      }
    },

    resetAll(keepLang) {
      const lang = keepLang ? localStorage.getItem("wasl.lang") : null;
      try { localStorage.removeItem(K_DB); localStorage.removeItem(K_MEDIA); } catch (e) {}
      if (lang) localStorage.setItem("wasl.lang", lang);
      location.reload();
    },

    /* ---------- events ---------- */
    on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return fn; },
    off(evt, fn) { const a = listeners[evt]; if (a) { const i = a.indexOf(fn); if (i > -1) a.splice(i, 1); } },
    emit(evt, data) { (listeners[evt] || []).slice().forEach(fn => { try { fn(data); } catch (e) { console.error("[wasl]", e); } }); },

    /* ---------- identity ---------- */
    me() { return (state.me && state.users[state.me]) || null; },
    user(id) { return state.users[id] || null; },
    users() { return Object.values(state.users); },
    accounts() { return state.accounts || []; },
    account(u) { return state.accounts.find(a => a.user === u) || null; },
    realAccounts() {
      return state.accounts.map(a => ({ acc: a, user: state.users[a.userId] }))
        .filter(x => x.user && x.user.id !== state.me);
    },
    /** create / fetch the per-account workspace (binds the demo history to this identity) */
    bindWorkspace(userId) {
      if (!state.workspaces[userId]) state.workspaces[userId] = buildWorkspace(userId);
      state.me = userId;
      if (state.users[userId]) { state.users[userId].online = true; state.users[userId].lastSeen = now(); }
      DB.save(true);
      return state.workspaces[userId];
    },
    switchAccount(userId) {
      if (!state.users[userId]) return false;
      state.me = userId;
      if (!state.workspaces[userId]) state.workspaces[userId] = buildWorkspace(userId);
      state.users[userId].online = true;
      state.users[userId].lastSeen = now();
      DB.save(true);
      return true;
    },
    addUser(user) { state.users[user.id] = user; DB.save(); return user; },

    /* ---------- workspace shortcuts ---------- */
    ws() {
      if (!state.me) return { chats: [], messages: {}, drafts: {}, stories: [], folders: [], active: null };
      if (!state.workspaces[state.me]) state.workspaces[state.me] = buildWorkspace(state.me);
      return state.workspaces[state.me];
    },
    chats() { return DB.ws().chats; },
    chat(id) { return DB.chats().find(c => c.id === id) || null; },
    msgs(chatId) { const ws = DB.ws(); return (ws.messages[chatId] = ws.messages[chatId] || []); },
    lastMsg(chatId) { const a = DB.msgs(chatId); return a.length ? a[a.length - 1] : null; },
    drafts() { return DB.ws().drafts; },
    stories() { return DB.ws().stories; },
    folders() { return DB.ws().folders; },
    chatOfUser(userId) {
      return DB.chats().find(c => (c.type === "private" || c.type === "bot") && c.user === userId) || null;
    },
    personas() { return Object.values(state.users).filter(u => u.persona); },
    isOnline(id) {
      const u = state.users[id];
      if (!u) return false;
      if (id === state.me) return true;
      return DB.sync.online(id) || (u.online === true && !u.persona ? false : !!u.persona && u.online === true);
    },

    chatTitle(c) {
      if (!c) return "";
      if (c.type === "saved") return I18N.lang === "en" ? "Saved Messages" : "الرسائل المحفوظة";
      if (c.nickname) return c.nickname;
      if (c.type === "private" || c.type === "bot") {
        const u = DB.user(c.user);
        if (!u) return c.title || "";
        return (I18N.lang === "en" ? (u.nameEn || u.name) : u.name) || u.name;
      }
      return (I18N.lang === "en" ? (c.titleEn || c.title) : c.title) || c.title || "";
    },

    chatAvatar(c) {
      if (!c) return {};
      if (c.type === "private" || c.type === "bot") {
        const u = DB.user(c.user) || {};
        return { emoji: u.emoji || "🙂", bg: u.bg, user: u };
      }
      return { emoji: c.emoji || (c.type === "group" ? "👥" : "📢"),
        bg: c.bg || "linear-gradient(135deg,#5B8CFF,#8B5CF6)" };
    },

    memberName(id) {
      const u = DB.user(id);
      if (!u) return id;
      if (id === state.me) return I18N.lang === "en" ? "You" : "أنت";
      return (I18N.lang === "en" ? (u.nameEn || u.name) : u.name) || u.name;
    },

    /* ---------- mutations ---------- */
    addMsg(chatId, msg, opts) {
      const arr = DB.msgs(chatId);
      msg.id = msg.id || uid("m");
      msg.ts = msg.ts || now();
      arr.push(msg);
      const c = DB.chat(chatId);
      if (c) c.ts = msg.ts;
      if (msg.from === state.me) state.stats.sent++;
      DB.save(); DB.sync.send("db");
      DB.emit("msg", { chatId, msg });
      /* deliver to other real accounts in this chat (live cross-tab DMs) */
      if (!opts || opts.route !== false) DB.route(chatId, msg);
      return msg;
    },
    /** push a copy of `msg` into every other real account's workspace (via BroadcastChannel) */
    route(chatId, msg) {
      const c = DB.chat(chatId);
      if (!c) return;
      const targets = (c.members || []).filter(id => id !== state.me &&
        state.accounts.some(a => a.userId === id));
      targets.forEach(id => DB.sync.send("dm", { to: id, chatId, msg: clone(msg), chat: clone(c) }));
    },
    /** called when another account DMs me from another tab */
    receiveDM(data) {
      if (!data || data.to !== state.me) return;
      const ws = DB.ws();
      let chat = DB.chat(data.chatId);
      if (!chat) {
        const other = data.chat.user === state.me ? data.msg.from : data.chat.user;
        chat = Object.assign({}, data.chat, {
          id: data.chatId, user: other, owner: state.me, members: Array.from(new Set(
            (data.chat.members || []).concat([state.me, other]))), unread: 0, ts: data.msg.ts
        });
        delete chat.nickname;
        ws.chats.unshift(chat);
        ws.messages[chat.id] = ws.messages[chat.id] || [];
      }
      if (!ws.messages[data.chatId]) ws.messages[data.chatId] = [];
      if (ws.messages[data.chatId].some(x => x.id === data.msg.id)) return;
      ws.messages[data.chatId].push(data.msg);
      chat.ts = data.msg.ts;
      if (state.settings.activeChat !== data.chatId) chat.unread = (chat.unread || 0) + 1;
      DB.save(); DB.emit("msg", { chatId: data.chatId, msg: data.msg, incoming: true });
    },
    patchMsg(chatId, id, patch) {
      const a = DB.msgs(chatId); const i = a.findIndex(x => x.id === id);
      if (i < 0) return null;
      a[i] = Object.assign({}, a[i], patch);
      DB.save(); DB.sync.send("db");
      DB.emit("msg:update", { chatId, msg: a[i] });
      return a[i];
    },
    delMsg(chatId, id) {
      const a = DB.msgs(chatId); const i = a.findIndex(x => x.id === id);
      if (i < 0) return;
      const [rm] = a.splice(i, 1);
      if (rm && rm.mediaId) DB.media.del(rm.mediaId);
      DB.save(); DB.sync.send("db");
      DB.emit("msg:del", { chatId, id });
    },
    clearChat(chatId) {
      DB.msgs(chatId).forEach(rm => { if (rm.mediaId) DB.media.del(rm.mediaId); });
      DB.ws().messages[chatId] = [];
      DB.save(); DB.sync.send("db");
      DB.emit("chat:clear", chatId);
    },
    removeChat(chatId) {
      const ws = DB.ws();
      DB.msgs(chatId).forEach(rm => { if (rm.mediaId) DB.media.del(rm.mediaId); });
      ws.chats = ws.chats.filter(c => c.id !== chatId);
      delete ws.messages[chatId];
      DB.save(); DB.sync.send("db");
      DB.emit("chats:changed", chatId);
    },
    createChat(partial) {
      const c = Object.assign({ id: uid("c"), unread: 0, ts: now(), owner: state.me }, partial);
      DB.chats().unshift(c);
      DB.ws().messages[c.id] = DB.ws().messages[c.id] || [];
      DB.save(); DB.sync.send("db");
      DB.emit("chats:changed", c.id);
      return c;
    },
    /** deterministic id so both sides of a 1:1 chat see the same record */
    dmIdWith(userId) { return "c_dm_" + [state.me, userId].sort().join("_"); },
    openDM(userId) {
      const existing = DB.chatOfUser(userId);
      if (existing) return existing;
      return DB.createChat({ id: DB.dmIdWith(userId), type: "private", user: userId,
        members: [state.me, userId], folder: "personal" });
    },

    /* ---------- media ---------- */
    media: {
      put(dataUrl) { const id = uid("md"); media[id] = dataUrl; DB.saveMedia(); return id; },
      get(id) { return media[id] || null; },
      del(id) { if (media[id]) { delete media[id]; DB.saveMedia(); } },
      bytes() { try { return (localStorage.getItem(K_MEDIA) || "").length; } catch (e) { return 0; } },
      count() { return Object.keys(media).length; }
    },

    /* ---------- backup ---------- */
    exportBackup() {
      const blob = new Blob([JSON.stringify({ app: "wasl", v: 2, at: now(), state, media })],
        { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "wasl-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
    importBackup(file, cb) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (data.app !== "wasl" || !data.state) throw new Error("bad");
          state = data.state; media = data.media || {};
          DB.save(true); DB.saveMedia();
          cb && cb(true);
          setTimeout(() => location.reload(), 600);
        } catch (e) { cb && cb(false); }
      };
      r.readAsText(file);
    },

    /* ---------- cross-tab sync ---------- */
    sync: {
      bc: null, presence: {}, typing: {},
      init() {
        try {
          DB.sync.bc = new BroadcastChannel("wasl.sync");
          DB.sync.bc.onmessage = e => DB.sync.recv(e.data);
        } catch (e) { DB.sync.bc = null; }
        window.addEventListener("storage", e => {
          if (e.key === K_DB && e.newValue) {
            try {
              const incoming = JSON.parse(e.newValue);
              if (incoming && incoming.v === 2) { state = incoming; DB.emit("db:remote"); }
            } catch (err) {}
          }
        });
        const beat = () => { DB.sync.send("hello", { user: state.me, at: now() }); DB.sync.prune(); };
        setInterval(beat, 3500); beat();
        window.addEventListener("beforeunload", () => DB.sync.send("bye", { user: state.me }));
      },
      send(type, data) {
        if (!DB.sync.bc) return;
        try { DB.sync.bc.postMessage({ type, data, from: CLIENT, user: state.me, at: now() }); } catch (e) {}
      },
      recv(msg) {
        if (!msg || msg.from === CLIENT) return;
        switch (msg.type) {
          case "hello": DB.sync.presence[msg.user] = msg.at; DB.emit("presence", msg.user); break;
          case "bye": delete DB.sync.presence[msg.user]; DB.emit("presence", msg.user); break;
          case "db": DB.emit("db:remote"); break;
          case "dm": DB.receiveDM(msg.data); break;
          case "typing":
            DB.sync.typing[msg.data.chatId + ":" + msg.user] = now() + 4200;
            DB.emit("typing", msg.data); break;
          case "call": DB.emit("call", msg.data); break;
        }
      },
      prune() {
        const cut = now() - 11000; let changed = false;
        for (const k in DB.sync.presence) if (DB.sync.presence[k] < cut) { delete DB.sync.presence[k]; changed = true; }
        if (changed) DB.emit("presence");
      },
      online(userId) { return !!DB.sync.presence[userId]; },
      typingIn(chatId) {
        const t = now();
        return Object.keys(DB.sync.typing).some(k =>
          k.indexOf(chatId + ":") === 0 && k !== chatId + ":" + state.me && DB.sync.typing[k] > t);
      },
      amTyping(chatId) { DB.sync.send("typing", { chatId }); }
    },

    stats() {
      const ws = state.me ? DB.ws() : { chats: [], messages: {} };
      let msgs = 0;
      for (const k in ws.messages) msgs += ws.messages[k].length;
      return { chats: ws.chats.length, msgs, media: DB.media.count(), storage: DB.media.bytes(),
        themes: (window.UI && UI.THEMES && UI.THEMES.length) || 10 };
    },
    unreadTotal() {
      return DB.chats().reduce((s, c) => s + (c.muted ? 0 : (c.unread || 0)), 0);
    }
  };

  window.DB = DB;
})();
