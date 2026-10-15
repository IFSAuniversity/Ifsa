/* IFSA University — gestion du contenu du site public (actualités, événements, galerie, vidéos, zones d'images).
   Utilisé par manager.html (directeur général) et admin.html (administrateur). La sécurité réelle est assurée par la base de données. */
(function () {
  "use strict";
  var BUCKET = "media", MAXSIDE = 1600, MAXRAW = 25 * 1024 * 1024;
  var CATS = { news: ["Admissions", "Campus", "Événements", "Académique"], events: ["Admissions", "Conférence", "Cérémonie", "Autre"], gal: ["Campus", "Étudiants", "Cérémonies", "Événements"] };
  var TABS = [
    { id: "news", label: "Actualités", ic: "news", where: "Apparaît sur : la page <b>Actualités</b> (liste, article à la une, page de chaque article) et les 3 dernières sur l'<b>accueil</b>.", link: "actualites.html" },
    { id: "events", label: "Événements", ic: "cal", where: "Apparaît sur : la page <b>Événements</b> (à venir et passés) et l'<b>agenda de l'accueil</b> (les 3 prochains).", link: "evenements.html" },
    { id: "gal", label: "Galerie", ic: "img", where: "Apparaît sur : la page <b>Galerie</b> (photos classées par catégorie, avec agrandissement).", link: "galerie.html" },
    { id: "vids", label: "Vidéos", ic: "vid", where: "Apparaît sur : l'<b>accueil</b> (section « En vidéo », 3 vidéos au plus, celle à la une en premier) et la page <b>Galerie</b> (toutes les vidéos actives).", link: "galerie.html" },
    { id: "slides", label: "Bannière d'accueil", ic: "img", where: "Apparaît sur : la <b>grande bannière en haut de l'accueil</b> (diaporama). Chaque diapo = une image, un titre et un texte. Un voile sombre garde le texte lisible.", link: "index.html" },
    { id: "testi", label: "Témoignages", ic: "news", admin: true, where: "Apparaît sur : la section <b>Ils parlent d'IFSA</b> de l'accueil. Vous pouvez créer, modifier, masquer ou supprimer n'importe quel témoignage.", link: "index.html#temoignages" },
    { id: "zones", label: "Zones d'images", ic: "pin", admin: true, where: "Chaque zone est une <b>photo précise d'une page du site</b>. Tant qu'aucune image n'est choisie, le site affiche son emplacement d'exemple.", link: "index.html" }
  ];
  var ICO = { news: '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M8 8h7M8 12h7M8 16h4"/>', cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', img: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>', vid: '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="m10 9 5 3-5 3z"/>', pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', edit: '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' };
  var ic = function (n) { return '<svg class="sc-i" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || "") + "</svg>"; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var httpsUrl = function (u) { u = String(u || "").trim(); return /^https:\/\//i.test(u) ? u.replace(/["'<>()\s\\]/g, function (c) { return encodeURIComponent(c); }) : ""; };
  var fmtD = function (d) { return d ? new Date(String(d).length <= 10 ? d + "T12:00:00" : d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : ""; };
  var C = { sb: null, role: "", toast: function () {}, root: null, uid: null, base: "" }, S = { tab: "news", edit: null, busy: false, loaded: false, err: "", d: { news: [], events: [], gal: [], vids: [], slides: [], testi: [], zones: [] } };

  var css = document.createElement("style");
  css.textContent = ".sc{--scn:var(--navy,#0B1F4B);--scg:var(--gold,#C9A24B);--scm:var(--mut,#5B667C);--scl:var(--line,#E1E6F2);--scc:var(--card,#fff);--sci:var(--ink,#1B2437)}.sc *{box-sizing:border-box}.sc-i{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}.sc-tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:4px}.sc-tabs button{flex:none;display:inline-flex;gap:7px;align-items:center;border:1.5px solid var(--scl);background:var(--scc);color:var(--sci);border-radius:12px;padding:10px 14px;font-weight:600;font-size:.88rem;cursor:pointer}.sc-tabs button[aria-selected=true]{background:var(--scn);color:#E8CF8E;border-color:var(--scn)}.sc-where{background:rgba(201,162,75,.14);border:1px solid rgba(201,162,75,.45);border-radius:14px;padding:12px 14px;margin-bottom:14px;font-size:.9rem;color:var(--sci);display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.sc-where a{display:inline-flex;gap:6px;align-items:center;font-weight:700;color:var(--scn);text-decoration:underline}.sc-card{background:var(--scc);border:1px solid var(--scl);border-radius:18px;padding:16px;margin-bottom:14px}.sc-card h3{margin:0 0 10px;font-size:1.05rem}.sc label{display:grid;gap:5px;font-weight:700;font-size:.84rem;margin-bottom:12px;color:var(--scn)}.sc input,.sc select,.sc textarea{width:100%;padding:11px 13px;border:1.5px solid var(--scl);border-radius:12px;background:transparent;color:var(--sci);font:inherit;font-weight:500;font-size:16px}.sc textarea{min-height:130px;resize:vertical}.sc .sc-ck{display:flex;gap:10px;align-items:center;font-weight:600}.sc .sc-ck input{width:20px;height:20px}.sc-r2{display:grid;gap:12px;grid-template-columns:1fr 1fr}@media(max-width:560px){.sc-r2{grid-template-columns:1fr}}.sc-h{font-weight:500;color:var(--scm);font-size:.8rem;margin:-6px 0 12px}.sc-btn{display:inline-flex;gap:7px;align-items:center;justify-content:center;border:1.5px solid var(--scl);background:var(--scc);color:var(--sci);border-radius:12px;padding:9px 14px;font-weight:600;font-size:.84rem;cursor:pointer;min-height:40px;text-decoration:none}.sc-btn.p{background:linear-gradient(135deg,#C9A24B,#DDB863);color:#0B1F4B;border-color:transparent;font-weight:700}.sc-btn.d{color:#B3261E}.sc-btn[disabled]{opacity:.55;cursor:wait}.sc-row{display:flex;gap:12px;align-items:flex-start;background:var(--scc);border:1px solid var(--scl);border-radius:16px;padding:12px;margin-bottom:10px}.sc-th{width:84px;height:64px;border-radius:12px;object-fit:cover;flex:none;background:rgba(11,31,75,.08)}.sc-th.ph{display:grid;place-items:center;color:var(--scm);font-size:.7rem;text-align:center}.sc-tx{flex:1;min-width:0}.sc-tx b{display:block;word-break:break-word}.sc-tx small{display:block;color:var(--scm)}.sc-ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.sc-bd{display:inline-block;border-radius:99px;padding:2px 10px;font-size:.72rem;font-weight:700;margin-right:6px;background:rgba(11,31,75,.08);color:var(--scn)}.sc-bd.ok{background:#E3F4EA;color:#0E6B3A}.sc-bd.wt{background:rgba(201,162,75,.22);color:#8A6414}.sc-pv{display:flex;gap:12px;align-items:center;border:1px dashed var(--scl);border-radius:14px;padding:10px;margin:0 0 12px}.sc-pv img,.sc-pv .sc-th{width:96px;height:72px}.sc-empty{text-align:center;color:var(--scm);padding:26px 10px}.sc-gal{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.sc-gi{background:var(--scc);border:1px solid var(--scl);border-radius:16px;overflow:hidden}.sc-gi img{width:100%;height:120px;object-fit:cover;display:block}.sc-gi div{padding:10px}.sc-zp{margin:18px 0 8px;font-size:1rem;color:var(--scn)}.sc-err{background:#FDECEC;color:#A12B2B;border-radius:12px;padding:11px 14px;margin-bottom:12px;font-size:.88rem}.sc-load{text-align:center;padding:40px;color:var(--scm)}";
  document.head.appendChild(css);

  /* ---------- images : contrôle, réduction, envoi ---------- */
  function check(f) {
    if (!f) return "Aucun fichier choisi.";
    if (!/^image\/(jpeg|png|webp)$/i.test(f.type || "")) return "Format non accepté : choisissez une image JPEG, PNG ou WebP.";
    if (f.size > MAXRAW) return "Image trop lourde (25 Mo au plus).";
    return "";
  }
  function shrink(f, max) {
    /* réduit l'image ; si le navigateur n'y arrive pas (ou trop lentement), l'original est envoyé tel quel */
    return new Promise(function (resolve) {
      var done = false, res = function (v) { if (!done) { done = true; resolve(v); } };
      setTimeout(function () { res(f); }, window.IFSA_SHRINK_MS || 6000);
      try {
        var url = URL.createObjectURL(f), im = new Image();
        im.onload = function () {
          try {
            var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, max / Math.max(w, h)), cv = document.createElement("canvas");
            cv.width = Math.round(w * k); cv.height = Math.round(h * k);
            var cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
            cv.toBlob(function (b) { URL.revokeObjectURL(url); res(b && b.size < f.size * 1.2 ? b : f); }, "image/jpeg", 0.86);
          } catch (e) { res(f); }
        };
        im.onerror = function () { URL.revokeObjectURL(url); res(f); };
        im.src = url;
      } catch (e) { res(f); }
    });
  }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  async function upload(folder, f, max) {
    var err = check(f); if (err) throw new Error(err);
    var blob = await shrink(f, max || MAXSIDE), path = folder + "/" + rid() + ".jpg";
    var r = await C.sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || "image/jpeg", cacheControl: "31536000" });
    if (r.error) throw r.error;
    return C.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  function pathOf(url) { var m = /\/object\/public\/media\/(.+)$/.exec(String(url || "")); return m ? decodeURIComponent(m[1]) : ""; }
  async function drop(url) { var p = pathOf(url); if (p) { try { await C.sb.storage.from(BUCKET).remove([p]); } catch (e) { /* nettoyage facultatif */ } } }
  function ytId(u) { u = String(u || "").trim(); var m = /(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/.exec(u); if (m) return m[1]; return /^[\w-]{11}$/.test(u) ? u : ""; }

  /* ---------- données ---------- */
  function must(r) { if (r.error) throw r.error; return r.data || []; }
  async function load() {
    var sb = C.sb, jobs = [
      sb.from("news").select("*").order("published_at", { ascending: false }),
      sb.from("events").select("*").order("event_date", { ascending: false }),
      sb.from("gallery_items").select("*").order("position", { ascending: true }).order("created_at", { ascending: false }),
      sb.from("video_links").select("*").order("featured", { ascending: false }).order("position", { ascending: true })];
    jobs.push(sb.from("home_slides").select("*").order("position", { ascending: true }));
    jobs.push(C.role === "admin" ? sb.from("testimonials").select("*").order("created_at", { ascending: false }) : Promise.resolve(null));
    if (C.role === "admin") jobs.push(sb.from("site_images").select("*").order("position", { ascending: true }));
    var r = await Promise.all(jobs);
    S.d = { news: must(r[0]), events: must(r[1]), gal: must(r[2]), vids: must(r[3]), slides: r[4] && !r[4].error ? must(r[4]) : [], testi: r[5] ? must(r[5]) : [], zones: r[6] ? must(r[6]) : [] };
    S.loaded = true; S.err = "";
  }
  async function reload() { try { await load(); } catch (e) { S.err = "Chargement impossible : " + ((e && e.message) || "erreur"); } render(); }
  async function run(btn, f, ok) {
    if (S.busy) return; S.busy = true; if (btn) { btn.disabled = true; }
    try { await f(); if (ok) C.toast(ok); await reload(); }
    catch (e) { C.toast((e && e.message) || "Action impossible.", true); if (btn) btn.disabled = false; }
    finally { S.busy = false; }
  }
  var site = function (p) { return C.base + p; };

  /* ---------- affichage ---------- */
  var thumb = function (u, alt) { var s = httpsUrl(u); return s ? '<img class="sc-th" src="' + esc(s) + '" alt="' + esc(alt || "") + '" loading="lazy">' : '<div class="sc-th ph">Pas d\'image</div>'; };
  var badge = function (on, a, b) { return '<span class="sc-bd ' + (on ? "ok" : "wt") + '">' + (on ? a : b) + "</span>"; };
  var opts = function (list, cur) { var L = list.indexOf(cur) < 0 && cur ? list.concat([cur]) : list; return L.map(function (c) { return "<option" + (c === cur ? " selected" : "") + ">" + esc(c) + "</option>"; }).join(""); };
  var viewLink = function (href, txt) { return '<a class="sc-btn" target="_blank" rel="noopener" href="' + esc(site(href)) + '">' + ic("ext") + esc(txt || "Voir sur le site") + "</a>"; };

  function vNews() {
    var e = S.edit && S.edit.t === "news" ? S.edit.row : null, d = S.d.news, cur = e ? (e.published_at || "").slice(0, 10) : new Date().toISOString().slice(0, 10);
    var form = '<form class="sc-card" data-f="news"><h3>' + (e ? "Modifier l'actualité" : "Nouvelle actualité") + "</h3>" +
      '<label>Titre<input id="sc-nt" maxlength="160" required value="' + esc(e && e.title) + '"></label>' +
      '<div class="sc-r2"><label>Catégorie<select id="sc-nc">' + opts(CATS.news, e && e.category) + '</select></label><label>Date de publication<input id="sc-nd" type="date" value="' + esc(cur) + '"></label></div>' +
      '<label>Résumé (affiché sur les cartes, 1 à 2 phrases)<input id="sc-ns" maxlength="300" value="' + esc(e && e.summary) + '"></label>' +
      '<label>Texte de l\'article<textarea id="sc-nb">' + esc(e && e.body) + '</textarea></label><p class="sc-h">Séparez les paragraphes par une ligne vide.</p>' +
      '<div class="sc-pv" id="sc-pv">' + thumb(e && e.image_url, "") + '<div class="sc-h" style="margin:0">Image de l\'actualité : affichée sur la carte, à la une et dans l\'article. Format paysage conseillé, 1200 × 800 px.</div></div>' +
      '<label>Image<input type="file" id="sc-ni" accept="image/jpeg,image/png,image/webp"></label>' +
      (e && e.image_url ? '<label class="sc-ck"><input type="checkbox" id="sc-nr"> Retirer l\'image actuelle</label>' : "") +
      '<label class="sc-ck"><input type="checkbox" id="sc-np"' + (!e || e.published ? " checked" : "") + "> Publié (visible sur le site)</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer" : "Publier l'actualité") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    return form + (d.length ? d.map(function (a) {
      return '<div class="sc-row">' + thumb(a.image_url, a.title) + '<div class="sc-tx"><b>' + esc(a.title) + "</b><small>" + esc(a.category || "") + " · " + esc(fmtD(a.published_at)) + "</small>" + badge(a.published, "Publié", "Brouillon") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="news" data-id="' + esc(a.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="news" data-id="' + esc(a.id) + '">' + (a.published ? "Masquer" : "Publier") + "</button>" +
        (a.published ? viewLink("article.html?id=" + encodeURIComponent(a.id)) : "") + '<button class="sc-btn d" data-a="del" data-t="news" data-id="' + esc(a.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucune actualité. Publiez la première ci-dessus.</div>');
  }
  function vEvents() {
    var e = S.edit && S.edit.t === "events" ? S.edit.row : null, d = S.d.events;
    var form = '<form class="sc-card" data-f="events"><h3>' + (e ? "Modifier l'événement" : "Nouvel événement") + "</h3>" +
      '<div class="sc-r2"><label>Date<input id="sc-ed" type="date" required value="' + esc(e && e.event_date) + '"></label><label>Lieu<input id="sc-ep" maxlength="120" placeholder="Carrefour" value="' + esc(e && e.place) + '"></label></div>' +
      '<label>Titre<input id="sc-et" maxlength="160" required value="' + esc(e && e.title) + '"></label>' +
      '<label>Catégorie<select id="sc-ec">' + opts(CATS.events, e && e.category) + "</select></label>" +
      '<label>Description<textarea id="sc-ex">' + esc(e && e.description) + "</textarea></label>" +
      '<label class="sc-ck"><input type="checkbox" id="sc-eb"' + (!e || e.published ? " checked" : "") + "> Publié (visible sur le site)</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer" : "Ajouter l'événement") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    var today = new Date().toISOString().slice(0, 10);
    return form + (d.length ? d.map(function (v) {
      return '<div class="sc-row"><div class="sc-tx"><b>' + esc(v.title) + "</b><small>" + esc(fmtD(v.event_date)) + (v.place ? " · " + esc(v.place) : "") + "</small>" + badge(v.published, "Publié", "Brouillon") + (v.event_date < today ? '<span class="sc-bd">Passé</span>' : "") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="events" data-id="' + esc(v.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="events" data-id="' + esc(v.id) + '">' + (v.published ? "Masquer" : "Publier") + "</button>" +
        (v.published ? viewLink("evenements.html") : "") + '<button class="sc-btn d" data-a="del" data-t="events" data-id="' + esc(v.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucun événement. Ajoutez le premier ci-dessus.</div>');
  }
  function vGal() {
    var d = S.d.gal;
    var form = '<form class="sc-card" data-f="gal"><h3>Ajouter des photos</h3><div class="sc-r2"><label>Catégorie<select id="sc-gc">' + opts(CATS.gal, "") + '</select></label><label>Légende (sinon : nom du fichier)<input id="sc-gl" maxlength="140"></label></div>' +
      '<label>Photos (plusieurs possibles)<input type="file" id="sc-gf" accept="image/jpeg,image/png,image/webp" multiple required></label><p class="sc-h">Les photos sont réduites automatiquement avant l\'envoi (1600 px au plus).</p>' +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic("plus") + "Ajouter à la galerie</button></div></form>";
    return form + (d.length ? '<div class="sc-gal">' + d.map(function (g, i) {
      return '<div class="sc-gi">' + thumb(g.image_url, g.caption) + '<div><b>' + esc(g.caption) + "</b><small style='display:block;color:var(--scm)'>" + esc(g.category) + "</small>" + badge(g.published, "Publié", "Masqué") +
        '<div class="sc-ac"><button class="sc-btn" data-a="mv" data-d="-1" data-id="' + esc(g.id) + '" aria-label="Monter"' + (i === 0 ? " disabled" : "") + ">" + ic("up") + '</button><button class="sc-btn" data-a="mv" data-d="1" data-id="' + esc(g.id) + '" aria-label="Descendre"' + (i === d.length - 1 ? " disabled" : "") + ">" + ic("down") + "</button>" +
        '<button class="sc-btn" data-a="cap" data-id="' + esc(g.id) + '">' + ic("edit") + '</button><button class="sc-btn" data-a="pub" data-t="gal" data-id="' + esc(g.id) + '">' + (g.published ? "Masquer" : "Publier") + '</button><button class="sc-btn d" data-a="del" data-t="gal" data-id="' + esc(g.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") + "</div>" : '<div class="sc-empty">La galerie est vide. Ajoutez vos premières photos ci-dessus.</div>');
  }
  function vVids() {
    var d = S.d.vids;
    var form = '<form class="sc-card" data-f="vids"><h3>Ajouter une vidéo</h3><label>Titre<input id="sc-vt" maxlength="140" required></label><label>Lien YouTube<input id="sc-vu" required placeholder="https://www.youtube.com/watch?v=…"></label>' +
      '<p class="sc-h">Utilisez une vidéo « non répertoriée » ou publique : une vidéo privée ne peut pas être affichée.</p><label class="sc-ck"><input type="checkbox" id="sc-vf"> Vidéo à la une (affichée en premier)</label>' +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic("plus") + "Ajouter la vidéo</button></div></form>";
    return form + (d.length ? d.map(function (v) {
      return '<div class="sc-row">' + (/^[\w-]{11}$/.test(v.youtube_id || "") ? '<img class="sc-th" src="https://i.ytimg.com/vi/' + esc(v.youtube_id) + '/mqdefault.jpg" alt="" loading="lazy">' : '<div class="sc-th ph">?</div>') +
        '<div class="sc-tx"><b>' + esc(v.title) + "</b>" + (v.featured ? '<span class="sc-bd wt">À la une</span>' : "") + badge(v.active, "Affichée", "Masquée") +
        '<div class="sc-ac"><button class="sc-btn" data-a="feat" data-id="' + esc(v.id) + '">' + (v.featured ? "Retirer de la une" : "Mettre à la une") + '</button><button class="sc-btn" data-a="act" data-id="' + esc(v.id) + '">' + (v.active ? "Masquer" : "Afficher") + "</button>" +
        (v.active ? viewLink("galerie.html") : "") + '<button class="sc-btn d" data-a="del" data-t="vids" data-id="' + esc(v.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucune vidéo. Ajoutez la première ci-dessus.</div>');
  }
  function vSlides() {
    var e = S.edit && S.edit.t === "slides" ? S.edit.row : null, d = S.d.slides, v = function (k) { return esc(e && e[k]); };
    var form = '<form class="sc-card" data-f="slides"><h3>' + (e ? "Modifier la diapo" : "Nouvelle diapo de la bannière") + "</h3>" +
      '<label>Petit titre au-dessus (facultatif)<input id="sc-sk" maxlength="80" value="' + v("kicker") + '"></label>' +
      '<label>Grand titre<input id="sc-st" maxlength="120" required value="' + v("title") + '"></label>' +
      '<label>Texte sous le titre<textarea id="sc-ss" maxlength="300">' + v("subtitle") + "</textarea></label>" +
      '<div class="sc-r2"><label>Texte du bouton (facultatif)<input id="sc-sl" maxlength="40" value="' + v("cta_label") + '"></label><label>Lien du bouton<input id="sc-su" maxlength="200" placeholder="admissions.html" value="' + v("cta_url") + '"></label></div>' +
      '<div class="sc-r2"><label>Ordre (1 = première)<input id="sc-so" type="number" min="1" max="99" value="' + (e ? e.position : d.length + 1) + '"></label><label>Voile sombre sur l\'image : <b id="sc-svv">' + (e && e.overlay != null ? e.overlay : 55) + ' %</b><input id="sc-sv" type="range" min="0" max="85" step="5" value="' + (e && e.overlay != null ? e.overlay : 55) + '" oninput="document.getElementById(\'sc-svv\').textContent=this.value+\' %\'"></label></div>' +
      '<div class="sc-pv" id="sc-pv">' + thumb(e && e.image_url, "") + '<div class="sc-h" style="margin:0">Image de fond : format paysage, 1920 × 900 px conseillé. Le voile sombre est ajouté automatiquement pour que le texte reste lisible.</div></div>' +
      '<label>Image<input type="file" id="sc-si" accept="image/jpeg,image/png,image/webp"></label>' +
      (e && e.image_url ? '<label class="sc-ck"><input type="checkbox" id="sc-sr"> Retirer l\'image actuelle</label>' : "") +
      '<label class="sc-ck"><input type="checkbox" id="sc-sp"' + (!e || e.published ? " checked" : "") + "> Affichée sur l'accueil</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer" : "Ajouter à la bannière") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    return form + (d.length ? d.map(function (s) {
      return '<div class="sc-row">' + thumb(s.image_url, s.title) + '<div class="sc-tx"><b>' + esc(s.position) + ". " + esc(s.title) + "</b><small>" + esc(s.subtitle || "") + "</small>" + badge(s.published, "Affichée", "Masquée") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="slides" data-id="' + esc(s.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="slides" data-id="' + esc(s.id) + '">' + (s.published ? "Masquer" : "Afficher") + '</button><button class="sc-btn d" data-a="del" data-t="slides" data-id="' + esc(s.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucune diapo : l\'accueil affiche ses diapos par défaut. Ajoutez la première ci-dessus.</div>');
  }
  var FACS = ["Sciences informatiques", "Sciences comptables", "Sciences administratives", "Sciences de la gestion", "Sciences de l'éducation", "Sciences agronomiques", "Sciences infirmières"], TROLES = ["Étudiant(e)", "Enseignant(e)", "Directeur(trice)", "Personnel", "Diplômé(e)", "Autre"];
  function vTesti() {
    var e = S.edit && S.edit.t === "testi" ? S.edit.row : null, d = S.d.testi;
    var form = '<form class="sc-card" data-f="testi"><h3>' + (e ? "Modifier le témoignage" : "Nouveau témoignage") + "</h3>" +
      '<div class="sc-r2"><label>Nom de la personne<input id="sc-tn" maxlength="80" required value="' + esc(e && e.author_name) + '"></label><label>Statut<select id="sc-tr">' + opts(TROLES, e && e.author_role) + "</select></label></div>" +
      '<label>Faculté (facultatif)<select id="sc-tf"><option value="">—</option>' + opts(FACS, e && e.faculty) + "</select></label>" +
      '<label>Témoignage<textarea id="sc-tb" maxlength="600" required>' + esc(e && e.body) + '</textarea></label><p class="sc-h">600 caractères au plus.</p>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-tp"' + (!e || e.published ? " checked" : "") + "> Visible sur le site</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer" : "Ajouter le témoignage") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    return form + (d.length ? d.map(function (t) {
      return '<div class="sc-row"><div class="sc-tx"><b>' + esc(t.author_name || "Anonyme") + "</b><small>" + esc(t.author_role || "") + (t.faculty ? " · " + esc(t.faculty) : "") + (t.author_id ? " · écrit par la personne" : " · créé par l'administration") + "</small><p style='margin:6px 0'>« " + esc(t.body) + " »</p>" + badge(t.published, "Visible", "Masqué") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="testi" data-id="' + esc(t.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="testi" data-id="' + esc(t.id) + '">' + (t.published ? "Masquer" : "Afficher") + '</button><button class="sc-btn d" data-a="del" data-t="testi" data-id="' + esc(t.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucun témoignage pour le moment.</div>');
  }
  function vZones() {
    var Z = S.d.zones; if (!Z.length) return '<div class="sc-err">Les zones d\'images ne sont pas encore installées : exécutez le SQL « supabase-update-4a » dans Supabase.</div>';
    var pages = [], by = {}; Z.forEach(function (z) { if (!by[z.page]) { by[z.page] = []; pages.push(z.page); } by[z.page].push(z); });
    return pages.map(function (p) {
      return '<h3 class="sc-zp">' + esc(by[p][0].page_title) + "</h3>" + by[p].map(function (z) {
        return '<div class="sc-row" id="sz-' + esc(z.key) + '">' + thumb(z.image_url, z.alt || z.label) + '<div class="sc-tx"><b>' + esc(z.label) + "</b><small>" + esc(z.hint || "") + "</small>" + badge(!!z.image_url, "Image choisie", "Emplacement d'exemple") +
          '<label style="margin:8px 0 6px">Description de l\'image (pour l\'accessibilité)<input data-alt="' + esc(z.key) + '" maxlength="160" value="' + esc(z.alt) + '"></label>' +
          '<div class="sc-ac"><label class="sc-btn p" style="margin:0;cursor:pointer">' + ic("plus") + (z.image_url ? "Changer l'image" : "Choisir une image") + '<input type="file" data-zf="' + esc(z.key) + '" accept="image/jpeg,image/png,image/webp" style="display:none"></label>' +
          (z.image_url ? '<button class="sc-btn" data-a="zalt" data-id="' + esc(z.key) + '">Enregistrer la description</button><button class="sc-btn d" data-a="zdel" data-id="' + esc(z.key) + '">Retirer</button>' : "") +
          viewLink(z.page + ".html#zone-" + encodeURIComponent(z.key)) + "</div></div></div>";
      }).join("");
    }).join("");
  }
  function render() {
    var root = C.root; if (!root) return;
    var tabs = TABS.filter(function (t) { return !t.admin || C.role === "admin"; }); if (!tabs.some(function (t) { return t.id === S.tab; })) S.tab = tabs[0].id;
    var t = tabs.filter(function (x) { return x.id === S.tab; })[0], body = !S.loaded ? '<div class="sc-load">Chargement…</div>' : ({ news: vNews, events: vEvents, gal: vGal, vids: vVids, zones: vZones, slides: vSlides, testi: vTesti })[S.tab]();
    root.innerHTML = '<div class="sc"><div class="sc-tabs" role="tablist">' + tabs.map(function (x) { return '<button type="button" role="tab" data-a="tab" data-id="' + x.id + '" aria-selected="' + (x.id === S.tab) + '">' + ic(x.ic) + esc(x.label) + "</button>"; }).join("") + "</div>" +
      '<div class="sc-where"><span>' + t.where + "</span>" + viewLink(t.link, "Ouvrir la page du site") + "</div>" + (S.err ? '<div class="sc-err">' + esc(S.err) + "</div>" : "") + body + "</div>";
  }

  /* ---------- actions ---------- */
  var tbl = { news: "news", events: "events", gal: "gallery_items", vids: "video_links", slides: "home_slides", testi: "testimonials" };
  function find(t, id) { return (S.d[t] || []).filter(function (r) { return r.id === id; })[0]; }
  async function onClick(e) {
    var b = e.target.closest("[data-a]"); if (!b) return; var a = b.dataset.a, id = b.dataset.id, t = b.dataset.t, sb = C.sb;
    if (a === "tab") { S.tab = id; S.edit = null; render(); return; }
    if (a === "cancel") { S.edit = null; render(); return; }
    if (a === "edit") { var row = find(t, id); if (row) { S.edit = { t: t, row: row }; render(); C.root.scrollIntoView && C.root.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    if (a === "pub") { var r = find(t, id); if (!r) return; await run(b, async function () { var v = !r.published; must(await sb.from(tbl[t]).update({ published: v }).eq("id", id)); }, r.published ? "Contenu masqué du site." : "Publié : visible sur le site (rechargez la page du site pour le voir)."); return; }
    if (a === "act") { var v1 = find("vids", id); if (!v1) return; await run(b, async function () { must(await sb.from("video_links").update({ active: !v1.active }).eq("id", id)); }, v1.active ? "Vidéo masquée." : "Vidéo affichée sur le site."); return; }
    if (a === "feat") { var v2 = find("vids", id); if (!v2) return; await run(b, async function () { must(await sb.from("video_links").update({ featured: !v2.featured }).eq("id", id)); }, v2.featured ? "Retirée de la une." : "Mise à la une."); return; }
    if (a === "del") {
      var d = find(t, id); if (!d) return;
      if (!window.confirm("Supprimer définitivement « " + (d.title || d.caption || "ce contenu") + " » ?\n\nCette action est irréversible. Pour seulement le retirer du site, utilisez « Masquer ».")) return;
      await run(b, async function () { must(await sb.from(tbl[t]).delete().eq("id", id)); if (d.image_url) await drop(d.image_url); }, "Supprimé."); return;
    }
    if (a === "mv") {
      var L = S.d.gal, i = L.findIndex(function (g) { return g.id === id; }), j = i + (+b.dataset.d); if (i < 0 || j < 0 || j >= L.length) return;
      await run(b, async function () { var x = L[i], y = L[j]; must(await sb.from("gallery_items").update({ position: j }).eq("id", x.id)); must(await sb.from("gallery_items").update({ position: i }).eq("id", y.id)); }, "Ordre modifié."); return;
    }
    if (a === "cap") { var g = find("gal", id); if (!g) return; var cap = window.prompt("Nouvelle légende :", g.caption); if (cap == null || !cap.trim()) return; await run(b, async function () { must(await sb.from("gallery_items").update({ caption: cap.trim() }).eq("id", id)); }, "Légende modifiée."); return; }
    if (a === "zdel") { var z = S.d.zones.filter(function (q) { return q.key === id; })[0]; if (!z) return; if (!window.confirm("Retirer l'image de « " + z.label + " » ? Le site affichera de nouveau son emplacement d'exemple.")) return; await run(b, async function () { must(await sb.from("site_images").update({ image_url: null, alt: null }).eq("key", id)); await drop(z.image_url); }, "Image retirée."); return; }
    if (a === "zalt") { var inp = C.root.querySelector('[data-alt="' + id + '"]'); await run(b, async function () { must(await sb.from("site_images").update({ alt: (inp.value || "").trim() || null }).eq("key", id)); }, "Description enregistrée."); return; }
  }
  async function onSubmit(e) {
    var f = e.target.closest("form[data-f]"); if (!f) return; e.preventDefault(); var kind = f.dataset.f, sb = C.sb, btn = f.querySelector('button[type="submit"]'), q = function (id) { return f.querySelector("#" + id); };
    if (kind === "news") {
      var ed = S.edit && S.edit.t === "news" ? S.edit.row : null, title = q("sc-nt").value.trim(), file = q("sc-ni").files[0];
      if (title.length < 3) { C.toast("Donnez un titre à l'actualité.", true); return; }
      await run(btn, async function () {
        var url = ed ? ed.image_url || null : null, old = url;
        if (file) { url = await upload("news", file, 1600); } else if (ed && q("sc-nr") && q("sc-nr").checked) url = null;
        var date = q("sc-nd").value, row = { title: title, category: q("sc-nc").value || null, summary: q("sc-ns").value.trim() || null, body: q("sc-nb").value.trim() || null, image_url: url, published: q("sc-np").checked, published_at: date ? date + "T12:00:00Z" : new Date().toISOString() };
        if (ed) must(await sb.from("news").update(row).eq("id", ed.id)); else { if (C.uid) row.author = C.uid; must(await sb.from("news").insert(row)); }
        if (old && old !== url) await drop(old); S.edit = null;
      }, ed ? "Actualité modifiée." : "Actualité enregistrée."); return;
    }
    if (kind === "events") {
      var ee = S.edit && S.edit.t === "events" ? S.edit.row : null, et = q("sc-et").value.trim(), dt = q("sc-ed").value;
      if (et.length < 3 || !dt) { C.toast("Indiquez la date et le titre.", true); return; }
      await run(btn, async function () {
        var row = { event_date: dt, title: et, place: q("sc-ep").value.trim() || null, category: q("sc-ec").value || null, description: q("sc-ex").value.trim() || null, published: q("sc-eb").checked };
        if (ee) must(await sb.from("events").update(row).eq("id", ee.id)); else must(await sb.from("events").insert(row)); S.edit = null;
      }, ee ? "Événement modifié." : "Événement enregistré."); return;
    }
    if (kind === "gal") {
      var files = [].slice.call(q("sc-gf").files); if (!files.length) { C.toast("Choisissez au moins une photo.", true); return; }
      var bad = files.map(check).filter(Boolean)[0]; if (bad) { C.toast(bad, true); return; }
      await run(btn, async function () {
        var cat = q("sc-gc").value, lab = q("sc-gl").value.trim(), pos = S.d.gal.reduce(function (m, g) { return Math.max(m, g.position || 0); }, 0);
        for (var i = 0; i < files.length; i++) { var u = await upload("gallery", files[i], 1600), cap = lab ? (files.length > 1 ? lab + " " + (i + 1) : lab) : files[i].name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
          must(await sb.from("gallery_items").insert({ category: cat, caption: cap, image_url: u, position: pos + i + 1, published: true })); }
      }, files.length > 1 ? files.length + " photos ajoutées." : "Photo ajoutée."); return;
    }
    if (kind === "slides") {
      var sd = S.edit && S.edit.t === "slides" ? S.edit.row : null, st = q("sc-st").value.trim(), sf = q("sc-si").files[0];
      if (st.length < 3) { C.toast("Donnez un titre à la diapo.", true); return; }
      await run(btn, async function () {
        var url = sd ? sd.image_url || null : null, old = url;
        if (sf) { url = await upload("slides", sf, 1920); } else if (sd && q("sc-sr") && q("sc-sr").checked) url = null;
        var row = { kicker: q("sc-sk").value.trim() || null, title: st, subtitle: q("sc-ss").value.trim() || null, cta_label: q("sc-sl").value.trim() || null, cta_url: q("sc-su").value.trim() || null, position: +q("sc-so").value || 1, overlay: +q("sc-sv").value, image_url: url, published: q("sc-sp").checked };
        if (sd) must(await sb.from("home_slides").update(row).eq("id", sd.id)); else must(await sb.from("home_slides").insert(row));
        if (old && old !== url) await drop(old); S.edit = null;
      }, sd ? "Diapo modifiée." : "Diapo ajoutée à la bannière."); return;
    }
    if (kind === "testi") {
      var te = S.edit && S.edit.t === "testi" ? S.edit.row : null, tb = q("sc-tb").value.trim(), tn = q("sc-tn").value.trim();
      if (tb.length < 10 || !tn) { C.toast("Indiquez le nom et un témoignage d'au moins 10 caractères.", true); return; }
      await run(btn, async function () {
        var row = { author_name: tn, author_role: q("sc-tr").value, faculty: q("sc-tf").value || null, body: tb, published: q("sc-tp").checked };
        if (te) must(await sb.from("testimonials").update(row).eq("id", te.id)); else must(await sb.from("testimonials").insert(row));
        S.edit = null;
      }, te ? "Témoignage modifié." : "Témoignage ajouté."); return;
    }
    if (kind === "vids") {
      var id = ytId(q("sc-vu").value), vt = q("sc-vt").value.trim();
      if (!id) { C.toast("Lien YouTube non reconnu. Collez l'adresse de la vidéo.", true); return; }
      if (vt.length < 3) { C.toast("Donnez un titre à la vidéo.", true); return; }
      await run(btn, async function () { must(await sb.from("video_links").insert({ title: vt, youtube_id: id, featured: q("sc-vf").checked, active: true, position: S.d.vids.length })); }, "Vidéo ajoutée."); return;
    }
  }
  async function onChange(e) {
    var zf = e.target.closest("[data-zf]");
    if (zf) {
      var key = zf.dataset.zf, file = zf.files[0], z = S.d.zones.filter(function (q) { return q.key === key; })[0]; if (!file || !z) return;
      var alt = C.root.querySelector('[data-alt="' + key + '"]'); var err = check(file); if (err) { C.toast(err, true); zf.value = ""; return; }
      await run(null, async function () { var url = await upload("zones", file, 1920), old = z.image_url; must(await C.sb.from("site_images").update({ image_url: url, alt: (alt && alt.value.trim()) || z.alt || z.label }).eq("key", key)); if (old) await drop(old); }, "Image enregistrée : elle apparaît maintenant sur le site.");
      return;
    }
    var ni = e.target.closest("#sc-ni,#sc-si");
    if (ni) { var pv = C.root.querySelector("#sc-pv"), f = ni.files[0], er = f ? check(f) : ""; if (er) { C.toast(er, true); ni.value = ""; return; } if (f && pv) { var im = pv.querySelector("img,.sc-th"); var n = document.createElement("img"); n.className = "sc-th"; n.alt = ""; n.src = URL.createObjectURL(f); if (im) im.replaceWith(n); } }
  }
  window.IFSAContent = {
    mount: function (el, o) {
      C.sb = o.sb; C.role = o.role === "admin" ? "admin" : "manager"; C.toast = o.toast || function () {}; C.root = el; C.base = o.base || "";
      el.onclick = onClick; el.onsubmit = onSubmit; el.onchange = onChange;
      try { C.sb.auth.getUser().then(function (r) { C.uid = r && r.data && r.data.user ? r.data.user.id : null; }); } catch (e) { /* facultatif */ }
      render(); reload();
    },
    _state: S
  };
})();
