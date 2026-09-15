/* Rainbell's rings and guardian share one readable hazard and one counter.
 * The host owns player physics, damage grace, audio, and progression. */
(function (root) {
  'use strict';
  const FLOOR = 192, LEFT = 16, RIGHT = 304, OPEN_TIME = 2.6;
  const AMBER = '#f3bf7c', MINT = '#b8f2c9';
  function create() {
    return { kind: 'rainmaker', state: 'intro', t: 0, x: 248, y: FLOOR - 30,
      pips: 4, maxPips: 4, dir: -1, waves: [], fired: 0, rounds: 0,
      caption: 'Dodge his rings and tongue. Dash the glowing throat.' };
  }
  function ring(x, floor, dir, speed, left, right) {
    return { x: x - 6, y: floor - 7, w: 12, h: 7, dir, speed, left, right, hit: false };
  }
  function updateRings(waves, dt, ctx) {
    for (const w of waves) {
      w.x += w.dir * w.speed * dt;
      if (!w.hit && ctx.overlap(ctx.player, w)) {
        w.hit = true;
        ctx.hurt(w.x + 6, 'a water ring');
      }
    }
    return waves.filter(w => w.x + w.w >= w.left && w.x <= w.right);
  }
  function enter(b, state, caption, ctx) {
    b.state = state; b.t = 0;
    if (caption) { b.caption = caption; ctx.notice?.(caption); }
  }
  function tell(b, ctx) {
    b.dir = Math.sign(ctx.player.x + ctx.player.w / 2 - b.x) || -1;
    b.fired = 0; b.count = b.pips <= 2 ? 2 : 1;
    enter(b, 'tell', b.count === 2 ? 'Two rings. Clear them, then watch his mouth.' : 'Jump the ring. Watch his mouth next.', ctx);
    ctx.cue?.('bossWarn');
  }
  function tongue(b, ctx) {
    b.waves = [];
    b.dir = Math.sign(ctx.player.x + ctx.player.w / 2 - b.x) || -1;
    b.tongue = { x: b.dir < 0 ? LEFT : b.x + 18, y: FLOOR - 13,
      w: b.dir < 0 ? b.x - 18 - LEFT : RIGHT - b.x - 18, h: 8 };
    enter(b, 'tongueTell', 'Tongue low! Jump over it, then dash his throat.', ctx);
    ctx.cue?.('bossWarn');
  }
  function leap(b, ctx) {
    b.waves = []; b.tongue = null;
    b.fromX = b.x;
    // The mark locks here. Walking away is always sufficient during the tell.
    b.toX = Math.max(72, Math.min(248, ctx.player.x + ctx.player.w / 2));
    enter(b, 'hopTell', 'He marked your landing spot. Move away!', ctx);
    ctx.cue?.('bossWarn');
  }
  function open(b, ctx) {
    b.waves = []; b.tongue = null;
    enter(b, 'open', 'Out of breath. Dash into the glowing throat!', ctx);
    ctx.cue?.('check');
  }
  function update(b, dt, ctx) {
    if (b.state === 'defeated') return;
    b.t += dt;
    if (b.state === 'intro') { if (b.t >= 2.2) tell(b, ctx); }
    else if (b.state === 'tell') {
      if (b.t >= .9) { enter(b, 'rings', '', ctx); ctx.cue?.('bossHorn'); }
    } else if (b.state === 'rings') {
      if (b.fired < b.count && b.t >= b.fired * .85) {
        b.waves.push(ring(b.x, FLOOR, b.dir, 112, LEFT, RIGHT)); b.fired++;
      }
      b.waves = updateRings(b.waves, dt, ctx);
      if (b.fired === b.count && !b.waves.length) tongue(b, ctx);
    } else if (b.state === 'tongueTell') {
      if (b.t >= .85) { enter(b, 'tongue', '', ctx); ctx.cue?.('bossHorn'); }
    } else if (b.state === 'tongue') {
      if (b.t <= .28 && ctx.overlap(ctx.player, b.tongue)) ctx.hurt(b.x, 'Brindle’s tongue');
      if (b.t >= .5) open(b, ctx);
    } else if (b.state === 'open') {
      const throat = { x: b.x - 29, y: FLOOR - 26, w: 58, h: 26 };
      if (ctx.player.dashing && ctx.overlap(ctx.player, throat)) {
        ctx.hit(b); b.waves = []; b.tongue = null;
        if (b.pips <= 0) { b.y = FLOOR - 30; ctx.defeat(b); return; }
        enter(b, 'recoil', 'A good hit. Find your footing.', ctx);
      } else if (b.t >= OPEN_TIME) { b.leaps = 0; leap(b, ctx); }
    } else if (b.state === 'recoil') {
      if (b.t >= .85) { b.leaps = 0; leap(b, ctx); }
    } else if (b.state === 'hopTell') {
      if (b.t >= .85) enter(b, 'hop', '', ctx);
    } else if (b.state === 'hop') {
      const t = Math.min(1, b.t / .8), ease = t * t * (3 - 2 * t);
      b.x = b.fromX + (b.toX - b.fromX) * ease;
      b.y = FLOOR - 30 - Math.sin(t * Math.PI) * 70;
      // Only the descending last part of the leap is an impact, matching the mark.
      if (t > .88 && ctx.overlap(ctx.player, {x:b.x-25,y:b.y+6,w:50,h:24})) ctx.hurt(b.x, 'Brindle’s landing');
      if (t >= 1) {
        b.x = b.toX; b.y = FLOOR - 30; b.leaps++;
        b.waves = [-1, 1].map(d => ring(b.x, FLOOR, d, 105, LEFT, RIGHT));
        enter(b, 'splash', 'Jump the landing ripple.', ctx); ctx.cue?.('bossSlam');
      }
    } else if (b.state === 'splash') {
      b.waves = updateRings(b.waves, dt, ctx);
      if (!b.waves.length && b.t > .7) {
        if (b.pips === 1 && b.leaps < 2) leap(b, ctx);
        else if (b.pips <= 2) tongue(b, ctx);
        else open(b, ctx);
      }
    }
  }
  function createPools(metadata = []) {
    return metadata.map(m => ({ ...m, t: 0, state: 'idle', waves: [], seen: false }));
  }
  function updatePools(pools, dt, ctx) {
    for (const p of pools) {
      const near = Math.abs(ctx.player.x - p.x) < 190 && Math.abs(ctx.player.y + ctx.player.h - p.y) < 115;
      // Re-entering a lane always earns a fresh warning.
      if (!near) { p.state = 'idle'; p.t = 0; p.waves = []; continue; }
      p.t += dt;
      if (p.state === 'idle') {
        p.state = 'warn'; p.t = 0;
        if (!p.seen) { p.seen = true; ctx.notice?.('The bell swells before a ring. Jump over the ring.'); }
      } else if (p.state === 'warn' && p.t >= .95) {
        p.waves.push(ring(p.x, p.y, p.dir, 95, p.left, p.right));
        p.state = 'rest'; p.t = 0; ctx.cue?.('talk');
      } else if (p.state === 'rest' && p.t >= Math.max(4.5, p.period || 4.5) && !p.waves.length) {
        p.state = 'warn'; p.t = 0;
      }
      p.waves = updateRings(p.waves, dt, ctx);
    }
  }
  function oval(g, x, y, rx, ry, color, rot = 0) {
    g.fillStyle = color; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); g.fill();
  }
  function line(g, pts, color, width = 1) {
    g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round';
    g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke();
  }
  function drawRings(g, waves) {
    for (const w of waves) {
      g.strokeStyle = AMBER; g.lineWidth = 1.5;
      g.beginPath(); g.ellipse(w.x + 6, w.y + 3.5, 5.3, 2.8, 0, 0, Math.PI * 2); g.stroke();
      line(g, [[w.x + 6 - w.dir * 13, w.y + 6], [w.x + 6, w.y + 6]], '#9ed5d0', 1);
    }
  }
  function drawPools(g, pools, o) {
    for (const p of pools) {
      const warn = p.state === 'warn', swell = warn ? Math.min(1, p.t / .95) : 0;
      line(g, [[p.x, p.y], [p.x, p.y - 14]], '#63856b', 2);
      oval(g, p.x, p.y - 14, 6 + swell * 3, 5, warn ? AMBER : '#9caed0');
      oval(g, p.x - 4, p.y - 7, 5, 2, '#9dad75', -.5);
      if (warn) {
        line(g, [[p.x, p.y - 24], [p.x + p.dir * 15, p.y - 24]], AMBER, 1.5);
        line(g, [[p.x + p.dir * 10, p.y - 28], [p.x + p.dir * 15, p.y - 24], [p.x + p.dir * 10, p.y - 20]], AMBER, 1.5);
      }
      drawRings(g, p.waves);
    }
  }
  function draw(g, b, o) {
    const time = o.reducedMotion ? 0 : o.time, x = b.x, y = b.y;
    const open = b.state === 'open', sleeping = b.state === 'defeated';
    const warn = b.state === 'tell', swell = warn ? Math.min(1, b.t / .9) : 0;
    const breathe = Math.sin(time * (open ? 9 : 2.2)) * (open ? 2 : .8);
    g.save();
    if (b.tongue && ['tongueTell', 'tongue'].includes(b.state)) {
      const t = b.tongue;
      if (b.state === 'tongueTell') {
        g.setLineDash([4, 4]); line(g, [[t.x,t.y+4],[t.x+t.w,t.y+4]], AMBER, 1.5); g.setLineDash([]);
        for (let n=0;n<3;n++) line(g,[[x+b.dir*(40+n*30),t.y],[x+b.dir*(47+n*30),t.y+4],[x+b.dir*(40+n*30),t.y+8]],AMBER,1);
      } else {
        const reach = b.t < .28 ? Math.min(1,b.t/.045) : Math.max(0,1-(b.t-.28)/.22);
        const start=x+b.dir*18, end=start+b.dir*t.w*reach;
        line(g,[[start,t.y+4],[end,t.y+4]],'#713847',8);
        line(g,[[start,t.y+2],[end,t.y+2]],'#e49f98',2);
        oval(g,end,t.y+4,6,4,'#d77c81');
      }
    }
    oval(g, x, FLOOR - 1, 31, 3, 'rgba(29,48,47,.25)');
    for (const d of [-1, 1]) {
      oval(g, x + d * 23, y + 24, 12, 7, '#638474', d * -.3);
      oval(g, x + d * 28, y + 28, 9, 3, '#8eab8b');
      line(g, [[x + d * 23, y + 27], [x + d * 29, y + 28], [x + d * 34, y + 27]], '#c1cbae');
    }
    const skin = g.createLinearGradient(x, y, x, y + 30);
    skin.addColorStop(0, '#b0b992'); skin.addColorStop(1, '#628374');
    oval(g, x, y + 15 + breathe, 27, 16, skin);
    oval(g, x, y + 21, 19 + swell * 3, 10 + swell * 2, open ? MINT : '#dbd3a2');
    for (const d of [-1, 1]) {
      oval(g, x + d * 16, y + 3, 10, 9, '#a5b594');
      if (sleeping) line(g, [[x + d * 16 - 4, y + 3], [x + d * 16, y + 5], [x + d * 16 + 4, y + 3]], '#354e48');
      else {
        oval(g, x + d * 16, y + 2, 6, 5, '#fff1c9');
        oval(g, x + d * 16 + b.dir, y + 2, 2, 3.4, '#344d45');
        oval(g, x + d * 16 + b.dir + 1, y + .5, .8, 1, '#fffbed');
      }
      oval(g, x + d * 23, y + 13, 7 + swell * 2, 4 + swell * 3, warn ? '#d6b281' : '#94a485');
    }
    line(g, [[x - 15, y + 12], [x - 7, y + 15], [x + 7, y + 15], [x + 15, y + 12]], '#536b58');
    for (const [dx, dy] of [[-8, -1], [3, -2], [10, 0]]) oval(g, x + dx, y + dy, 2.5, 1.5, '#70896c');
    // A small bellflower on his head connects him to the hazards in the path.
    line(g, [[x - 3, y - 2], [x - 5, y - 13]], '#8b9d6c', 1.7);
    for (const d of [-1, 0, 1]) oval(g, x - 5 + d * 3, y - 14, 3, 3.5, sleeping ? '#f4d694' : '#a4accb', d * .5);
    if (open) {
      g.strokeStyle = MINT; g.lineWidth = 1.3; g.beginPath();
      g.ellipse(x, y + 22, 24, 10, 0, 0, Math.PI * 2); g.stroke();
      for (const d of [-1, 1]) line(g, [[x + d * 40, y + 17], [x + d * 33, y + 22], [x + d * 40, y + 27]], MINT, 1.5);
      g.fillStyle = '#405c52'; g.fillRect(x - 20, y + 34, 40, 2);
      g.fillStyle = MINT; g.fillRect(x - 20, y + 34, 40 * Math.max(0, 1 - b.t / OPEN_TIME), 2);
    }
    if (warn) {
      for (let n = 0; n < b.count; n++) oval(g, x - (b.count - 1) * 6 + n * 12, y - 25, 4, 2.5, AMBER);
      line(g, [[x + b.dir * 34, FLOOR - 5], [x + b.dir * 54, FLOOR - 5]], AMBER, 2);
      line(g, [[x + b.dir * 48, FLOOR - 10], [x + b.dir * 54, FLOOR - 5], [x + b.dir * 48, FLOOR]], AMBER, 1.5);
    }
    if (b.state === 'hopTell' || b.state === 'hop') {
      g.strokeStyle = '#b4cdba'; g.lineWidth = 1; g.setLineDash([3, 4]);
      g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo(160, y - 70, b.toX, FLOOR - 2); g.stroke(); g.setLineDash([]);
      oval(g, b.toX, FLOOR - 2, 28, 2, 'rgba(243,191,124,.6)');
      line(g,[[b.toX-24,FLOOR-7],[b.toX+24,FLOOR-7]],AMBER,2);
    }
    drawRings(g, b.waves);
    g.restore();
  }
  root.SporelingRainmaker = { create, update, draw, createPools, updatePools, drawPools, OPEN_TIME };
})(typeof window !== 'undefined' ? window : globalThis);
