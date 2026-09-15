import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bootGame} from '../tools/game-harness.mjs';

const hash = x => createHash('sha256').update(x).digest('hex');
const reference = JSON.parse(readFileSync(new URL('./release-reference.json', import.meta.url)));
test('unaffected released rooms, hero, movement, environments and Chorus stay exact', () => {
  const {api} = bootGame();
  for (let i = 0; i < reference.levels.length; i++) {
    if ([0,1].includes(i)) continue; // explicitly reauthored in the challenge pass
    assert.equal(hash(JSON.stringify(api.LEVELS[i])), reference.levels[i].hash, reference.levels[i].name);
  }
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  for (const region of reference.regions) {
    const start = html.indexOf(region.start), end = html.indexOf(region.end, start);
    assert.equal(hash(html.slice(start, end)), region.hash, region.label);
  }
  const guardians=readFileSync(new URL('../ui/guardians.js',import.meta.url),'utf8');
  for(const [name,r]of Object.entries(reference.guardianFunctions))
    assert.equal(hash(guardians.slice(guardians.indexOf('  function '+name),guardians.indexOf('  function '+r.end))),r.hash,name);
  for (const [path, expected] of Object.entries(reference.files)) {
    assert.equal(hash(readFileSync(new URL('../' + path, import.meta.url))), expected, path);
  }
});

test('Adventure traverses the new chapter and rejoins the original route; timed runs retain their course', () => {
  const {api, storage} = bootGame();
  api.S.runMode = 'adventure';
  assert.equal(api.ADVENTURE_ROUTE.length, 20);
  for (const [from, to] of [[7,19],[19,20],[20,21],[21,22],[22,23],[23,8]]) {
    api.loadLevel(from); api.S.mode = 'play'; api.chamberClear();
    for(let f=0; f<71; f++)api.tick(api.FIXED_DT);
    assert.equal(api.S.levelIdx,to); assert.equal(api.S.mode,'play');
    assert.ok(api.adventureChoices().includes(to));
  }
  assert.equal(storage.get('sd_reach'), '8');
  assert.equal(JSON.parse(storage.get('sd_rainbell_unlocked_v1')).length, 5);
  api.S.runMode = 'speedrun'; api.loadLevel(7); api.chamberClear();
  for(let f=0;f<71;f++)api.tick(api.FIXED_DT);
  assert.equal(api.S.levelIdx,8);
  assert.equal(api.CLASSIC_ROUTE.length,15);
});

test('returning players can select the new chapter without changing original saved progress', () => {
  const {api, storage} = bootGame({hostname:'thoughtcrimegpt.github.io',initialStorage:{sd_reach:'12'}});
  for(const i of [19,20,21,22,23])assert.ok(api.adventureChoices().includes(i));
  api.S.advStart=23; api.startTitleRun();
  assert.equal(api.S.levelIdx,23); assert.equal(api.S.boss.pips,4);
  assert.equal(storage.get('sd_reach'),'12');
  assert.equal(api.abilityLevel(),7); assert.equal(api.musicWanted(),'rainbell');
});

test('corrupt chapter storage is ignored and does not unlock unrelated rooms', () => {
  for(const raw of ['null','{}','["not-a-room"]','invalid']){
    const {api}=bootGame({initialStorage:{sd_rainbell_unlocked_v1:raw}});
    assert.deepEqual(Array.from(api.adventureChoices()),[0]);
  }
});

test('Rainmaker retry resets hazards and health, without moving the checkpoint', () => {
  const {api}=bootGame();api.loadLevel(23);api.S.mode='play';
  const checkpoint={...api.S.checkPt};
  api.S.boss.pips=1;api.S.boss.state='rings';api.S.boss.waves.push({x:100,y:185});
  api.S.health=1;api.respawn();
  assert.equal(api.S.boss.pips,4);assert.equal(api.S.boss.state,'intro');
  assert.equal(api.S.boss.waves.length,0);assert.equal(api.S.health,4);
  assert.deepEqual({...api.S.checkPt},checkpoint);
  assert.equal(api.S.player.spores,api.MAX_SPORES);
});

// Combat tells, retries and complete physical-input fights live in guardian-combat.test.mjs.
