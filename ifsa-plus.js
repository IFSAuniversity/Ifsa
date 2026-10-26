/* IFSA University — couche d'amélioration partagée. Fonctionne page par page (chaque bloc ne s'active que si son emplacement existe). */
(function () {
  "use strict";
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOGO = "https://i.postimg.cc/8zMT8g8M/No-background.png";
  var PAGE = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  function el(t, c, x) { var n = d.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  var SVG = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>'
  };
  var safeHref = function (u) { u = String(u || "").trim(); return /^(https:\/\/|[\w\-./]+(\.html)?([?#][\w\-./=&%]*)?$)/i.test(u) && !/^javascript:/i.test(u) ? u : ""; };
  var fmt = function (s) { try { return new Date(String(s).length <= 10 ? s + "T12:00:00" : s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } };

  var fmtT = function (s) { try { if (!s) return ""; var long = String(s).length > 10, D = new Date(long ? s : s + "T12:00:00"); var t = D.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); return long ? t + " · " + D.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : t; } catch (e) { return ""; } };
  /* ---------- 1. logo sur tout ce qui s'imprime / s'enregistre en PDF ---------- */
  function printHead() {
    if ($(".ifx-ph") || /^(espace-|manager|admin|email-)/.test(PAGE)) return;
    var h = el("div", "ifx-ph"), i = el("img"); i.src = LOGO; i.alt = ""; var t = el("div"); t.appendChild(el("b", "", "IFSA University")); t.appendChild(el("span", "", "L'éducation aujourd'hui, le succès demain · Tél. 33 53 24 15 · 43 28 99 59 · IFSAuniversity@gmail.com"));
    h.appendChild(i); h.appendChild(t); var m = $("main") || d.body; m.insertBefore(h, m.firstChild);
  }

  /* ---------- 2. thème : bascule en cercle qui s'étend ---------- */
  function theme() {
    var b = $("#themeT"); if (!b || /^(espace-|manager|admin)/.test(PAGE)) return;
    var nb = b.cloneNode(true); b.parentNode.replaceChild(nb, b); b = nb;       /* retire l'ancien gestionnaire */
    var root = d.documentElement;
    function set(t) {
      root.dataset.theme = t; b.setAttribute("aria-pressed", t === "dark"); b.setAttribute("aria-label", t === "dark" ? "Passer au thème clair" : "Passer au thème sombre");
      var m = $('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#0A1230" : "#071A45";
    }
    set(root.dataset.theme || "light");
    b.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("ifsa-theme", next); } catch (e) { /* thème valable pour cette page seulement */ }
      if (reduce || !d.startViewTransition) { root.classList.add("theme-anim"); set(next); setTimeout(function () { root.classList.remove("theme-anim"); }, 450); return; }
      var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var tr = d.startViewTransition(function () { set(next); });
      tr.ready.then(function () { root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rad + "px at " + x + "px " + y + "px)"] }, { duration: 650, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" }); }).catch(function () {});
    });
  }

  /* ---------- 3. images modifiables par l'administrateur (zones) ---------- */
  var zonesP = null;
  function zones() { return zonesP || (zonesP = (window.IFSA && IFSA.zones ? IFSA.zones() : Promise.resolve([])).then(function (r) { var m = {}; r.forEach(function (z) { if (z.image_url) m[z.key] = z; }); return m; }).catch(function () { return {}; })); }
  function setVar(n, url) { var u = window.IFSA && IFSA.url(url); if (u) n.style.setProperty("--img", 'url("' + u + '")'); }
  function heroes() {
    var hs = $$(".page-hero"); hs.forEach(function (h) { if (!h.dataset.zone) { h.dataset.zone = "hero-" + (PAGE === "article" ? "actualites" : PAGE); h.dataset.zoneMode = "var"; } });
    var f = $(".fh"); 
    zones().then(function (m) {
      hs.forEach(function (h) { var z = m[h.dataset.zone]; if (z) setVar(h, z.image_url); });
      if (f) { var z = m["hero-" + PAGE]; if (z) setVar(f, z.image_url); }
      $$("[data-zone^='fac-'][data-zone-mode='var']").forEach(function (n) { var z = m[n.dataset.zone]; if (z) setVar(n, z.image_url); });
    });
  }

  /* ---------- 4. j'aime (avec ou sans compte) ---------- */
  var LK = "ifsa-likes-local";
  function localLikes() { try { return JSON.parse(localStorage.getItem(LK) || "{}"); } catch (e) { return {}; } }
  function likeBtn(type, id, st) {
    var b = el("button", "jr-like"); b.type = "button"; b.dataset.id = id; var n = el("span", "", "0");
    b.innerHTML = SVG.heart; b.appendChild(n);
    function paint(c, on) { b.setAttribute("aria-pressed", on); n.textContent = c; b.setAttribute("aria-label", (on ? "Retirer mon j'aime" : "J'aime") + " — " + c + " j'aime"); }
    var loc = localLikes(); paint(st ? +st.likes || 0 : 0, !!(st && st.liked) || !!loc[type + id]);
    b.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation(); var on = b.getAttribute("aria-pressed") === "true", c = +n.textContent || 0; paint(on ? Math.max(0, c - 1) : c + 1, !on);
      IFSA.like(type, id).then(function (r) { paint(+r.count || 0, !!r.liked); }).catch(function () { var l = localLikes(); if (on) delete l[type + id]; else l[type + id] = 1; try { localStorage.setItem(LK, JSON.stringify(l)); } catch (x) {} });
    });
    return b;
  }
  function withStats(type, ids) { return ids.length ? IFSA.stats(type, ids).then(function (rows) { var m = {}; rows.forEach(function (r) { m[r.item] = r; }); return m; }).catch(function () { return {}; }) : Promise.resolve({}); }

  /* ---------- 5. bannière d'accueil ---------- */
  var DEFAULT_SLIDES = [
    { kicker: "Depuis 2007 · 4 sites en Haïti", title: "L'éducation aujourd'hui, le succès demain", subtitle: "Car votre réussite est notre succès. Une formation supérieure de qualité, au meilleur coût.", cta_label: "Candidater maintenant", cta_url: "admissions.html", cta2_label: "Découvrir les facultés", cta2_url: "facultes.html", zone: "home-hero" },
    { kicker: "7 facultés", title: "Choisissez la formation qui vous ressemble", subtitle: "Informatique, comptabilité, administration, gestion, éducation, agronomie et sciences infirmières.", cta_label: "Voir les facultés", cta_url: "facultes.html" },
    { kicker: "Inscriptions ouvertes", title: "Rejoignez IFSA University", subtitle: "Des professionnels compétents, éthiques et innovants formés près de chez vous.", cta_label: "Commencer mon inscription", cta_url: "inscription.html" }
  ];
  function preload(u) { return new Promise(function (res) { if (!u) return res(); var i = new Image(), t = setTimeout(res, 1800); i.onload = i.onerror = function () { clearTimeout(t); res(); }; i.src = u; }); }
  function hero() {
    var box = $("#hs"); if (!box) return;
    var sl = $(".hs-sl", box), dots = $(".hs-dots", box), cur = 0, slides = [], timer = null, DUR = 6500;
    function build(list, zm) {
      sl.textContent = ""; dots.textContent = ""; slides = [];
      list.forEach(function (s, i) {
        var sec = el("div", "hs-s" + (s.align === "center" ? " al-c" : s.align === "right" ? " al-r" : "")); sec.setAttribute("role", "group"); sec.setAttribute("aria-roledescription", "diapositive"); sec.setAttribute("aria-label", (i + 1) + " sur " + list.length);
        var bg = el("div", "hs-bg"); bg.setAttribute("aria-hidden", "true");
        var img = s.image_url || (s.zone && zm && zm[s.zone] && zm[s.zone].image_url); if (img) setVar(bg, img);
        bg.style.setProperty("--ov", ((s.overlay == null ? 55 : s.overlay) / 100).toFixed(2));
        var w = el("div", "wrap hs-in"), t = el("div", "hs-t");
        if (s.kicker) t.appendChild(el("span", "hs-k", s.kicker));
        t.appendChild(el(i === 0 ? "h1" : "h2", "hs-h", s.title));
        if (s.subtitle) t.appendChild(el("p", "hs-p", s.subtitle));
        var b = el("div", "hs-b"), u = safeHref(s.cta_url), u2 = safeHref(s.cta2_url);
        if (s.cta_label && u) { var a = el("a", "btn btn-gold", s.cta_label); a.href = u; b.appendChild(a); }
        if (s.cta2_label && u2) { var a2 = el("a", "btn btn-ghost", s.cta2_label); a2.href = u2; b.appendChild(a2); }
        if (b.children.length) t.appendChild(b);
        w.appendChild(t); sec.appendChild(bg); sec.appendChild(w); sl.appendChild(sec); slides.push(sec);
        var dt = el("button"); dt.type = "button"; dt.setAttribute("aria-label", "Aller à la diapositive " + (i + 1)); dt.addEventListener("click", function () { go(i); }); dots.appendChild(dt);
      });
      go(0, true);
    }
    function go(i, first) {
      if (!slides.length) return; cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === cur); s.setAttribute("aria-hidden", k !== cur); $$("a", s).forEach(function (a) { a.tabIndex = k === cur ? 0 : -1; }); });
      $$("button", dots).forEach(function (b, k) { b.classList.remove("on"); if (k === cur) { void b.offsetWidth; b.classList.add("on"); b.style.setProperty("--d", DUR + "ms"); } b.setAttribute("aria-current", k === cur); });
      clearTimeout(timer); if (slides.length > 1 && !reduce) timer = setTimeout(function () { go(cur + 1); }, DUR);
    }
    function count(n, node) { var t = +n, t0 = performance.now(); (function step(now) { var p = Math.min((now - t0) / 1100, 1); node.textContent = Math.round(t * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0); }
    function applyCfg(c) {
      if (!c || typeof c !== "object") return;
      var st = $("#hs-st"), call = $("#hx-call");
      if (c.duration) DUR = Math.max(3, Math.min(20, +c.duration || 6.5)) * 1000;
      if (st) {
        if (c.show_stats === false) st.style.display = "none";
        else if (Array.isArray(c.stats) && c.stats.length) {
          st.textContent = "";
          c.stats.slice(0, 4).forEach(function (x) { if (!x || x.n == null || x.n === "") return; var dv = el("div"), b = el("b", "", String(x.n)); dv.appendChild(b); dv.appendChild(el("span", "", x.l || "")); st.appendChild(dv); if (/^\d{1,6}$/.test(String(x.n)) && !reduce) { b.textContent = "0"; count(x.n, b); } });
        }
      }
      if (call) {
        if (c.show_call === false) call.hidden = true;
        else if (c.call_phone) {
          var ph = String(c.call_phone), dg = ph.replace(/[^\d+]/g, ""); if (/^\d{8}$/.test(dg)) dg = "+509" + dg;
          call.href = "tel:" + dg; var sp = $("span", call); sp.textContent = ""; sp.appendChild(el("small", "", c.call_label || "Appelez-nous")); sp.appendChild(d.createTextNode(ph));
        }
      }
    }
    $(".hs-ar.p", box).addEventListener("click", function () { go(cur - 1); }); $(".hs-ar.n", box).addEventListener("click", function () { go(cur + 1); });
    box.addEventListener("mouseenter", function () { box.classList.add("paused"); clearTimeout(timer); }); box.addEventListener("mouseleave", function () { box.classList.remove("paused"); go(cur); });
    box.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); });
    var x0 = null; box.addEventListener("pointerdown", function (e) { x0 = e.clientX; }); box.addEventListener("pointerup", function (e) { if (x0 != null && Math.abs(e.clientX - x0) > 50) go(cur + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    d.addEventListener("visibilitychange", function () { if (d.hidden) clearTimeout(timer); else go(cur); });
    /* tout est attendu (diapos, image, réglages) puis la bannière apparaît d'un seul bloc : plus de bannière provisoire */
    var wait = Promise.all([IFSA.slides().catch(function () { return null; }), zones(), IFSA.config("hero_config")]);
    Promise.race([wait, new Promise(function (r) { setTimeout(function () { r(null); }, 6000); })]).then(function (r) {
      var rows = ((r && r[0]) || []).filter(function (x) { return x.title; }), zm = (r && r[1]) || {}, cfg = r && r[2];
      applyCfg(cfg);
      var list = rows.length ? rows : DEFAULT_SLIDES, f = list[0], u = IFSA.url(f.image_url || (f.zone && zm[f.zone] && zm[f.zone].image_url) || "");
      return preload(u).then(function () { build(list, zm); box.classList.remove("hs-ld"); box.classList.add("hs-in-ready"); });
    });
  }

  /* ---------- 6. actualités à la une (accueil) ---------- */
  function newsSlider() {
    var box = $("#ns"); if (!box) return; var sec = box.closest("section");
    IFSA.news().then(function (rows) {
      rows = rows.slice(0, 8); if (!rows.length) return; box.textContent = "";
      withStats("news", rows.map(function (r) { return r.id; })).then(function (sm) {
        rows.forEach(function (r) {
          var a = el("a", "ns-c"); a.href = "article.html?id=" + encodeURIComponent(r.id); if (r.image_url) setVar(a, r.image_url);
          a.appendChild(el("span", "k", r.category || "Actualités")); a.appendChild(el("h3", "", r.title));
          var s = el("small"); s.appendChild(el("span", "", fmt(r.published_at))); var st = sm[r.id]; s.appendChild(el("span", "", "♥ " + (st ? st.likes : 0))); a.appendChild(s); box.appendChild(a);
        });
        sec.hidden = false;
        var s = 340; $(".ns-n .p", sec).onclick = function () { box.scrollBy({ left: -s, behavior: reduce ? "auto" : "smooth" }); }; $(".ns-n .n", sec).onclick = function () { box.scrollBy({ left: s, behavior: reduce ? "auto" : "smooth" }); };
        var t = setInterval(function () { if (sec.matches(":hover") || d.hidden) return; if (box.scrollLeft + box.clientWidth >= box.scrollWidth - 8) box.scrollTo({ left: 0, behavior: "smooth" }); else box.scrollBy({ left: s, behavior: "smooth" }); }, 5000);
        if (reduce) clearInterval(t);
      });
    }).catch(function () {});
  }

  /* ---------- 7. couvertures des facultés (accueil) : IFSA.applyZones gère data-zone-mode=var ---------- */

  /* ---------- 8. témoignages ---------- */
  var CAN = { student: 1, teacher: 1, bursar: 1, secretary: 1, branch_director: 1, manager: 1, admin: 1 };
  function testimonials() {
    var g = $("#tm-g"); if (!g) return;
    var form = $("#tm-form"), me = null;
    function card(t, mine) {
      var c = el("article", "tm-c" + (mine ? " tm-me" : "")); c.appendChild(el("p", "tm-q", t.body));
      var w = el("div", "tm-w"), n = (t.author_name || "?").trim(); w.appendChild(el("i", "", n.charAt(0).toUpperCase()));
      var x = el("div"); x.appendChild(el("b", "", n)); x.appendChild(el("span", "", [t.author_role, t.faculty].filter(Boolean).join(" · "))); w.appendChild(x); c.appendChild(w); return c;
    }
    function list() {
      IFSA.testimonials().then(function (rows) {
        rows = rows || []; markOk("#tm-g"); if (!rows.length) return; g.textContent = ""; rows.forEach(function (t) { g.appendChild(card(t, me && t.author_id === me.id)); });
        var mine = me && rows.filter(function (t) { return t.author_id === me.id; })[0]; if (mine && form) { var ta = $("textarea", form); if (ta && !ta.value) { ta.value = mine.body; ta.dispatchEvent(new Event("input")); } form.dataset.has = "1"; $(".tm-go", form).textContent = "Modifier mon témoignage"; }
      }).catch(function () {});
    }
    function msg(t, ok) { var m = $(".tm-msg", form); m.textContent = t; m.className = "tm-msg " + (ok ? "tm-ok" : "tm-er"); }
    IFSA.me().then(function (u) {
      me = u; list(); if (!form) return; form.hidden = false;
      var gate = $(".tm-gate", form), body = $(".tm-body", form);
      if (!u) { gate.hidden = false; gate.innerHTML = '<h3>Partagez votre expérience</h3><p>Connectez-vous pour écrire un témoignage.</p><a class="btn btn-gold" href="connexion.html">Se connecter</a>'; return; }
      if (!CAN[u.role]) { gate.hidden = false; gate.innerHTML = '<h3>Témoignages</h3><p>L\'écriture d\'un témoignage est réservée aux étudiants, enseignants, membres du personnel et directeurs.</p>'; return; }
      body.hidden = false; var ta = $("textarea", form), cnt = $(".tm-cnt", form); ta.addEventListener("input", function () { cnt.textContent = ta.value.length + " / 600"; });
      form.addEventListener("submit", function (e) {
        e.preventDefault(); var v = ta.value.trim(); if (v.length < 10) { msg("Écrivez au moins 10 caractères.", false); return; }
        var btn = $(".tm-go", form); btn.disabled = true;
        IFSA.client().then(function (c) {
          var q = form.dataset.has ? c.from("testimonials").update({ body: v }).eq("author_id", u.id) : c.from("testimonials").insert({ body: v, author_id: u.id, faculty: $("select", form).value || null });
          return q;
        }).then(function (r) { btn.disabled = false; if (r.error) { msg(/duplicate|unique/i.test(r.error.message) ? "Vous avez déjà un témoignage : il a été mis à jour." : "Envoi impossible pour le moment.", false); return; } msg("Merci ! Votre témoignage est publié.", true); form.dataset.has = "1"; list(); }).catch(function () { btn.disabled = false; msg("Envoi impossible pour le moment.", false); });
      });
    });
  }

  /* ---------- 9. page Actualités : « Le Journal d'IFSA » (mise en page de journal) ---------- */
  function journal() {
    var root = $("#jn"); if (!root) return;
    var N = [], EV = [], cat = "Tous", q = "", shown = 8, sm = {}, cfg = {};
    var out = $("#jn-out"), cats = $("#jn-cats"), none = $("#jn-none"), more = $("#jn-more"), count = $("#jn-count");
    var T = function (v) { return String(v == null ? "" : v); };
    var folded = function (v) { try { return T(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { return T(v).toLowerCase(); } };
    var isOff = function (r) { var c = folded(r.category); var kw = (cfg.official_kw || "annonce,communique,officiel").split(",").map(function (x) { return folded(x).trim(); }).filter(Boolean); return kw.some(function (k) { return c.indexOf(k) >= 0; }); };
    var href = function (r) { return "article.html?id=" + encodeURIComponent(r.id); };
    var imgUrl = function (r) { return r.image_url ? IFSA.url(r.image_url) : ""; };
    function photo(r, cls, alt) {
      var u = imgUrl(r); if (!u) return null;
      var a = el("a", "jn-ph " + (cls || "")); a.href = href(r); if (!alt) { a.tabIndex = -1; a.setAttribute("aria-hidden", "true"); }
      var i = el("img"); i.src = u; i.alt = alt || ""; i.loading = "lazy"; i.decoding = "async"; i.addEventListener("error", function () { a.remove(); }); a.appendChild(i); return a;
    }
    function head(r, lvl, cls) { var h = el(lvl, cls || ""), a = el("a", "", r.title); a.href = href(r); h.appendChild(a); return h; }
    function kick(r) { return el("span", "jn-kick", r.category || "Actualités"); }
    function when(r) { var t = el("time", "jn-date", fmtT((r.published_at || "").slice(0, 10))); if (r.published_at) t.setAttribute("datetime", String(r.published_at).slice(0, 10)); return t; }
    function foot(r) { var w = el("div", "jn-foot"); w.appendChild(when(r)); var rd = el("a", "jn-read", "Lire l’article →"); rd.href = href(r); rd.setAttribute("aria-label", "Lire l’article : " + r.title); w.appendChild(rd); w.appendChild(likeBtn("news", r.id, sm[r.id])); return w; }
    function lead(r) {
      var f = el("article", "jn-lead"), ph = photo(r, "jn-lead-ph", r.title); if (ph) f.appendChild(ph); else f.classList.add("nophoto");
      var t = el("div", "jn-lead-tx"); var tg = el("div", "jn-tags"); tg.appendChild(el("span", "jn-flag", "À la une")); tg.appendChild(kick(r)); t.appendChild(tg); t.appendChild(head(r, "h2", "jn-h1"));
      if (r.summary) t.appendChild(el("p", "jn-sum", r.summary)); t.appendChild(foot(r)); f.appendChild(t); return f;
    }
    function brief(r) { var a = el("article", "jn-brief"), ph = photo(r, "jn-brief-ph"); if (ph) a.appendChild(ph); var t = el("div"); t.appendChild(kick(r)); t.appendChild(head(r, "h3")); t.appendChild(when(r)); a.appendChild(t); return a; }
    function card(r) { var a = el("article", "jn-card"), ph = photo(r, "jn-card-ph"); if (ph) a.appendChild(ph); a.appendChild(kick(r)); a.appendChild(head(r, "h3")); if (r.summary) a.appendChild(el("p", "jn-sum", r.summary)); a.appendChild(foot(r)); return a; }
    function row(r) { var a = el("article", "jn-row"), ph = photo(r, "jn-row-ph"); if (ph) a.appendChild(ph); else a.classList.add("nophoto"); var t = el("div"); t.appendChild(kick(r)); t.appendChild(head(r, "h3")); if (r.summary) t.appendChild(el("p", "jn-sum", r.summary)); t.appendChild(foot(r)); a.appendChild(t); return a; }
    function sect(title, id) { var s = el("section", "jn-sec"); if (id) s.id = id; var h = el("h2", "jn-sh", title); s.appendChild(h); return s; }

    function asideBlocks(off) {
      var A = el("aside", "jn-aside"); A.setAttribute("aria-label", "Annonces et agenda");
      if (cfg.show_official !== false && off.length) {
        var b = el("section", "jn-box jn-official"); b.appendChild(el("h2", "jn-sh", "Annonces officielles"));
        off.slice(0, 4).forEach(function (r) { var it = el("article", "jn-off"); it.appendChild(when(r)); it.appendChild(head(r, "h3")); if (r.summary) it.appendChild(el("p", "", r.summary)); b.appendChild(it); });
        A.appendChild(b);
      }
      var today = new Date().toISOString().slice(0, 10), up = EV.filter(function (e) { return e.event_date >= today; }).slice(0, 4);
      if (cfg.show_events !== false && up.length) {
        var e = el("section", "jn-box jn-events"); e.appendChild(el("h2", "jn-sh", "À l’agenda"));
        up.forEach(function (ev) {
          var D = new Date(ev.event_date + "T12:00:00"), it = el("article", "jn-ev"), dt = el("time", "jn-ev-d"); dt.setAttribute("datetime", ev.event_date);
          dt.appendChild(el("b", "", String(D.getDate()))); dt.appendChild(el("span", "", D.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")));
          var tx = el("div"); tx.appendChild(el("h3", "", ev.title)); if (ev.place) tx.appendChild(el("span", "jn-ev-p", ev.place)); if (ev.description) tx.appendChild(el("p", "", ev.description));
          it.appendChild(dt); it.appendChild(tx); e.appendChild(it);
        });
        var all = el("a", "jn-all", "Tous les événements →"); all.href = "evenements.html"; e.appendChild(all); A.appendChild(e);
      }
      return A.children.length ? A : null;
    }

    function draw() {
      out.textContent = ""; more.hidden = true; none.hidden = true; count.textContent = ""; var bar = $(".jn-bar"); if (bar) bar.hidden = !N.length;
      if (!N.length) { none.hidden = false; none.querySelector("p").textContent = "Le journal n’a pas encore publié d’article. Revenez bientôt : les prochaines publications apparaîtront ici."; return; }
      var filtering = cat !== "Tous" || !!q;
      var L = N.filter(function (r) { return (cat === "Tous" || r.category === cat) && (!q || folded(r.title + " " + (r.summary || "") + " " + (r.body || "") + " " + (r.category || "")).indexOf(q) >= 0); });
      if (filtering) {
        count.textContent = L.length ? L.length + (L.length > 1 ? " articles" : " article") + (cat !== "Tous" ? " dans « " + cat + " »" : "") + (q ? " pour « " + $("#jn-q").value.trim() + " »" : "") : "";
        if (!L.length) { none.hidden = false; none.querySelector("p").textContent = "Aucun article ne correspond à votre recherche" + (cat !== "Tous" ? " dans « " + cat + " »" : "") + ". Essayez d’autres mots ou une autre rubrique."; return; }
        var s = sect(cat !== "Tous" ? cat : "Résultats de la recherche"), g = el("div", "jn-rows"); L.slice(0, shown).forEach(function (r) { g.appendChild(row(r)); }); s.appendChild(g); out.appendChild(s);
        more.hidden = L.length <= shown; return;
      }
      var off = N.filter(isOff), main = N.filter(function (r) { return !isOff(r); });
      if (!main.length) { main = off; off = []; }
      var front = el("section", "jn-front"); front.setAttribute("aria-label", "À la une"); front.appendChild(lead(main[0]));
      var side = main.slice(1, 5); if (side.length) { var sd = el("div", "jn-side"); side.forEach(function (r) { sd.appendChild(brief(r)); }); front.appendChild(sd); }
      out.appendChild(front);
      var rest = main.slice(5), A = asideBlocks(off), wrap = el("div", "jn-cols" + (A ? "" : " solo"));
      if (rest.length) {
        var s2 = sect("Dernières actualités", "jn-latest"), shownRest = rest.slice(0, shown), cg = el("div", "jn-cards"), rg = el("div", "jn-rows");
        shownRest.forEach(function (r, i) { (i < 3 ? cg : rg).appendChild(i < 3 ? card(r) : row(r)); });
        s2.appendChild(cg); if (rg.children.length) s2.appendChild(rg); wrap.appendChild(s2); more.hidden = rest.length <= shown;
      }
      if (A) wrap.appendChild(A);
      if (wrap.children.length) out.appendChild(wrap);
    }
    function filters() {
      var set = ["Tous"]; N.forEach(function (r) { if (r.category && set.indexOf(r.category) < 0) set.push(r.category); });
      cats.textContent = ""; cats.hidden = set.length < 3;
      set.forEach(function (c) { var b = el("button", "", c); b.type = "button"; b.setAttribute("aria-pressed", String(c === cat)); b.addEventListener("click", function () { cat = c; shown = 8; $$("button", cats).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); draw(); }); cats.appendChild(b); });
    }
    var tmr = 0;
    $("#jn-q").addEventListener("input", function (e) { var v = e.target.value; clearTimeout(tmr); tmr = setTimeout(function () { q = folded(v.trim()); shown = 8; draw(); }, 120); });
    $("#jn-sf").addEventListener("submit", function (e) { e.preventDefault(); });
    $("button", more).addEventListener("click", function () { shown += 8; draw(); });
    (function () { var n = $("#jn-date"); if (!n) return; var D = new Date(); n.textContent = D.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); n.setAttribute("datetime", D.toISOString().slice(0, 10)); })();
    function applyCfg(c) {
      cfg = c && typeof c === "object" ? c : {};
      var sub = $("#jn-sub"), ed = $("#jn-ed"); if (sub && cfg.subtitle) sub.textContent = String(cfg.subtitle).slice(0, 200); if (ed && cfg.edition) ed.textContent = String(cfg.edition).slice(0, 40);
    }
    Promise.all([IFSA.config("journal_config").catch(function () { return null; }), IFSA.events().catch(function () { return []; }), IFSA.news()]).then(function (r) {
      applyCfg(r[0]); EV = r[1] || []; N = r[2] || [];
      return withStats("news", N.map(function (x) { return x.id; })).catch(function () { return {}; });
    }).then(function (m) { sm = m || {}; filters(); draw(); root.setAttribute("aria-busy", "false"); })
      .catch(function () { root.setAttribute("aria-busy", "false"); none.hidden = false; none.querySelector("p").textContent = "Les actualités sont momentanément indisponibles. Réessayez dans quelques instants."; });
  }

  /* ---------- 10. j'aime sur la page d'un article ---------- */
  function articleLike() {
    var h = $("article h1, main h1"); if (!h || PAGE !== "article") return; var id = new URLSearchParams(location.search).get("id"); if (!id) return;
    var box = el("div", "art-like"); box.appendChild(el("span", "", "Cet article vous a plu ?"));
    withStats("news", [id]).then(function (m) { box.appendChild(likeBtn("news", id, m[id])); });
    var host = $("#body, .art-body, article") || $("main"); (host || d.body).appendChild(box);
  }

  /* ---------- 11. apparition sans saut : les blocs alimentés par la base se dévoilent quand ils sont prêts ---------- */
  function markOk(sel) { $$(sel).forEach(function (e) { e.classList.add("ifx-ok", "ifx-reveal"); }); }
  function ready(sel, p) { if (!$$(sel).length) return; var f = function () { setTimeout(function () { markOk(sel); }, 40); }; Promise.resolve(p).then(f, f); }
  function marks() {
    if (!window.IFSA) return;
    ready("#home-agenda", IFSA.events()); ready("#home-news", IFSA.news()); ready("#up,#past,#ef", IFSA.events()); ready("#gal,#gf", IFSA.gallery());
    ready("#tm-g", IFSA.testimonials()); if (!$("#tm-g")) return;
  }

  /* ---------- 12. « Le Journal d'IFSA » : étincelles ---------- */
  function sparkle() {
    var t = $(".jr-t"); if (!t || $(".jr-w", t)) return;
    var w = el("span", "jr-w"); while (t.firstChild) w.appendChild(t.firstChild); t.appendChild(w);
    var P = [[3, 8, 14, 0, 2.6], [16, -16, 18, .5, 3], [34, 90, 12, 1.1, 2.4], [48, -14, 16, 1.6, 2.8], [64, 96, 18, .3, 3.2], [80, -10, 12, 2, 2.5], [94, 14, 16, 1.2, 2.9], [101, 70, 12, .8, 2.6], [-3, 62, 16, 2.3, 3], [25, 40, 10, 1.9, 2.2], [58, 42, 10, .6, 2.7], [88, 50, 12, 1.4, 2.3]];
    P.forEach(function (q) { var s = el("span", "spk"); s.setAttribute("aria-hidden", "true"); s.style.cssText = "left:" + q[0] + "%;top:" + q[1] + "%;--s:" + q[2] + "px;--w:" + q[3] + "s;--d:" + q[4] + "s"; s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>'; w.appendChild(s); });
  }

  function boot() { marks(); sparkle(); printHead(); theme(); heroes(); hero(); newsSlider(); testimonials(); journal(); articleLike(); if (window.IFSA) IFSA.applyZones(); }
  function start() { if (window.IFSA) return boot(); var s = d.createElement("script"); s.src = "site-data.js"; s.onload = boot; s.onerror = function () { printHead(); theme(); }; d.head.appendChild(s); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
})();
/* Session expirée : message clair quand un espace connecté renvoie vers l'accueil */
(function(){try{var q=new URLSearchParams(location.search);if(!q.has("expired"))return;var d=document.createElement("div");d.className="ifx-exp";d.setAttribute("role","status");d.style.cssText="position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:300;background:#0B1F4B;color:#fff;border:1px solid #C9A24B;border-radius:14px;padding:12px 18px;font:600 .9rem 'Plus Jakarta Sans',sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.35);max-width:92vw;text-align:center";d.textContent="Votre session a expiré. Reconnectez-vous pour continuer.";document.body.appendChild(d);setTimeout(function(){d.remove()},7000);history.replaceState(null,"",location.pathname)}catch(e){}})();
