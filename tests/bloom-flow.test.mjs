import test from "node:test";
import assert from "node:assert/strict";
import { bootGame } from "../tools/game-harness.mjs";

const TILE = 16;
const DT = 1 / 60;

function state(api) {
  return typeof api.pstate === "function" ? api.pstate() : (api.pstate || api.S);
}

function openGame({ floor = 24, adventure = false, level = 2 } = {}) {
  const game = bootGame();
  const { api } = game;
  api.prepareRouteProbe(level, false);
  api.setTestMap(Array.from({ length: 32 }, (_, y) => (y >= floor ? "#" : ".").repeat(80)));
  const s = state(api);
  s.mode = "play";
  s.lesson = null;
  s.freezeT = 0;
  s.runMode = adventure ? "adventure" : "speedrun";
  Object.assign(s.player, {
    x: 80, y: 210, vx: 0, vy: 0, grounded: false,
    canDash: true, spores: 3, dashing: false, dashT: 0,
  });
  api.releaseTransientInput();
  return { game, api, s, p: s.player };
}

function runUntil(api, condition, limit = 100) {
  for (let i = 0; i < limit; i++) {
    api.tick(DT);
    if (condition()) return i + 1;
  }
  return limit;
}

function armKeyboardDash(api, key = "KeyD") {
  api.just.ShiftLeft = true;
  api.keys[key] = true;
}

test("a horizontal or upward diagonal dash lands on its new bloom and spends one spore", () => {
  for (const mode of ["keys", "pointer"]) {
    const { api, s, p } = openGame();
    if (mode === "keys") {
      armKeyboardDash(api);
    } else {
      api.POINTER.dx = Math.SQRT1_2;
      api.POINTER.dy = -Math.SQRT1_2;
      api.POINTER.dashEdge = true;
    }
    api.tick(DT);
    const landed = runUntil(api, () => p.grounded && s.blooms.length === 1, 90);
    assert.ok(landed < 90, `${mode} dash did not land on a bloom`);
    assert.equal(p.grounded, true);
    assert.equal(p.vy, 0);
    assert.equal(p.canDash, true);
    assert.equal(p.spores, 2, `${mode} dash refilled or spent the wrong number of spores`);
    assert.ok(Math.abs((p.y + p.h) - s.blooms[0].y) <= 1, `${mode} landing is not on the new bloom`);
  }
});

test("an obstructed bloom does not rearm or refund the dash, and zero spores never goes negative", () => {
  const blocked = openGame();
  blocked.api.setTestMap(Array.from({ length: 32 }, (_, y) => (y === 11 || y >= 24 ? "#" : ".").repeat(80)));
  blocked.p.y = 160;
  armKeyboardDash(blocked.api);
  blocked.api.tick(DT);
  runUntil(blocked.api, () => !blocked.p.dashing, 30);
  assert.equal(blocked.s.blooms.length, 0, "blocked cap created a phantom bloom");
  assert.equal(blocked.p.spores, 3, "blocked cap changed spore fuel without creating a bloom");
  assert.equal(blocked.p.canDash, false, "blocked cap rearmed the dash");

  const empty = openGame();
  empty.p.spores = 0;
  armKeyboardDash(empty.api);
  empty.api.tick(DT);
  runUntil(empty.api, () => !empty.p.dashing, 30);
  assert.equal(empty.p.spores, 0);
  assert.equal(empty.s.blooms.length, 0);
});

test("a dash that ends on solid floor does not create or refund a bloom", () => {
  const { api, s, p } = openGame();
  p.y = 384 - p.h - 1;
  p.grounded = true;
  armKeyboardDash(api);
  api.tick(DT);
  runUntil(api, () => !p.dashing, 30);
  assert.equal(s.blooms.length, 0);
  assert.equal(p.spores, 3);
});

test("same-tick jump and dash lets the jump rise before launching the captured dash", () => {
  const { api, p } = openGame();
  p.y = 384 - p.h;
  p.grounded = true;
  api.just.Space = true;
  api.just.ShiftLeft = true;
  api.keys.KeyD = true;
  api.tick(DT);
  assert.ok(p.vy < -100, `jump was swallowed by the dash (vy=${p.vy})`);
  assert.equal(p.dashing, false);
  api.keys.KeyD = false;
  api.tick(DT);
  assert.equal(p.dashing, true, "captured dash did not launch on the following tick");
});

test("a jump pressed just before bloom landing is buffered for the next jump, not spent as flutter", () => {
  const { api, s, p } = openGame({ adventure: true });
  const bloom = { x: 96, y: 240, w: 24, h: 8, life: 2, age: 0 };
  s.blooms = [bloom];
  p.x = bloom.x + 4;
  p.y = bloom.y - p.h - 3;
  p.vy = 100;
  p.grounded = false;
  p.flutterReady = true;
  p.flutterArmed = true;
  p.flutterUsed = false;
  api.just.Space = true;
  api.keys.Space = true;
  api.tick(DT);
  assert.equal(p.grounded, true);
  assert.equal(p.flutterUsed, false);
  assert.ok(p.jumpBuf > 0, "landing consumed the buffered jump");
  api.keys.Space = false;
  api.tick(DT);
  assert.ok(p.vy < -100, "buffered jump did not launch from the bloom");
});

test("pointer down aim is a normal dash, while explicit down dash inputs remain slams", () => {
  const pointer = openGame();
  pointer.api.POINTER.dx = 0;
  pointer.api.POINTER.dy = 1;
  pointer.api.POINTER.dashEdge = true;
  pointer.api.tick(DT);
  assert.equal(pointer.p.slamDash, false);
  assert.ok(pointer.p.dashT > 0.08 && pointer.p.dashT < 0.12);

  const keyboard = openGame();
  keyboard.api.keys.ArrowDown = true;
  keyboard.api.just.ShiftLeft = true;
  keyboard.api.tick(DT);
  assert.equal(keyboard.p.slamDash, true);

  const touch = openGame();
  touch.api.TOUCH.active = true;
  touch.api.TOUCH.slam = true;
  touch.api.TOUCH.edges.slam = true;
  touch.api.TOUCH.ax = 0;
  touch.api.TOUCH.ay = 1;
  touch.api.TOUCH.dashX = 0;
  touch.api.TOUCH.dashY = 1;
  touch.api.tick(DT);
  assert.equal(touch.p.slamDash, true);
});

test("Adventure held jump survives a near landing after glide unlock", () => {
  for (const gap of [10, 3]) {
    const { api, s, p } = openGame({ adventure: true, level: 3 });
    const bloom = { x: 96, y: 240, w: 24, h: 8, life: 2, age: 0 };
    s.blooms = [bloom];
    p.x = bloom.x + 4;
    p.y = bloom.y - p.h - gap;
    p.vy = 240;
    p.grounded = false;
    p.flutterReady = true;
    p.flutterArmed = true;
    p.flutterUsed = false;
    api.just.Space = true;
    api.keys.Space = true;
    api.tick(DT);
    if (gap === 3) {
      for (let frame = 0; frame < 4 && !p.grounded; frame++) api.tick(DT);
    }
    if (gap === 10) {
      assert.ok(p.flutterUsed || p.grounded || p.vy < 0,
        "10px glide landing let the held jump expire without a jump");
    }
    assert.ok(p.grounded || p.vy < 0 || p.flutterUsed || p.jumpBuf > 0,
      `held jump vanished before landing at ${gap}px`);
    if (gap === 3) {
      assert.equal(p.grounded, true, "near landing should retain the buffered jump on the bloom");
      assert.equal(p.flutterUsed, false);
      assert.ok(p.jumpBuf > 0);
      api.keys.Space = false;
      api.tick(DT);
      assert.ok(p.vy < -100, "the retained near-landing jump did not launch next tick");
    }
  }
});

test("a supported cap lets an angled dash cross through to its next bloom", () => {
  const { api, s, p } = openGame();
  const first = { x: 96, y: 240, w: 24, h: 8, life: 2, age: 0 };
  s.blooms = [first];
  p.x = first.x + 4;
  p.y = first.y - p.h;
  p.grounded = true;
  p.canDash = true;
  p.spores = 3;
  api.POINTER.dx = 1;
  api.POINTER.dy = 0.05;
  api.POINTER.dashEdge = true;
  api.tick(DT);
  const startX = p.x;
  runUntil(api, () => p.grounded && s.blooms.length === 2, 40);
  assert.ok(p.x > startX + 50, `dash stopped on its launch cap at ${p.x - startX}px`);
  assert.equal(p.grounded, true);
  assert.equal(p.canDash, true);
  assert.equal(p.spores, 2);
  assert.equal(s.blooms.length, 2);
});

test("a deliberate down slam from a bloom is not trapped by its launch cap", () => {
  const { api, s, p } = openGame();
  const first = { x: 96, y: 240, w: 24, h: 8, life: 2, age: 0 };
  s.blooms = [first];
  p.x = first.x + 4;
  p.y = first.y - p.h;
  p.grounded = true;
  api.keys.KeyS = true;
  api.just.ShiftLeft = true;
  api.tick(DT);
  assert.equal(p.slamDash, true);
  runUntil(api, () => p.grounded && !p.dashing, 60);
  assert.equal(p.grounded, true);
  assert.ok(p.y > first.y + 80, `slam remained on launch cap at y=${p.y}`);
});
