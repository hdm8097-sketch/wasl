/* ============================================================
   وصل | Wasl — bot.js  (local assistant + persona auto-replies)
   Everything runs offline with rules — no network, no API keys.
   ============================================================ */
(function () {
  const AR = /[\u0600-\u06FF]/;
  const isAr = (s) => AR.test(String(s || ""));

  /* ---------------- content banks ---------------- */
  const JOKES = {
    ar: [
      "قال مبرمج لحاسوبه: لماذا لا تنام؟ قال: عندي **bug** في الحلم 🐛",
      "أشهر ثلاث جمل عند المصمّم: «جرّب نسخة أخرى»، «المسافة أ صغيرة»، و«خلّه بسيط» 😅",
      "لماذا لا تتحاور المصفوفات؟ لأن كل واحدة منها تعيش في **صفّ** مختلف 💀",
      "عملية غسيل الملابس: `tumble dry low` — وحتى الحاسوب يعرف أنه لا يُكوي 👕",
      "شريت كيبورد بلا حروف… صار عندي **mechanical keyboard** 🔇",
      "أرسلت للطباعة فظهرت لي: «هل أنت متأكد إنك تريد ذلك؟» — حتى الطابعة تشكّ بي 🖨️"
    ],
    en: [
      "Why do programmers prefer dark mode? Because light attracts bugs 🐛",
      "A SQL query walks into a bar, approaches two tables and asks: “may I join you?” 🍺",
      "I told my computer I needed a break… it said “no problem, I'll go to sleep” 💤",
      "There are 10 kinds of people: those who understand binary and those who don't 💀",
      "My code doesn't work, I don't know why. My code works, I don't know why either 🤷"
    ]
  };
  const REPLIES = {
    warm: {
      ar: ["أهااممم… وين كنت فيه طول الوقت 😄", "طيب وليش ما قلتّها من أول؟ 😅", "عن جد؟ طيب كمّل 🌟",
        "أنا معاك، بس ركّز شوي على التفاصيل 😉", "حلو! عطيني ثانية وأشوف 🕐",
        "تمام 👌 أرسل لي اللينك لما تجهز", "هههههههههه 😂😂", "طيب وش رأيك نأجّلها لبعد القهوة؟ ☕"],
      en: ["Hmm… where have you been all this time 😄", "Why didn't you say that earlier 😅",
        "Really? Go on 🌟", "I'm with you, just mind the details 😉", "Nice! Give me a sec 🕐",
        "Sure 👌 send me the link when it's ready", "Hahahaha 😂😂", "How about we postpone it after coffee? ☕"]
    },
    chill: {
      ar: ["أوكِ 👌", "تمام، أنا بحلّها لا تقلق", "ههههههه تبلى عليك 😂", "خلاص صار عندي خبرة بالضبط هيك 😅",
        "بعدين أحكيلك… عندي شغّة ضايعة 🔧", "برافو 👏 من جد", "أنا قلت من زمان ولا حدا صدّقني 😜"],
      en: ["Ok 👌", "Sure, I'll handle it don't worry", "Hahaha you're funny 😂", "I literally predicted that 😅",
        "Tell you later… I lost a task 🔧", "Bravo 👏 seriously", "I said it long ago and nobody believed me 😜"]
    },
    creative: {
      ar: ["أحبّها! ممكن نجرّب تدرّج ألوان أقوى؟ 🎨", "البساطة تغلب دائماً ✨", "خلّني أسكتش وشوف 👀",
        "اللون هذا يحتاج شوي توازن مع الخلفية 🖌️", "أحسّ الـ **vibe** صح! وين أرسل لك النسخة؟", "تمام، أعدّلها وأرجعلك 🕐"],
      en: ["Love it! Maybe try a stronger gradient? 🎨", "Simplicity always wins ✨", "Let me sketch it first 👀",
        "That colour needs balancing with the background 🖌️", "The **vibe** is right! Where do I send it?",
        "Sure, I'll tweak it and get back 🕐"]
    },
    techie: {
      ar: ["أها، عشان هيك كان الأداء بطيء 🐌", "أضيفها TODO وأنا بالغدا 😄", "الحل بسيط: نخزّنها بالـ cache",
        "أجربها على **branch** جديد وأخبرك", "هذا معروف، بس الحدث نفسه نادر 😅", "أكيد — أبعت لي الـ stack trace 🔍"],
      en: ["Ah, that explains the slow performance 🐌", "I'll add it to the TODO over lunch 😄",
        "Simple fix: cache it", "I'll try it on a new **branch** and let you know",
        "That's known, but the event itself is rare 😅", "Sure — send me the stack trace 🔍"]
    },
    formal: {
      ar: ["تمام، سنعتمد ذلك.", "شكراً على التوضيح 👍", "نحتاج نوثّق ذلك قبل التنفيذ.", "سأتابع معك قبل نهاية اليوم.",
        "ملاحظة صحيحة — نعتمد التعديل.", "حسناً، سأجهّز الملخص وأرسله."],
      en: ["Noted, we'll go with that.", "Thanks for clarifying 👍", "We should document that first.",
        "I'll follow up with you before end of day.", "Good point — we'll adopt the change.",
        "Alright, I'll prepare the summary and send it."]
    },
    assistant: {
      ar: ["تمام 👌 كيف أقدر أساعدك أكثر؟", "جاهز — اكتب `/help` لقائمة الأوامر.", "تمّ التنفيذ ✅",
        "هل تريد أن أحوّلها إلى **قائمة مهام**؟", "أستطيع حسابها، كتابة نكتة، أو إخبارك بالوقت 🙂"],
      en: ["Sure 👌 How else can I help?", "Ready — type `/help` for the command list.", "Done ✅",
        "Want me to turn this into a **task list**?", "I can calculate it, tell a joke, or check the time 🙂"]
    }
  };
  const GREET = {
    ar: ["أهلاً وسهلاً 👋", "هلا والله 😄 كيفك؟", "صباح/مساء الخير 🌤️", "أهلاً! زمان ما تكلمنا 😄"],
    en: ["Hello there! 👋", "Hey! How are you?", "Hi 🌤️", "Long time no see!"]
  };
  const BYE = { ar: ["مع السلامة 👋", "باي باي 😄", "تبّاير 👌", "خلي بالك من نفسك 🌟"],
                en: ["Goodbye 👋", "Bye bye 😄", "Take care 👌", "See you 🌟"] };
  const THANKS = { ar: ["العفو 🌸", "ولا يهمك 😄", "دوم 🙏", "أي وقت!"],
                   en: ["You're welcome 🌸", "No worries 😄", "Anytime 🙏", "Happy to help"] };

  /* ---------------- tiny helpers ---------------- */
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function safeMath(expr) {
    if (!/^[\d\s+\-*/().,%^]+$/.test(expr)) return null;
    try {
      const clean = expr.replace(/\^/g, "**").replace(/,/g, "").replace(/\*/g, "*");
      if (/\/\s*0(?!\d)/.test(clean)) return null;
      const val = Function('"use strict";return (' + clean + ")")();
      if (typeof val !== "number" || !isFinite(val)) return null;
      return Math.round(val * 1e6) / 1e6;
    } catch (e) { return null; }
  }
  function nowStr() {
    const d = new Date();
    const days = I18N.lang === "ar"
      ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d.getDay()] + " — " + UI.clock(d.getTime()) + " · " + d.toLocaleDateString(I18N.lang === "ar" ? "ar-EG" : "en-GB");
  }

  /* ---------------- assistant brain ---------------- */
  function assistant(text, chat) {
    const raw = String(text || "").trim();
    const ar = isAr(raw) || I18N.lang === "ar";
    const low = raw.toLowerCase().replace(/[؟?!.,]/g, "");
    const R = REPLIES.assistant[ar ? "ar" : "en"];
    const J = JOKES[ar ? "ar" : "en"];

    /* commands */
    if (/^\/(help|مساعدة)$/.test(low)) return {
      text: ar
        ? "**أوامر مساعد وصل 🤖**\n`/help` — هذه القائمة\n`/time` — الوقت والتاريخ\n`/math 2+2*8` — عملية حسابية\n`/joke` — نكتة\n`/roll` — رمية نرد\n`/coin` — عملة\n`/theme` — تبديل الثيم\n`/lang` — تبديل اللغة\n`/tasks` — إنشاء قائمة مهام\n\nويمكنني فهم العبارات الطبيعية: اسألني أي شيء 🙂"
        : "**Wasl assistant commands 🤖**\n`/help` — this list\n`/time` — time & date\n`/math 2+2*8` — calculation\n`/joke` — a joke\n`/roll` — dice\n`/coin` — coin flip\n`/theme` — toggle theme\n`/lang` — toggle language\n`/tasks` — create a task list\n\nOr just talk to me naturally 🙂",
      delay: 500 };
    if (/^\/(time|الوقت|date|التاريخ)$/.test(low)) return { text: "🕐 " + nowStr(), delay: 400 };
    if (/^\/(joke|نكتة|jokes)$/.test(low)) return { text: pick(J), delay: 700 };
    if (/^\/(roll|نرد|dice)$/.test(low)) {
      const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
      return { text: (ar ? "🎲 النتيجة" : "🎲 Rolled") + ": **" + a + " + " + b + " = " + (a + b) + "**", delay: 450 };
    }
    if (/^\/(coin|عملة)$/.test(low)) return { text: ar ? "🪙 **" + (Math.random() < .5 ? "صورة" : "كتابة") + "**" : "🪙 **" + (Math.random() < .5 ? "Heads" : "Tails") + "**", delay: 400 };
    if (/^\/(theme|ثيم)$/.test(low)) { setTimeout(() => window.APP && APP.cycleTheme(), 300); return { text: ar ? "🎨 بدّلت الثيم — راجع الإعدادات لتغيير اللون والخلفية." : "🎨 Theme switched — see Settings for accent & wallpaper.", delay: 400 }; }
    if (/^\/(lang|لغة)$/.test(low)) { setTimeout(() => window.APP && APP.toggleLang(), 300); return { text: "🌐 …", delay: 400 }; }
    if (/^\/(tasks|مهام)$/.test(low)) { setTimeout(() => window.CHAT && CHAT.openTaskModal(), 350); return { text: ar ? "✅ افتح نافذة القائمة واملأ مهامك." : "✅ Opening the task list builder.", delay: 400 }; }

    /* math */
    const mathish = raw.replace(/×/g, "*").replace(/÷/g, "/").replace(/[؟?]/g, "").trim();
    if (mathish && (/^[\d\s+\-*/().^%]+$/.test(mathish)) && /\d/.test(mathish) && /[+\-*/^%]/.test(mathish)) {
      const v = safeMath(mathish);
      if (v !== null) return { text: "`" + mathish + " = " + v + "` 🧮", delay: 480 };
    }
    const calcMatch = mathish.match(/(?:احسب|calc|كم يساوي|=)?\s*([\d\s+\-*/().^%]{3,})/i);
    if (calcMatch) {
      const v = safeMath(calcMatch[1]);
      if (v !== null) return { text: "`" + calcMatch[1].trim() + " = " + v + "` 🧮", delay: 480 };
    }

    /* intents */
    if (/^(الوقت|time|كم الساعة|whattime)/.test(low)) return { text: "🕐 " + nowStr(), delay: 400 };
    if (/(نكت|joke)/.test(low)) return { text: pick(J), delay: 700 };
    if (/(مساعد|help|ساعدني|ساعد|what can you|شو بتقدر|ماذا تستطيع)/.test(low))
      return { text: ar ? "أقدر أفعل الكثير 🙂 — اكتب `/help` لأوامري الكاملة." : "Quite a lot 🙂 — type `/help` for all commands.", delay: 550 };
    if (/(اسمك|من انت|who are you|مين انت)/.test(low))
      return { text: ar ? "أنا **مساعد وصل** 🤖 — أنطق داخل متصفحك فقط، بلا خادم وبلا إنترنت." : "I'm the **Wasl assistant** 🤖 — I live inside your browser only, no server, no internet.", delay: 550 };
    if (/(طقس|weather|حرارة)/.test(low))
      return { text: ar ? "🌤️ **الطقس المحلي غير متاح** بدون إنترنت… لكن افتح نافذتك واحكم بنفسك 😄" : "🌤️ **No local weather offline**… but open your window and judge for yourself 😄", delay: 600 };
    if (/(فكرة|idea|ما اسوي|شو اعمل|ماذا افعل)/.test(low))
      return { text: ar
        ? "💡 **3 أفكار سريعة:**\n1. اكتب **قائمة مهام** بالمهام المتبقية 📝\n2. ثبّت أهم رسالة في المحادثة 📌\n3. جرّب ثيماً جديداً من الإعدادات 🎨"
        : "💡 **3 quick ideas:**\n1. Write a **task list** of what's left 📝\n2. Pin your most important message 📌\n3. Try a new theme from Settings 🎨", delay: 750 };
    if (/(ترجم|translate)/.test(low)) return { text: ar ? "🌍 أرفق «ترجمة» مع أي رسالة محفوظة لأعرضها — أو جرّب زر الترجمة في قائمة الرسالة." : "🌍 Add `tr:` to any saved message to see a translation — or use the translate button in the message menu.", delay: 600 };
    if (/(شكرا|thank|مشكور|تسلم)/.test(low)) return { text: pick(THANKS[ar ? "ar" : "en"]), delay: 400 };
    if (/(مرحبا|هلا|السلام|صباح|مساء|hello|hi |^hi$|hey|هلاallas)/.test(low)) return { text: pick(GREET[ar ? "ar" : "en"]), delay: 500 };
    if (/(bye|مع السلامة|باي|وداع)/.test(low)) return { text: pick(BYE[ar ? "ar" : "en"]), delay: 500 };
    if (/(كيفك|how are you|حالك|ايش اخبارك)/.test(low))
      return { text: ar ? "بخير الحمد لله 🌟 أنا شغّال 24/7 بلا انقطاع 😄 وانت؟" : "Doing great 🌆 I run 24/7 with zero downtime 😄 and you?", delay: 650 };

    /* keyword knowledge */
    if (/(ثيم|theme|لون|تصميم|design|واجهة|ui)/.test(low)) return { text: ar
      ? "🎨 عندك **10 ثيمات** وألوان بلا حدود: الإعدادات ← *المظهر والثيمات*. جرّب ثيم **Sunset** مع لون **Rose** 🌅"
      : "🎨 You have **10 themes** and unlimited colors: Settings ← *Appearance & themes*. Try **Sunset** with **Rose** 🌅", delay: 700 };
    if (/(مهم|todo|مهام|قائمة|task)/.test(low)) return { text: R[0] + "\n\n" + (ar ? "أو اضغط 📎 ← **قائمة مهام** لإنشاء قائمة فورية." : "Or hit 📎 → **Task list** to build one now."), delay: 700 };
    if (/(خصوص|privacy|أمان|secure|تشفير)/.test(low)) return { text: ar
      ? "🔒 كل شيء يبقى داخل متصفحك: لا خادم، لا تتبّع، ولا إعلانات. حتى الرمز السري يُجزَّأ بـ SHA-256 محلياً."
      : "🔒 Everything stays in your browser: no server, no tracking, no ads. Your password is hashed locally with SHA-256.", delay: 750 };
    if (/(أسرع|سريع|fast|speed|أداء)/.test(low)) return { text: ar
      ? "⚡ أداة واحدة خفيفة: بدون أطر عمل، بدون تنزيلات — تفتح وتتحدث خلال جزء من الثانية."
      : "⚡ One lightweight tool: no frameworks, no downloads — open and chat in a fraction of a second.", delay: 650 };

    /* context echo with personality */
    const tone = ar ? "ar" : "en";
    const words = raw.split(/\s+/).filter(w => w.length > 3);
    const echo = words.length ? " «" + words.slice(0, 6).join(" ") + "»" : "";
    if (Math.random() < 0.22) return { text: pick(J), delay: 900 };
    return { text: pick(R) + echo, delay: 700 + Math.random() * 900 };
  }

  /* ---------------- persona brain ---------------- */
  function personaReply(user, text, chat) {
    const tone = user.persona || "chill";
    const ar = isAr(text) || I18N.lang === "ar";
    const lang = ar ? "ar" : "en";
    const low = String(text || "").toLowerCase().replace(/[؟?!.,]/g, "");

    /* assistant persona delegates to the brain */
    if (tone === "assistant") return assistant(text, chat);

    const R = REPLIES[tone] ? REPLIES[tone][lang] : REPLIES.chill[lang];

    if (/(مرحبا|هلا|السلام|صباح|مساء|hello|hi|hey|greeting)/.test(low)) return { text: pick(GREET[lang]), delay: 800 + Math.random() * 900 };
    if (/(شكرا|thank|مشكور|تسلم)/.test(low)) return { text: pick(THANKS[lang]), delay: 600 };
    if (/(bye|مع السلامة|باي|وداع)/.test(low)) return { text: pick(BYE[lang]), delay: 700 };
    if (/(كيفك|كيف حالك|how are you|ايش اخبارك)/.test(low)) return { text: lang === "ar"
      ? pick(["بخير والحمد لله 😄 وانت؟", "تمام… شوي مشغول بس مبسوط 🙂 وانت؟", "الأمور زينة 🌟 وانت كيفك؟"])
      : pick(["Good thanks 😄 and you?", "Doing fine… a bit busy but happy 🙂 you?", "All good 🌟 how are you?"]), delay: 900 };
    if (/(اجتماع|meeting|موعد|deadline|تسليم)/.test(low)) return { text: lang === "ar"
      ? pick(["أكيد، حاطّها بالي 😉", "خلّها بعد القهوة ☕😄", "تمام، بشوفها وبرجعلك"])
      : pick(["Sure, it's on my mind 😉", "Let's do it after coffee ☕😄", "Ok, I'll check and get back"]), delay: 1100 };
    if (/(قهوة|coffee|غدا|أكل|جوع|food)/.test(low)) return { text: lang === "ar"
      ? pick(["☕ أيوه! أنا على قهوة دائماً", "طب اقتراح: نصف ساعة ونرجع 🙂", "هههههه جعتني الحين 😅"])
      : pick(["☕ Always up for coffee", "How about a 30-min break 🙂", "Hahaha you made me hungry 😅"]), delay: 1000 };
    if (/(تصميم|theme|ثيم|واجهة|ui|design)/.test(low)) return { text: lang === "ar"
      ? "أعجبني! جرّب لون **Violet** مع خلفية **Aurora** — تركيبة كلاسيكية ✨"
      : "I like it! Try the **Violet** accent with the **Aurora** wallpaper — a classic combo ✨", delay: 1200 };
    if (/(تمرين|رياضة|gym|workout|جري)/.test(low)) return { text: lang === "ar"
      ? pick(["💪 أنا بنزل النادي الساعة 7 — تحجّم؟", "تمرين اليوم: سكوات + ضغط 🔥", "لازم نرجع للروتين… بعد العيد 😅"])
      : pick(["💪 I hit the gym at 7 — join?", "Today's session: squats + push-ups 🔥", "We should get back to routine… after the holiday 😅"]), delay: 1100 };
    if (/(فيلم|مسلسل|movie|series|مشاهدة)/.test(low)) return { text: lang === "ar"
      ? pick(["🔥 اقتراح: مسلسل قصير 6 حلقات فقط — يخلص بسرعة", "شوفت آخر حلقة… ما أحرقها عليك 😜", "أنا فاضي الخميس مساءً 🎬"])
      : pick(["🔥 Suggestion: a 6-episode mini series", "I saw the finale… won't spoil it 😜", "I'm free Thursday night 🎬"]), delay: 1000 };
    if (/(؟|\?$|what|why|how|ليش|وين|متى|كم|who)/.test(low) && Math.random() < 0.5)
      return { text: lang === "ar"
        ? pick(["سؤال ممتاز… أعطني دقيقة وأتأكد 🙂", "أممم، رأيي نجرّب ونشوف 😄", "بصراحة؟ الأفضل نناقشها وجهاً لوجه", "أعتقد الإجابة تعتمد على السياق 🤔"])
        : pick(["Great question… give me a sec 🙂", "Hmm, let's try and see 😄", "Honestly? Better discuss it in person", "Depends on the context 🤔"]), delay: 1300 };

    if (Math.random() < 0.16) return { text: lang === "ar" ? pick(JOKES.ar) : pick(JOKES.en), delay: 1500 };
    const words = String(text || "").split(/\s+/).filter(w => w.length > 3);
    const echo = words.length > 1 ? " «" + words.slice(-4).join(" ") + "»" : "";
    return { text: pick(R) + (Math.random() < 0.5 ? echo : ""), delay: 800 + Math.random() * 1400 };
  }

  /* ---------------- public API ---------------- */
  const BOT = {
    /** decide whether a chat should react to my message */
    shouldReply(chat, text) {
      if (!chat) return false;
      if (chat.type === "saved") return false;
      if (chat.type === "bot") return true;
      if (chat.type === "private") return true;
      if (chat.type === "group") {
        /* someone in the group replies sometimes */
        return Math.random() < (text && text.length > 24 ? 0.75 : 0.42);
      }
      if (chat.type === "channel") return false;
      return false;
    },
    /** produce the reply object {user, text, delay} */
    async respond(chat, msg) {
      const text = msg.type === "text" ? msg.text : (msg.caption || msg.name || "");
      if (chat.type === "group") {
        const others = (chat.members || []).filter(id => id !== DB.state.me && DB.user(id));
        const target = DB.user(others[Math.floor(Math.random() * others.length)]);
        if (!target) return null;
        const r = personaReply(target, text, chat);
        return { user: target.id, text: r.text, delay: r.delay };
      }
      const target = DB.user(chat.user) || DB.user("u_waslai");
      if (!target) return null;
      const r = personaReply(target, text, chat);
      return { user: target.id, text: r.text, delay: r.delay };
    },
    /** direct answer used by the assistant chat */
    answer(text, chat) { return assistant(text, chat); },
    JOKES, REPLIES
  };

  window.BOT = BOT;
})();
