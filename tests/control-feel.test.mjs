import test from 'node:test';
import assert from 'node:assert/strict';
import { bootGame } from '../tools/game-harness.mjs';

function flatGame() {
  const game = bootGame(), { api } = game;
  api.prepareRouteProbe(2, false);
  api.setTestMap(Array.from({length:20}, (_, y) => (y >= 18 ? '#' : '.').repeat(80)));
  Object.assign(api.S.player, { x:100, y:288-api.S.player.h, vx:0, vy:0, grounded:true });
  api.S.lesson=null; api.S.freezeT=0;
  return game;
}
function jumpHeight(held) {
  const { api }=flatGame(), p=api.S.player, start=p.y;
  api.just.Space=true; api.keys.Space=held;
  let peak=start;
  for(let i=0;i<45;i++){api.tick(api.FIXED_DT);peak=Math.min(peak,p.y);}
  return start-peak;
}
test('a quick jump tap preserves the original low hop and a held jump reaches full height',()=>{
  const tap=jumpHeight(false), held=jumpHeight(true);
  assert.ok(tap>=4 && tap<10, `short tap rose ${tap}px`);
  assert.ok(held>=35 && held>tap+15, `held ${held}px, tap ${tap}px`);
});
test('keyboard and touch diagonal aiming retain full horizontal movement',()=>{
  for(const touch of [false,true]){
    const {api}=flatGame();
    if(touch){api.TOUCH.active=true;api.TOUCH.ax=1;api.TOUCH.ay=-1;}
    else {api.keys.KeyD=true;api.keys.KeyW=true;}
    assert.equal(api.readInput().ax,1);
    for(let i=0;i<12;i++)api.tick(api.FIXED_DT);
    assert.equal(api.S.player.vx,110);
  }
});
test('normal traversal dashes retain the original brief hitstop beat',()=>{
  const {api}=flatGame(),p=api.S.player;p.y=200;p.grounded=false;
  api.just.ShiftLeft=true;api.keys.KeyD=true;
  const positions=[];
  for(let i=0;i<8;i++){api.tick(api.FIXED_DT);positions.push(p.x);}
  assert.equal(positions[0], positions[1]);
  assert.equal(positions[1], positions[2]);
  assert.ok(positions[7]>positions[2],JSON.stringify(positions));
});
test('keyboard and touch dash intent survives impact hitstop',()=>{
  for(const touch of [false,true]){
    const {api}=flatGame(),p=api.S.player;p.y=200;p.grounded=false;api.S.freezeT=.05;
    if(touch){api.TOUCH.active=true;api.TOUCH.edges.dash=true;api.TOUCH.dashIntent=true;api.TOUCH.dashX=0;api.TOUCH.dashY=-1;}
    else {api.just.ShiftLeft=true;api.keys.KeyW=true;}
    api.tick(api.FIXED_DT);api.keys.KeyW=false;
    for(let i=0;i<4;i++)api.tick(api.FIXED_DT);
    assert.equal(p.dashing,true);assert.equal(p.dashDX,0);assert.equal(p.dashDY,-1);
  }
});
test('jump pressed early in a dash survives until its bloom landing',()=>{
  const {api}=flatGame(),p=api.S.player;p.y=180;p.grounded=false;
  api.just.ShiftLeft=true;api.keys.KeyD=true;api.tick(api.FIXED_DT);
  api.keys.KeyD=false;api.just.Space=true;api.keys.Space=true;
  let jumped=false;
  for(let i=0;i<24;i++){api.tick(api.FIXED_DT);if(!p.dashing&&p.vy<-200)jumped=true;}
  assert.ok(jumped,'buffered jump never launched from the new bloom');
});
test('airborne release and reversal respond within a short control window',()=>{
  const {api}=flatGame(),p=api.S.player;p.y=120;p.grounded=false;p.vx=110;
  for(let i=0;i<5;i++)api.tick(api.FIXED_DT);
  assert.ok(p.vx>0 && p.vx<40,`air release changed too abruptly: ${p.vx}`);
  p.vx=110;api.keys.KeyA=true;
  for(let i=0;i<15;i++)api.tick(api.FIXED_DT);
  assert.ok(p.vx<0,`still travelling right at ${p.vx}`);
});

test('a bloom endpoint keeps post-dash momentum for natural landing',()=>{
  const {api}=flatGame(),p=api.S.player;
  p.y=200;p.grounded=false;
  api.just.ShiftLeft=true;api.keys.KeyD=true;
  api.tick(api.FIXED_DT);api.keys.KeyD=false;
  for(let i=0;i<20 && p.dashing;i++)api.tick(api.FIXED_DT);
  assert.equal(p.dashing,false);
  assert.equal(api.S.blooms.length,1);
  assert.notEqual(p.vx,0);
});
test('pointer dash retains precise aim through an impact freeze',()=>{
  const {api}=flatGame(),p=api.S.player;p.y=200;p.grounded=false;api.S.freezeT=.05;
  api.POINTER.dx=.8;api.POINTER.dy=-.6;api.POINTER.dashEdge=true;
  api.tick(api.FIXED_DT);
  for(let i=0;i<4;i++)api.tick(api.FIXED_DT);
  assert.equal(p.dashing,true);assert.ok(Math.abs(p.dashDX-.8)<.001);assert.ok(Math.abs(p.dashDY+.6)<.001);
});
