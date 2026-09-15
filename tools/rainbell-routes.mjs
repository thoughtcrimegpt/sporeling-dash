import { bootGame } from "./game-harness.mjs";

function beginAdventure(api, levelIndex) {
  api.S.runMode = "adventure";
  api.configureRunRules("adventure");
  api.loadLevel(levelIndex);
  api.S.mode = "play";
  api.S.lesson = null;
  api.S.bannerT = 0;
  api.S.hint = null;
  return api.S.player;
}

function runGround(api, levelIndex) {
  const p = beginAdventure(api, levelIndex);
  const goalX = api.S.goal.x;
  const inputs = [];
  let phase = -1;
  let dash = false;
  for (let frame = 0; frame < 3000 && api.S.mode === "play"; frame++) {
    api.keys.KeyD = p.x < goalX;
    api.keys.KeyA = p.x > goalX + 4;
    api.keys.Space = phase >= 0 && phase < 25;
    const gapAhead = p.grounded && !api.solidBlocked(p.x + 26, p.y + p.h, p.w, 1);
    if (p.grounded && phase < 0 && p.x < goalX - 24 && gapAhead) {
      api.just.Space = true;
      api.keys.Space = true;
      phase = 0;
      dash = true;
    }
    if (phase === 12 && dash) api.just.ShiftLeft = true;
    inputs.push({ right: !!api.keys.KeyD, left: !!api.keys.KeyA, holdJump: !!api.keys.Space, jump: !!api.just.Space, dash: !!api.just.ShiftLeft });
    api.tick(api.FIXED_DT);
    if (phase >= 0) phase++;
    if (phase >= 26 && p.grounded) phase = -1;
  }
  return { ok: api.S.mode === "clear", mode: api.S.mode, level: api.LEVELS[levelIndex].name, health: api.S.health, seconds: api.S.score.time, inputs };
}

function runLift(api, levelIndex) {
  beginAdventure(api,levelIndex);
  const shelves=[[32,160,608],[224,352,560],[48,192,496],[240,368,432],[32,144,368],[208,336,320],[48,192,256],[240,368,192],[32,160,128],[208,352,64]];
  let n=0,air=-1,release=0,held=false;const inputs=[];
  for(let f=0;f<3600&&api.S.mode==='play';f++){
    const p=api.S.player;let [l,r,y]=shelves[n]||shelves.at(-1);
    if(n<shelves.length&&p.grounded&&p.y+p.h<=y+.1&&p.x+p.w>l&&p.x<r){n++;air=-1;release=8;[l,r,y]=shelves[n]||shelves.at(-1);}
    const above=p.y+p.h<y-2;
    // Approach the exposed lip before rising. Never steer into its underside.
    const tx=n>=shelves.length?api.S.goal.x:above?(l+r)/2:p.x<l?l-p.w-4:p.x>=r?r+4:(Math.abs(p.x-l)<Math.abs(p.x-r)?l-p.w-4:r+4);
    const dir=Math.abs(tx-p.x)>5?Math.sign(tx-p.x):0;
    let jump=false,dash=false,up=false;
    if(release>0)release--;
    if(n<shelves.length&&p.grounded&&air<0&&!release){air=0;jump=true;}
    if(air>=0){if(air<26)jump=true;if(air===12&&p.canDash){dash=true;up=p.y+p.h>y-8;}air++;if(air>28&&p.grounded){air=-1;release=8;}}
    api.keys.KeyA=dir<0;api.keys.KeyD=dir>0;api.keys.KeyW=up;api.keys.Space=jump;api.just.Space=jump&&!held;api.just.ShiftLeft=dash;held=jump;
    inputs.push({right:dir>0,left:dir<0,up,holdJump:jump,jump:!!api.just.Space,dash});api.tick(api.FIXED_DT);
  }
  return {ok:api.S.mode==='clear',mode:api.S.mode,level:api.LEVELS[levelIndex].name,health:api.S.health,seconds:api.S.score.time,inputs};
}
function runSluice(api,index){
  beginAdventure(api,index);let held=false,release=0,air=-1;const inputs=[];
  for(let f=0;f<3600&&api.S.mode==='play';f++){
    const p=api.S.player;let jump=!p.grounded,dash=false;
    if(p.grounded){release++;if(p.x>1450&&!api.solidBlocked(p.x+26,p.y+p.h,p.w,1)&&release>5)air=0;}else release=0;
    if(air>=0){jump=air<27;dash=air===12;air++;if(p.grounded&&air>28)air=-1;}
    api.keys.KeyD=p.x<api.S.goal.x+3;api.keys.Space=jump;api.just.Space=jump&&!held;api.just.ShiftLeft=dash;held=jump;
    inputs.push({right:!!api.keys.KeyD,holdJump:jump,jump:!!api.just.Space,dash});api.tick(api.FIXED_DT);
  }
  return {ok:api.S.mode==='clear',mode:api.S.mode,level:api.LEVELS[index].name,health:api.S.health,seconds:api.S.score.time,inputs};
}

export function probeRainbellRoutes() {
  const results = [];
  for (const levelIndex of [19, 21, 22]) {
    const { api } = bootGame();
    results.push(levelIndex===21?runSluice(api,levelIndex):runGround(api, levelIndex));
  }
  const { api } = bootGame();
  results.push(runLift(api, 20));
  return results;
}

export { runLift, runGround, runSluice };
