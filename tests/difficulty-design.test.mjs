import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";

const DT = 1 / 60;
const SCREEN_TOP_SAFE = 64;
const SCREEN_BOTTOM_SAFE = 148;

function clearInput(api) {
  for (const key of Object.keys(api.keys)) delete api.keys[key];
  for (const key of Object.keys(api.just)) delete api.just[key];
}

function paleRoot(api) {
  api.prepareRouteProbe(api.PALE_ROOT_INDEX, true);
  api.S.lesson = null;
}

test("Pale Root upward chain keeps the player in the camera frame", () => {
  const { api } = bootGame();
  paleRoot(api);

  // Start at the foot of the first x=64 ladder and climb with three upward
  // dashes. The camera starts just outside its normal frame to exercise the
  // rapid correction bound during the climb.
  api.S.player.x = 64;
  api.S.player.y = 152 * 16 - 10;
  api.S.player.vx = 0;
  api.S.player.vy = 0;
  api.S.player.grounded = true;
  api.S.camY = api.S.player.y + 5 - 90;

  clearInput(api);
  api.keys.Space = true;
  api.just.Space = true;
  api.tick(DT);

  let dashCount = 0;
  const startingY = api.S.player.y;
  for (let dash = 0; dash < 3; dash++) {
    for (let frame = 0; frame < 8; frame++) {
      clearInput(api);
      api.keys.Space = true;
      api.tick(DT);
    }
    api.S.player.canDash = true;
    clearInput(api);
    api.keys.KeyW = true;
    api.just.ShiftLeft = true;
    api.tick(DT);
    if (api.S.player.dashing) dashCount++;
    for (let frame = 0; frame < 12; frame++) {
      clearInput(api);
      api.keys.KeyW = true;
      api.tick(DT);
      const screenY = api.S.player.y - api.S.camY;
      assert.ok(screenY >= SCREEN_TOP_SAFE,
        `player outran top camera bound during dash ${dash + 1}: ${screenY}`);
    }
  }

  assert.equal(api.S.mode, "play");
  assert.equal(dashCount, 3);
  assert.ok(startingY - api.S.player.y > 150,
    `upward chain rose only ${startingY - api.S.player.y}px`);
});

test("Pale Root respawn recenters a stale camera immediately", () => {
  const { api } = bootGame();
  paleRoot(api);
  api.S.checkPt = { x: 51, y: 115 * 16 - 4 };
  api.S.camY = 0;
  api.respawn();
  assert.equal(api.S.mode, "play");
  const screenY = api.S.player.y - api.S.camY;
  assert.ok(screenY >= SCREEN_TOP_SAFE, `respawn is above camera frame: ${screenY}`);
  assert.ok(screenY + api.S.player.h <= SCREEN_BOTTOM_SAFE,
    `respawn is below camera frame: ${screenY}`);
});

test("Reach checkpoint passage remains traversable above the shortened wall", () => {
  const { api } = bootGame();
  api.loadLevel(api.REACH_INDEX);
  api.S.mode = "play";
  api.S.lesson = null;
  const p = api.S.player;
  p.x = 854;
  p.y = 902;
  p.grounded = true;

  const checkpoint = api.S.checkpoints.find(cp => cp.x === 59 * 16 && cp.y === 56 * 16);
  assert.ok(checkpoint, "Reach checkpoint C59,56 is present in the live level");
  assert.equal(api.LEVELS[api.REACH_INDEX].map[45][54], "#",
    "upper Reach wall remains rough stone");

  for (let frame = 0; frame < 180 && !checkpoint.active; frame++) {
    clearInput(api);
    api.keys.KeyD = true;
    api.tick(DT);
  }

  assert.equal(checkpoint.active, true, "walking through the two-tile passage activates C59,56");
  assert.equal(api.S.checkPt.x, checkpoint.x + 3);
  assert.equal(api.S.checkPt.y, checkpoint.y - 4);
});

test("trial geometry keeps shortcut borders smooth and route walls rough", () => {
  const { api } = bootGame();
  paleRoot(api);

  const palePlayer = api.S.player;
  palePlayer.x = 16;
  palePlayer.y = 100 * 16 + 3;
  assert.equal(api.touchingWallDir(palePlayer), 0, "Pale Root striped border is not grippable");
  palePlayer.x = 25 * 16 - palePlayer.w;
  palePlayer.y = 160 * 16 + 3;
  assert.equal(api.touchingWallDir(palePlayer), 1, "Pale Root chimney wall remains grippable");

  api.prepareRouteProbe(api.REACH_INDEX, true);
  const reachPlayer = api.S.player;
  reachPlayer.x = 16;
  reachPlayer.y = 100 * 16 + 3;
  assert.equal(api.touchingWallDir(reachPlayer), 0, "Reach striped border is not grippable");
  reachPlayer.x = 54 * 16 - reachPlayer.w;
  reachPlayer.y = 45 * 16 + 3;
  assert.equal(api.touchingWallDir(reachPlayer), 1, "Reach intended wall remains grippable");
});
