import { bootGame } from "./game-harness.mjs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ACTIONS = [
  { name: "coast", x: 0, y: 0, frames: 6 },
  { name: "left", x: -1, y: 0, frames: 6 },
  { name: "right", x: 1, y: 0, frames: 6 },
  { name: "jump", x: 0, y: 0, jump: true, holdJump: true, frames: 6 },
  { name: "jump-left", x: -1, y: 0, jump: true, holdJump: true, frames: 6 },
  { name: "jump-right", x: 1, y: 0, jump: true, holdJump: true, frames: 6 },
  { name: "glide", x: 0, y: 0, holdJump: true, frames: 6 },
  { name: "glide-left", x: -1, y: 0, holdJump: true, frames: 6 },
  { name: "glide-right", x: 1, y: 0, holdJump: true, frames: 6 },
  { name: "dash-left", x: -1, y: 0, dash: true, frames: 6 },
  { name: "dash-right", x: 1, y: 0, dash: true, frames: 6 },
  { name: "dash-up", x: 0, y: -1, dash: true, frames: 6 },
  { name: "dash-up-left", x: -1, y: -1, dash: true, frames: 6 },
  { name: "dash-up-right", x: 1, y: -1, dash: true, frames: 6 },
  { name: "dash-down", x: 0, y: 1, dash: true, frames: 6 },
  { name: "dash-down-left", x: -1, y: 1, dash: true, frames: 6 },
  { name: "dash-down-right", x: 1, y: 1, dash: true, frames: 6 },
  { name: "micro-coast", x: 0, y: 0, frames: 3 },
  { name: "micro-left", x: -1, y: 0, frames: 3 },
  { name: "micro-right", x: 1, y: 0, frames: 3 },
  { name: "micro-jump-left", x: -1, y: 0, jump: true, holdJump: true, frames: 3 },
  { name: "micro-jump-right", x: 1, y: 0, jump: true, holdJump: true, frames: 3 },
];
const BASE_ACTION_COUNT = 17;

const ROUTE_WAYPOINTS = {
  "THE BLOOMHEART": [
    { name: "main shelf gap", x: 40 * 16, y: 15 * 16 - 10, rx: 112 },
    { name: "right ascent", x: 35 * 16, y: 10 * 16 - 10, rx: 100 },
    { name: "upper gate", x: 33 * 16, y: 8 * 16 - 10, rx: 88 },
    { name: "goal shelf", x: 16 * 16, y: 2 * 16 - 10, rx: 112 },
  ],
  "THE SWALLOW": [
    { name: "first fall right", x: 20 * 16, y: 12 * 16, rx: 82, down: true },
    { name: "second fall left", x: 6 * 16, y: 22 * 16, rx: 82, down: true },
    { name: "third fall right", x: 20 * 16, y: 31 * 16, rx: 82, down: true },
    { name: "fourth fall left", x: 6 * 16, y: 40 * 16, rx: 82, down: true },
    { name: "fifth fall right", x: 22 * 16, y: 48 * 16, rx: 82, down: true },
    { name: "last gap right", x: 22 * 16, y: 55 * 16, rx: 82, down: true },
    { name: "goal chute", x: 23 * 16, y: 62 * 16, rx: 72, down: true },
  ],
  "THE PALE ROOT": [
    { name: "steps", x: 22 * 16, y: 187 * 16 - 10, rx: 46 },
    { name: "first chimney exit", x: 15 * 16, y: 155 * 16 - 10, rx: 52 },
    { name: "first ladder start", x: 4 * 16, y: 152 * 16 - 10, rx: 58 },
    { name: "first ladder breath", x: 12.5 * 16, y: 142 * 16 - 10, rx: 64 },
    { name: "first landing", x: 21 * 16, y: 132 * 16 - 10, rx: 58 },
    { name: "crossing", x: 3 * 16, y: 120 * 16 - 10, rx: 58 },
    { name: "first mercy", x: 3 * 16, y: 116 * 16 - 10, rx: 58 },
    { name: "thread high island", x: 12.5 * 16, y: 103 * 16 - 10, rx: 64 },
    { name: "thread exit", x: 3 * 16, y: 94 * 16 - 10, rx: 58 },
    { name: "teeth gate right", x: 22.5 * 16, y: 84 * 16 - 10, rx: 48 },
    { name: "teeth split", x: 12 * 16, y: 79 * 16 - 10, rx: 96 },
    { name: "second chimney exit", x: 6 * 16, y: 56 * 16 - 10, rx: 70 },
    { name: "second mercy", x: 4 * 16, y: 56 * 16 - 10, rx: 58 },
    { name: "second ladder breath", x: 12.5 * 16, y: 46 * 16 - 10, rx: 64 },
    { name: "second landing", x: 21 * 16, y: 36 * 16 - 10, rx: 58 },
    { name: "crown movers", x: 6 * 16, y: 22 * 16 - 10, rx: 92 },
    { name: "last weave", x: 12 * 16, y: 14 * 16 - 10, rx: 72 },
    { name: "crown", x: 21 * 16, y: 8 * 16 - 10, rx: 64 },
  ],
  "THE REACH": [
    { name: "step-off fuel", x: 20 * 16, y: 141 * 16 - 10, rx: 64 },
    { name: "first span", x: 59 * 16, y: 142 * 16 - 10, rx: 74 },
    { name: "spire base", x: 60 * 16, y: 133 * 16 - 10, rx: 72 },
    { name: "spire lower", x: 59 * 16, y: 127 * 16 - 10, rx: 72 },
    { name: "spire middle", x: 60 * 16, y: 121 * 16 - 10, rx: 72 },
    { name: "spire upper", x: 59 * 16, y: 115 * 16 - 10, rx: 72 },
    { name: "spire crown", x: 59 * 16, y: 102 * 16 - 10, rx: 82 },
    { name: "gale entry", x: 49 * 16, y: 88 * 16 - 10, rx: 76 },
    { name: "gale island", x: 31 * 16, y: 91 * 16 - 10, rx: 70 },
    { name: "gale far lane", x: 13 * 16, y: 86 * 16 - 10, rx: 78 },
    { name: "gale turn", x: 10 * 16, y: 79 * 16 - 10, rx: 70 },
    { name: "first return island", x: 21 * 16, y: 73 * 16 - 10, rx: 78 },
    { name: "return middle", x: 34 * 16, y: 66 * 16 - 10, rx: 82 },
    { name: "second return island", x: 40 * 16, y: 64 * 16 - 10, rx: 72 },
    { name: "return top", x: 47 * 16, y: 61 * 16 - 10, rx: 82 },
    { name: "gale checkpoint", x: 55 * 16, y: 57 * 16 - 10, rx: 118 },
    { name: "last reach entry", x: 53 * 16, y: 52 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "last reach turn", x: 44 * 16, y: 46 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "last reach walls", x: 31 * 16, y: 41 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "left wall", x: 22 * 16, y: 36 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "upper left", x: 14 * 16, y: 31 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "upper turn", x: 23 * 16, y: 26 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "upper chain", x: 33 * 16, y: 22 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "last enemy", x: 43 * 16, y: 18 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "upper island", x: 49 * 16, y: 15 * 16 - 10, rx: 60 },
    { name: "upper right", x: 54 * 16, y: 12 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "upper cross", x: 47 * 16, y: 9 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "crown connector", x: 56 * 16, y: 6 * 16 - 10, rx: 68, clearRadius: 44 },
    { name: "crown", x: 59 * 16, y: 3 * 16 - 10, rx: 64 },
  ],
};

function press(api, action) {
  if (action.x < 0) api.keys.KeyA = true;
  if (action.x > 0) api.keys.KeyD = true;
  if (action.y < 0) api.keys.KeyW = true;
  if (action.y > 0) api.keys.KeyS = true;
  if (action.holdJump) api.keys.Space = true;
  if (action.jump) api.just.Space = true;
  if (action.dash) api.just.ShiftLeft = true;
}

function advance(api, raw, action) {
  api.restoreRouteState(raw);
  press(api, action);
  for (let i = 0; i < action.frames; i++) {
    api.tick(api.FIXED_DT);
    if (api.S.mode !== "play") break;
  }
  return api.captureRouteState();
}

function stateKey(s) {
  const p = s.player;
  const blooms = (s.blooms || []).map(b =>
    `${Math.round(b.x / 8)},${Math.round(b.y / 8)},${Math.round(b.life * 4)}`).join(";");
  return [
    Math.round(p.x / 4), Math.round(p.y / 4),
    Math.round(p.vx / 30), Math.round(p.vy / 30),
    p.grounded ? 1 : 0, p.canDash ? 1 : 0, p.spores,
    p.dashing ? 1 : 0, Math.round((p.grip || 0) * 4), blooms,
  ].join("|");
}

function reachedWaypoint(s, waypoint) {
  const p = s.player;
  const verticalReached = waypoint.down ? p.y >= waypoint.y - 22 : p.y <= waypoint.y + 22;
  const horizontalReached = Math.abs(p.x + p.w / 2 - waypoint.x) <= waypoint.rx;
  if (!verticalReached || !horizontalReached) return false;
  if (waypoint.clearRadius && (s.enemies || []).some(e =>
    !e.dead && Math.hypot(e.x + e.w / 2 - waypoint.x, e.y + e.h / 2 - waypoint.y) <= waypoint.clearRadius)) return false;
  return true;
}

function advanceWaypoint(s, waypoints, start) {
  let index = start;
  while (index < waypoints.length && reachedWaypoint(s, waypoints[index])) index++;
  return index;
}

function rank(s, goal, waypoints, waypointIndex, goalDown, profile) {
  const p = s.player;
  const target = waypoints[waypointIndex]
    || { x: goal.x + goal.w / 2, y: goal.y, rx: 0, down: goalDown };
  const delta = p.y - target.y;
  const vertical = target.down
    ? Math.abs(delta)
    : (delta >= 0 ? delta : -delta * profile.overshootWeight);
  const horizontal = Math.abs(p.x + p.w / 2 - target.x);
  return -waypointIndex * 10000 + vertical + horizontal * profile.horizontalWeight;
}

function diversityKey(s, waypointIndex) {
  const p = s.player;
  return [
    Math.floor(p.x / 24), Math.floor(p.y / 24), Math.sign(p.vy),
    p.grounded ? 1 : 0, p.canDash ? 1 : 0, p.spores, waypointIndex,
  ].join("|");
}

export function probeRoute(levelName, {
  beamWidth = 120,
  maxSteps = 700,
  startActions = [],
  start = null,
  waypoints: waypointOverride = null,
  finishAtLastWaypoint = false,
} = {}) {
  const startedAt = Date.now();
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.name === levelName);
  if (levelIndex < 0) throw new Error(`Unknown level: ${levelName}`);
  const level = api.LEVELS[levelIndex];
  if (level.boss || level.secret || !level.map.join("").includes("G"))
    throw new Error(`${levelName} does not use a normal goal route`);

  api.prepareRouteProbe(levelIndex, level.trial === "reach");
  if (start) {
    Object.assign(api.S.player, {
      x: start.x, y: start.y, vx: 0, vy: 0, grounded: false,
      dashing: false, canDash: true, spores: api.MAX_SPORES, chainN: 0, invuln: 0,
    });
  }
  let initialRaw = api.captureRouteState();
  let initial = JSON.parse(initialRaw);
  const waypoints = waypointOverride || ROUTE_WAYPOINTS[levelName] || [];
  let initialWaypoint = advanceWaypoint(initial, waypoints, 0);
  for (let step = 0; step < startActions.length; step++) {
    const actionIndex = startActions[step];
    if (!Number.isInteger(actionIndex) || !ACTIONS[actionIndex])
      throw new Error(`Invalid starting action ${actionIndex} at step ${step}`);
    initialRaw = advance(api, initialRaw, ACTIONS[actionIndex]);
    initial = JSON.parse(initialRaw);
    if (initial.mode !== "play")
      throw new Error(`Starting route stopped in ${initial.mode} at step ${step + 1}`);
    initialWaypoint = advanceWaypoint(initial, waypoints, initialWaypoint);
  }
  const goal = initial.goal;
  const goalDown = initial.player.y < goal.y;
  const profile = levelName === "THE PALE ROOT" || levelName === "THE REACH"
    ? { overshootWeight: 0, horizontalWeight: 0.22 }
    : { overshootWeight: 0.15, horizontalWeight: 0.55 };
  let beam = [{ raw: initialRaw, state: initial, path: [...startActions], waypoint: initialWaypoint }];
  let best = beam[0];
  let expanded = 0;

  for (let step = 0; step < maxSteps; step++) {
    const unique = new Map();
    for (const node of beam) {
      const actionCount = node.waypoint >= 9 ? ACTIONS.length : BASE_ACTION_COUNT;
      for (let actionIndex = 0; actionIndex < actionCount; actionIndex++) {
        const raw = advance(api, node.raw, ACTIONS[actionIndex]);
        const state = JSON.parse(raw);
        expanded++;
        if (state.mode === "clear") {
          return {
            ok: true, level: levelName, steps: step + 1, expanded,
            seconds: state.score.time, actions: [...node.path, actionIndex],
            elapsedMs: Date.now() - startedAt,
          };
        }
        if (state.mode !== "play") continue;
        if (state.player.y > api.WORLD_H + 16) continue;
        const waypoint = advanceWaypoint(state, waypoints, node.waypoint);
        if (finishAtLastWaypoint && waypoint >= waypoints.length) {
          return {
            ok: true, level: levelName, steps: step + 1, expanded,
            seconds: state.score.time, actions: [...node.path, actionIndex],
            elapsedMs: Date.now() - startedAt,
          };
        }
        const candidate = { raw, state, path: [...node.path, actionIndex], waypoint };
        if (rank(state, goal, waypoints, waypoint, goalDown, profile) < rank(best.state, goal, waypoints, best.waypoint, goalDown, profile)) best = candidate;
        const key = `${waypoint}|${stateKey(state)}`;
        const prior = unique.get(key);
        if (!prior || rank(state, goal, waypoints, waypoint, goalDown, profile) < rank(prior.state, goal, waypoints, prior.waypoint, goalDown, profile))
          unique.set(key, candidate);
      }
    }

    const sorted = [...unique.values()].sort((a, b) =>
      rank(a.state, goal, waypoints, a.waypoint, goalDown, profile) - rank(b.state, goal, waypoints, b.waypoint, goalDown, profile));
    const diversity = new Map();
    beam = [];
    for (const candidate of sorted) {
      const key = diversityKey(candidate.state, candidate.waypoint);
      const count = diversity.get(key) || 0;
      if (count >= 2) continue;
      diversity.set(key, count + 1);
      beam.push(candidate);
      if (beam.length >= beamWidth) break;
    }
    if (!beam.length) break;
  }

  return {
    ok: false, level: levelName, expanded,
    bestWaypoint: best.waypoint,
    nextWaypoint: waypoints[best.waypoint]?.name || null,
    bestX: Math.round(best.state.player.x * 10) / 10,
    bestY: Math.round(best.state.player.y * 10) / 10,
    goalY: goal.y,
    actions: best.path,
    elapsedMs: Date.now() - startedAt,
  };
}

export function probeReachChunk(chunk, options = {}) {
  const T = 16;
  const chunks = [
    {
      start: null,
      waypoints: [
        { name: "step-off fuel", x: 20 * T, y: 141 * T - 10, rx: 64 },
        { name: "first span checkpoint", x: 59 * T, y: 142 * T - 10, rx: 74 },
      ],
    },
    {
      start: { x: 59 * T + 3, y: 141 * T + 4 },
      waypoints: [
        { name: "spire base", x: 60 * T, y: 133 * T - 10, rx: 72 },
        { name: "spire lower", x: 59 * T, y: 127 * T - 10, rx: 72 },
        { name: "spire middle", x: 60 * T, y: 121 * T - 10, rx: 72 },
        { name: "spire upper", x: 59 * T, y: 115 * T - 10, rx: 72 },
        { name: "spire crown", x: 59 * T, y: 102 * T - 10, rx: 82 },
        { name: "gale entry", x: 49 * T, y: 88 * T - 10, rx: 76 },
        { name: "gale island", x: 31 * T, y: 91 * T - 10, rx: 70 },
        { name: "gale far lane", x: 13 * T, y: 86 * T - 10, rx: 78 },
        { name: "gale turn", x: 10 * T, y: 79 * T - 10, rx: 70 },
        { name: "first return island", x: 21 * T, y: 73 * T - 10, rx: 78 },
        { name: "return middle", x: 34 * T, y: 66 * T - 10, rx: 82 },
        { name: "second return island", x: 40 * T, y: 64 * T - 10, rx: 72 },
        { name: "return top", x: 47 * T, y: 61 * T - 10, rx: 82 },
        { name: "gale checkpoint", x: 55 * T, y: 57 * T - 10, rx: 118 },
      ],
    },
    {
      start: { x: 59 * T + 3, y: 56 * T + 4 },
      waypoints: [
        { name: "last reach entry", x: 53 * T, y: 52 * T - 10, rx: 68, clearRadius: 44 },
        { name: "last reach turn", x: 44 * T, y: 46 * T - 10, rx: 68, clearRadius: 44 },
        { name: "last reach walls", x: 31 * T, y: 41 * T - 10, rx: 68, clearRadius: 44 },
        { name: "left wall", x: 22 * T, y: 36 * T - 10, rx: 68, clearRadius: 44 },
        { name: "upper left", x: 14 * T, y: 31 * T - 10, rx: 68, clearRadius: 44 },
        { name: "upper turn", x: 23 * T, y: 26 * T - 10, rx: 68, clearRadius: 44 },
        { name: "upper chain", x: 33 * T, y: 22 * T - 10, rx: 68, clearRadius: 44 },
        { name: "last enemy", x: 43 * T, y: 18 * T - 10, rx: 68, clearRadius: 44 },
        { name: "upper island", x: 49 * T, y: 15 * T - 10, rx: 60 },
        { name: "upper right", x: 54 * T, y: 12 * T - 10, rx: 68, clearRadius: 44 },
        { name: "upper cross", x: 47 * T, y: 9 * T - 10, rx: 68, clearRadius: 44 },
        { name: "crown connector", x: 56 * T, y: 6 * T - 10, rx: 68, clearRadius: 44 },
        { name: "crown", x: 59 * T, y: 3 * T - 10, rx: 64 },
      ],
    },
  ];
  if (!chunks[chunk]) throw new Error("Unknown Reach chunk: " + chunk);
  return probeRoute("THE REACH", {
    beamWidth: options.beamWidth || 12,
    maxSteps: options.maxSteps || 700,
    ...chunks[chunk],
    finishAtLastWaypoint: true,
  });
}

export function replayRoute(levelName, actions, { includeEnemies = false } = {}) {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.name === levelName);
  if (levelIndex < 0) throw new Error(`Unknown level: ${levelName}`);
  api.prepareRouteProbe(levelIndex, includeEnemies);
  let raw = api.captureRouteState();
  let state = JSON.parse(raw);
  for (let step = 0; step < actions.length; step++) {
    const actionIndex = actions[step];
    if (!Number.isInteger(actionIndex) || !ACTIONS[actionIndex])
      throw new Error(`Invalid route action ${actionIndex} at step ${step}`);
    raw = advance(api, raw, ACTIONS[actionIndex]);
    state = JSON.parse(raw);
    if (state.mode === "clear") {
      return { ok: true, level: levelName, steps: step + 1, seconds: state.score.time };
    }
    if (state.mode !== "play")
      return { ok: false, level: levelName, steps: step + 1, mode: state.mode };
  }
  return { ok: false, level: levelName, steps: actions.length, mode: state.mode };
}

export const actionNames = actions => actions.map(index => ACTIONS[index].name);

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const levelName = process.argv.slice(2).join(" ") || "THE HOLLOW";
  const defaults = levelName === "THE PALE ROOT" || levelName === "THE REACH"
    ? { beamWidth: 12, maxSteps: 1800 }
    : { beamWidth: 12, maxSteps: 600 };
  const result = probeRoute(levelName, defaults);
  const names = actionNames(result.actions);
  const printable = {
    ...result,
    actionCount: names.length,
    actionTail: names.slice(-24),
    actions: undefined,
  };
  console.log(JSON.stringify(printable, null, 2));
  if (!result.ok) process.exitCode = 1;
}
