// బ్రౌజర్‌లో: భాష, countdown, RSVP, install, 24×7 సహాయకుడు, offline.
// ఏ data నూ ఎక్కడికీ పంపదు: అన్నీ ఈ ఫోన్‌లోనే.
(function () {
  "use strict";
  var root = document.documentElement;
  var RTL = { ur: 1, ks: 1, sd: 1 };
  var onLang = [];

  // ---------- భాష ----------
  var buttons = document.querySelectorAll("[data-set-lang]");
  var select = document.querySelector("[data-lang-select]");
  function setLang(l) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l);
    root.setAttribute("dir", RTL[l] ? "rtl" : "ltr");
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l)); });
    if (select) select.value = l;
    onLang.forEach(function (fn) { fn(l); });
    try { localStorage.setItem("shubhalekha-lang", l); } catch (e) {}
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang")); });
  });
  if (select) select.addEventListener("change", function () { setLang(select.value); });
  var lang = function () { return root.getAttribute("data-lang"); };

  // ---------- Countdown (నిమిషానికి ఒకసారి) ----------
  var cd = document.querySelector(".countdown[data-at]");
  if (cd) {
    var at = new Date(cd.getAttribute("data-at")).getTime();
    var boxes = cd.querySelector(".cd-boxes");
    var done = cd.querySelector(".cd-done");
    var tick = function () {
      var left = at - Date.now();
      if (left <= 0) { boxes.hidden = true; done.hidden = false; return; }
      var mins = Math.floor(left / 60000);
      cd.querySelector('[data-u="d"]').textContent = Math.floor(mins / 1440);
      cd.querySelector('[data-u="h"]').textContent = Math.floor((mins % 1440) / 60);
      cd.querySelector('[data-u="m"]').textContent = mins % 60;
      boxes.hidden = false;
      setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
  }

  // ---------- RSVP ----------
  var form = document.getElementById("rsvp");
  if (form) {
    var S = JSON.parse(form.getAttribute("data-strings"));
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = S[lang()] || S[Object.keys(S)[0]];
      var name = form.elements.name.value.trim();
      var err = document.getElementById("rs-err");
      if (!name) {
        err.textContent = s.needName;
        form.elements.name.setAttribute("aria-invalid", "true");
        form.elements.name.focus();
        return;
      }
      err.textContent = "";
      form.elements.name.removeAttribute("aria-invalid");
      var guests = Math.max(1, parseInt(form.elements.guests.value, 10) || 1);
      var evs = Array.prototype.filter.call(form.querySelectorAll('input[name="events"]'), function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      var text = s.hello + " " + form.getAttribute("data-title") + "\n" +
        s.from + ": " + name + "\n" + s.guests + ": " + guests +
        (evs.length ? "\n" + s.events + ": " + evs.join(", ") : "");
      var via = e.submitter && e.submitter.value;
      if (via === "mail" || !form.getAttribute("data-wa")) {
        location.href = "mailto:" + form.getAttribute("data-email") +
          "?subject=" + encodeURIComponent(form.getAttribute("data-subject")) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + form.getAttribute("data-wa") + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
    });
  }

  // ---------- Install (PWA) ----------
  var installBtn = document.getElementById("install");
  var deferred = null;
  var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferred = e;
    if (installBtn && !standalone) installBtn.hidden = false;
  });
  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; installBtn.hidden = true; });
    });
  }
  window.addEventListener("appinstalled", function () { if (installBtn) installBtn.hidden = true; });
  // iPhone / iPad: Safari లో install బటన్ ఉండదు, సూచన మాత్రమే (ఒక్కసారి)
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var hint = document.getElementById("ios-hint");
  if (ios && !standalone && hint) {
    try {
      if (!localStorage.getItem("shubhalekha-ios-hint")) { hint.hidden = false; localStorage.setItem("shubhalekha-ios-hint", "1"); }
    } catch (e) { hint.hidden = false; }
  }

  // ---------- 24×7 సహాయకుడు ----------
  var dataEl = document.getElementById("shubhalekha-data");
  var dlg = document.getElementById("ask");
  if (dataEl && dlg) {
    var D = JSON.parse(dataEl.textContent);
    var P = JSON.parse(document.getElementById("shubhalekha-placeholders").textContent);
    var log = document.getElementById("ask-log");
    var chips = document.getElementById("ask-chips");
    var input = document.getElementById("ask-q");
    var L = function (v) { return v ? (v[lang()] || v[D.langs[0]] || "") : ""; };
    var U = function (k) { return (D.ui[lang()] || D.ui[D.langs[0]])[k]; };

    // ఉద్దేశ్యం (intent) గుర్తించే మాటలు: చాలా భాషల్లో
    var INTENTS = {
      when: "when time date day muhurtham muhurat timing schedule start ఎప్పుడు సమయం తేదీ ముహూర్తం టైమ్ కబ समय तारीख तिथि मुहूर्त ಯಾವಾಗ ಸಮಯ ದಿನಾಂಕ எப்போது நேரம் தேதி എപ്പോൾ സമയം തീയതി कधी वेळ तारीख কবে সময় তারিখ কেতিয়া ক্યારે સમય તારીખ ਕਦੋਂ ਸਮਾਂ ਤਾਰੀਖ କେବେ ସମୟ ତାରିଖ کب وقت تاریخ कहिले कदा केन्ना",
      where: "where venue address location place map directions reach hall ఎక్కడ చిరునామా వేదిక దారి మ్యాప్ స్థలం कहाँ पता जगह स्थान रास्ता ಎಲ್ಲಿ ವಿಳಾಸ ಸ್ಥಳ ದಾರಿ எங்கே முகவரி இடம் வழி എവിടെ വിലാസം സ്ഥലം വഴി कुठे पत्ता ठिकाण কোথায় ঠিকানা জায়গা ক'ত ঠিকনা ક્યાં સરનામું સ્થળ ਕਿੱਥੇ ਪਤਾ ਜਗ੍ਹਾ କେଉଁଠି ଠିକଣା ସ୍ଥାନ کہاں پتہ جگہ कहाँ ठेगाना कुत्र खंय",
      rsvp: "rsvp attend attending coming come confirm reply invite హాజరు వస్తాను వస్తున్నాను రావాలా తెలపాలి उपस्थिति आऊँगा आना पुष्टि ಹಾಜರಾತಿ ಬರುತ್ತೇನೆ வருகை வருவேன் പങ്കെടുക്കൽ വരും उपस्थिती येणार উপস্থিতি আসব উপস্থিত હાજરી આવીશ ਹਾਜ਼ਰੀ ਆਵਾਂਗਾ ଉପସ୍ଥିତି ଆସିବି حاضری آؤں",
      contact: "contact call phone number mobile whatsapp help సంప్రదించండి ఫోన్ నంబర్ కాల్ సహాయం संपर्क फ़ोन फोन नंबर मदद ಸಂಪರ್ಕ ಕರೆ ಫೋನ್ தொடர்பு அழைப்பு தொலைபேசி ബന്ധപ്പെടുക ഫോൺ വിളിക്കുക संपर्क फोन যোগাযোগ ফোন যোগাযোগ સંપર્ક ફોન ਸੰਪਰਕ ਫ਼ੋਨ ଯୋଗାଯୋଗ ଫୋନ୍ رابطہ فون"
    };
    var tok = function (s) { return String(s || "").toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || []; };
    var intentTokens = {};
    Object.keys(INTENTS).forEach(function (k) { intentTokens[k] = tok(INTENTS[k]); });

    // ఒక మాట ఇంకో మాటలో భాగమా (తెలుగు విభక్తులు: "మండపంలో" ⊃ "మండపం")
    var hit = function (q, word) {
      return q.some(function (w) { return w === word || (word.length > 3 && w.indexOf(word) === 0) || (w.length > 3 && word.indexOf(w) === 0); });
    };
    var allLangText = function (v) { return v ? Object.keys(v).map(function (k) { return v[k]; }).join(" ") : ""; };

    function eventsMentioned(q) {
      return D.events.filter(function (ev) {
        return tok(allLangText(ev.name)).some(function (w) { return w.length > 2 && hit(q, w); });
      });
    }

    function link(href, text) {
      var a = document.createElement("a");
      a.href = href; a.textContent = text;
      if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
      return a;
    }

    function answer(kind, evs) {
      var box = document.createElement("div");
      box.className = "ask-a";
      var list = evs && evs.length ? evs : D.events;
      if (kind === "when") {
        list.forEach(function (ev) {
          var p = document.createElement("p");
          var b = document.createElement("strong"); b.textContent = L(ev.name);
          p.appendChild(b); p.appendChild(document.createTextNode(": " + L(ev.when)));
          box.appendChild(p);
        });
      } else if (kind === "where") {
        list.forEach(function (ev) {
          var p = document.createElement("p");
          var b = document.createElement("strong"); b.textContent = L(ev.name);
          p.appendChild(b);
          var place = [L(ev.venue), ev.address].filter(Boolean).join(", ");
          p.appendChild(document.createTextNode(place ? ": " + place + " " : " "));
          if (ev.map) p.appendChild(link(ev.map, U("map")));
          box.appendChild(p);
        });
      } else if (kind === "rsvp") {
        var p = document.createElement("p");
        if (D.rsvp) {
          var a = link("#rsvp-section", U("rsvpTitle"));
          a.addEventListener("click", function () { dlg.close(); });
          p.appendChild(a);
        } else p.textContent = U("noAnswer");
        box.appendChild(p);
      } else if (kind === "contact") {
        if (D.contacts.length) {
          D.contacts.forEach(function (c) {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(L(c.name) + (c.role ? " (" + L(c.role) + ") " : " ")));
            if (c.tel) p.appendChild(link(c.tel, U("call")));
            box.appendChild(p);
          });
        } else if (D.rsvp) {
          var p2 = document.createElement("p");
          var a2 = link("#rsvp-section", D.rsvp.wa ? U("sendWhatsapp") : U("sendEmail"));
          a2.addEventListener("click", function () { dlg.close(); });
          p2.appendChild(a2);
          box.appendChild(p2);
        } else box.textContent = U("noAnswer");
      } else if (kind && kind.faq) {
        box.textContent = L(kind.faq.a);
      } else {
        box.textContent = U("noAnswer");
      }
      return box;
    }

    /** ప్రశ్న → జవాబు: ముందు FAQ, తర్వాత ఉద్దేశ్యం, తర్వాత కార్యక్రమం పేరు */
    function respond(text) {
      var q = tok(text);
      var best = null, bestScore = 0;
      D.faq.forEach(function (f) {
        var words = tok(allLangText(f.q) + " " + f.keywords.join(" ")).filter(function (w) { return w.length > 2; });
        var score = words.filter(function (w) { return hit(q, w); }).length;
        if (score > bestScore) { bestScore = score; best = f; }
      });
      if (best && bestScore >= 2) return answer({ faq: best });
      var evs = eventsMentioned(q);
      var scores = Object.keys(intentTokens).map(function (k) {
        return [k, intentTokens[k].filter(function (w) { return hit(q, w); }).length];
      }).sort(function (a, b) { return b[1] - a[1]; });
      if (scores[0][1] > 0) return answer(scores[0][0], evs);
      if (best && bestScore === 1) return answer({ faq: best });
      if (evs.length) { var both = document.createElement("div"); both.appendChild(answer("when", evs)); both.appendChild(answer("where", evs)); return both; }
      return answer(null);
    }

    function say(question, node) {
      var qEl = document.createElement("p");
      qEl.className = "ask-q";
      qEl.textContent = question;
      log.appendChild(qEl);
      log.appendChild(node);
      node.scrollIntoView({ block: "nearest" });
    }

    function renderChips() {
      chips.textContent = "";
      var items = [["when", U("when")], ["where", U("where")]];
      if (D.rsvp) items.push(["rsvp", U("rsvp")]);
      if (D.contacts.length || D.rsvp) items.push(["contact", U("contact")]);
      D.faq.forEach(function (f, i) { items.push(["faq" + i, L(f.q)]); });
      items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = it[1];
        b.addEventListener("click", function () {
          var k = it[0];
          say(it[1], k.indexOf("faq") === 0 ? answer({ faq: D.faq[+k.slice(3)] }) : answer(k));
        });
        chips.appendChild(b);
      });
      input.placeholder = P[lang()] || P[D.langs[0]];
    }
    renderChips();
    onLang.push(renderChips);

    var opener = document.getElementById("ask-open");
    opener.addEventListener("click", function () {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
      input.focus();
    });
    document.getElementById("ask-close").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
    dlg.addEventListener("close", function () { opener.focus(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // బయట నొక్కితే మూసివేయడం
    document.getElementById("ask-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      say(v, respond(v));
      input.value = "";
    });
  }

  // మొదటి భాష: ముందు ఎంచుకున్నది (ఉంటే)
  try {
    var saved = localStorage.getItem("shubhalekha-lang");
    if (saved && (document.querySelector('[data-set-lang="' + saved + '"]') || (select && select.querySelector('option[value="' + saved + '"]')))) setLang(saved);
  } catch (e) {}

  // ---------- Offline ----------
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js"); });
  }
})();
