/* IFSA University — progression des cours en ligne, sauvegardée par compte.
   Avant : la progression (leçons terminées, minute de reprise, dernière leçon) n'existait que dans le navigateur.
   Maintenant : le navigateur reste la source immédiate (le lecteur n'attend jamais le réseau) et une copie est
   gardée dans la table online_progress (supabase-update-10a.sql), propre à chaque compte (RLS).
   - Sans compte connecté, ou si la table n'existe pas encore : rien ne change, tout reste local.
   - Règle de fusion : la version la plus récente d'un cours l'emporte (cours par cours).
   - Appareil partagé : si un autre compte se connecte, ses propres données repartent de la base,
     la progression d'un autre étudiant n'est jamais envoyée sur son compte.
   Les notes personnelles de leçon restent locales. */
(function () {
  "use strict";
  if (window.IFSAProgress) return;
  var K = { done: "ifsa_done", pos: "ifsa_pos", last: "ifsa_last", lastl: "ifsa_lastl", mod: "ifsa_pmod", owner: "ifsa_powner" };
  var SYNC_MS = 15000, timers = {}, ctx = null;

  function jget(k) { try { var v = JSON.parse(localStorage.getItem(k) || "{}"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  function sget(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* idem */ } }

  /* client + identité, seulement si une session existe */
  function context() {
    if (ctx) return ctx;
    if (!window.IFSA || !IFSA.hasSession || !IFSA.hasSession()) return Promise.resolve(null);
    var p = IFSA.client().then(function (sb) {
      return sb.auth.getSession().then(function (r) {
        var u = r && r.data && r.data.session && r.data.session.user;
        return u ? { sb: sb, uid: u.id } : null;
      });
    }).catch(function () { return null; });
    p.then(function (c) { if (!c && ctx === p) ctx = null; });
    ctx = p; return p;
  }

  function posOf(pos, id) {
    var out = {}, pre = id + "-";
    Object.keys(pos).forEach(function (k) {
      if (k.indexOf(pre) !== 0) return;
      var i = +k.slice(pre.length), v = pos[k];
      if (isFinite(i) && i >= 0 && i < 500 && typeof v === "number" && v >= 0) out[i] = Math.floor(v);
    });
    return out;
  }
  function hasLocal(id, done, pos, last) { return (done[id] && done[id].length) || (last[id] > 0) || Object.keys(posOf(pos, id)).length > 0; }
  function rowOf(id, uid) {
    var done = jget(K.done), pos = jget(K.pos), last = jget(K.last), lastl = jget(K.lastl);
    var dn = (done[id] || []).filter(function (i) { return typeof i === "number" && i >= 0 && i < 500; });
    return { student_id: uid, course_id: id, done: dn.filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; }),
      pos: posOf(pos, id), last_at: last[id] ? new Date(last[id]).toISOString() : null,
      last_lesson: typeof lastl[id] === "number" && lastl[id] >= 0 && lastl[id] < 500 ? lastl[id] : null };
  }
  function push(id) {
    delete timers[id];
    return context().then(function (c) {
      if (!c || sget(K.owner) !== c.uid) return;
      return c.sb.from("online_progress").upsert(rowOf(id, c.uid), { onConflict: "student_id,course_id" }).then(function () { /* échec silencieux : la copie locale reste intacte */ });
    }).catch(function () { /* idem */ });
  }

  /* appelé par la salle de cours à chaque enregistrement de position / leçon terminée */
  function touch(id, lessonIdx) {
    if (!id) return;
    try {
      var mod = jget(K.mod); mod[id] = Date.now(); jset(K.mod, mod);
      if (typeof lessonIdx === "number") { var ll = jget(K.lastl); ll[id] = lessonIdx; jset(K.lastl, ll); }
    } catch (e) { /* ignoré */ }
    if (!timers[id] && window.IFSA && IFSA.hasSession && IFSA.hasSession()) timers[id] = setTimeout(function () { push(id); }, SYNC_MS);
  }
  function flush() { Object.keys(timers).forEach(function (id) { clearTimeout(timers[id]); push(id); }); }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });
  window.addEventListener("pagehide", flush);

  /* fusionne la copie du compte dans le navigateur ; renvoie true si quelque chose a changé localement */
  function pull() {
    return context().then(function (c) {
      if (!c) return false;
      return c.sb.from("online_progress").select("*").then(function (r) {
        if (r.error || !Array.isArray(r.data)) return false;   // table absente ou refus : on reste en local
        var changed = false, owner = sget(K.owner);
        var done = jget(K.done), pos = jget(K.pos), last = jget(K.last), lastl = jget(K.lastl), mod = jget(K.mod);
        if (owner && owner !== c.uid) { done = {}; pos = {}; last = {}; lastl = {}; mod = {}; changed = true; }   // autre compte sur cet appareil
        sset(K.owner, c.uid);
        var seen = {}, up = [];
        r.data.forEach(function (row) {
          var id = row.course_id; seen[id] = 1;
          var st = Date.parse(row.updated_at) || 0, lt = mod[id] || last[id] || 0;
          if (st > lt) {
            done[id] = (row.done || []).slice();
            Object.keys(pos).forEach(function (k) { if (k.indexOf(id + "-") === 0) delete pos[k]; });
            Object.keys(row.pos || {}).forEach(function (i) { pos[id + "-" + i] = row.pos[i]; });
            if (row.last_at) last[id] = Date.parse(row.last_at) || last[id];
            if (row.last_lesson != null) lastl[id] = row.last_lesson;
            mod[id] = st; changed = true;
          } else if (lt > st) up.push(id);
        });
        var ids = {}; [done, last].forEach(function (o) { Object.keys(o).forEach(function (k) { ids[k] = 1; }); });
        Object.keys(pos).forEach(function (k) { var j = k.lastIndexOf("-"); if (j > 0) ids[k.slice(0, j)] = 1; });
        Object.keys(ids).forEach(function (id) { if (!seen[id] && hasLocal(id, done, pos, last) && up.indexOf(id) < 0) up.push(id); });
        if (changed) { jset(K.done, done); jset(K.pos, pos); jset(K.last, last); jset(K.lastl, lastl); jset(K.mod, mod); }
        /* ce que cet appareil a de plus récent (ou que le compte n'a pas encore) est envoyé, cours par cours */
        return up.slice(0, 30).reduce(function (p, id) { return p.then(function () { return push(id); }); }, Promise.resolve()).then(function () { return changed; });
      });
    }).catch(function () { return false; });
  }

  window.IFSAProgress = { pull: pull, touch: touch, flush: flush, lastLesson: function (id) { var v = jget(K.lastl)[id]; return typeof v === "number" ? v : null; } };
})();
