/* Procedural storybook art for Sporeling Dash.  The game owns timing and
 * collision; this module only paints.  It intentionally has no dependencies. */
(function (root) {
  "use strict";

  var cache = Object.create(null), plates = Object.create(null);
  var TAU = Math.PI * 2;
  var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };
  var fract = function (n) { return n - Math.floor(n); };
  var hash = function (n) { return fract(Math.sin(n * 12.9898) * 43758.5453); };
  var rgba = function (c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; };
  var palettes = {
    hearthwood: { sky: [245, 205, 145], deep: [68, 57, 63], moss: [83, 112, 77], gold: [244, 181, 91], water: [93, 155, 157] },
    lantern: { sky: [188, 160, 145], deep: [48, 53, 63], moss: [60, 92, 78], gold: [251, 197, 108], water: [76, 129, 141] },
    rainbell: { sky: [113, 145, 155], deep: [37, 57, 66], moss: [61, 104, 93], gold: [232, 185, 117], water: [91, 164, 176] },
    heartroot: { sky: [112, 92, 122], deep: [37, 34, 55], moss: [79, 83, 105], gold: [239, 174, 112], water: [87, 132, 151] }
  };

  function path(g, pts, fill, stroke, width) {
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = width || 1; g.stroke(); }
  }
  function blob(g, x, y, rx, ry, fill, rot) {
    g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = fill;
    g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill(); g.restore();
  }
  function glow(g, x, y, r, color, alpha) {
    var q = g.createRadialGradient(x, y, 0, x, y, r);
    q.addColorStop(0, rgba(color, alpha)); q.addColorStop(1, rgba(color, 0));
    g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }

  /* The player is the original 12x12 pixel sprite. Keep this map local so
   * title and gameplay use the same authored character and palette. */
  var SPR_PAL = { O:"#8a4432", C:"#e8764e", H:"#f8b088", D:"#c05038", B:"#f4dcae", S:"#d0b088", E:"#241810", W:"#fff6e0", R:"#e89890" };
  var F_HEAD = ["....CCCC....","..CCCCCCCC..",".CHHCCCCDCC.",".CHCCCCCDDC.","CCCCCCCCCCCC",".OOOOOOOOOO.","..BBBBBBBB.."];
  var F_EYES_OPEN = [".BBEWBBEWBB.",".BBEEBBEEBB.",".BRBBBBBBRB."];
  var F_EYES_SHUT = [".BBBBBBBBBB.",".BBEEBBEEBB.",".BRBBBBBBRB."];
  function makeFrame(eyes, feet) { return F_HEAD.concat(eyes,["..BBBBBBBB.."],[feet]); }
  var SPRITES = {
    idle1:makeFrame(F_EYES_OPEN,"..SS....SS.."), idle2:makeFrame(F_EYES_SHUT,"..SS....SS.."),
    run1:makeFrame(F_EYES_OPEN,".SS......SS."), run2:makeFrame(F_EYES_OPEN,"...SS..SS..."),
    run3:makeFrame(F_EYES_OPEN,"..SS....SS.."), run4:makeFrame(F_EYES_OPEN,"....SSSS...."),
    jump:makeFrame(F_EYES_OPEN,"...SS..SS..."), fall:makeFrame(F_EYES_OPEN,".S........S.")
  };
  function drawHero(g, options) {
    options = options || {}; var p = options.player || options;
    var x = Number(options.x != null ? options.x : p.x) || 0, y = Number(options.y != null ? options.y : (p.y + (p.h || 14))) || 0;
    var anim = String(p.anim || options.anim || "idle").toLowerCase(), t = Number(options.time || p.time) || 0;
    var reduced = !!(options.reducedMotion || p.reducedMotion), face = Number(p.facing || options.facing || 1) < 0 ? -1 : 1;
    var frame = Number(p.frame); if (!isFinite(frame)) frame = Math.floor(t * 10) & 3;
    var map;
    if (anim === "run") map = SPRITES["run" + ((frame & 3) + 1)];
    else if (anim === "jump" || anim === "dash") map = SPRITES.jump;
    else if (anim === "fall" || anim === "glide" || anim === "slide") map = SPRITES.fall;
    else map = (frame & 3) === 3 || p.blink ? SPRITES.idle2 : SPRITES.idle1;
    var renderScale = Number(options.scale) || 1, squish = Number(p.squish); if (!isFinite(squish) || squish <= 0) squish = 1;
    var sx = renderScale * (anim === "dash" ? 1.25 : 1) * (2 - squish), sy = renderScale * (anim === "dash" ? .8 : 1) * squish;
    g.save(); g.translate(x, y); g.scale(sx, sy);
    if (p.dashing || anim === "dash") {
      g.fillStyle = "#f0a888"; g.globalAlpha = 0.35; g.fillRect(-8, -12, 16, 14); g.globalAlpha = 1;
    }
    for (var r = 0; r < map.length; r++) for (var c = 0; c < map[r].length; c++) {
      var col = SPR_PAL[map[r][face < 0 ? map[r].length - 1 - c : c]]; if (col) { g.fillStyle = col; g.fillRect(c - 6, r - 12, 1, 1); }
    }
    if (anim === "glide") {
      g.fillStyle = SPR_PAL.O; g.fillRect(-8, -12, 16, 2);
      g.fillStyle = SPR_PAL.C; g.fillRect(-8, -14, 16, 2); g.fillRect(-7, -16, 14, 2); g.fillRect(-5, -17, 10, 1);
      g.fillStyle = SPR_PAL.H; g.fillRect(-4, -16, 5, 2); g.fillRect(-7, -14, 2, 1);
      g.fillStyle = SPR_PAL.D; g.fillRect(3, -15, 2, 2);
    }
    if (anim === "slide") {
      g.fillStyle = "rgb(104,170,122)";
      var wx = Number(p.wallDir) > 0 ? 5 : -7;
      g.fillRect(wx, -8, 2, 1); g.fillRect(wx, -4, 2, 1); g.fillRect(wx, 0, 2, 1);
    }
    if (anim === "idle" && (frame & 1) === 0) {
      g.fillStyle = "#c4a878"; g.fillRect(6, -14, 1, 1);
    }
    g.restore();
  }

  function makeLayer(w, h, act, reduced) {
    if (typeof document === "undefined" || !document.createElement) return null;
    var c = document.createElement("canvas"), scale = 4; c.width = w * scale; c.height = h * scale; var x = c.getContext("2d"); x.scale(scale, scale); paintStatic(x, w, h, act, reduced); return c;
  }
  function plateFor(act) {
    if (plates[act] || typeof Image === "undefined") return plates[act] || null;
    var img = new Image(); plates[act] = img;
    img.onload = function () { cache = Object.create(null); };
    img.onerror = function () { plates[act] = false; cache = Object.create(null); };
    img.src = "assets/" + act + ".png"; return img;
  }
  function paintStatic(g, w, h, act, reduced) {
    var p = palettes[act] || palettes.hearthwood;
    var sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, rgba(p.sky, 1)); sky.addColorStop(.56, rgba(p.sky, .72)); sky.addColorStop(1, rgba(p.deep, .92)); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    // paper wash and distant hills
    g.fillStyle = "rgba(255,241,197,.15)"; g.fillRect(0, h * .48, w, h * .52);
    path(g, [[0,h*.7],[w*.16,h*.53],[w*.32,h*.65],[w*.52,h*.48],[w*.7,h*.62],[w,h*.5],[w,h],[0,h]], rgba(p.moss,.38));
    path(g, [[0,h*.83],[w*.2,h*.66],[w*.44,h*.77],[w*.62,h*.6],[w,h*.72],[w,h],[0,h]], rgba(p.deep,.56));
    // canopy boughs, deliberately broad at the edges to frame play space
    g.strokeStyle = rgba(p.deep,.68); g.lineWidth = Math.max(8, w * .035); g.lineCap = "round";
    g.beginPath(); g.moveTo(-20, h*.12); g.quadraticCurveTo(w*.18,h*.2,w*.34,h*.04); g.moveTo(w+20,h*.18); g.quadraticCurveTo(w*.8,h*.27,w*.67,h*.08); g.stroke();
    for (var i = 0; i < 17; i++) { var xx = (hash(i+4) * w); var yy = 8 + hash(i+40) * h * .26; blob(g, xx, yy, 13 + hash(i)*22, 9 + hash(i+9)*14, rgba(p.moss, .28 + hash(i+2)*.18), hash(i)*.5 - .25); }
    // winding brook / path
    g.fillStyle = rgba(p.water,.62); g.beginPath(); g.moveTo(w*.32,h); g.bezierCurveTo(w*.48,h*.82,w*.36,h*.7,w*.55,h*.56); g.bezierCurveTo(w*.69,h*.46,w*.54,h*.36,w*.68,h*.23); g.lineTo(w*.78,h*.23); g.bezierCurveTo(w*.64,h*.43,w*.81,h*.52,w*.63,h*.68); g.bezierCurveTo(w*.48,h*.82,w*.64,h*.9,w*.48,h); g.closePath(); g.fill();
    // foreground grasses and little storybook leaves
    g.strokeStyle = rgba(p.moss,.78); g.lineWidth = 1.4; for (var j=0;j<34;j++){ var gx=hash(j+70)*w, gy=h*.78+hash(j+90)*h*.23; g.beginPath(); g.moveTo(gx,gy); g.quadraticCurveTo(gx-3,gy-8,gx-2-hash(j)*5,gy-13-hash(j)*12); g.stroke(); }
    // Inked trunks, roots, and bark scars give each horizon a tactile frame.
    g.strokeStyle=rgba(p.deep,.55); g.lineCap="round"; for(var tr=0;tr<6;tr++){var tx=hash(tr+500)*w;g.lineWidth=5+hash(tr+510)*6;g.beginPath();g.moveTo(tx,h);g.bezierCurveTo(tx-9,h*.72,tx+12,h*.4,tx-5,0);g.stroke();g.lineWidth=1;g.strokeStyle=rgba(p.gold,.2);g.beginPath();g.moveTo(tx-2,h*.75);g.quadraticCurveTo(tx+4,h*.64,tx-1,h*.55);g.stroke();g.strokeStyle=rgba(p.deep,.55);}
    for(var rt=0;rt<8;rt++){var rx=hash(rt+530)*w, ry=h*.82;g.strokeStyle=rgba(p.deep,.48);g.lineWidth=1.6;g.beginPath();g.moveTo(rx,ry);g.quadraticCurveTo(rx+(hash(rt+540)-.5)*35,ry-5,rx+(hash(rt+550)-.5)*55,ry-17);g.stroke();}
    // Small, grouped foreground flora keeps the scene authored at gameplay scale.
    for(var mu=0;mu<7;mu++){var mx=hash(mu+570)*w,my=h*.78+hash(mu+580)*h*.18,ms=1.5+hash(mu+590)*2.2;g.fillStyle="#e6c491";g.fillRect(mx-1,my-5*ms,2,5*ms);g.fillStyle=mu%2?"#d96d72":"#e58d79";g.beginPath();g.ellipse(mx,my-6*ms,5*ms,2.4*ms,0,Math.PI,TAU);g.fill();}
    for(var fl=0;fl<10;fl++){var px=hash(fl+610)*w,py=h*.73+hash(fl+620)*h*.18;g.strokeStyle=rgba(p.gold,.7);g.lineWidth=.8;g.beginPath();g.moveTo(px,py+4);g.lineTo(px,py);g.stroke();g.fillStyle=rgba(p.gold,.82);g.beginPath();g.arc(px,py,2,0,TAU);g.fill();}
    // Two plank suggestions cross the water in acts where the path is a crossing.
    if(act === "hearthwood" || act === "rainbell"){g.strokeStyle=rgba(p.deep,.62);g.lineWidth=2;for(var br=0;br<4;br++){var by=h*.64+br*3;g.beginPath();g.moveTo(w*.43,by);g.lineTo(w*.67,by+4);g.stroke();}}
    if (act === "lantern") { for (var l=0;l<7;l++){ var lx=30+l*w/7, ly=45+hash(l+120)*h*.25; g.strokeStyle=rgba(p.deep,.5); g.beginPath(); g.moveTo(lx,0); g.lineTo(lx,ly); g.stroke(); glow(g,lx,ly,16,p.gold,.18); blob(g,lx,ly,3,5,rgba(p.gold,.88)); } }
    if (act === "rainbell") { g.strokeStyle="rgba(210,232,226,.36)"; g.lineWidth=.7; for(var r=0;r<38;r++){var rx=hash(r+160)*w, ry=hash(r+180)*h; g.beginPath();g.moveTo(rx,ry);g.lineTo(rx-2,ry+7+hash(r)*12);g.stroke();} }
    if (act === "heartroot") { g.strokeStyle=rgba(p.gold,.22); g.lineWidth=2; for(var q=0;q<8;q++){var qx=hash(q+210)*w;g.beginPath();g.moveTo(qx,h);g.quadraticCurveTo(qx+20,h*.62,qx-8,h*.35);g.stroke();} }
  }

  function drawScene(g, options) {
    options = options || {}; var w = options.width || g.canvas.width, h = options.height || g.canvas.height;
    var act = String(options.act || "hearthwood").toLowerCase(); if (!palettes[act]) act = "hearthwood";
    var reduced = !!options.reducedMotion, key = w + "x" + h + ":" + act + ":" + reduced;
    if (!cache[key]) cache[key] = makeLayer(w, h, act, reduced);
    var camX = Number(options.camX) || 0, camY = Number(options.camY) || 0;
    var plate = plateFor(act), plateReady = plate && plate.complete && plate.naturalWidth > 0;
    g.save();
    // The painted page drifts gently against the camera, giving the rear ink
    // work a little depth without changing collision or gameplay coordinates.
    g.translate(-clamp(camX * .035, -7, 7), -clamp(camY * .02, -4, 4));
    if (plateReady) { var ox = clamp(camX * .012, -4, 4), oy = clamp(camY * .008, -2, 2); g.drawImage(plate, 0, 0, plate.naturalWidth, plate.naturalHeight, ox, oy, w - ox * 2, h - oy * 2); }
    else if (cache[key]) g.drawImage(cache[key], 0, 0, cache[key].width, cache[key].height, 0, 0, w, h); else paintStatic(g, w, h, act, reduced);
    g.restore();
    if (options.title !== true) { g.fillStyle = "rgba(7,15,17,.22)"; g.fillRect(0, 0, w, h); }
    var time = Number(options.time) || 0, drift = reduced ? 0 : time;
    // animated fireflies stay sparse and screen-space, preserving gameplay readability
    if (!reduced) for (var i=0;i<8;i++){var fx=(hash(i+400)*w+drift*(3+i%3))%(w+20)-10, fy=h*(.2+hash(i+420)*.55)+Math.sin(drift*.7+i)*4; glow(g,fx,fy,7,[249,214,133],.12); g.fillStyle="#ffe8a3";g.fillRect(fx,fy,1.5,1.5);}
    // Mushroom cottage and hero are title-only foreground story elements.
    if (act === "hearthwood" && (options.title === true || options.showHome === true)) {
      drawHero(g,{x:w*.70,y:h*.82,anim:"idle",time:time,scale:2,reducedMotion:reduced,facing:1});
    }
  }

  if (typeof Image !== "undefined") plateFor("hearthwood");
  root.SporelingStorybook = { drawHero: drawHero, drawScene: drawScene, clearCache: function(){ cache=Object.create(null); } };
})(typeof globalThis !== "undefined" ? globalThis : window);
