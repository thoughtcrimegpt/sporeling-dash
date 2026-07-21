import assert from "node:assert/strict";
import test from "node:test";
import { probeReachChunk, probeRoute, replayRoute } from "../tools/route-probe.mjs";
import { ROUTE_FIXTURES } from "./route-fixtures.mjs";

test("saved isolated routes replay through every normal goal chamber", () => {
  for (const [levelName, actions] of Object.entries(ROUTE_FIXTURES)) {
    const result = replayRoute(levelName, actions);
    assert.equal(result.ok, true, `${levelName} route stopped at step ${result.steps}`);
  }
});

test("saved routes survive deterministic enemies in five goal chambers", () => {
  const combatRoutes = ["THE HOLLOW", "THE SPIRE", "MYCEL GARDENS", "THE SWALLOW", "THE PALE ROOT"];
  for (const levelName of combatRoutes) {
    const result = replayRoute(levelName, ROUTE_FIXTURES[levelName], { includeEnemies: true });
    assert.equal(result.ok, true, `${levelName} combat replay stopped at step ${result.steps}`);
  }
});

test("the real-engine route probe can complete The Hollow", { timeout: 10_000 }, () => {
  const result = probeRoute("THE HOLLOW", { beamWidth: 8, maxSteps: 220 });
  assert.equal(result.ok, true, `route search stopped after ${result.expanded} expansions`);
  assert.ok(result.actions.length > 0, "the completed route has replayable inputs");
  assert.ok(result.seconds > 0, "the completed route advanced game time");
});

test("The Reach clears in all three checkpoint retry chunks", { timeout: 30_000 }, () => {
  for (let chunk = 0; chunk < 3; chunk++) {
    const result = probeReachChunk(chunk, { beamWidth: 10, maxSteps: 620 });
    assert.equal(result.ok, true,
      `Reach chunk ${chunk + 1} stopped at ${result.nextWaypoint || "the route"} after ${result.expanded} expansions`);
    assert.ok(result.actions.length > 0, `Reach chunk ${chunk + 1} has replayable inputs`);
  }
});
