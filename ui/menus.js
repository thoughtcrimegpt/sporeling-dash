/* Native menu layer for Sporeling Dash. The game owns state; this layer only
 * presents it and reports intentional menu actions back to the host. */
(function () {
  "use strict";

  function createSporelingMenus(options) {
    options = options || {};
    var action = typeof options.action === "function" ? options.action : function () {};
    var root = document.createElement("div");
    root.className = "sporeling-menus";
    root.hidden = true;
    document.body.appendChild(root);
    var state = {}, lastSignature = "", panel = "", modal = null, modalIndex = 0, opener = null, modalAy = 0, modalAx = 0;
    var escape = function (value) { return String(value == null ? "" : value).replace(/[&<>\"']/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"})[c]; }); };
    var text = function (value) { return escape(value); };
    var button = function (id, label, extra, description) {
      return '<button type="button" class="sd-button ' + (extra || "") + '" data-action="' + escape(id) + '" aria-label="' + text(description || label) + '">' + label + '</button>';
    };
    var valueLabel = function (value) { return text(value || "Not set"); };
    function heading(title, kicker) {
      return '<div class="sd-topline"><span class="sd-kicker">' + text(kicker || "SPORELING DASH") + '</span>' +
        button("back", "Back", "sd-back", "Return to the previous menu") + '</div><h1>' + text(title) + '</h1>';
    }
    function optionsSection() {
      var v = state;
      var secondary = ["board", "reviews", "notes", "daily", "reach", "devlevel", "devhealth"].indexOf(v.titleSelected) >= 0;
      return '<details class="sd-secondary"' + (secondary ? ' open' : '') + '><summary>Extras &amp; challenges</summary><div class="sd-secondary-grid">' +
        button("board", "Leaderboards", "sd-secondary-button") +
        button("reviews", "Player reviews", "sd-secondary-button") +
        button("notes", "Patch notes", "sd-secondary-button") +
        button("daily", v.dailyUnlocked ? "The Pale Root" : "The Pale Root · Locked", "sd-secondary-button" + (v.dailyUnlocked ? "" : " sd-locked"), v.dailyUnlocked ? "Start The Pale Root" : "Beat the game to unlock The Pale Root") +
        button("reach", v.reachUnlocked ? "The Reach" : "The Reach · Locked", "sd-secondary-button" + (v.reachUnlocked ? "" : " sd-locked"), v.reachUnlocked ? "Start The Reach" : "Unlock The Reach by clearing the Pale Root") +
        (v.titleIds && v.titleIds.indexOf("practice") >= 0 ? button("practice", "Practice: " + valueLabel(v.practiceName || "Full run"), "sd-secondary-button") : "") +
        (v.dev ? '<div class="sd-dev">Developer tools</div>' + button("devlevel", "Test chamber: " + valueLabel(v.devLevelLabel), "sd-secondary-button") + button("devhealth", "Damage test: " + (v.devDamage ? "on" : "off"), "sd-secondary-button") : "") +
        '</div></details>';
    }
    function title() {
      var v = state, timed = v.runMode === "speedrun";
      var ids = Array.isArray(v.titleIds) ? v.titleIds : [];
      var adventure = v.runMode !== "speedrun";
      var has = function (id) { return !ids.length || ids.indexOf(id) >= 0; };
      return '<section class="sd-card sd-title-card">' +
        '<div class="sd-title-lockup"><span class="sd-eyebrow">A tiny journey beneath the roots</span><div class="sd-brand" aria-label="Sporeling Dash"><span class="sd-brand-main">SPORELING</span><span class="sd-brand-accent">DASH</span></div><span class="sd-title-rule" aria-hidden="true"></span></div><p class="sd-purpose">Air-dash to grow a temporary mushroom platform, then find your way through the woodland.</p>' +
        '<div class="sd-segmented" role="group" aria-label="Run mode">' + button("mode-adventure", "Adventure", timed ? "" : "is-selected") + button("mode-speedrun", "Timed run", timed ? "is-selected" : "") + '</div><p class="sd-mode-copy">' + (adventure ? "Explore the story at your pace, with checkpoints and conversations." : "Race the woodland against the clock, with comparable leaderboard times.") + '</p>' +
        (adventure && has("difficulty") ? '<div class="sd-choice-row"><span>Difficulty</span>' + button("difficulty", valueLabel(v.difficulty || "Normal") + "  ›", "sd-choice") + '</div>' : '') +
        (adventure && has("levelselect") ? '<div class="sd-choice-row"><span>Starting chamber</span>' + button("levelselect", valueLabel(v.levelName || "The Hollow"), "sd-choice") + '</div>' : '') +
        (!adventure && has("ghost") ? '<div class="sd-choice-row"><span>Ghost racing</span>' + button("ghost", valueLabel(v.ghost || "Off"), "sd-choice") + '</div>' : '') +
        '<div class="sd-primary">' + button("start", timed ? "Start timed run" : "Play adventure", "sd-button-primary") + '</div>' +
        '<div class="sd-title-tools">' + button("help", "Controls & help", "sd-button-secondary", "Open controls help") + button("settings", "Settings", "sd-button-secondary", "Open settings") + (v.fullscreenAvailable ? button("fullscreen", v.fullscreen ? "Exit full screen" : "Full screen", "sd-button-secondary") : "") + '</div>' +
        optionsSection() +
        '<p class="sd-hint">' + (v.touch ? "Tap an option. Your adventure starts with Play." : "Right mouse: jump · Left mouse: aim & dash · WASD / arrows: move") + '</p>' + (v.fullscreenMessage ? '<p class="sd-hint">' + text(v.fullscreenMessage) + '</p>' : '') +
        '</section>';
    }
    function pause() {
      var v = state;
      return '<section class="sd-card sd-pause-card">' + heading("Paused", v.levelTitle || "Current chamber") +
        '<p class="sd-status">Health <strong data-health>' + text(v.health) + ' / ' + text(v.maxHealth) + '</strong></p>' +
        '<div class="sd-stack">' + button("resume", "Resume", "sd-button-primary") + button("restart", "Restart chamber", "sd-button-secondary") +
        '<button type="button" class="sd-button sd-button-secondary" data-local="settings">Settings</button>' +
        '<button type="button" class="sd-button sd-button-secondary" data-local="help">Controls & help</button>' + (v.fullscreenAvailable ? button("fullscreen", v.fullscreen ? "Exit full screen" : "Full screen", "sd-button-secondary") : "") +
        button("titlescr", "Title screen", "sd-button-secondary") + (v.pauseIds && v.pauseIds.indexOf("practice") >= 0 ? button("practice", "Practice: " + valueLabel(v.practiceName || "Current chamber"), "sd-button-secondary") : "") +
        (v.pauseIds && v.pauseIds.indexOf("devlevel") >= 0 ? button("devlevel", "Test chamber: " + valueLabel(v.devLevelLabel), "sd-button-secondary") : "") +
        (v.pauseIds && v.pauseIds.indexOf("devhealth") >= 0 ? button("devhealth", "Damage test: " + (v.devDamage ? "on" : "off"), "sd-button-secondary") : "") +
        '<button type="button" class="sd-button sd-button-secondary" data-local="newgame">Restart from beginning</button></div>' +
        '<p class="sd-hint">Choose an action, or press Pause to return to the game.</p>' + (v.fullscreenMessage ? '<p class="sd-hint">' + text(v.fullscreenMessage) + '</p>' : '') + '</section>';
    }
    function notes() {
      var rows = Array.isArray(state.notes) ? state.notes : [];
      return '<section class="sd-card sd-reader">' + heading("Patch notes", "THE CAVE REMEMBERS") + '<div class="sd-scroll">' + rows.map(function (n) {
        return '<article class="sd-note"><h2>' + text(n.v) + '</h2><time>' + text(n.d) + '</time><ul>' + (n.lines || []).map(function (line) { return '<li>' + text(line) + '</li>'; }).join("") + '</ul></article>';
      }).join("") + '</div></section>';
    }
    function reviews() {
      var rows = Array.isArray(state.reviews) ? state.reviews : [];
      return '<section class="sd-card sd-reader"><div class="sd-topline"><span class="sd-kicker">SPORELING DASH</span>' + button("back", "Back", "sd-back") + '</div><h1>Player reviews</h1><div class="sd-scroll sd-reviews">' + rows.map(function (r) {
        var handle = String(r.handle || "");
        var safe = /^@[a-z0-9_]+$/i.test(handle);
        return '<blockquote><p>“' + text(r.quote || r.text || "") + '”</p>' + (safe ? '<a href="https://x.com/' + encodeURIComponent(handle.slice(1)) + '" target="_blank" rel="noopener noreferrer">' + text(handle) + '</a>' : '<cite>' + text(handle) + '</cite>') + '</blockquote>';
      }).join("") + '</div></section>';
    }
    function board() {
      var entries = Array.isArray(state.boardEntries) ? state.boardEntries : [];
      var tabs = Array.isArray(state.boardTabs) ? state.boardTabs : [{id:"any",label:"Any%"},{id:"full",label:"100%"},{id:"daily",label:"Pale Root"},{id:"reach",label:"Reach"}];
      return '<section class="sd-card sd-reader"><div class="sd-topline"><span class="sd-kicker">SPORELING DASH</span>' + button("back", "Back", "sd-back") + '</div><h1>Leaderboards</h1><div class="sd-tabs" role="tablist">' + tabs.map(function (t) { var id = typeof t === "string" ? t : t.id, label = typeof t === "string" ? t : (t.label || t.id); return button("board-tab", label, "sd-tab" + (id === state.boardTab ? " is-selected" : ""), "Show " + label + " leaderboard").replace('data-action="board-tab"', 'data-action="board-tab" data-value="' + escape(id) + '"'); }).join("") + '</div><div class="sd-board-list">' + (state.boardLoading ? '<p class="sd-empty">Loading runs…</p>' : entries.length ? entries.map(function (e, i) { var name = String(e.name || e.player || "Anonymous"), profile = /^@[a-z0-9_]+$/i.test(name) ? '<a class="sd-profile" href="https://x.com/' + encodeURIComponent(name.slice(1)) + '" target="_blank" rel="noopener noreferrer">' + text(name) + '</a>' : text(name); return '<div class="sd-board-row"><b>' + (i + 1) + '</b><span>' + profile + (e.hasGhost ? ' ' + button("race", "Race", "sd-race").replace('data-action="race"', 'data-action="race" data-value="' + escape(e.id || name) + '"') : '') + '</span><strong>' + text(e.time || (e.time_ms != null ? (Math.round(e.time_ms / 100) / 10) + "s" : "—")) + '</strong></div>'; }).join("") : '<p class="sd-empty">No runs recorded yet.</p>') + '</div></section>';
    }
    function localPanel(kind) {
      if (kind === "help") { var lines = state.touch ? [['Move','Drag Move left or right'],['Jump','Tap Jump, release and tap again to flutter (Adventure only)'],['Dash','Drag Dash toward your destination, then release. Tap to use your movement direction.'],['Slam','Tap Slam in air (unlocked in Underfield)'],['Burst','Burst lights up when charged (Adventure only)']] : state.gamepad ? [['Move','Left stick or D-pad'],['Jump','A, flutter in Adventure only'],['Dash','X or RB'],['Slam','Down + Dash'],['Burst','Y when fully charged (Adventure only)'],['Fullscreen','F']] : [['Move','A / D or Left / Right'],['Jump','Right mouse (hold for height or glide). Space / Z / K also work.'],['Dash','Aim the pointer and left-click. Keyboard: aim with WASD or arrows, then Shift / J.'],['Slam','Down + Dash'],['Burst','Q when fully charged (Adventure only)'],['Music','M'],['Fullscreen','F']]; return '<div class="sd-modal" role="dialog" aria-modal="true" aria-labelledby="sd-modal-title"><div class="sd-modal-card">' + heading("Controls", "HOW TO MOVE").replace('<h1>Controls</h1>','<h1 id="sd-modal-title">Controls</h1>') + '<div class="sd-help-grid">' + lines.map(function (p) { return '<p><b>' + text(p[0]) + '</b><span>' + text(p[1]) + '</span></p>'; }).join("") + '</div><p class="sd-hint">' + (state.touch ? "Touch controls stay visible while you play. Full screen is in the pause menu when supported." : "Fluttering and Burst are Adventure-only abilities. Press F for fullscreen." ) + '</p>' + button("close", "Got it", "sd-button-primary") + '</div></div>'; }
      if (kind === "settings") return '<div class="sd-modal" role="dialog" aria-modal="true" aria-labelledby="sd-modal-title"><div class="sd-modal-card">' + heading("Settings", "MAKE THE WOODLAND YOURS").replace('<h1>Settings</h1>','<h1 id="sd-modal-title">Settings</h1>') + '<div class="sd-stack">' + button("reducedmotion", "Reduced motion: " + (state.reducedMotion ? "On" : "Off"), "sd-button-secondary") + button("leftHanded", "Mirrored touch controls: " + (state.leftHanded ? "On" : "Off"), "sd-button-secondary") + button("music", "Music: " + (state.musicOn === false ? "Off" : "On"), "sd-button-secondary") + '</div>' + button("close", "Done", "sd-button-primary") + '</div></div>';
      if (kind === "newgame") return '<div class="sd-modal" role="dialog" aria-modal="true" aria-labelledby="sd-modal-title"><div class="sd-modal-card"><h1 id="sd-modal-title">Restart from beginning?</h1><p>This will leave the current run and return to the first chamber.</p><div class="sd-modal-actions">' + button("cancel", "Keep playing", "sd-button-secondary") + button("newgame-confirm", "Restart", "sd-button-danger") + '</div></div></div>';
      return "";
    }
    function render() {
      var active = document.activeElement && document.activeElement.closest ? document.activeElement.closest("[data-action],[data-local]") : null;
      var activeKey = active && (active.getAttribute("data-action") || active.getAttribute("data-local"));
      var detailsOpen = root.querySelector(".sd-secondary") && root.querySelector(".sd-secondary").open;
      var mode = state.mode || "hidden";
      root.hidden = ["title", "pause", "notes", "reviews", "board"].indexOf(mode) < 0;
      root.className = "sporeling-menus mode-" + mode;
      if (mode === "title") panel = title(); else if (mode === "pause") panel = pause(); else if (mode === "notes") panel = notes(); else if (mode === "reviews") panel = reviews(); else if (mode === "board") panel = board(); else panel = "";
      root.innerHTML = panel + (modal ? localPanel(modal) : "");
      bind();
      var base = root.querySelector(".sd-card");
      if (base) base.inert = !!modal;
      if (modal) {
        var choices = Array.prototype.slice.call(root.querySelectorAll(".sd-modal button"));
        var same = activeKey && root.querySelector('.sd-modal [data-action="' + activeKey + '"]');
        if (same) modalIndex = choices.indexOf(same);
        modalIndex = Math.max(0, Math.min(modalIndex, choices.length - 1));
        if (choices[modalIndex]) choices[modalIndex].focus({ preventScroll: true });
      }
      var details = root.querySelector(".sd-secondary");
      if (details && detailsOpen) details.open = true;
      var selectedId = state.mode === "title" ? state.titleSelected : state.mode === "pause" ? state.pauseSelected : null;
      if (selectedId === "controls") selectedId = "help";
      if (selectedId === "mode") selectedId = state.runMode === "speedrun" ? "mode-speedrun" : "mode-adventure";
      if (selectedId) { var selected = root.querySelector('[data-action="' + escape(selectedId) + '"],[data-local="' + escape(selectedId) + '"]'); if (selected) selected.classList.add("is-focused"); }
      var health = root.querySelector("[data-health]");
      if (health) health.textContent = (state.health == null ? "?" : state.health) + " / " + (state.maxHealth == null ? "?" : state.maxHealth);
      if (activeKey && !modal) {
        var restore = root.querySelector('[data-action="' + activeKey + '"],[data-local="' + activeKey + '"]');
        if (restore) restore.focus({ preventScroll: true });
      }
      if (!modal && opener) {
        var openerKey = opener.getAttribute && (opener.getAttribute("data-action") || opener.getAttribute("data-local"));
        var openerButton = openerKey && root.querySelector('[data-action="' + openerKey + '"],[data-local="' + openerKey + '"]');
        if (openerButton) openerButton.focus({ preventScroll: true });
        opener = null;
      }
    }
    function dispatch(id, value) { action(id, value); }
    function bind() {
      root.querySelectorAll("[data-action]").forEach(function (el) { el.addEventListener("click", function (ev) { ev.stopPropagation(); var id = el.getAttribute("data-action"), value = el.getAttribute("data-value"); if (id === "back") { if (modal) modal = null; else dispatch("back"); } else if (id === "close" || id === "cancel") modal = null; else if (id === "help" || id === "settings") { opener = document.activeElement; modal = id; modalIndex = 0; modalAy = 0; } else if (id === "newgame-confirm") { modal = null; dispatch("newgame"); } else if (id === "board-tab") dispatch("board-tab", value); else dispatch(id, value); render(); }); });
      root.querySelectorAll("[data-local]").forEach(function (el) { el.addEventListener("click", function (ev) { ev.stopPropagation(); opener = el; modalIndex = 0; modalAy = 0; modal = el.getAttribute("data-local"); render(); }); });
      root.querySelectorAll(".sd-modal button").forEach(function (el, index) { el.addEventListener("focus", function () { modalIndex = index; }); });
      root.querySelectorAll("button").forEach(function (el) { el.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") ev.stopPropagation(); if (ev.key === "Tab" && modal) { var bs = Array.prototype.slice.call(root.querySelectorAll(".sd-modal button")), i = bs.indexOf(document.activeElement); if (i >= 0) { ev.preventDefault(); bs[(i + (ev.shiftKey ? -1 : 1) + bs.length) % bs.length].focus(); } } }); });
    }
    function sync(next) { next = next || {}; var old = state; state = next;
      var structural = { mode: next.mode, titleSelected: next.titleSelected, pauseSelected: next.pauseSelected,
        runMode: next.runMode, difficulty: next.difficulty, levelName: next.levelName, ghost: next.ghost,
        levelTitle: next.levelTitle, reducedMotion: next.reducedMotion, leftHanded: next.leftHanded,
        musicOn: next.musicOn, dailyUnlocked: next.dailyUnlocked, reachUnlocked: next.reachUnlocked,
        dev: next.dev, devLevelLabel: next.devLevelLabel, devDamage: next.devDamage,
        notes: next.notes, reviews: next.reviews, boardTabs: next.boardTabs, boardEntries: next.boardEntries, boardTab: next.boardTab,
        boardLoading: next.boardLoading, touch: next.touch, gamepad: next.gamepad, titleIds: next.titleIds, pauseIds: next.pauseIds, practiceName: next.practiceName,
        fullscreenAvailable: next.fullscreenAvailable, fullscreen: next.fullscreen, fullscreenMessage: next.fullscreenMessage };
      structural.modal = modal;
      var sig = JSON.stringify(structural); if (sig !== lastSignature || old.mode !== next.mode) { lastSignature = sig; render(); }
      var health = root.querySelector("[data-health]");
      if (health) health.textContent = (next.health == null ? "?" : next.health) + " / " + (next.maxHealth == null ? "?" : next.maxHealth);
      return !root.hidden;
    }
    function handleInput(inp) {
      if (!modal) return false;
      if (inp && inp.domHandled) return true;
      var buttons = Array.prototype.slice.call(root.querySelectorAll(".sd-modal button"));
      if (inp && inp.pauseEdge) { modal = null; render(); return true; }
      var ay = Number(inp && inp.ay) || 0, ax = Number(inp && inp.ax) || 0;
      var ayEdge = inp && inp.ayEdge ? inp.ayEdge : (Math.abs(ay) > 0.55 && Math.abs(modalAy) <= 0.55 ? ay : 0);
      modalAy = ay; modalAx = ax;
      if (ayEdge && buttons.length) { modalIndex = (modalIndex + (ayEdge > 0 ? 1 : -1) + buttons.length) % buttons.length; buttons[modalIndex].focus(); return true; }
      if (inp && (inp.startEdge || inp.jumpEdge || inp.confirm) && buttons.length) { buttons[modalIndex].click(); return true; }
      if (inp && (inp.ax || inp.ay)) return true;
      return true;
    }
    function openPanel(kind) { if (["help", "settings", "newgame"].indexOf(kind) < 0) return false; opener = document.activeElement; modalIndex = 0; modalAy = 0; modal = kind; render(); return true; }
    return { sync: sync, isVisible: function () { return ["title", "pause", "notes", "reviews", "board"].indexOf(state.mode) >= 0; }, capturesKeys: function () { return ["title", "pause", "notes", "reviews", "board"].indexOf(state.mode) >= 0 || !!modal; }, handleInput: handleInput, openPanel: openPanel, destroy: function () { root.remove(); } };
  }
  window.createSporelingMenus = createSporelingMenus;
})();
