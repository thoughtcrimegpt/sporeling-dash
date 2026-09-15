import { bootGame } from "./game-harness.mjs";

// A local verification controller for the running routes. It looks only
// two tiles ahead and uses ordinary jumps and bloom crossings.
// It does not search possible futures or change the player's resources.
export function probePracticalRoute(levelIndex, { includeEnemies = false } = {}) {
  const { api } = bootGame();
  api.prepareRouteProbe(levelIndex, includeEnemies);
  api.S.lesson = null;
  const map = api.LEVELS[levelIndex].map;
  const p = api.S.player, goalX = api.S.goal.x;
  const solid = (c, r) => /[#Xq]/.test(map[r]?.[c] || ".");
  let phase = -1, dash = false, jumps = 0, dashes = 0;
  let restIndex=0;const restStops=levelIndex===1?[{x:875},{x:1460},{x:1760}]:[];
  const inputs = [];
  for (let frame = 0; frame < 3000 && api.S.mode === "play"; frame++) {
    api.keys.KeyD = p.x < goalX;
    api.keys.KeyA = p.x > goalX + 4;
    api.keys.Space = phase >= 0 && phase < 25;
    const nearbyEnemy = api.S.enemies.some(e => !e.dead &&
      e.x + e.w >= p.x + p.w && e.x - (p.x + p.w) <= 32 &&
      Math.abs(e.y + e.h / 2 - (p.y + p.h / 2)) < 15);
    if (p.grounded && phase < 0 && p.x < goalX - 24) {
      const c = Math.floor((p.x + 32) / 16), r = Math.floor((p.y + p.h - 1) / 16);
      const wall = solid(c, r) || solid(c, r - 1);
      let thorn = false;
      for (let row = r - 2; row <= r + 2; row++) {
        for (let col = Math.floor(p.x / 16); col <= Math.floor((p.x + 24) / 16); col++) {
          if (map[row]?.[col] === "S") thorn = true;
        }
      }
      const gap = [1, 2, 3].every(d => !solid(Math.floor((p.x + 26) / 16), r + d));
      if (wall || thorn || gap || nearbyEnemy) {
        api.just.Space = true; api.keys.Space = true;
        phase = 0; dash = thorn || gap; jumps++;
      }
    }
    if (phase === 12 && dash) { api.just.ShiftLeft = true; dashes++; }
    // The last crossing follows a low roof and a flying enemy. Wait until
    // clear of the roof before placing its first bloom.
    if(levelIndex===1 && p.x>1885 && p.x<1990 && p.y<184 && !p.grounded && p.canDash && phase>15) {
      api.just.ShiftLeft=true; dashes++; phase=12;
    }
    const rest=restStops[restIndex];
    if(rest&&p.x>rest.x-28&&p.x<rest.x+80){
      if(p.grounded&&api.solidBlocked(p.x,p.y+p.h,p.w,1)&&p.spores===3)restIndex++;
      else {
        api.keys.KeyD=p.x<rest.x-3;api.keys.KeyA=p.x>rest.x+3;
        api.keys.Space=false;api.just.Space=false;api.just.ShiftLeft=false;phase=-1;
      }
    }
    inputs.push({ right: !!api.keys.KeyD, left: !!api.keys.KeyA, holdJump: !!api.keys.Space,
      jump: !!api.just.Space, dash: !!api.just.ShiftLeft });
    api.tick(api.FIXED_DT);
    if (phase >= 0) phase++;
    if (phase >= 26 && p.grounded) phase = -1;
  }
  return { ok: api.S.mode === "clear", level: api.LEVELS[levelIndex].name,
    mode: api.S.mode, x: p.x, y: p.y, health: api.S.health,
    seconds: api.S.score.time, jumps: inputs.filter(i=>i.jump).length,
    dashes: inputs.filter(i=>i.dash).length, inputs };
}
