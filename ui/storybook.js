/* Procedural storybook art for Sporeling Dash.  The game owns timing and
 * collision; this module only paints.  It intentionally has no dependencies. */
(function (root) {
  "use strict";

  var cache = Object.create(null);
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

  /* Draws a hero around its feet anchor. options.x/y are world or screen
   * coordinates of the 10x14 collision box's lower centre. */
  function drawHero(g, options) {
    options = options || {}; var p = options.player || options;
    var x = Number(options.x != null ? options.x : p.x) || 0;
    var y = Number(options.y != null ? options.y : (p.y + (p.h || 14))) || 0;
    var face = Number(p.facing || options.facing || 1) < 0 ? -1 : 1;
    var anim = String(p.anim || options.anim || "idle").toLowerCase();
    var t = Number(options.time != null ? options.time : p.time) || 0;
    var reduced = !!(options.reducedMotion || p.reducedMotion);
    var moving = anim === "run" || anim === "jump" || anim === "dash" || anim === "glide";
    var bob = reduced ? 0 : Math.sin(t * (moving ? 11 : 3.2)) * (moving ? .6 : .28);
    var dash = anim === "dash" || p.dashing; var glide = anim === "glide";
    var tilt = dash ? face * .08 : (glide ? face * -.05 : 0);
    g.save(); g.translate(x, y - Math.abs(bob)); g.rotate(tilt);
    var sx = (dash ? 1.22 : 1) * (2 - (Number(p.squish) || 1));
    var sy = (dash ? .8 : 1) * (Number(p.squish) || 1); g.scale(sx, sy); g.translate(0, -8.7);
    glow(g, 0, -1, dash ? 16 : 10, [255, 220, 169], dash ? .34 : .17);
    if (dash && !reduced) { g.fillStyle = "rgba(248,184,160,.5)"; g.beginPath(); g.ellipse(-face * 10, 1, 11, 3, 0, 0, TAU); g.fill(); }
    var body = g.createLinearGradient(-4, -1, 4, 8); body.addColorStop(0, "#fff3d0"); body.addColorStop(.55, "#e8c990"); body.addColorStop(1, "#ad765f");
    g.fillStyle = body; g.beginPath(); g.moveTo(-3.8, -1); g.quadraticCurveTo(-4.5, 3, -3, 7.2); g.quadraticCurveTo(0, 9.3, 3.5, 7.1); g.quadraticCurveTo(4.4, 3, 3, -1); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,252,220,.7)"; g.beginPath(); g.ellipse(-1.5, 2.4, 1.2, 3.5, -.2, 0, TAU); g.fill();
    var cap = g.createLinearGradient(0, -10, 0, -1); cap.addColorStop(0, "#ffb39d"); cap.addColorStop(.48, "#d87789"); cap.addColorStop(1, "#774663");
    g.fillStyle = cap; g.beginPath(); g.moveTo(-8, -2); g.quadraticCurveTo(-7, -8, 0, -9.7); g.quadraticCurveTo(7, -8, 8, -2); g.quadraticCurveTo(3, -.2, 0, -1.4); g.quadraticCurveTo(-4, -.2, -8, -2); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,224,200,.86)"; blob(g, -2.3, -6.2, 1.55, 2.1, "rgba(255,224,200,.86)", -.3); blob(g, 3.1, -4.3, .9, 1.2, "rgba(255,224,200,.8)", .2);
    g.fillStyle = "rgba(255,240,211,.72)"; g.fillRect(-5.2, -2.3, 10.4, 1);
    var blink = p.frame === 3 || p.blink; var fx = face < 0 ? -2.7 : .6;
    g.fillStyle = "#34263a"; g.fillRect(fx, .35, 1.25, blink ? .5 : 1.8); g.fillRect(fx + 3.3, .35, 1.25, blink ? .5 : 1.8);
    g.fillStyle = "#fff8db"; g.fillRect(fx + .2, .5, .45, .55);
    if (glide) { g.strokeStyle = "rgba(255,241,214,.75)"; g.lineWidth = .8; g.beginPath(); g.arc(0, -3, 10, Math.PI, 0); g.stroke(); }
    if (anim === "slide") { g.strokeStyle = "#9abf9a"; g.lineWidth = .7; var wx = face > 0 ? 5 : -7; for (var k = -3; k <= 5; k += 4) { g.beginPath(); g.moveTo(wx, k); g.lineTo(wx + face * 3, k + 1); g.stroke(); } }
    g.fillStyle = "#825064"; blob(g, -2.5, 7.6, 2.2, 1.1, "#825064"); blob(g, 2.4, 7.6, 2.2, 1.1, "#825064");
    g.restore();
  }

  function makeLayer(w, h, act, reduced) {
    if (typeof document === "undefined" || !document.createElement) return null;
    var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); paintStatic(x, w, h, act, reduced); return c;
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
    if (act === "lantern") { for (var l=0;l<7;l++){ var lx=30+l*w/7, ly=45+hash(l+120)*h*.25; g.strokeStyle=rgba(p.deep,.5); g.beginPath(); g.moveTo(lx,0); g.lineTo(lx,ly); g.stroke(); glow(g,lx,ly,16,p.gold,.18); blob(g,lx,ly,3,5,rgba(p.gold,.88)); } }
    if (act === "rainbell") { g.strokeStyle="rgba(210,232,226,.36)"; g.lineWidth=.7; for(var r=0;r<38;r++){var rx=hash(r+160)*w, ry=hash(r+180)*h; g.beginPath();g.moveTo(rx,ry);g.lineTo(rx-2,ry+7+hash(r)*12);g.stroke();} }
    if (act === "heartroot") { g.strokeStyle=rgba(p.gold,.22); g.lineWidth=2; for(var q=0;q<8;q++){var qx=hash(q+210)*w;g.beginPath();g.moveTo(qx,h);g.quadraticCurveTo(qx+20,h*.62,qx-8,h*.35);g.stroke();} }
  }

  function drawScene(g, options) {
    options = options || {}; var w = options.width || g.canvas.width, h = options.height || g.canvas.height;
    var act = String(options.act || "hearthwood").toLowerCase(); if (!palettes[act]) act = "hearthwood";
    var reduced = !!options.reducedMotion, key = w + "x" + h + ":" + act + ":" + reduced;
    if (!cache[key]) cache[key] = makeLayer(w, h, act, reduced);
    if (cache[key]) g.drawImage(cache[key], 0, 0); else paintStatic(g, w, h, act, reduced);
    var time = Number(options.time) || 0, drift = reduced ? 0 : time;
    // animated fireflies stay sparse and screen-space, preserving gameplay readability
    if (!reduced) for (var i=0;i<8;i++){var fx=(hash(i+400)*w+drift*(3+i%3))%(w+20)-10, fy=h*(.2+hash(i+420)*.55)+Math.sin(drift*.7+i)*4; glow(g,fx,fy,7,[249,214,133],.12); g.fillStyle="#ffe8a3";g.fillRect(fx,fy,1.5,1.5);}
    if (String(options.title || "").length || options.act === "hearthwood") {
      var title = options.title || (act === "hearthwood" ? "SPORELING DASH" : "");
      if (title) { g.save(); g.textAlign="center"; g.font="bold " + Math.max(14, Math.round(w*.045)) + "px Georgia, serif"; g.fillStyle="rgba(56,38,48,.86)"; g.fillText(title,w*.5,h*.16); g.font="italic " + Math.max(8,Math.round(w*.018)) + "px Georgia, serif"; g.fillStyle="rgba(255,239,190,.78)"; g.fillText(act === "hearthwood" ? "a little journey beneath the old trees" : act.replace("heartroot","heartroot"),w*.5,h*.21); g.restore(); }
    }
    // mushroom home on title scene, warm windows and chimney curl
    if (act === "hearthwood" && (options.title || options.showHome !== false)) {
      var hx=w*.76, hy=h*.67; glow(g,hx,hy-19,34,[255,192,104],.18); g.fillStyle="#d9b17b"; g.fillRect(hx-5,hy-26,10,27); g.fillStyle="#9a526d"; g.beginPath();g.ellipse(hx,hy-29,28,14,0,Math.PI,TAU);g.fill(); g.fillStyle="#f8d68d";g.fillRect(hx-15,hy-17,7,8);g.fillRect(hx+8,hy-17,7,8); g.fillStyle="#71455d";g.fillRect(hx-4,hy-10,8,11); g.strokeStyle="rgba(255,239,192,.38)";g.lineWidth=1;g.beginPath();g.moveTo(hx+16,hy-38);g.quadraticCurveTo(hx+24,hy-50,hx+17,hy-57);g.stroke();
    }
  }

  root.SporelingStorybook = { drawHero: drawHero, drawScene: drawScene, clearCache: function(){ cache=Object.create(null); } };
})(typeof globalThis !== "undefined" ? globalThis : window);
