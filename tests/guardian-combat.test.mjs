import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";
import { fightRainmaker, fightShoggoth, fightUnbloomed, fightBoar, step } from "../tools/guardian-combat-routes.mjs";

const DT = 1 / 60;

test("ordinary input emits one edge per physical press", () => {
  const seen = [];
  const api = {
    keys: {}, just: {}, FIXED_DT: DT,
    tick() { seen.push({ jump: !!this.just.Space, dash: !!this.just.ShiftLeft }); }
  };
  const jumpEdges = {};
  step(api, { jump: true }, jumpEdges);
  step(api, { jump: true }, jumpEdges);
  step(api, { jump: false }, jumpEdges);
  step(api, { jump: true }, jumpEdges);
  const dashEdges = {};
  step(api, { dash: true }, dashEdges);
  step(api, { dash: true }, dashEdges);
  step(api, { dash: false }, dashEdges);
  step(api, { dash: true }, dashEdges);
  assert.deepEqual(seen.map(sample => sample.jump), [true, false, false, true, false, false, false, false]);
  assert.deepEqual(seen.map(sample => sample.dash), [false, false, false, false, true, false, false, true]);
});

test("Rainmaker locks the marked landing and exposes the tongue tell", () => {
  const { api, context } = bootGame();
  api.loadLevel(23);
  api.S.mode = "play";
  const boss = api.S.boss;
  const ctx = api.rainbellContext();
  const rainmaker = context.SporelingRainmaker;
  rainmaker.update(boss, 2.3, ctx);
  assert.equal(boss.state, "tell");
  rainmaker.update(boss, 0.91, ctx);
  assert.equal(boss.state, "rings");
  for (let i = 0; i < 300 && boss.state === "rings"; i++) rainmaker.update(boss, DT, ctx);
  assert.equal(boss.state, "tongueTell");
  rainmaker.update(boss, 0.9, ctx);
  assert.equal(boss.state, "tongue");
  const marked = boss.tongue.x;
  api.S.player.x = 280;
  rainmaker.update(boss, 0.1, ctx);
  assert.equal(boss.tongue.x, marked, "the tongue lane remains locked after the tell");
});

test("Rainmaker clears through ordinary input with a missed first opening", () => {
  const result = fightRainmaker({ missFirst: true });
  assert.equal(result.mode, "clear", JSON.stringify(result));
  assert.equal(result.pips, 0, JSON.stringify(result));
  assert.ok(result.health > 0, JSON.stringify(result));
  assert.ok(result.openings > 0, JSON.stringify(result));
  assert.ok(result.elapsed > 0, JSON.stringify(result));
  assert.ok(result.damageEvents.every(event => Number.isFinite(event.seconds)), JSON.stringify(result));
  const firstOpening = result.timeline.find(event => event.state === "open" && event.opening === 1);
  assert.ok(firstOpening, JSON.stringify(result));
  assert.equal(firstOpening.pips, 4, JSON.stringify(result));
});

test("Shoggoth reset clears counter hazards and restores its full fight", () => {
  const { api } = bootGame();
  api.loadLevel(14);
  api.spawnShoggoth();
  api.S.boss.pips = 1;
  api.S.boss.state = "slamWarn";
  api.S.boss.tents = [{ x: 100, t: 0, warn: 0.4, live: false }];
  api.S.boss.rollers = [{ x: 100, vx: 80, spin: 0 }];
  api.S.boss.minions = [{ x: 100, y: 100 }];
  api.S.mode = "dead";
  api.respawn();
  assert.equal(api.S.boss.state, "emerge");
  assert.equal(api.S.boss.pips, 3);
  assert.equal(api.S.boss.tents.length, 0);
  assert.equal(api.S.boss.rollers.length, 0);
  assert.equal(api.S.boss.minions.length, 0);
});

test("Shoggoth clears through ordinary input", () => {
  const result = fightShoggoth();
  assert.equal(result.pips, 0, JSON.stringify(result));
  assert.equal(result.mode, "freed", JSON.stringify(result));
  assert.ok(result.health > 0, JSON.stringify(result));
  assert.ok(result.eyeWindows > 0, JSON.stringify(result));
  assert.ok(result.elapsed > 0, JSON.stringify(result));
  assert.ok(result.damageEvents.every(event => Number.isFinite(event.seconds)), JSON.stringify(result));
});

test('Unbloomed first form clears through a real climb and crown strikes',()=>{
 const r=fightUnbloomed();assert.equal(r.state,'falsebloom');assert.equal(r.pips,0);assert.ok(r.health>0);
});
test('Boar clears through charge dodges and three downward flank slams',()=>{
 const r=fightBoar();assert.equal(r.mode,'clear');assert.equal(r.pips,0);assert.ok(r.health>0);
});
test('the complete two-form finale is beatable without a health or position reset',()=>{
 const {api}=bootGame();api.S.runMode='adventure';api.configureRunRules('adventure');api.loadLevel(14);api.S.mode='play';
 const first=fightUnbloomed({existingApi:api});assert.equal(first.state,'falsebloom');
 const edge={};for(let f=0;f<400&&api.S.boss.kind==='unbloomed';f++)step(api,{},edge);
 assert.equal(api.S.boss.kind,'shoggoth');
 const second=fightShoggoth({existingApi:api});assert.equal(second.mode,'freed',JSON.stringify({...second,inputs:undefined}));assert.ok(second.health>0);
});
