import assert from "node:assert/strict";
import test from "node:test";
import { probeRainbellRoutes } from "../tools/rainbell-routes.mjs";

test("Rainbell rooms clear from their authored spawns in Adventure with recorded inputs", () => {
  const results = probeRainbellRoutes();
  assert.deepEqual(results.map(result => result.level), ["THE REEDBANK", "THE SILVER SLUICE", "THE STILLWATER PATH", "THE LANTERN LIFT"]);
  for (const result of results) {
    assert.equal(result.ok, true, `${result.level}: ${result.mode}`);
    assert.ok(result.health > 0, `${result.level} must survive with hazards active`);
    for(let i=1;i<result.inputs.length;i++) assert.ok(!result.inputs[i].jump || !result.inputs[i-1].holdJump, `${result.level} cannot press jump while already holding it`);
    assert.ok(result.inputs.length > 0, `${result.level} recorded its input trace`);
  }
});
