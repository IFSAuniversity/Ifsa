/* IFSA University — client du chatbot IA. Économe : filtre côté navigateur avant d'appeler le serveur. */
(function () {
  "use strict";
  var last = 0, count = 0, hist = [], MAXQ = 12, GAP = 2500, KEY = "ifsa_chat_c1";
  var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var norm = function (t) { return String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim(); };
  function store(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || "{}"); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return {}; } }
  function html(r) {
    var h = String(r.answer || "").split(/\n{2,}|\n/).filter(Boolean).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    if (r.link && r.link.url) h += '<p><a href="' + esc(r.link.url) + '"' + (/^https?:/.test(r.link.url) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(r.link.label || "En savoir plus") + "</a></p>";
    if (r.source === "ai") h += '<p style="font-size:.72rem;opacity:.7;margin-top:6px">Réponse générée par IA : en cas de doute, contactez l\'admission.</p>';
    return h;
  }
  function boot() { return window.IFSA ? Promise.resolve() : new Promise(function (ok, ko) { var s = document.createElement("script"); s.src = "site-data.js"; s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }
  /* renvoie { html } ou { fallback: true, why } : le chatbot local prend alors le relais */
  function ask(q) {
    q = String(q).trim().slice(0, 280); var n = norm(q), cache = store(KEY);
    if (cache[n]) return Promise.resolve({ html: html(cache[n]) });                    // déjà demandé dans cette session : zéro appel
    if (count >= MAXQ) return Promise.resolve({ fallback: true, why: "limit" });
    var wait = GAP - (Date.now() - last); if (wait > 0) return Promise.resolve({ fallback: true, why: "slow" });
    last = Date.now(); count++;
    return boot().then(function () { return IFSA.fn("chat", { q: q, v: IFSA.visitor(), h: hist.slice(-2) }); }).then(function (r) {
      if (!r || !r.ok) return { fallback: true, why: (r && r.reason) || "err" };
      if (r.source !== "unknown") { cache[n] = r; store(KEY, cache); }
      hist.push({ q: q, a: String(r.answer || "").slice(0, 300) }); if (hist.length > 4) hist.shift();
      return { html: html(r) };
    }).catch(function () { return { fallback: true, why: "net" }; });
  }
  window.IFSAChat = { ask: ask };
})();
