import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";
import { probePracticalRoute } from "../tools/practical-route.mjs";

// Authored crossings must accept a normal running jump followed by one
// horizontal dash. No route search, steering corrections, or extra jumps.
// Enemy traversal is checked separately; these runs isolate terrain timing.
const crossings = [
  { name: "Hollow teaching pit", level: 0, x: 309, y: 134, end: 416 },
  { name: "Hollow first thorns", level: 0, x: 606, y: 150, end: 720 },
  { name: "Hollow second thorns", level: 0, x: 870, y: 134, end: 992 },
  { name: "Lantern first thorns", level: 1, x: 151, y: 182, end: 256 },
  { name: "Lantern checkpoint crossing", level: 1, x: 646, y: 214, end: 752 },
  { name: "Lantern final thorns", level: 1, x: 1318, y: 182, end: 1424 },
];

test("the opening routes clear with simple jumps and horizontal dashes while enemies are active", () => {
  for (const level of [0, 1]) {
    const result = probePracticalRoute(level, { includeEnemies: true });
    assert.ok(result.ok, `${result.level}: ${result.mode} at ${result.x},${result.y}`);
    assert.equal(result.health, 4);
    assert.ok(result.jumps > 0 && result.dashes > 0);
  }
});

test("Rainbell's ground route connects with ordinary jumps and horizontal dashes", () => {
  const result = probePracticalRoute(7);
  assert.ok(result.ok, `${result.level}: ${result.mode} at ${result.x},${result.y}`);
  assert.equal(result.health, 4);
});

for (const crossing of crossings) {
  test(`${crossing.name} accepts varied jump/dash timing on keyboard, mouse, and touch`, () => {
    for (const device of ["keyboard", "mouse", "touch"]) {
      for (const offset of [-4, 0, 4]) for (const dashFrame of [9, 12, 15]) {
        const { api } = bootGame();
        api.prepareRouteProbe(crossing.level, false);
        api.S.lesson = null;
        const p = api.S.player;
        Object.assign(p, { x: crossing.x + offset, y: crossing.y, vx: 110, vy: 0, grounded: true });
        const label = `${device}, takeoff ${offset}px, dash ${dashFrame / 60}s`;
        assert.equal(api.solidBlocked(p.x, p.y, p.w, p.h), false, label);
        assert.equal(api.solidBlocked(p.x, p.y + p.h, p.w, 1), true, `supported takeoff: ${label}`);
        if (device === "touch") {
          api.TOUCH.active = true; api.TOUCH.ax = 1;
          api.TOUCH.jump = true; api.TOUCH.edges.jump = true;
        } else {
          api.keys.KeyD = true;
          if (device === "mouse") { api.POINTER.jump = true; api.POINTER.jumpEdge = true; }
          else { api.keys.Space = true; api.just.Space = true; }
        }
        let landed = false;
        for (let frame = 0; frame < 120; frame++) {
          if (frame === dashFrame) {
            if (device === "mouse") {
              api.POINTER.dx = 1; api.POINTER.dy = 0; api.POINTER.dashEdge = true;
            } else if (device === "touch") {
              api.TOUCH.dashX = 1; api.TOUCH.dashY = 0;
              api.TOUCH.dashIntent = true; api.TOUCH.edges.dash = true;
            } else api.just.ShiftLeft = true;
          }
          if (frame === dashFrame + 13) {
            api.keys.Space = false; api.POINTER.jump = false; api.TOUCH.jump = false;
          }
          api.tick(api.FIXED_DT);
          assert.equal(api.S.mode, "play", `crossing interrupted: ${label}`);
          assert.equal(api.S.health, 4, `crossing caused damage: ${label}`);
          if (p.x >= crossing.end && p.grounded && api.solidBlocked(p.x, p.y + p.h, p.w, 1)) {
            landed = true;
            break;
          }
        }
        assert.ok(landed, `no permanent landing at ${p.x},${p.y}: ${label}`);
      }
    }
  });
}
