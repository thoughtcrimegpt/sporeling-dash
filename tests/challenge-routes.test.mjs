import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";
import { CHALLENGE_ROUTES, inspectChallengeMap, runActualInputRoute, validateChallengeMap } from "../tools/challenge-routes.mjs";

test("challenge route contract names every reauthored room and its authored beats", () => {
  assert.deepEqual(Object.keys(CHALLENGE_ROUTES).map(Number), [0, 1, 19, 20, 21, 22]);
  for (const route of Object.values(CHALLENGE_ROUTES)) {
    assert.ok(route.sequences.length >= 3);
    assert.ok(route.sequences.every(step => step.length > 8));
  }
});

test("reauthored maps retain bounded engine symbols, recovery checkpoints, and room resources", () => {
  const { api } = bootGame();
  for (const index of [0, 1]) {
    const level = api.LEVELS[index];
    const report = inspectChallengeMap(level.map);
    assert.equal(validateChallengeMap(level.map, { minCheckpoints: 2 }), true, level.name);
    assert.ok(report.width >= 100, `${level.name} is still a short probe`);
    assert.ok(report.berryCount >= 8, `${level.name} needs authored rewards`);
  }
  for (const level of api.LEVELS.slice(19, 23)) {
    const report = inspectChallengeMap(level.map);
    assert.equal(validateChallengeMap(level.map, { minCheckpoints: 1 }), true, level.name);
    assert.ok(report.berryCount >= 4, `${level.name} needs route berries`);
    assert.ok(report.enemyCount <= 8, `${level.name} enemy budget`);
  }
});

test("challenge routes preserve authored room names and visible hazard metadata", () => {
  const { api } = bootGame();
  assert.equal(api.LEVELS.slice(19, 23).map(level => level.name).join("|"),
    "THE REEDBANK|THE LANTERN LIFT|THE SILVER SLUICE|THE STILLWATER PATH");
  for (const level of api.LEVELS.slice(19, 23)) {
    assert.ok(level.rainbells.length >= 1, level.name);
    for (const lane of level.rainbells) {
      assert.ok(Number.isFinite(lane.left) && Number.isFinite(lane.right));
      assert.ok(lane.left < lane.right && lane.x >= lane.left && lane.x <= lane.right);
    }
  }
});

test("opening and rootbridge rooms clear through ordinary edge-triggered inputs", { timeout: 30_000 }, async () => {
  for (const index of [0, 1]) {
    const result = await runActualInputRoute(index);
    assert.equal(result.mode, "clear", JSON.stringify({...result,inputs:undefined}));
    assert.ok(result.seconds >= 5, `${result.level} should remain a sustained traversal`);
    assert.ok(result.health > 0, `${result.level} must survive active hazards`);
    for (let frame=1; frame<result.inputs.length; frame++) {
      assert.ok(!result.inputs[frame].jump || !result.inputs[frame-1].holdJump,
        `${result.level}: jump must follow a release at frame ${frame}`);
    }
  }
});
