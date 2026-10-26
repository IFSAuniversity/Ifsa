/* IFSA University — petites améliorations d'interface (v33). Aucune donnée, aucun appel réseau. */
(function () {
  "use strict";

  /* 1. Tableaux : chacun défile horizontalement sur petit écran, sans déborder de la page.
        Le tableau n'est ni copié ni modifié : il est simplement placé dans un conteneur. */
  function wrapTables(root) {
    var list = (root || document).querySelectorAll("table");
    for (var i = 0; i < list.length; i++) {
      var t = list[i], p = t.parentNode;
      if (!p || t.closest(".mx-tw,.ap-w,.tbl-wrap,.tw") || t.closest("[data-no-wrap]")) continue;
      var w = document.createElement("div");
      w.className = "mx-tw";
      w.setAttribute("tabindex", "0");
      w.setAttribute("role", "region");
      w.setAttribute("aria-label", "Tableau défilant");
      p.insertBefore(w, t);
      w.appendChild(t);
    }
  }

  /* 2. Retour visuel pendant l'envoi d'un formulaire (sans toucher au traitement existant). */
  function markBusy() {
    document.addEventListener("submit", function (e) {
      var f = e.target, b = f && f.querySelector && f.querySelector('button[type="submit"],input[type="submit"]');
      if (!b || e.defaultPrevented) return;
      b.setAttribute("aria-busy", "true");
      setTimeout(function () { b.removeAttribute("aria-busy"); }, 6000);
    }, false);
  }

  function init() {
    wrapTables();
    markBusy();
    if (!("MutationObserver" in window)) return;
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      (window.requestAnimationFrame || setTimeout)(function () { pending = false; wrapTables(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
