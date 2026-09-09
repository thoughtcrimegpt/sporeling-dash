import { bootGame } from "./game-harness.mjs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const ACTIONS = [
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

export const ROUTE_WAYPOINTS = {
  "THE HOLLOW": [
    { name: "porch gap", x: 18 * 16, y: 9 * 16 - 10, rx: 72 },
    { name: "first thorns", x: 43 * 16, y: 8 * 16 - 10, rx: 80 },
    { name: "midway checkpoint", x: 67 * 16, y: 7 * 16 - 10, rx: 70 },
    { name: "berry bough", x: 75 * 16, y: 7 * 16 - 10, rx: 70 },
    { name: "exit shelf", x: 92 * 16, y: 5 * 16 - 10, rx: 70 },
  ],
  "ROTROOT CHASM": [
    { name: "lantern steps", x: 24 * 16, y: 7 * 16 - 10, rx: 80 },
    { name: "moving shelf", x: 52 * 16, y: 8 * 16 - 10, rx: 80 },
    { name: "high canopy", x: 70 * 16, y: 4 * 16 - 10, rx: 80 },
    { name: "recovery ledge", x: 87 * 16, y: 6 * 16 - 10, rx: 80 },
    { name: "exit", x: 116 * 16, y: 10 * 16 - 10, rx: 80 },
  ],
  "THE SPIRE": [
    { name: "garden floor", x: 8 * 16, y: 48 * 16 - 10, rx: 70 },
    { name: "lower shelf", x: 21 * 16, y: 42 * 16 - 10, rx: 70 },
    { name: "glide pocket", x: 8 * 16, y: 32 * 16 - 10, rx: 70 },
    { name: "upper shelf", x: 22 * 16, y: 22 * 16 - 10, rx: 70 },
    { name: "crown", x: 22 * 16, y: 3 * 16 - 10, rx: 70 },
  ],
  // The narrow canopy is best solved as one continuous glide chain. Keeping
  // this empty avoids steering the beam toward intermediate ledges that are
  // optional recovery perches rather than mandatory route gates.
  "MYCEL GARDENS": [],
  "THE MARROW": [
    { name: "rain shelf", x: 16 * 16, y: 11 * 16 - 10, rx: 90 },
    { name: "wide hollow", x: 40 * 16, y: 15 * 16 - 10, rx: 90 },
    { name: "bell crossing", x: 61 * 16, y: 5 * 16 - 10, rx: 90 },
    { name: "return shelf", x: 83 * 16, y: 11 * 16 - 10, rx: 90 },
    { name: "exit", x: 105 * 16, y: 7 * 16 - 10, rx: 80 },
  ],
  "THE TRUFFLE RUNS": [
    { name: "first truffle", x: 27 * 16, y: 22 * 16 - 10, rx: 90 },
    { name: "first enemy chain", x: 56 * 16, y: 15 * 16 - 10, rx: 105 },
    { name: "midpoint ledge", x: 91 * 16, y: 15 * 16 - 10, rx: 105 },
    { name: "last crossing", x: 120 * 16, y: 20 * 16 - 10, rx: 105 },
    { name: "goal ramp", x: 165 * 16, y: 17 * 16 - 10, rx: 90 },
  ],
  "THE ROOTWORKS": [
    { name: "first truffle", x: 24 * 16, y: 21 * 16 - 10, rx: 90 },
    { name: "first chain middle", x: 51 * 16, y: 14 * 16 - 10, rx: 110 },
    { name: "midpoint recovery", x: 81 * 16, y: 20 * 16 - 10, rx: 90 },
    { name: "long chain middle", x: 111 * 16, y: 13 * 16 - 10, rx: 110 },
    { name: "second recovery", x: 141 * 16, y: 18 * 16 - 10, rx: 90 },
    { name: "goal ledge", x: 168 * 16, y: 17 * 16 - 10, rx: 84 },
  ],
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
  if (waypoint.grounded && !p.grounded) return false;
  if (waypoint.ry !== undefined && Math.abs(p.y - waypoint.y) > waypoint.ry) return false;
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
  const vertical = target.down || target.ry !== undefined
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
  includeEnemies = null,
} = {}) {
  const startedAt = Date.now();
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.name === levelName);
  if (levelIndex < 0) throw new Error(`Unknown level: ${levelName}`);
  const level = api.LEVELS[levelIndex];
  if (level.boss || level.secret || !level.map.join("").includes("G"))
    throw new Error(`${levelName} does not use a normal goal route`);

  const useEnemies = includeEnemies === null
    ? level.trial === "reach" || levelName === "THE ROOTWORKS"
    : includeEnemies;
  api.prepareRouteProbe(levelIndex, useEnemies);
  // Route verification starts after any mandatory lesson card. The lesson is
  // UI state, while this probe supplies the actual movement inputs.
  if (api.S.lesson) api.S.lesson = null;
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
        { name: "first span checkpoint", x: 59 * T + 8, y: 142 * T - 10, rx: 20, ry: 10, grounded: true },
      ],
    },
    {
      start: { x: 59 * T + 3, y: 141 * T - 4 },
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
        { name: "checkpoint lip", x: 51 * T - 6, y: 57 * T - 26, rx: 14, ry: 16 },
        { name: "gale checkpoint", x: 59 * T + 8, y: 57 * T - 10, rx: 20, ry: 10, grounded: true },
      ],
    },
    {
      start: { x: 59 * T + 3, y: 56 * T - 4 },
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
    // Retry chunks 1 and 2 end at real checkpoint locations. The final
    // chunk must still touch the actual goal so a waypoint-only result cannot
    // claim that the trial clears.
    finishAtLastWaypoint: chunk < 2,
  });
}

export function replayRoute(levelName, actions, { includeEnemies = false } = {}) {
  const { api } = bootGame();
  const levelIndex = api.LEVELS.findIndex(level => level.name === levelName);
  if (levelIndex < 0) throw new Error(`Unknown level: ${levelName}`);
  api.prepareRouteProbe(levelIndex, includeEnemies);
  if (api.S.lesson) api.S.lesson = null;
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

// Purposeful Underfield controller. Each q triplet is approached on the
// current shelf, then broken with a real jump plus straight-down dash. Enemy
// proximity makes the controller hold jump longer, matching the playtest
// route while retaining ordinary collision and health rules.
export function probeUnderfield({ includeEnemies = true } = {}) {
  const { api } = bootGame();
  api.prepareRouteProbe(api.LEVELS.findIndex(level => level.name === "THE UNDERFIELD"), includeEnemies);
  api.S.lesson = null;
  const actions = [];
  const step = (dir = 0, jump = false, down = false, frames = 1) => {
    for (let i = 0; i < frames; i++) {
      for (const key of Object.keys(api.keys)) delete api.keys[key];
      for (const key of Object.keys(api.just)) delete api.just[key];
      if (dir) api.keys[dir < 0 ? "KeyA" : "KeyD"] = true;
      if (jump) api.keys.Space = true;
      if (jump && i === 0) api.just.Space = true;
      if (down) { api.keys.KeyS = true; if (i === 0) api.just.ShiftLeft = true; }
      api.tick(api.FIXED_DT);
      actions.push({ dir, jump: jump && i === 0, holdJump: jump, down: down && i === 0 });
    }
  };
  const seals = [11, 43, 9, 40, 17, 46];
  const landings = [];
  for (const col of seals) {
    const target = col * 16 + 3;
    let guard = 0;
    while (Math.abs(api.S.player.x - target) > 3 && guard++ < 1600) {
      const p = api.S.player;
      const danger = includeEnemies && api.S.enemies.some(e => !e.dead && Math.abs(e.x - p.x) < 80 && Math.abs(e.y - p.y) < 35);
      if (p.grounded && danger) step(Math.sign(target - p.x), true, false, 24);
      else step(Math.sign(target - p.x));
    }
    step(0, false, false, 12);
    const before = api.S.player.y;
    step(0, true, false, 12);
    step(0, false, true);
    step(0, false, false, 100);
    landings.push({ before, after: api.S.player.y, x: api.S.player.x, mode: api.S.mode });
  }
  let guard = 0;
  while (api.S.mode === "play" && guard++ < 1500) {
    const p = api.S.player;
    const danger = includeEnemies && api.S.enemies.some(e => !e.dead && Math.abs(e.x - p.x) < 80 && Math.abs(e.y - p.y) < 35);
    step(1, p.grounded && danger, false, p.grounded && danger ? 24 : 1);
  }
  return { ok: api.S.mode === "clear", actions, landings, health: api.S.health, deaths: api.S.score.deaths, x: api.S.player.x, y: api.S.player.y, mode: api.S.mode };
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
