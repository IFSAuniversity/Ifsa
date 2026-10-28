/* IFSA University — petit générateur de QR code (sans dépendance, hors ligne).
   Mode octets, correction d'erreur M, versions 1 à 10 (jusqu'à 213 octets), choix automatique du masque.
   Usage : IFSAQR.svg("https://…") → chaîne SVG (fond blanc, zone de silence incluse). */
(function () {
  "use strict";
  if (window.IFSAQR) return;

  /* ---- Corps de Galois GF(256), polynôme 0x11D ---- */
  var EXP = new Array(512), LOG = new Array(256), x = 1, i;
  for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11D; }
  for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  function gmul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function genPoly(n) {
    var p = [1], k, j;
    for (k = 0; k < n; k++) {
      var q = new Array(p.length + 1).fill(0);
      for (j = 0; j < p.length; j++) { q[j] ^= p[j]; q[j + 1] ^= gmul(p[j], EXP[k]); }
      p = q;
    }
    return p;
  }
  function rsRemainder(data, n) {
    var g = genPoly(n), r = new Array(n).fill(0), k, j;
    for (k = 0; k < data.length; k++) {
      var f = data[k] ^ r[0];
      r.shift(); r.push(0);
      if (f) for (j = 0; j < n; j++) r[j] ^= gmul(g[j + 1], f);
    }
    return r;
  }

  /* ---- Tables niveau M : [octets de correction par bloc, [[nb blocs, octets de données]…]] ---- */
  var EC = [null,
    [10, [[1, 16]]], [16, [[1, 28]]], [26, [[1, 44]]], [18, [[2, 32]]], [24, [[2, 43]]],
    [16, [[4, 27]]], [18, [[4, 31]]], [22, [[2, 38], [2, 39]]], [22, [[3, 36], [2, 37]]], [26, [[4, 43], [1, 44]]]];
  var ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  function dataCap(v) { return EC[v][1].reduce(function (s, b) { return s + b[0] * b[1]; }, 0); }

  function utf8(str) {
    var out = [], k, c;
    str = unescape(encodeURIComponent(str));
    for (k = 0; k < str.length; k++) { c = str.charCodeAt(k); out.push(c); }
    return out;
  }

  function encode(text) {
    var bytes = utf8(text), v, cap;
    for (v = 1; v <= 10; v++) { cap = dataCap(v); if (bytes.length + (v < 10 ? 2 : 3) <= cap) break; }
    if (v > 10) throw new Error("Texte trop long pour le QR code");
    var bits = [];
    function put(val, len) { for (var b = len - 1; b >= 0; b--) bits.push((val >>> b) & 1); }
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    var total = cap * 8;
    put(0, Math.min(4, total - bits.length));
    while (bits.length % 8) bits.push(0);
    var pad = [0xEC, 0x11], pi = 0;
    while (bits.length < total) { put(pad[pi++ % 2], 8); }
    var cw = [], k;
    for (k = 0; k < bits.length; k += 8) { var by = 0; for (var b = 0; b < 8; b++) by = (by << 1) | bits[k + b]; cw.push(by); }
    /* blocs + correction d'erreur, puis entrelacement */
    var ecn = EC[v][0], blocks = [], pos = 0;
    EC[v][1].forEach(function (g) { for (var n = 0; n < g[0]; n++) { var d = cw.slice(pos, pos + g[1]); pos += g[1]; blocks.push({ d: d, e: rsRemainder(d, ecn) }); } });
    var out = [], maxd = Math.max.apply(null, blocks.map(function (b) { return b.d.length; }));
    for (k = 0; k < maxd; k++) blocks.forEach(function (b) { if (k < b.d.length) out.push(b.d[k]); });
    for (k = 0; k < ecn; k++) blocks.forEach(function (b) { out.push(b.e[k]); });
    return { v: v, cw: out };
  }

  function bch(val, poly, len, deg) {
    var r = val << deg, k;
    for (k = len - 1; k >= deg; k--) if ((r >>> k) & 1) r ^= poly << (k - deg);
    return (val << deg) | r;
  }

  function build(text) {
    var e = encode(text), v = e.v, n = 17 + 4 * v, m = [], res = [], r, c;
    for (r = 0; r < n; r++) { m.push(new Array(n).fill(0)); res.push(new Array(n).fill(false)); }
    function set(r, c, val) { if (r < 0 || c < 0 || r >= n || c >= n) return; m[r][c] = val ? 1 : 0; res[r][c] = true; }
    function finder(r0, c0) {
      for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
        var inb = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        var on = inb && (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
        set(r0 + dr, c0 + dc, on);
      }
    }
    finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
    for (r = 8; r < n - 8; r++) { set(r, 6, r % 2 === 0); set(6, r, r % 2 === 0); }
    var al = ALIGN[v];
    al.forEach(function (ar) { al.forEach(function (ac) {
      if ((ar === 6 && ac === 6) || (ar === 6 && ac === al[al.length - 1]) || (ar === al[al.length - 1] && ac === 6)) return;
      for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++) set(ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }); });
    /* zones réservées : format + version + module sombre */
    for (r = 0; r < 9; r++) { res[r][8] = true; res[8][r] = true; }
    for (r = 0; r < 8; r++) { res[8][n - 1 - r] = true; res[n - 1 - r][8] = true; }
    set(n - 8, 8, true);
    if (v >= 7) {
      var vi = bch(v, 0x1F25, 18, 12), k;
      for (k = 0; k < 18; k++) { var bit = (vi >>> k) & 1, a = Math.floor(k / 3), b = k % 3 + n - 11; set(a, b, bit); set(b, a, bit); }
    }
    /* placement des données en zigzag */
    var bits = [], k2;
    e.cw.forEach(function (b) { for (var q = 7; q >= 0; q--) bits.push((b >>> q) & 1); });
    var bi = 0, up = true;
    for (c = n - 1; c > 0; c -= 2) {
      if (c === 6) c = 5;
      for (var t = 0; t < n; t++) {
        r = up ? n - 1 - t : t;
        for (var dc2 = 0; dc2 < 2; dc2++) {
          var cc = c - dc2;
          if (!res[r][cc]) { m[r][cc] = bi < bits.length ? bits[bi++] : 0; }
        }
      }
      up = !up;
    }
    /* masques */
    var MASK = [
      function (r, c) { return (r + c) % 2 === 0; }, function (r) { return r % 2 === 0; }, function (r, c) { return c % 3 === 0; },
      function (r, c) { return (r + c) % 3 === 0; }, function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
      function (r, c) { return (r * c) % 2 + (r * c) % 3 === 0; }, function (r, c) { return ((r * c) % 2 + (r * c) % 3) % 2 === 0; },
      function (r, c) { return ((r + c) % 2 + (r * c) % 3) % 2 === 0; }];
    function withMask(mk) {
      var o = m.map(function (row) { return row.slice(); }), rr, cc;
      for (rr = 0; rr < n; rr++) for (cc = 0; cc < n; cc++) if (!res[rr][cc] && MASK[mk](rr, cc)) o[rr][cc] ^= 1;
      /* information de format (niveau M = 00) */
      var f = bch((0 << 3) | mk, 0x537, 15, 10) ^ 0x5412, q;
      for (q = 0; q < 15; q++) {
        var bit = (f >>> q) & 1;
        if (q < 6) o[q][8] = bit; else if (q < 8) o[q + 1][8] = bit; else o[n - 15 + q][8] = bit;
        if (q < 8) o[8][n - 1 - q] = bit; else if (q < 9) o[8][15 - q] = bit; else o[8][14 - q] = bit;
      }
      o[n - 8][8] = 1;
      return o;
    }
    function penalty(o) {
      var p = 0, rr, cc, run, line, dir;
      for (dir = 0; dir < 2; dir++) for (rr = 0; rr < n; rr++) {
        run = 1;
        for (cc = 1; cc < n; cc++) {
          var a = dir ? o[cc][rr] : o[rr][cc], b = dir ? o[cc - 1][rr] : o[rr][cc - 1];
          if (a === b) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
      }
      for (rr = 0; rr < n - 1; rr++) for (cc = 0; cc < n - 1; cc++) { var s = o[rr][cc]; if (s === o[rr][cc + 1] && s === o[rr + 1][cc] && s === o[rr + 1][cc + 1]) p += 3; }
      var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
      for (dir = 0; dir < 2; dir++) for (rr = 0; rr < n; rr++) for (cc = 0; cc <= n - 11; cc++) {
        var m1 = true, m2 = true;
        for (var z = 0; z < 11; z++) { var val = dir ? o[cc + z][rr] : o[rr][cc + z]; if (val !== pat1[z]) m1 = false; if (val !== pat2[z]) m2 = false; }
        if (m1) p += 40; if (m2) p += 40;
      }
      var dark = 0; for (rr = 0; rr < n; rr++) for (cc = 0; cc < n; cc++) dark += o[rr][cc];
      p += Math.floor(Math.abs(dark * 100 / (n * n) - 50) / 5) * 10;
      return p;
    }
    var best = null, bp = 1e9, mk;
    for (mk = 0; mk < 8; mk++) { var o = withMask(mk), pn = penalty(o); if (pn < bp) { bp = pn; best = o; } }
    return best;
  }

  /* chaîne SVG : un seul <path> pour rester léger */
  function svg(text, opt) {
    opt = opt || {}; var q = opt.quiet == null ? 4 : opt.quiet, mtx = build(text), n = mtx.length, d = "", r, c, run;
    for (r = 0; r < n; r++) {
      c = 0;
      while (c < n) {
        if (mtx[r][c]) { run = 0; while (c + run < n && mtx[r][c + run]) run++; d += "M" + (c + q) + " " + (r + q) + "h" + run + "v1h-" + run + "z"; c += run; } else c++;
      }
    }
    var s = n + 2 * q;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + " " + s + '" shape-rendering="crispEdges" width="100%" height="100%"><rect width="' + s + '" height="' + s + '" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }
  window.IFSAQR = { svg: svg, matrix: build };
})();
