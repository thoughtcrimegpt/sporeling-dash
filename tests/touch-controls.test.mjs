import assert from "node:assert/strict";
import test from "node:test";
import { bootGame, html } from "../tools/game-harness.mjs";

test("touch controls use semantic play actions and directional move cues", () => {
  for (const id of ["btnJump", "btnDash", "btnBurst", "btnSlam", "btnPause"])
    assert.match(html, new RegExp(`<button[^>]+id=["']${id}["'][^>]+aria-label=`));
  assert.match(html, /<button[^>]+id=["']stick["'][^>]+aria-label=["']Move, 8 directions/);
  assert.match(html, /#touch\.menu-nav\s*\{\s*display:\s*none/);
});

test("touch dash consumes the direction captured at press time", () => {
  const { api } = bootGame();
  api.TOUCH.active = true;
  api.TOUCH.ax = 1;
  api.TOUCH.dashX = 1;
  api.TOUCH.dashY = 0;
  api.TOUCH.dashIntent = true;
  api.TOUCH.ax = 0;
  const input = api.readInput();
  assert.equal(input.ax, 0);
  assert.equal(input.ay, 0);
  assert.equal(input.dashAimX, 1);
  assert.equal(input.dashAimY, 0);
  assert.equal(api.TOUCH.dashIntent, false);
});

test("slam touch intent is exact down and transient input clears ownership", () => {
  const { api } = bootGame();
  api.TOUCH.active = true;
  api.TOUCH.slam = true;
  api.TOUCH.dashX = 0;
  api.TOUCH.dashY = 1;
  api.TOUCH.dashIntent = true;
  api.TOUCH.edges.slam = true;
  const input = api.readInput();
  assert.equal(input.ax, 0);
  assert.equal(input.ay, 0);
  assert.equal(input.dashAimY, 1);
  assert.equal(input.dashEdge, true);
  api.TOUCH.pointers[7] = { prop: "slam" };
  api.releaseTransientInput();
  assert.deepEqual(api.TOUCH.pointers, Object.create(null));
  assert.equal(api.TOUCH.slam, false);
});

test("pointer ownership supports two-finger movement plus jump and cancels cleanly", () => {
  const game = bootGame();
  const { api } = game;
  api.TOUCH.active = true;
  const event = (pointerId, extra = {}) => ({ pointerId, clientX: 320, clientY: 90, preventDefault() {}, ...extra });
  game.element("stick").dispatch("pointerdown", event(1));
  game.element("btnJump").dispatch("pointerdown", event(2));
  game.element("btnJump").dispatch("pointerdown", event(3));
  assert.equal(api.TOUCH.jump, true);
  assert.equal(Object.keys(api.TOUCH.pointers).length, 2);
  game.element("stick").dispatch("pointercancel", event(1));
  game.element("btnJump").dispatch("pointerup", event(2));
  assert.equal(api.TOUCH.ax, 0);
  assert.equal(api.TOUCH.jump, false);
});

test("Burst is disabled below full charge and cannot silently activate", () => {
  const game = bootGame();
  const { api } = game;
  api.TOUCH.active = true;
  api.S.mode = "play";
  api.S.player.resonance = 50;
  api.syncTouchVisibility();
  const burst = game.element("btnBurst");
  assert.equal(burst.disabled, true);
  burst.dispatch("pointerdown", { pointerId: 4, preventDefault() {} });
  assert.equal(api.TOUCH.burst, false);
});

test("an early dash keeps its captured aim for the eventual buffered launch", () => {
  const { api } = bootGame();
  api.TOUCH.active = true;
  api.TOUCH.dashX = -1;
  api.TOUCH.dashY = 0;
  api.TOUCH.dashIntent = true;
  const first = api.readInput();
  assert.equal(first.dashAimX, -1);
  api.TOUCH.dash = false;
  api.TOUCH.ax = 0;
  const later = api.readInput();
  assert.equal(later.dashAimX, 0);
});

test("keyboard and controller directional dashes carry their resolved aim", () => {
  const keyboard = bootGame();
  keyboard.api.keys.ArrowUp = true;
  keyboard.api.just.ShiftLeft = true;
  const keyInput = keyboard.api.readInput();
  assert.equal(keyInput.dashAimX, 0);
  assert.equal(keyInput.dashAimY, -1);

  const controller = bootGame();
  const buttons = Array.from({ length: 10 }, () => ({ pressed: false }));
  buttons[2].pressed = true;
  controller.context.navigator.getGamepads = () => [{ connected: true, axes: [0.8, -0.8], buttons }];
  const padInput = controller.api.readInput();
  assert.ok(padInput.dashAimX > 0.5);
  assert.ok(padInput.dashAimY < -0.5);
});
