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
  const canvas = new Target(), button = new Target(), jump = new Target(), events = [];
  const api = context.SporelingBloomControls.create({ canvas, button, jumpButton: jump, getState: () => ({ enabled: true, playerX: 10, playerY: 10, aimX: 0, aimY: -1, ...state }), onStart: e => events.push(['start', e]), onAim: e => events.push(['aim', e]), onRelease: e => events.push(['release', e]), onCancel: () => events.push(['cancel']), onAimCancel: () => events.push(['aim-cancel']), onJumpStart: () => events.push(['jump-start']), onJumpEnd: () => events.push(['jump-end']) });
  return { canvas, button, jump, root: context, events, api };
}
test('desktop left mousedown aims at pointer while right mouse holds jump', () => { const x = setup(); x.canvas.dispatch('mousedown', { button: 2, clientX: 0, clientY: 0 }); x.canvas.dispatch('mousedown', { button: 0, clientX: 30, clientY: 10 }); assert.equal(x.events[1][0], 'release'); assert.equal(x.events[1][1].dx, 1); assert.equal(x.events[1][1].dy, 0); x.root.dispatch('mouseup', { button: 2 }); assert.deepEqual(x.events.map(e => e[0]), ['jump-start', 'release', 'jump-end']); });
test('phone drag reports direction, tap uses current aim, and cancel commits nothing', () => { const x = setup(); x.button.dispatch('pointerdown', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); x.button.dispatch('pointermove', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 25 }); x.button.dispatch('pointerup', { pointerId: 2, pointerType: 'touch', button: 0, clientX: 5, clientY: 25 }); assert.equal(x.events.at(-1)[0], 'release'); assert.equal(x.events.at(-1)[1].dx, 0); assert.equal(x.events.at(-1)[1].dy, 1); const y = setup(); y.button.dispatch('pointerdown', { pointerId: 3, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); y.button.dispatch('pointerup', { pointerId: 3, pointerType: 'touch', button: 0, clientX: 5, clientY: 5 }); assert.equal(y.events.at(-1)[0], 'release'); assert.equal(y.events.at(-1)[1].dx, 0); assert.equal(y.events.at(-1)[1].dy, -1); const z = setup(); z.button.dispatch('pointerdown', { pointerId: 4, pointerType: 'touch', button: 0, clientX: 1, clientY: 1 }); z.button.dispatch('pointercancel', { pointerId: 4, pointerType: 'touch', button: 0, clientX: 1, clientY: 1 }); assert.equal(z.events.filter(e => e[0] === 'release').length, 0); });

test('duplicate pointer and disabled canvas input are ignored', () => { const x = setup(); x.button.dispatch('pointerdown', { pointerId: 5, pointerType: 'touch', isPrimary: false, button: 0, clientX: 0, clientY: 0 }); x.button.dispatch('pointerdown', { pointerId: 6, pointerType: 'touch', isPrimary: false, button: 0, clientX: 0, clientY: 0 }); assert.equal(x.events.filter(e => e[0] === 'start').length, 1); const y = setup({ enabled: false }); y.canvas.dispatch('mousedown', { button: 0, clientX: 30, clientY: 10 }); assert.equal(y.events.length, 0); });
test('phone release cancels if the game becomes disabled while held', () => { const live = { enabled: true }; const x = setup(live); x.button.dispatch('pointerdown', { pointerId: 7, pointerType: 'touch', button: 0, clientX: 0, clientY: 0 }); live.enabled = false; x.button.dispatch('pointerup', { pointerId: 7, pointerType: 'touch', button: 0, clientX: 20, clientY: 0 }); assert.equal(x.events.filter(e => e[0] === 'release').length, 0); assert.equal(x.events.filter(e => e[0] === 'cancel').length, 1); });

test('semantic button activation dashes once without duplicating pointer clicks', () => { const x=setup(); x.button.dispatch('click',{detail:0}); x.button.dispatch('click',{detail:1}); assert.equal(x.events.filter(e=>e[0]==='release').length,1); });

const finger = (x = 0, y = 0, id = 20) => ({ pointerId: id, pointerType: 'touch', button: 0, clientX: x, clientY: y });
const count = (x, name) => x.events.filter(e => e[0] === name).length;

test('a held Jump tolerates thumb wobble and does not aim or dash', () => {
  const x = setup(); x.jump.dispatch('pointerdown', finger());
  for (const [dx,dy] of [[8,5],[14,-6],[-10,8],[2,3]]) x.jump.dispatch('pointermove', finger(dx,dy));
  assert.deepEqual(x.events.map(e => e[0]), ['jump-start']);
  x.jump.dispatch('pointerup', finger(2,3));
  assert.equal(count(x,'release'),0); assert.equal(count(x,'jump-end'),1);
});
test('Jump keeps held through aiming, snaps thumb drift, and releases one dash', () => {
  const x=setup(); x.jump.dispatch('pointerdown',finger());
  x.jump.dispatch('pointermove',finger(30,3)); x.jump.dispatch('pointermove',finger(38,8));
  assert.equal(count(x,'start'),1); assert.equal(count(x,'jump-end'),0);
  x.jump.dispatch('pointerup',finger(38,8));
  const release=x.events.find(e=>e[0]==='release'); assert.equal(release[1].dx,1); assert.equal(release[1].dy,0);
  assert.equal(count(x,'release'),1); assert.deepEqual(x.events.slice(-2).map(e=>e[0]),['release','jump-end']);
});
for (const pad of ['jump','button']) {
  test(`${pad}: final lift coordinates commit a quick swipe even without a move event`,()=>{
    const x=setup();x[pad].dispatch('pointerdown',finger());x[pad].dispatch('pointerup',finger(0,-35));
    const releases=x.events.filter(e=>e[0]==='release');assert.equal(releases.length,1);assert.equal(releases[0][1].dx,0);assert.equal(releases[0][1].dy,-1);
  });
  test(`${pad}: lifting back at the origin cancels even without a final move event`,()=>{
    const x=setup();x[pad].dispatch('pointerdown',finger());x[pad].dispatch('pointermove',finger(40));x[pad].dispatch('pointerup',finger(2));
    assert.equal(count(x,'release'),0);assert.equal(count(x,'aim-cancel'),1);
  });
  test(`${pad}: a cancelled aim can rearm in another direction with the same thumb`,()=>{
    const x=setup();x[pad].dispatch('pointerdown',finger());x[pad].dispatch('pointermove',finger(40));x[pad].dispatch('pointermove',finger(2));
    assert.equal(count(x,'jump-end'),0);x[pad].dispatch('pointermove',finger(0,-40));x[pad].dispatch('pointerup',finger(0,-40));
    assert.equal(count(x,'start'),2);assert.equal(count(x,'aim-cancel'),1);
    const release=x.events.find(e=>e[0]==='release');assert.equal(release[1].dy,-1);
  });
}
test('8-way aim retains its sector across small boundary wobbles but follows deliberate turns',()=>{
  const x=setup(); x.jump.dispatch('pointerdown',finger());
  const at=degrees=>finger(45*Math.cos(degrees*Math.PI/180),45*Math.sin(degrees*Math.PI/180));
  x.jump.dispatch('pointermove',at(15));x.jump.dispatch('pointermove',at(25));assert.equal(x.events.at(-1)[1].dy,0);
  x.jump.dispatch('pointermove',at(40));assert.ok(x.events.at(-1)[1].dy>.7);
  x.jump.dispatch('pointermove',at(20));assert.ok(x.events.at(-1)[1].dy>.7);
  x.jump.dispatch('pointerup',at(5));assert.equal(x.events.find(e=>e[0]==='release')[1].dy,0);
});
test('another action contact or semantic activation cannot steal a held Jump',()=>{
  const x=setup();x.jump.dispatch('pointerdown',finger());x.button.dispatch('pointerdown',finger(30,0,21));x.button.dispatch('click',{detail:0});x.jump.dispatch('click',{detail:0});
  x.jump.dispatch('pointerup',finger(40,0,21));assert.equal(count(x,'release'),0);assert.equal(count(x,'jump-start'),1);assert.equal(count(x,'jump-end'),0);
  x.jump.dispatch('pointerup',finger());assert.equal(count(x,'jump-end'),1);
});
for (const end of ['pointercancel','lostpointercapture','blur','destroy','disabled']) {
  test(`an armed Jump clears without dashing on ${end}`,()=>{
    const state={enabled:true},x=setup(state);x.jump.dispatch('pointerdown',finger());x.jump.dispatch('pointermove',finger(35));
    if(end==='blur')x.root.dispatch('blur');else if(end==='destroy')x.api.destroy();else if(end==='disabled'){state.enabled=false;x.jump.dispatch('pointerup',finger(35));}else x.jump.dispatch(end,finger(35));
    assert.equal(count(x,'release'),0);assert.equal(count(x,'jump-end'),1);assert.equal(count(x,'aim-cancel'),1);assert.equal(count(x,'cancel'),1);
    x.jump.dispatch('pointerup',finger(35));assert.equal(count(x,'release'),0);
  });
}
test('semantic Jump buffers one hop without firing a dash or synthetic duplicate',()=>{
 const x=setup();x.jump.dispatch('click',{detail:0});x.jump.dispatch('click',{detail:1});assert.equal(count(x,'jump-start'),1);assert.equal(count(x,'jump-end'),1);assert.equal(count(x,'release'),0);
});
