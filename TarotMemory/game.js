(function () {
  'use strict';

  var CARDS = [
    { n:0, roman:"0", name:"The Fool", k:"beginnings · faith · the leap", s:'<path class="a" d="M17 19q-5-7 1-10l6 7 6-7q6 3 1 10z"/><circle class="a" cx="18" cy="9" r="1.5"/><circle class="a" cx="30" cy="9" r="1.5"/><circle class="g" cx="24" cy="24" r="6"/><circle class="f" cx="22" cy="23" r="1"/><circle class="f" cx="26" cy="23" r="1"/><path class="a" d="M21 26q3 2 6 0"/><path class="g" d="M17 32q7-4 14 0l3 6H14zM24 30v7"/>' },
    { n:1, roman:"I", name:"The Magician", k:"will · skill · manifestation", s:'<path class="a" d="M17 9c0-4 5-4 7 0 2-4 7-4 7 0s-5 4-7 0c-2 4-7 4-7 0z"/><path class="g" d="M9 29h30M12 32h24"/><path class="g" d="M14 28v-5q0-2 2-2t2 2v5M22 28V17h2l2 4v7M30 28v-6q0-2 2-2t2 2v6"/><path class="a" d="M15 21v-3M14 19h2M23 17v-4M21 15h4M32 20l-2-3M32 20l2-3"/><circle class="a" cx="24" cy="24" r="3"/><path class="a" d="M22 24h4M24 22v4"/>' },
    { n:2, roman:"II", name:"High Priestess", k:"intuition · mystery · the unseen", s:'<path class="g" d="M12 37V13h5M36 37V13h-5M10 37h28"/><path class="a" d="M11 13h7M30 13h7"/><path class="g" d="M16 18h16v15H16z"/><path class="a" d="M18 21q6-4 12 0v9q-6 4-12 0zM20 24h8M20 27h6"/><path class="g" d="M21 16q3-4 6 0"/><path class="a" d="M21 8q5-4 8 1-4-1-7 3-2-2-1-4z"/>' },
    { n:3, roman:"III", name:"The Empress", k:"abundance · nurture · growth", s:'<path class="a" d="M12 14l5 12h14l5-12-7 5-5-9-5 9z"/><path class="g" d="M16 26h16v4H16zM11 32q3-4 7 0 3-4 6 0 3-4 6 0 3-4 7 0v4H11zM14 36h20"/><circle class="a" cx="12" cy="14" r="1.5"/><circle class="a" cx="24" cy="10" r="1.5"/><circle class="a" cx="36" cy="14" r="1.5"/>' },
    { n:4, roman:"IV", name:"The Emperor", k:"structure · authority · order", s:'<path class="a" d="M13 28l2-14 5 6 4-10 4 10 5-6 2 14z"/><path class="g" d="M16 24h16M19 27h10"/><circle class="a" cx="15" cy="14" r="1.6"/><circle class="a" cx="24" cy="10" r="1.6"/><circle class="a" cx="33" cy="14" r="1.6"/><path class="g" d="M10 31q3-4 7 0 3-4 7 0 3-4 7 0 3-4 7 0v5H10zM13 36h22"/>' },
    { n:5, roman:"V", name:"The Hierophant", k:"tradition · doctrine · guidance", s:'<path class="g" d="M12 37V17h4M36 37V17h-4M10 37h28"/><path class="a" d="M12 17h4M36 17h-4"/><path class="a" d="M19 14l5-7 5 7-5 3z"/><circle class="g" cx="24" cy="17" r="3"/><path class="g" d="M18 23q6-5 12 0v12H18zM24 20v16"/><path class="a" d="M20 27h8M20 30h8"/><path class="g" d="M21 37h6"/>' },
    { n:6, roman:"VI", name:"The Lovers", k:"union · choice · harmony", s:'<path class="g" d="M14 13q10-8 20 0"/><circle class="a" cx="18" cy="18" r="3"/><circle class="a" cx="30" cy="18" r="3"/><path class="g" d="M12 35q1-10 6-11 5 1 6 11M24 35q1-10 6-11 5 1 6 11"/><path class="a" d="M24 30c-3-4-7-1-5 2l5 5 5-5c2-3-2-6-5-2z"/><path class="g" d="M10 36h28"/>' },
    { n:7, roman:"VII", name:"The Chariot", k:"momentum · willpower · victory", s:'<path class="a" d="M18 14q7-7 16 0M20 14h12"/><circle class="g" cx="25" cy="13" r="3"/><path class="a" d="M23 16l-4 5M27 16l4 5"/><path class="g" d="M12 21h18v11H10zM12 21l-5-5M7 16H3"/><circle class="g" cx="24" cy="34" r="7"/><path class="a" d="M24 27v14M17 34h14M19 29l10 10M29 29L19 39"/><path class="g" d="M30 25l8-4M30 28l8-1"/>' },
    { n:8, roman:"VIII", name:"Strength", k:"courage · patience · grace", s:'<path class="a" d="M14 15l4-5 6 3 6-3 4 5 3 9-5 10H16L11 24z"/><path class="g" d="M17 21q7-7 14 0v10q-7 6-14 0z"/><path class="a" d="M19 23q2-2 4 0M25 23q2-2 4 0"/><circle class="f" cx="21" cy="23" r="1"/><circle class="f" cx="27" cy="23" r="1"/><path class="g" d="M24 24v4M20 29q4 3 8 0M17 16l7-4 7 4"/><circle class="a" cx="24" cy="12" r="1.4"/>' },
    { n:9, roman:"IX", name:"The Hermit", k:"introspection · solitude · a light", s:'<path class="g" d="M36 7v31M33 38h6"/><path class="a" d="M14 22q0-13 10-17 10 4 10 17l-4 6H18z"/><circle class="g" cx="24" cy="20" r="4"/><path class="g" d="M18 27q6-4 12 0v10H18zM24 27v10"/><path class="a" d="M18 27l-5-3"/><path class="g" d="M8 22h7v10H8zM9 22q2-4 5 0M7 32h9"/><circle class="f" cx="11.5" cy="27" r="2.5"/><path class="a" d="M21 37h6"/>' },
    { n:10, roman:"X", name:"Wheel of Fortune", k:"cycles · fate · turning", s:'<circle class="g" cx="24" cy="24" r="18"/><circle class="a" cx="24" cy="24" r="14"/><path class="g" d="M24 6v12M24 30v12M6 24h12M30 24h12M11.3 11.3l8.5 8.5M28.2 28.2l8.5 8.5M36.7 11.3l-8.5 8.5M19.8 28.2l-8.5 8.5"/><circle class="g" cx="24" cy="24" r="5"/><circle class="f" cx="24" cy="24" r="2"/><path class="a" d="M24 3l3 5h-6zM45 24l-5 3v-6zM24 45l-3-5h6zM3 24l5-3v6z"/>' },
    { n:11, roman:"XI", name:"Justice", k:"truth · balance · accountability", s:'<path class="g" d="M24 8v29M17 37h14M20 12h8"/><path class="a" d="M12 12l24 7"/><path class="g" d="M12 12v8M36 19v8M12 20l-5 5M12 20l5 5M36 27l-5 5M36 27l5 5"/><path class="a" d="M5 25h14c0 5-3 7-7 7s-7-2-7-7zM29 32h14c0 5-3 7-7 7s-7-2-7-7z"/>' },
    { n:12, roman:"XII", name:"The Hanged Man", k:"surrender · pause · new vision", s:'<path class="g" d="M24 7v31M15 30h18"/><circle class="a" cx="24" cy="7" r="2"/>' },
    { n:13, roman:"XIII", name:"Death", k:"endings · transformation · rebirth", s:'<path class="g" d="M20 40C22 31 24 22 27 15"/><path class="g" d="M18 40h6"/><path class="a" d="M27 15C21 8 12 7 6 11c8-1 15 1 21 7z"/><path class="g" d="M21 30l5 1M20 34l5 1"/>' },
    { n:14, roman:"XIV", name:"Temperance", k:"blend · moderation · alchemy", s:'<circle class="g" cx="24" cy="10" r="3"/><path class="a" d="M20 17q-7-5-10 1 5 0 9 5M28 17q7-5 10 1-5 0-9 5"/><path class="g" d="M20 16h8l3 17H17zM14 23h6l-1 7h-4zM28 23h6l-1 7h-4z"/><path class="a" d="M19 24c2-3 4-3 5 0M29 24c-2-3-4-3-5 0M20 26c2-2 4-2 8 0"/><path class="g" d="M18 33h12M21 36h6"/>' },
    { n:15, roman:"XV", name:"The Devil", k:"bondage · shadow · temptation", s:'<circle class="g" cx="24" cy="24" r="18"/><path class="a" d="M24 42L10 10L43 30L5 30L38 10Z"/><circle class="f" cx="24" cy="24" r="2"/>' },
    { n:16, roman:"XVI", name:"The Tower", k:"upheaval · collapse · truth", s:'<path class="g" d="M9 40h30M15 40l2-25h14l2 25zM11.5 15V9h5v4h5V9h5v4h5V9h5v6z"/><path class="a" d="M19 20h3v6h-3zM26 20h3v6h-3z"/><path class="g" d="M21 40v-6c0-4 6-4 6 0v6z"/>' },
    { n:17, roman:"XVII", name:"The Star", k:"hope · healing · guidance", s:'<path class="a" d="M24 5l3 9 8-6-5 9 10 1-10 3 5 9-8-6-3 10-3-10-8 6 5-9-10-3 10-1-5-9 8 6z"/><circle class="f" cx="24" cy="19" r="2.5"/><path class="g" d="M12 31l-3 4M36 31l3 4M24 31v6M16 28l-2 2M32 28l2 2"/>' },
    { n:18, roman:"XVIII", name:"The Moon", k:"dreams · illusion · the deep", s:'<circle class="a" cx="24" cy="24" r="16" fill="rgba(179,84,63,0.22)"/><path class="g" d="M25 11a13 13 0 1 1 0 26a11 13 0 1 0 0-26z" fill="rgba(201,162,39,0.34)"/>' },
    { n:19, roman:"XIX", name:"The Sun", k:"vitality · success · clarity", s:'<circle class="a" cx="24" cy="22" r="8"/><circle class="f" cx="24" cy="22" r="3"/><path class="g" d="M24 4v7M24 33v7M6 22h7M35 22h7M11 9l5 5M33 35l-5-5M37 9l-5 5M15 35l5-5"/>' },
    { n:20, roman:"XX", name:"Judgement", k:"awakening · reckoning · rise", s:'<g transform="translate(24 24) rotate(25) scale(.95 .7) translate(-24 -24)"><path class="g" d="M6 24h6M12 22h17v4H12z"/><path class="a" d="M29 22c4 0 7-2 10-5l3-1v16l-3-1c-3-3-6-5-10-5z"/><path class="g" d="M18 22v-5M23 22v-5M28 22v-5M18 17h3M23 17h3M28 17h3"/></g>' },
    { n:21, roman:"XXI", name:"The World", k:"wholeness · completion · attainment", s:'<circle class="g" cx="24" cy="20" r="14"/><path class="g" d="M24 6c-4.8 4-7 8.7-7 14s2.2 10 7 14M24 6c4.8 4 7 8.7 7 14s-2.2 10-7 14"/><path class="g" d="M10 20h28M12 14.5c7 2.8 17 2.8 24 0M12 25.5c7-2.8 17-2.8 24 0"/><path class="g" d="M20 34v3M28 34v3M17 39h14"/>' }
  
  ];

  var DIFFS = {
    small: { pairs: 4, time: 60, levels: 5, label: "SMALL RITE" },
    medium: { pairs: 6, time: 75, levels: 7, label: "MEDIUM RITE" },
    large: { pairs: 8, time: 90, levels: 10, label: "LARGE RITE" }
  };

  var THEMES = {
    classic: { mark: "#mark-star", descriptor: "CLASSIC SEPIA // MEMORY PROTOCOL" },
    violet: { mark: "#mark-moon", descriptor: "VIOLET DUSK // MEMORY PROTOCOL" },
    rose: { mark: "#mark-moon-r", descriptor: "ROSEWOOD RITUAL // MEMORY PROTOCOL" }
  };

  var state = {
    theme: localStorage.getItem("tm.theme") || "classic",
    safe: localStorage.getItem("tm.safe") === "1",
    stars: Number(localStorage.getItem("tm.stars")) || 0,
    completed: Number(localStorage.getItem("tm.completed")) || 0,
    runs: loadRuns(),
    diff: localStorage.getItem("tm.diff") || "medium"
  };

  function loadRuns() {
    var r = { small: 0, medium: 0, large: 0 };
    try {
      var saved = JSON.parse(localStorage.getItem("tm.runs") || "{}");
      if (saved && typeof saved === "object") {
        ["small", "medium", "large"].forEach(function (k) { if (typeof saved[k] === "number") r[k] = saved[k]; });
      }
    } catch (e) {}
    return r;
  }

  var cards = [];
  var picked = [];
  var score = 0;
  var matched = 0;
  var seconds = 0;
  var totalTime = 0;
  var timerId = null;
  var locked = false;
  var dealing = true;
  var level = 1;
  var afterModal = null;
  var tools = { hint: 1, freeze: 1 };

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  function cfg() { return DIFFS[state.diff]; }

  function applyTheme() {
    document.body.classList.remove("theme-violet", "theme-rose");
    if (state.theme !== "classic") document.body.classList.add("theme-" + state.theme);
    var t = THEMES[state.theme];
    var mu = $("#themeIcon use"); if (mu) mu.setAttribute("href", t.mark);
    $("#themeDescriptor").textContent = t.descriptor;
    $("#patternBtn").classList.toggle("active", state.safe);
    $("#patternState").textContent = state.safe ? "ON" : "OFF";
    $("#patternText").textContent = state.safe ? "On · statuses use symbols and texture" : "Off · enable non-color cues";
    document.body.classList.toggle("pattern-safe", state.safe);
    $$(".theme").forEach(function (b) { b.classList.toggle("active", b.dataset.theme === state.theme); });
    $$(".diff").forEach(function (b) { b.classList.toggle("active", b.dataset.diff === state.diff); });
  }

  function save() {
    try {
      localStorage.setItem("tm.theme", state.theme);
      localStorage.setItem("tm.safe", state.safe ? "1" : "0");
      localStorage.setItem("tm.stars", String(state.stars));
      localStorage.setItem("tm.completed", String(state.completed));
      localStorage.setItem("tm.runs", JSON.stringify(state.runs));
      localStorage.setItem("tm.diff", state.diff);
    } catch (e) {}
    $("#totalStars").textContent = state.stars;
    $("#completed").textContent = state.completed;
    refreshRuns();
  }

  function refreshRuns() {
    $$(".diff [data-run]").forEach(function (el) {
      el.textContent = String(state.runs[el.dataset.run] || 0);
    });
  }

  function show(id) {
    $$(".screen").forEach(function (s) { s.classList.add("hidden"); });
    $(id).classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function sealFor(c) {
    if (!state.safe) return "";
    if (c.matched) return '<span class="seal">✓</span>';
    if (c.mismatch) return '<span class="seal mismark">✗</span>';
    return "";
  }

  function render() {
    var board = $("#board");
    board.innerHTML = "";
    board.className = "board " + state.diff + (dealing ? " dealing" : "");
    cards.forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "card" +
        ((c.flipped || c.matched) ? " flipped" : "") +
        (c.matched ? " matched" : "") +
        (c.mismatch ? " mismatch" : "") +
        (c.hint ? " hint" : "");
      b.setAttribute("aria-label", (c.flipped || c.matched) ? c.name : "Face-down arcana card");
      b.style.setProperty("--deal-delay", (i * 45) + "ms");
      b.innerHTML =
        '<span class="card-inner">' +
        '<span class="back"></span>' +
        '<span class="face">' + sealFor(c) +
        '<span class="numeral">' + c.roman + '</span>' +
        '<span class="sigil"><svg viewBox="0 0 48 48" aria-hidden="true">' + c.s + '</svg></span>' +
        '<span class="name">' + c.name + '</span>' +
        '<span class="kw">' + c.k + '</span>' +
        '</span>' +
        '</span>';
      b.addEventListener("click", function () { pick(i); });
      b.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); }
      });
      board.appendChild(b);
    });
    dealing = false;
  }

  function beginLevel() {
    clearInterval(timerId);
    var c = cfg();
    totalTime = c.time;
    seconds = c.time;
    score = 0; matched = 0;
    picked = []; locked = false;
    tools = { hint: 1, freeze: 1 };
    dealing = true;
    $("#score").textContent = "0 ✦";
    $("#hintCount").textContent = "1";
    $("#freezeCount").textContent = "1";
    $("#timer").textContent = formatTime(c.time);
    $("#progressBar").style.width = "0%";
    $("#diffLabel").textContent = c.label + " · LEVEL " + level + "/" + c.levels;

    var chosen = shuffle(CARDS.slice()).slice(0, c.pairs);
    var deck = [];
    chosen.forEach(function (card) { deck.push(card, card); });
    deck = shuffle(deck);
    cards = deck.map(function (card) {
      return { id: card.n, roman: card.roman, name: card.name, k: card.k, s: card.s, flipped: false, matched: false, mismatch: false, hint: false };
    });

    var board = $("#board");
    board.dataset.level = level;
    board.dataset.total = c.levels;

    show("#gameScreen");
    render();
    timerId = setInterval(function () {
      seconds--;
      $("#timer").textContent = formatTime(seconds);
      if (seconds <= 0) { clearInterval(timerId); end(false); }
    }, 1000);
  }

  function start() { level = 1; beginLevel(); }

  function nextLevel() { level++; beginLevel(); }

  function pick(i) {
    if (locked || cards[i].flipped || cards[i].matched || picked.length === 2) return;
    cards[i].flipped = true;
    picked.push(i);
    render();
    if (picked.length < 2) return;
    locked = true;
    var a = picked[0];
    var b = picked[1];
    setTimeout(function () {
      if (cards[a].id === cards[b].id) {
        cards[a].matched = cards[b].matched = true;
        matched++;
        score += 100;
        $("#score").textContent = score + " ✦";
        $("#progressBar").style.width = (matched / cfg().pairs) * 100 + "%";
        picked = [];
        locked = false;
        render();
        if (matched === cfg().pairs) {
          clearInterval(timerId);
          setTimeout(function () { end(true); }, 650);
        }
      } else {
        cards[a].mismatch = cards[b].mismatch = true;
        score = Math.max(0, score - 10);
        $("#score").textContent = score + " ✦";
        render();
        setTimeout(function () {
          cards[a].flipped = false;
          cards[b].flipped = false;
          cards[a].mismatch = false;
          cards[b].mismatch = false;
          picked = [];
          locked = false;
          render();
        }, 520);
      }
    }, 480);
  }

  function end(won) {
    clearInterval(timerId);
    var c = cfg();
    if (won) {
      var ratio = seconds / totalTime;
      var earned = ratio >= 0.5 ? 3 : (ratio >= 0.25 ? 2 : 1);
      state.stars += earned;
      state.completed++;
      if (level < c.levels) {
        save();
        showModal("Level " + level + " of " + c.levels + " cleared",
          "You sealed this board with " + formatTime(seconds) + " left on the water clock. +" + earned + " ★ earned. Onward to level " + (level + 1) + ".",
          "Next level", nextLevel);
      } else {
        state.runs[state.diff]++;
        save();
        showModal(c.label + " complete",
          "All " + c.levels + " levels sealed. The arcana honor you — +" + earned + " ★ on the final board. Runs finished in this mode: " + state.runs[state.diff] + ".",
          "Continue");
      }
    } else {
      showModal("Rite unfinished",
        "The water clock ran dry at level " + level + ". The run resets to level 1 — the arcana will wait.", "Try again", start);
    }
  }

  function showModal(title, text, action, after) {
    afterModal = after || null;
    $("#modalTitle").textContent = title;
    $("#modalText").textContent = text;
    $("#modalAction").textContent = action;
    $("#modal").classList.remove("hidden");
  }

  function closeModal() {
    afterModal = null;
    $("#modal").classList.add("hidden");
  }

  function useHint() {
    if (!tools.hint || locked) return;
    tools.hint = 0;
    $("#hintCount").textContent = "0";
    var open = cards.filter(function (c) { return !c.matched; });
    var pair = open.find(function (c) { return open.some(function (x) { return x !== c && x.id === c.id; }); });
    if (pair) {
      cards.forEach(function (c) { if (c.id === pair.id && !c.matched) c.hint = true; });
      render();
      setTimeout(function () {
        cards.forEach(function (c) { c.hint = false; });
        render();
      }, 1800);
    }
  }

  function freeze() {
    if (!tools.freeze) return;
    tools.freeze = 0;
    $("#freezeCount").textContent = "0";
    clearInterval(timerId);
    setTimeout(function () {
      if (seconds <= 0) return;
      timerId = setInterval(function () {
        seconds--;
        $("#timer").textContent = formatTime(seconds);
        if (seconds <= 0) { clearInterval(timerId); end(false); }
      }, 1000);
    }, 5000);
  }

  function help() {
    showModal("How to play", "Flip two sigil cards and find every matching pair before the water clock reaches zero. A Hint highlights one pair; the Freeze stays the water for five seconds. Pattern Safe Rite adds symbols and texture so no state depends on color alone.", "Got it");
  }

  function buildGallery() {
    var grid = $("#galleryGrid");
    grid.innerHTML = "";
    CARDS.forEach(function (c) {
      var item = document.createElement("div");
      item.className = "gallery-card";
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", c.name + ": " + c.k);
      item.innerHTML =
        '<div class="g-numeral">' + c.roman + '</div>' +
        '<div class="g-sigil"><svg viewBox="0 0 48 48" aria-hidden="true">' + c.s + '</svg></div>' +
        '<div class="g-name">' + c.name + '</div>' +
        '<span class="g-kw">' + c.k + '</span>';
      grid.appendChild(item);
    });
  }

  function openGallery() {
    buildGallery();
    $("#galleryModal").classList.remove("hidden");
    $("#galleryClose").focus();
  }

  function closeGallery() { $("#galleryModal").classList.add("hidden"); }

  $("#startBtn").addEventListener("click", start);
  $("#restartBtn").addEventListener("click", start);
  $("#backBtn").addEventListener("click", function () { clearInterval(timerId); show("#homeScreen"); });
  $("#homeBtn").addEventListener("click", function () { clearInterval(timerId); show("#homeScreen"); });
  $("#helpBtn").addEventListener("click", help);
  $("#helpCardBtn").addEventListener("click", help);
  $("#closeModal").addEventListener("click", closeModal);
  $("#modalAction").addEventListener("click", function () {
    var fn = afterModal;
    closeModal();
    if (fn) fn();
  });
  $("#galleryBtn").addEventListener("click", openGallery);
  $("#galleryClose").addEventListener("click", closeGallery);
  $("#hintBtn").addEventListener("click", useHint);
  $("#freezeBtn").addEventListener("click", freeze);
  $("#patternBtn").addEventListener("click", function () { state.safe = !state.safe; applyTheme(); save(); });
  $$(".theme").forEach(function (b) {
    b.addEventListener("click", function () { state.theme = b.dataset.theme; applyTheme(); save(); });
  });
  $$(".diff").forEach(function (b) {
    b.addEventListener("click", function () { state.diff = b.dataset.diff; applyTheme(); save(); });
  });

  $("#modal").addEventListener("click", function (e) { if (e.target === $("#modal")) closeModal(); });
  $("#galleryModal").addEventListener("click", function (e) { if (e.target === $("#galleryModal")) closeGallery(); });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!$("#galleryModal").classList.contains("hidden")) closeGallery();
    else if (!$("#modal").classList.contains("hidden")) closeModal();
  });

  applyTheme();
  save();
})();