import assert from "node:assert/strict";
import test from "node:test";
import { bootGame } from "../tools/game-harness.mjs";
import { probePracticalRoute } from "../tools/practical-route.mjs";

// Authored crossings must accept a normal running jump followed by one
// dash aimed at the authored landing. No route search, steering corrections, or extra jumps.
// Enemy traversal is checked separately; these runs isolate terrain timing.
const crossings = [
  {name:'Hollow first open gap',level:0,x:438,y:182,end:548},
  {name:'Reedbank rising gap',bloomChain:true,level:19,x:280,y:182,end:432},
  {name:'Stillwater rising gap',bloomChain:true,level:22,x:296,y:182,end:448},
];

test("Rainbell's ground route connects with ordinary jumps and horizontal dashes", () => {
  const result = probePracticalRoute(7);
  assert.ok(result.ok, `${result.level}: ${result.mode} at ${result.x},${result.y}`);
  assert.equal(result.health, 4);
});

for (const crossing of crossings) {
  test(`${crossing.name} accepts varied jump/dash timing on keyboard, mouse, and touch`, () => {
    for (const device of ["keyboard", "mouse", "touch"]) {
      for (const offset of [-4, 0, 4]) for (const dashFrame of [9, 12, 15]) {
        const { api } = bootGame();
        api.prepareRouteProbe(crossing.level, false);
        api.S.lesson = null;
        const p = api.S.player;
        Object.assign(p, { x: crossing.x + offset, y: crossing.y, vx: 110, vy: 0, grounded: true });
        const label = `${device}, takeoff ${offset}px, dash ${dashFrame / 60}s`;
        assert.equal(api.solidBlocked(p.x, p.y, p.w, p.h), false, label);
        assert.equal(api.solidBlocked(p.x, p.y + p.h, p.w, 1), true, `supported takeoff: ${label}`);
        if (device === "touch") {
          api.TOUCH.active = true; api.TOUCH.ax = 1;
          api.TOUCH.jump = true; api.TOUCH.edges.jump = true;
        } else {
          api.keys.KeyD = true;
          if (device === "mouse") { api.POINTER.jump = true; api.POINTER.jumpEdge = true; }
          else { api.keys.Space = true; api.just.Space = true; }
        }
        let landed = false, chained = false, chainRelease = -1;
        for (let frame = 0; frame < 120; frame++) {
          if (frame === dashFrame) {
            if (device === "mouse") {
              api.POINTER.dx = 1; api.POINTER.dy = crossing.dy || 0; api.POINTER.dashEdge = true;
            } else if (device === "touch") {
              api.TOUCH.dashX = 1; api.TOUCH.dashY = crossing.dy || 0;
              api.TOUCH.dashIntent = true; api.TOUCH.edges.dash = true;
            } else { api.just.ShiftLeft = true; api.keys.KeyW = crossing.dy === -1; }
          }
          if (frame === dashFrame + 13) {
            api.keys.Space = false; api.POINTER.jump = false; api.TOUCH.jump = false;
          }
          if (crossing.bloomChain && !chained && frame > dashFrame + 14 && p.grounded && !api.solidBlocked(p.x,p.y+p.h,p.w,1)) {
            chained=true; chainRelease=frame+25;
            if(device==='touch'){api.TOUCH.jump=true;api.TOUCH.edges.jump=true;}
            else if(device==='mouse'){api.POINTER.jump=true;api.POINTER.jumpEdge=true;}
            else {api.keys.Space=true;api.just.Space=true;}
          }
          if(frame===chainRelease){api.keys.Space=false;api.POINTER.jump=false;api.TOUCH.jump=false;}
          api.tick(api.FIXED_DT);
          assert.equal(api.S.mode, "play", `crossing interrupted: ${label}`);
          assert.equal(api.S.health, 4, `crossing caused damage: ${label}`);
          if (p.x >= crossing.end && p.grounded && api.solidBlocked(p.x, p.y + p.h, p.w, 1)) {
            landed = true;
            break;
          }
        }
        assert.ok(landed, `no permanent landing at ${p.x},${p.y}: ${label}`);
      }
    }
  });
}
