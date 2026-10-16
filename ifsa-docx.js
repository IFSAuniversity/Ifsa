/* IFSA University — vrai fichier Word (.docx) généré dans le navigateur, sans bibliothèque.
   Remplace l'ancien « .doc » qui n'était qu'une page web renommée et que Word refusait d'ouvrir. */
(function () {
  "use strict";
  var enc = new TextEncoder();
  var T = []; (function () { for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; } })();
  function crc(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function u16(n) { return [n & 255, (n >>> 8) & 255]; }
  function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
  /* archive ZIP « stockée » (sans compression) : valide pour Word */
  function zip(files) {
    var out = [], cd = [], off = 0, d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = enc.encode(f.data), c = crc(data);
      var h = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(time), u16(date), u32(c), u32(data.length), u32(data.length), u16(name.length), u16(0));
      out.push(new Uint8Array(h), name, data);
      cd.push([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(time), u16(date), u32(c), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off)), name);
      off += h.length + name.length + data.length;
    });
    var cdLen = 0, cdParts = [];
    for (var i = 0; i < cd.length; i += 2) { var a = new Uint8Array(cd[i]); cdParts.push(a, cd[i + 1]); cdLen += a.length + cd[i + 1].length; }
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdLen), u32(off), u16(0)));
    return new Blob(out.concat(cdParts, [end]), { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }
  function x(s) { return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function run(t, o) {
    o = o || {};
    var pr = (o.b ? "<w:b/>" : "") + (o.i ? "<w:i/>" : "") + (o.color ? '<w:color w:val="' + o.color + '"/>' : "") + (o.sz ? '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>' : "") + (o.caps ? "<w:caps/>" : "");
    return "<w:r>" + (pr ? "<w:rPr>" + pr + "</w:rPr>" : "") + '<w:t xml:space="preserve">' + x(t) + "</w:t></w:r>";
  }
  function para(runs, o) {
    o = o || {};
    var pr = (o.jc ? '<w:jc w:val="' + o.jc + '"/>' : "") + (o.after != null || o.before != null ? '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after == null ? 120 : o.after) + '"/>' : "") + (o.border ? '<w:pBdr><w:bottom w:val="single" w:sz="18" w:space="6" w:color="C9A24B"/></w:pBdr>' : "") + (o.left ? '<w:pBdr><w:left w:val="single" w:sz="24" w:space="8" w:color="C9A24B"/></w:pBdr>' : "");
    return "<w:p>" + (pr ? "<w:pPr>" + pr + "</w:pPr>" : "") + runs + "</w:p>";
  }
  /* o : {type:"announcement"|"letter", title, body, date, tag, audience, place, to, role, author, phone, email} */
  function build(o) {
    var D = o.date ? new Date(o.date) : new Date();
    var dt = D.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    var P = [];
    P.push(para(run("IFSA University", { b: 1, sz: 40, color: "0B1F4B" }), { after: 0 }));
    P.push(para(run("L'éducation aujourd'hui, le succès demain", { i: 1, sz: 20, color: "555555" }), { after: 0 }));
    P.push(para(run((o.place ? "Site de " + o.place + " · " : "") + "Tél. 33 53 24 15 · 43 28 99 59 · IFSAuniversity@gmail.com", { sz: 18, color: "555555" }), { after: 360, border: 1 }));
    if (o.type === "announcement") {
      P.push(para(run((o.tag || "Annonce") + (o.audience ? " · " + o.audience : ""), { b: 1, sz: 18, color: "8A6414", caps: 1 }), { after: 80 }));
      P.push(para(run(o.title, { b: 1, sz: 42, color: "0B1F4B" }), { after: 80 }));
      P.push(para(run((o.place ? o.place + ", le " : "Le ") + dt, { sz: 22, color: "555555" }), { after: 300 }));
    } else {
      P.push(para(run((o.place ? o.place + ", le " : "Le ") + dt, { sz: 22, color: "555555" }), { jc: "right", after: 300 }));
      if (o.to) { P.push(para(run("À l'attention de :", { sz: 22 }), { after: 0 })); P.push(para(run(o.to, { b: 1, sz: 24 }), { after: 240 })); }
      P.push(para(run("Objet : " + o.title, { b: 1, sz: 24 }), { after: 240, left: 1 }));
    }
    String(o.body || "").split(/\r?\n/).forEach(function (l) { P.push(para(run(l, { sz: 24 }), { jc: "both", after: 100 })); });
    if (o.type === "announcement") P.push(para(run("La direction" + (o.place ? " de " + o.place : ""), { b: 1, sz: 24 }), { jc: "right", before: 480 }));
    else { P.push(para(run(o.role || "", { sz: 24 }), { jc: "right", before: 480, after: 0 })); P.push(para(run(o.author || "", { b: 1, sz: 24 }), { jc: "right" })); }
    P.push(para(run("IFSA University — Document généré le " + new Date().toLocaleDateString("fr-FR"), { sz: 16, color: "777777" }), { jc: "center", before: 600 }));
    var NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + "><w:body>" + P.join("") + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles ' + NS + '><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:eastAsia="Georgia" w:cs="Georgia"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>';
    var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>';
    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>';
    var drels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
    var core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + x(o.title) + "</dc:title><dc:creator>IFSA University</dc:creator><dcterms:created xsi:type=\"dcterms:W3CDTF\">" + new Date().toISOString() + "</dcterms:created></cp:coreProperties>";
    return zip([{ name: "[Content_Types].xml", data: ct }, { name: "_rels/.rels", data: rels }, { name: "word/document.xml", data: doc }, { name: "word/styles.xml", data: styles }, { name: "word/_rels/document.xml.rels", data: drels }, { name: "docProps/core.xml", data: core }]);
  }
  function download(o, filename) {
    var b = build(o), a = document.createElement("a");
    var nm = filename || ("IFSA-" + (String(o.title || "document").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "document") + ".docx");
    a.href = URL.createObjectURL(b); a.download = nm; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  window.IFSADocx = { build: build, download: download };
})();
