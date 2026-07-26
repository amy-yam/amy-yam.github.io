/* =========================================================
   THEME TOGGLE (persists via localStorage)
   ========================================================= */
(function initTheme() {
  var saved = localStorage.getItem("theme");
  var prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

function toggleTheme() {
  var cur = document.documentElement.getAttribute("data-theme");
  var next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon();
}

function updateThemeIcon() {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  var dark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = dark ? "☀️" : "🌙";
  btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
}

/* =========================================================
   COLLAPSIBLES
   ========================================================= */
function toggleCollapsible(btn) {
  btn.parentElement.classList.toggle("open");
}

/* =========================================================
   SITE SEARCH
   Add pages/sections here to make them searchable.
   ========================================================= */
var SEARCH_INDEX = [
  { title: "About me",        page: "index.html",    keywords: "home about intro interests what i do" },
  { title: "Interests",       page: "index.html#interests", keywords: "interests curious topics" },
  { title: "Hobbies",         page: "personal.html", keywords: "personal hobbies free time" },
  { title: "Reading",         page: "personal.html#reading", keywords: "books reading fiction" },
  { title: "Cooking",         page: "personal.html#cooking", keywords: "cooking food recipes baking" },
  { title: "Music",           page: "personal.html#music",   keywords: "music guitar piano listening" },
  { title: "Hiking",          page: "personal.html#hiking",  keywords: "hiking outdoors trails nature" },
  { title: "15-122 TA work",  page: "doing.html",    keywords: "what im doing teaching assistant ta 15122 cmu principles imperative computation" },
  { title: "Contact",         page: "contact.html",  keywords: "contact email github linkedin reach out" }
];

function runSearch(q) {
  var box = document.getElementById("search-results");
  if (!box) return;
  q = q.trim().toLowerCase();
  if (!q) { box.classList.remove("show"); box.innerHTML = ""; return; }

  var hits = SEARCH_INDEX.filter(function (item) {
    return (item.title + " " + item.keywords).toLowerCase().indexOf(q) !== -1;
  });

  if (!hits.length) {
    box.innerHTML = '<div class="sr-empty">No results for "' + escapeHtml(q) + '"</div>';
  } else {
    box.innerHTML = hits.map(function (h) {
      return '<a href="' + h.page + '">' +
        '<span class="sr-title">' + escapeHtml(h.title) + '</span>' +
        '<span class="sr-sub">' + h.page.split("#")[0] + '</span></a>';
    }).join("");
  }
  box.classList.add("show");
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  updateThemeIcon();

  var toggle = document.getElementById("theme-toggle");
  if (toggle) toggle.addEventListener("click", toggleTheme);

  var input = document.getElementById("site-search");
  if (input) {
    input.addEventListener("input", function () { runSearch(this.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var first = document.querySelector("#search-results a");
        if (first) window.location.href = first.getAttribute("href");
      }
    });
  }

  // Close search dropdown on outside click
  document.addEventListener("click", function (e) {
    var wrap = document.querySelector(".search-wrap");
    var box = document.getElementById("search-results");
    if (wrap && box && !wrap.contains(e.target)) box.classList.remove("show");
  });

  // Highlight current page in navbar
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
});
