/* IFSA University — page « Cours en ligne » : bibliothèque, salle de cours, lecteur sécurisé, commentaires.
   Les identifiants vidéo ne sont jamais envoyés par la base aux personnes non autorisées (voir supabase-update-8a.sql). */
(function () {
  "use strict";
  var d = document, root = d.documentElement;
  var $ = function (i) { return d.getElementById(i); };
  var X = function (t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FAC = ["Sciences informatiques", "Sciences comptables", "Sciences administratives", "Sciences de la gestion", "Sciences de l'éducation", "Sciences agronomiques", "Sciences infirmières"];
  var HUE = [["#2F5BD3", "#0B1F4B"], ["#0E9F6E", "#064E3B"], ["#7C3AED", "#2E1065"], ["#D97706", "#78350F"], ["#DB2777", "#500724"], ["#65A30D", "#1A2E05"], ["#0891B2", "#083344"]];
  var AUD = { "public": "Public", members: "Comptes connectés", student: "Étudiants", selected: "Étudiants sélectionnés", teacher: "Enseignants", staff: "Personnel" };
  var IC = {
    play: '<path d="M8 5v14l11-7z"/>', pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>', lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>', check: '<path d="M20 6 9 17l-5-5"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>', fwd: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>', vol: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>', rot: '<rect width="18" height="12" x="3" y="6" rx="2" transform="rotate(0)"/><path d="M12 2v2M8 21.5h8"/><path d="m18 2 2 2-2 2"/>',
    full: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>', cine: '<rect width="20" height="12" x="2" y="6" rx="2"/><path d="M2 10h20"/>',
    speed: '<path d="M12 14l4-4"/><path d="M3.3 17a10 10 0 1 1 17.4 0"/>', msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    note: '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M8 8h7M8 12h7M8 16h4"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V22h16"/>', trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>', chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>', wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01"/>'
  };
  var ic = function (n, c) { return '<svg class="cx-ic ' + (c || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || "") + "</svg>"; };
  var store = { get: function (k, df) { try { var v = localStorage.getItem("ifsa_" + k); return v ? JSON.parse(v) : df; } catch (e) { return df; } }, set: function (k, v) { try { localStorage.setItem("ifsa_" + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } } };
  var nz = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var auth = (function () { try { return JSON.parse(sessionStorage.getItem("ifsa_auth") || localStorage.getItem("ifsa_auth") || "null"); } catch (e) { return null; } })();
  var LOGGED = !!auth, ROLE = auth && auth.role || "";
  var fmtT = function (s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(r).padStart(2, "0"); };
  var durMin = function (t) { var p = String(t || "").split(":").map(Number); if (p.some(isNaN) || !p.length) return 0; return p.length === 3 ? p[0] * 60 + p[1] + p[2] / 60 : p.length === 2 ? p[0] + p[1] / 60 : p[0]; };
  var initials = function (n) { return String(n || "?").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase() || "?"; };
  var hueOf = function (n) { var h = 0; String(n).split("").forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) % 360; }); return h; };
  var toastT; function toast(t, bad) { var e = $("cxToast"); e.textContent = t; e.className = "cx-toast on" + (bad ? " bad" : ""); clearTimeout(toastT); toastT = setTimeout(function () { e.className = "cx-toast"; }, 3200); }

  var C = [], loaded = false, cur = null, li = 0;
  var f = { q: "", fac: "Toutes", an: "Toutes", stat: "Toutes", sort: "az" };

  function norm(r) { return { id: r.id, title: r.title, fac: r.faculty || "Cours généraux", opt: r.opt || "", an: r.year || 0, teacher: r.teacher || "", desc: r.description || "", locked: !!r.locked, aud: r.audience, allowYt: !!r.allow_youtube, cover: r.cover_url || "", comments: r.comments !== false, lessons: (r.lessons || []).map(function (l) { return { id: l.id, t: l.t, yt: l.yt || "", dur: l.dur || "" }; }) }; }
  var guarded = function (c) { return c && c.aud !== "public" && !c.locked; };
  var done = function (c) { return store.get("done", {})[c.id] || []; };
  var pct = function (c) { return c.locked || !c.lessons.length ? 0 : Math.round(done(c).length / c.lessons.length * 100); };
  var totMin = function (c) { return Math.round(c.lessons.reduce(function (s, l) { return s + durMin(l.dur); }, 0)); };
  var facIdx = function (c) { var i = FAC.indexOf(c.fac); return i < 0 ? 0 : i; };
  var thumbUrl = function (c) { if (c.cover) return c.cover; var y = c.aud === "public" && !c.locked && c.lessons[0] && c.lessons[0].yt; return y ? "https://i.ytimg.com/vi/" + y + "/hqdefault.jpg" : ""; };
  function thumb(c, big) {
    var u = thumbUrl(c), h = HUE[facIdx(c)];
    return '<span class="cx-th">' + (u ? '<img loading="lazy" src="' + X(u) + '" alt="" onerror="this.remove()">' : '<span class="cx-art" style="background:linear-gradient(150deg,' + h[0] + "," + h[1] + ')"><b>' + X(initials(c.title)) + "</b></span>") +
      (c.locked ? '<span class="cx-lockc">' + ic("lock") + "</span>" : '<span class="cx-play">' + ic("play") + "</span>") +
      (c.aud !== "public" ? '<span class="cx-pill tl">' + ic("lock") + (c.locked ? "Verrouillé" : "Réservé") + " · " + X(AUD[c.aud] || "") + "</span>" : "") +
      (totMin(c) ? '<span class="cx-pill br">' + totMin(c) + " min</span>" : "") +
      (LOGGED && !c.locked && pct(c) ? '<span class="cx-prog-b"><i style="width:' + pct(c) + '%"></i></span>' : "") + "</span>";
  }

  /* ================= BIBLIOTHÈQUE ================= */
  function counts() { var m = { Toutes: C.length }; FAC.forEach(function (x) { m[x] = C.filter(function (c) { return c.fac === x; }).length; }); return m; }
  function drawChips() {
    var m = counts();
    $("cxChips").innerHTML = ["Toutes"].concat(FAC).map(function (x) { return '<button type="button" class="cx-chip' + (f.fac === x ? " on" : "") + '" data-f="' + X(x) + '">' + (x === "Toutes" ? "Toutes les facultés" : X(x)) + " <small>" + (m[x] || 0) + "</small></button>"; }).join("");
  }
  function filtered() {
    var L = C.filter(function (c) { return (f.fac === "Toutes" || c.fac === f.fac) && (f.an === "Toutes" || String(c.an) === f.an) && nz([c.title, c.opt, c.fac, c.desc, c.teacher].join(" ")).indexOf(nz(f.q)) > -1; });
    if (LOGGED && f.stat !== "Toutes") L = L.filter(function (c) { var p = pct(c); return f.stat === "new" ? p === 0 : f.stat === "ok" ? p === 100 : p > 0 && p < 100; });
    L.sort(function (a, b) { return f.sort === "an" ? a.an - b.an : f.sort === "pg" ? pct(b) - pct(a) : a.title.localeCompare(b.title, "fr"); });
    return L;
  }
  function card(c) {
    var p = pct(c), n = c.lessons.length;
    return '<button type="button" class="cx-card' + (c.locked ? " locked" : "") + '" data-id="' + X(c.id) + '" aria-label="' + (c.locked ? "Cours verrouillé : " : "Ouvrir le cours : ") + X(c.title) + '">' + thumb(c) +
      '<span class="cx-cb"><span class="cx-fac">' + X(c.fac) + "</span><h3>" + X(c.title) + "</h3>" + (c.desc ? '<span class="cx-desc">' + X(c.desc) + "</span>" : "") +
      '<span class="cx-meta">' + (c.teacher ? '<span class="cx-av">' + X(initials(c.teacher)) + "</span><span>" + X(c.teacher) + "</span>" : "") + "<span>" + n + " leçon" + (n > 1 ? "s" : "") + "</span>" + (c.an ? "<span>Année " + c.an + "</span>" : "") + "</span>" +
      '<span class="cx-foot">' + (c.locked ? '<span class="cx-aud">' + ic("lock") + "Réservé aux " + X((AUD[c.aud] || "").toLowerCase()) + "</span>" : LOGGED ? "<span>" + (p === 100 ? "Terminé ✓" : p ? p + " % terminé" : "Pas commencé") + "</span>" : '<span class="cx-aud" style="color:inherit">' + (c.aud === "public" ? "Accès libre" : "") + "</span>") + '<span class="go">' + (c.locked ? "Détails" : p && p < 100 ? "Reprendre" : "Commencer") + ic("arrow") + "</span></span></span></button>";
  }
  function R() {
    if (!loaded) return;
    var L = filtered();
    $("cxCnt").textContent = L.length + " cours";
    $("cxGrid").innerHTML = L.length ? L.map(card).join("") : '<div class="cx-empty">' + ic("book") + "<p>" + (C.length ? "Aucun cours ne correspond à votre recherche." : "Les cours seront bientôt disponibles.") + "</p></div>";
    drawChips(); drawResume(); drawStats(); drawFeat();
  }
  function lastMap() { return store.get("last", {}); }
  function drawResume() {
    var lm = lastMap(), L = C.filter(function (c) { return !c.locked && lm[c.id] && pct(c) < 100; }).sort(function (a, b) { return lm[b.id] - lm[a.id]; }).slice(0, 3), s = $("cxResume");
    if (!L.length) { s.hidden = true; return; }
    s.hidden = false; $("cxResumeG").innerHTML = L.map(card).join("");
  }
  function drawStats() {
    var les = C.reduce(function (s, c) { return s + c.lessons.length; }, 0), fs = {}; C.forEach(function (c) { fs[c.fac] = 1; });
    $("sC").textContent = C.length; $("sL").textContent = les; $("sF").textContent = Object.keys(fs).length;
  }
  function drawFeat() {
    var lm = lastMap(), c = C.filter(function (x) { return !x.locked && lm[x.id] && pct(x) < 100; }).sort(function (a, b) { return lm[b.id] - lm[a.id]; })[0], resumed = !!c;
    if (!c) c = C.filter(function (x) { return !x.locked && x.lessons.length; })[0] || C[0];
    var el = $("cxFeat"); if (!el) return;
    if (!c) { el.innerHTML = '<div class="cx-feat-empty"><div>' + ic("book") + "<p>Les premiers cours arrivent bientôt.</p></div></div>"; return; }
    el.innerHTML = '<div class="cx-k"><span>' + (resumed ? "Reprendre où vous étiez" : "À la une") + "</span><span>" + c.lessons.length + " leçon" + (c.lessons.length > 1 ? "s" : "") + "</span></div>" + thumb(c) + "<h3>" + X(c.title) + "</h3><p>" + X(c.fac + (c.an ? " · Année " + c.an : "")) + "</p>" +
      '<button type="button" class="cx-btn gold" data-id="' + X(c.id) + '">' + (c.locked ? ic("lock") + " Voir le cours" : ic("play", "fill") + (resumed ? " Reprendre" : " Regarder")) + "</button>";
  }
  function initLib() {
    try { var pf = new URLSearchParams(location.search).get("fac"); if (pf && FAC.indexOf(pf) > -1) f.fac = pf; } catch (e) { /* ignoré */ }
    var ch = $("cxChips"); ch.onclick = function (e) { var b = e.target.closest("button"); if (!b) return; f.fac = b.dataset.f; R(); };
    $("q").oninput = function (e) { f.q = e.target.value; R(); };
    $("cxSearchBtn").onclick = function () { $("cxLib").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
    $("fa").onchange = function (e) { f.an = e.target.value; R(); }; $("fr").onchange = function (e) { f.sort = e.target.value; R(); };
    if (LOGGED && $("fsW") && $("fst")) { $("fsW").hidden = false; $("fst").onchange = function (e) { f.stat = e.target.value; R(); }; }
    function openFrom(e) { var b = e.target.closest("[data-id]"); if (b) openRoom(b.dataset.id); }
    $("cxGrid").onclick = openFrom; $("cxResumeG").onclick = openFrom; if ($("cxFeat")) $("cxFeat").onclick = openFrom;
    if (LOGGED) { var m = $("cxMy"); if (m) m.hidden = false; var cb = $("cxCtaBand"); if (cb) cb.hidden = true; var hc = $("cxHeroCta"); if (hc) hc.innerHTML = '<a class="cx-btn glass" href="' + ({ student: "espace-etudiant.html", teacher: "espace-enseignant.html", manager: "manager.html", admin: "admin.html" }[ROLE] || "connexion.html") + '">Mon espace</a>'; }
  }
  /* liste vide : on demande à la base ce qu'elle voit pour ce compte, pour que la cause soit lisible */
  function diag() {
    IFSA.client().then(function (c) { return c.rpc("course_debug"); }).then(function (r) {
      var g = $("cxGrid").querySelector(".cx-empty"); if (!g) return;
      var o = r && r.data, t = r && r.error ? "fonction course_debug absente : exécutez supabase-update-9a.sql (" + (r.error.message || "") + ")" : o ? "connecté : " + (o.connecte ? "oui" : "non") + " · rôle : " + (o.role_profil || "—") + " · statut : " + (o.statut || "—") + " · rôle actif : " + (o.role_actif || "aucun") + " · faculté : " + (o.faculte || "non renseignée") + " · cours publiés : " + o.cours_publies + " · cours publics : " + o.cours_publics + " · visibles pour vous : " + o.cours_visibles : "";
      if (t) g.insertAdjacentHTML("beforeend", '<p style="font-size:.74rem;opacity:.7;margin-top:10px;max-width:520px">Diagnostic — ' + X(t) + "</p>");
    }).catch(function () { /* diagnostic facultatif */ });
  }
  function load() {
    $("cxGrid").innerHTML = [1, 2, 3, 4, 5, 6].map(function () { return '<div class="cx-skel"></div>'; }).join("");
    /* progression par compte : fusion discrète avec la copie du serveur (sans compte ou sans table : rien ne change) */
    if (window.IFSAProgress && LOGGED) IFSAProgress.pull().then(function (ch) { if (ch && loaded && !cur) R(); });
    IFSA.courses().then(function (rows) { C = rows.map(norm); loaded = true; R(); if (!C.length) diag(); var h = location.hash; if (h.indexOf("#cours-") === 0) { openRoom(h.slice(7), true); if (!cur) toast("Ce cours n'est pas disponible pour votre compte.", true); } })
      .catch(function (e) { var m = e && (e.message || e.details || e.code) || ""; $("cxGrid").innerHTML = '<div class="cx-empty">' + ic("wifi") + "<p>Les cours n'ont pas pu se charger.</p>" + (m ? '<p style="font-size:.78rem;opacity:.75">Détail : ' + X(m) + "</p>" : "") + "<button type=\"button\" class=\"cx-btn gold\" id=\"cxRetry\" style=\"margin-top:12px\">Réessayer</button></div>"; $("cxRetry").onclick = load; });
  }

  /* ================= SALLE DE COURS ================= */
  var room, pl = null, yp = null, ytReady = false, tick = null, vq = null, want = null, created = "", st = { playing: false, buf: false, loading: false, dur: 0, vol: 80, muted: false, speed: 1, idleT: 0, locked: false, ended: false, resumeAt: 0, saveT: 0, errT: 0, qDone: false, lt: "" };
  var prefs = store.get("pl", { q: "auto", speed: 1, vol: 80 });
  var QS = [
    { k: "auto", l: "Auto", h: 0, tag: "S'adapte à votre connexion" },
    { k: "tiny", l: "144p", h: 144, yt: "tiny", mb: .1, tag: "Économie maximale" },
    { k: "small", l: "240p", h: 240, yt: "small", mb: .3, tag: "Très économe" },
    { k: "medium", l: "360p", h: 360, yt: "medium", mb: .7, tag: "Économe" },
    { k: "large", l: "480p", h: 480, yt: "large", mb: 1.2, tag: "Équilibré" },
    { k: "hd720", l: "720p", h: 720, yt: "hd720", mb: 2.5, tag: "Haute définition", hd: 1 },
    { k: "hd1080", l: "1080p", h: 1080, yt: "hd1080", mb: 4.5, tag: "Full HD · consomme beaucoup", hd: 1 }
  ];
  var qi = function (k) { var i = QS.findIndex(function (q) { return q.k === k; }); return i < 0 ? 0 : i; };
  var mbHour = function (q) { return q.mb ? q.mb * 450 : 0; }; /* Mo par heure : Mb/s × 3600 / 8 */
  var fmtMo = function (mo) { return mo >= 1000 ? (mo / 1000).toFixed(1).replace(".", ",") + " Go" : Math.round(mo) + " Mo"; };
  var wake = null;
  function keepAwake(on) { try { if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (w) { wake = w; }).catch(function () {}); else if (!on && wake) { wake.release(); wake = null; } } catch (e) { /* facultatif */ } }

  /* --- API YouTube : chargée une seule fois (préchargée dès l'ouverture de la page), file d'attente unique --- */
  var ytQ = [], ytFailCb = null;
  function ytApi(cb, fail) {
    if (window.YT && YT.Player) return cb();
    ytQ.push(cb); ytFailCb = fail || ytFailCb;
    if (window.__cxYT) return; window.__cxYT = 1;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () { if (prev) try { prev(); } catch (e) { /* ignoré */ } var q = ytQ.splice(0); q.forEach(function (f) { try { f(); } catch (e) { /* ignoré */ } }); };
    var sc = d.createElement("script"); sc.id = "ytapi"; sc.async = true; sc.src = "https://www.youtube.com/iframe_api";
    sc.onerror = function () { window.__cxYT = 0; sc.remove(); ytQ = []; var f = ytFailCb; ytFailCb = null; if (f) f(); };
    d.head.appendChild(sc);
  }

  /* --- mise en page : l'iframe YouTube est agrandie en hauteur ; ses bandeaux (titre + nom de la chaîne en haut, logo en bas)
         tombent dans deux marges noires, hors de la zone visible. Marges en pixels fixes : l'interface YouTube a une hauteur fixe. --- */
  var layRaf = 0, layKey = "";
  function layout() { if (layRaf) return; layRaf = requestAnimationFrame(function () { layRaf = 0; doLayout(); }); }
  function doLayout() {
    var box = $("pl"), W = box.clientWidth, H = box.clientHeight; if (!W) return;
    var w = $("ytw"), ifr = w.querySelector("iframe"), fake = box.classList.contains("cx-fake"), full = isFull() || fake;
    var key = [W, H, full ? 1 : 0, prefs.q, ifr ? 1 : 0].join("|"); if (key === layKey) return; layKey = key;
    var q = QS[qi(prefs.q)], vh = q.h || Math.round(W * 9 / 16), vw = Math.round(vh * 16 / 9), bar = Math.max(Math.round(vh * .22), 140), ih = vh + 2 * bar;
    w.style.width = vw + "px"; w.style.height = ih + "px";
    /* l'iframe garde la taille logique choisie : YouTube sert la qualité adaptée à cette taille ; elle est agrandie à l'écran */
    if (ifr) { ifr.style.width = vw + "px"; ifr.style.height = ih + "px"; }
    if (full && H) { var sc = Math.min(W / vw, H / vh); w.style.transform = "translate(" + Math.round((W - vw * sc) / 2) + "px," + Math.round((H - vh * sc) / 2 - bar * sc) + "px) scale(" + sc + ")"; }
    else w.style.transform = "scale(" + W / vw + ") translateY(" + -bar + "px)";
  }
  function applyQuality() { try { if (yp && yp.setPlaybackQuality) { var q = QS[qi(prefs.q)]; yp.setPlaybackQuality(q.yt || "default"); } } catch (e) { /* ignoré */ } layout(); drawQ(); }

  /* --- chargement (anneau comme YouTube) et erreurs --- */
  function busy() { var b = $("pl"); b.classList.toggle("loading", !!(st.loading || st.buf)); $("spin").classList.toggle("on", !!(st.loading || st.buf)); }
  function setLoading(on, ms) {
    st.loading = on; clearTimeout(st.errT); busy();
    if (!on) return;
    st.errT = setTimeout(function () {
      if (!st.loading || st.playing) return; st.loading = false; busy();
      if (want && want.auto && !st.userPlay) { $("cover").classList.remove("off", "wait"); } /* lecture automatique refusée par le navigateur : on propose le bouton lecture */
      else showErr("La vidéo met trop de temps à charger. Vérifiez votre connexion puis réessayez.");
    }, ms || 15000);
  }
  function showErr(msg, title) {
    st.loading = false; st.buf = false; st.playing = false; busy(); loop(false); $("pl").classList.remove("playing");
    var c = $("cover"); c.className = "cx-cover"; c.innerHTML = '<div class="cx-cv">' + ic("wifi") + "<h3>" + X(title || "Lecture impossible") + "</h3><p>" + X(msg) + '</p><div style="margin-top:14px"><button type="button" class="cx-btn gold" id="rtry">Réessayer</button></div></div>';
    $("big").classList.add("off");
    $("rtry").onclick = function () { var t = 0; try { t = yp && yp.getCurrentTime() || 0; } catch (e) { /* ignoré */ } goLesson(li, true, t); };
  }
  function onErr(e) {
    var k = e && e.data, m = k === 100 ? "Cette vidéo n'est plus disponible." : (k === 101 || k === 150) ? "La lecture de cette vidéo n'est pas autorisée sur le site. Contactez l'administration." : "Une erreur de lecture est survenue. Vérifiez votre connexion et réessayez.";
    showErr(m);
  }
  function applyWant() {
    var w = want; if (!w || !yp || !ytReady) return; created = w.vid; st.qDone = false;
    try { yp.setVolume(prefs.vol); yp.setPlaybackRate(prefs.speed); w.auto ? yp.loadVideoById({ videoId: w.vid, startSeconds: w.start }) : yp.cueVideoById({ videoId: w.vid, startSeconds: w.start }); } catch (e) { /* ignoré */ }
    applyQuality();
  }
  function initPlayer(vid, autoplay, start) {
    want = { vid: vid, auto: !!autoplay, start: Math.floor(start || 0) }; st.userPlay = false; st.buf = false;
    setLoading(true, ytReady ? 15000 : 20000);
    ytApi(function () {
      if (!want) return;
      if (yp) { if (ytReady) applyWant(); return; } /* en cours de création : onReady appliquera la dernière demande */
      created = want.vid;
      yp = new YT.Player("ytp", {
        host: "https://www.youtube-nocookie.com", videoId: want.vid, width: "100%", height: "100%",
        playerVars: { controls: 0, disablekb: 1, fs: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, cc_load_policy: 0, autoplay: want.auto ? 1 : 0, start: want.start, origin: location.origin, enablejsapi: 1 },
        events: {
          onReady: function () {
            ytReady = true; try { yp.setVolume(prefs.vol); yp.setPlaybackRate(prefs.speed); var f = yp.getIframe(); f.setAttribute("tabindex", "-1"); f.setAttribute("title", "Lecteur vidéo"); f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin"); } catch (e) { /* ignoré */ }
            st.dur = yp.getDuration() || 0; layKey = ""; layout();
            if (want && want.vid !== created) applyWant(); else { applyQuality(); if (want && !want.auto) setLoading(false); }
          },
          onStateChange: onState, onError: onErr, onPlaybackQualityChange: function () { if ($("mq").classList.contains("on")) drawQ(); }
        }
      });
      setTimeout(layout, 50);
    }, function () { showErr("Le lecteur n'a pas pu se charger. Vérifiez votre connexion puis réessayez.", "Lecteur indisponible"); });
  }
  function loop(on) { clearInterval(tick); tick = on ? setInterval(uiTick, 250) : null; }
  function onState(e) {
    var s = e.data; st.playing = s === 1; st.buf = s === 3; $("pl").classList.toggle("playing", st.playing);
    $("pp").innerHTML = ic(st.playing ? "pause" : "play", "fill"); $("big").classList.toggle("off", s === 1 || s === 3);
    if (s === 1) {
      st.ended = false; st.userPlay = false; st.loading = false; clearTimeout(st.errT); $("cover").classList.add("off"); $("cover").classList.remove("wait"); st.dur = yp.getDuration() || st.dur; keepAwake(true); armIdle();
      if (!st.qDone) { st.qDone = true; setTimeout(applyQuality, 300); }
    } else { keepAwake(false); $("pl").classList.remove("idle"); }
    if (s === 5) { st.loading = false; clearTimeout(st.errT); st.dur = yp.getDuration() || st.dur; }
    if (s === 1 || s === 3) loop(true); else { loop(false); uiTick(); }
    busy();
    if (s === 0) { st.ended = true; markDone(true); showEnd(); }
    if (s === 2 || s === 0) savePos();
  }
  /* lecture demandée par la personne : la couverture reste en place (donc aucune interface YouTube visible) jusqu'à la première image */
  function startPlay() {
    if (!yp || !ytReady) return; var c = $("cover");
    if (!c.classList.contains("off") || st.ended) { c.classList.add("wait"); st.userPlay = true; setLoading(true, 15000); }
    try { yp.playVideo(); } catch (e) { /* ignoré */ }
  }
  function showEnd() {
    var c = $("cover"), last = li >= cur.lessons.length - 1;
    c.className = "cx-cover now"; c.innerHTML = '<div class="cx-cv">' + ic("check") + "<h3>Leçon terminée</h3><p>" + (last ? "Vous avez terminé ce cours. Bravo !" : "Prochaine leçon : " + X(cur.lessons[li + 1].t)) + '</p><div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button type="button" class="cx-btn glass" id="rplay">Revoir</button>' + (last ? "" : '<button type="button" class="cx-btn gold" id="nplay">Leçon suivante ' + ic("arrow") + "</button>") + "</div></div>";
    $("rplay").onclick = function () { try { yp.seekTo(0, true); } catch (e) { /* ignoré */ } startPlay(); };
    if (!last) $("nplay").onclick = function () { goLesson(li + 1, true); };
  }
  function uiTick() {
    if (!yp || !yp.getCurrentTime || !cur || cur.locked || d.hidden) return;
    var t = 0, dur = 0, ld = 0; try { t = yp.getCurrentTime() || 0; dur = yp.getDuration() || st.dur; ld = yp.getVideoLoadedFraction() || 0; } catch (e) { return; }
    st.dur = dur;
    if (!$("seek").classList.contains("drag")) { var p = dur ? t / dur * 100 : 0; $("sPg").style.width = p + "%"; $("sHd").style.left = p + "%"; }
    $("sBf").style.width = ld * 100 + "%";
    var tx = fmtT(t) + " / " + fmtT(dur); if (tx !== st.lt) { st.lt = tx; $("tm").textContent = tx; }
    if (st.playing && Date.now() - st.saveT > 5000) { st.saveT = Date.now(); savePos(); }
  }
  function savePos() { try { if (!yp || !cur || cur.locked) return; var t = yp.getCurrentTime(), p = store.get("pos", {}); p[cur.id + "-" + li] = st.ended ? 0 : Math.floor(t); store.set("pos", p); var l = lastMap(); l[cur.id] = Date.now(); store.set("last", l); if (window.IFSAProgress) IFSAProgress.touch(cur.id, li); } catch (e) { /* ignoré */ } }
  function toggle() { if (!yp || !yp.getPlayerState || !ytReady || st.locked) return; var s = yp.getPlayerState(); if (s === 1 || s === 3) yp.pauseVideo(); else startPlay(); }
  function seekBy(n) { if (!yp || !ytReady || st.locked || !$("cover").classList.contains("off")) return; try { yp.seekTo(Math.max(0, Math.min(st.dur || 1e9, yp.getCurrentTime() + n)), true); } catch (e) { /* ignoré */ } uiTick(); }
  function armIdle() { clearTimeout(st.idleT); $("pl").classList.remove("idle"); if (!st.playing) return; st.idleT = setTimeout(function () { if (st.playing && !d.querySelector(".cx-menu.on")) $("pl").classList.add("idle"); }, 2800); }
  function closeMenus() { [].forEach.call(d.querySelectorAll(".cx-menu"), function (m) { m.classList.remove("on"); }); }
  function openMenu(id) { var m = $(id), was = m.classList.contains("on"); closeMenus(); if (!was) { m.classList.add("on"); if (id === "mq") drawQ(); } }

  /* --- qualité --- */
  function actualQ() { try { var a = yp.getPlaybackQuality(); var q = QS.find(function (x) { return x.yt === a; }); return q ? q.l : ""; } catch (e) { return ""; } }
  function drawQ() {
    var m = $("mq"), i = qi(prefs.q), q = QS[i], lvl = i === 0 ? 3 : i, lessonMin = cur && cur.lessons[li] ? durMin(cur.lessons[li].dur) : 0, act = actualQ();
    var use = q.mb ? '<b>≈ ' + fmtMo(mbHour(q)) + "</b> par heure de vidéo" + (lessonMin ? " · cette leçon ≈ <b>" + fmtMo(mbHour(q) * lessonMin / 60) + "</b>" : "") : "<b>Automatique</b> : la qualité monte ou baisse selon votre connexion.";
    m.innerHTML = "<h4>Qualité de la vidéo" + (q.hd ? '<span class="cx-hdb">HD</span>' : "") + '</h4><div class="sub">Plus la qualité est haute, plus la vidéo consomme de données mobiles.</div>' +
      '<div class="cx-step"><button type="button" data-qs="-1" aria-label="Diminuer la qualité"' + (i <= 0 ? " disabled" : "") + '>−</button><div><b>' + X(q.l) + "</b><span>" + X(q.tag) + '</span></div><button type="button" data-qs="1" aria-label="Augmenter la qualité"' + (i >= QS.length - 1 ? " disabled" : "") + ">+</button></div>" +
      '<div class="cx-meter" aria-hidden="true">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<i class="' + (n <= lvl ? "on" : "") + (n <= lvl && lvl >= 5 ? " hi" : "") + '"></i>'; }).join("") + '</div><div class="cx-use">' + use + "</div>" +
      QS.map(function (o) { return '<button type="button" class="cx-opt' + (o.k === prefs.q ? " on" : "") + '" data-qk="' + o.k + '"><span class="n">' + X(o.l) + "<small>" + X(o.tag) + '</small></span><span class="u">' + (o.mb ? "≈ " + fmtMo(mbHour(o)) + "/h" : "Auto") + "</span>" + (o.k === prefs.q ? ic("check") : "") + "</button>"; }).join("") +
      '<div class="cx-note">' + (act ? "Diffusé actuellement : <b>" + X(act) + "</b>. " : "") + "Estimations moyennes ; la consommation réelle dépend de la vidéo.</div>";
    $("qb").innerHTML = (q.hd ? '<span class="cx-hdb">HD</span>' : ic("wifi")) + "<span>" + X(i === 0 ? "Auto" : q.l) + "</span>";
  }
  function setQ(k) { prefs.q = k; store.set("pl", prefs); applyQuality(); }

  /* --- plein écran, paysage, verrouillage --- */
  var isFull = function () { return !!(d.fullscreenElement || d.webkitFullscreenElement); };
  var isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function metrics() { root.style.setProperty("--cx-iw", innerWidth + "px"); root.style.setProperty("--cx-ih", innerHeight + "px"); }
  function exitFake() { var b = $("pl"); b.classList.remove("cx-fake"); $("rot").classList.remove("act"); setTimeout(layout, 60); }
  function toggleFull(landscape) {
    var b = $("pl");
    if (isFull() || b.classList.contains("cx-fake")) {
      if (isFull()) { try { (d.exitFullscreen || d.webkitExitFullscreen).call(d); } catch (e) { /* ignoré */ } try { screen.orientation.unlock(); } catch (e) { /* ignoré */ } }
      exitFake(); return;
    }
    var rq = b.requestFullscreen || b.webkitRequestFullscreen;
    if (rq && !isIOS) {
      Promise.resolve(rq.call(b)).then(function () {
        if (!landscape) return;
        var lk = screen.orientation && screen.orientation.lock ? screen.orientation.lock("landscape") : Promise.reject();
        return lk.catch(function () { /* verrouillage refusé : rotation visuelle */ if (innerHeight > innerWidth) { try { d.exitFullscreen(); } catch (e) { /* ignoré */ } metrics(); b.classList.add("cx-fake"); } });
      }).catch(function () { metrics(); b.classList.add("cx-fake"); }).then(function () { $("rot").classList.toggle("act", landscape && (isFull() || b.classList.contains("cx-fake"))); setTimeout(layout, 120); });
    } else { metrics(); b.classList.add("cx-fake"); $("rot").classList.add("act"); setTimeout(layout, 80); }
  }
  function setLock(on) {
    st.locked = on; var b = $("pl"); b.classList.toggle("cx-locked", on); closeMenus();
    if (on) { b.classList.add("hint"); setTimeout(function () { b.classList.remove("hint"); }, 2600); toast("Écran verrouillé · maintenez le cadenas pour déverrouiller"); }
    else toast("Écran déverrouillé");
  }

  /* --- ouverture / fermeture --- */
  var layerOn = false;
  function openRoom(id, fromHash) {
    cur = C.find(function (c) { return String(c.id) === String(id); }); if (!cur) return;
    room = $("room"); room.hidden = false; requestAnimationFrame(function () { room.classList.add("on"); });
    root.classList.add("cx-lock"); room.classList.remove("cine"); $("rmCine").setAttribute("aria-pressed", "false");
    $("rmF").textContent = cur.fac + (cur.an ? " · Année " + cur.an : ""); $("rmT").textContent = cur.title;
    $("rmBody").scrollTop = 0;
    var dn = done(cur), start = Math.max(0, Math.min(dn.length, cur.lessons.length - 1));
    /* reprend à la première leçon non terminée */
    for (var i = 0; i < cur.lessons.length; i++) { if (dn.indexOf(i) < 0) { start = i; break; } }
    drawSide(); setTab("about"); goLesson(start, false);
    try { history.replaceState(null, "", "#cours-" + cur.id); } catch (e) { /* ignoré */ }
    if (!layerOn && window.IFSA_BACK && !fromHash) { layerOn = true; IFSA_BACK.push(function () { layerOn = false; closeRoom(true); }); }
    loadComments(); setTimeout(function () { $("rmX").focus(); }, 380);
  }
  function closeRoom(fromBack) {
    if (!room || room.hidden) return; wmStop();
    try { if (yp && yp.pauseVideo) { savePos(); yp.pauseVideo(); } } catch (e) { /* ignoré */ } setLoading(false); loop(false);
    if (isFull()) try { d.exitFullscreen(); } catch (e) { /* ignoré */ } exitFake(); setLock(false); keepAwake(false);
    room.classList.remove("on"); root.classList.remove("cx-lock");
    setTimeout(function () { room.hidden = true; }, 380);
    try { history.replaceState(null, "", location.pathname); } catch (e) { /* ignoré */ }
    if (layerOn && !fromBack && window.IFSA_BACK) { layerOn = false; IFSA_BACK.drop(); }
    layerOn = false; R();
  }
  function drawSide() {
    var dn = done(cur), p = pct(cur);
    $("rmP").style.strokeDashoffset = String(126 - 126 * p / 100); $("rmPt").textContent = p + "%";
    $("sideBar").style.width = p + "%"; $("sideN").textContent = dn.length + " / " + cur.lessons.length;
    $("pls").innerHTML = cur.lessons.map(function (l, i) { var ok = dn.indexOf(i) > -1; return '<li class="' + (i === li ? "on " : "") + (ok ? "ok" : "") + '"><button type="button" data-i="' + i + '"><span class="n">' + (cur.locked ? ic("lock") : ok ? ic("check") : i + 1) + '</span><span class="t">' + X(l.t) + "<small>" + (l.dur ? X(l.dur) : "Leçon " + (i + 1)) + "</small></span></button></li>"; }).join("") || '<li style="color:#9FB0D6;padding:10px">Aucune leçon pour le moment.</li>';
  }
  function markDone(on) {
    var dd = store.get("done", {}), a = dd[cur.id] || [], i = a.indexOf(li); if (on && i < 0) a.push(li); if (!on && i > -1) a.splice(i, 1); dd[cur.id] = a; store.set("done", dd); if (window.IFSAProgress) IFSAProgress.touch(cur.id); drawSide(); drawLessonBar();
  }
  function drawLessonBar() {
    var l = cur.lessons[li] || { t: "" }, ok = done(cur).indexOf(li) > -1;
    $("lsK").textContent = "Leçon " + (li + 1) + " sur " + cur.lessons.length; $("lsT").textContent = l.t || cur.title;
    $("bPrev").disabled = li <= 0; $("bNext").disabled = li >= cur.lessons.length - 1;
    var b = $("bDone"); b.hidden = cur.locked || !LOGGED; b.className = "cx-ib" + (ok ? " ok" : ""); b.innerHTML = ic("check") + '<span class="t">' + (ok ? "Terminée" : "Marquer comme terminée") + "</span>";
  }
  var cssUrl = function (u) { return String(u || "").replace(/["'()\s\\<>]/g, function (c) { return encodeURIComponent(c); }); };
  function coverBg(c) { var h = HUE[facIdx(c)]; return c.cover && /^https:\/\//i.test(c.cover) ? "background:linear-gradient(180deg,rgba(5,11,30,.5),rgba(5,11,30,.88)),url(" + cssUrl(c.cover) + ") center/cover" : "background:radial-gradient(700px 360px at 50% 0,rgba(255,255,255,.16),transparent 70%),linear-gradient(150deg," + h[0] + "," + h[1] + ")"; }
  /* filigrane : le nom du spectateur, très discret, collé au bord de l'image ; il change de place toutes les minutes */
  var wmT = null, wmLast = -1, WMP = [[3, 6], [97, 6], [3, 88], [97, 88], [50, 4], [50, 91]];
  function wmMove() { var w = $("wm"); if (!w) return; var i; do { i = Math.floor(Math.random() * WMP.length); } while (i === wmLast); wmLast = i; w.style.setProperty("--x", WMP[i][0] + "%"); w.style.setProperty("--y", WMP[i][1] + "%"); }
  function wmStop() { if (wmT) { clearInterval(wmT); wmT = null; } }
  function wmStart() {
    var w = $("wm"); wmStop(); if (!w) return;
    if (!guarded(cur)) { w.hidden = true; w.textContent = ""; return; }
    w.hidden = false; w.textContent = (auth && (auth.name || auth.email)) || "IFSA"; wmMove(); wmT = setInterval(wmMove, 60000);
  }
  function goLesson(i, auto, startAt) {
    if (i < 0 || i >= cur.lessons.length) return; savePos(); li = i; var l = cur.lessons[i], b = $("pl");
    drawSide(); drawLessonBar(); drawAbout(); loadNote();
    var w = b.querySelector(".cx-wall"); if (w) w.remove(); b.classList.toggle("guard", guarded(cur));
    wmStart();
    var c = $("cover"); c.className = "cx-cover"; c.style.cssText = coverBg(cur); st.ended = false; st.playing = false; st.buf = false; st.lt = ""; layKey = ""; loop(false);
    $("pp").innerHTML = ic("play", "fill"); $("sPg").style.width = "0"; $("sHd").style.left = "0"; $("tm").textContent = "0:00 / " + (l.dur || "0:00"); $("big").classList.remove("off");
    if (cur.locked) {
      try { if (yp && yp.pauseVideo) yp.pauseVideo(); } catch (e) { /* ignoré */ } setLoading(false);
      c.innerHTML = ""; c.classList.add("off");
      b.insertAdjacentHTML("beforeend", '<div class="cx-wall"><div>' + ic("lock") + '<h3>Cours verrouillé</h3><p>Ce cours est réservé aux ' + X((AUD[cur.aud] || "personnes autorisées").toLowerCase()) + "." + (LOGGED ? " Votre compte n'y a pas accès." : " Connectez-vous avec un compte autorisé pour le regarder.") + "</p>" + (LOGGED ? "" : '<a class="cx-btn gold" href="connexion.html">Se connecter</a>') + "</div></div>");
      $("ctl").hidden = true; $("big").hidden = true; return;
    }
    $("ctl").hidden = false; $("big").hidden = false;
    if (l.yt) {
      var pos = startAt != null ? startAt : store.get("pos", {})[cur.id + "-" + i] || 0; c.innerHTML = '<div class="cx-cv start"><small>' + X(cur.fac) + "</small><h3>" + X(l.t) + "</h3><p>Appuyez sur lecture pour commencer.</p></div>";
      /* la couverture reste en place jusqu'à la première image : l'interface YouTube n'apparaît jamais */
      if (auto) c.classList.add("wait");
      layout(); initPlayer(l.yt, !!auto, pos);
    } else { c.innerHTML = '<div class="cx-cv">' + ic("play", "fill") + "<h3>Vidéo bientôt disponible</h3><p>Cette leçon sera publiée prochainement.</p></div>"; $("ctl").hidden = true; $("big").hidden = true; setLoading(false); try { if (yp && yp.pauseVideo) yp.pauseVideo(); } catch (e) { /* ignoré */ } }
    drawQ();
  }

  /* --- onglets : aperçu / commentaires / notes --- */
  var tab = "about";
  function setTab(t) { tab = t; [].forEach.call($("tabs").children, function (b) { b.setAttribute("aria-selected", b.dataset.t === t); }); ["about", "comm", "notes"].forEach(function (k) { $("p-" + k).hidden = k !== t; }); }
  function drawAbout() {
    var c = cur, n = c.lessons.length, a = c.aud !== "public" ? '<div><small>Accès</small><b>' + X(AUD[c.aud] || "") + "</b></div>" : "";
    $("p-about").innerHTML = "<h4 style=\"font-size:1.15rem;margin-bottom:8px\">À propos de ce cours</h4><p>" + (X(c.desc) || "Aucune description pour le moment.") + '</p><div class="cx-info"><div><small>Faculté</small><b>' + X(c.fac) + "</b></div>" + (c.opt ? "<div><small>Option</small><b>" + X(c.opt) + "</b></div>" : "") + (c.an ? "<div><small>Niveau</small><b>Année " + c.an + "</b></div>" : "") + (c.teacher ? "<div><small>Enseignant</small><b>" + X(c.teacher) + "</b></div>" : "") + "<div><small>Contenu</small><b>" + n + " leçon" + (n > 1 ? "s" : "") + (totMin(c) ? " · " + totMin(c) + " min" : "") + "</b></div>" + a + "</div>" +
      (guarded(c) ? '<p style="margin-top:16px;display:flex;gap:8px;align-items:center;font-size:.84rem">' + ic("shield") + "Contenu protégé : la diffusion est réservée à l'audience choisie et ne peut pas être copiée ni partagée.</p>" : "");
    var nb = $("tNotes"); nb.hidden = !(LOGGED && !c.locked); var cb = $("tComm"); cb.hidden = !c.comments;
  }
  function loadNote() { var n = store.get("notes", {}); $("nta").value = LOGGED && cur && !cur.locked ? n[cur.id + "-" + li] || "" : ""; }

  /* ================= COMMENTAIRES ================= */
  var CM = { enabled: false, items: [], canPost: false, sort: "new", reply: null };
  var rolLbl = function (r) { return r === "admin" ? ["Administration", "staff"] : r === "manager" ? ["Direction", "staff"] : r === "teacher" ? ["Enseignant", "teacher"] : r === "student" ? ["Étudiant", ""] : r === "branch_director" ? ["Directeur d'antenne", "staff"] : ["Membre", ""]; };
  var ago = function (s) { var t = (Date.now() - new Date(s).getTime()) / 1000; if (t < 60) return "à l'instant"; if (t < 3600) return "il y a " + Math.floor(t / 60) + " min"; if (t < 86400) return "il y a " + Math.floor(t / 3600) + " h"; if (t < 2592000) return "il y a " + Math.floor(t / 86400) + " j"; return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); };
  function loadComments() {
    CM = { enabled: cur.comments, items: [], canPost: LOGGED, sort: CM.sort, reply: null, loading: true }; $("tComm").hidden = !cur.comments; drawComments();
    if (!cur.comments || cur.locked) { CM.loading = false; drawComments(); return; }
    var id = cur.id;
    IFSA.comments(id).then(function (r) { if (!cur || cur.id !== id) return; CM = { enabled: r.enabled !== false && cur.comments, items: r.items || [], canPost: !!r.can_post, sort: CM.sort, reply: null }; drawComments(); }).catch(function () { CM.loading = false; CM.error = true; drawComments(); });
  }
  function cmtHtml(m, rep) {
    var r = rolLbl(m.role), reps = rep ? "" : CM.items.filter(function (x) { return x.parent === m.id; }).map(function (x) { return cmtHtml(x, true); }).join("");
    return '<div class="cx-cmt" data-m="' + X(m.id) + '"><span class="cx-cav' + (rep ? " sm" : "") + '" style="background:hsl(' + hueOf(m.name) + ',55%,38%)">' + X(initials(m.name)) + '</span><div class="bd"><div class="hd"><b>' + X(m.name) + '</b><span class="cx-role ' + r[1] + '">' + r[0] + "</span><time>" + X(ago(m.at)) + '</time></div><div class="tx">' + X(m.body) + '</div><div class="ac">' + (!rep && CM.canPost ? '<button type="button" data-rp="' + X(m.id) + '">Répondre</button>' : "") + (m.can_delete ? '<button type="button" class="del" data-dl="' + X(m.id) + '">Supprimer</button>' : "") + "</div>" +
      (CM.reply === m.id ? composer("rep", "Votre réponse…", true) : "") + (reps ? '<div class="cx-reps">' + reps + "</div>" : "") + "</div></div>";
  }
  function composer(id, ph, rep) {
    var n = (auth && (auth.name || auth.email)) || "";
    return '<form class="cx-comp' + (rep ? " cx-rep-f" : "") + '" data-cf="' + id + '"><span class="cx-cav' + (rep ? " sm" : "") + '" style="background:hsl(' + hueOf(n) + ',55%,38%)">' + X(initials(n)) + '</span><div class="box"><textarea maxlength="1000" placeholder="' + X(ph) + '" aria-label="' + X(ph) + '" rows="2"></textarea><div class="bt"><span class="ct">0 / 1000</span><span style="display:flex;gap:8px">' + (rep ? '<button type="button" class="cx-ib" data-cx="1">Annuler</button>' : "") + '<button type="submit" class="cx-btn gold" disabled style="padding:9px 18px">Publier</button></span></div></div></form>';
  }
  function drawComments() {
    var p = $("p-comm"), tops = CM.items.filter(function (m) { return !m.parent; });
    $("cN").textContent = CM.items.length; $("cN").hidden = !CM.items.length;
    if (!CM.enabled) { p.innerHTML = '<div class="cx-off">' + ic("msg") + "<p>Les commentaires sont désactivés pour ce cours.</p></div>"; return; }
    if (CM.loading) { p.innerHTML = '<div class="cx-cm-empty">Chargement des commentaires…</div>'; return; }
    if (CM.error) { p.innerHTML = '<div class="cx-off">' + ic("wifi") + "<p>Les commentaires n'ont pas pu se charger.</p></div>"; return; }
    tops.sort(function (a, b) { return CM.sort === "new" ? new Date(b.at) - new Date(a.at) : new Date(a.at) - new Date(b.at); });
    p.innerHTML = '<div class="cx-cm-h"><h4>' + CM.items.length + " commentaire" + (CM.items.length > 1 ? "s" : "") + '</h4><div class="cx-sort" role="group" aria-label="Trier"><button type="button" data-so="new" class="' + (CM.sort === "new" ? "on" : "") + '">Récents</button><button type="button" data-so="old" class="' + (CM.sort === "old" ? "on" : "") + '">Anciens</button></div></div>' +
      (CM.canPost ? composer("main", "Posez une question ou partagez une remarque sur ce cours…") : '<div class="cx-gate"><p><b>Participez à la discussion.</b><br>Connectez-vous pour commenter ce cours.</p><a class="cx-btn gold" href="connexion.html">Se connecter</a></div>') +
      (tops.length ? tops.map(function (m) { return cmtHtml(m); }).join("") : '<div class="cx-cm-empty">Aucun commentaire pour l\'instant. Soyez le premier à écrire !</div>');
  }
  function initComments() {
    var p = $("p-comm");
    p.addEventListener("input", function (e) { var t = e.target; if (t.tagName !== "TEXTAREA") return; var fm = t.closest("form"); fm.querySelector(".ct").textContent = t.value.length + " / 1000"; fm.querySelector("[type=submit]").disabled = !t.value.trim(); t.style.height = "auto"; t.style.height = Math.min(220, t.scrollHeight) + "px"; });
    p.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && e.target.tagName === "TEXTAREA") { e.preventDefault(); e.target.closest("form").requestSubmit(); } });
    p.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.so) { CM.sort = b.dataset.so; drawComments(); }
      else if (b.dataset.rp) { CM.reply = CM.reply === b.dataset.rp ? null : b.dataset.rp; drawComments(); var t = p.querySelector(".cx-rep-f textarea"); if (t) t.focus(); }
      else if (b.dataset.cx) { CM.reply = null; drawComments(); }
      else if (b.dataset.dl) { if (!confirm("Supprimer ce commentaire ?")) return; IFSA.commentDelete(b.dataset.dl).then(function () { toast("Commentaire supprimé."); loadComments(); }).catch(function (x) { toast((x && x.message) || "Suppression impossible.", true); }); }
    });
    p.addEventListener("submit", function (e) {
      e.preventDefault(); var fm = e.target, t = fm.querySelector("textarea"), body = t.value.trim(); if (!body) return; var btn = fm.querySelector("[type=submit]"); btn.disabled = true;
      IFSA.commentPost(cur.id, body, fm.dataset.cf === "rep" ? CM.reply : null).then(function () { toast("Commentaire publié."); CM.reply = null; loadComments(); }).catch(function (x) { btn.disabled = false; toast((x && x.message) || "Publication impossible.", true); });
    });
  }

  /* ================= LIAISONS ================= */
  function initRoom() {
    room = $("room"); initComments(); metrics(); addEventListener("resize", function () { metrics(); layout(); });
    $("rmBack").onclick = $("rmX").onclick = function () { closeRoom(); };
    $("rmCine").onclick = function () { var on = room.classList.toggle("cine"); this.setAttribute("aria-pressed", on); setTimeout(layout, 60); };
    $("pls").onclick = function (e) { var b = e.target.closest("button"); if (b && !cur.locked) goLesson(+b.dataset.i, true); };
    $("bPrev").onclick = function () { goLesson(li - 1, true); }; $("bNext").onclick = function () { goLesson(li + 1, true); };
    $("bDone").onclick = function () { markDone(done(cur).indexOf(li) < 0); };
    $("tabs").onclick = function (e) { var b = e.target.closest("button"); if (b) setTab(b.dataset.t); };
    $("nta").oninput = function (e) { var n = store.get("notes", {}); n[cur.id + "-" + li] = e.target.value; store.set("notes", n); $("noteS").textContent = "Enregistré automatiquement"; };
    /* lecteur */
    var b = $("pl");
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); }); b.addEventListener("dragstart", function (e) { e.preventDefault(); });
    ["mousemove", "touchstart", "pointermove"].forEach(function (ev) { b.addEventListener(ev, armIdle, { passive: true }); });
    var lastTap = 0, tapT;
    $("shield").addEventListener("click", function (e) {
      if (st.locked) { b.classList.add("hint"); clearTimeout(tapT); tapT = setTimeout(function () { b.classList.remove("hint"); }, 2400); return; }
      closeMenus(); if (e.pointerType === "mouse") { toggle(); return; }
      var now = Date.now(), r = this.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (now - lastTap < 280 && (x < .35 || x > .65)) { clearTimeout(tapT); var back = x < .5; seekBy(back ? -10 : 10); var z = $(back ? "bzl" : "bzr"); z.classList.remove("go"); void z.offsetWidth; z.classList.add("go"); lastTap = 0; return; }
      lastTap = now; tapT = setTimeout(toggle, 260);
    });
    $("shield").addEventListener("dblclick", function (e) { e.preventDefault(); toggleFull(false); });
    $("big").onclick = toggle; $("pp").onclick = toggle; $("sb").onclick = function () { seekBy(-10); }; $("sf").onclick = function () { seekBy(10); };
    $("mu").onclick = function () { if (!yp) return; var m = yp.isMuted(); m ? yp.unMute() : yp.mute(); $("mu").innerHTML = ic(m ? "vol" : "mute"); };
    $("vo").value = prefs.vol; $("vo").oninput = function () { prefs.vol = +this.value; store.set("pl", prefs); try { yp.setVolume(prefs.vol); if (prefs.vol > 0) yp.unMute(); } catch (e) { /* ignoré */ } };
    $("spb").onclick = function () { openMenu("ms"); }; $("qb").onclick = function () { openMenu("mq"); };
    $("ms").innerHTML = '<h4>Vitesse de lecture</h4><div class="sub">Ajustez le rythme du cours.</div>' + [.5, .75, 1, 1.25, 1.5, 1.75, 2].map(function (v) { return '<button type="button" class="cx-opt" data-sp="' + v + '"><span class="n">' + (v === 1 ? "Normale" : String(v).replace(".", ",") + "×") + "</span></button>"; }).join("");
    function drawSp() { $("spb").innerHTML = ic("speed") + "<span>" + String(prefs.speed).replace(".", ",") + "×</span>"; [].forEach.call($("ms").querySelectorAll("[data-sp]"), function (o) { o.classList.toggle("on", +o.dataset.sp === prefs.speed); }); }
    $("ms").onclick = function (e) { var o = e.target.closest("[data-sp]"); if (!o) return; prefs.speed = +o.dataset.sp; store.set("pl", prefs); try { yp.setPlaybackRate(prefs.speed); } catch (x) { /* ignoré */ } drawSp(); closeMenus(); };
    drawSp();
    $("mq").onclick = function (e) { var s = e.target.closest("[data-qs]"), o = e.target.closest("[data-qk]"); if (s) { var n = qi(prefs.q) + +s.dataset.qs; if (n >= 0 && n < QS.length) setQ(QS[n].k); } else if (o) setQ(o.dataset.qk); };
    $("rot").onclick = function () { toggleFull(true); }; $("fs").onclick = function () { toggleFull(false); }; $("lk").onclick = function () { setLock(true); };
    $("cn").onclick = function () { $("rmCine").click(); };
    var ub = $("ubtn"), ht;
    function hs(e) { e.preventDefault(); ub.classList.add("hold"); ht = setTimeout(function () { ub.classList.remove("hold"); setLock(false); }, 720); }
    function he() { ub.classList.remove("hold"); clearTimeout(ht); }
    ub.addEventListener("pointerdown", hs); ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { ub.addEventListener(ev, he); });
    /* barre de progression */
    var sk = $("seek"), dragging = false;
    function pos(e) { var r = sk.getBoundingClientRect(), x = Math.max(0, Math.min(1, ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width)); return x; }
    function prev(e) { var x = pos(e); $("sTip").style.left = x * 100 + "%"; $("sTip").textContent = fmtT(x * st.dur); return x; }
    sk.addEventListener("pointerdown", function (e) { if (st.locked || !yp || !ytReady || !$("cover").classList.contains("off")) return; dragging = true; sk.classList.add("drag"); sk.setPointerCapture(e.pointerId); var x = prev(e); $("sPg").style.width = x * 100 + "%"; $("sHd").style.left = x * 100 + "%"; });
    sk.addEventListener("pointermove", function (e) { var x = prev(e); if (dragging) { $("sPg").style.width = x * 100 + "%"; $("sHd").style.left = x * 100 + "%"; } });
    sk.addEventListener("pointerup", function (e) { if (!dragging) return; dragging = false; sk.classList.remove("drag"); var x = pos(e); try { yp.seekTo(x * st.dur, true); } catch (er) { /* ignoré */ } uiTick(); });
    d.addEventListener("click", function (e) { var inside = (e.composedPath ? e.composedPath() : []).some(function (n) { return n.classList && (n.classList.contains("cx-menu") || n.id === "qb" || n.id === "spb"); }); if (!inside) closeMenus(); });
    d.addEventListener("fullscreenchange", function () { setTimeout(layout, 80); if (!isFull()) { $("rot").classList.remove("act"); try { screen.orientation.unlock(); } catch (e) { /* ignoré */ } } });
    d.addEventListener("webkitfullscreenchange", function () { setTimeout(layout, 80); });
    addEventListener("orientationchange", function () { metrics(); setTimeout(layout, 200); });
    if (window.ResizeObserver) new ResizeObserver(layout).observe($("pl"));
    /* protection : pas de copie, pas de menu contextuel, pas d'enregistrement du lien dans la salle */
    room.addEventListener("copy", function (e) { if (guarded(cur) && !e.target.closest("textarea")) e.preventDefault(); });
    room.addEventListener("contextmenu", function (e) { if (guarded(cur) && !e.target.closest("textarea,input")) e.preventDefault(); });
    d.addEventListener("keydown", function (e) {
      if (!room || room.hidden) return; var tg = e.target.tagName;
      if (e.key === "Escape") { if (d.querySelector(".cx-menu.on")) closeMenus(); else if (!st.locked && !isFull()) closeRoom(); return; }
      if (tg === "TEXTAREA" || tg === "INPUT" || tg === "SELECT" || st.locked) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); } else if (e.key === "ArrowLeft" || e.key === "j") seekBy(-10); else if (e.key === "ArrowRight" || e.key === "l") seekBy(10);
      else if (e.key === "m") $("mu").click(); else if (e.key === "f") toggleFull(false);
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); prefs.vol = Math.max(0, Math.min(100, prefs.vol + (e.key === "ArrowUp" ? 10 : -10))); $("vo").value = prefs.vol; store.set("pl", prefs); try { yp.setVolume(prefs.vol); if (prefs.vol > 0) yp.unMute(); } catch (x) { /* ignoré */ } }
      else if (/^[0-9]$/.test(e.key) && st.dur) { try { yp.seekTo(st.dur * (+e.key) / 10, true); } catch (x) { /* ignoré */ } uiTick(); }
    });
  }

  /* ================= FENÊTRE « VOUS AVEZ QUITTÉ LA LEÇON » ================= */
  var away = { at: 0, was: false, idle: 0 };
  function showPop(title, txt, go) {
    var p = $("cxPop"); $("cxPopT").textContent = title; $("cxPopP").textContent = txt; $("cxPopGo").textContent = go; p.hidden = false; requestAnimationFrame(function () { p.classList.add("on"); }); setTimeout(function () { $("cxPopGo").focus(); }, 50);
  }
  function hidePop() { var p = $("cxPop"); p.classList.remove("on"); setTimeout(function () { p.hidden = true; }, 250); }
  function popOpen() { return !$("cxPop").hidden; }
  function initAway() {
    $("cxPopGo").onclick = function () { hidePop(); armAway(); if (yp && cur && !cur.locked && away.was) { try { yp.playVideo(); } catch (e) { /* ignoré */ } } away.was = false; };
    $("cxPopX").onclick = function () { hidePop(); away.was = false; closeRoom(); };
    d.addEventListener("visibilitychange", function () {
      if (!room || room.hidden || !cur) return;
      if (d.hidden) { away.at = Date.now(); away.was = st.playing; if (st.playing) { try { yp.pauseVideo(); } catch (e) { /* ignoré */ } } }
      else if (away.at) {
        var m = Math.round((Date.now() - away.at) / 60000), t = m < 1 ? "quelques secondes" : m + " min"; away.at = 0;
        showPop("Vous avez quitté la leçon", "Vous étiez absent(e) depuis " + t + ". La vidéo a été mise en pause.", away.was ? "Reprendre la leçon" : "Continuer");
      }
    });
    ["pointerdown", "keydown", "touchstart"].forEach(function (ev) { d.addEventListener(ev, armAway, { passive: true }); });
    setInterval(function () {
      if (!room || room.hidden || popOpen() || d.hidden) return;
      if (Date.now() - away.idle > 10 * 60000 && !st.playing) { away.was = false; showPop("Êtes-vous toujours là ?", "Vous êtes inactif depuis plusieurs minutes.", "Je suis là"); }
    }, 30000);
    armAway();
  }
  function armAway() { away.idle = Date.now(); }

  /* ================= DÉMARRAGE ================= */
  function boot() {
    if (!window.IFSA) { setTimeout(boot, 60); return; }
    initLib(); initRoom(); initAway(); load();
    /* préchargement du lecteur YouTube pendant que la personne parcourt la bibliothèque : la salle s'ouvre plus vite */
    (window.requestIdleCallback || function (f) { return setTimeout(f, 1500); })(function () { try { ytApi(function () {}); } catch (e) { /* ignoré */ } });
    addEventListener("offline", function () { if (room && !room.hidden) toast("Connexion perdue : la lecture reprendra dès son retour.", true); });
    addEventListener("online", function () { if (room && !room.hidden) toast("Connexion rétablie."); });
    addEventListener("hashchange", function () { var h = location.hash; if (h.indexOf("#cours-") === 0 && loaded) openRoom(h.slice(7), true); });
  }
  boot();
})();
