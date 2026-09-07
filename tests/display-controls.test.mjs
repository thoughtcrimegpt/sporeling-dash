import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../ui/display.js", import.meta.url), "utf8");
function boot({ prefixed = false, reject = false, supported = true } = {}) {
  const events = new Map();
  let requests = 0, resizes = 0;
  const document = { documentElement: {}, addEventListener: (name, fn) => events.set(name, fn) };
  const elementKey = prefixed ? "webkitFullscreenElement" : "fullscreenElement";
  if (supported) {
    document.documentElement[prefixed ? "webkitRequestFullscreen" : "requestFullscreen"] = function () {
      assert.equal(this, document.documentElement, "fullscreen includes the game and its DOM controls");
      requests++;
      if (reject) return Promise.reject(new Error("Blocked"));
      document[elementKey] = this;
      return Promise.resolve();
    };
    document[prefixed ? "webkitExitFullscreen" : "exitFullscreen"] = () => {
      document[elementKey] = null;
      return Promise.resolve();
    };
  }
  const context = { document, Event: class { constructor(type) { this.type = type; } }, dispatchEvent: e => { if (e.type === "resize") resizes++; } };
  context.window = context;
  vm.runInNewContext(source, context);
  return { display: context.SporelingDisplay, events, requests: () => requests, resizes: () => resizes };
}

test("fullscreen enters and exits the document, with standard and WebKit APIs", async () => {
  for (const prefixed of [false, true]) {
    const game = boot({ prefixed });
    assert.equal(game.display.supported, true);
    assert.equal(await game.display.toggle(), true);
    assert.equal(game.display.active, true);
    assert.equal(await game.display.toggle(), true);
    assert.equal(game.display.active, false);
    assert.equal(game.resizes(), 2);
  }
});

test("fullscreen errors and unsupported browsers return a useful fallback", async () => {
  for (const options of [{ reject: true }, { supported: false }]) {
    const { display } = boot(options);
    assert.equal(await display.toggle(), false);
    assert.equal(display.active, false);
    assert.match(display.message, /browser/);
  }
});

test("F works in a user key event without stealing text entry or browser shortcuts", () => {
  const game = boot();
  const key = game.events.get("keydown");
  for (const extra of [{ repeat: true }, { metaKey: true }, { ctrlKey: true }, { target: { tagName: "INPUT" } }, { target: { isContentEditable: true } }]) {
    key({ key: "f", preventDefault() {}, ...extra });
  }
  assert.equal(game.requests(), 0);
  key({ key: "f", preventDefault() {} });
  assert.equal(game.requests(), 1, "request runs within the user gesture, before an await");
});
