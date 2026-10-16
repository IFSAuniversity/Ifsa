/* IFSA University — lecture du contenu publié par l'administration.
   Utilisé par : index, actualites, article, evenements, galerie et les pages avec photos.
   Règle : si la base répond, ses données font foi ; si elle ne répond pas, la page garde son contenu d'exemple. */
(function () {
  "use strict";
  var SB_URL = "https://feahvqexnoozmpkseate.supabase.co", SB_KEY = "sb_publishable_ivXCWsho2PYO1JH-1sUpRg_p-S91Z9X";
  var CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", TIMEOUT = 8000;
  var client = null, pending = null, cache = {};

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  /* seules les adresses https sont acceptées pour les images */
  function safeUrl(u) { u = String(u || "").trim(); return /^https:\/\//i.test(u) ? u.replace(/["'<>()\s\\]/g, function (c) { return encodeURIComponent(c); }) : ""; }
  function getClient() {
    if (client) return Promise.resolve(client);
    if (pending) return pending;
    pending = new Promise(function (res, rej) {
      function make() { try { client = window.__ifsaSB || (window.__ifsaSB = window.supabase.createClient(SB_URL, SB_KEY)); res(client); } catch (e) { rej(e); } }
      if (window.supabase && window.supabase.createClient) return make();
      var s = document.createElement("script"); s.src = CDN; s.async = true; s.onload = make; s.onerror = function () { rej(new Error("cdn")); };
      document.head.appendChild(s);
    });
    return pending;
  }
  function timeout(p) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, TIMEOUT); })]); }
  function query(table, build) {
    return timeout(getClient().then(function (c) { return build(c.from(table)); }).then(function (r) { if (r.error) throw r.error; return r.data || []; }));
  }
  /* Affichage immédiat : la dernière réponse connue est gardée dans le navigateur.
     Si le réseau répond en moins de 0,6 s on affiche les données fraîches, sinon on affiche tout de suite la copie
     et la mise à jour continue en arrière-plan pour la visite suivante. */
  var CK = "ifsa_dc_v1_";
  function readC(k) { try { var o = JSON.parse(localStorage.getItem(CK + k) || "null"); return o && Date.now() - o.t < 7 * 864e5 ? o.d : null; } catch (e) { return null; } }
  function writeC(k, d) { try { localStorage.setItem(CK + k, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {} }
  function swr(key, f) {
    var c = readC(key), net = f().then(function (d) { writeC(key, d); return d; });
    if (!c) return net;
    return Promise.race([net.catch(function () { return c; }), new Promise(function (res) { setTimeout(function () { res(c); }, 600); })]);
  }
  function once(key, f) { return cache[key] || (cache[key] = swr(key, f)); }

  var IFSA = {
    esc: esc, url: safeUrl,
    news: function () { return once("news", function () { return query("news", function (q) { return q.select("*").eq("published", true).order("published_at", { ascending: false }).limit(60); }); }); },
    events: function () { return once("events", function () { return query("events", function (q) { return q.select("*").eq("published", true).order("event_date", { ascending: true }).limit(200); }); }); },
    gallery: function () { return once("gallery", function () { return query("gallery_items", function (q) { return q.select("*").eq("published", true).order("position", { ascending: true }).order("created_at", { ascending: false }).limit(200); }); }); },
    videos: function () { return once("videos", function () { return query("video_links", function (q) { return q.select("*").eq("active", true).order("featured", { ascending: false }).order("position", { ascending: true }).limit(60); }); }); },
    zones: function () { return once("zones", function () { return query("site_images", function (q) { return q.select("key,image_url,alt"); }); }); },
    /* ---- ajouts 5a : bannière, témoignages, j'aime, session ---- */
    /* partenaires : [] tant que l'admin n'a pas activé la section ou ajouté de partenaire */
    partners: function () { return once("partners", function () {
      return query("site_settings", function (q) { return q.select("value").eq("key", "partners_enabled"); }).then(function (r) {
        if (!r.length || r[0].value !== true) return [];
        return query("partners", function (q) { return q.select("*").eq("active", true).order("position", { ascending: true }).limit(24); });
      }).catch(function () { return []; });
    }); },
    client: getClient,
    slides: function () { return once("slides", function () { return query("home_slides", function (q) { return q.select("*").eq("published", true).order("position", { ascending: true }).limit(12); }); }); },
    testimonials: function () { return once("testi", function () { return query("testimonials", function (q) { return q.select("*").eq("published", true).order("created_at", { ascending: false }).limit(30); }); }); },
    /* identifiant anonyme d'appareil : permet d'aimer sans compte */
    visitor: function () { var k = "ifsa-visitor", v = ""; try { v = localStorage.getItem(k) || ""; if (v.length < 8) { v = "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); localStorage.setItem(k, v); } } catch (e) { v = v || "v" + Math.random().toString(36).slice(2, 14); } return v; },
    stats: function (type, ids) { return timeout(getClient().then(function (c) { return c.rpc("get_stats", { t: type, ids: ids.map(String), v: IFSA.visitor() }); })).then(function (r) { if (r.error) throw r.error; return r.data || []; }); },
    like: function (type, id) { return timeout(getClient().then(function (c) { return c.rpc("toggle_like", { t: type, i: String(id), v: IFSA.visitor() }); })).then(function (r) { if (r.error) throw r.error; return r.data; }); },
    /* utilisateur connecté et son profil (null si visiteur) */
    me: function () { return getClient().then(function (c) { return c.auth.getSession().then(function (s) { var u = s && s.data && s.data.session && s.data.session.user; if (!u) return null; return c.from("profiles").select("id,role,full_name").eq("id", u.id).maybeSingle().then(function (r) { return r.data ? r.data : { id: u.id, role: "user", full_name: "" }; }); }); }).catch(function () { return null; }); },
    /* texte d'une actualité -> paragraphes (séparés par une ligne vide) */
    paragraphs: function (t) { return String(t || "").split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean); },
    /* remplace les emplacements d'images ([data-zone]) par les photos choisies par l'administrateur */
    applyZones: function () {
      var els = document.querySelectorAll("[data-zone]");
      if (!els.length) return Promise.resolve();
      return IFSA.zones().then(function (rows) {
        var m = {}; rows.forEach(function (r) { if (r.image_url) m[r.key] = r; });
        [].forEach.call(els, function (el) {
          var z = m[el.getAttribute("data-zone")]; if (!z) return;
          var u = safeUrl(z.image_url); if (!u) return;
          if (el.getAttribute("data-zone-mode") === "var") { el.style.setProperty("--img", 'url("' + u + '")'); return; }
          el.textContent = ""; el.style.background = 'url("' + u + '") center/cover no-repeat'; el.style.border = "0";
          el.setAttribute("role", "img"); el.setAttribute("aria-label", z.alt || ""); el.classList.add("has-img");
        });
      }).catch(function () { /* la page garde ses emplacements d'exemple */ });
    },
    /* vidéos YouTube : vignette, la lecture ne démarre qu'au clic (aucun cookie avant) */
    videoCards: function (list) {
      var ok = list.filter(function (v) { return /^[\w-]{6,15}$/.test(String(v.youtube_id || "")); });
      return ok.map(function (v) { var id = v.youtube_id;
        return '<button type="button" class="ifsa-yt" data-id="' + esc(id) + '" aria-label="Lire la vidéo : ' + esc(v.title) + '"><img loading="lazy" src="https://i.ytimg.com/vi/' + esc(id) + '/hqdefault.jpg" alt=""><span class="ifsa-yt-p" aria-hidden="true"></span><b>' + esc(v.title) + '</b></button>'; }).join("");
    },
    bindVideos: function (root) {
      root.addEventListener("click", function (e) {
        var b = e.target.closest(".ifsa-yt"); if (!b) return;
        var id = b.getAttribute("data-id"); if (!/^[\w-]{6,15}$/.test(id)) return;
        var f = document.createElement("iframe"); f.className = "ifsa-yt-f"; f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true; f.title = b.getAttribute("aria-label") || "Vidéo";
        b.replaceWith(f);
      });
    }
  };
  /* style minimal des vignettes vidéo (indépendant du reste de la page) */
  var st = document.createElement("style");
  st.textContent = ".ifsa-vg{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}.ifsa-yt{position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;padding:0;border-radius:18px;overflow:hidden;background:#0B1F4B;cursor:pointer;text-align:left}.ifsa-yt img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85}.ifsa-yt b{position:absolute;left:0;right:0;bottom:0;padding:34px 14px 12px;color:#fff;font:700 .95rem system-ui,sans-serif;background:linear-gradient(transparent,rgba(7,26,69,.9))}.ifsa-yt-p{position:absolute;left:50%;top:44%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:#C9A24B}.ifsa-yt-p::after{content:'';position:absolute;left:23px;top:17px;border-left:18px solid #0B1F4B;border-top:12px solid transparent;border-bottom:12px solid transparent}.ifsa-yt-f{width:100%;aspect-ratio:16/9;border:0;border-radius:18px;background:#000}.ifsa-yt:focus-visible{outline:3px solid #C9A24B;outline-offset:3px}";
  document.head.appendChild(st);
  window.IFSA = IFSA;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", IFSA.applyZones); else IFSA.applyZones();
})();
