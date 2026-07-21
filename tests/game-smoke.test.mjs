import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);

test("every inline script parses", () => {
  assert.ok(scripts.length >= 2);
  for (const source of scripts) new vm.Script(source);
});

function createElement(kind = "div") {
  const listeners = new Map();
  const classes = new Set();
  const operations = [];
  const gradient = { addColorStop() {} };
  const context = new Proxy({
    operations,
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => ({}),
    createImageData: (width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    getImageData: (_x, _y, width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
    measureText: text => ({ width: String(text).length * 6 }),
    fillRect(x, y, width, height) {
      operations.push({ type: "fillRect", x, y, width, height, fillStyle: this.fillStyle });
    },
    fillText(value, x, y) {
      operations.push({ type: "fillText", value: String(value), x, y, fillStyle: this.fillStyle });
    },
  }, {
    get(target, key) {
      if (key in target) return target[key];
      return () => {};
    },
  });

  return {
    kind,
    classList: {
      add: value => classes.add(value),
      contains: value => classes.has(value),
      remove: value => classes.delete(value),
    },
    dataset: {},
    hidden: false,
    style: {},
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    dispatch(type, event = {}) {
      for (const handler of listeners.get(type) || []) handler(event);
    },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 }),
    getContext: () => context,
    toDataURL: () => "data:image/png;base64,",
  };
}

function bootGame({ hostname = "127.0.0.1", protocol = "http:", search = "", initialStorage = {} } = {}) {
  const events = new Map();
  const documentEvents = new Map();
  const elements = new Map();
  const storage = new Map(Object.entries(initialStorage));
  const on = (map, type, handler) => {
    if (!map.has(type)) map.set(type, []);
    map.get(type).push(handler);
  };
  const element = id => {
    if (!elements.has(id)) elements.set(id, createElement(id === "game" ? "canvas" : "div"));
    return elements.get(id);
  };

  const document = {
    hidden: false,
    head: { appendChild() {} },
    addEventListener: (type, handler) => on(documentEvents, type, handler),
    createElement,
    getElementById: element,
  };
  const localStorage = {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value)),
  };
  const fetch = async () => ({
    headers: { get: () => null },
    json: async () => [],
    ok: false,
  });
  const context = {
    URL,
    URLSearchParams,
    addEventListener: (type, handler) => on(events, type, handler),
    document,
    fetch,
    innerHeight: 720,
    innerWidth: 1280,
    localStorage,
    location: { hostname, protocol, search },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    navigator: { getGamepads: () => [], vibrate() {} },
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    setInterval() {},
  };
  context.window = context;
  context.globalThis = context;

  const marker = /requestAnimationFrame\(frame\);\s*\}\)\(\);\s*$/;
  assert.match(scripts[0], marker, "test export marker must match the game loop");
  const source = scripts[0].replace(marker, `
globalThis.__SD_TEST__ = {
  S, LEVELS, PATCH_NOTES, BARROW, BOSS, CHORUS, SHOG, ROOT_TIERS, ROOT_TIER_ORDER,
  FIXED_DT, MAX_FRAME_DT, MAX_SPORES, START_HEALTH, MAX_HEALTH, TILE,
  ADVENTURE_DIFFICULTIES, ADVENTURE_RULES, TIMED_RUN_RULES, NOTICE_PRIORITY,
  keys, just, TOUCH, touchPrev, padPrev,
  canvas, handleFocusLoss, handleFocusReturn, loadLevel, pauseIds, titleIds, readInput,
  activateTitleItem, startTitleRun, setRunModePref, cycleGhostPref, competitiveRun, applyDevFixture,
  dailyUnlocked, stepAdventureLevel, adventureLevelName, cycleAdventureDifficulty, configureRunRules,
  queueNotice, resetNotices, updateNoticeQueue, noticeBlocked, rootWarningActive, openingLessonNeeded,
  advanceTalk, talkHitAt, talkLayout, titleControlLines,
  chamberClear, submitScore, checkpointEligible, checkpointPathClear, activateCheckpoint,
  mercyRetriesEnabled, updateDescentMercy,
  gainHealth, hurtPlayer, killPlayer,
  bloomPlacement, spawnBloom, openingLessonLines,
  bossStartAttack, bossLanded, nextRootTier, cameraTargetX, rootCameraCenterY,
  draw, drawBossWarnings, frame, g, moveAxis, resize, respawn,
  restartCurrentChamber, solidBlocked, spawnShoggoth, startPracticeRun, tick,
  devMetricsSnapshot, recordDevAttempt, toggleReducedMotion, toggleTouchHand,
  updateBarrow, updateBoss, updateChorus, updateShoggoth,
  setTestMap(rows) {
    LEVEL = rows.slice();
    ROWS = LEVEL.length;
    COLS = LEVEL[0].length;
    WORLD_W = COLS * TILE;
    WORLD_H = ROWS * TILE;
    S.blooms = [];
    S.movers = [];
    S.enemies = [];
    S.eshots = [];
    SPIKES = [];
  },
  get focusInputLock() { return focusInputLock; },
  get reducedMotion() { return reducedMotion; },
  get leftHanded() { return leftHanded; },
  get runModePref() { return runModePref; },
  get ghostPref() { return ghostPref; },
  get adventureDifficultyPref() { return adventureDifficultyPref; },
  get DAILY_PANEL() { return DAILY_PANEL; },
  get WORLD_H() { return WORLD_H; },
  get WORLD_W() { return WORLD_W; },
};
requestAnimationFrame(frame);
})();`);
  vm.runInNewContext(source, context);
  return { api: context.__SD_TEST__, context, document, documentEvents, element, events, storage };
}

test("every chamber has a rectangular map and one spawn", () => {
  const { api } = bootGame();
  assert.ok(api.LEVELS.length >= 10);
  for (const level of api.LEVELS) {
    assert.ok(level.map.length > 0, `${level.name} has rows`);
    const width = level.map[0].length;
    assert.ok(width > 0, `${level.name} has columns`);
    assert.ok(level.map.every(row => row.length === width), `${level.name} is rectangular`);
    assert.equal(level.map.join("").split("P").length - 1, 1, `${level.name} has exactly one spawn`);
  }
});

test("every route has valid exits and the Pale Root keeps an open structural spine", () => {
  const { api } = bootGame();
  const positions = (level, symbol) => {
    const out = [];
    level.map.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) if (row[c] === symbol) out.push({ c, r });
    });
    return out;
  };
  const supportWithin = (level, point, rows) => {
    for (let d = 1; d <= rows; d++) {
      const row = level.map[point.r + d];
      if (row && row[point.c] === "#") return d;
    }
    return null;
  };

  for (const level of api.LEVELS) {
    const goals = positions(level, "G");
    const memories = positions(level, "M");
    if (level.boss) {
      assert.equal(goals.length, 0, `${level.name} exits through its boss`);
    } else if (level.secret) {
      assert.equal(goals.length, 0, `${level.name} exits through its hidden return`);
      assert.equal(memories.length, 1, `${level.name} contains its one purpose`);
    } else {
      assert.equal(goals.length, 1, `${level.name} has one route exit`);
    }

    for (const spawn of positions(level, "P"))
      assert.ok(supportWithin(level, spawn, 2), `${level.name} spawn has nearby support`);
    for (const checkpoint of positions(level, "C"))
      assert.equal(supportWithin(level, checkpoint, 1), 1, `${level.name} checkpoint sits on solid ground`);
    for (const goal of goals)
      assert.ok(supportWithin(level, goal, 3), `${level.name} goal can be reached from support`);
  }

  const root = api.LEVELS.find(level => level.gauntlet);
  assert.ok(root, "the Pale Root gauntlet exists");
  const spawn = positions(root, "P")[0];
  const goal = positions(root, "G")[0];
  const mercies = positions(root, "C").sort((a, b) => b.r - a.r);
  assert.equal(mercies.length, 2, "the Root has exactly two earned mercy checkpoints");
  assert.deepEqual(mercies.map(p => p.r), [115, 55]);
  assert.ok(spawn.r > mercies[0].r && mercies[0].r > mercies[1].r && mercies[1].r > goal.r);

  for (let r = goal.r + 1; r < spawn.r; r++) {
    const interior = root.map[r].slice(1, -1);
    assert.ok(interior.includes(".") || /[PCGBM]/.test(interior), `Pale Root row ${r} does not seal the climb`);
  }

  const routeBands = [
    [180, 195, "steps"], [152, 179, "first chimney"], [132, 151, "first ladder"],
    [116, 131, "crossing"], [94, 115, "thread"], [80, 93, "teeth"],
    [56, 79, "second chimney"], [36, 55, "second ladder"], [6, 35, "crown approach"],
  ];
  for (const [top, bottom, name] of routeBands) {
    const geometry = root.map.slice(top, bottom + 1).join("");
    assert.ok((geometry.match(/#/g) || []).length >= 4, `Pale Root ${name} keeps its route geometry`);
  }
});

test("every chamber loads with safe runtime objects and a working respawn", () => {
  const { api } = bootGame();
  for (let index = 0; index < api.LEVELS.length; index++) {
    const level = api.LEVELS[index];
    const cells = level.map.join("");
    api.loadLevel(index);

    assert.equal(api.S.levelIdx, index);
    assert.ok(api.S.player);
    assert.ok(api.S.player.x >= 0 && api.S.player.x + api.S.player.w <= api.WORLD_W);
    assert.ok(api.S.player.y >= 0 && api.S.player.y + api.S.player.h <= api.WORLD_H);
    assert.equal(api.solidBlocked(api.S.player.x, api.S.player.y, api.S.player.w, api.S.player.h), false);
    const expectedCheckpoints = cells.split("C").length - 1 + (level.mercyCheckpoints || []).length;
    assert.equal(api.S.checkpoints.length, expectedCheckpoints);
    assert.equal(api.S.berryList.length, cells.split("B").length - 1);
    assert.equal(Boolean(api.S.goal), cells.includes("G"));

    const spawn = { ...api.S.checkPt };
    api.S.player.x += 3;
    api.S.player.vx = 50;
    api.S.blooms.push({ life: 1 });
    api.respawn();
    assert.equal(api.S.player.x, spawn.x);
    assert.equal(api.S.player.y, spawn.y);
    assert.equal(api.S.player.vx, 0);
    assert.equal(api.S.blooms.length, 0);
    assert.equal(api.S.mode, "play");
  }
});

test("checkpoint spacing keeps each retry stretch meaningful", () => {
  const { api } = bootGame();
  const expected = new Map([
    ["THE HOLLOW", 1],
    ["ROTROOT CHASM", 1],
    ["THE SPIRE", 1],
    ["MYCEL GARDENS", 1],
    ["THE SKITTERWAY", 0],
    ["THE BROODNEST", 0],
    ["THE BLOOMHEART", 1],
    ["THE MARROW", 1],
    ["THE CHORUS HALL", 0],
    ["THE SWALLOW", 0],
    ["THE MOTHER'S THROAT", 0],
    ["THE UNDRAWN MAP", 0],
    ["THE PALE ROOT", 2],
  ]);

  let total = 0;
  for (const level of api.LEVELS) {
    const count = level.map.join("").split("C").length - 1;
    total += count;
    assert.equal(count, expected.get(level.name), `${level.name} keeps its intentional checkpoint budget`);
  }
  assert.equal(total, 8, "the route uses one checkpoint per normal chamber and two only in the Pale Root marathon");

  const hollowCheckpoint = api.LEVELS[0].map.findIndex(row => row.includes("C"));
  assert.equal(hollowCheckpoint, 7, "The Hollow checkpoint stays on its supported platform row");
  assert.equal(api.LEVELS[0].map[7].indexOf("C"), 66, "The Hollow checkpoint comes after the first spike-pit test");
});

test("mercy retry anchors sit in safe, intentional parts of the route", () => {
  const { api } = bootGame();
  const expected = new Map([
    ["THE SKITTERWAY", [{ c: 45, r: 8 }]],
    ["THE MARROW", [{ c: 72, r: 15 }]],
  ]);

  for (const [name, anchors] of expected) {
    const level = api.LEVELS.find(candidate => candidate.name === name);
    assert.ok(level, name + " exists");
    assert.deepEqual([...level.mercyCheckpoints].map(cp => ({ ...cp })), anchors);
    for (const cp of level.mercyCheckpoints) {
      assert.equal(level.map[cp.r][cp.c], ".", name + " retry marker occupies open air");
      assert.equal(level.map[cp.r + 1][cp.c], "#", name + " retry marker has solid footing");
    }
  }

  const swallow = api.LEVELS.find(level => level.name === "THE SWALLOW");
  assert.deepEqual({ ...swallow.descentMercy }, { triggerRow: 34, c: 8, r: 35 });
  assert.equal(swallow.map[35][8], ".", "The Swallow retry point is clear");
  assert.equal(swallow.map[33][8], "#", "the retry triggers after the third tooth shelf");
  assert.equal(swallow.map[42][8], ".", "the next tooth shelf leaves the left approach open");
});

test("Easy and Normal add sparse retries without changing Hard or Timed Run", () => {
  const loadFor = (difficulty, mode, name) => {
    const { api } = bootGame({ initialStorage: {
      sd_adventure_difficulty: difficulty,
      sd_run_mode: mode,
    } });
    api.S.runMode = mode;
    api.S.daily = false;
    api.configureRunRules(mode);
    api.loadLevel(api.LEVELS.findIndex(level => level.name === name));
    return api;
  };

  for (const difficulty of ["easy", "normal"]) {
    const skitterway = loadFor(difficulty, "adventure", "THE SKITTERWAY");
    assert.equal(skitterway.mercyRetriesEnabled(), true);
    assert.equal(skitterway.S.checkpoints.length, 1);
    assert.equal(skitterway.S.checkpoints[0].mercy, true);
    assert.equal(skitterway.checkpointEligible(skitterway.S.player, skitterway.S.checkpoints[0]), false);
    Object.assign(skitterway.S.player, {
      x: skitterway.S.checkpoints[0].x + 3,
      y: skitterway.S.checkpoints[0].y - 4,
    });
    assert.equal(skitterway.checkpointEligible(skitterway.S.player, skitterway.S.checkpoints[0]), true);

    const marrow = loadFor(difficulty, "adventure", "THE MARROW");
    assert.equal(marrow.S.checkpoints.length, 2);
    assert.equal(marrow.S.checkpoints.filter(cp => cp.mercy).length, 1);

    const swallow = loadFor(difficulty, "adventure", "THE SWALLOW");
    assert.ok(swallow.S.descentMercy);

    for (let index = 0; index <= 10; index++) {
      swallow.loadLevel(index);
      const retryCount = swallow.S.checkpoints.length + (swallow.S.descentMercy ? 1 : 0);
      assert.ok(retryCount <= 2, swallow.LEVELS[index].name + " stays within the two-retry ceiling");
    }
  }

  const hardSkitterway = loadFor("hard", "adventure", "THE SKITTERWAY");
  assert.equal(hardSkitterway.mercyRetriesEnabled(), false);
  assert.equal(hardSkitterway.S.checkpoints.length, 0);
  const hardMarrow = loadFor("hard", "adventure", "THE MARROW");
  assert.equal(hardMarrow.S.checkpoints.length, 1);
  const hardSwallow = loadFor("hard", "adventure", "THE SWALLOW");
  assert.equal(hardSwallow.S.descentMercy, null);

  const timedSkitterway = loadFor("easy", "speedrun", "THE SKITTERWAY");
  assert.equal(timedSkitterway.mercyRetriesEnabled(), false);
  assert.equal(timedSkitterway.S.checkpoints.length, 0);
  const timedMarrow = loadFor("easy", "speedrun", "THE MARROW");
  assert.equal(timedMarrow.S.checkpoints.length, 1);
  const timedSwallow = loadFor("easy", "speedrun", "THE SWALLOW");
  assert.equal(timedSwallow.S.descentMercy, null);

  const orderedStart = bootGame({ initialStorage: { sd_adventure_difficulty: "normal" } });
  orderedStart.api.S.devLevel = orderedStart.api.LEVELS.findIndex(level => level.name === "THE SKITTERWAY");
  orderedStart.api.startTitleRun();
  assert.equal(orderedStart.api.S.levelIdx, orderedStart.api.S.devLevel);
  assert.equal(orderedStart.api.S.checkpoints.filter(cp => cp.mercy).length, 1, "difficulty is configured before the chamber loads");
});

test("The Swallow saves one mid-shaft retry and respawns there", () => {
  const { api } = bootGame({ initialStorage: { sd_adventure_difficulty: "normal" } });
  api.S.runMode = "adventure";
  api.S.daily = false;
  api.configureRunRules("adventure");
  api.loadLevel(api.LEVELS.findIndex(level => level.name === "THE SWALLOW"));
  api.resetNotices();

  const mercy = api.S.descentMercy;
  const p = api.S.player;
  p.y = mercy.triggerY - p.h;
  assert.equal(api.updateDescentMercy(p), true);
  assert.equal(api.updateDescentMercy(p), false, "the same shaft threshold cannot save repeatedly");
  assert.deepEqual({ ...api.S.checkPt }, { x: 8 * api.TILE + 3, y: 35 * api.TILE + 4 });
  const noticeText = [api.S.hint, ...api.S.hintQueue].filter(Boolean).map(notice => notice.text);
  assert.ok(noticeText.includes("If the shaft gets you, you'll restart here."));

  Object.assign(p, { x: 20 * api.TILE, y: 55 * api.TILE, vx: 70, vy: 180 });
  api.S.health = 1;
  api.killPlayer("the spikes");
  api.S.deathT = 0.56;
  api.tick(api.FIXED_DT);
  assert.equal(api.S.mode, "play");
  assert.equal(p.x, 8 * api.TILE + 3);
  assert.equal(p.y, 35 * api.TILE + 4);
  assert.equal(api.S.health, api.S.maxHealth);
  assert.equal(p.invuln, 0.5);
});

test("focus loss pauses play, clears stale controls, and requires neutral re-entry", () => {
  const { api, element, events } = bootGame();
  api.S.mode = "play";
  api.keys.ArrowRight = true;
  api.just.ArrowRight = true;
  api.TOUCH.ax = 1;
  api.TOUCH.jump = true;
  element("btnJump").classList.add("pressed");

  for (const handler of events.get("blur") || []) handler();

  assert.equal(api.S.mode, "pause");
  assert.equal(api.focusInputLock, true);
  assert.deepEqual(Object.keys(api.keys), []);
  assert.equal(api.TOUCH.ax, 0);
  assert.equal(api.TOUCH.jump, false);
  assert.equal(element("btnJump").classList.contains("pressed"), false);
  assert.deepEqual({ ...api.readInput() }, {
    ax: 0, ay: 0, jumpDown: false, jumpEdge: false, dashEdge: false,
    pauseEdge: false, startEdge: false, talkEdge: false, dailyEdge: false, boardEdge: false,
  });

  for (const handler of events.get("focus") || []) handler();
  api.readInput();
  assert.equal(api.focusInputLock, false);
  api.keys.ArrowRight = true;
  assert.equal(api.readInput().ax, 1);
});

test("directional key edges survive between fixed updates", () => {
  const { api } = bootGame();
  api.just.ArrowDown = true;
  assert.equal(api.readInput().ay, 1);
  delete api.just.ArrowDown;
  api.just.KeyA = true;
  assert.equal(api.readInput().ax, -1);
});

test("only deliberate keyboard confirms activate the focused title item", () => {
  const ignored = [
    "KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "ShiftLeft", "ShiftRight", "KeyE", "KeyJ", "KeyX", "KeyM", "KeyN", "KeyL", "Escape",
  ];
  for (const code of ignored) {
    const { api } = bootGame();
    api.S.mode = "title";
    api.just[code] = true;
    api.tick(api.FIXED_DT);
    assert.equal(api.S.mode, "title", `${code} does not launch the game`);
  }

  for (const code of ["Space", "Enter"]) {
    const { api } = bootGame();
    api.S.mode = "title";
    api.S.titleSel = api.titleIds().indexOf("start");
    api.just[code] = true;
    api.tick(api.FIXED_DT);
    assert.equal(api.S.mode, "play", `${code} deliberately starts the focused run`);
  }
});

test("controller A or Start confirms while B, dash, and D-pad do not launch", () => {
  const withButton = index => {
    const game = bootGame();
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
    buttons[index].pressed = true;
    game.context.navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons }];
    game.api.S.mode = "title";
    game.api.S.titleSel = game.api.titleIds().indexOf("start");
    game.api.tick(game.api.FIXED_DT);
    return game.api;
  };

  assert.equal(withButton(0).S.mode, "play", "controller A confirms Start");
  assert.equal(withButton(9).S.mode, "play", "controller Start confirms Start");
  for (const button of [1, 2, 5, 13])
    assert.equal(withButton(button).S.mode, "title", `controller button ${button} does not launch`);
});

test("title focus is visible and touch starts only through the Start target", () => {
  const { api } = bootGame();
  api.S.mode = "title";
  api.S.titleSel = api.titleIds().indexOf("start");
  api.just.ArrowDown = true;
  api.tick(api.FIXED_DT);
  assert.equal(api.S.mode, "title");
  assert.equal(api.S.titleSel, api.titleIds().indexOf("devlevel"), "Down moves focus to the next title option");
  api.g.operations.length = 0;
  api.draw();
  assert.ok(api.g.operations.some(op => op.type === "fillText" && op.value.startsWith("› TEST LEVEL:")));

  api.TOUCH.active = true;
  api.TOUCH.jump = true;
  api.tick(api.FIXED_DT);
  assert.equal(api.S.mode, "title", "touch jump is not an invisible title confirm");
  api.TOUCH.jump = false;

  api.canvas.dispatch("click", { clientX: 150, clientY: 150 });
  assert.equal(api.S.mode, "title", "an unrelated canvas click does nothing");
  api.canvas.dispatch("click", { clientX: 250, clientY: 47 });
  assert.equal(api.S.mode, "play", "the visible Start row launches the selected run");
});

test("title controls keep keyboard, controller, and touch labels separate", () => {
  const keyboard = bootGame();
  assert.deepEqual([...keyboard.api.titleControlLines()], [
    "Move: A / D or LEFT / RIGHT",
    "Jump: SPACE   Dash: SHIFT or J   M: MUSIC",
  ]);
  for (const [code, expected] of [["KeyA", -1], ["KeyD", 1], ["ArrowLeft", -1], ["ArrowRight", 1]]) {
    keyboard.api.keys[code] = true;
    assert.equal(keyboard.api.readInput().ax, expected, `${code} matches the displayed horizontal direction`);
    keyboard.api.keys[code] = false;
  }
  keyboard.api.g.operations.length = 0;
  keyboard.api.draw();
  const labels = keyboard.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(labels.includes("Move: A / D or LEFT / RIGHT"));
  assert.equal(labels.some(label => label.includes("WASD") || label.includes("Space/A")), false);

  const controller = bootGame();
  controller.context.navigator.getGamepads = () => [{
    connected: true,
    axes: [0, 0],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false })),
  }];
  assert.deepEqual([...controller.api.titleControlLines()], [
    "Move: LEFT STICK or D-PAD",
    "Jump: A   Dash: X or RB",
  ]);

  const touch = bootGame();
  touch.api.TOUCH.active = true;
  assert.deepEqual([...touch.api.titleControlLines()], ["Move: STICK   Jump: A   Dash: X"]);
});

test("Adventure is the persistent default and Timed Run remains an explicit choice", () => {
  const fresh = bootGame();
  assert.equal(fresh.api.runModePref, "adventure");
  assert.equal(fresh.api.ghostPref, "off");
  assert.equal(fresh.api.titleIds().includes("ghost"), false, "ghost setup stays out of the Adventure menu");
  assert.equal(fresh.api.titleIds().includes("difficulty"), true, "Adventure exposes its difficulty choice");
  assert.equal(fresh.api.titleIds().includes("levelselect"), false, "level select stays hidden before the first clear");
  fresh.api.startTitleRun();
  assert.equal(fresh.api.S.runMode, "adventure");
  assert.equal(fresh.api.competitiveRun(), false);
  assert.equal(fresh.api.S.ghost, null);

  const saved = bootGame({ initialStorage: { sd_run_mode: "speedrun", sd_ghost_pref: "off" } });
  assert.equal(saved.api.runModePref, "speedrun");
  assert.equal(saved.api.titleIds().includes("ghost"), true);
  assert.equal(saved.api.titleIds().includes("difficulty"), false, "Timed Run has one fixed ruleset");
  assert.equal(saved.api.titleIds().includes("levelselect"), false, "Timed Run never offers level select");
  saved.api.startTitleRun();
  assert.equal(saved.api.S.runMode, "speedrun");
  assert.equal(saved.api.titleIds().includes("devlevel"), false, "even TEST LEVEL stays out of Timed Run");
  saved.api.S.devLevel = 4;
  saved.api.startTitleRun();
  assert.equal(saved.api.S.levelIdx, 0, "the dev build also forces Timed Run to begin at The Hollow");
  assert.equal(saved.api.competitiveRun(), true);
  assert.equal(saved.api.S.ghost, null, "even Timed Run starts without a ghost by default");

  saved.api.S.mode = "title";
  saved.api.g.operations.length = 0;
  saved.api.draw();
  const timedLabels = saved.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(timedLabels.includes("TIMED RUN"));
  assert.ok(timedLabels.includes("All clears: Any%. Everything: 100%."));
});

test("Adventure level select unlocks after a clear and never appears in Timed Run", () => {
  const game = bootGame({ hostname: "thoughtcrimegpt.github.io" });
  const { api, storage } = game;
  assert.equal(api.titleIds().includes("levelselect"), false);

  api.S.mode = "play";
  api.S.runMode = "adventure";
  api.S.levelIdx = 0;
  api.chamberClear();
  assert.equal(storage.get("sd_reach"), "1", "clearing the first chamber unlocks the next Adventure start");
  api.S.mode = "title";
  assert.equal(api.titleIds().includes("levelselect"), true);

  api.activateTitleItem("levelselect");
  assert.equal(api.S.advStart, 1);
  assert.match(api.adventureLevelName(), /2\. ROTROOT CHASM/);
  api.startTitleRun();
  assert.equal(api.S.levelIdx, 1);
  assert.equal(api.S.practice, false, "Adventure level select remains a real progress run");
  assert.equal(api.pauseIds().includes("practice"), true, "Adventure can still enter separate practice from pause");

  api.S.mode = "title";
  api.setRunModePref("speedrun");
  assert.equal(api.titleIds().includes("levelselect"), false);
  assert.equal(api.titleIds().includes("practice"), false);
  api.startTitleRun();
  assert.equal(api.S.levelIdx, 0, "Timed Run always starts from the first chamber");
  assert.equal(api.pauseIds().includes("practice"), false, "Timed Run pause has no level-select shortcut");
});

test("Adventure difficulty controls health and healing while Timed Run stays fixed", () => {
  const { api, storage } = bootGame({ hostname: "thoughtcrimegpt.github.io" });
  assert.equal(api.adventureDifficultyPref, "normal");
  assert.equal(api.titleIds().includes("difficulty"), true);
  api.startTitleRun();
  assert.equal(api.S.health, 4);
  assert.equal(api.S.maxHealth, 4);
  assert.equal(api.S.berriesPerHeal, 12);

  api.S.mode = "title";
  api.activateTitleItem("difficulty");
  assert.equal(api.adventureDifficultyPref, "hard");
  assert.equal(storage.get("sd_adventure_difficulty"), "hard");
  api.startTitleRun();
  assert.equal(api.S.health, 3);
  assert.equal(api.S.maxHealth, 3);
  assert.equal(api.S.berriesPerHeal, 16);
  api.S.player.invuln = 0;
  api.S.health = 1;
  api.killPlayer("test hazard");
  api.S.deathT = 0.56;
  api.tick(api.FIXED_DT);
  assert.equal(api.S.mode, "play", "Hard returns to the checkpoint after its first spike death");
  assert.equal(api.S.health, 3);
  assert.equal("lives" in api.S, false, "Adventure no longer tracks a run-ending life counter");

  const easy = bootGame({ hostname: "thoughtcrimegpt.github.io", initialStorage: {
    sd_adventure_difficulty: "easy",
  } });
  easy.api.startTitleRun();
  assert.equal(easy.api.S.health, 5);
  assert.equal(easy.api.S.maxHealth, 5);
  assert.equal(easy.api.S.berriesPerHeal, 8);

  const speedrun = bootGame({ hostname: "thoughtcrimegpt.github.io", initialStorage: {
    sd_run_mode: "speedrun",
    sd_adventure_difficulty: "hard",
  } });
  speedrun.api.startTitleRun();
  assert.equal(speedrun.api.S.health, 4);
  assert.equal(speedrun.api.S.maxHealth, 4);
  assert.equal(speedrun.api.S.berriesPerHeal, 12);
  assert.equal(speedrun.api.S.levelIdx, 0);
});

test("each Adventure difficulty uses its own berry healing interval and health cap", () => {
  const expected = {
    easy: { health: 5, berries: 8 },
    normal: { health: 4, berries: 12 },
    hard: { health: 3, berries: 16 },
  };

  for (const [difficulty, rules] of Object.entries(expected)) {
    const { api } = bootGame({ initialStorage: { sd_adventure_difficulty: difficulty } });
    api.startTitleRun();
    api.S.bannerT = 0;
    api.S.health = api.S.maxHealth - 1;
    api.S.score.pickups = rules.berries - 1;
    api.S.berryList = [{
      x: api.S.player.x, y: api.S.player.y, w: 8, h: 8, taken: false,
    }];
    api.tick(api.FIXED_DT);
    api.updateNoticeQueue(0);
    assert.equal(api.S.health, rules.health, difficulty + " heals at its configured berry interval");
    assert.equal(api.S.maxHealth, rules.health);
    assert.equal(api.S.berriesPerHeal, rules.berries);
    assert.equal(api.S.hint.text, rules.berries + " berries restore 1 health.");

    api.gainHealth();
    assert.equal(api.S.health, rules.health, difficulty + " cannot grow beyond its health cap");
    api.S.health--;
    api.chamberClear();
    assert.equal(api.S.health, rules.health, difficulty + " restores one health after a chamber clear");
  }
});

test("The Pale Root remains visible as locked New Game+ content", () => {
  const locked = bootGame({ hostname: "thoughtcrimegpt.github.io" });
  assert.equal(locked.api.titleIds().includes("daily"), true);
  locked.api.S.mode = "title";
  locked.api.S.titleSel = locked.api.titleIds().indexOf("daily");
  locked.api.g.operations.length = 0;
  locked.api.draw();
  const lockedText = locked.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(lockedText.includes("NEW GAME+"));
  assert.ok(lockedText.includes("THE PALE ROOT"));
  assert.ok(lockedText.includes("Beat the game to continue."));
  assert.deepEqual({ ...locked.api.DAILY_PANEL }, { x: 4, y: 132, w: 132, h: 32 });
  locked.api.activateTitleItem("daily");
  assert.equal(locked.api.S.mode, "title", "the locked card cannot launch");

  const unlocked = bootGame({
    hostname: "thoughtcrimegpt.github.io",
    initialStorage: { sd_beaten: "1" },
  });
  unlocked.api.activateTitleItem("daily");
  assert.equal(unlocked.api.S.mode, "play");
  assert.equal(unlocked.api.S.daily, true);
  assert.equal(unlocked.api.S.levelIdx, unlocked.api.LEVELS.length - 1);
});

test("mode and ghost preferences persist", () => {
  const { api, storage } = bootGame();
  api.setRunModePref("speedrun");
  assert.equal(storage.get("sd_run_mode"), "speedrun");
  assert.equal(api.cycleGhostPref(1), "personal");
  assert.equal(api.cycleGhostPref(1), "leader");
  assert.equal(api.cycleGhostPref(-1), "personal");
  assert.equal(storage.get("sd_ghost_pref"), "personal");
  assert.deepEqual([...storage.keys()].sort(), ["sd_ghost_pref", "sd_run_mode"]);
});

test("personal-best and leaderboard ghosts are loaded only when deliberately selected", () => {
  const frames = [[0, 10, 20, 1], [0, 20, 20, 1]];
  const personal = bootGame({ initialStorage: {
    sd_run_mode: "speedrun",
    sd_ghost_pref: "personal",
    sd_pb: JSON.stringify({ t: 4.2, frames }),
  } });
  personal.api.startTitleRun();
  assert.equal(personal.api.S.ghost.name, "your echo");

  const leader = bootGame({ initialStorage: { sd_run_mode: "speedrun", sd_ghost_pref: "leader" } });
  leader.api.S.pendingGhost = { frames, name: "chosen runner" };
  leader.api.startTitleRun();
  assert.equal(leader.api.S.ghost.name, "chosen runner");

  const adventure = bootGame();
  adventure.api.S.pendingGhost = { frames, name: "unchosen runner" };
  adventure.api.startTitleRun();
  assert.equal(adventure.api.S.ghost, null);
  assert.equal(adventure.api.S.pendingGhost.name, "unchosen runner", "Adventure does not consume an armed race link");
});

test("competitive timing, splits, recording, and submission stay out of Adventure", () => {
  const adventure = bootGame();
  adventure.api.S.runMode = "adventure";
  adventure.api.S.mode = "play";
  adventure.api.S.rec = [];
  adventure.api.tick(adventure.api.FIXED_DT);
  assert.equal(adventure.api.S.rec.length, 0, "Adventure records no ghost frames");
  adventure.api.S.ghost = { frames: [[0, 0, 0, 1], [1, 0, 0, 1]], name: "echo" };
  adventure.api.chamberClear();
  assert.equal(adventure.api.S.split, null);
  adventure.api.submitScore();
  assert.equal(adventure.api.S.lbMsg, "Adventure runs aren't submitted.");

  adventure.api.S.mode = "win";
  adventure.api.g.operations.length = 0;
  adventure.api.draw();
  const adventureText = adventure.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(adventureText.includes("Adventure complete. No time was submitted."));
  assert.equal(adventureText.some(value => value.startsWith("Time      ")), false);

  const speedrun = bootGame({ initialStorage: { sd_run_mode: "speedrun", sd_ghost_pref: "off" } });
  speedrun.api.startTitleRun();
  speedrun.api.S.bannerT = 0;
  speedrun.api.S.hint = null;
  speedrun.api.tick(speedrun.api.FIXED_DT);
  assert.ok(speedrun.api.S.rec.length > 0, "Timed Run records replay frames");
  speedrun.api.g.operations.length = 0;
  speedrun.api.draw();
  assert.ok(speedrun.api.g.operations.some(op => op.type === "fillText" && op.value === "0:00.0"), "Timed Run shows its timer");
});

test("every Adventure difficulty retries from the latest checkpoint", () => {
  for (const [difficulty, health] of [["easy", 5], ["normal", 4], ["hard", 3]]) {
    const { api } = bootGame({ initialStorage: { sd_adventure_difficulty: difficulty } });
    api.startTitleRun();
    const checkpoint = { ...api.S.checkPt };
    Object.assign(api.S.player, { x: checkpoint.x + 80, y: checkpoint.y - 30, vx: 90, vy: 120 });
    api.killPlayer("the spikes");
    api.S.deathT = 0.56;
    api.tick(api.FIXED_DT);
    assert.equal(api.S.mode, "play", difficulty + " never ends the full run");
    assert.equal(api.S.player.x, checkpoint.x);
    assert.equal(api.S.player.y, checkpoint.y);
    assert.equal(api.S.health, health, difficulty + " restores its per-attempt health buffer");
  }
});

test("Timed Run retries from checkpoints while its clock keeps running", () => {
  const { api } = bootGame({ initialStorage: { sd_run_mode: "speedrun" } });
  api.startTitleRun();
  const checkpoint = { ...api.S.checkPt };
  api.S.score.time = 10;
  api.killPlayer("the spikes");

  for (let i = 0; i < 40 && api.S.mode === "dead"; i++) api.tick(api.FIXED_DT);

  assert.equal(api.S.mode, "play");
  assert.equal(api.S.player.x, checkpoint.x);
  assert.equal(api.S.player.y, checkpoint.y);
  assert.equal(api.S.health, 4);
  assert.ok(api.S.score.time > 10.5, "the retry animation remains part of the Timed Run");
});

test("checkpoints credit close passes from open directions without reaching through walls", () => {
  const { api } = bootGame();
  api.setTestMap(Array(8).fill("............"));
  const cp = { x: 64, y: 48, w: 16, h: 16, active: false };
  const p = api.S.player;

  Object.assign(p, { x: 66, y: 50, w: 10, h: 10 });
  assert.equal(api.checkpointEligible(p, cp), true, "touching activates");
  Object.assign(p, { x: 66, y: 28 });
  assert.equal(api.checkpointEligible(p, cp), true, "a pass slightly above activates");
  Object.assign(p, { x: 42, y: 50 });
  assert.equal(api.checkpointEligible(p, cp), true, "a pass slightly beside activates");
  Object.assign(p, { x: 90, y: 50 });
  assert.equal(api.checkpointEligible(p, cp), true, "the open approach mirrors from the right");
  Object.assign(p, { x: 8, y: 48 });
  assert.equal(api.checkpointEligible(p, cp), false, "unrelated distant movement does not activate");

  const wallMap = Array(8).fill("............");
  wallMap[3] = "....#.......";
  api.setTestMap(wallMap);
  const walled = { x: 80, y: 48, w: 16, h: 16, active: false };
  Object.assign(p, { x: 53, y: 50 });
  assert.equal(api.checkpointEligible(p, walled), false, "a solid wall blocks the forgiving region");

  const floorMap = Array(8).fill("............");
  floorMap[4] = "....#.......";
  api.setTestMap(floorMap);
  Object.assign(p, { x: 66, y: 69 });
  assert.equal(api.checkpointEligible(p, cp), false, "approaching through the supporting floor is invalid");

  api.setTestMap(Array(8).fill("............"));
  Object.assign(p, { x: 42, y: 50, vx: 0, vy: 0, grounded: false });
  api.S.checkpoints = [cp];
  api.S.mode = "play";
  api.S.bannerT = 0;
  api.tick(api.FIXED_DT);
  api.updateNoticeQueue(0);
  assert.equal(cp.active, true, "the normal gameplay update awards the close pass");
  assert.deepEqual({ ...api.S.checkPt }, { x: 67, y: 44 });
  assert.match(api.S.hint.text, /restart here/i);
});

test("every placed checkpoint has at least one clear forgiving approach", () => {
  const { api } = bootGame();
  for (let index = 0; index < api.LEVELS.length; index++) {
    api.loadLevel(index);
    for (const cp of api.S.checkpoints) {
      const candidates = [
        { x: cp.x + 3, y: cp.y - 20 },
        { x: cp.x - 20, y: cp.y + 3 },
        { x: cp.x + cp.w + 10, y: cp.y + 3 },
        { x: cp.x + 3, y: cp.y + cp.h + 6 },
      ];
      const reachable = candidates.some(pos => {
        const probe = { ...api.S.player, ...pos, w: 10, h: 10 };
        return !api.solidBlocked(probe.x, probe.y, probe.w, probe.h) && api.checkpointEligible(probe, cp);
      });
      assert.equal(reachable, true, `${api.LEVELS[index].name} checkpoint at ${cp.x},${cp.y} has a valid nearby approach`);
    }
  }
});

test("the HUD shows only the active health cap alongside blooms and dash state", () => {
  const { api } = bootGame();
  api.startTitleRun();
  api.S.health = 3;
  api.S.player.spores = 2;
  api.S.player.canDash = true;
  api.g.operations.length = 0;
  api.draw();
  const textOps = api.g.operations.filter(op => op.type === "fillText");
  const labels = textOps.map(op => op.value);
  assert.ok(labels.includes("HEALTH 3"));
  assert.ok(labels.includes("BLOOMS 2"));
  assert.ok(labels.includes("DASH READY"));
  assert.equal(labels.some(label => label.startsWith("LIVES")), false, "the removed life counter is absent from the HUD");
  const healthPips = api.g.operations.filter(op =>
    op.type === "fillRect" && op.y === 9 && op.width === 4 && op.height === 4 && op.x >= 52
  );
  assert.equal(healthPips.length, 4, "Normal draws four health marks rather than the old nine-mark meter");
  const health = textOps.find(op => op.value === "HEALTH 3");
  const blooms = textOps.find(op => op.value === "BLOOMS 2");
  assert.equal(health.x, blooms.x, "survival and bloom resource share one HUD column");
  assert.ok(Math.abs(health.y - blooms.y) <= 14);

  api.gainHealth();
  assert.equal(api.S.health, 4);
  api.S.player.invuln = 0;
  api.hurtPlayer(api.S.player.x + 20, "test hazard");
  assert.equal(api.S.health, 3, "damage removes health rather than a life");
});

test("level instructions and transient notices share one prioritized lane", () => {
  const { api } = bootGame();
  const chorusIndex = api.LEVELS.findIndex(level => level.boss === "chorus");
  api.loadLevel(chorusIndex);
  api.S.mode = "play";

  api.g.operations.length = 0;
  api.draw();
  let labels = api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(labels.includes("THE CHORUS HALL"));
  assert.equal(api.S.hint, null, "the level instruction waits while the chamber name is visible");
  assert.ok(api.S.hintQueue.some(notice => /diving wisps/i.test(notice.text)));

  api.S.bannerT = 0;
  api.updateNoticeQueue(0);
  assert.match(api.S.hint.text, /diving wisps/i);
  api.queueNotice("The heart is glowing. Dash straight through it.", 2.2, api.NOTICE_PRIORITY.BOSS);
  api.updateNoticeQueue(0);
  assert.match(api.S.hint.text, /heart is glowing/i, "an actionable boss instruction preempts a general level tip");
  assert.ok(api.S.hintQueue.some(notice => /diving wisps/i.test(notice.text)), "the interrupted tip waits instead of disappearing");

  const remaining = api.S.hint.t;
  api.S.talk = { npc: { y: 0 } };
  api.updateNoticeQueue(1);
  assert.equal(api.S.hint.t, remaining, "notice timers pause while dialogue owns the screen");
});

test("required lessons and root warnings suppress the general notice lane", () => {
  const opening = bootGame({ search: "?fixture=opening" });
  opening.api.queueNotice("Checkpoint saved.", 3, opening.api.NOTICE_PRIORITY.STATUS);
  opening.api.updateNoticeQueue(0);
  assert.equal(opening.api.S.hint, null, "the required air-dash lesson goes first");
  opening.api.g.operations.length = 0;
  opening.api.draw();
  const openingLabels = opening.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(openingLabels.some(label => /Air-dash now/.test(label)));
  assert.equal(openingLabels.includes("Checkpoint saved."), false);

  const root = bootGame({ search: "?fixture=root-upper" });
  root.api.queueNotice("A queued level instruction.", 3, root.api.NOTICE_PRIORITY.TUTORIAL);
  root.api.updateNoticeQueue(0);
  assert.equal(root.api.S.hint, null, "the attack warning blocks the notice lane");
  root.api.g.operations.length = 0;
  root.api.draw();
  const rootLabels = root.api.g.operations.filter(op => op.type === "fillText").map(op => op.value);
  assert.ok(rootLabels.some(label => /ROOT SWEEP/.test(label)));
  assert.equal(rootLabels.includes("A queued level instruction."), false);
  root.api.S.boss.arm.warm = 0;
  root.api.updateNoticeQueue(0);
  assert.equal(root.api.S.hint.text, "A queued level instruction.");
});

test("touch buttons release on interrupted gestures", () => {
  const { api, element } = bootGame();
  let prevented = 0;
  const event = { preventDefault: () => prevented++ };
  element("btnJump").dispatch("touchstart", event);
  assert.equal(api.TOUCH.jump, true);
  assert.equal(element("btnJump").classList.contains("pressed"), true);

  element("btnJump").dispatch("touchcancel", event);
  assert.equal(api.TOUCH.jump, false);
  assert.equal(element("btnJump").classList.contains("pressed"), false);
  assert.equal(prevented, 2);
});

test("left-handed touch layout is persistent and absent from desktop menus", () => {
  const { api, element, storage } = bootGame();
  assert.equal(api.leftHanded, false);
  assert.equal(element("touch").classList.contains("left-handed"), false);
  assert.equal(api.pauseIds().includes("touchhand"), false);

  api.TOUCH.active = true;
  assert.equal(api.pauseIds().includes("touchhand"), true);
  api.TOUCH.jump = true;
  api.toggleTouchHand();
  assert.equal(api.leftHanded, true);
  assert.equal(element("touch").classList.contains("left-handed"), true);
  assert.equal(api.TOUCH.jump, false, "layout changes release active touches");
  assert.equal(storage.get("sd_touch_left"), "1");

  const restored = bootGame({ initialStorage: { sd_touch_left: "1" } });
  assert.equal(restored.api.leftHanded, true);
  assert.equal(restored.element("touch").classList.contains("left-handed"), true);

  api.loadLevel(0);
  api.S.mode = "pause";
  api.g.operations.length = 0;
  api.draw();
  const touchLabel = api.g.operations.find(op => op.type === "fillText" && op.value.startsWith("TOUCH LAYOUT:"));
  const levelRows = api.g.operations.filter(op => op.type === "fillText" && op.value.includes("THE HOLLOW"));
  const footer = api.g.operations.find(op => op.type === "fillText" && op.value.startsWith("Move to choose"));
  assert.ok(touchLabel);
  assert.ok(Math.max(...levelRows.map(op => op.y)) <= 146, "the last touch-menu choice stays above the footer");
  assert.equal(footer.y, 171);
});

test("reduced motion is persistent and immediately clears camera motion", () => {
  const { api, storage } = bootGame();
  api.S.shakeT = 1;
  api.S.camLook = 32;

  api.toggleReducedMotion();

  assert.equal(api.reducedMotion, true);
  assert.equal(api.S.shakeT, 0);
  assert.equal(api.S.camLook, 0);
  assert.equal(storage.get("sd_reduced_motion"), "1");
  assert.ok(api.pauseIds().includes("motion"));
});

test("the Unbloomed root sweep warns from the correct screen edge before moving", () => {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  assert.ok(levelIndex >= 0);
  api.loadLevel(levelIndex);
  const boss = api.S.boss;
  boss.pips = 1;
  boss.sweepSide = false;
  boss.state = "attack";
  api.bossStartAttack(boss);

  assert.equal(boss.arm.dir, 1);
  assert.equal(boss.arm.tier, "ground");
  assert.equal(boss.arm.y, api.ROOT_TIERS.ground.y);
  assert.equal(boss.arm.warm, api.BOSS.WARN);
  const startX = boss.arm.x;

  api.g.operations.length = 0;
  api.drawBossWarnings();
  const cue = api.g.operations.find(op => op.type === "fillText" && op.value.includes("ROOT SWEEP"));
  assert.ok(cue, "the root sweep has an explicit warning label");
  assert.ok(cue.x < 100, "a sweep from the left warns at the left screen edge");
  assert.ok(cue.value.endsWith(">>"), "the warning points toward the arena");

  api.updateBoss(api.BOSS.WARN / 2);
  assert.equal(boss.arm.x, startX, "the root remains harmless during its warning");
  api.updateBoss(api.BOSS.WARN / 2 + 0.01);
  assert.equal(boss.arm.x, startX, "crossing the timer only arms the sweep");
  api.updateBoss(0.02);
  assert.ok(boss.arm.x > startX, "the root moves inward only after the warning expires");

  boss.sweepSide = true;
  api.bossStartAttack(boss);
  api.g.operations.length = 0;
  api.drawBossWarnings();
  const rightCue = api.g.operations.find(op => op.type === "fillText" && op.value.includes("ROOT SWEEP"));
  assert.equal(boss.arm.dir, -1);
  assert.equal(boss.arm.tier, "upper");
  assert.ok(rightCue.x > 220, "a sweep from the right warns at the right screen edge");
  assert.ok(rightCue.value.startsWith("<<"), "the right warning points toward the arena");

  api.bossStartAttack(boss);
  api.g.operations.length = 0;
  api.drawBossWarnings();
  const thirdCue = api.g.operations.find(op => op.type === "fillText" && op.value.includes("ROOT SWEEP"));
  assert.equal(boss.arm.tier, "mid");
  assert.equal(thirdCue, undefined, "the explicit tutorial cue retires after two sweeps");
  assert.ok(api.g.operations.some(op => op.type === "fillRect"), "later sweeps keep a nonverbal edge telegraph");
  const arrowPixels = api.g.operations.filter(op => op.type === "fillRect" && op.width === 2 && op.height === 2);
  const arrowTopY = Math.min(...arrowPixels.map(op => op.y));
  const arrowTopX = Math.min(...arrowPixels.filter(op => op.y === arrowTopY).map(op => op.x));
  const arrowMidX = Math.min(...arrowPixels.filter(op => op.y === arrowTopY + 2).map(op => op.x));
  assert.ok(arrowMidX > arrowTopX, "later left-entry chevrons point right with the attack");
});

test("Unbloomed root tiers escalate deterministically without repeats", () => {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  api.loadLevel(levelIndex);
  const boss = api.S.boss;
  boss.state = "attack";
  boss.pips = 2;

  api.bossStartAttack(boss);
  const phaseTwo = [boss.arm.tier];
  api.bossStartAttack(boss);
  phaseTwo.push(boss.arm.tier);
  assert.deepEqual(phaseTwo, ["mid", "ground"], "phase two introduces the platform-height root first");

  api.loadLevel(levelIndex);
  const finalBoss = api.S.boss;
  finalBoss.state = "attack";
  finalBoss.pips = 1;
  const phaseThree = [];
  for (let i = 0; i < 6; i++) {
    api.bossStartAttack(finalBoss);
    phaseThree.push(finalBoss.arm.tier);
  }
  assert.deepEqual(phaseThree, ["ground", "upper", "mid", "ground", "upper", "mid"]);
  for (let i = 1; i < phaseThree.length; i++) assert.notEqual(phaseThree[i], phaseThree[i - 1]);
  assert.deepEqual(new Set(phaseThree), new Set(["ground", "mid", "upper"]));
});

test("root warnings are harmless and replace stacked projectile hazards", () => {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  api.loadLevel(levelIndex);
  const boss = api.S.boss;
  boss.state = "attack";
  boss.pips = 2;
  boss.shots = [{ x: 0, y: 0, w: 8, h: 8 }];
  boss.bolts = [{ x: 0, y: 0, w: 8, h: 8, vx: 0, vy: 0 }];
  boss.floorPulseT = 1.25;
  api.bossStartAttack(boss);

  assert.equal(boss.arm.tier, "mid");
  assert.equal(boss.shots.length, 0);
  assert.equal(boss.bolts.length, 0);
  boss.pips = 1;
  const player = api.S.player;
  Object.assign(player, { x: boss.arm.x + 8, y: boss.arm.y + 4, vx: 0, vy: 0, invuln: 0 });
  const health = api.S.health;
  const floorPulse = boss.floorPulseT;

  api.updateBoss(api.BOSS.WARN);
  assert.equal(api.S.health, health, "the full warning interval cannot hurt the player");
  assert.equal(boss.arm.x, 15 * 16, "the root does not move during the warning");
  assert.equal(boss.floorPulseT, floorPulse, "the phase-three floor pattern pauses for root beats");
  assert.equal(boss.shots.length, 0);
  assert.equal(boss.bolts.length, 0);

  api.updateBoss(api.FIXED_DT);
  assert.equal(api.S.health, health - 1, "collision begins after the warning has fully elapsed");

  boss.pips = 3;
  boss.state = "open";
  boss.shots = [{ x: 0, y: 0 }];
  boss.bolts = [{ x: 0, y: 0 }];
  api.bossLanded(boss);
  assert.equal(boss.arm, null, "a successful hit clears the root for player recovery");
  assert.equal(boss.shots.length, 0);
  assert.equal(boss.bolts.length, 0);
});

test("the root camera frames nearby tiers and leaves distant safe tiers alone", () => {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  api.loadLevel(levelIndex);
  const boss = api.S.boss;
  boss.state = "attack";
  boss.pips = 2;
  api.bossStartAttack(boss);
  const player = api.S.player;
  player.y = boss.arm.y + 52;
  assert.notEqual(api.rootCameraCenterY(player), null);
  player.y = api.ROOT_TIERS.ground.y;
  boss.arm.y = api.ROOT_TIERS.upper.y;
  assert.equal(api.rootCameraCenterY(player), null, "a harmless distant tier does not drag the camera away from the player");
});

test("desktop patch notes present a clickable title button", () => {
  const { api } = bootGame();
  api.S.mode = "title";
  api.g.operations.length = 0;
  api.draw();
  const label = api.g.operations.find(op => op.type === "fillText" && op.value.includes("PATCH NOTES"));
  assert.ok(label?.value.endsWith("CLICK"));

  api.canvas.dispatch("click", { clientX: 250, clientY: 118 });
  assert.equal(api.S.mode, "notes");
});

test("the active Chorus camera keeps both player and heart inside the frame", () => {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.boss === "chorus");
  api.loadLevel(levelIndex);
  const player = api.S.player;
  const boss = api.S.boss;
  const target = api.cameraTargetX(player);
  const playerScreenX = player.x + player.w / 2 - target;
  const bossScreenX = boss.x - target;

  assert.ok(playerScreenX >= 24 && playerScreenX <= 296);
  assert.ok(bossScreenX >= 24 && bossScreenX <= 296);
  assert.ok(Math.abs(playerScreenX + bossScreenX - 320) < 0.001, "the camera centers the two subjects");

  boss.state = "defeated";
  api.S.camLook = 18;
  assert.equal(api.cameraTargetX(player), player.x + player.w / 2 - 160 + 18);
});

test("the browser-test bridge exists locally and is absent on the deployed host", () => {
  const local = bootGame();
  assert.deepEqual({ ...local.context.__SPORELING_DEV__.snapshot() }, {
    mode: "title", level: 0, boss: null, rootTier: null, rootWarning: 0,
  });

  const deployed = bootGame({ hostname: "thoughtcrimegpt.github.io" });
  assert.equal(deployed.context.__SPORELING_DEV__, undefined);
});

test("local browser fixtures expose visual states without creating a production route", () => {
  const timedTitle = bootGame({ search: "?mode=timed" });
  assert.equal(timedTitle.api.runModePref, "speedrun");
  timedTitle.api.g.operations.length = 0;
  timedTitle.api.draw();
  assert.ok(timedTitle.api.g.operations.some(op => op.type === "fillText" && op.value === "TIMED RUN"));

  const hardTitle = bootGame({ search: "?difficulty=hard" });
  assert.equal(hardTitle.api.S.mode, "title");
  assert.equal(hardTitle.api.adventureDifficultyPref, "hard");
  assert.equal(hardTitle.api.S.maxHealth, 3);

  const opening = bootGame({ search: "?fixture=opening" });
  assert.equal(opening.api.S.mode, "play");
  assert.equal(opening.api.S.levelIdx, 0);
  assert.equal(opening.api.S.player.x, 15 * 16);
  assert.equal(opening.api.S.bloomLessonDone, false);

  const touch = bootGame({ search: "?fixture=opening&touch=1&hand=left" });
  assert.equal(touch.api.TOUCH.active, true);
  assert.equal(touch.element("touch").hidden, false);
  assert.equal(touch.element("touch").classList.contains("left-handed"), true);

  const hardOpening = bootGame({ search: "?fixture=opening&difficulty=hard" });
  assert.equal(hardOpening.api.S.maxHealth, 3);
  assert.equal(hardOpening.api.S.health, 3);
  assert.equal(hardOpening.api.S.berriesPerHeal, 16);

  const chorusIndex = hardTitle.api.LEVELS.findIndex(level => level.boss === "chorus");
  const chorusNotice = bootGame({ search: "?fixture=level-notice&level=" + chorusIndex });
  assert.equal(chorusNotice.api.S.levelIdx, chorusIndex);
  assert.ok(chorusNotice.api.S.hint, "a level-specific instruction is active after its title");

  const bloom = bootGame({ search: "?fixture=bloom" });
  assert.equal(bloom.api.S.blooms.length, 1);
  assert.ok(
    bloom.api.S.blooms[0].x + bloom.api.S.blooms[0].w / 2 > bloom.api.S.player.x + bloom.api.S.player.w / 2,
    "the visual fixture preserves the rightward bloom lead",
  );

  const checkpoint = bootGame({ search: "?fixture=checkpoint" });
  assert.equal(checkpoint.api.S.checkpoints[0].active, true);
  assert.match(checkpoint.api.S.hint.text, /restart here/i);

  const skitterIndex = hardTitle.api.LEVELS.findIndex(level => level.name === "THE SKITTERWAY");
  const skitterCheckpoint = bootGame({ search: "?fixture=checkpoint&level=" + skitterIndex + "&difficulty=normal" });
  assert.equal(skitterCheckpoint.api.S.levelIdx, skitterIndex);
  assert.equal(skitterCheckpoint.api.S.checkpoints[0].mercy, true);
  assert.equal(skitterCheckpoint.api.S.checkpoints[0].active, true);

  const swallowMercy = bootGame({ search: "?fixture=swallow-mercy&difficulty=normal" });
  assert.equal(swallowMercy.api.S.descentMercy.active, true);
  assert.deepEqual({ ...swallowMercy.api.S.checkPt }, { x: 8 * 16 + 3, y: 35 * 16 + 4 });
  assert.match(swallowMercy.api.S.hint.text, /shaft gets you/i);

  const dialogue = bootGame({ search: "?fixture=dialogue" });
  assert.equal(dialogue.api.S.talk.npc.name, "BARNABY");

  const jbDialogue = bootGame({ search: "?fixture=dialogue&npc=JB" });
  assert.equal(jbDialogue.api.S.talk.npc.name, "JB");
  assert.equal(jbDialogue.api.LEVELS[jbDialogue.api.S.levelIdx].name, "THE MARROW");

  const chorusOpen = bootGame({ search: "?fixture=chorus-open" });
  assert.equal(chorusOpen.api.S.boss.kind, "chorus");
  assert.equal(chorusOpen.api.S.boss.state, "gather");
  assert.match(chorusOpen.api.S.hint.text, /heart is glowing/i);

  const chorusDive = bootGame({ search: "?fixture=chorus-dive" });
  assert.equal(chorusDive.api.S.boss.kind, "chorus");
  assert.equal(chorusDive.api.S.boss.wisps.filter(wisp => wisp.mode === "dive").length, 3);

  for (const tier of ["ground", "mid", "upper"]) {
    const root = bootGame({ search: "?fixture=root-" + tier });
    assert.equal(root.api.S.mode, "play");
    assert.equal(root.api.S.boss.kind, "unbloomed");
    assert.equal(root.api.S.boss.arm.tier, tier);
    assert.equal(root.api.S.boss.arm.y, root.api.ROOT_TIERS[tier].y);
  }
  const later = bootGame({ search: "?fixture=root-upper-later" });
  assert.equal(later.api.S.boss.sweepHints, 3);

  const deployed = bootGame({
    hostname: "thoughtcrimegpt.github.io",
    search: "?fixture=root-upper&difficulty=hard&mode=timed",
  });
  assert.equal(deployed.api.S.mode, "title");
  assert.equal(deployed.api.S.levelIdx, 0);
  assert.equal(deployed.api.S.boss, null);
  assert.equal(deployed.api.adventureDifficultyPref, "normal", "DEV-only query options do not alter the deployed title");
  assert.equal(deployed.api.runModePref, "adventure", "the Timed Run fixture is local only");
});

test("DEV attempt metrics are bounded, minimal, session-only, and disabled when deployed", () => {
  const local = bootGame();
  local.api.S.mode = "play";
  local.api.S.score.time = 12.5;
  local.api.recordDevAttempt("the spikes", true);
  for (let i = 0; i < 45; i++) {
    local.api.S.score.time += 1;
    local.api.recordDevAttempt("restart");
  }
  const metrics = local.api.devMetricsSnapshot();
  assert.equal(metrics.deaths["the spikes"], 1);
  assert.equal(metrics.attempts.length, 40);
  assert.deepEqual(Object.keys(metrics.attempts[0]).sort(), ["level", "outcome", "seconds"]);
  assert.equal(local.storage.size, 0, "metrics do not persist to local storage");

  const deployed = bootGame({ hostname: "thoughtcrimegpt.github.io" });
  deployed.api.S.score.time = 20;
  deployed.api.recordDevAttempt("the spikes", true);
  assert.deepEqual({ ...deployed.api.devMetricsSnapshot().deaths }, {});
  assert.equal(deployed.api.devMetricsSnapshot().attempts.length, 0);
});

test("practice retries restore a fresh chamber without changing full-run resources", () => {
  const { api } = bootGame();
  const bossIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  api.loadLevel(bossIndex);
  api.S.practice = true;
  api.S.pracSel = bossIndex;
  api.S.health = 0;
  api.S.score.time = 37;
  api.S.boss.pips = 1;
  api.S.mode = "gameover";
  api.just.Space = true;

  api.tick(api.FIXED_DT);

  assert.equal(api.S.mode, "play");
  assert.equal(api.S.practice, true);
  assert.equal(api.S.levelIdx, bossIndex);
  assert.equal(api.S.health, api.S.maxHealth);
  assert.equal(api.S.score.time, 0);
  assert.equal(api.S.boss.pips, 3);
  api.S.bannerT = 0;
  api.updateNoticeQueue(0);
  assert.match(api.S.hint.text, /Practice restarted/);

  api.S.pracSel = 99;
  api.S.health = 1;
  api.restartCurrentChamber();
  assert.equal(api.S.boss.kind, "shoggoth");
  assert.equal(api.S.health, api.S.maxHealth);

  api.S.practice = false;
  api.S.health = 2;
  api.restartCurrentChamber();
  assert.equal(api.S.boss.kind, "unbloomed");
  assert.equal(api.S.health, 2, "full-run chamber restarts preserve current health");
});

test("direct Shoggoth practice starts and respawns inside the fight arena", () => {
  const { api } = bootGame();
  api.S.pracSel = 99;
  api.startPracticeRun(99);
  const boss = api.S.boss;
  const player = api.S.player;

  assert.equal(boss.kind, "shoggoth");
  assert.ok(Math.abs(player.x - boss.x) < 160, "practice starts near the boss");
  assert.deepEqual({ ...api.S.checkPt }, { x: player.x, y: player.y });
  assert.ok(boss.x - api.S.camX > 24 && boss.x - api.S.camX < 296, "the boss starts inside the camera");

  const practiceSpawn = { ...api.S.checkPt };
  player.x = 4 * 16 + 3;
  player.y = 20 * 16 + 4;
  api.respawn();
  assert.equal(player.x, practiceSpawn.x);
  assert.equal(player.y, practiceSpawn.y);
});

test("boss grace telegraphs preserve their configured readable windows", () => {
  const { api } = bootGame();

  const barrowIndex = api.LEVELS.findIndex(level => level.boss === "barrow");
  api.loadLevel(barrowIndex);
  api.S.player.invuln = 99;
  const barrow = api.S.boss;
  barrow.state = "telegraph";
  barrow.t = 0;
  barrow.mx = api.S.player.x + 5;
  api.updateBarrow(api.BARROW.TELEGRAPH * 1.45);
  assert.equal(barrow.state, "telegraph");
  api.updateBarrow(0.001);
  assert.equal(barrow.state, "arc");

  const chorusIndex = api.LEVELS.findIndex(level => level.boss === "chorus");
  api.loadLevel(chorusIndex);
  api.S.player.invuln = 99;
  const chorus = api.S.boss;
  api.updateChorus(0);
  const diver = chorus.wisps[0];
  diver.mode = "warn";
  diver.t = 0;
  chorus.state = "dives";
  chorus.t = 0;
  api.updateChorus(api.CHORUS.DIVE_WARN * 1.45);
  assert.equal(diver.mode, "warn");
  api.updateChorus(0.001);
  assert.equal(diver.mode, "dive");

  chorus.state = "gather";
  chorus.t = 0;
  for (const wisp of chorus.wisps) wisp.mode = "gathered";
  api.updateChorus(api.CHORUS.GATHER[0] * 1.45);
  assert.equal(chorus.state, "gather");
  api.updateChorus(0.001);
  assert.equal(chorus.state, "orbit");

  const unbloomedIndex = api.LEVELS.findIndex(level => level.boss === "unbloomed");
  api.loadLevel(unbloomedIndex);
  api.spawnShoggoth();
  api.S.player.invuln = 99;
  const shoggoth = api.S.boss;
  shoggoth.state = "lungeWarn";
  shoggoth.t = 0;
  api.updateShoggoth(api.SHOG.LUNGE_WARN[0] * 1.45);
  assert.equal(shoggoth.state, "lungeWarn");
  api.updateShoggoth(0.001);
  assert.equal(shoggoth.state, "lunge");
});

test("Chorus Hall names the glowing opening and sends diving wisps farther", () => {
  const { api } = bootGame();
  const chorusIndex = api.LEVELS.findIndex(level => level.boss === "chorus");
  api.loadLevel(chorusIndex);
  api.S.player.invuln = 99;
  const chorus = api.S.boss;
  api.updateChorus(0);

  chorus.state = "intro";
  chorus.t = 2;
  api.updateChorus(0.001);
  api.S.bannerT = 0;
  api.updateNoticeQueue(0);
  assert.equal(api.S.hint.text, "Dodge the diving wisps until the heart gathers them back.");
  assert.match(api.LEVELS[chorusIndex].unlockText, /diving wisps/i);

  chorus.state = "dives";
  chorus.t = 2.2;
  api.updateChorus(0.001);
  api.updateNoticeQueue(0);
  assert.equal(chorus.state, "gather");
  assert.equal(api.S.hint.text, "The heart is glowing. Dash straight through it.");

  const diver = chorus.wisps[0];
  chorus.state = "dives";
  chorus.t = 0;
  Object.assign(diver, {
    mode: "dive", t: 0, x: 100, y: 100,
    vx: api.CHORUS.DIVE_V, vy: 0, dead: false,
  });
  Object.assign(api.S.player, { x: 500, y: 180, invuln: 99 });
  const startX = diver.x;
  api.updateChorus(0.75);
  assert.equal(diver.mode, "dive");
  assert.ok(diver.x - startX > api.CHORUS.DIVE_V * 0.7, "the dive reaches beyond its old limit");
  api.updateChorus(api.CHORUS.DIVE_TIME - 0.75 + 0.001);
  assert.equal(diver.mode, "return");
});

test("long browser stalls cannot fast-forward through collisions", () => {
  const { api } = bootGame();
  const rows = Array(8).fill("............");
  rows[6] = "############";
  api.setTestMap(rows);
  api.S.mode = "play";
  api.S.score.time = 0;
  Object.assign(api.S.player, { x: 32, y: 86, vx: 0, vy: 0, grounded: true });
  api.keys.KeyD = true;

  api.frame(5000);

  assert.ok(api.S.score.time <= api.MAX_FRAME_DT + 1e-9);
  assert.ok(api.S.player.x < 40, "the player advances only a few fixed steps after a stall");
});

test("collision forgiveness has exact ledge, corner, and one-way boundaries", () => {
  const { api } = bootGame();
  const empty = Array(8).fill("........");
  const ledgeMap = empty.slice();
  ledgeMap[3] = "....#...";
  api.setTestMap(ledgeMap);
  const player = api.S.player;

  Object.assign(player, { x: 51, y: 42, vx: 80, vy: 0, grounded: false });
  api.moveAxis(player, 4, 0);
  assert.equal(player.y, 38, "a four-pixel ledge clip steps up");
  assert.equal(player.vx, 80);

  Object.assign(player, { x: 51, y: 44, vx: 80, vy: 0, grounded: false });
  api.moveAxis(player, 4, 0);
  assert.equal(player.x, 54, "a six-pixel ledge blocks horizontal motion");
  assert.equal(player.y, 44);
  assert.equal(player.vx, 0);

  const ceilingMap = empty.slice();
  ceilingMap[2] = "....#...";
  api.setTestMap(ceilingMap);
  Object.assign(player, { x: 55, y: 48, vx: 0, vy: -100, grounded: false });
  api.moveAxis(player, 0, -7);
  assert.equal(player.x, 54, "a one-pixel ceiling corner nudges sideways");
  assert.equal(player.y, 41);
  assert.equal(player.vy, -100, "corner forgiveness preserves upward momentum");

  api.setTestMap(empty);
  api.S.blooms = [{ x: 48, y: 64, w: 24, h: 8, life: 1, age: 0 }];
  Object.assign(player, { x: 52, y: 72, vx: 0, vy: -120, canDash: false, spores: 0, grounded: false });
  api.moveAxis(player, 0, -12);
  assert.equal(player.y, 60, "the player passes upward through a bloom");

  Object.assign(player, { x: 52, y: 50, vx: 0, vy: 120, canDash: false, spores: 0, grounded: false });
  api.moveAxis(player, 0, 8);
  assert.equal(player.y, 54, "the same bloom catches a fall from above");
  assert.equal(player.canDash, false, "a bloom does not refill dash");
  assert.equal(player.spores, 0, "a bloom does not refill spores");

  api.S.blooms = [];
  api.S.movers = [{ x: 48, y: 64, w: 24, h: 8 }];
  Object.assign(player, { x: 52, y: 50, vx: 0, vy: 120, canDash: false, spores: 0, grounded: false });
  api.moveAxis(player, 0, 8);
  assert.equal(player.y, 54);
  assert.equal(player.canDash, true, "a real moving shelf refills dash");
  assert.equal(player.spores, api.MAX_SPORES, "a real moving shelf refills spores");
});

test("air-dash blooms use a restrained mirrored momentum lead", () => {
  const { api } = bootGame();
  api.setTestMap(Array(8).fill("...................."));
  const p = api.S.player;
  Object.assign(p, { x: 100, y: 40, w: 10, h: 10, vx: 0 });

  const neutral = api.bloomPlacement(p);
  assert.equal(neutral.x, 93, "neutral speed centers the 24px bloom under the 10px player");
  assert.equal(neutral.y, 50);

  p.vx = 40;
  const lowRight = api.bloomPlacement(p);
  assert.equal(lowRight.x, 95, "low momentum creates only a small lead");
  p.vx = -40;
  const lowLeft = api.bloomPlacement(p);
  assert.equal(lowLeft.x, 91, "left movement mirrors the low-speed lead");

  p.vx = 500;
  const highRight = api.bloomPlacement(p);
  p.vx = -500;
  const highLeft = api.bloomPlacement(p);
  assert.equal(highRight.x, 98, "right lead is capped at five pixels");
  assert.equal(highLeft.x, 88, "left lead is capped and mirrored");
  for (const place of [neutral, lowRight, lowLeft, highRight, highLeft]) {
    assert.ok(place.x < p.x + p.w && place.x + 24 > p.x, "every predicted bloom still catches the player");
  }
});

test("bloom placement backs away from walls but ignores one-way shelves", () => {
  const { api } = bootGame();
  const wallMap = Array(8).fill("............");
  wallMap[3] = "....#.......";
  api.setTestMap(wallMap);
  const p = api.S.player;
  Object.assign(p, { x: 52, y: 40, w: 10, h: 10, vx: 500 });
  const besideWall = api.bloomPlacement(p);
  assert.equal(besideWall.x, 40, "the bloom fits flush beside the wall");
  assert.equal(api.solidBlocked(besideWall.x, besideWall.y, 24, 8), false);
  assert.ok(besideWall.x + 24 > p.x, "wall correction keeps the player over the cap");

  api.setTestMap(Array(8).fill("............"));
  api.S.movers = [{ x: 40, y: 50, w: 90, h: 8 }];
  Object.assign(p, { x: 52, y: 40, vx: 0 });
  assert.equal(api.bloomPlacement(p).x, 45, "one-way shelves do not displace a centered bloom");
});

test("the opening lesson names the active controls and precedes a safe mandatory pit", () => {
  const keyboard = bootGame();
  assert.deepEqual([...keyboard.api.openingLessonLines()], [
    "SPACE: JUMP   SHIFT: AIR DASH",
    "Air-dash now. The bloom will catch you.",
  ]);

  const controller = bootGame();
  controller.context.navigator.getGamepads = () => [{
    connected: true,
    axes: [0, 0],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false })),
  }];
  assert.equal(controller.api.openingLessonLines()[0], "A: JUMP   X: AIR DASH");

  const touch = bootGame();
  touch.api.TOUCH.active = true;
  assert.equal(touch.api.openingLessonLines()[0], "A BUTTON: JUMP   X BUTTON: AIR DASH");

  const opening = keyboard.api.LEVELS[0].map;
  for (let c = 22; c <= 24; c++) {
    assert.equal(opening[13][c], "#", "the first gap has a safe floor");
    assert.notEqual(opening[12][c], "S", "the teaching pit has no spikes");
  }
  assert.ok(opening[12].slice(54, 63).includes("S"), "the dangerous bloom test comes later");

  keyboard.api.S.mode = "play";
  keyboard.api.S.levelIdx = 0;
  keyboard.api.S.player.x = 15 * 16;
  keyboard.api.S.bloomLessonDone = false;
  keyboard.api.S.bannerT = 0;
  keyboard.api.g.operations.length = 0;
  keyboard.api.draw();
  assert.ok(keyboard.api.g.operations.some(op => op.type === "fillText" && op.value === "Air-dash now. The bloom will catch you."));
  keyboard.api.spawnBloom(keyboard.api.S.player);
  assert.equal(keyboard.api.S.bloomLessonDone, true, "the lesson retires after the player creates a bloom");
});

test("dialogue stays readable and every resident has a concrete voice", () => {
  const { api } = bootGame();
  const residents = api.LEVELS.flatMap(level => level.npcs || []);
  const dialogue = residents.flatMap(npc => npc.lines.map(line => ({ name: npc.name, line })));

  for (const { name, line } of dialogue) {
    assert.ok(line.length <= 112, `${name} has a dialogue line too long for its two-line box: ${line}`);
    assert.equal(line.includes("—"), false, `${name} uses a setup/payoff em dash: ${line}`);
  }

  const voice = name => residents.find(npc => npc.name === name).lines.join(" ");
  assert.match(voice("BARNABY"), /three seasons|I didn't tell you/);
  assert.match(voice("COMMANTHA"), /journal|M\.H\./);
  assert.match(voice("THE TWINS"), /Don't listen to her tone/);
  assert.match(voice("THE CARTOGRAPHER"), /forty-two|back of the page/);
  assert.match(voice("GRANNY MOREL"), /dear|berry/);
  assert.match(voice("THE ECHO"), /wisps|stay out of your way/);
  assert.match(voice("GREL"), /view|counting/);
  assert.match(voice("JB"), /bridge pins|Mother Bloom's voice|shows you an eye/);

  const marrow = api.LEVELS.find(level => level.name === "THE MARROW");
  const jb = marrow.npcs.find(npc => npc.name === "JB");
  assert.deepEqual([jb.c, jb.r, jb.sprite], [50, 7, "jb"], "JB waits on The Marrow's safe high ledge");
});

test("dialogue lines can be finished and advanced by keyboard, controller, or tap", () => {
  const { api, context, element } = bootGame({ search: "?fixture=dialogue" });
  const talk = api.S.talk;
  const first = talk.npc.lines[0];
  talk.t = 0;

  api.just.KeyE = true;
  const keyInput = api.readInput();
  assert.equal(keyInput.talkEdge, true);
  assert.equal(keyInput.jumpEdge, false, "the dialogue key does not trigger a jump");
  api.tick(api.FIXED_DT);
  assert.equal(talk.line, 0);
  assert.ok(talk.t >= first.length * 0.035, "the first press reveals the full current line");

  api.just.Enter = true;
  api.tick(api.FIXED_DT);
  assert.equal(talk.line, 1, "the next press advances to the next line");

  talk.t = 0;
  const box = api.talkLayout();
  element("game").dispatch("click", { clientX: box.x + 2, clientY: box.y + 2 });
  assert.ok(talk.t >= talk.npc.lines[1].length * 0.035, "tapping the dialogue box reveals the line");

  const npcX = talk.npc.x - api.S.camX + 2;
  const npcY = talk.npc.y - api.S.camY + 2;
  element("game").dispatch("click", { clientX: npcX, clientY: npcY });
  assert.equal(talk.line, 2, "tapping the speaker advances to the next line");

  api.TOUCH.active = true;
  context.innerWidth = 844;
  context.innerHeight = 390;
  talk.t = talk.npc.lines[talk.line].length * 0.035;
  const compactBox = api.talkLayout();
  assert.equal(compactBox.compactTouch, true);
  assert.ok(compactBox.x >= 40 && compactBox.x + compactBox.w <= 270,
    "landscape dialogue stays between the touch-control clusters");
  api.g.operations.length = 0;
  api.draw();
  assert.ok(api.g.operations.some(op => op.type === "fillText" && op.value === "TAP: NEXT"));
  const compactLines = api.g.operations.filter(op =>
    op.type === "fillText" && op.x === compactBox.x + 6 &&
    op.y >= compactBox.y + 22 && op.y <= compactBox.y + 42);
  assert.equal(compactLines.length, 3, "landscape touch dialogue can use a third line");
  assert.equal(compactLines.map(op => op.value).join(" "), talk.npc.lines[talk.line]);

  const padButtons = Array.from({ length: 16 }, () => ({ pressed: false }));
  padButtons[3] = { pressed: true };
  context.navigator.getGamepads = () => [{ connected: true, axes: [0, 0], buttons: padButtons }];
  api.padPrev.y = false;
  const padInput = api.readInput();
  assert.equal(padInput.talkEdge, true, "controller Y advances dialogue");
  assert.equal(padInput.jumpEdge, false, "controller Y does not trigger a jump");
});

test("core instructions use plain sentences instead of the old slogan copy", () => {
  assert.equal(html.includes("Dash in the air — a bloom sprouts"), false);
  assert.equal(html.includes("AIR DASH SPROUTS A BLOOM BELOW YOU"), false);
  assert.equal(html.includes("The roots remember your name"), false);
  assert.equal(html.includes("not malice. It's loneliness"), false);

  const { api } = bootGame();
  api.S.mode = "play";
  api.S.bannerT = 0;
  api.resetNotices();
  api.queueNotice("This hint uses an ordinary sentence that needs a second line to remain readable.", 2);
  api.updateNoticeQueue(0);
  api.g.operations.length = 0;
  api.draw();
  const hintLines = api.g.operations.filter(op => op.type === "fillText" && op.x === 160 && op.y >= 47 && op.y <= 56);
  assert.equal(hintLines.length, 2, "long hints wrap instead of being compressed into slogan fragments");
  assert.equal(hintLines.map(op => op.value).join(" "), api.S.hint.text);
});

test("the visible patch history uses plain factual copy", () => {
  const { api } = bootGame();
  assert.match(api.PATCH_NOTES[0].v, /^V4\.4/);
  for (const block of api.PATCH_NOTES) {
    assert.equal(block.v.includes("—"), false, `patch title uses an em-dash slogan: ${block.v}`);
    for (const line of block.lines) {
      assert.equal(line.includes("—"), false, `patch note uses an em-dash hinge: ${line}`);
      assert.doesNotMatch(line, /\bnot\b.+\bbut\b/i);
    }
  }
});

test("a scripted movement sequence replays to the same physics state", () => {
  const run = api => {
    const rows = Array(8).fill("............");
    rows[6] = "############";
    api.setTestMap(rows);
    api.S.mode = "play";
    api.S.levelIdx = 0;
    api.S.score.time = 0;
    api.S.rec = [];
    Object.assign(api.S.player, {
      x: 32, y: 86, vx: 0, vy: 0, facing: 1, grounded: true,
      coyote: 0, jumpBuf: 0, dashBuf: 0, canDash: true,
      spores: api.MAX_SPORES, chainN: 0, dashing: false, dashT: 0,
    });

    for (let frame = 0; frame < 72; frame++) {
      api.keys.KeyD = frame < 42;
      api.keys.KeyA = frame >= 42 && frame < 64;
      api.keys.Space = frame >= 5 && frame < 14;
      if (frame === 5) api.just.Space = true;
      if (frame === 25) api.just.ShiftLeft = true;
      api.tick(api.FIXED_DT);
    }
    const p = api.S.player;
    return {
      x: p.x, y: p.y, vx: p.vx, vy: p.vy, facing: p.facing,
      grounded: p.grounded, dashing: p.dashing, canDash: p.canDash,
      spores: p.spores, mode: api.S.mode,
    };
  };

  assert.deepEqual(run(bootGame().api), run(bootGame().api));
});

test("touch-size canvas stays inside portrait and landscape viewports", () => {
  const { api, context } = bootGame();
  api.TOUCH.active = true;
  for (const [width, height] of [[390, 844], [844, 390]]) {
    context.innerWidth = width;
    context.innerHeight = height;
    api.resize();
    assert.ok(Number.parseFloat(api.canvas.style.width) <= width);
    assert.ok(Number.parseFloat(api.canvas.style.height) <= height);
    assert.ok(Math.abs(api.canvas.width / api.canvas.height - 16 / 9) < 0.01);
  }
});
