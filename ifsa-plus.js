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
    { kicker: "Depuis 2007 · 4 sites en Haïti", title: "L'éducation aujourd'hui, le succès demain", subtitle: "Car votre réussite est notre succès. Une formation supérieure de qualité, au meilleur coût.", cta_label: "Candidater maintenant", cta_url: "admissions.html", cta2: ["Découvrir les facultés", "facultes.html"], zone: "home-hero" },
    { kicker: "7 facultés", title: "Choisissez la formation qui vous ressemble", subtitle: "Informatique, comptabilité, administration, gestion, éducation, agronomie et sciences infirmières.", cta_label: "Voir les facultés", cta_url: "facultes.html" },
    { kicker: "Inscriptions ouvertes", title: "Rejoignez IFSA University", subtitle: "Des professionnels compétents, éthiques et innovants formés près de chez vous.", cta_label: "Commencer mon inscription", cta_url: "inscription.html" }
  ];
  function hero() {
    var box = $("#hs"); if (!box) return;
    var sl = $(".hs-sl", box), dots = $(".hs-dots", box), cur = 0, slides = [], timer = null, DUR = 6500;
    function build(list, zm) {
      sl.textContent = ""; dots.textContent = ""; slides = [];
      list.forEach(function (s, i) {
        var sec = el("div", "hs-s"); sec.setAttribute("role", "group"); sec.setAttribute("aria-roledescription", "diapositive"); sec.setAttribute("aria-label", (i + 1) + " sur " + list.length);
        var bg = el("div", "hs-bg"); bg.setAttribute("aria-hidden", "true");
        var img = s.image_url || (s.zone && zm && zm[s.zone] && zm[s.zone].image_url); if (img) setVar(bg, img);
        bg.style.setProperty("--ov", ((s.overlay == null ? 55 : s.overlay) / 100).toFixed(2));
        var w = el("div", "wrap hs-in"), t = el("div", "hs-t");
        if (s.kicker) t.appendChild(el("span", "hs-k", s.kicker));
        t.appendChild(el(i === 0 ? "h1" : "h2", "hs-h", s.title));
        if (s.subtitle) t.appendChild(el("p", "hs-p", s.subtitle));
        var b = el("div", "hs-b"), u = safeHref(s.cta_url);
        if (s.cta_label && u) { var a = el("a", "btn btn-gold", s.cta_label); a.href = u; b.appendChild(a); }
        if (s.cta2) { var a2 = el("a", "btn btn-ghost", s.cta2[0]); a2.href = s.cta2[1]; b.appendChild(a2); }
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
    $(".hs-ar.p", box).addEventListener("click", function () { go(cur - 1); }); $(".hs-ar.n", box).addEventListener("click", function () { go(cur + 1); });
    box.addEventListener("mouseenter", function () { box.classList.add("paused"); clearTimeout(timer); }); box.addEventListener("mouseleave", function () { box.classList.remove("paused"); go(cur); });
    box.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(cur - 1); if (e.key === "ArrowRight") go(cur + 1); });
    var x0 = null; box.addEventListener("pointerdown", function (e) { x0 = e.clientX; }); box.addEventListener("pointerup", function (e) { if (x0 != null && Math.abs(e.clientX - x0) > 50) go(cur + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    d.addEventListener("visibilitychange", function () { if (d.hidden) clearTimeout(timer); else go(cur); });
    zones().then(function (zm) {
      build(DEFAULT_SLIDES, zm);
      IFSA.slides().then(function (rows) { rows = rows.filter(function (r) { return r.title; }); if (rows.length) build(rows, zm); }).catch(function () {});
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
      IFSA.client().then(function (c) { return c.from("testimonials").select("*").eq("published", true).order("created_at", { ascending: false }).limit(30); }).then(function (r) {
        var rows = (r && r.data) || []; if (!rows.length) return; g.textContent = ""; rows.forEach(function (t) { g.appendChild(card(t, me && t.author_id === me.id)); });
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

  /* ---------- 9. page Actualités : style journal ---------- */
  function journal() {
    var root = $("#jr"); if (!root) return;
    var N = [], cat = "Tous", q = "", shown = 9, sm = {};
    var lead = $("#jr-lead"), grid = $("#jr-g"), cats = $("#jr-cats"), none = $("#jr-none"), more = $("#jr-more");
    function art(r, big) {
      var h = el(big ? "h2" : "h3"), a = el("a", "", r.title); a.href = "article.html?id=" + encodeURIComponent(r.id); h.appendChild(a); return h;
    }
    function imgBox(r, cls) { var i = el("div", cls); if (r.image_url) { var u = IFSA.url(r.image_url); if (u) i.style.backgroundImage = 'url("' + u + '")'; } return i; }
    function actions(r) { var w = el("div", "jr-act"); w.appendChild(likeBtn("news", r.id, sm[r.id])); var a = el("a", "jr-read", "Lire →"); a.href = "article.html?id=" + encodeURIComponent(r.id); w.appendChild(a); return w; }
    function draw() {
      var L = N.filter(function (r) { return (cat === "Tous" || r.category === cat) && (!q || (r.title + " " + (r.summary || "")).toLowerCase().indexOf(q) >= 0); });
      lead.textContent = ""; grid.textContent = ""; none.hidden = !!L.length; more.hidden = true; if (!L.length) return;
      var f = L[0], rest = L.slice(1, shown);
      var im = imgBox(f, "im"); im.appendChild(el("span", "jr-kick", f.category || "Actualités")); im.lastChild.style.cssText = "position:absolute;top:16px;left:16px";
      var tx = el("div"); tx.appendChild(el("span", "jr-kick", "À la une")); tx.appendChild(art(f, true)); if (f.summary) tx.appendChild(el("p", "", f.summary));
      var by = el("div", "jr-by"); by.appendChild(el("span", "", fmtT(f.published_at))); tx.appendChild(by); tx.appendChild(actions(f)); lead.appendChild(im); lead.appendChild(tx);
      rest.forEach(function (r) {
        var c = el("article", "jr-card"); c.appendChild(imgBox(r, "im")); var by2 = el("div", "jr-by"); by2.appendChild(el("span", "jr-kick", r.category || "Actualités")); by2.appendChild(el("span", "", fmtT(r.published_at))); c.appendChild(by2);
        c.appendChild(art(r)); if (r.summary) c.appendChild(el("p", "", r.summary)); c.appendChild(actions(r)); grid.appendChild(c);
      });
      more.hidden = L.length - 1 <= shown;
    }
    function filters() {
      var set = ["Tous"]; N.forEach(function (r) { if (r.category && set.indexOf(r.category) < 0) set.push(r.category); });
      cats.textContent = ""; set.forEach(function (c) { var b = el("button", "", c); b.type = "button"; b.setAttribute("aria-pressed", c === cat); b.addEventListener("click", function () { cat = c; shown = 9; $$("button", cats).forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); draw(); }); cats.appendChild(b); });
    }
    $("#jr-q").addEventListener("input", function (e) { q = e.target.value.trim().toLowerCase(); shown = 9; draw(); });
    $("button", more).addEventListener("click", function () { shown += 9; draw(); });
    (function () { var n = $("#jr-date"); function tick() { var D = new Date(); n.textContent = D.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · " + D.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); } tick(); setInterval(tick, 20000); })();
    IFSA.news().then(function (rows) { N = rows; return withStats("news", rows.map(function (r) { return r.id; })); }).then(function (m) { sm = m || {}; filters(); draw(); }).catch(function () { none.hidden = false; none.textContent = "Les actualités sont momentanément indisponibles."; });
  }

  /* ---------- 10. j'aime sur la page d'un article ---------- */
  function articleLike() {
    var h = $("article h1, main h1"); if (!h || PAGE !== "article") return; var id = new URLSearchParams(location.search).get("id"); if (!id) return;
    var box = el("div", "art-like"); box.appendChild(el("span", "", "Cet article vous a plu ?"));
    withStats("news", [id]).then(function (m) { box.appendChild(likeBtn("news", id, m[id])); });
    var host = $("#body, .art-body, article") || $("main"); (host || d.body).appendChild(box);
  }

  function boot() { printHead(); theme(); heroes(); hero(); newsSlider(); testimonials(); journal(); articleLike(); if (window.IFSA) IFSA.applyZones(); }
  function start() { if (window.IFSA) return boot(); var s = d.createElement("script"); s.src = "site-data.js"; s.onload = boot; s.onerror = function () { printHead(); theme(); }; d.head.appendChild(s); }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", start); else start();
})();
/* Session expirée : message clair quand un espace connecté renvoie vers l'accueil */
(function(){try{var q=new URLSearchParams(location.search);if(!q.has("expired"))return;var d=document.createElement("div");d.className="ifx-exp";d.setAttribute("role","status");d.style.cssText="position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:300;background:#0B1F4B;color:#fff;border:1px solid #C9A24B;border-radius:14px;padding:12px 18px;font:600 .9rem 'Plus Jakarta Sans',sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.35);max-width:92vw;text-align:center";d.textContent="Votre session a expiré. Reconnectez-vous pour continuer.";document.body.appendChild(d);setTimeout(function(){d.remove()},7000);history.replaceState(null,"",location.pathname)}catch(e){}})();
