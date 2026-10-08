/* ============================================================
   وصل | Wasl — i18n.js   (Arabic / English dictionary)
   ============================================================ */
(function () {
  const dict = {
    ar: {
      /* --- generic --- */
      "cancel": "إلغاء", "ok": "موافق", "yes": "نعم", "no": "لا", "save": "حفظ", "close": "إغلاق",
      "delete": "حذف", "rename": "إعادة تسمية", "search": "بحث", "back": "رجوع", "all": "الكل",
      "today": "اليوم", "yesterday": "أمس", "online": "متصل", "you": "أنت", "admin": "المشرف",
      "owner": "المالك", "bot": "روبوت", "retry": "أعد المحاولة",

      /* --- lock --- */
      "lock.title": "التطبيق مقفل", "lock.sub": "أدخل رمز الدخول المكوّن من 4 أرقام",
      "lock.other": "حساب آخر", "lock.wrong": "رمز غير صحيح، حاول مرة أخرى",
      "lock.on": "تم تفعيل قفل التطبيق", "lock.off": "تم إلغاء قفل التطبيق",
      "lock.set": "اختر رمزاً سرياً من 4 أرقام", "lock.confirm": "أعد إدخال الرمز للتأكيد",
      "lock.mismatch": "الرمزان غير متطابقين",

      /* --- auth --- */
      "auth.hero": "رسائل أسرع.<br>خصوصية أعمق.", "auth.heroSub": "تطبيق دردشة يعمل بالكامل داخل متصفحك — بلا خادم، بلا تتبّع، بلا إعلانات. بياناتك لا تغادر جهازك أبداً.",
      "auth.f1t": "فوري بين التبويبات", "auth.f1s": "افتح تبويبين وتحدّث مباشرة عبر BroadcastChannel",
      "auth.f2t": "مساعد وصل الذكي", "auth.f2s": "يجيبك محلياً: حسابات، نكت، أفكار، ومهام",
      "auth.f3t": "تشفير وتدمير ذاتي", "auth.f3s": "قفل PIN، رسائل تختفي، وسجل محاولات محلي",
      "auth.f4t": "10 ثيمات + ألوان بلا حدود", "auth.f4s": "خصّص كل شيء: الثيم، اللون، الخلفية، الحجم",
      "auth.local": "🔒 بياناتك محفوظة في متصفحك فقط",
      "auth.signin": "تسجيل الدخول", "auth.signup": "حساب جديد", "auth.username": "اسم المستخدم أو رقم الهاتف",
      "auth.password": "الرمز السري", "auth.name": "الاسم", "auth.phone": "رقم الهاتف (اختياري)",
      "auth.create": "إنشاء الحساب", "auth.guest": "الدخول كضيف (تجربة فورية)",
      "auth.note": "يُجزَّأ الرمز السري محلياً بـ SHA-256 مع ملح فريد — لا يُرسل شيء لأي خادم.",
      "auth.made": "صُنع بعناية، بلا خادم وبلا تتبّع",
      "auth.errPass": "بيانات الدخول غير صحيحة", "auth.errExists": "اسم المستخدم أو الهاتف مستخدم مسبقاً",
      "auth.errName": "الاسم مطلوب", "auth.errUser": "اسم المستخدم: 3 أحرف على الأقل (أحرف لاتينية وأرقام و _)",
      "auth.errPassLen": "الرمز السري: 4 خانات على الأقل", "auth.demo": "حسابات جاهزة للتجربة:",
      "auth.quick": "دخول سريع كضيف", "auth.welcome": "أهلاً {name} 👋",

      /* --- search / empty --- */
      "search.ph": "بحث", "search.none": "لا نتائج مطابقة", "search chats": "المحادثات",
      "search.msgs": "الرسائل", "search.people": "الأشخاص", "search.actions": "إجراءات سريعة",
      "empty.title": "اختر محادثة وابدأ المحادثة",
      "empty.sub": "مرّر بمؤشّرك فوق أي رسالة لعرض الإجراءات، أو اضغط Ctrl+K للبحث السريع.",
      "empty.new": "محادثة جديدة", "empty.keys": "اختصارات لوحة المفاتيح",
      "empty.stat1": "محادثة", "empty.stat2": "رسالة", "empty.stat3": "ثيم جاهز",

      /* --- statuses --- */
      "st.online": "متصل الآن", "st.lastSeen": "آخر ظهور {t}", "st.lastSeenRecently": "آخر ظهور مؤخراً",
      "st.typing": "يكتب…", "st.recording": "يكتب…", "st.nMembers": "{n} عضو", "st.nSubs": "{n} مشترك",
      "st.saved": "احفظ ملاحظاتك وملفاتك هنا", "st.botInfo": "روبوت — يردّ فوراً",
      "st.admin": "مشرف", "st.member": "عضو", "st.self": "الحساب الشخصي",
      "st.joined": "انضم مؤخراً", "st.notFound": "لا يوجد اتصال…",

      /* --- previews --- */
      "pv.you": "أنت: ", "pv.photo": "📷 صورة", "pv.video": "🎬 فيديو", "pv.voice": "🎙️ ملاحظة صوتية",
      "pv.file": "📎 ملف", "pv.poll": "📊 استطلاع", "pv.task": "✅ قائمة مهام", "pv.sticker": " sticker",
      "pv.draft": "مسودة: ", "pv.reacted": "تفاعّل", "pv.pinned": "مثبّت", "pv.forwarded": "مُعاد توجيهها",
      "pv.gif": "GIF",

      /* --- message actions --- */
      "act.reply": "ردّ", "act.copy": "نسخ النص", "act.forward": "إعادة توجيه", "act.edit": "تعديل",
      "act.pin": "تثبيت", "act.unpin": "إلغاء التثبيت", "act.delete": "حذف", "act.react": "تفاعل",
      "act.save": "حفظ في المحفوظات", "act.translate": "ترجمة", "act.translateTo": "الترجمة إلى العربية",
      "act.sd": "رسالة تدمر ذاتياً بعد 5 ثوانٍ", "act.sd60": "رسالة تدمر ذاتياً بعد دقيقة",
      "act.unread": "تحديد كغير مقروء", "act.read": "تحديد كمقروء", "act.profile": "الملف الشخصي",
      "act.info": "معلومات المحادثة", "act.clear": "مسح المحادثة", "act.mute": "كتم الإشعارات",
      "act.unmute": "إلغاء الكتم", "act.leave": "مغادرة المجموعة", "act.deleteChat": "حذف المحادثة",
      "act.members": "الأعضاء", "act.pinnedList": "الرسائل المثبّتة", "act.export": "تصدير المحادثة (نص)",
      "act.markAllRead": "تعليم الكل كمقروء", "act.call": "مكالمة صوتية", "act.vcall": "مكالمة فيديو",
      "act.media": "الوسائط المشتركة", "act.select": "تحديد الرسائل",

      /* --- confirm / toasts --- */
      "cf.deleteMsg": "حذف هذه الرسالة؟", "cf.deleteMsgs": "حذف {n} رسالة؟",
      "cf.clearChat": "مسح كل رسائل هذه المحادثة؟ لا يمكن التراجع.",
      "cf.deleteChat": "حذف المحادثة وجميع رسائلها؟",
      "cf.leave": "مغادرة المجموعة؟", "cf.logout": "تسجيل الخروج من هذا الجهاز؟",
      "cf.reset": "مسح كل البيانات وإعادة ضبط التطبيق؟", "cf.disableLock": "إلغاء قفل التطبيق؟",
      "cf.title": "تأكيد", "cf.deleteForAll": "حذف للجميع (محلياً)",
      "to.copied": "تم النسخ ✔", "to.copiedLink": "تم نسخ الرابط",
      "to.forwarded": "تمت إعادة التوجيه إلى {n} محادثة", "to.pinned": "تم تثبيت الرسالة",
      "to.unpinned": "تم إلغاء التثبيت", "to.deleted": "تم حذف الرسالة", "to.saved": "تم الحفظ في الرسائل المحفوظة",
      "to.noTranslate": "لا تتوفر ترجمة لهذه الرسالة", "to.edited": "تم تعديل الرسالة",
      "to.noMic": "تعذّر الوصول إلى الميكروفون", "to.noCam": "تعذّر الوصول إلى الكاميرا",
      "to.backup": "تم إنشاء نسخة احتياطية", "to.import": "تم استيراد النسخة الاحتياطية بنجاح",
      "to.importFail": "ملف النسخة الاحتياطية غير صالح", "to.needMembers": "اختر عضواً واحداً على الأقل",
      "to.needName": "الاسم مطلوب", "to.pollEmpty": "أضف خياراً واحداً على الأقل",
      "to.groupCreated": "تم إنشاء {name}", "to.theme": "تم تغيير الثيم", "to.lang": "تم تغيير اللغة",
      "to.notAdmin": "صلاحيتك غير كافية في هذه المجموعة", "to.mediaFail": "تعذّر تحميل الملف",
      "to.muteOn": "تم كتم الإشعارات", "to.muteOff": "تم إلغاء الكتم", "to.searchNone": "لا نتائج مطابقة",
      "to.nameTaken": "الاسم مستخدم مسبقاً", "to.oldPass": "الرمز الحالي غير صحيح",
      "to.passChanged": "تم تغيير الرمز السري", "to.accountDeleted": "تم حذف الحساب",
      "to.storageFull": "مساحة التخزين ممتلئة — احذف بعض الوسائط", "to.emptyChat": "لا توجد رسائل بعد",
      "to.cantCall": "المكالمات تحتاج إلى تبويب مفتوح للطرف الآخر", "to.callEnded": "انتهت المكالمة",
      "to.selfDestruct": "ستختفي هذه الرسالة بعد فتحها", "to.onlyImage": "يمكن إرفاق صورة واحدة",

      /* --- composer / chat --- */
      "chat.searchPh": "ابحث في هذه المحادثة", "chat.matches": "{a} / {b}", "chat.noMedia": "لا توجد وسائط بعد",
      "chat.noFiles": "لا توجد ملفات", "chat.noLinks": "لا توجد روابط", "chat.noVoice": "لا توجد ملاحظات صوتية",
      "chat.media": "وسائط", "chat.files": "ملفات", "chat.links": "روابط", "chat.voice": "صوتيات",
      "chat.info": "معلومات", "chat.muteTitle": "إشعارات مكتومة", "chat.pin": "تثبيت",
      "chat.unpin": "إلغاء التثبيت", "chat.clear": "مسح المحادثة", "chat.export": "تصدير",
      "chat.leave": "مغادرة", "chat.delete": "حذف المحادثة", "chat.shared": "الملفات المشتركة",
      "chat.about": "نبذة", "chat.username": "اسم المستخدم", "chat.phone": "الهاتف", "chat.bio": "نبذة تعريفية",
      "chat.addContact": "إضافة جهات الاتصال", "chat.sendMessage": "إرسال رسالة", "chat.notifications": "الإشعارات",
      "chat.setNickname": "تعديل الاسم المعروض", "chat.members": "الأعضاء", "chat.addMember": "إضافة عضو",
      "chat.subs": "المشتركون", "chat.description": "الوصف", "chat.joinDate": "تاريخ الانضمام",
      "composer.editing": "تعديل رسالة", "composer.recHint": "جارٍ تسجيل ملاحظة صوتية…",
      "composer.cancel": "إلغاء", "composer.send": "إرسال", "composer.ph": "اكتب رسالة…",
      "composer.replyTo": "الردّ على {name}", "composer.msg": "رسالة",
      "att.photo": "صورة أو فيديو", "att.file": "ملف", "att.poll": "استطلاع", "att.task": "قائمة مهام",
      "att.sticker": "ملصق", "att.location": "الموقع",
      "ep.emoji": "رموز", "ep.sticker": "ملصقات", "ep.searchPh": "ابحث عن رمز تعبيري",
      "ep.recent": "الأكثر استخداماً", "ep.smileys": "الوجوه", "ep.gestures": "إيموجي",
      "ep.objects": "أشياء", "ep.symbols": "رموز", "ep.flags": "أعلام",

      /* --- drawer --- */
      "drawer.info": "معلومات",

      /* --- palette --- */
      "palette.ph": "ابحث عن محادثة، رسالة، أو أمر…", "palette.nav": "تنقّل", "palette.open": "فتح",
      "palette.chats": "المحادثات", "palette.msgs": "رسائل", "palette.cmds": "الأوامر",
      "palette.cmd.new": "محادثة جديدة", "palette.cmd.group": "إنشاء مجموعة", "palette.cmd.channel": "إنشاء قناة",
      "palette.cmd.settings": "فتح الإعدادات", "palette.cmd.theme": "تبديل الثيم (داكن/فاتح)",
      "palette.cmd.lang": "تبديل اللغة", "palette.cmd.keys": "عرض الاختصارات", "palette.cmd.lock": "قفل التطبيق",
      "palette.cmd.export": "تصدير نسخة احتياطية", "palette.cmd.mute": "كتم المحادثة الحالية",
      "palette.cmd.clear": "مسح المحادثة الحالية", "palette.cmd.story": "إضافة قصة",
      "palette.hint": "اكتب للبحث…",

      /* --- story --- */
      "story.reply": "ردّ على القصة…", "story.my": "قصتي", "story.add": "إضافة قصة",
      "story.seen": "شوهدت", "story.created": "تم نشر القصة", "story.replySent": "تم إرسال ردّك",
      "story.textPh": "اكتب something مميزاً…", "story.post": "نشر",

      /* --- new chat / create --- */
      "new.title": "محادثة جديدة", "new.group": "مجموعة جديدة", "new.channel": "قناة جديدة",
      "new.bot": "تحدث مع مساعد وصل", "new.device": "على هذا الجهاز",
      "create.name": "الاسم", "create.about": "وصف (اختياري)", "create.members": "الأعضاء",
      "create.go": "إنشاء", "create.group": "إنشاء مجموعة", "create.channel": "إنشاء قناة",
      "create.pickAvatar": "اختر رمزاً", "create.needName": "أدخل اسماً أولاً",

      /* --- poll / task --- */
      "poll.title": "استطلاع جديد", "poll.q": "السؤال", "poll.opts": "الخيارات",
      "poll.add": "إضافة خيار", "poll.multi": "اختيارات متعددة", "poll.anon": "تصويت مجهول",
      "poll.go": "إرسال", "poll.votes": "{n} صوت", "poll.voted": "لقد صوّرت — شارك رأيك!",
      "poll.total": "{n} صوت · اضغط للتصويت",
      "task.title": "قائمة مهام", "task.titleIn": "عنوان القائمة", "task.items": "المهام",
      "task.done": "{a} من {b} منجزة",

      /* --- forward / folder --- */
      "fwd.title": "إعادة توجيه", "fwd.go": "إرسال", "fwd.sel": "اختر محادثة واحدة أو أكثر",
      "folder.title": "مجلد جديد", "folder.name": "الاسم", "folder.chats": "المحادثات",
      "folder.rename": "تعديل المجلد", "folder.go": "حفظ", "folder.del": "حذف المجلد",
      "folder.needName": "أدخل اسم المجلد",

      /* --- profile / members --- */
      "profile.title": "الملف الشخصي", "profile.edit": "تعديل البيانات",
      "profile.changePhoto": "تغيير الرمز", "profile.username": "اسم المستخدم",
      "profile.bio": "نبذة", "profile.phone": "رقم الهاتف", "profile.logout": "تسجيل الخروج",
      "profile.deleteAcc": "حذف الحساب نهائياً", "profile.savedMsgs": "الرسائل المحفوظة",
      "profile.devices": "الأجهزة النشطة", "profile.thisDevice": "هذا الجهاز",
      "members.title": "الأعضاء", "members.n": "{n} عضو", "members.owner": "المالك",
      "members.admin": "مشرف", "members.member": "عضو", "members.remove": "إزالة من المجموعة",
      "members.add": "إضافة عضو", "members.added": "تمت إضافة {n}", "members.removed": "تمت الإزالة",
      "pinned.title": "الرسائل المثبّتة", "pinned.none": "لا توجد رسائل مثبّتة",

      /* --- settings --- */
      "settings.title": "الإعدادات", "set.me": "حسابي", "set.privacy": "الخصوصية",
      "set.notif": "الإشعارات", "set.chat": "المظهر والثيمات", "set.lang": "اللغة",
      "set.data": "البيانات والتخزين", "set.keys": "الاختصارات", "set.about": "عن وصل",

      "s.profile": "عرض وتعديل ملفك الشخصي", "s.devices": "الأجهزة", "s.devicesSub": "جهاز واحد نشط — {dev}",
      "s.security": "الأمان", "s.lock": "قفل التطبيق بـ PIN", "s.lockSub": "اطلب رمزاً عند كل فتح",
      "s.lockSet": "تعيين الرمز", "s.lockChange": "تغيير الرمز", "s.lockOff": "إيقاف القفل",
      "s.pw": "تغيير الرمز السري", "s.pwSub": "يُجزَّأ محلياً بـ SHA-256",
      "s.pwOld": "الرمز الحالي", "s.pwNew": "الرمز الجديد", "s.pwDo": "تحديث",
      "s.lastSeen": "آخر ظهور", "s.phone": "رقم الهاتف", "s.forward": "إعادة توجيه الرسائل",
      "s.everyone": "الجميع", "s.nobody": "لا أحد", "s.mycontacts": "جهات اتصالي فقط",
      "s.typingInd": "مؤشر الكتابة", "s.typingSub": "أظهر للآخرين أنك تكتب",
      "s.readReceipts": "إيصالات القراءة", "s.readReceiptsSub": "اعرض وأخفِ علامتي القراءة",
      "s.passLockSub": "لا يدخل أحد بمجرد معرفة الرابط",
      "s.notifSound": "صوت الإشعارات", "s.notifSoundSub": "نغمة قصيرة عند وصول رسالة",
      "s.notifPreview": "معاينة الرسالة", "s.notifPreviewSub": "إظهار نص الرسالة داخل الإشعار",
      "s.notifAll": "إشعار لكل رسالة", "s.notifAllSub": "حتى في المحادثات المكتومة",
      "s.testNotif": "تجربة الإشعار",
      "s.themes": "الثيمات", "s.themesSub": "10 ثيمات جاهزة — اختر ما يناسبك",
      "s.accent": "اللون المميّز", "s.accentSub": "انعكاسه على الفقاعات والأزرار",
      "s.wall": "خلفية المحادثة", "s.wallSub": "نمط خلفية داخل نافذة الرسائل",
      "s.font": "حجم الخط", "s.fontSub": "تكبير أو تصغير نص الرسائل",
      "s.bubbles": "كثافة الفقاعات", "s.bubblesSub": "تباعد الرسائل",
      "s.compact": "مضغوط", "s.comfy": "مريح",
      "s.anim": "الحركات والتأثيرات", "s.animSub": "تلاشي وانزلاق ناعم",
      "s.langTitle": "لغة الواجهة", "s.langSub": "يتغيّر الاتجاه تلقائياً (RTL/LTR)",
      "s.rtl": "الاتجاه: من اليمين لليسار", "s.ltr": "الاتجاه: من اليسار لليمين",
      "s.export": "تصدير نسخة احتياطية", "s.exportSub": "ملف JSON يحفظ كل شيء — رسائل ووسائط وإعدادات",
      "s.import": "استيراد نسخة احتياطية", "s.importSub": "استعادة من ملف JSON",
      "s.clearAll": "مسح كل البيانات", "s.clearAllSub": "إعادة ضبط التطبيق كلياً",
      "s.storage": "التخزين المستخدم", "s.storageSub": "{n} محفوظ محلياً في هذا المتصفح",
      "s.msgCount": "عدد الرسائل", "s.chatCount": "المحادثات", "s.mediaCount": "الملفات المرفوعة",
      "s.keysSub": "اختصارات تسرّع عملك", "s.aboutTitle": "وصل | Wasl",
      "s.aboutSub": "تطبيق دردشة سريع، خفيف، ومحلي بالكامل — صُمم ليكون أفضل من الويب التقليدي: بلا خادم، بلا إعلانات، بلا تتبّع، وبـ 10 ثيمات ومساعد ذكي مدمج.",
      "s.version": "الإصدار", "s.storage_used": "الحجم", "s.privacyNote": "🔒 كل شيء يبقى داخل متصفحك. لا يُرسل أي بايت إلى أي خادم.",
      "s.shortcutsSub": "اضغط هذه المفاتيح في أي مكان",

      /* --- shortcuts --- */
      "keys.title": "اختصارات لوحة المفاتيح",
      "k.search": "البحث الشامل", "k.new": "محادثة جديدة", "k.settings": "الإعدادات",
      "k.theme": "تبديل الثيم", "k.lang": "تبديل اللغة", "k.next": "المحادثة التالية",
      "k.prev": "المحادثة السابقة", "k.close": "إغلاق المحادثة / القوائم", "k.escape": "إغلاق النافذة",
      "k.emoji": "لوحة الرموز", "k.attach": "إرفاق ملف", "k.mute": "كتم المحادثة",
      "k.reply": "الردّ على آخر رسالة", "k.inchat": "بحث داخل المحادثة", "k.lock": "قفل التطبيق",

      /* --- dialogs --- */
      "dlg.prompt": "الاسم", "dlg.required": "هذا الحقل مطلوب", "dlg.maxLength": "الحد الأقصى {n} حرفاً",

      /* --- misc UI --- */
      "ui.unread": "غير مقروء", "ui.pinned": "مثبّت", "ui.muted": "مكتوم", "ui.draft": "مسودة",
      "ui.send": "إرسال", "ui.reply": "ردّ", "ui.addEmoji": "إضافة رمز تعبيري",
      "ui.attach": "إرفاق", "ui.startRec": "بدء التسجيل", "ui.newChat": "محادثة جديدة",
      "ui.menu": "القائمة", "ui.theme": "الثيم", "ui.lang": "اللغة", "ui.folders": "المجلدات",
      "ui.more": "المزيد", "ui.info": "معلومات", "ui.call": "اتصال", "ui.videoCall": "فيديو",
      "ui.end": "إنهاء", "ui.mute": "كتم", "ui.camera": "كاميرا", "ui.screen": "مشاركة الشاشة",
      "ui.callOut": "جارٍ الاتصال…", "ui.callIn": "مكالمة واردة", "ui.callConnecting": "جارٍ الربط…",
      "ui.callConnected": "متصل — {t}", "ui.decline": "رفض", "ui.accept": "قبول",
      "ui.callEndedAt": "انتهت المكالمة · {t}", "ui.min": "د", "ui.sec": "ث",
      "ui.guest": "ضيف", "ui.localOnly": "محلي", "ui.views": "{n} مشاهدة",
      "ui.day": "يوم", "ui.days": "أيام", "ui.hour": "ساعة", "ui.hours": "ساعات",
      "ui.minAgo": "دقيقة", "ui.minsAgo": "دقائق", "ui.justNow": "الآن",
      "ui.ago": "منذ {n} {u}", "ui.inTime": "بعد {n} {u}", "ui.never": "أبداً",
      "ui.always": "دائماً", "ui.selectChat": "اختر محادثة", "ui.untitled": "بدون عنوان",
      "ui.fav": "المفضلة", "ui.archive": "الأرشيف", "ui.addTab": "إضافة مجلد",
      "ui.folderAll": "الكل", "ui.folderPersonal": "خاص", "ui.folderGroups": "مجموعات",
      "ui.folderChannels": "قنوات", "ui.folderBots": "روبوتات", "ui.folderUnread": "غير مقروء",
      "ui.sending": "جارٍ الإرسال…", "ui.markdownHint": "يدعم **غامق** و _مائل_ و `كود` و || spoilers ||"
    },

    en: {
      "cancel": "Cancel", "ok": "OK", "yes": "Yes", "no": "No", "save": "Save", "close": "Close",
      "delete": "Delete", "rename": "Rename", "search": "Search", "back": "Back", "all": "All",
      "today": "Today", "yesterday": "Yesterday", "online": "online", "you": "You", "admin": "Admin",
      "owner": "Owner", "bot": "Bot", "retry": "Retry",

      "lock.title": "App is locked", "lock.sub": "Enter your 4-digit passcode",
      "lock.other": "Switch account", "lock.wrong": "Wrong code, try again",
      "lock.on": "App lock enabled", "lock.off": "App lock disabled",
      "lock.set": "Choose a 4-digit code", "lock.confirm": "Re-enter to confirm",
      "lock.mismatch": "Codes do not match",

      "auth.hero": "Faster messages.<br>Deeper privacy.",
      "auth.heroSub": "A chat app that runs entirely inside your browser — no server, no tracking, no ads. Your data never leaves your device.",
      "auth.f1t": "Instant across tabs", "auth.f1s": "Open two tabs and talk live via BroadcastChannel",
      "auth.f2t": "Smart Wasl assistant", "auth.f2s": "Answers locally: math, jokes, ideas and tasks",
      "auth.f3t": "Encryption & self-destruct", "auth.f3s": "PIN lock, vanishing messages, local login log",
      "auth.f4t": "10 themes + unlimited colors", "auth.f4s": "Customize everything: theme, accent, wallpaper, size",
      "auth.local": "🔒 Your data stays in your browser only",
      "auth.signin": "Sign in", "auth.signup": "Create account", "auth.username": "Username or phone number",
      "auth.password": "Password", "auth.name": "Full name", "auth.phone": "Phone number (optional)",
      "auth.create": "Create account", "auth.guest": "Continue as guest (instant demo)",
      "auth.note": "Your password is hashed locally with SHA-256 and a unique salt — nothing is sent to any server.",
      "auth.made": "Built with care — no server, no tracking",
      "auth.errPass": "Invalid credentials", "auth.errExists": "Username or phone already taken",
      "auth.errName": "Name is required", "auth.errUser": "Username: at least 3 chars (letters, digits, _)",
      "auth.errPassLen": "Password: at least 4 characters", "auth.demo": "Ready-made demo accounts:",
      "auth.quick": "Quick guest login", "auth.welcome": "Welcome {name} 👋",

      "search.ph": "Search", "search.none": "No matches", "search chats": "Chats",
      "search.msgs": "Messages", "search.people": "People", "search.actions": "Quick actions",
      "empty.title": "Pick a chat and start talking",
      "empty.sub": "Hover any message to reveal actions, or press Ctrl+K for quick search.",
      "empty.new": "New message", "empty.keys": "Keyboard shortcuts",
      "empty.stat1": "chats", "empty.stat2": "messages", "empty.stat3": "themes ready",

      "st.online": "online", "st.lastSeen": "last seen {t}", "st.lastSeenRecently": "last seen recently",
      "st.typing": "typing…", "st.recording": "typing…", "st.nMembers": "{n} members",
      "st.nSubs": "{n} subscribers", "st.saved": "Save your notes and files here",
      "st.botInfo": "bot — replies instantly", "st.admin": "admin", "st.member": "member",
      "st.self": "personal account", "st.joined": "recently joined", "st.notFound": "offline…",

      "pv.you": "You: ", "pv.photo": "📷 Photo", "pv.video": "🎬 Video", "pv.voice": "🎙️ Voice message",
      "pv.file": "📎 File", "pv.poll": "📊 Poll", "pv.task": "✅ Task list", "pv.sticker": "Sticker",
      "pv.draft": "Draft: ", "pv.reacted": "reacted", "pv.pinned": "pinned", "pv.forwarded": "Forwarded",
      "pv.gif": "GIF",

      "act.reply": "Reply", "act.copy": "Copy text", "act.forward": "Forward", "act.edit": "Edit",
      "act.pin": "Pin", "act.unpin": "Unpin", "act.delete": "Delete", "act.react": "React",
      "act.save": "Save to saved messages", "act.translate": "Translate", "act.translateTo": "Translate to English",
      "act.sd": "Self-destruct in 5 seconds", "act.sd60": "Self-destruct in 1 minute",
      "act.unread": "Mark as unread", "act.read": "Mark as read", "act.profile": "Profile",
      "act.info": "Chat info", "act.clear": "Clear chat", "act.mute": "Mute", "act.unmute": "Unmute",
      "act.leave": "Leave group", "act.deleteChat": "Delete chat", "act.members": "Members",
      "act.pinnedList": "Pinned messages", "act.export": "Export chat (text)", "act.markAllRead": "Mark all as read",
      "act.call": "Voice call", "act.vcall": "Video call", "act.media": "Shared media", "act.select": "Select messages",

      "cf.deleteMsg": "Delete this message?", "cf.deleteMsgs": "Delete {n} messages?",
      "cf.clearChat": "Clear every message in this chat? This cannot be undone.",
      "cf.deleteChat": "Delete this chat and all its messages?",
      "cf.leave": "Leave the group?", "cf.logout": "Sign out of this device?",
      "cf.reset": "Erase everything and reset the app?", "cf.disableLock": "Disable app lock?",
      "cf.title": "Confirm", "cf.deleteForAll": "Delete for everyone (local)",
      "to.copied": "Copied ✔", "to.copiedLink": "Link copied",
      "to.forwarded": "Forwarded to {n} chats", "to.pinned": "Message pinned",
      "to.unpinned": "Unpinned", "to.deleted": "Message deleted", "to.saved": "Saved to Saved Messages",
      "to.noTranslate": "No translation available for this message", "to.edited": "Message edited",
      "to.noMic": "Microphone access denied", "to.noCam": "Camera access denied",
      "to.backup": "Backup created", "to.import": "Backup imported successfully",
      "to.importFail": "Invalid backup file", "to.needMembers": "Pick at least one member",
      "to.needName": "Name is required", "to.pollEmpty": "Add at least one option",
      "to.groupCreated": "{name} created", "to.theme": "Theme changed", "to.lang": "Language changed",
      "to.notAdmin": "You don't have permission in this group", "to.mediaFail": "Could not load the file",
      "to.muteOn": "Notifications muted", "to.muteOff": "Notifications unmuted",
      "to.searchNone": "No matches", "to.nameTaken": "Username already taken",
      "to.oldPass": "Current password is incorrect", "to.passChanged": "Password changed",
      "to.accountDeleted": "Account deleted", "to.storageFull": "Storage is full — delete some media",
      "to.emptyChat": "No messages yet", "to.cantCall": "The other side must have a tab open",
      "to.callEnded": "Call ended", "to.selfDestruct": "This message disappears after opening",
      "to.onlyImage": "Only one image can be attached",

      "chat.searchPh": "Search in this chat", "chat.matches": "{a} / {b}", "chat.noMedia": "No media yet",
      "chat.noFiles": "No files", "chat.noLinks": "No links", "chat.noVoice": "No voice messages",
      "chat.media": "Media", "chat.files": "Files", "chat.links": "Links", "chat.voice": "Audio",
      "chat.info": "Info", "chat.muteTitle": "Notifications muted", "chat.pin": "Pin",
      "chat.unpin": "Unpin", "chat.clear": "Clear chat", "chat.export": "Export",
      "chat.leave": "Leave", "chat.delete": "Delete chat", "chat.shared": "Shared files",
      "chat.about": "About", "chat.username": "Username", "chat.phone": "Phone", "chat.bio": "Bio",
      "chat.addContact": "Add to contacts", "chat.sendMessage": "Send message", "chat.notifications": "Notifications",
      "chat.setNickname": "Edit display name", "chat.members": "Members", "chat.addMember": "Add member",
      "chat.subs": "Subscribers", "chat.description": "Description", "chat.joinDate": "Joined",
      "composer.editing": "Editing message", "composer.recHint": "Recording voice message…",
      "composer.cancel": "Cancel", "composer.send": "Send", "composer.ph": "Write a message…",
      "composer.replyTo": "Reply to {name}", "composer.msg": "Message",
      "att.photo": "Photo or video", "att.file": "File", "att.poll": "Poll", "att.task": "Task list",
      "att.sticker": "Sticker", "att.location": "Location",
      "ep.emoji": "Emoji", "ep.sticker": "Stickers", "ep.searchPh": "Search emoji",
      "ep.recent": "Frequently used", "ep.smileys": "Smileys", "ep.gestures": "Gestures",
      "ep.objects": "Objects", "ep.symbols": "Symbols", "ep.flags": "Flags",

      "drawer.info": "Info",

      "palette.ph": "Search chats, messages, or commands…", "palette.nav": "navigate", "palette.open": "open",
      "palette.chats": "Chats", "palette.msgs": "Messages", "palette.cmds": "Commands",
      "palette.cmd.new": "New message", "palette.cmd.group": "Create group", "palette.cmd.channel": "Create channel",
      "palette.cmd.settings": "Open settings", "palette.cmd.theme": "Toggle theme (dark/light)",
      "palette.cmd.lang": "Toggle language", "palette.cmd.keys": "Show shortcuts", "palette.cmd.lock": "Lock app",
      "palette.cmd.export": "Export backup", "palette.cmd.mute": "Mute current chat",
      "palette.cmd.clear": "Clear current chat", "palette.cmd.story": "Add story",
      "palette.hint": "Start typing…",

      "story.reply": "Reply to story…", "story.my": "My story", "story.add": "Add story",
      "story.seen": "Seen", "story.created": "Story published", "story.replySent": "Reply sent",
      "story.textPh": "Write something fun…", "story.post": "Post",

      "new.title": "New message", "new.group": "New group", "new.channel": "New channel",
      "new.bot": "Chat with Wasl assistant", "new.device": "On this device",
      "create.name": "Name", "create.about": "Description (optional)", "create.members": "Members",
      "create.go": "Create", "create.group": "Create group", "create.channel": "Create channel",
      "create.pickAvatar": "Pick an emoji", "create.needName": "Enter a name first",

      "poll.title": "New poll", "poll.q": "Question", "poll.opts": "Options", "poll.add": "Add option",
      "poll.multi": "Multiple choice", "poll.anon": "Anonymous voting", "poll.go": "Send",
      "poll.votes": "{n} votes", "poll.voted": "You voted — share your opinion!",
      "poll.total": "{n} votes · tap to vote",
      "task.title": "Task list", "task.titleIn": "List title", "task.items": "Tasks",
      "task.done": "{a} of {b} done",

      "fwd.title": "Forward", "fwd.go": "Send", "fwd.sel": "Pick one or more chats",
      "folder.title": "New folder", "folder.name": "Name", "folder.chats": "Chats",
      "folder.rename": "Edit folder", "folder.go": "Save", "folder.del": "Delete folder",
      "folder.needName": "Enter a folder name",

      "profile.title": "Profile", "profile.edit": "Edit details", "profile.changePhoto": "Change emoji",
      "profile.username": "Username", "profile.bio": "Bio", "profile.phone": "Phone number",
      "profile.logout": "Sign out", "profile.deleteAcc": "Delete account permanently",
      "profile.savedMsgs": "Saved messages", "profile.devices": "Active devices", "profile.thisDevice": "This device",
      "members.title": "Members", "members.n": "{n} members", "members.owner": "Owner",
      "members.admin": "Admin", "members.member": "Member", "members.remove": "Remove from group",
      "members.add": "Add member", "members.added": "Added {n}", "members.removed": "Removed",
      "pinned.title": "Pinned messages", "pinned.none": "No pinned messages",

      "settings.title": "Settings", "set.me": "My account", "set.privacy": "Privacy",
      "set.notif": "Notifications", "set.chat": "Appearance & themes", "set.lang": "Language",
      "set.data": "Data & storage", "set.keys": "Shortcuts", "set.about": "About Wasl",

      "s.profile": "View and edit your profile", "s.devices": "Devices",
      "s.devicesSub": "One active device — {dev}", "s.security": "Security",
      "s.lock": "App lock (PIN)", "s.lockSub": "Ask for a code every time the app opens",
      "s.lockSet": "Set code", "s.lockChange": "Change code", "s.lockOff": "Turn off",
      "s.pw": "Change password", "s.pwSub": "Hashed locally with SHA-256",
      "s.pwOld": "Current password", "s.pwNew": "New password", "s.pwDo": "Update",
      "s.lastSeen": "Last seen", "s.phone": "Phone number", "s.forward": "Message forwarding",
      "s.everyone": "Everyone", "s.nobody": "Nobody", "s.mycontacts": "My contacts",
      "s.typingInd": "Typing indicator", "s.typingSub": "Show others that you are typing",
      "s.readReceipts": "Read receipts", "s.readReceiptsSub": "Show and hide read ticks",
      "s.passLockSub": "Nobody gets in just by knowing the link",
      "s.notifSound": "Notification sound", "s.notifSoundSub": "A short chime on new messages",
      "s.notifPreview": "Message preview", "s.notifPreviewSub": "Show message text inside notifications",
      "s.notifAll": "Notify for every message", "s.notifAllSub": "Even in muted chats",
      "s.testNotif": "Test notification",
      "s.themes": "Themes", "s.themesSub": "10 ready-made themes — pick your vibe",
      "s.accent": "Accent color", "s.accentSub": "Reflected on bubbles and buttons",
      "s.wall": "Chat wallpaper", "s.wallSub": "Background pattern behind messages",
      "s.font": "Font size", "s.fontSub": "Grow or shrink message text",
      "s.bubbles": "Bubble density", "s.bubblesSub": "Spacing between messages",
      "s.compact": "Compact", "s.comfy": "Comfy", "s.anim": "Animations & effects",
      "s.animSub": "Smooth fades and slides",
      "s.langTitle": "Interface language", "s.langSub": "Direction switches automatically (RTL/LTR)",
      "s.rtl": "Direction: right to left", "s.ltr": "Direction: left to right",
      "s.export": "Export backup", "s.exportSub": "A JSON file with everything — messages, media, settings",
      "s.import": "Import backup", "s.importSub": "Restore from a JSON file",
      "s.clearAll": "Erase everything", "s.clearAllSub": "Fully reset the app",
      "s.storage": "Storage used", "s.storageSub": "{n} stored locally in this browser",
      "s.msgCount": "Messages", "s.chatCount": "Chats", "s.mediaCount": "Uploaded files",
      "s.keysSub": "Shortcuts that speed you up", "s.aboutTitle": "Wasl",
      "s.aboutSub": "A fast, light, fully local messenger — built to beat the traditional web app: no server, no ads, no tracking, with 10 themes and a built-in smart assistant.",
      "s.version": "Version", "s.storage_used": "Size", "s.privacyNote": "🔒 Everything stays inside your browser. Not a single byte is sent to any server.",
      "s.shortcutsSub": "Press these keys anywhere",

      "keys.title": "Keyboard shortcuts",
      "k.search": "Global search", "k.new": "New message", "k.settings": "Settings",
      "k.theme": "Toggle theme", "k.lang": "Toggle language", "k.next": "Next chat",
      "k.prev": "Previous chat", "k.close": "Close chat / panels", "k.escape": "Close dialog",
      "k.emoji": "Emoji panel", "k.attach": "Attach file", "k.mute": "Mute chat",
      "k.reply": "Reply to last message", "k.inchat": "Search in chat", "k.lock": "Lock app",

      "dlg.prompt": "Name", "dlg.required": "This field is required", "dlg.maxLength": "Max {n} characters",

      "ui.unread": "unread", "ui.pinned": "pinned", "ui.muted": "muted", "ui.draft": "draft",
      "ui.send": "Send", "ui.reply": "Reply", "ui.addEmoji": "Add emoji", "ui.attach": "Attach",
      "ui.startRec": "Start recording", "ui.newChat": "New message", "ui.menu": "Menu",
      "ui.theme": "Theme", "ui.lang": "Language", "ui.folders": "Folders", "ui.more": "More",
      "ui.info": "Info", "ui.call": "Call", "ui.videoCall": "Video", "ui.end": "End",
      "ui.mute": "Mute", "ui.camera": "Camera", "ui.screen": "Share screen", "ui.callOut": "Calling…",
      "ui.callIn": "Incoming call", "ui.callConnecting": "Connecting…", "ui.callConnected": "Connected — {t}",
      "ui.decline": "Decline", "ui.accept": "Accept", "ui.callEndedAt": "Call ended · {t}",
      "ui.min": "m", "ui.sec": "s", "ui.guest": "Guest", "ui.localOnly": "local",
      "ui.views": "{n} views", "ui.day": "day", "ui.days": "days", "ui.hour": "hour",
      "ui.hours": "hours", "ui.minAgo": "minute", "ui.minsAgo": "minutes", "ui.justNow": "just now",
      "ui.ago": "{n} {u} ago", "ui.inTime": "in {n} {u}", "ui.never": "never", "ui.always": "always",
      "ui.selectChat": "Select a chat", "ui.untitled": "Untitled", "ui.fav": "Favorites",
      "ui.archive": "Archive", "ui.addTab": "Add folder", "ui.folderAll": "All",
      "ui.folderPersonal": "Personal", "ui.folderGroups": "Groups", "ui.folderChannels": "Channels",
      "ui.folderBots": "Bots", "ui.folderUnread": "Unread", "ui.sending": "Sending…",
      "ui.markdownHint": "Supports **bold**, _italic_, `code` and ||spoilers||"
    }
  };

  const I18N = {
    lang: "ar",
    dict,
    t(key, vars) {
      let s = (dict[this.lang] && dict[this.lang][key]) || dict.ar[key] || key;
      if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
      return s;
    },
    setLang(l) {
      this.lang = l === "en" ? "en" : "ar";
      const html = document.documentElement;
      html.lang = this.lang;
      html.dir = this.lang === "ar" ? "rtl" : "ltr";
      this.applyStatic();
      try { localStorage.setItem("wasl.lang", this.lang); } catch (e) {}
    },
    /** fill every [data-i18n] and [data-i18n-ph] node */
    applyStatic() {
      document.querySelectorAll("[data-i18n]").forEach(el => { el.innerHTML = this.t(el.dataset.i18n); });
      document.querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = this.t(el.dataset.i18nPh); });
      document.querySelectorAll("[data-tip]").forEach(el => {
        const k = "tip." + el.dataset.tip;
        if (dict.ar[k]) el.dataset.tip = this.t(k);
      });
      document.title = this.lang === "ar" ? "وصل | Wasl — رسالة أسرع، خصوصية أعمق" : "Wasl — Faster messages, deeper privacy";
    }
  };

  /* extra tooltip keys appended after the main dict (kept here so translators find them together) */
  Object.assign(dict.ar, {
    "tip.settings": "الإعدادات", "tip.folders": "المجلدات", "tip.lock": "قفل التطبيق",
    "tip.theme": "تبديل الثيم", "tip.lang": "تبديل اللغة", "tip.search": "بحث",
    "tip.more": "المزيد", "tip.call": "مكالمة صوتية", "tip.video": "مكالمة فيديو",
    "tip.attach": "إرفاق", "tip.emoji": "رموز تعبيرية", "tip.mic": "تسجيل صوتي",
    "tip.screen": "مشاركة الشاشة", "tip.end": "إنهاء المكالمة"
  });
  Object.assign(dict.en, {
    "tip.settings": "Settings", "tip.folders": "Folders", "tip.lock": "Lock app",
    "tip.theme": "Toggle theme", "tip.lang": "Toggle language", "tip.search": "Search",
    "tip.more": "More", "tip.call": "Voice call", "tip.video": "Video call",
    "tip.attach": "Attach", "tip.emoji": "Emoji", "tip.mic": "Record voice",
    "tip.screen": "Share screen", "tip.end": "End call"
  });

  window.I18N = I18N;
  window.t = (k, v) => I18N.t(k, v);
})();
