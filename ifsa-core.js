/* IFSA University — socle commun des espaces connectés
   1) UN SEUL client Supabase par page (plusieurs clients se disputaient le jeton et déconnectaient l'utilisateur)
   2) Session lue depuis Supabase (persistée dans le navigateur), jamais depuis un simple onglet :
      on peut ouvrir un nouvel onglet ou changer de navigateur de session sans se reconnecter à la main
   3) Un échec réseau n'est JAMAIS une déconnexion : on réessaie, puis on propose « Réessayer »
   4) Cloche d'annonces (pastille rouge + fenêtre) pour tous les espaces
*/
(function () {
  "use strict";
  if (window.IFSACore) return;
  var URL_ = "https://feahvqexnoozmpkseate.supabase.co", KEY = "sb_publishable_ivXCWsho2PYO1JH-1sUpRg_p-S91Z9X";
  var AUTH_KEY = "ifsa_auth";
  var d = document;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- stockage de l'identité affichée (nom, rôle) : local + onglet ---------- */
  function readAuth() {
    var v = null;
    try { v = sessionStorage.getItem(AUTH_KEY); } catch (e) {}
    if (!v) { try { v = localStorage.getItem(AUTH_KEY); } catch (e) {} }
    try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function writeAuth(o) {
    var s = JSON.stringify(o);
    try { sessionStorage.setItem(AUTH_KEY, s); } catch (e) {}
    try { localStorage.setItem(AUTH_KEY, s); } catch (e) {}
  }
  function clearAuth() {
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
    try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
  }

  /* ---------- client unique ---------- */
  function realCreate() { return window.__ifsaRealCreate; }
  function client() {
    if (window.__ifsaSB) return window.__ifsaSB;
    if (!window.supabase || !window.supabase.createClient) return null;
    patch();
    window.__ifsaSB = (window.__ifsaRealCreate || window.supabase.createClient)(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    return window.__ifsaSB;
  }
  /* toute page qui appelle encore createClient(url, clé) reçoit le même client */
  function patch() {
    var s = window.supabase;
    if (!s || !s.createClient || s.createClient.__ifsa) return;
    window.__ifsaRealCreate = s.createClient.bind(s);
    var f = function (u, k, o) {
      if (String(u) === URL_) {
        if (!window.__ifsaSB) window.__ifsaSB = window.__ifsaRealCreate(u, k, o || { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
        return window.__ifsaSB;
      }
      return window.__ifsaRealCreate(u, k, o);
    };
    f.__ifsa = true;
    try { s.createClient = f; } catch (e) {}
  }
  patch();

  /* ---------- session : lecture locale, puis profil avec nouvelles tentatives ---------- */
  function isNet(e) {
    var m = String((e && (e.message || e.error_description)) || e || "").toLowerCase();
    var st = e && (e.status || e.code);
    return /network|fetch|failed|timeout|timed out|load failed|offline|abort|502|503|504|520|522/.test(m) || st === 0 || st === 502 || st === 503 || st === 504;
  }
  async function getSession(sb) {
    for (var i = 0; i < 4; i++) {
      try {
        var r = await sb.auth.getSession();
        if (r && r.data && r.data.session) return r.data.session;
        /* aucune session locale : on laisse une chance à l'auto-restauration (lien magique, autre onglet) */
        if (i < 1) { await sleep(350); continue; }
        return null;
      } catch (e) { if (i === 3) throw e; await sleep(400 * (i + 1)); }
    }
    return null;
  }
  async function getProfile(sb, uid) {
    var last = null;
    for (var i = 0; i < 4; i++) {
      try {
        var r = await sb.from("profiles").select("*").eq("id", uid).maybeSingle();
        if (r.error) throw r.error;
        return r.data || null;
      } catch (e) {
        last = e;
        if (!isNet(e) && i >= 1) break;
        await sleep(450 * (i + 1));
      }
    }
    var err = new Error("Chargement impossible"); err.cause = last; err.net = isNet(last); throw err;
  }

  var HOME = { student: "espace-etudiant.html", teacher: "espace-enseignant.html", bursar: "espace-econome.html", secretary: "espace-secretariat.html", branch_director: "espace-directeur.html", manager: "manager.html", admin: "admin.html" };
  var RL = { student: "Étudiant", teacher: "Enseignant", bursar: "Économe", secretary: "Censeur / Secrétaire", branch_director: "Directeur d'antenne", manager: "Directeur général", admin: "Administrateur", user: "Utilisateur" };
  var SITES = { carrefour: "Carrefour", "port-de-paix": "Port-de-Paix", miragoane: "Miragoâne", "petit-goave": "Petit-Goâve" };

  /* opts: roles:[...], login:"page.html", needSite:bool
     retourne {sb, user, profile} ou redirige. En cas de problème réseau : écran « Réessayer » (jamais de déconnexion). */
  async function guard(opts) {
    opts = opts || {};
    var sb = client();
    if (!sb) { showFail(opts, new Error("Service indisponible"), true); return null; }
    var s, p;
    try { s = await getSession(sb); }
    catch (e) { showFail(opts, e, true); return null; }
    if (!s) { clearAuth(); location.replace((opts.login || "connexion.html") + (opts.login && /\?/.test(opts.login) ? "&" : "?") + "expired=1"); return null; }
    try { p = await getProfile(sb, s.user.id); }
    catch (e) { showFail(opts, e, e.net); return null; }
    if (!p) { /* compte sans profil : cas anormal, mais pas une panne */ await hardOut(sb, opts.login); return null; }
    if (p.status && p.status !== "active") { await hardOut(sb, (opts.login || "connexion.html") + (/\?/.test(opts.login || "") ? "&" : "?") + "status=" + encodeURIComponent(p.status)); return null; }
    if (opts.roles && opts.roles.indexOf(p.role) < 0) {
      /* connecté, mais pas à la bonne porte : on l'envoie vers SON espace au lieu de « accès refusé » */
      writeAuth({ role: p.role, name: p.full_name, email: s.user.email, site: p.site_id });
      location.replace(HOME[p.role] || "index.html"); return null;
    }
    if (opts.needSite && !p.site_id) { showFail(opts, new Error("Votre compte n'est rattaché à aucun site. Contactez la direction."), false, true); return null; }
    writeAuth({ role: p.role, name: p.full_name, email: s.user.email, site: p.site_id });
    watch(sb, opts);
    return { sb: sb, user: s.user, profile: p, session: s };
  }
  async function hardOut(sb, to) {
    try { await sb.auth.signOut(); } catch (e) {}
    clearAuth(); location.replace(to || "connexion.html");
  }
  /* si le jeton ne peut vraiment plus être renouvelé (déconnecté ailleurs), on revient proprement à la connexion */
  function watch(sb, opts) {
    if (watch.on) return; watch.on = true;
    sb.auth.onAuthStateChange(function (ev) {
      if (ev === "SIGNED_OUT" && !logout.busy) { clearAuth(); location.replace((opts.login || "connexion.html") + "?expired=1"); }
    });
  }
  async function logout(to) {
    logout.busy = true;
    var sb = client();
    try { if (sb) await sb.auth.signOut(); } catch (e) {}
    clearAuth();
    try { localStorage.removeItem("ifsa_seen_ann"); } catch (e) {}
    location.replace(to || "index.html");
  }

  /* ---------- écran d'échec propre ---------- */
  function showFail(opts, err, net, fatal) {
    var host = d.getElementById("vw") || d.getElementById("body") || d.querySelector("main") || d.body;
    var box = d.createElement("div"); box.className = "ifx-fail"; box.setAttribute("role", "alert");
    var msg = fatal ? err.message : (net ? "La connexion semble coupée ou trop lente. Vos données sont en sécurité." : "Impossible de charger votre espace pour le moment.");
    box.innerHTML = '<div class="ifx-fail-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="m10.3 3.9-8.4 14.5A2 2 0 0 0 3.6 21.4h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></div>' +
      '<h2>Chargement impossible</h2><p>' + esc(msg) + '</p><div class="ifx-fail-a">' +
      (fatal ? "" : '<button type="button" class="ifx-b p" data-r>Réessayer</button>') +
      '<button type="button" class="ifx-b" data-o>Se reconnecter</button></div>';
    host.innerHTML = ""; host.appendChild(box);
    var r = box.querySelector("[data-r]"); if (r) r.onclick = function () { location.reload(); };
    box.querySelector("[data-o]").onclick = function () { logout(opts && opts.login || "connexion.html"); };
  }

  /* ---------- annonces non lues + cloche ---------- */
  var SEEN = "ifsa_seen_ann";
  function seenMap() { try { return JSON.parse(localStorage.getItem(SEEN) || "{}"); } catch (e) { return {}; } }
  function setSeen(uid, ts) { var m = seenMap(); m[uid] = ts; try { localStorage.setItem(SEEN, JSON.stringify(m)); } catch (e) {} }
  var ENV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
  var fdate = function (s) { try { return new Date(s).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } };

  /* mount: {sb, uid, host?:Element (bouton placé dans l'en-tête), floating?:bool} */
  async function bell(o) {
    var sb = o.sb, uid = o.uid, list = [];
    try {
      var r = await sb.from("announcements").select("id,title,body,kind,created_at").order("created_at", { ascending: false }).limit(25);
      if (r.error) throw r.error; list = r.data || [];
    } catch (e) { list = []; }
    var seen = seenMap()[uid] || 0;
    var unread = list.filter(function (a) { return new Date(a.created_at).getTime() > seen; });
    var btn = d.createElement("button"); btn.type = "button"; btn.className = "ifx-bell" + (unread.length ? " has" : ""); btn.setAttribute("aria-label", unread.length ? unread.length + " nouvelle(s) annonce(s)" : "Annonces");
    btn.innerHTML = ENV + (unread.length ? '<i class="ifx-dot" aria-hidden="true"></i>' : "");
    if (o.host) o.host.appendChild(btn); else { btn.classList.add("float"); d.body.appendChild(btn); }
    function sheet() {
      var ov = d.createElement("div"); ov.className = "ifx-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
      ov.innerHTML = '<div class="ifx-sh"><div class="ifx-sh-h"><h2>Annonces et avis</h2><button type="button" class="ifx-x" aria-label="Fermer">×</button></div><div class="ifx-sh-b">' +
        (list.length ? list.map(function (a) {
          var nw = new Date(a.created_at).getTime() > seen;
          return '<article class="ifx-an' + (nw ? " new" : "") + '"><div class="ifx-an-t"><b>' + esc(a.title) + '</b>' + (nw ? '<span class="ifx-new">Nouveau</span>' : "") + '</div><small>' + esc(fdate(a.created_at)) + (a.kind === "notice" ? " · Avis" : " · Annonce") + '</small>' + (a.body ? '<p>' + esc(a.body) + '</p>' : "") + '</article>';
        }).join("") : '<p class="ifx-empty">Aucune annonce pour le moment.</p>') + '</div></div>';
      d.body.appendChild(ov);
      var close = function () { ov.remove(); d.removeEventListener("keydown", k); };
      var k = function (e) { if (e.key === "Escape") close(); };
      d.addEventListener("keydown", k);
      ov.addEventListener("click", function (e) { if (e.target === ov || e.target.closest(".ifx-x")) close(); });
      if (list.length) setSeen(uid, new Date(list[0].created_at).getTime());
      btn.classList.remove("has"); var dt = btn.querySelector(".ifx-dot"); if (dt) dt.remove();
      var pop = d.querySelector(".ifx-pop"); if (pop) pop.remove();
      seen = Date.now() + 1e3; unread = [];
    }
    btn.onclick = sheet;
    /* petit message animé à l'arrivée, seulement s'il y a du nouveau */
    if (unread.length && !o.noPop) {
      var p = d.createElement("button"); p.type = "button"; p.className = "ifx-pop";
      p.innerHTML = '<span class="ifx-pop-i">' + ENV + '<i class="ifx-dot"></i></span><span><b>' + (unread.length > 1 ? unread.length + " nouvelles annonces" : "Nouvelle annonce") + '</b><small>' + esc(unread[0].title) + '</small></span>';
      d.body.appendChild(p);
      p.onclick = sheet;
      setTimeout(function () { p.classList.add("out"); setTimeout(function () { p.remove(); }, 400); }, 9000);
    }
    return { open: sheet, count: unread.length };
  }

  /* nouvelle tentative automatique pour les coupures réseau (jamais pour un refus de droits) */
  async function retry(fn, n) {
    n = n || 3; var last;
    for (var i = 0; i < n; i++) {
      try { return await fn(); } catch (e) { last = e; if (!isNet(e)) break; await sleep(500 * (i + 1)); }
    }
    throw last;
  }
  function fail(opts, e) { showFail(opts || {}, e || new Error("x"), isNet(e)); }
  /* ---------- invitations : durée du lien + affichage du lien à copier ---------- */
  var HK = "ifsa_invite_hours";
  var HOURS = [[1, "1 heure"], [6, "6 heures"], [24, "24 heures (par défaut)"], [72, "3 jours"], [168, "7 jours"], [720, "30 jours"]];
  function inviteHours() { var n = 24; try { n = parseInt(localStorage.getItem(HK), 10) || 24; } catch (e) {} return Math.min(720, Math.max(1, n)); }
  function inviteControl() {
    var w = d.createElement("div"); w.className = "usr-opt";
    w.innerHTML = '<label for="ifxH">Durée des liens d\'invitation</label><select id="ifxH">' + HOURS.map(function (h) { return '<option value="' + h[0] + '"' + (inviteHours() === h[0] ? " selected" : "") + ">" + h[1] + "</option>"; }).join("") + '</select><small>Le lien s\'éteint aussi dès que le compte est créé.</small>';
    w.querySelector("select").onchange = function (e) { try { localStorage.setItem(HK, e.target.value); } catch (x) {} };
    return w;
  }
  function inviteResult(r) {
    if (!r || !r.invite_link) return;
    var ov = d.createElement("div"); ov.className = "ifx-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    var exp = ""; try { exp = new Date(r.expires_at).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }); } catch (e) {}
    ov.innerHTML = '<div class="ifx-sh"><div class="ifx-sh-h"><h2>Lien d\'invitation</h2><button type="button" class="ifx-x" aria-label="Fermer">×</button></div><div class="ifx-sh-b">' +
      '<p style="font-size:.92rem">' + (r.emailed ? "Le lien a été envoyé par email." : "L'envoi automatique par email n'est pas activé : copiez le lien et transmettez-le à la personne (WhatsApp, SMS…).") + '</p>' +
      '<input readonly value="' + esc(r.invite_link) + '" style="width:100%;padding:12px;border:1.5px solid var(--line,#E1E6F2);border-radius:12px;background:var(--bg,#F1F4FA);color:inherit;font-size:.8rem">' +
      '<p style="font-size:.84rem;color:var(--mut,#5B667C)">Valable jusqu\'au ' + esc(exp) + '. Il s\'éteint dès que le compte est créé.</p>' +
      '<div class="ifx-fail-a" style="justify-content:flex-start"><button type="button" class="ifx-b p" data-c>Copier le lien</button><button type="button" class="ifx-b" data-x>Fermer</button></div></div></div>';
    d.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.closest("[data-x]") || e.target.closest(".ifx-x")) ov.remove();
      if (e.target.closest("[data-c]")) { var b = e.target.closest("[data-c]"); (navigator.clipboard ? navigator.clipboard.writeText(r.invite_link) : Promise.reject()).then(function () { b.textContent = "Lien copié ✓"; }, function () { var i = ov.querySelector("input"); i.select(); b.textContent = "Sélectionné : copiez-le"; }); }
    });
  }
  window.IFSACore = { inviteHours: inviteHours, inviteControl: inviteControl, inviteResult: inviteResult, retry: retry, fail: fail, client: client, guard: guard, logout: logout, bell: bell, readAuth: readAuth, writeAuth: writeAuth, clearAuth: clearAuth, esc: esc, HOME: HOME, RL: RL, SITES: SITES, isNet: isNet, sleep: sleep };
})();
