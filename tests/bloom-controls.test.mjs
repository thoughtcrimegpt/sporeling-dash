import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Target {
  constructor() { this.handlers = {}; this.classList = { add: c => this.cls = c, remove: c => { if (this.cls === c) this.cls = ''; } }; this.attrs = {}; }
  addEventListener(type, fn) { (this.handlers[type] ||= []).push(fn); }
  removeEventListener() {}
  dispatch(type, event = {}) { for (const fn of this.handlers[type] || []) fn({ preventDefault() { event.prevented = true; }, ...event }); }
  setPointerCapture(id) { this.capture = id; }
  releasePointerCapture(id) { this.released = id; }
  setAttribute(k, v) { this.attrs[k] = v; }
}
function setup(state = {}) {
  const context = { console, document: new Target(), handlers: {} };
  context.addEventListener = Target.prototype.addEventListener;
  context.removeEventListener = Target.prototype.removeEventListener;
  context.dispatch = Target.prototype.dispatch;
  context.window = context;
  vm.runInNewContext(fs.readFileSync(new URL('../ui/bloom-controls.js', import.meta.url), 'utf8'), context);
  const canvas = new Target(), button = new Target(), events = [];
  const api = context.SporelingBloomControls.create({ canvas, button, getState: () => ({ enabled: true, playerX: 10, playerY: 10, aimX: 0, aimY: -1, ...state }), onStart: e => events.push(['start', e]), onAim: e => events.push(['aim', e]), onRelease: e => events.push(['release', e]), onCancel: () => events.push(['cancel']), onJumpStart: () => events.push(['jump-start']), onJumpEnd: () => events.push(['jump-end']) });
  return { canvas, button, root: context, events, api };
}
test('desktop left mousedown aims at pointer while right mouse holds jump', () => { const x = setup(); x.canvas.dispatch('mousedown', { button: 2, clientX: 0, clientY: 0 }); x.canvas.dispatch('mousedown', { button: 0, clientX: 30, clientY: 10 }); assert.equal(x.events[1][0], 'release'); assert.equal(x.events[1][1].dx, 1); assert.equal(x.events[1][1].dy, 0); x.root.dispatch('mouseup', { button: 2 }); assert.deepEqual(x.events.map(e => e[0]), ['jump-start', 'release', 'jump-end']); });
test('phone drag reports direction, tap uses current aim, and cancel commits nothing', () => { const x = setup(); x.button.dispatch('pointerdown', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); x.button.dispatch('pointermove', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 25 }); x.button.dispatch('pointerup', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 25 }); assert.equal(x.events.at(-1)[0], 'release'); assert.equal(x.events.at(-1)[1].dx, 0); assert.equal(x.events.at(-1)[1].dy, 1); const y = setup(); y.button.dispatch('pointerdown', { pointerId: 3, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); y.button.dispatch('pointerup', { pointerId: 3, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); assert.equal(y.events.at(-1)[0], 'release'); assert.equal(y.events.at(-1)[1].dx, 0); assert.equal(y.events.at(-1)[1].dy, -1); const z = setup(); z.button.dispatch('pointerdown', { pointerId: 4, pointerType: 'touch', button: 0, clientX: 1, clientY: 1 }); z.button.dispatch('pointercancel', { pointerId: 4, pointerType: 'touch', button: 0, clientX: 1, clientY: 1 }); assert.equal(z.events.filter(e => e[0] === 'release').length, 0); });
test('duplicate pointer and disabled canvas input are ignored', () => { const x = setup(); x.button.dispatch('pointerdown', { pointerId: 5, pointerType: 'touch', isPrimary: false, button: 0, clientX: 0, clientY: 0 }); x.button.dispatch('pointerdown', { pointerId: 6, pointerType: 'touch', isPrimary: false, button: 0, clientX: 0, clientY: 0 }); assert.equal(x.events.filter(e => e[0] === 'start').length, 1); const y = setup({ enabled: false }); y.canvas.dispatch('mousedown', { button: 0, clientX: 30, clientY: 10 }); assert.equal(y.events.length, 0); });
test('phone release cancels if the game becomes disabled while held', () => { const live = { enabled: true }; const x = setup(live); x.button.dispatch('pointerdown', { pointerId: 7, pointerType: 'touch', button: 0, clientX: 0, clientY: 0 }); live.enabled = false; x.button.dispatch('pointerup', { pointerId: 7, pointerType: 'touch', button: 0, clientX: 20, clientY: 0 }); assert.equal(x.events.filter(e => e[0] === 'release').length, 0); assert.equal(x.events.filter(e => e[0] === 'cancel').length, 1); });

test('semantic button activation dashes once without duplicating pointer clicks', () => { const x=setup(); x.button.dispatch('click',{detail:0}); x.button.dispatch('click',{detail:1}); assert.equal(x.events.filter(e=>e[0]==='release').length,1); });
