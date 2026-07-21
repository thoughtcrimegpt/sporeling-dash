import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
export const html = readFileSync(join(root, "index.html"), "utf8");
export const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);

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

export function bootGame({
  hostname = "127.0.0.1",
  protocol = "http:",
  search = "",
  initialStorage = {},
  seed = 0x5d4a51,
} = {}) {
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
  let randomState = seed >>> 0;
  const harnessMath = Object.create(Math);
  harnessMath.random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };
  const context = {
    Math: harnessMath,
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
  MAIN_LAST_INDEX, UNDRAWN_INDEX, PALE_ROOT_INDEX, PRESSED_GARDEN_INDEX, REACH_INDEX,
  KEEPSAKE_IDS, TOTAL_KEEPSAKES,
  FIXED_DT, MAX_FRAME_DT, MAX_SPORES, START_HEALTH, MAX_HEALTH,
  ADVENTURE_DIFFICULTIES, ADVENTURE_RULES, TIMED_RUN_RULES, NOTICE_PRIORITY,
  keys, just, TOUCH, touchPrev, padPrev,
  canvas, handleFocusLoss, handleFocusReturn, loadLevel, pauseIds, titleIds, readInput,
  activateTitleItem, activatePauseItem, activateWinItem, startTitleRun, startDaily, startReach, setRunModePref, cycleGhostPref, competitiveRun, applyDevFixture,
  dailyUnlocked, rootCleared, reachCleared, stepAdventureLevel, adventureLevelName, cycleAdventureDifficulty, configureRunRules,
  queueNotice, resetNotices, updateNoticeQueue, noticeBlocked, rootWarningActive, openingLessonNeeded,
  advanceTalk, talkHitAt, talkLayout,
  chamberClear, submitScore, mainFullEligible, checkpointEligible, checkpointPathClear, activateCheckpoint, enterSecret, exitSecret,
  gainHealth, hurtPlayer, killPlayer,
  bloomPlacement, spawnBloom, openingLessonLines,
  bossStartAttack, bossLanded, nextRootTier, cameraTargetX, rootCameraCenterY,
  draw, drawBossWarnings, frame, g, moveAxis, resize, respawn,
  restartCurrentChamber, solidBlocked, spawnShoggoth, startPracticeRun, tick, touchingWallDir,
  devMetricsSnapshot, recordDevAttempt, toggleReducedMotion, toggleTouchHand, syncTouchVisibility, touchPulse,
  updateBarrow, updateBoss, updateChorus, updateShoggoth,
  prepareRouteProbe(index, includeEnemies = false) {
    loadLevel(index);
    S.mode = "play";
    S.bannerT = 0;
    S.hint = null;
    S.talk = null;
    S.berryList = [];
    S.checkpoints = [];
    if (!includeEnemies) S.enemies = [];
    S.eshots = [];
    S.npcs = [];
    S.fallen = [];
    S.particles = [];
    S.trail = [];
    S.rec = [];
    S.ghost = null;
    S.ghostPos = null;
    S.boss = null;
    S.player.invuln = 0;
    releaseTransientInput();
  },
  captureRouteState() {
    const snap = JSON.parse(JSON.stringify(S));
    snap.particles = [];
    snap.trail = [];
    snap.rec = [];
    return JSON.stringify(snap);
  },
  restoreRouteState(raw) {
    const snap = JSON.parse(raw);
    for (const key of Object.keys(S)) delete S[key];
    Object.assign(S, snap);
    releaseTransientInput();
  },
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
  get TITLE_HITS() { return TITLE_HITS; },
  get PAUSE_HITS() { return PAUSE_HITS; },
  get WIN_HITS() { return WIN_HITS; },
  get WORLD_H() { return WORLD_H; },
  get WORLD_W() { return WORLD_W; },
};
requestAnimationFrame(frame);
})();`);
  vm.runInNewContext(source, context);
  return { api: context.__SD_TEST__, context, document, documentEvents, element, events, storage };
}
