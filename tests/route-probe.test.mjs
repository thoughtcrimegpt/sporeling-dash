import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";
import { probeReachChunk, probeRoute, probeUnderfield, replayRoute } from "../tools/route-probe.mjs";
import { ROUTE_FIXTURES } from "./route-fixtures.mjs";

test("route snapshots restore cracked floor geometry with gameplay state", () => {
  const { api } = bootGame();
  api.prepareRouteProbe(api.LEVELS.findIndex(level => level.name === "THE UNDERFIELD"), false);
  api.setTestMap(["#####", "..q..", "#####"]);
  const raw = api.captureRouteState();
  api.setTestMap(["#####", ".....", "#####"]);
  api.restoreRouteState(raw);
  assert.equal(JSON.parse(api.captureRouteState()).__levelMap[1][2], "q");
});

test("Underfield clears all six slam seals with the purposeful enemy-aware controller", { timeout: 15_000 }, () => {
  const result = probeUnderfield({ includeEnemies: true });
  assert.equal(result.ok, true, `Underfield stopped at (${result.x}, ${result.y}) in ${result.mode}`);
  assert.equal(result.landings.length, 6);
  for (const [i, landing] of result.landings.entries()) {
    assert.ok(landing.after > landing.before + 80, `seal ${i + 1} did not descend to the next floor`);
    assert.equal(landing.mode, "play", `seal ${i + 1} left gameplay unexpectedly`);
  }
  assert.ok(result.health > 0);
  assert.equal(result.deaths, 0);
  assert.ok(result.actions.length > 0);
});

test("saved Pale Root route replays under tuned physics", () => {
  const result = replayRoute("THE PALE ROOT", ROUTE_FIXTURES["THE PALE ROOT"]);
  assert.equal(result.ok, true, `Pale Root route stopped at step ${result.steps}`);
});

test("saved Pale Root route survives deterministic enemies", () => {
  const result = replayRoute("THE PALE ROOT", ROUTE_FIXTURES["THE PALE ROOT"], { includeEnemies: true });
  assert.equal(result.ok, true, `Pale Root combat route stopped at step ${result.steps}`);
});

test("authored campaign routes clear through real engine traversal", { timeout: 30_000 }, () => {
  const routes = ["THE HOLLOW", "ROTROOT CHASM", "THE SPIRE", "MYCEL GARDENS", "THE SKITTERWAY", "THE BLOOMHEART", "THE MARROW", "THE SWALLOW", "THE TRUFFLE RUNS", "THE ROOTWORKS"];
  for (const levelName of routes) {
    const result = probeRoute(levelName, { beamWidth: levelName === "THE SKITTERWAY" ? 40 : levelName === "THE SWALLOW" ? 60 : 16, maxSteps: levelName === "THE SWALLOW" ? 900 : 500, includeEnemies: ["THE ROOTWORKS", "THE SWALLOW"].includes(levelName), ...(["THE SKITTERWAY"].includes(levelName) ? { waypoints: [] } : {}) });
    assert.equal(result.ok, true, `${levelName} stopped at ${result.nextWaypoint || "the route"} near (${result.bestX}, ${result.bestY}) after ${result.expanded} expansions`);
    assert.ok(result.actions.length > 0, `${levelName} produced replayable inputs`);
  }
});

test("the real-engine route probe can complete The Hollow", { timeout: 10_000 }, () => {
  const result = probeRoute("THE HOLLOW", { beamWidth: 8, maxSteps: 220 });
  assert.equal(result.ok, true, `route search stopped after ${result.expanded} expansions`);
  assert.ok(result.actions.length > 0, "the completed route has replayable inputs");
  assert.ok(result.seconds > 0, "the completed route advanced game time");
});

test("Rootworks clears through its real enemy chain", { timeout: 15_000 }, () => {
  const result = probeRoute("THE ROOTWORKS", { beamWidth: 12, maxSteps: 600 });
  assert.equal(result.ok, true,
    `Rootworks route stopped at ${result.nextWaypoint || "the crossing"} after ${result.expanded} expansions`);
  assert.ok(result.steps >= 80, "the route remains a sustained horizontal challenge");
});

test("The Reach clears in all three checkpoint retry chunks", { timeout: 30_000 }, () => {
  for (let chunk = 0; chunk < 3; chunk++) {
    const result = probeReachChunk(chunk, chunk >= 1
      ? { beamWidth: 30, maxSteps: 900 }
      : { beamWidth: 10, maxSteps: 620 });
    assert.equal(result.ok, true,
      `Reach chunk ${chunk + 1} stopped at ${result.nextWaypoint || "the route"} after ${result.expanded} expansions`);
    assert.ok(result.actions.length > 0, `Reach chunk ${chunk + 1} has replayable inputs`);
  }
});
