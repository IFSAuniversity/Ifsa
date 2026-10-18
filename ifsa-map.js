/* IFSA University — carte des sites (Leaflet + fonds OpenStreetMap/CARTO/Esri, sans clé).
   IFSAMap.mount(el)  : carte publique (contact) — sites, itinéraire, plein écran, plan/satellite, thème clair/sombre.
   IFSAMap.picker(el) : sélecteur de position pour l'administrateur (clic, glisser, recherche d'adresse, lien Google Maps, position actuelle). */
(function () {
  "use strict";
  var LV = "1.9.4", BASE = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/" + LV + "/";
  var FALLBACK = [
    { id: "carrefour", name: "Carrefour", is_central: true, lat: 18.5416, lng: -72.3995, zoom: 16, address: "Route nationale 2, entre Côte-Plage 22 et 24" },
    { id: "port-de-paix", name: "Port-de-Paix", lat: 19.9392, lng: -72.8306, zoom: 16, address: "Boulevard Jovenel Moïse, #117" },
    { id: "miragoane", name: "Miragoâne", lat: 18.4437, lng: -73.0883, zoom: 16, address: "Charlon" },
    { id: "petit-goave", name: "Petit-Goâve", lat: 18.4313, lng: -72.8669, zoom: 16, address: "Avenue La Hatte, #154" }
  ];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var ok = function (n) { return typeof n === "number" && isFinite(n); };
  var lp = null;
  function load() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (lp) return lp;
    lp = new Promise(function (res, rej) {
      var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "leaflet.css"; document.head.appendChild(l);
      var s = document.createElement("script"); s.src = BASE + "leaflet.js"; s.onload = function () { res(window.L); }; s.onerror = function () { lp = null; rej(new Error("leaflet")); }; document.head.appendChild(s);
    });
    return lp;
  }
  var TILES = {
    plan: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", a: "© OpenStreetMap · © CARTO" },
    night: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", a: "© OpenStreetMap · © CARTO" },
    sat: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", a: "Imagery © Esri" }
  };
  var isDark = function () { return document.documentElement.dataset.theme === "dark"; };
  var ICON = {
    fs: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    fx: '<svg viewBox="0 0 24 24"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg>',
    layers: '<svg viewBox="0 0 24 24"><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/></svg>',
    loc: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>',
    fit: '<svg viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    go: '<svg viewBox="0 0 24 24"><path d="m3 11 19-9-9 19-2-8z"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
  };
  function btn(cls, title, svg) { var b = document.createElement("button"); b.type = "button"; b.className = "mp-b " + cls; b.title = title; b.setAttribute("aria-label", title); b.innerHTML = svg; return b; }
  function pinIcon(L, site) {
    return L.divIcon({ className: "mp-pin-w", iconSize: [44, 54], iconAnchor: [22, 52], popupAnchor: [0, -46],
      html: '<div class="mp-pin' + (site.is_central ? " c" : "") + '"><i></i><span>' + esc((site.name || "I").charAt(0)) + '</span></div><div class="mp-pulse"></div>' });
  }
  function popup(s) {
    var q = encodeURIComponent(s.lat + "," + s.lng), h = '<div class="mp-pop"><b>' + esc(s.name) + (s.is_central ? " <em>Siège</em>" : "") + "</b>";
    if (s.address) h += '<p><span class="mp-i">' + ICON.pin + "</span>" + esc(s.address) + "</p>";
    if (s.phone) h += '<p><span class="mp-i">' + ICON.phone + "</span>" + esc(s.phone) + "</p>";
    if (s.hours) h += '<p><span class="mp-i">' + ICON.clock + "</span>" + esc(s.hours) + "</p>";
    if (s.description) h += '<p class="d">' + esc(s.description) + "</p>";
    return h + '<div class="mp-pa"><a class="p" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + q + '"><span class="mp-i">' + ICON.go + '</span>Itinéraire</a><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=' + q + '">Google Maps</a></div></div>';
  }
  function baseLayer(L, map, st) {
    var cur = null;
    function apply() { var k = st.sat ? "sat" : isDark() ? "night" : "plan"; if (cur) map.removeLayer(cur); cur = L.tileLayer(TILES[k].url, { subdomains: "abcd", maxZoom: 19, attribution: TILES[k].a, crossOrigin: true }).addTo(map); cur.bringToBack(); }
    apply(); new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return apply;
  }

  /* ================= carte publique ================= */
  function mount(host, opts) {
    opts = opts || {}; host.classList.add("mp-host");
    host.innerHTML = '<div class="mp"><aside class="mp-side" aria-label="Nos sites"></aside><div class="mp-map"><div class="mp-cv" role="application" aria-label="Carte des sites IFSA University"></div><div class="mp-hint" hidden>Cliquez sur la carte pour la déplacer et zoomer</div><div class="mp-load"></div></div></div>';
    var wrap = host.querySelector(".mp"), side = host.querySelector(".mp-side"), cv = host.querySelector(".mp-cv"), mapBox = host.querySelector(".mp-map"), hint = host.querySelector(".mp-hint");
    var get = window.IFSA && IFSA.sites ? IFSA.sites().catch(function () { return FALLBACK; }) : Promise.resolve(FALLBACK);
    return Promise.all([load(), get]).then(function (r) {
      var L = r[0], rows = (r[1] && r[1].length ? r[1] : FALLBACK).map(function (s) { var f = FALLBACK.filter(function (x) { return x.id === s.id; })[0] || {}; var o = {}; for (var k in f) o[k] = f[k]; for (var k2 in s) if (s[k2] != null) o[k2] = s[k2]; return o; });
      var located = rows.filter(function (s) { return ok(+s.lat) && ok(+s.lng); }).map(function (s) { s.lat = +s.lat; s.lng = +s.lng; return s; });
      var touch = L.Browser.mobile, st = { sat: false };
      var map = L.map(cv, { zoomControl: false, scrollWheelZoom: false, dragging: !touch, tap: false, zoomSnap: .25, worldCopyJump: true, minZoom: 5 });
      var redraw = baseLayer(L, map, st);
      L.control.zoom({ position: "bottomright", zoomInTitle: "Zoom avant", zoomOutTitle: "Zoom arrière" }).addTo(map);
      var markers = {}, bounds = L.latLngBounds([]);
      located.forEach(function (s) { var m = L.marker([s.lat, s.lng], { icon: pinIcon(L, s), title: s.name, riseOnHover: true }).addTo(map); m.bindPopup(popup(s), { className: "mp-popw", maxWidth: 300, autoPanPadding: [30, 30] }); markers[s.id] = m; bounds.extend([s.lat, s.lng]); });
      function fitAll() { if (bounds.isValid()) map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 9, duration: .9 }); else map.setView([18.9, -72.7], 7); }
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 }); else map.setView([18.9, -72.7], 7);
      function focus(s) { var m = markers[s.id]; if (!m) return; map.flyTo([s.lat, s.lng], Math.max(+s.zoom || 16, 15), { duration: 1.1 }); setTimeout(function () { m.openPopup(); }, 1150); side.querySelectorAll("button.mp-s").forEach(function (b) { b.classList.toggle("on", b.dataset.id === s.id); }); }
      /* liste latérale */
      var h = '<h3>Nos sites</h3><button type="button" class="mp-all">' + ICON.fit + "Voir tous les sites</button>";
      rows.forEach(function (s) { var has = ok(+s.lat) && ok(+s.lng); h += '<button type="button" class="mp-s" data-id="' + esc(s.id) + '"' + (has ? "" : " disabled") + "><i>" + ICON.pin + "</i><span><b>" + esc(s.name) + (s.is_central ? " · siège" : "") + "</b><small>" + esc(has ? (s.address || "") : "Position bientôt disponible") + "</small></span></button>"; });
      side.innerHTML = h;
      side.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; if (b.classList.contains("mp-all")) { map.closePopup(); fitAll(); side.querySelectorAll(".mp-s.on").forEach(function (x) { x.classList.remove("on"); }); return; } var s = located.filter(function (x) { return x.id === b.dataset.id; })[0]; if (s) focus(s); });
      /* boutons */
      var bar = document.createElement("div"); bar.className = "mp-bar";
      var bFs = btn("", "Agrandir la carte", ICON.fs), bLay = btn("", "Vue satellite", ICON.layers), bLoc = btn("", "Ma position", ICON.loc), bFit = btn("", "Voir tous les sites", ICON.fit);
      [bFs, bLay, bLoc, bFit].forEach(function (b) { bar.appendChild(b); }); mapBox.appendChild(bar);
      var fs = false;
      function setFs(on) {
        fs = on; host.classList.toggle("mp-fs", on); document.documentElement.classList.toggle("mp-lock", on); bFs.innerHTML = on ? ICON.fx : ICON.fs; bFs.title = on ? "Réduire la carte" : "Agrandir la carte";
        if (touch) { on ? map.dragging.enable() : map.dragging.disable(); } on ? map.scrollWheelZoom.enable() : map.scrollWheelZoom.disable();
        setTimeout(function () { map.invalidateSize(); if (on) { fitAllNoAnim(); } }, 60);
        if (on && host.requestFullscreen && !touch) { try { host.requestFullscreen().catch(function () {}); } catch (e) {} } else if (!on && document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} }
      }
      function fitAllNoAnim() { if (!map.getPopup() || !map._popup) { if (bounds.isValid()) map.fitBounds(bounds, { padding: [70, 70], maxZoom: 10 }); } }
      bFs.addEventListener("click", function () { setFs(!fs); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && fs) setFs(false); });
      document.addEventListener("fullscreenchange", function () { if (!document.fullscreenElement && fs) setFs(false); });
      bLay.addEventListener("click", function () { st.sat = !st.sat; bLay.classList.toggle("on", st.sat); bLay.title = st.sat ? "Vue plan" : "Vue satellite"; redraw(); });
      bFit.addEventListener("click", function () { map.closePopup(); fitAll(); });
      var me = null;
      bLoc.addEventListener("click", function () {
        if (!navigator.geolocation) return; bLoc.classList.add("on");
        navigator.geolocation.getCurrentPosition(function (p) { var ll = [p.coords.latitude, p.coords.longitude]; if (me) map.removeLayer(me); me = L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1 }).addTo(map).bindTooltip("Vous êtes ici"); var b2 = L.latLngBounds(ll, ll); located.forEach(function (s) { b2.extend([s.lat, s.lng]); }); map.flyToBounds(b2, { padding: [70, 70], maxZoom: 12 }); bLoc.classList.remove("on"); }, function () { bLoc.classList.remove("on"); }, { enableHighAccuracy: true, timeout: 9000 });
      });
      /* molette seulement après un clic (la page continue de défiler normalement) */
      if (!touch) { map.on("click focus", function () { map.scrollWheelZoom.enable(); hint.hidden = true; }); cv.addEventListener("mouseleave", function () { if (!fs) map.scrollWheelZoom.disable(); }); cv.addEventListener("mouseenter", function () { if (!fs && !map.scrollWheelZoom.enabled()) { hint.hidden = false; setTimeout(function () { hint.hidden = true; }, 2200); } }); }
      mapBox.classList.add("ready"); setTimeout(function () { map.invalidateSize(); }, 200);
      if (opts.onReady) opts.onReady(map);
      return map;
    }).catch(function () {
      mapBox.innerHTML = '<div class="mp-err"><b>La carte n\'a pas pu se charger.</b><p>Vérifiez votre connexion, puis réessayez.</p><button type="button" class="btn btn-gold">Réessayer</button></div>';
      mapBox.querySelector("button").onclick = function () { mount(host, opts); };
    });
  }

  /* ================= sélecteur de position (administrateur) ================= */
  function parseGoogle(t) {
    t = String(t || "").trim(); var m;
    if ((m = t.match(/@(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/))) return [+m[1], +m[2]];
    if ((m = t.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/))) return [+m[1], +m[2]];
    if ((m = t.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+)(?:,|%2C)\s*(-?\d{1,3}\.\d+)/))) return [+m[1], +m[2]];
    if ((m = t.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:\.\d+)?)$/))) return [+m[1], +m[2]];
    return null;
  }
  function picker(host, o) {
    o = o || {}; host.classList.add("mp-host", "mp-pick");
    host.innerHTML = '<div class="mp-ps"><input type="search" class="mp-q" placeholder="Rechercher une adresse, un lieu… ou coller un lien Google Maps / des coordonnées" aria-label="Rechercher"><button type="button" class="mp-go">Chercher</button></div><div class="mp-map"><div class="mp-cv"></div><div class="mp-load"></div></div><p class="mp-pm" role="status"></p>';
    var cv = host.querySelector(".mp-cv"), q = host.querySelector(".mp-q"), msg = host.querySelector(".mp-pm"), mapBox = host.querySelector(".mp-map");
    var api = { map: null, marker: null, get: function () { var p = api.marker && api.marker.getLatLng(); return p ? { lat: +p.lat.toFixed(6), lng: +p.lng.toFixed(6), zoom: Math.round(api.map.getZoom()) } : null; }, set: null };
    return load().then(function (L) {
      var st = { sat: false }, has = ok(+o.lat) && ok(+o.lng), c = has ? [+o.lat, +o.lng] : [18.9, -72.7];
      var map = api.map = L.map(cv, { zoomControl: true, scrollWheelZoom: true, zoomSnap: .5 }).setView(c, has ? (o.zoom || 17) : 7);
      var redraw = baseLayer(L, map, st);
      var bSat = btn("", "Vue satellite", ICON.layers), bLoc = btn("", "Ma position actuelle", ICON.loc), bar = document.createElement("div"); bar.className = "mp-bar"; bar.appendChild(bSat); bar.appendChild(bLoc); mapBox.appendChild(bar);
      bSat.onclick = function () { st.sat = !st.sat; bSat.classList.toggle("on", st.sat); redraw(); };
      function place(lat, lng, zoom, fly) {
        var ll = [lat, lng];
        if (!api.marker) { api.marker = L.marker(ll, { draggable: true, icon: pinIcon(L, { name: o.name || "I", is_central: false }) }).addTo(map); api.marker.on("dragend", changed); }
        else api.marker.setLatLng(ll);
        if (fly !== false) map.flyTo(ll, zoom || Math.max(map.getZoom(), 17), { duration: .8 });
        changed();
      }
      function changed() { var v = api.get(); if (v) msg.textContent = "Position : " + v.lat + ", " + v.lng + " (zoom " + v.zoom + ") — glissez l'épingle pour l'ajuster."; if (o.onChange && v) o.onChange(v); }
      api.set = function (lat, lng, zoom) { if (ok(+lat) && ok(+lng)) place(+lat, +lng, zoom, true); };
      if (has) { api.marker = null; place(c[0], c[1], null, false); } else msg.textContent = "Aucune position enregistrée : cliquez sur la carte pour placer l'épingle.";
      map.on("click", function (e) { place(e.latlng.lat, e.latlng.lng, null, false); });
      map.on("zoomend", function () { if (api.marker) changed(); });
      bLoc.onclick = function () { if (!navigator.geolocation) { msg.textContent = "La localisation n'est pas disponible sur cet appareil."; return; } msg.textContent = "Localisation en cours…"; navigator.geolocation.getCurrentPosition(function (p) { place(p.coords.latitude, p.coords.longitude, 18, true); }, function () { msg.textContent = "Localisation refusée ou impossible."; }, { enableHighAccuracy: true, timeout: 10000 }); };
      function search() {
        var v = q.value.trim(); if (!v) return; var g = parseGoogle(v);
        if (g) { place(g[0], g[1], 18, true); return; }
        if (/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl)/i.test(v)) { msg.textContent = "Ce lien court ne contient pas la position. Ouvrez-le, puis copiez l'adresse complète de la page (avec @latitude,longitude), ou faites un clic droit sur le lieu dans Google Maps et copiez les coordonnées."; return; }
        msg.textContent = "Recherche…";
        fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=fr&q=" + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (j) { if (!j.length) { msg.textContent = "Adresse introuvable. Essayez avec le nom de la ville, ou placez l'épingle à la main."; return; } place(+j[0].lat, +j[0].lon, 18, true); }).catch(function () { msg.textContent = "Recherche impossible pour le moment : placez l'épingle à la main."; });
      }
      host.querySelector(".mp-go").onclick = search; q.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); search(); } });
      setTimeout(function () { map.invalidateSize(); }, 250);
      return api;
    }).catch(function () { mapBox.innerHTML = '<div class="mp-err"><b>La carte n\'a pas pu se charger.</b><p>Vous pouvez saisir la latitude et la longitude à la main.</p></div>'; return api; });
  }
  window.IFSAMap = { mount: mount, picker: picker, parse: parseGoogle, load: load };
})();
