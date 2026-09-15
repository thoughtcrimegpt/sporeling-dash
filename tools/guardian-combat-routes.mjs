/* Deterministic, ordinary-input guardian route probes. */
import { bootGame as defaultBootGame } from "./game-harness.mjs";
function clearInput(api) {
  for (const key of Object.keys(api.keys)) delete api.keys[key];
  for (const key of Object.keys(api.just)) delete api.just[key];
}

function step(api, { left = false, right = false, up = false, down = false, jump = false, dash = false } = {}, edgeState = {}) {
  const jumpWasHeld = !!edgeState.jumpHeld;
  const dashWasHeld = !!edgeState.dashHeld;
  clearInput(api);
  if (left) api.keys.KeyA = true;
  if (right) api.keys.KeyD = true;
  if (up) api.keys.KeyW = true;
  if (down) api.keys.KeyS = true;
  if (jump) api.keys.Space = true;
  if (jump && !jumpWasHeld) api.just.Space = true;
  if (dash && !dashWasHeld) api.just.ShiftLeft = true;
  edgeState.jumpHeld = !!jump;
  edgeState.dashHeld = !!dash;
  api.tick(api.FIXED_DT);
}

function nearestRing(b, p) {
  return (b.waves || []).find(w => {
    const py = p.y + p.h;
    return Math.abs((w.y + w.h) - py) < 30 &&
      ((w.dir < 0 && w.x > p.x && w.x - p.x < 74) ||
       (w.dir > 0 && p.x > w.x && p.x - (w.x + w.w) < 74));
  });
}

// This deliberately uses timing windows and movement, with no direct combat
// state edits after loadLevel. A late first counter is part of the probe.
export function fightRainmaker({ bootGame = defaultBootGame, missFirst = false, maxFrames = 9000 } = {}) {
  const { api } = bootGame();
  api.S.runMode = "adventure";
  api.configureRunRules("adventure");
  api.loadLevel(23);
  api.S.mode = "play";
  let jumpHeld = 0, attackDelay = 0, lastHealth = api.S.health;
  let damage = 0, openings = 0, hits = 0, previousState = null;
  let openingNumber = 0, skipOpening = false, elapsedFrames = 0;
  const damageEvents = [], edgeState = {};
  const inputs = [];
  const timeline = [];
  for (let frame = 0; frame < maxFrames && api.S.mode === "play"; frame++) {
    const b = api.S.boss, p = api.S.player;
    const entered = b.state !== previousState;
    if (entered) {
      if (b.state === "open") { openingNumber++; skipOpening = missFirst && openingNumber === 1; }
      else if (previousState === "open") skipOpening = false;
      timeline.push({ frame, state: b.state, opening: openingNumber, pips: b.pips, x: Math.round(p.x), px: Math.round(b.x), health: api.S.health });
      previousState = b.state;
    }
    let left = false, right = false, jump = jumpHeld > 0, dash = false;
    if (b.state === "rings" || b.state === "splash") {
      const ring = nearestRing(b, p);
      if (ring && p.grounded) { jump = true; jumpHeld = 18; }
      if (ring && !p.grounded) jumpHeld = Math.max(jumpHeld, 6);
    } else if (b.state === "tongueTell") {
      if (p.grounded) { jump = true; jumpHeld = 22; }
      left = p.x > 104;
    } else if (b.state === "tongue") {
      jump = !p.grounded || p.y + p.h > 165;
      jumpHeld = Math.max(jumpHeld, 8);
      left = true;
    } else if (b.state === "hopTell" || b.state === "hop") {
      // The marked landing is locked at the tell. Clear the mark before the
      // leap completes, then keep left for the splash rings.
      left = true;
      if (p.grounded) { jump = true; jumpHeld = 12; }
    } else if (b.state === "open" && !skipOpening) {
      openings = Math.max(openings, openingNumber);
      const target = b.x < 100 ? b.x + 35 : b.x - 35;
      if (p.x < target - 8) right = true;
      else if (p.x > target + 10) left = true;
      if (p.grounded && p.x > target - 14 && p.x < target + 18) { jump = true; jumpHeld = 10; attackDelay = 8; }
      if (attackDelay > 0) attackDelay--;
      if (attackDelay === 0 && p.dashing === false && p.canDash && p.x > target - 18 && p.x < target + 30) {
        const toward = target < b.x ? 1 : -1;
        left = toward < 0; right = toward > 0; dash = true;
      }
    } else if (b.state === "open") {
      // A deliberate first miss means the entire opening is observed, not
      // merely one late dash frame. Hold a safe lane until the state exits.
      openings = Math.max(openings, openingNumber);
      if (p.x < 100) right = true;
      else if (p.x > 150) left = true;
    } else {
      if (b.state === "defeated") right = true;
      else if (p.x < 106) right = true;
      else if (p.x > 130) left = true;
    }
    step(api, { left, right, jump, dash }, edgeState);
    inputs.push({ frame, left, right, jump, dash });
    elapsedFrames = frame + 1;
    jumpHeld = Math.max(0, jumpHeld - 1);
    if (api.S.health < lastHealth) {
      damage += lastHealth - api.S.health;
      damageEvents.push({ frame, seconds: elapsedFrames * api.FIXED_DT, state: b.state, health: api.S.health });
    }
    lastHealth = api.S.health;
    if (b.pips < 4 - hits) hits = 4 - b.pips;
  }
  return { mode: api.S.mode, pips: api.S.boss?.pips, health: api.S.health, damage, damageEvents, elapsed: elapsedFrames * api.FIXED_DT, openings, hits, frames: elapsedFrames, inputs, timeline };
}

function shogEyeApproach(api, b, p) {
  const eyeX = b.x;
  if (p.x + p.w / 2 < eyeX - 42) return { right: true };
  if (p.x + p.w / 2 > eyeX + 24) return { left: true };
  // The exposed eye accepts a body dash from the floor. This is the most
  // repeatable ordinary input and avoids requiring a perfect bounce height.
  if (p.canDash) return { right: p.x < eyeX, left: p.x >= eyeX, dash: true };
  if (p.grounded) return { jump: true };
  if (p.vy > 45 && p.y < b.y - 8 && p.x + p.w > b.x - 28 && p.x < b.x + 28)
    return { right: true, dash: true };
  return { right: true };
}

// The Shoggoth is entered through its real emergence sequence. The controller
// only steers, jumps, and dashes in response to its public attack states.
export function fightShoggoth({ bootGame = defaultBootGame, maxFrames = 12000, existingApi=null } = {}) {
  const api = existingApi || bootGame().api;
  if(!existingApi){
  api.S.runMode = "adventure";
  api.configureRunRules("adventure");
  api.loadLevel(14);
  api.spawnShoggoth();
  api.S.mode = "play";
  }
  let jumpHeld = 0, attackDelay = 0, damage = 0, lastHealth = api.S.health, elapsedFrames = 0;
  let hits = 0, eyeWindows = 0, previousState = null;
  const damageEvents = [], edgeState = {};
  const inputs = [];
  const timeline = [];
  for (let frame = 0; frame < maxFrames && api.S.mode === "play"; frame++) {
    const b = api.S.boss, p = api.S.player;
    const entered = b.state !== previousState;
    if (entered) { timeline.push({ frame, state: b.state, pips: b.pips, x: Math.round(p.x), bx: Math.round(b.x), health: api.S.health }); previousState = b.state; }
    let input = {};
    const hazard = (b.tents || []).find(tn => !tn.live && Math.abs(tn.x + 16 - (p.x + 5)) < 26);
    const roller = (b.rollers || []).find(r => Math.abs(r.x + 6 - (p.x + 5)) < 34);
    if (hazard || roller) { input.jump = p.grounded; jumpHeld = p.grounded ? 16 : 0; }
    if (jumpHeld > 0) input.jump = true;
    if (b.state === "eyeOpen" || b.state === "stunned") {
      eyeWindows++;
      const attack = shogEyeApproach(api, b, p);
      input = { ...input, ...attack };
      if (attack.dash) attackDelay = 6;
    } else if (attackDelay > 0) {
      attackDelay--;
      input = { ...input, right: true };
    } else if (b.state === "crawl" || b.state === "emerge" || b.state === "recover") {
      // Keep a body-length lane during neutral movement. It is close enough
      // to reach the next eye window, but never idles inside the boss body.
      if (p.x < b.x + 120) input.right = true;
      else if (p.x > b.x + 180) input.left = true;
    } else if (b.state === "lungeWarn") {
      // Bait the committed charge, then run against its locked direction.
      input.left = b.dir < 0;
      input.right = b.dir > 0;
      if (p.grounded) { input.jump = true; jumpHeld = 24; }
      if (entered && p.canDash) { input.dash = true; }
    } else if (b.state === "slamWarn" || b.state === "grin") {
      // The marked columns and rollers are centered around the player's
      // current lane. Move to the nearest wall and stay there.
      input.left = p.x <= 480;
      input.right = p.x > 480;
      if (p.grounded) { input.jump = true; jumpHeld = 30; }
      if (entered && p.canDash) { input.dash = true; }
    } else if (b.state === "lunge") {
      input.left = b.dir < 0;
      input.right = b.dir > 0;
      if (p.grounded) { input.jump = true; jumpHeld = 18; }
    }
    step(api, input, edgeState);
    inputs.push({ frame, ...input });
    elapsedFrames = frame + 1;
    jumpHeld = Math.max(0, jumpHeld - 1);
    if (api.S.health < lastHealth) {
      damage += lastHealth - api.S.health;
      damageEvents.push({ frame, seconds: elapsedFrames * api.FIXED_DT, state: b.state, health: api.S.health });
    }
    lastHealth = api.S.health;
    hits = 3 - (api.S.boss?.pips ?? 0);
  }
  return { mode: api.S.mode, state: api.S.boss?.state, pips: api.S.boss?.pips, health: api.S.health, damage, damageEvents, elapsed: elapsedFrames * api.FIXED_DT, hits, eyeWindows, frames: elapsedFrames, inputs, timeline };
}

function routeTrace(api, inputs, frame, input) {
  inputs.push({ frame, ...input });
  step(api, input, api.__guardianEdges || (api.__guardianEdges = {}));
}

// Full first-form route. The ascent uses the real wall-jump and upward-dash
// physics to reach the boss elevators, then steers into each exposed crown.
export function fightUnbloomed({ bootGame=defaultBootGame, existingApi=null }={}) {
 const api=existingApi||bootGame().api;
 if(!existingApi){api.S.runMode='adventure';api.configureRunRules('adventure');api.loadLevel(14);api.S.mode='play';}
 const timeline=[],damageEvents=[];let lastHealth=api.S.health;
 let held=false,lastDash=false,hold=0,air=-1,old='',delay=0;let dir=1;const inputs=[];
for(let f=0;f<9000&&api.S.mode==='play'&&api.S.boss.kind==='unbloomed'&&api.S.boss.state!=='falsebloom';f++){
 const p=api.S.player,b=api.S.boss;let jump=false,dash=false,up=false;
 if(b.state!==old){timeline.push({frame:f,state:b.state,pips:b.pips,x:p.x,y:p.y,health:api.S.health});old=b.state;}
 const tx=b.state==='open'?b.x:(b.crownX<504?b.crownX-63:b.crownX+63);
 dir=Math.abs(tx-p.x-5)>6?Math.sign(tx-p.x-5):0;
 // Keep clear of the closed crown while riding or growing steps beside it.
 if(b.state!=='open'&&p.y<100&&Math.abs(p.x+5-b.x)<55)dir=p.x+5<b.x?-1:1;
 if(delay>0)delay--;
 if(p.grounded&&hold===0&&!delay){hold=26;air=0;delay=34;}
 if(air>=0){air++;if(air>30)air=-1;}
 if(p.canDash&&p.y>40&&!p.dashing&&f%24===0){dash=true;up=true;}
 if(b.state==='open'&&p.y<58){hold=Math.abs(p.x+5-b.x)>27?2:0;up=false;dash=false;}
 if(b.state!=='open'&&p.y<50&&p.vy>0)hold=2;
 if(hold>0){jump=true;hold--;}
 api.keys.KeyD=dir>0;api.keys.KeyA=dir<0;api.keys.KeyW=up;api.keys.Space=jump;api.just.Space=jump&&!held;api.just.ShiftLeft=dash&&!lastDash;held=jump;lastDash=dash;inputs.push({right:dir>0,left:dir<0,up,jump,dash});api.tick(api.FIXED_DT);if(api.S.health<lastHealth)damageEvents.push({frame:f,seconds:(f+1)*api.FIXED_DT,state:b.state,health:api.S.health});lastHealth=api.S.health;
}
 return {mode:api.S.mode,state:api.S.boss.state,pips:api.S.boss.pips,health:api.S.health,elapsed:inputs.length*api.FIXED_DT,frames:inputs.length,inputs,timeline,damageEvents};
}

// Boar Pit route. Charges are baited from the opposite side, then the player
// jumps over the crash and uses a real down-dash onto the marked flank.
export function fightBoar({ bootGame=defaultBootGame, existingApi=null }={}) {
 const api=existingApi||bootGame().api;
 if(!existingApi){api.S.runMode='adventure';api.configureRunRules('adventure');api.loadLevel(12);api.S.mode='play';}
 const timeline=[],damageEvents=[];let lastHealth=api.S.health;
 let held=false,lastDash=false,hold=0,dodge=-1,old='',n=0;const inputs=[];
for(let f=0;f<7200&&api.S.mode==='play';f++){
 const p=api.S.player,b=api.S.boss;let dir=0,jump=false,dash=false,down=false;
 if(b.state!==old){timeline.push({frame:f,state:b.state,pips:b.pips,x:p.x,y:p.y,bx:b.x,health:api.S.health});old=b.state;}
 if(b.state==='intro'){dir=Math.abs(p.x-175)>5?Math.sign(175-p.x):0;}
 else if(b.state==='warn'){dir=0;}
 else if(b.state==='charge'){
  const distance=(b.x-p.x-5)*-b.dir;
  if(distance>0&&distance<120&&p.grounded&&dodge<0){dodge=0;hold=28;}
 }else if(b.state==='side'||b.state==='crash'){
  const dx=b.x-p.x-5;dir=Math.abs(dx)>5?Math.sign(dx):0;
  if(Math.abs(dx)>95&&p.canDash&&p.grounded&&f%24===0)dash=true;
  if(b.state==='side'&&Math.abs(dx)<47&&p.grounded){hold=24;}
  if(b.state==='side'&&Math.abs(dx)<17&&p.y+p.h<222&&p.canDash){dash=true;down=true;dir=0;hold=0;}
 }else if(b.state==='getup'){dir=-b.dir;}
 else if(b.state==='defeated')dir=1;
 if(dodge>=0){dir=-b.dir;if(dodge===12)dash=true;dodge++;if(dodge>25)dodge=-1;}
 if(hold>0){jump=true;hold--;}
 api.keys.KeyD=dir>0;api.keys.KeyA=dir<0;api.keys.KeyS=down;api.keys.Space=jump;api.just.Space=jump&&!held;api.just.ShiftLeft=dash&&!lastDash;held=jump;lastDash=dash;inputs.push({right:dir>0,left:dir<0,down,jump, dash});api.tick(api.FIXED_DT);if(api.S.health<lastHealth)damageEvents.push({frame:f,seconds:(f+1)*api.FIXED_DT,state:b.state,health:api.S.health});lastHealth=api.S.health;
}
 return {mode:api.S.mode,state:api.S.boss.state,pips:api.S.boss.pips,health:api.S.health,elapsed:inputs.length*api.FIXED_DT,frames:inputs.length,inputs,timeline,damageEvents};
}

export { clearInput, step };
