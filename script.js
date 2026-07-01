/* ============================================================
   NEUROSCAN — shared utilities
   Loaded on every page.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- mobile nav toggle ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
        var expanded = links.classList.contains("open");
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    }

    // mark active nav link
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var target = a.getAttribute("href");
      if (target === here) a.classList.add("active");
    });

    // year in footer
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });

  /* ---------- storage namespace ----------
     NS.session : the case currently in progress (patient + scan + result)
     NS.history : array of completed cases
  --------------------------------------------------------------*/
  var SESSION_KEY = "neuroscan_session_v1";
  var HISTORY_KEY = "neuroscan_history_v1";

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function setSession(patch) {
    var current = getSession();
    var next = Object.assign({}, current, patch);
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return next;
  }
  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function addHistoryEntry(entry) {
    var list = getHistory();
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  }
  function removeHistoryEntry(id) {
    var list = getHistory().filter(function (e) { return e.id !== id; });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }

  function genId(prefix) {
    var stamp = Date.now().toString(36).toUpperCase();
    var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return (prefix || "NS") + "-" + stamp + "-" + rand;
  }

  function fmtDate(d) {
    d = d ? new Date(d) : new Date();
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }) +
      " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  /* simple deterministic hash so a given "scan" always produces the
     same mock analysis figures within a session, instead of pure randomness */
  function hashString(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  window.NS = {
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    getHistory: getHistory,
    addHistoryEntry: addHistoryEntry,
    removeHistoryEntry: removeHistoryEntry,
    clearHistory: clearHistory,
    genId: genId,
    fmtDate: fmtDate,
    hashString: hashString
  };
})();
