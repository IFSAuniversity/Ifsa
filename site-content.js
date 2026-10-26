/* IFSA University — gestion du contenu du site public (actualités, événements, galerie, vidéos, zones d'images).
   Utilisé par manager.html (directeur général) et admin.html (administrateur). La sécurité réelle est assurée par la base de données. */
(function () {
  "use strict";
  var BUCKET = "media", MAXSIDE = 1600, MAXRAW = 25 * 1024 * 1024;
  var CATS = { news: ["Admissions", "Campus", "Événements", "Académique", "Vie universitaire", "Facultés et recherche", "Vie étudiante", "Annonces officielles"], events: ["Admissions", "Conférence", "Cérémonie", "Autre"], gal: ["Campus", "Étudiants", "Cérémonies", "Événements"] };
  var TABS = [
    { id: "news", label: "Actualités", ic: "news", where: "Apparaît sur : <b>Le Journal d'IFSA</b> (page Actualités : article à la une, colonne secondaire, dernières actualités, annonces officielles) et la page de chaque article, ainsi que les 3 dernières sur l'<b>accueil</b>. Le premier article publié est « à la une » ; une photo paysage (1200 × 800) est recommandée.", link: "actualites.html" },
    { id: "events", label: "Événements", ic: "cal", where: "Apparaît sur : la page <b>Événements</b> (à venir et passés) et l'<b>agenda de l'accueil</b> (les 3 prochains).", link: "evenements.html" },
    { id: "gal", label: "Galerie", ic: "img", where: "Apparaît sur : la page <b>Galerie</b> (photos classées par catégorie, avec agrandissement).", link: "galerie.html" },
    { id: "vids", label: "Vidéos", ic: "vid", where: "Apparaît sur : l'<b>accueil</b> (section « En vidéo », 3 vidéos au plus, celle à la une en premier) et la page <b>Galerie</b> (toutes les vidéos actives).", link: "galerie.html" },
    { id: "slides", label: "Bannière d'accueil", ic: "img", where: "Apparaît sur : la <b>grande bannière en haut de l'accueil</b> (diaporama). Chaque diapo = une image, un titre et un texte. Un voile sombre garde le texte lisible.", link: "index.html" },
    { id: "courses", label: "Cours en ligne", ic: "vid", where: "Apparaît sur : la page <b>Cours en ligne</b> et dans l'espace des étudiants concernés. Cliquez sur une carte pour l'<b>aperçu</b>, puis modifiez, masquez ou supprimez. Choisissez <b>qui peut regarder</b>, activez ou non les <b>commentaires</b>, et suivez l'<b>historique</b> des changements.", link: "cours.html" },
    { id: "chat", label: "Chatbot", ic: "chat", where: "Apparaît sur : le <b>chatbot</b> du site. Ajoutez des questions-réponses : elles sont servies <b>sans IA</b> (zéro quota) et servent de source fiable à l'IA. Les questions restées sans réponse apparaissent plus bas : transformez-les en réponses.", link: "index.html" },
    { id: "sites", label: "Sites et carte", ic: "pin", admin: true, where: "Apparaît sur : la <b>carte</b> de la page Contact. Placez l'épingle de chaque site à l'endroit exact (clic, glisser, recherche d'adresse ou lien Google Maps).", link: "contact.html#carte" },
    { id: "testi", label: "Témoignages", ic: "news", admin: true, where: "Apparaît sur : la section <b>Ils parlent d'IFSA</b> de l'accueil. Vous pouvez créer, modifier, masquer ou supprimer n'importe quel témoignage.", link: "index.html#temoignages" },
    { id: "zones", label: "Zones d'images", ic: "pin", admin: true, where: "Chaque zone est une <b>photo précise d'une page du site</b>. Tant qu'aucune image n'est choisie, le site affiche son emplacement d'exemple.", link: "index.html" }
  ];
  var ICO = { chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', news: '<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M8 8h7M8 12h7M8 16h4"/>', cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', img: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>', vid: '<rect width="18" height="14" x="3" y="5" rx="2"/><path d="m10 9 5 3-5 3z"/>', pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', edit: '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', copy: '<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' };
  var ic = function (n) { return '<svg class="sc-i" viewBox="0 0 24 24" aria-hidden="true">' + (ICO[n] || "") + "</svg>"; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var httpsUrl = function (u) { u = String(u || "").trim(); return /^https:\/\//i.test(u) ? u.replace(/["'<>()\s\\]/g, function (c) { return encodeURIComponent(c); }) : ""; };
  var fmtD = function (d) { return d ? new Date(String(d).length <= 10 ? d + "T12:00:00" : d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : ""; };
  var C = { sb: null, role: "", toast: function () {}, root: null, uid: null, base: "" }, S = { tab: "news", edit: null, busy: false, loaded: false, err: "", d: { news: [], events: [], gal: [], vids: [], slides: [], testi: [], zones: [], hero: null, courses: [], sites: [], chat: [], miss: [] } };

  var css = document.createElement("style");
  css.textContent = ".sc{--scn:var(--navy,#0B1F4B);--scg:var(--gold,#C9A24B);--scm:var(--mut,#5B667C);--scl:var(--line,#E1E6F2);--scc:var(--card,#fff);--sci:var(--ink,#1B2437)}.sc *{box-sizing:border-box}.sc-i{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}.sc-tabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:4px}.sc-tabs button{flex:none;display:inline-flex;gap:7px;align-items:center;border:1.5px solid var(--scl);background:var(--scc);color:var(--sci);border-radius:12px;padding:10px 14px;font-weight:600;font-size:.88rem;cursor:pointer}.sc-tabs button[aria-selected=true]{background:var(--scn);color:#E8CF8E;border-color:var(--scn)}.sc-where{background:rgba(201,162,75,.14);border:1px solid rgba(201,162,75,.45);border-radius:14px;padding:12px 14px;margin-bottom:14px;font-size:.9rem;color:var(--sci);display:flex;gap:10px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}.sc-where a{display:inline-flex;gap:6px;align-items:center;font-weight:700;color:var(--scn);text-decoration:underline}.sc-card{background:var(--scc);border:1px solid var(--scl);border-radius:18px;padding:16px;margin-bottom:14px}.sc-card h3{margin:0 0 10px;font-size:1.05rem}.sc label{display:grid;gap:5px;font-weight:700;font-size:.84rem;margin-bottom:12px;color:var(--scn)}.sc input,.sc select,.sc textarea{width:100%;padding:11px 13px;border:1.5px solid var(--scl);border-radius:12px;background:transparent;color:var(--sci);font:inherit;font-weight:500;font-size:16px}.sc textarea{min-height:130px;resize:vertical}.sc .sc-ck{display:flex;gap:10px;align-items:center;font-weight:600}.sc .sc-ck input{width:20px;height:20px}.sc-r2{display:grid;gap:12px;grid-template-columns:1fr 1fr}@media(max-width:560px){.sc-r2{grid-template-columns:1fr}}.sc-h{font-weight:500;color:var(--scm);font-size:.8rem;margin:-6px 0 12px}.sc-btn{display:inline-flex;gap:7px;align-items:center;justify-content:center;border:1.5px solid var(--scl);background:var(--scc);color:var(--sci);border-radius:12px;padding:9px 14px;font-weight:600;font-size:.84rem;cursor:pointer;min-height:40px;text-decoration:none}.sc-btn.p{background:linear-gradient(135deg,#C9A24B,#DDB863);color:#0B1F4B;border-color:transparent;font-weight:700}.sc-btn.d{color:#B3261E}.sc-btn[disabled]{opacity:.55;cursor:wait}.sc-row{display:flex;gap:12px;align-items:flex-start;background:var(--scc);border:1px solid var(--scl);border-radius:16px;padding:12px;margin-bottom:10px}.sc-th{width:84px;height:64px;border-radius:12px;object-fit:cover;flex:none;background:rgba(11,31,75,.08)}.sc-th.ph{display:grid;place-items:center;color:var(--scm);font-size:.7rem;text-align:center}.sc-tx{flex:1;min-width:0}.sc-tx b{display:block;word-break:break-word}.sc-tx small{display:block;color:var(--scm)}.sc-ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.sc-bd{display:inline-block;border-radius:99px;padding:2px 10px;font-size:.72rem;font-weight:700;margin-right:6px;background:rgba(11,31,75,.08);color:var(--scn)}.sc-bd.ok{background:#E3F4EA;color:#0E6B3A}.sc-bd.wt{background:rgba(201,162,75,.22);color:#8A6414}.sc-pv{display:flex;gap:12px;align-items:center;border:1px dashed var(--scl);border-radius:14px;padding:10px;margin:0 0 12px}.sc-pv img,.sc-pv .sc-th{width:96px;height:72px}.sc-empty{text-align:center;color:var(--scm);padding:26px 10px}.sc-gal{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.sc-gi{background:var(--scc);border:1px solid var(--scl);border-radius:16px;overflow:hidden}.sc-gi img{width:100%;height:120px;object-fit:cover;display:block}.sc-gi div{padding:10px}.sc-zp{margin:18px 0 8px;font-size:1rem;color:var(--scn)}.sc-err{background:#FDECEC;color:#A12B2B;border-radius:12px;padding:11px 14px;margin-bottom:12px;font-size:.88rem}.sc-load{text-align:center;padding:40px;color:var(--scm)}";
  css.textContent += ".sc-hh{font-weight:800;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--scm);margin:12px 0 6px}.sc-ls{display:flex;gap:10px;align-items:flex-start;padding:10px;margin-bottom:8px;border:1px solid var(--scl);border-radius:14px;background:var(--bg,#F1F4FA)}.sc-lt{flex:none;width:112px;aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:#0B1F4B;color:#8FA2CC;display:grid;place-items:center;font-size:.7rem}.sc-lt img{width:100%;height:100%;object-fit:cover}.sc-lf{flex:1;min-width:0;display:grid;gap:6px}.sc-lf input{width:100%;min-height:40px;border:1.5px solid var(--scl);border-radius:10px;padding:0 10px;background:var(--scc);color:var(--sci);font:inherit}#sc-map{margin-bottom:10px}@media(max-width:560px){.sc-ls{flex-wrap:wrap}.sc-lt{width:100%}}";
  css.textContent += '.cv-aud{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-bottom:10px}.cv-ac{display:flex!important;gap:10px;align-items:flex-start;padding:11px 12px;border:1.5px solid var(--scl);border-radius:12px;cursor:pointer;margin:0!important;background:var(--scc)}.cv-ac:has(input:checked){border-color:var(--scg);background:rgba(201,162,75,.12)}.cv-ac input{margin-top:3px;flex:none;accent-color:#C9A24B}.cv-ac b{display:block;font-size:.88rem}.cv-ac small{display:block;color:var(--scm);font-size:.74rem;font-weight:500;margin-top:1px}.cv-hint{font-size:.78rem;color:var(--scm);margin:-2px 0 10px}.cv-note.warn{border-color:#E5A33B;background:rgba(229,163,59,.14)}.cv-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:14px}.cv-k{padding:14px 16px;border-radius:16px;background:linear-gradient(160deg,var(--scc),rgba(201,162,75,.08));border:1px solid var(--scl)}.cv-k b{display:block;font-size:1.55rem;line-height:1.1;color:var(--scn)}.cv-k span{font-size:.76rem;font-weight:700;color:var(--scm)}.cv-k.g b{color:#16803C}.cv-k.o b{color:#B3770A}\n.cv-top{display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:12px}.cv-sub{display:inline-flex;padding:4px;border-radius:14px;background:rgba(11,31,75,.07);gap:2px;max-width:100%;overflow-x:auto}.cv-sub button{border:0;background:transparent;color:var(--sci);border-radius:10px;padding:9px 14px;font-weight:700;font-size:.85rem;cursor:pointer;white-space:nowrap}.cv-sub button small{opacity:.6;font-weight:700}.cv-sub button.on{background:var(--scc);box-shadow:0 2px 8px rgba(11,31,75,.14);color:var(--scn)}\n.cv-bar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}.cv-s{flex:1;min-width:200px}.cv-bar input,.cv-bar select{width:100%;padding:10px 13px;border:1.5px solid var(--scl);border-radius:12px;background:var(--scc);color:var(--sci);font:inherit;font-size:.9rem}.cv-fl{display:inline-flex;gap:6px;flex-wrap:wrap}.cv-fl button{border:1.5px solid var(--scl);background:var(--scc);color:var(--sci);border-radius:99px;padding:8px 14px;font-weight:700;font-size:.8rem;cursor:pointer}.cv-fl button.on{background:var(--scn);border-color:var(--scn);color:#E8CF8E}.cv-sel{display:block;margin:0!important;min-width:170px}\n.cv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px}.cv-card{display:flex;flex-direction:column;border:1px solid var(--scl);border-radius:20px;background:var(--scc);overflow:hidden;transition:.25s;box-shadow:0 4px 16px rgba(11,31,75,.06)}.cv-card:hover{transform:translateY(-3px);box-shadow:0 16px 36px rgba(11,31,75,.14)}.cv-card.off .cv-im img,.cv-card.off .cv-art{filter:grayscale(.85) brightness(.8)}\n.cv-im{position:relative;aspect-ratio:16/9;background:#0B1F4B;cursor:pointer;overflow:hidden}.cv-im img{width:100%;height:100%;object-fit:cover;display:block}.cv-art{width:100%;height:100%;display:grid;place-items:center}.cv-art b{font:700 2.4rem Georgia,serif;color:rgba(255,255,255,.88)}.cv-b{display:inline-block;padding:4px 10px;border-radius:99px;font-size:.7rem;font-weight:800;background:rgba(7,26,69,.75);color:#fff;backdrop-filter:blur(6px);margin-right:6px}.cv-im .cv-b{position:absolute;top:10px;left:10px}.cv-im .cv-b.n{left:auto;right:10px;background:rgba(255,255,255,.9);color:#0B1F4B}.cv-im .cv-b.hid{top:auto;bottom:10px;background:#B45309}.cv-b.res{background:rgba(179,119,10,.92)}.cv-b.pub{background:rgba(22,128,60,.9)}.cv-b.hid{background:#B45309}\n.cv-eye{position:absolute;inset:0;display:flex;gap:8px;align-items:center;justify-content:center;background:rgba(7,26,69,.55);color:#fff;font-weight:700;opacity:0;transition:.2s}.cv-im:hover .cv-eye{opacity:1}\n.cv-bd{display:flex;flex-direction:column;gap:7px;padding:14px;flex:1}.cv-bd>b{font-size:1rem;line-height:1.25;color:var(--scn)}.cv-bd small{color:var(--scm);font-size:.78rem}.cv-chips{display:flex;gap:6px;flex-wrap:wrap}.cv-chips span{font-size:.7rem;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(11,31,75,.07);color:var(--sci)}\n.cv-sw{display:flex!important;grid-template-columns:none!important;flex-direction:row;gap:9px;align-items:center;font-size:.78rem!important;font-weight:700;color:var(--scm)!important;margin:2px 0!important;cursor:pointer}.cv-sw input{position:absolute;opacity:0;width:1px;height:1px}.cv-sw i{width:36px;height:21px;border-radius:99px;background:rgba(11,31,75,.22);position:relative;transition:.2s;flex:none}.cv-sw i::after{content:"";position:absolute;left:3px;top:3px;width:15px;height:15px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}.cv-sw input:checked+i{background:#16A34A}.cv-sw input:checked+i::after{transform:translateX(15px)}.cv-sw input:focus-visible+i{outline:3px solid var(--scg)}\n.cv-ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px}.cv-ac .sc-btn{padding:8px 11px;min-height:38px;font-size:.8rem}.cv-ac .sc-btn.p{flex:1}\n.cv-form .cv-fh{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.cv-form .cv-fh h3{margin:0}.cv-opt{border:1px solid var(--scl);border-radius:16px;padding:14px;margin:4px 0 14px;background:rgba(201,162,75,.07)}.cv-opt h4{margin:0 0 8px;font-size:.95rem}.cv-note{font-size:.8rem;color:var(--scm);padding:10px 12px;border-radius:12px;background:rgba(11,31,75,.05);margin:-2px 0 12px}.cv-note.on{background:rgba(179,119,10,.12);color:var(--sci);border:1px solid rgba(179,119,10,.35)}\n.cv-modal{position:fixed;inset:0;z-index:1000;background:rgba(5,11,30,.62);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px}.cv-md{position:relative;width:min(640px,100%);max-height:92vh;overflow:auto;border-radius:24px;background:var(--scc);color:var(--sci);box-shadow:0 30px 80px rgba(0,0,0,.45)}.cv-x{position:absolute;right:12px;top:12px;z-index:2;width:36px;height:36px;border-radius:50%;border:0;background:rgba(7,26,69,.7);color:#fff;font-size:1.3rem;cursor:pointer}.cv-mh{position:relative;aspect-ratio:16/8;background:#0B1F4B}.cv-mh>img,.cv-mh>.cv-art{width:100%;height:100%;object-fit:cover}.cv-mh::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(5,11,30,.9))}.cv-mt{position:absolute;z-index:1;left:20px;right:20px;bottom:16px;color:#fff}.cv-mt h3{color:#fff;margin:6px 0 2px;font-size:1.4rem}.cv-mt small{color:#C3CFEA}\n.cv-mb{padding:18px 20px}.cv-mb p{color:var(--scm);margin:0 0 14px}.cv-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:16px}.cv-kv div{padding:10px 12px;border-radius:12px;background:rgba(11,31,75,.05)}.cv-kv small{display:block;font-size:.66rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--scm)}.cv-kv b{font-size:.88rem}.cv-mb h4{margin:0 0 8px}.cv-ls{list-style:none;margin:0;padding:0;display:grid;gap:6px;counter-reset:l}.cv-ls li{counter-increment:l;display:flex;justify-content:space-between;gap:10px;padding:9px 12px;border-radius:12px;border:1px solid var(--scl);font-size:.88rem}.cv-ls li::before{content:counter(l);font-weight:800;color:var(--scg);margin-right:10px}.cv-ls li span{flex:1}.cv-mf{display:flex;gap:8px;flex-wrap:wrap;padding:0 20px 20px}\n.cv-log{padding:8px 14px}.cv-lg{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--scl)}.cv-lg:last-child{border:0}.cv-lg i{flex:none;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:rgba(11,31,75,.08)}.cv-lg.c i{background:rgba(22,163,74,.15);color:#16803C}.cv-lg.d i{background:rgba(220,38,38,.13);color:#B91C1C}.cv-lg.u i{background:rgba(47,91,211,.13);color:#2F5BD3}.cv-lg small{display:block;color:var(--scm);font-size:.74rem;margin-top:2px}.cv-lg em{color:var(--scm)}\n.cv-cm{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-bottom:1px solid var(--scl)}.cv-cm:last-child{border:0}.cv-av{flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:.78rem;color:#fff;background:linear-gradient(135deg,#2F5BD3,#0B1F4B)}.cv-cb{flex:1;min-width:0}.cv-cb small{color:var(--scm)}.cv-cb p{margin:4px 0 0;white-space:pre-wrap;word-break:break-word}\n@media(max-width:560px){.cv-grid{grid-template-columns:1fr}.cv-cm{flex-wrap:wrap}}';
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
    jobs.push(C.role === "admin" ? sb.from("site_images").select("*").order("position", { ascending: true }) : Promise.resolve(null));
    jobs.push(sb.from("site_settings").select("value").eq("key", "hero_config").maybeSingle());
    jobs.push(sb.from("online_courses").select("*, online_lessons(*)").order("position", { ascending: true }));
    jobs.push(C.role === "admin" ? sb.from("sites").select("*").order("position", { ascending: true }) : Promise.resolve(null));
    jobs.push(sb.from("chat_kb").select("*").order("created_at", { ascending: false }));
    jobs.push(sb.from("chat_unanswered").select("*").order("n", { ascending: false }).limit(30));
    jobs.push(sb.from("audit_log").select("*").eq("target_type", "online_course").order("created_at", { ascending: false }).limit(120));
    jobs.push(sb.from("course_comments").select("id,course_id,parent_id,user_id,body,created_at").order("created_at", { ascending: false }).limit(150));
    jobs.push(sb.rpc("course_comment_counts"));
    jobs.push(sb.from("site_settings").select("value").eq("key", "journal_config").maybeSingle());
    var r = await Promise.all(jobs);
    S.d = { news: must(r[0]), events: must(r[1]), gal: must(r[2]), vids: must(r[3]), slides: r[4] && !r[4].error ? must(r[4]) : [], testi: r[5] ? must(r[5]) : [], zones: r[6] ? must(r[6]) : [] };
    S.d.journal = r[15] && !r[15].error && r[15].data ? r[15].data.value : null;
    S.d.hero = r[7] && !r[7].error && r[7].data ? r[7].data.value : null;
    S.d.courses = r[8] && !r[8].error ? (r[8].data || []).map(function (c) { c.lessons = (c.online_lessons || []).sort(function (a, b) { return a.position - b.position; }); return c; }) : [];
    S.d.coursesErr = r[8] && r[8].error ? r[8].error.message : "";
    S.d.sites = r[9] && !r[9].error ? (r[9].data || []) : [];
    S.d.chat = r[10] && !r[10].error ? (r[10].data || []) : []; S.d.miss = r[11] && !r[11].error ? (r[11].data || []) : []; S.d.chatErr = r[10] && r[10].error ? r[10].error.message : "";
    S.d.clog = r[12] && !r[12].error ? (r[12].data || []) : []; S.d.ccm = r[13] && !r[13].error ? (r[13].data || []) : []; S.d.ccmErr = r[13] && r[13].error ? r[13].error.message : "";
    S.d.ccounts = null; if (r[14] && !r[14].error && Array.isArray(r[14].data)) { S.d.ccounts = {}; r[14].data.forEach(function (x) { S.d.ccounts[x.course_id] = Number(x.n); }); }
    var uids = []; S.d.ccm.concat(S.d.clog.map(function (l) { return { user_id: l.actor_id }; })).forEach(function (m) { if (m.user_id && uids.indexOf(m.user_id) < 0) uids.push(m.user_id); });
    S.d.names = {}; if (uids.length) { try { var pr = await sb.from("profiles").select("id,full_name,role").in("id", uids); (pr.data || []).forEach(function (p) { S.d.names[p.id] = p; }); } catch (e) { /* noms facultatifs */ } }
    S.loaded = true; S.err = "";
  }
  async function reload() { try { await load(); } catch (e) { S.err = "Chargement impossible : " + ((e && e.message) || "erreur"); } render(); }
  function purge() { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("ifsa_dc_v1_") === 0) localStorage.removeItem(k); }); } catch (e) { /* facultatif */ } }
  async function run(btn, f, ok) {
    if (S.busy) return; S.busy = true; if (btn) { btn.disabled = true; }
    try { await f(); purge(); if (ok) C.toast(ok); await reload(); }
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
      '<div class="sc-r2"><label>2e bouton (facultatif)<input id="sc-s2l" maxlength="40" value="' + v("cta2_label") + '"></label><label>Lien du 2e bouton<input id="sc-s2u" maxlength="200" placeholder="facultes.html" value="' + v("cta2_url") + '"></label></div>' +
      '<label>Alignement du texte<select id="sc-sa"><option value="left"' + (!e || e.align === "left" ? " selected" : "") + '>À gauche</option><option value="center"' + (e && e.align === "center" ? " selected" : "") + '>Centré</option><option value="right"' + (e && e.align === "right" ? " selected" : "") + '>À droite</option></select></label>' +
      '<div class="sc-r2"><label>Ordre (1 = première)<input id="sc-so" type="number" min="1" max="99" value="' + (e ? e.position : d.length + 1) + '"></label><label>Voile sombre sur l\'image : <b id="sc-svv">' + (e && e.overlay != null ? e.overlay : 55) + ' %</b><input id="sc-sv" type="range" min="0" max="85" step="5" value="' + (e && e.overlay != null ? e.overlay : 55) + '" oninput="document.getElementById(\'sc-svv\').textContent=this.value+\' %\'"></label></div>' +
      '<div class="sc-pv" id="sc-pv">' + thumb(e && e.image_url, "") + '<div class="sc-h" style="margin:0">Image de fond : format paysage, 1920 × 900 px conseillé. Le voile sombre est ajouté automatiquement pour que le texte reste lisible.</div></div>' +
      '<label>Image<input type="file" id="sc-si" accept="image/jpeg,image/png,image/webp"></label>' +
      (e && e.image_url ? '<label class="sc-ck"><input type="checkbox" id="sc-sr"> Retirer l\'image actuelle</label>' : "") +
      '<label class="sc-ck"><input type="checkbox" id="sc-sp"' + (!e || e.published ? " checked" : "") + "> Affichée sur l'accueil</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer" : "Ajouter à la bannière") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    return form + (d.length ? d.map(function (s) {
      return '<div class="sc-row">' + thumb(s.image_url, s.title) + '<div class="sc-tx"><b>' + esc(s.position) + ". " + esc(s.title) + "</b><small>" + esc(s.subtitle || "") + "</small>" + badge(s.published, "Affichée", "Masquée") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="slides" data-id="' + esc(s.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="slides" data-id="' + esc(s.id) + '">' + (s.published ? "Masquer" : "Afficher") + '</button><button class="sc-btn d" data-a="del" data-t="slides" data-id="' + esc(s.id) + '">' + ic("trash") + "</button></div></div></div>";
    }).join("") : '<div class="sc-empty">Aucune diapo : l\'accueil affiche ses diapos par défaut. Ajoutez la première ci-dessus (ou exécutez la mise à jour 7a pour les rendre modifiables).</div>');
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

  /* ---------- réglages de la bannière (chiffres clés, appel, durée) ---------- */
  function journalCard() {
    var c = S.d.journal || {}, def = "Annonces, campus, événements et vie académique : toute l'actualité de l'université.";
    return '<form class="sc-card" data-f="journal"><h3>Réglages du Journal d\'IFSA</h3><div class="sc-h" style="margin:0 0 8px">Texte et blocs de l\'en-tête de la page <b>Actualités</b>. Les articles eux-mêmes se gèrent plus bas.</div>' +
      '<label>Sous-titre du journal<input id="sc-jsub" maxlength="200" value="' + esc(c.subtitle || "") + '" placeholder="' + esc(def) + '"></label>' +
      '<div class="sc-r2"><label>Mention d\'édition<input id="sc-jed" maxlength="40" value="' + esc(c.edition || "") + '" placeholder="Édition numérique"></label>' +
      '<label>Rubriques « annonces officielles » (mots-clés, séparés par des virgules)<input id="sc-jkw" maxlength="120" value="' + esc(c.official_kw || "") + '" placeholder="annonce, communiqué, officiel"></label></div>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-jof"' + (c.show_official !== false ? " checked" : "") + '> Afficher le bloc « Annonces officielles » (articles dont la catégorie contient un des mots-clés)</label>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-jev"' + (c.show_events !== false ? " checked" : "") + '> Afficher le bloc « À l\'agenda » (les 4 prochains événements)</label>' +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic("edit") + 'Enregistrer les réglages</button></div></form>';
  }

  function heroCard() {
    var c = S.d.hero || { stats: [{ n: "2007", l: "Année de fondation" }, { n: "4", l: "Sites de formation" }, { n: "7", l: "Facultés" }], call_label: "Une question ? Appelez-nous", call_phone: "33 53 24 15", show_stats: true, show_call: true, duration: 6.5 }, st = c.stats || [];
    var rows = [0, 1, 2, 3].map(function (i) { var x = st[i] || {}; return '<div class="sc-r2"><label>Chiffre clé ' + (i + 1) + '<input id="sc-hn' + i + '" maxlength="12" value="' + esc(x.n) + '" placeholder="ex. 2007"></label><label>Légende<input id="sc-hl' + i + '" maxlength="40" value="' + esc(x.l) + '" placeholder="ex. Année de fondation"></label></div>'; }).join("");
    return '<form class="sc-card" data-f="hero"><h3>Réglages de la bannière</h3><div class="sc-h" style="margin:0 0 8px">Les chiffres et le numéro d\'appel affichés en bas de la bannière. Laissez un chiffre vide pour le retirer.</div>' + rows +
      '<label class="sc-ck"><input type="checkbox" id="sc-hs"' + (c.show_stats !== false ? " checked" : "") + '> Afficher les chiffres clés</label>' +
      '<div class="sc-r2"><label>Texte au-dessus du numéro<input id="sc-hcl" maxlength="50" value="' + esc(c.call_label) + '"></label><label>Numéro à appeler<input id="sc-hcp" maxlength="30" value="' + esc(c.call_phone) + '"></label></div>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-hc"' + (c.show_call !== false ? " checked" : "") + '> Afficher le bouton « Appelez-nous »</label>' +
      '<label>Durée de chaque diapo : <b id="sc-hdv">' + (c.duration || 6.5) + ' s</b><input id="sc-hd" type="range" min="3" max="15" step="0.5" value="' + (c.duration || 6.5) + '" oninput="document.getElementById(\'sc-hdv\').textContent=this.value+\' s\'"></label>' +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic("edit") + 'Enregistrer les réglages</button></div></form>';
  }

  /* ---------- cours en ligne : tableau de bord, aperçu, historique, modération ---------- */
  var AUD = { "public": "Tout le monde (même sans compte)", members: "Toute personne connectée", student: "Étudiants", teacher: "Enseignants", staff: "Employés / personnel (enseignants, économes, secrétaires, directeurs)" };
  var AUDX = [["student", "Étudiants", "Seuls les étudiants connectés"], ["teacher", "Enseignants", "Seuls les enseignants"], ["staff", "Employés / personnel", "Enseignants, économes, secrétaires, directeurs d'antenne"], ["members", "Toute personne connectée", "Étudiants, enseignants, personnel"], ["public", "Tout le monde", "Même les visiteurs sans compte"]];
  var audVal = function () { var r = C.root.querySelector('input[name="sc-aud"]:checked'); return r ? r.value : "student"; };
  var AUDS = { "public": "Public", members: "Comptes connectés", student: "Étudiants", teacher: "Enseignants", staff: "Personnel" };
  var CV = { sub: "list", q: "", flt: "all", fac: "", form: false, prev: null, cfil: "" };
  var FHUE = [["#2F5BD3", "#0B1F4B"], ["#0E9F6E", "#064E3B"], ["#7C3AED", "#2E1065"], ["#D97706", "#78350F"], ["#DB2777", "#500724"], ["#65A30D", "#1A2E05"], ["#0891B2", "#083344"]];
  var durMin = function (t) { var p = String(t || "").split(":").map(Number); if (!p.length || p.some(isNaN)) return 0; return p.length === 3 ? p[0] * 60 + p[1] + p[2] / 60 : p.length === 2 ? p[0] + p[1] / 60 : p[0]; };
  var nzs = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var ccount = function (id) { var n = S.d.ccounts && S.d.ccounts[id]; return n != null ? n : S.d.ccm.filter(function (m) { return m.course_id === id; }).length; };
  var nameOf = function (id) { var p = S.d.names && S.d.names[id]; return p ? p.full_name || "Sans nom" : "Utilisateur"; };
  var ROLEF = { student: "Étudiant", teacher: "Enseignant", manager: "Direction", admin: "Administrateur", user: "Membre", branch_director: "Directeur d'antenne", bursar: "Économe", secretary: "Secrétaire" };
  var fmtDT = function (d) { return d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""; };
  function lessonRow(l, i) {
    var id = l && l.youtube_id ? l.youtube_id : "", t = id ? '<img src="https://i.ytimg.com/vi/' + esc(id) + '/mqdefault.jpg" alt="">' : "<span>Miniature</span>";
    return '<div class="sc-ls" data-ls><div class="sc-lt">' + t + '</div><div class="sc-lf"><input class="ls-t" maxlength="120" placeholder="Titre de la leçon ' + (i + 1) + '" value="' + esc(l && l.title) + '"><input class="ls-u" placeholder="Lien YouTube (youtube.com/watch?v=… ou youtu.be/…)" value="' + (id ? "https://youtu.be/" + esc(id) : "") + '"><input class="ls-d" maxlength="12" placeholder="Durée (ex. 12:30)" value="' + esc(l && l.duration) + '"></div><button type="button" class="sc-btn d" data-a="lsdel" title="Retirer la leçon">' + ic("trash") + "</button></div>";
  }
  function cvArt(c) { var i = Math.max(0, FACS.indexOf(c.faculty)), h = FHUE[i], ini = String(c.title || "?").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase(); return '<div class="cv-art" style="background:linear-gradient(150deg,' + h[0] + "," + h[1] + ')"><b>' + esc(ini) + "</b></div>"; }
  function cvThumb(c) { var f = c.lessons[0], u = httpsUrl(c.cover_url) || (f && f.youtube_id ? "https://i.ytimg.com/vi/" + f.youtube_id + "/mqdefault.jpg" : ""); return u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : cvArt(c); }
  function cvForm() {
    var e = S.edit && S.edit.t === "courses" ? S.edit.row : null, d = S.d.courses, v = function (k) { return esc(e && e[k]); };
    var ls = e && e.lessons && e.lessons.length ? e.lessons : [null], aud = e ? e.audience : "student";
    return '<form class="sc-card cv-form" data-f="course"><div class="cv-fh"><h3>' + (e ? "Modifier « " + esc(e.title) + " »" : "Nouveau cours en ligne") + '</h3><button type="button" class="sc-btn" data-a="cformx">Fermer</button></div>' +
      '<label>Titre du cours<input id="sc-ct" maxlength="140" required value="' + v("title") + '"></label>' +
      '<div class="cv-opt"><h4>1. Pour qui est ce cours ?</h4><div class="cv-aud">' + AUDX.map(function (a) { return '<label class="cv-ac"><input type="radio" name="sc-aud" value="' + a[0] + '"' + (aud === a[0] ? " checked" : "") + '><span><b>' + esc(a[1]) + "</b><small>" + esc(a[2]) + "</small></span></label>"; }).join("") + '</div><div class="cv-note" id="sc-pn"></div></div>' +
      '<div class="cv-opt"><h4>2. <span id="sc-cfl">Pour quelle filière ?</span></h4><label><select id="sc-cf"><option value="">—</option>' + opts(FACS, e && e.faculty) + '</select></label><div class="cv-hint" id="sc-cfh"></div>' +
      '<div class="sc-r2"><label>Option / matière<input id="sc-co" maxlength="80" value="' + v("option_name") + '"></label><label>Année<select id="sc-cy"><option value="">—</option>' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option value="' + n + '"' + (e && e.year === n ? " selected" : "") + ">Année " + n + "</option>"; }).join("") + '</select></label></div>' +
      '<label>Enseignant<input id="sc-cp" maxlength="80" value="' + v("teacher") + '"></label></div>' +
      '<label>Description<textarea id="sc-cd" maxlength="400">' + v("description") + "</textarea></label>" +
      '<div class="cv-opt"><h4>3. Options</h4>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-cm"' + (!e || e.comments_enabled !== false ? " checked" : "") + '> Activer les commentaires sous ce cours (visibles uniquement par l\'audience du cours)</label>' +
      '<label class="sc-ck" id="sc-yw"><input type="checkbox" id="sc-cy2"' + (e && e.allow_youtube ? " checked" : "") + '> Afficher le bouton « Ouvrir sur YouTube » (cours publics uniquement)</label></div>' +
      '<div class="sc-hh">Leçons</div><div id="sc-lsw">' + ls.map(lessonRow).join("") + '</div><button type="button" class="sc-btn" data-a="lsadd">' + ic("plus") + 'Ajouter une leçon</button>' +
      '<div class="sc-r2" style="margin-top:12px"><label>Ordre (1 = premier)<input id="sc-cn" type="number" min="1" max="999" value="' + (e ? e.position : d.length + 1) + '"></label><label>Image de couverture (facultatif)<input type="file" id="sc-cc" accept="image/jpeg,image/png,image/webp"></label></div>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-cb"' + (!e || e.published ? " checked" : "") + "> Affiché sur le site</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e ? "edit" : "plus") + (e ? "Enregistrer les modifications" : "Ajouter le cours") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
  }
  function cvFiltered() {
    var q = nzs(CV.q);
    return S.d.courses.filter(function (c) {
      if (CV.fac && c.faculty !== CV.fac) return false;
      if (CV.flt === "on" && !c.published) return false; if (CV.flt === "off" && c.published) return false; if (CV.flt === "res" && c.audience === "public") return false;
      return !q || nzs([c.title, c.faculty, c.option_name, c.teacher, c.description].join(" ")).indexOf(q) > -1;
    });
  }
  function cvCard(c) {
    var min = Math.round(c.lessons.reduce(function (s, l) { return s + durMin(l.duration); }, 0)), n = ccount(c.id), prot = c.audience !== "public";
    return '<article class="cv-card' + (c.published ? "" : " off") + '"><div class="cv-im" data-a="cview" data-id="' + esc(c.id) + '" title="Aperçu du cours">' + cvThumb(c) + '<span class="cv-b n">' + esc(c.position) + "</span>" + '<span class="cv-b ' + (prot ? "res" : "pub") + '">' + (prot ? "🔒 " : "") + esc(AUDS[c.audience] || c.audience) + "</span>" + (c.published ? "" : '<span class="cv-b hid">Masqué</span>') + '<span class="cv-eye">' + ic("eye") + "Aperçu</span></div>" +
      '<div class="cv-bd"><b>' + esc(c.title) + "</b><small>" + esc([c.faculty, c.year ? "Année " + c.year : "", c.teacher].filter(Boolean).join(" · ") || "Faculté non précisée") + '</small><div class="cv-chips"><span>' + c.lessons.length + " leçon" + (c.lessons.length > 1 ? "s" : "") + "</span>" + (min ? "<span>" + min + " min</span>" : "") + "<span>" + n + " commentaire" + (n > 1 ? "s" : "") + "</span>" + (c.restrict_faculty ? "<span>Faculté seule</span>" : "") + "</div>" +
      '<label class="cv-sw" title="Commentaires"><input type="checkbox" data-a="ccom" data-id="' + esc(c.id) + '"' + (c.comments_enabled !== false ? " checked" : "") + '><i></i><span>Commentaires ' + (c.comments_enabled !== false ? "activés" : "désactivés") + "</span></label>" +
      '<div class="cv-ac"><button class="sc-btn p" data-a="edit" data-t="courses" data-id="' + esc(c.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="pub" data-t="courses" data-id="' + esc(c.id) + '">' + (c.published ? "Masquer" : "Afficher") + '</button><button class="sc-btn" data-a="cdup" data-id="' + esc(c.id) + '" title="Dupliquer">' + ic("copy") + '</button><button class="sc-btn d" data-a="del" data-t="courses" data-id="' + esc(c.id) + '" title="Supprimer">' + ic("trash") + "</button></div></div></article>";
  }
  function cvList() {
    var L = cvFiltered(); return L.length ? '<div class="cv-grid">' + L.map(cvCard).join("") + "</div>" : '<div class="sc-empty">' + (S.d.courses.length ? "Aucun cours ne correspond à ce filtre." : "Aucun cours. Cliquez sur « Nouveau cours » pour ajouter le premier.") + "</div>";
  }
  function cvPreview() {
    var c = CV.prev && find("courses", CV.prev); if (!c) return ""; var prot = c.audience !== "public", n = ccount(c.id), min = Math.round(c.lessons.reduce(function (s, l) { return s + durMin(l.duration); }, 0));
    return '<div class="cv-modal" data-a="cclose"><div class="cv-md" role="dialog" aria-modal="true" aria-label="Aperçu du cours"><button class="cv-x" data-a="cclose" aria-label="Fermer">×</button><div class="cv-mh">' + cvThumb(c) + '<div class="cv-mt"><span class="cv-b ' + (prot ? "res" : "pub") + '">' + (prot ? "🔒 " : "") + esc(AUDS[c.audience]) + "</span>" + (c.published ? "" : '<span class="cv-b hid">Masqué du site</span>') + "<h3>" + esc(c.title) + "</h3><small>" + esc([c.faculty, c.option_name, c.year ? "Année " + c.year : "", c.teacher].filter(Boolean).join(" · ")) + "</small></div></div>" +
      '<div class="cv-mb"><p>' + (esc(c.description) || '<i>Aucune description.</i>') + '</p><div class="cv-kv"><div><small>Audience</small><b>' + esc(AUD[c.audience]) + "</b></div><div><small>Protection</small><b>" + (prot ? "YouTube masqué · lien non copiable" : "Lecteur standard") + "</b></div><div><small>Commentaires</small><b>" + (c.comments_enabled !== false ? "Activés · " + n : "Désactivés") + "</b></div><div><small>Contenu</small><b>" + c.lessons.length + " leçon(s)" + (min ? " · " + min + " min" : "") + "</b></div>" + (c.restrict_faculty ? "<div><small>Accès</small><b>Faculté « " + esc(c.faculty || "—") + " » seulement</b></div>" : "") + "</div>" +
      '<h4>Leçons</h4><ol class="cv-ls">' + (c.lessons.map(function (l) { return "<li><span>" + esc(l.title) + "</span><small>" + esc(l.duration || "") + "</small></li>"; }).join("") || "<li><span>Aucune leçon</span></li>") + "</ol></div>" +
      '<div class="cv-mf"><button class="sc-btn p" data-a="edit" data-t="courses" data-id="' + esc(c.id) + '">' + ic("edit") + 'Modifier</button><a class="sc-btn" target="_blank" rel="noopener" href="' + esc(site("cours.html#cours-" + c.id)) + '">' + ic("ext") + 'Voir sur le site</a><button class="sc-btn" data-a="pub" data-t="courses" data-id="' + esc(c.id) + '">' + (c.published ? "Masquer" : "Afficher") + '</button><button class="sc-btn d" data-a="del" data-t="courses" data-id="' + esc(c.id) + '">' + ic("trash") + "Supprimer</button></div></div></div>";
  }
  function cvLog() {
    var L = S.d.clog; if (!L.length) return '<div class="sc-empty">Aucune activité enregistrée. Exécutez supabase-update-8a.sql : l\'historique se remplit ensuite à chaque création, modification ou suppression de cours.</div>';
    var txt = function (l) { var D = l.details || {}, t = "« " + esc(D.title || "cours") + " »"; return l.action === "course_created" ? "a créé le cours " + t : l.action === "course_deleted" ? "a supprimé le cours " + t : "a modifié le cours " + t + (D.changes && D.changes.length ? ' <em>(' + esc(D.changes.join(", ")) + ")</em>" : ""); };
    return '<div class="sc-card cv-log">' + L.map(function (l) { var k = l.action === "course_created" ? "c" : l.action === "course_deleted" ? "d" : "u"; return '<div class="cv-lg ' + k + '"><i>' + ic(k === "c" ? "plus" : k === "d" ? "trash" : "edit") + '</i><div><b>' + esc(nameOf(l.actor_id)) + "</b> " + txt(l) + "<small>" + esc(fmtDT(l.created_at)) + (l.actor_role ? " · " + esc(ROLEF[l.actor_role] || l.actor_role) : "") + "</small></div></div>"; }).join("") + "</div>";
  }
  function cvComm() {
    var err = S.d.ccmErr ? '<div class="sc-err">Commentaires indisponibles : ' + esc(S.d.ccmErr) + " — exécutez supabase-update-8a.sql.</div>" : "";
    var title = function (id) { var c = find("courses", id); return c ? c.title : "Cours supprimé"; };
    var L = S.d.ccm.filter(function (m) { return !CV.cfil || m.course_id === CV.cfil; });
    return err + '<div class="cv-bar"><label class="cv-sel">Cours<select data-a="ccfil"><option value="">Tous les cours</option>' + S.d.courses.map(function (c) { return '<option value="' + esc(c.id) + '"' + (CV.cfil === c.id ? " selected" : "") + ">" + esc(c.title) + "</option>"; }).join("") + "</select></label></div>" +
      (L.length ? '<div class="sc-card">' + L.map(function (m) { var p = S.d.names[m.user_id] || {}; return '<div class="cv-cm"><span class="cv-av">' + esc(String(p.full_name || "?").trim().split(/\s+/).map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase()) + '</span><div class="cv-cb"><div><b>' + esc(p.full_name || "Utilisateur") + "</b> <span class=\"sc-bd\">" + esc(ROLEF[p.role] || "Membre") + "</span>" + (m.parent_id ? ' <span class="sc-bd wt">Réponse</span>' : "") + "<small> sur « " + esc(title(m.course_id)) + " » · " + esc(fmtDT(m.created_at)) + "</small></div><p>" + esc(m.body) + '</p></div><button class="sc-btn d" data-a="cmdel" data-id="' + esc(m.id) + '" title="Supprimer ce commentaire">' + ic("trash") + "Supprimer</button></div>"; }).join("") + "</div>" : '<div class="sc-empty">Aucun commentaire pour le moment.</div>');
  }
  function vCourses() {
    var d = S.d.courses, e = S.edit && S.edit.t === "courses", open = e || CV.form;
    var err = S.d.coursesErr ? '<div class="sc-err">Cours indisponibles : ' + esc(S.d.coursesErr) + " — exécutez supabase-update-7a.sql puis 8a.</div>" : "";
    var pub = d.filter(function (c) { return c.published; }).length, res = d.filter(function (c) { return c.audience !== "public"; }).length, les = d.reduce(function (s, c) { return s + c.lessons.length; }, 0), nc = d.reduce(function (s, c) { return s + ccount(c.id); }, 0);
    var kp = function (n, l, k) { return '<div class="cv-k ' + (k || "") + '"><b>' + n + "</b><span>" + l + "</span></div>"; };
    var tabs = [["list", "Cours", d.length], ["comm", "Commentaires", nc], ["log", "Historique", S.d.clog.length]];
    var head = '<div class="cv-kpis">' + kp(d.length, "Cours") + kp(pub, "Affichés", "g") + kp(res, "Réservés", "o") + kp(les, "Leçons") + kp(nc, "Commentaires") + '</div><div class="cv-top"><div class="cv-sub" role="tablist">' + tabs.map(function (t) { return '<button type="button" data-a="csub" data-id="' + t[0] + '" class="' + (CV.sub === t[0] ? "on" : "") + '">' + t[1] + " <small>" + t[2] + "</small></button>"; }).join("") + '</div><button class="sc-btn p" data-a="cnew">' + ic("plus") + "Nouveau cours</button></div>";
    var body;
    if (CV.sub === "log") body = cvLog(); else if (CV.sub === "comm") body = cvComm();
    else body = '<div class="cv-bar"><div class="cv-s"><input id="cv-q" type="search" placeholder="Rechercher un cours, un enseignant…" value="' + esc(CV.q) + '" aria-label="Rechercher"></div><div class="cv-fl">' + [["all", "Tous"], ["on", "Affichés"], ["off", "Masqués"], ["res", "Réservés"]].map(function (x) { return '<button type="button" data-a="cflt" data-id="' + x[0] + '" class="' + (CV.flt === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + '</div><label class="cv-sel"><select data-a="cfac" aria-label="Faculté"><option value="">Toutes les facultés</option>' + FACS.map(function (f) { return '<option' + (CV.fac === f ? " selected" : "") + ">" + esc(f) + "</option>"; }).join("") + '</select></label></div><div id="cv-list">' + cvList() + "</div>";
    return err + head + (open ? cvForm() : "") + body + cvPreview();
  }
  function protNote() {
    var n = C.root.querySelector("#sc-pn"), y = C.root.querySelector("#sc-cy2"), f = C.root.querySelector("#sc-cf"); if (!n || !f) return;
    var a = audVal(), pub = a === "public", byFac = a === "student" || a === "members";
    n.className = "cv-note on" + (pub ? " warn" : "");
    n.innerHTML = pub ? "⚠ <b>Visible par tout le monde</b>, même sans compte. Pour réserver ce cours à vos étudiants, choisissez « Étudiants »." : "<b>Cours protégé</b> : la vidéo n'est envoyée qu'aux personnes de cette audience ; l'interface YouTube est masquée et un filigrane au nom du spectateur est affiché.";
    var l = C.root.querySelector("#sc-cfl"), h = C.root.querySelector("#sc-cfh");
    if (l) l.textContent = byFac ? "Pour quelle filière ?" : "Faculté concernée (facultatif)";
    if (h) h.textContent = byFac ? (f.value ? "Seuls les étudiants de « " + f.value + " » verront ce cours" + (a === "members" ? " (les enseignants et le personnel le voient aussi)." : ".") : "Aucune faculté choisie : tous les étudiants, toutes filières, verront ce cours.") : "Sert uniquement à classer le cours dans la bibliothèque ; ne limite pas qui le voit.";
    f.options[0].textContent = byFac ? "Toutes les filières" : "—";
    if (y) { y.disabled = !pub; if (!pub) y.checked = false; y.parentNode.style.opacity = pub ? "" : ".5"; }
  }

  /* ---------- sites et carte ---------- */
  function vSites() {
    var e = S.edit && S.edit.t === "sites" ? S.edit.row : null, d = S.d.sites, v = function (k) { return esc(e && e[k]); };
    var form = e ? '<form class="sc-card" data-f="site"><h3>Position de « ' + esc(e.name) + ' »</h3>' +
      '<div class="sc-h" style="margin:0 0 8px">Cherchez l\'adresse, collez un lien Google Maps ou des coordonnées, ou cliquez sur la carte, puis <b>glissez l\'épingle</b> pour l\'ajuster. Passez en vue satellite pour trouver le bâtiment.</div><div id="sc-map"></div>' +
      '<div class="sc-r2"><label>Latitude<input id="sc-la" inputmode="decimal" value="' + v("lat") + '"></label><label>Longitude<input id="sc-lo" inputmode="decimal" value="' + v("lng") + '"></label></div>' +
      '<label>Adresse affichée<input id="sc-ad" maxlength="160" value="' + v("address") + '"></label>' +
      '<div class="sc-r2"><label>Téléphone<input id="sc-ph" maxlength="60" value="' + v("phone") + '"></label><label>Horaires (facultatif)<input id="sc-hr" maxlength="100" placeholder="Lun–Ven 8h–16h" value="' + v("hours") + '"></label></div>' +
      '<label>Courte description (facultatif)<textarea id="sc-de" maxlength="240">' + v("description") + "</textarea></label>" +
      '<input type="hidden" id="sc-zm" value="' + (e.zoom || 17) + '">' +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic("edit") + 'Enregistrer la position</button><button class="sc-btn" type="button" data-a="cancel">Annuler</button></div></form>' : "";
    var err = d.length ? "" : '<div class="sc-err">Aucun site trouvé (ou colonnes de la mise à jour 7a absentes).</div>';
    return err + form + d.map(function (x) {
      var has = x.lat != null && x.lng != null;
      return '<div class="sc-row"><div class="sc-th ph" style="display:grid;place-items:center">' + ic("pin") + '</div><div class="sc-tx"><b>' + esc(x.name) + (x.is_central ? " · siège" : "") + "</b><small>" + esc(x.address || "Adresse non renseignée") + (has ? " · " + (+x.lat).toFixed(5) + ", " + (+x.lng).toFixed(5) : "") + "</small>" + badge(has, "Position définie", "À placer") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="sites" data-id="' + esc(x.id) + '">' + ic("pin") + "Placer sur la carte</button></div></div></div>";
    }).join("");
  }
  function afterRender() {
    protNote();
    if (S.tab !== "sites" || !(S.edit && S.edit.t === "sites")) return;
    var host = C.root.querySelector("#sc-map"), row = S.edit.row; if (!host) return;
    function go() {
      IFSAMap.picker(host, { lat: row.lat, lng: row.lng, zoom: row.zoom || 17, name: row.name, onChange: function (v) { var a = C.root.querySelector("#sc-la"), b = C.root.querySelector("#sc-lo"), z = C.root.querySelector("#sc-zm"); if (a) a.value = v.lat; if (b) b.value = v.lng; if (z) z.value = v.zoom; } }).then(function (api) {
        S.picker = api; var upd = function () { var a = parseFloat(C.root.querySelector("#sc-la").value), b = parseFloat(C.root.querySelector("#sc-lo").value); if (isFinite(a) && isFinite(b) && api.set) api.set(a, b); };
        C.root.querySelector("#sc-la").onchange = upd; C.root.querySelector("#sc-lo").onchange = upd;
      });
    }
    if (window.IFSAMap) go(); else { var sc = document.createElement("script"); sc.src = site("ifsa-map.js"); sc.onload = go; sc.onerror = function () { host.textContent = "La carte n'a pas pu se charger : saisissez la latitude et la longitude à la main."; }; document.head.appendChild(sc); }
  }

  function vChat() {
    var e = S.edit && S.edit.t === "chat" ? S.edit.row : (S.pre || null), d = S.d.chat, v = function (k) { return esc(e && e[k]); };
    var form = '<form class="sc-card" data-f="chat"><h3>' + (e && e.id ? "Modifier la réponse" : "Nouvelle question-réponse") + "</h3>" +
      '<label>Question type<input id="sc-kq" maxlength="200" required placeholder="Ex. Quels sont les frais d\'inscription ?" value="' + v("question") + '"></label>' +
      '<label>Mots-clés (séparés par des virgules)<input id="sc-kk" maxlength="300" placeholder="frais, scolarite, combien, prix, cout" value="' + v("keywords") + '"></label>' +
      '<div class="sc-h" style="margin:-4px 0 8px">Pensez aux mots que les visiteurs écrivent vraiment, au pluriel et au singulier. Sans accents. Plus il y a de mots-clés justes, plus la réponse est servie directement, sans IA.</div>' +
      '<label>Réponse<textarea id="sc-ka" maxlength="700" required>' + v("answer") + "</textarea></label>" +
      '<div class="sc-r2"><label>Texte du lien (facultatif)<input id="sc-kl" maxlength="40" placeholder="Voir les admissions" value="' + v("link_label") + '"></label><label>Lien (facultatif)<input id="sc-ku" maxlength="200" placeholder="admissions.html" value="' + v("link_url") + '"></label></div>' +
      '<label class="sc-ck"><input type="checkbox" id="sc-kb"' + (!e || e.active !== false ? " checked" : "") + "> Active</label>" +
      '<div class="sc-ac"><button class="sc-btn p" type="submit">' + ic(e && e.id ? "edit" : "plus") + (e && e.id ? "Enregistrer" : "Ajouter") + "</button>" + (e ? '<button class="sc-btn" type="button" data-a="cancel">Annuler</button>' : "") + "</div></form>";
    var err = S.d.chatErr ? '<div class="sc-err">Chatbot indisponible : ' + esc(S.d.chatErr) + " — exécutez supabase-update-7b.sql.</div>" : "";
    var miss = S.d.miss.length ? '<div class="sc-card"><h3>Questions restées sans réponse</h3><div class="sc-h" style="margin:0 0 8px">Les plus posées en premier. « Répondre » préremplit le formulaire ci-dessus.</div>' + S.d.miss.map(function (m) {
      return '<div class="sc-row"><div class="sc-tx"><b>' + esc(m.q) + "</b><small>Posée " + esc(m.n) + ' fois</small><div class="sc-ac"><button class="sc-btn" data-a="kbmiss" data-id="' + esc(m.id) + '">' + ic("edit") + 'Répondre</button><button class="sc-btn d" data-a="del" data-t="miss" data-id="' + esc(m.id) + '">' + ic("trash") + "Ignorer</button></div></div></div>"; }).join("") + "</div>" : "";
    return err + form + miss + (d.length ? d.map(function (k) {
      return '<div class="sc-row"><div class="sc-tx"><b>' + esc(k.question) + "</b><small>" + esc(String(k.answer).slice(0, 110)) + "…</small>" + badge(k.active, "Active", "Désactivée") +
        '<div class="sc-ac"><button class="sc-btn" data-a="edit" data-t="chat" data-id="' + esc(k.id) + '">' + ic("edit") + 'Modifier</button><button class="sc-btn" data-a="kbtog" data-id="' + esc(k.id) + '">' + (k.active ? "Désactiver" : "Activer") + '</button><button class="sc-btn d" data-a="del" data-t="chat" data-id="' + esc(k.id) + '">' + ic("trash") + "</button></div></div></div>"; }).join("") : '<div class="sc-empty">Aucune réponse enregistrée. Ajoutez-en quelques-unes : frais, documents à fournir, dates de rentrée…</div>');
  }
  function render() {
    var root = C.root; if (!root) return;
    var tabs = TABS.filter(function (t) { return !t.admin || C.role === "admin"; }); if (!tabs.some(function (t) { return t.id === S.tab; })) S.tab = tabs[0].id;
    var t = tabs.filter(function (x) { return x.id === S.tab; })[0], body = !S.loaded ? '<div class="sc-load">Chargement…</div>' : ({ news: function () { return journalCard() + vNews(); }, events: vEvents, gal: vGal, vids: vVids, zones: vZones, slides: function () { return heroCard() + vSlides(); }, testi: vTesti, courses: vCourses, sites: vSites, chat: vChat })[S.tab]();
    root.innerHTML = '<div class="sc"><div class="sc-tabs" role="tablist">' + tabs.map(function (x) { return '<button type="button" role="tab" data-a="tab" data-id="' + x.id + '" aria-selected="' + (x.id === S.tab) + '">' + ic(x.ic) + esc(x.label) + "</button>"; }).join("") + "</div>" +
      '<div class="sc-where"><span>' + t.where + "</span>" + viewLink(t.link, "Ouvrir la page du site") + "</div>" + (S.err ? '<div class="sc-err">' + esc(S.err) + "</div>" : "") + body + "</div>";
    afterRender();
  }

  /* ---------- actions ---------- */
  var tbl = { news: "news", events: "events", gal: "gallery_items", vids: "video_links", slides: "home_slides", testi: "testimonials", courses: "online_courses", chat: "chat_kb", miss: "chat_unanswered" };
  function find(t, id) { return (S.d[t] || []).filter(function (r) { return r.id === id; })[0]; }
  async function onClick(e) {
    var b = e.target.closest("[data-a]"); if (!b) return; var a = b.dataset.a, id = b.dataset.id, t = b.dataset.t, sb = C.sb;
    if (a === "tab") { S.tab = id; S.edit = null; CV.prev = null; render(); return; }
    if (a === "cnew") { S.edit = null; CV.form = true; CV.sub = "list"; CV.prev = null; render(); var fm0 = C.root.querySelector(".cv-form"); if (fm0 && fm0.scrollIntoView) fm0.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (a === "cformx") { CV.form = false; S.edit = null; render(); return; }
    if (a === "csub") { CV.sub = id; render(); return; }
    if (a === "cflt") { CV.flt = id; render(); return; }
    if (a === "cview") { CV.prev = id; render(); return; }
    if (a === "cclose") { if (e.target !== b && !e.target.closest(".cv-x")) return; CV.prev = null; render(); return; }
    if (a === "ccom") { var cc = find("courses", id); if (!cc) return; e.stopPropagation(); await run(null, async function () { must(await sb.from("online_courses").update({ comments_enabled: !(cc.comments_enabled !== false) }).eq("id", id)); }, cc.comments_enabled !== false ? "Commentaires désactivés pour ce cours." : "Commentaires activés pour ce cours."); return; }
    if (a === "cmdel") { if (!window.confirm("Supprimer ce commentaire (et ses réponses) ?")) return; await run(b, async function () { must(await sb.from("course_comments").delete().eq("id", id)); }, "Commentaire supprimé."); return; }
    if (a === "cdup") {
      var src = find("courses", id); if (!src) return;
      await run(b, async function () {
        var cp = { title: src.title + " (copie)", faculty: src.faculty, option_name: src.option_name, year: src.year, teacher: src.teacher, description: src.description, cover_url: src.cover_url, audience: src.audience, allow_youtube: src.allow_youtube, comments_enabled: src.comments_enabled, restrict_faculty: src.restrict_faculty, position: S.d.courses.length + 1, published: false };
        var ni = await sb.from("online_courses").insert(cp).select("id").single(); if (ni.error) throw ni.error;
        if (src.lessons.length) must(await sb.from("online_lessons").insert(src.lessons.map(function (l, i) { return { course_id: ni.data.id, title: l.title, youtube_id: l.youtube_id, duration: l.duration, position: i + 1 }; })));
      }, "Cours dupliqué (masqué) : modifiez-le puis affichez-le."); return;
    }
    if (a === "lsadd") { var w = C.root.querySelector("#sc-lsw"); w.insertAdjacentHTML("beforeend", lessonRow(null, w.children.length)); return; }
    if (a === "lsdel") { var rw = b.closest("[data-ls]"), wr = rw.parentNode; if (wr.children.length > 1) rw.remove(); else rw.querySelectorAll("input").forEach(function (i) { i.value = ""; }); return; }
    if (a === "kbmiss") { var m = find("miss", id); if (m) { S.pre = { question: m.q, keywords: m.q_norm || "", answer: "", active: true }; S.edit = null; render(); C.root.scrollIntoView && C.root.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    if (a === "kbtog") { var kk = find("chat", id); if (!kk) return; await run(b, async function () { must(await sb.from("chat_kb").update({ active: !kk.active }).eq("id", id)); }, kk.active ? "Réponse désactivée." : "Réponse activée."); return; }
    if (a === "cancel") { S.pre = null; S.edit = null; render(); return; }
    if (a === "edit") { var row = find(t, id); if (row) { CV.prev = null; S.edit = { t: t, row: row }; render(); C.root.scrollIntoView && C.root.scrollIntoView({ behavior: "smooth", block: "start" }); } return; }
    if (a === "pub") { var r = find(t, id); if (!r) return; await run(b, async function () { var v = !r.published; must(await sb.from(tbl[t]).update({ published: v }).eq("id", id)); }, r.published ? "Contenu masqué du site." : "Publié : visible sur le site (rechargez la page du site pour le voir)."); return; }
    if (a === "act") { var v1 = find("vids", id); if (!v1) return; await run(b, async function () { must(await sb.from("video_links").update({ active: !v1.active }).eq("id", id)); }, v1.active ? "Vidéo masquée." : "Vidéo affichée sur le site."); return; }
    if (a === "feat") { var v2 = find("vids", id); if (!v2) return; await run(b, async function () { must(await sb.from("video_links").update({ featured: !v2.featured }).eq("id", id)); }, v2.featured ? "Retirée de la une." : "Mise à la une."); return; }
    if (a === "del") {
      var d = find(t, id); if (!d) return;
      if (!window.confirm("Supprimer définitivement « " + (d.title || d.caption || "ce contenu") + " » ?\n\nCette action est irréversible. Pour seulement le retirer du site, utilisez « Masquer ».")) return;
      await run(b, async function () { must(await sb.from(tbl[t]).delete().eq("id", id)); if (d.image_url) await drop(d.image_url); if (t === "courses") { CV.prev = null; if (d.cover_url) await drop(d.cover_url); } }, "Supprimé."); return;
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
        var row = { kicker: q("sc-sk").value.trim() || null, title: st, subtitle: q("sc-ss").value.trim() || null, cta_label: q("sc-sl").value.trim() || null, cta_url: q("sc-su").value.trim() || null, cta2_label: q("sc-s2l").value.trim() || null, cta2_url: q("sc-s2u").value.trim() || null, align: q("sc-sa").value, position: +q("sc-so").value || 1, overlay: +q("sc-sv").value, image_url: url, published: q("sc-sp").checked };
        if (sd) must(await sb.from("home_slides").update(row).eq("id", sd.id)); else must(await sb.from("home_slides").insert(row));
        if (old && old !== url) await drop(old); S.edit = null;
      }, sd ? "Diapo modifiée." : "Diapo ajoutée à la bannière."); return;
    }
    if (kind === "journal") {
      await run(btn, async function () {
        var val = { subtitle: q("sc-jsub").value.trim(), edition: q("sc-jed").value.trim(), official_kw: q("sc-jkw").value.trim(), show_official: q("sc-jof").checked, show_events: q("sc-jev").checked };
        must(await sb.from("site_settings").upsert({ key: "journal_config", value: val, updated_at: new Date().toISOString() }, { onConflict: "key" }));
        S.d.journal = val;
      }, "Réglages du journal enregistrés."); return;
    }
    if (kind === "hero") {
      var stats = [0, 1, 2, 3].map(function (i) { return { n: q("sc-hn" + i).value.trim(), l: q("sc-hl" + i).value.trim() }; }).filter(function (x) { return x.n; });
      await run(btn, async function () {
        var val = { stats: stats, show_stats: q("sc-hs").checked, call_label: q("sc-hcl").value.trim(), call_phone: q("sc-hcp").value.trim(), show_call: q("sc-hc").checked, duration: +q("sc-hd").value || 6.5 };
        must(await sb.from("site_settings").upsert({ key: "hero_config", value: val, updated_at: new Date().toISOString() }, { onConflict: "key" }));
      }, "Réglages de la bannière enregistrés."); return;
    }
    if (kind === "site") {
      var se = S.edit && S.edit.t === "sites" ? S.edit.row : null; if (!se) return;
      var la = parseFloat(q("sc-la").value), lo = parseFloat(q("sc-lo").value);
      if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) { C.toast("Placez l'épingle sur la carte (ou saisissez une latitude et une longitude valides).", true); return; }
      await run(btn, async function () {
        must(await sb.from("sites").update({ lat: +la.toFixed(6), lng: +lo.toFixed(6), zoom: +q("sc-zm").value || 17, address: q("sc-ad").value.trim() || null, phone: q("sc-ph").value.trim() || null, hours: q("sc-hr").value.trim() || null, description: q("sc-de").value.trim() || null }).eq("id", se.id));
        S.edit = null; S.picker = null;
      }, "Position enregistrée : la carte du site est à jour."); return;
    }
    if (kind === "chat") {
      var ke = S.edit && S.edit.t === "chat" ? S.edit.row : null, kq = q("sc-kq").value.trim(), ka = q("sc-ka").value.trim();
      if (kq.length < 3 || ka.length < 3) { C.toast("Indiquez la question et la réponse.", true); return; }
      await run(btn, async function () {
        var row = { question: kq, keywords: q("sc-kk").value.trim().toLowerCase(), answer: ka, link_label: q("sc-kl").value.trim() || null, link_url: q("sc-ku").value.trim() || null, active: q("sc-kb").checked };
        if (ke) must(await sb.from("chat_kb").update(row).eq("id", ke.id)); else { must(await sb.from("chat_kb").insert(row)); if (S.pre) { var mm = S.d.miss.filter(function (x) { return x.q === S.pre.question; })[0]; if (mm) await sb.from("chat_unanswered").delete().eq("id", mm.id); } }
        S.edit = null; S.pre = null;
      }, "Réponse enregistrée : le chatbot l'utilise (jusqu'à 5 min de délai).") ; return;
    }
    if (kind === "course") {
      var ce = S.edit && S.edit.t === "courses" ? S.edit.row : null, ct = q("sc-ct").value.trim(), cf = q("sc-cc").files[0], les = [], badL = "";
      [].forEach.call(f.querySelectorAll("[data-ls]"), function (r, i) {
        var t = r.querySelector(".ls-t").value.trim(), u = r.querySelector(".ls-u").value.trim(), dd = r.querySelector(".ls-d").value.trim(); if (!t && !u) return;
        var id = ytId(u); if (!t || !id) { badL = badL || "Leçon " + (i + 1) + " : indiquez un titre et un lien YouTube valide."; return; } les.push({ title: t, youtube_id: id, duration: dd || null });
      });
      if (ct.length < 3) { C.toast("Donnez un titre au cours.", true); return; }
      if (badL) { C.toast(badL, true); return; } if (!les.length) { C.toast("Ajoutez au moins une leçon avec son lien YouTube.", true); return; }
      await run(btn, async function () {
        var cover = ce ? ce.cover_url || null : null, oldc = cover; if (cf) cover = await upload("courses", cf, 1000);
        var row = { title: ct, faculty: q("sc-cf").value || null, option_name: q("sc-co").value.trim() || null, year: +q("sc-cy").value || null, teacher: q("sc-cp").value.trim() || null, description: q("sc-cd").value.trim() || null, audience: audVal(), allow_youtube: audVal() === "public" && q("sc-cy2").checked, comments_enabled: q("sc-cm").checked, restrict_faculty: (audVal() === "student" || audVal() === "members") && !!q("sc-cf").value, position: +q("sc-cn").value || 1, published: q("sc-cb").checked, cover_url: cover }, cid;
        if (ce) { must(await sb.from("online_courses").update(row).eq("id", ce.id)); cid = ce.id; must(await sb.from("online_lessons").delete().eq("course_id", cid)); }
        else { var ins = await sb.from("online_courses").insert(row).select("id").single(); if (ins.error) throw ins.error; cid = ins.data.id; }
        must(await sb.from("online_lessons").insert(les.map(function (l, i) { return { course_id: cid, title: l.title, youtube_id: l.youtube_id, duration: l.duration, position: i + 1 }; })));
        if (oldc && oldc !== cover) await drop(oldc); S.edit = null; CV.form = false;
      }, ce ? "Cours modifié." : "Cours ajouté : il apparaît sur la page Cours en ligne."); return;
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
    var sl = e.target.closest("select[data-a]");
    if (sl && sl.dataset.a === "cfac") { CV.fac = sl.value; render(); return; }
    if (sl && sl.dataset.a === "ccfil") { CV.cfil = sl.value; render(); return; }
    if (e.target.name === "sc-aud" || e.target.id === "sc-cf") { protNote(); return; }
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
  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "cv-q" && C.root && C.root.contains(e.target)) { CV.q = e.target.value; var L = C.root.querySelector("#cv-list"); if (L) L.innerHTML = cvList(); return; }
    var u = e.target && e.target.classList && e.target.classList.contains("ls-u") ? e.target : null; if (!u || !C.root || !C.root.contains(u)) return;
    var id = ytId(u.value), box = u.closest("[data-ls]").querySelector(".sc-lt"); box.innerHTML = id ? '<img src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg" alt="">' : "<span>Miniature</span>";
  });
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
