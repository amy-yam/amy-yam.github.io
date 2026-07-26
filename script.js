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
   Animates the panel to its real height so any content
   (including image galleries) is fully revealed.
   ========================================================= */
function toggleCollapsible(btn) {
  var wrap = btn.parentElement;
  var panel = wrap.querySelector(".panel");
  var opening = !wrap.classList.contains("open");

  wrap.classList.toggle("open");
  if (opening) {
    panel.style.maxHeight = panel.scrollHeight + "px";
    // Recompute once images finish loading (their height may grow).
    panel.querySelectorAll("img").forEach(function (img) {
      if (!img.complete) {
        img.addEventListener("load", function () {
          if (wrap.classList.contains("open")) {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        }, { once: true });
      }
    });
  } else {
    panel.style.maxHeight = null;
  }
}

/* =========================================================
   SITE SEARCH
   Add pages/sections here to make them searchable.
   ========================================================= */
var SEARCH_INDEX = [
  { title: "About me",        page: "index.html",    keywords: "home about intro interests what i do" },
  { title: "Interests",       page: "index.html#interests", keywords: "interests curious topics" },
  { title: "Hobbies",         page: "personal.html", keywords: "personal hobbies free time" },
  { title: "Photography",     page: "personal.html#photography", keywords: "photos photography camera gallery pictures" },
  { title: "Fiber Arts",      page: "personal.html#fiber-arts",  keywords: "fiber arts knitting crochet weaving yarn" },
  { title: "Writing",         page: "personal.html#writing",     keywords: "writing essays poetry blog" },
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
   IMAGE GALLERY LIGHTBOX
   Works on any page that has a .gallery. Thumbnails may set
   data-full="<large image url>" for a hi-res lightbox image.
   ========================================================= */
function initGallery() {
  var imgs = Array.prototype.slice.call(document.querySelectorAll(".gallery img"));
  if (!imgs.length) return;

  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous">&#8249;</button>' +
    '<figure class="lb-figure"><img alt="" /><figcaption class="lb-caption"></figcaption></figure>' +
    '<button class="lb-btn lb-next" aria-label="Next">&#8250;</button>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector(".lb-caption");
  var idx = 0;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    lbImg.src = imgs[idx].getAttribute("data-full") || imgs[idx].src;
    var cap = imgs[idx].getAttribute("alt") || "";
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lbCap.style.display = cap ? "block" : "none";
  }
  function open(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  imgs.forEach(function (img, i) {
    img.addEventListener("click", function () { open(i); });
  });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-figure")) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  updateThemeIcon();
  initGallery();

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
