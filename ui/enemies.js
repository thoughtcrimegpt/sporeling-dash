/* Hostile woodland silhouettes, anchored to the engine collision boxes. */
(function (root) {
  "use strict";

  const TAU = Math.PI * 2;
  const BARK = "#302b2b";
  const BARK_HI = "#514341";
  const CHITIN = "#3b3438";
  const CHITIN_HI = "#66524c";
  const EDGE = "#80635a";
  const EYE = "#f0a16c";
  const EYE_HI = "#ffd09a";
  const VOID = "#17171d";

  function ellipse(g, x, y, rx, ry, fill, rotation) {
    g.fillStyle = fill;
    g.beginPath();
    g.ellipse(x, y, rx, ry, typeof rotation === "number" ? rotation : 0, 0, TAU);
    g.fill();
  }
  function line(g, x, y, x2, y2, color, width) {
    g.strokeStyle = color;
    g.lineWidth = width || 1;
    g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
  }
  function poly(g, points, fill, stroke) {
    g.fillStyle = fill;
    g.beginPath(); g.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) g.lineTo(points[i], points[i + 1]);
    g.closePath(); g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = .7; g.stroke(); }
  }
  function slit(g, x, y, width, dir, hot) {
    g.fillStyle = hot ? EYE_HI : EYE;
    g.beginPath();
    g.moveTo(x - width * .5, y + 1); g.lineTo(x + width * .5, y - 1);
    g.lineTo(x + dir * width * .28, y + 2); g.closePath(); g.fill();
  }
  function jaw(g, x, y, width, dir) {
    g.fillStyle = VOID;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + dir * width, y - 1);
    g.lineTo(x + dir * width * .72, y + 3); g.lineTo(x + dir * width * .2, y + 2);
    g.closePath(); g.fill();
    line(g, x + dir * width * .35, y + 1, x + dir * width * .5, y + 3, EDGE, .65);
  }
  function legs(g, cx, foot, count, span, phase, color) {
    for (let i = 0; i < count; i++) {
      const x = cx - span * .5 + span * (i / Math.max(1, count - 1));
      const swing = Math.sin(phase * 10 + i * 1.7) * 1.5;
      line(g, x, foot - 3, x + (i % 2 ? 2 : -2) + swing, foot + 2, color, .8);
      line(g, x + (i % 2 ? 2 : -2) + swing, foot + 2, x + (i % 2 ? 4 : -4) + swing, foot + 2, color, .65);
    }
  }
  function pulseRing(g, x, y, radius, alpha) {
    g.globalAlpha = alpha;
    g.strokeStyle = EYE_HI; g.lineWidth = .8;
    g.beginPath(); g.arc(x, y, radius, 0, TAU); g.stroke();
    g.globalAlpha = 1;
  }

  function draw(g, e, o) {
    if (!e || !["slug", "puff", "skitter", "spitter", "mine", "ember", "wisp"].includes(e.t)) return false;
    const reduced = !!o.reducedMotion;
    const t = reduced ? 0 : (Number(o.time) || 0) + (Number(e.ph) || 0);
    const w = e.w || 10, h = e.h || 10;
    const cx = e.x + w * .5, cy = e.y + h * .5;
    const dir = e.dir < 0 ? -1 : 1;
    g.save();
    g.translate(cx, cy);
    g.scale(dir, 1);

    if (e.t === "slug") {
      legs(g, 0, h * .5, 4, w * .72, t, BARK_HI);
      ellipse(g, 0, 0, w * .5, h * .42, BARK, 0);
      poly(g, [-w*.42,-h*.1, -w*.18,-h*.47, w*.18,-h*.5, w*.45,-h*.08, w*.25,h*.18, -w*.3,h*.2], CHITIN, EDGE);
      line(g, -w*.25, -h*.28, w*.24, -h*.34, CHITIN_HI, .8);
      slit(g, w*.28, -h*.1, w*.22, 1, false); jaw(g, w*.35, h*.16, w*.3, 1);
    } else if (e.t === "skitter") {
      legs(g, 0, h * .48, 6, w * .95, t * 1.4, BARK_HI);
      poly(g, [-w*.5,h*.2, -w*.4,-h*.3, -w*.12,-h*.5, w*.34,-h*.34, w*.5,h*.18, w*.2,h*.4, -w*.25,h*.4], CHITIN, EDGE);
      poly(g, [-w*.2,-h*.28, w*.18,-h*.33, w*.3,-h*.08, -.05,-h*.02], CHITIN_HI);
      slit(g, w*.32, -.05, w*.2, 1, false); jaw(g, w*.39, h*.18, w*.28, 1);
    } else if (e.t === "puff") {
      const bob = reduced ? 0 : Math.sin(t * 1.8) * 1.1;
      g.translate(0, bob);
      poly(g, [-w*.38,h*.35, -w*.5,-h*.05, -w*.25,-h*.45, w*.12,-h*.5, w*.48,-h*.15, w*.38,h*.3, 0,h*.48], BARK, EDGE);
      line(g, -w*.25, -h*.2, w*.2, h*.1, CHITIN_HI, .8);
      slit(g, w*.18, -.08, w*.28, 1, false); jaw(g, w*.31, h*.15, w*.26, 1);
      for (const dx of [-w*.28, 0, w*.28]) line(g, dx, h*.3, dx + Math.sin(t + dx) * 1.5, h*.62, EDGE, .7);
    } else if (e.t === "spitter") {
      const aim = (Number(o.playerX) || cx) < cx ? -1 : 1;
      g.scale(aim, 1);
      legs(g, 0, h * .5, 3, w * .85, t, BARK_HI);
      ellipse(g, 0, h*.08, w*.48, h*.42, BARK, 0);
      poly(g, [-w*.42,0, -w*.25,-h*.45, w*.18,-h*.5, w*.48,-h*.05, w*.25,h*.3, -w*.25,h*.28], CHITIN, EDGE);
      slit(g, w*.24, -h*.18, w*.23, 1, e.cd < .5); jaw(g, w*.36, h*.12, w*.33, 1);
      if (e.cd < .5) { line(g, w*.4, -.08, w*.7, -.08, EYE_HI, 1.1); pulseRing(g, w*.38, 0, w*.62, .3); }
    } else if (e.t === "mine") {
      const armed = e.armT > 0;
      for (let i = 0; i < 8; i++) {
        const a = i * TAU / 8 + (reduced ? 0 : t * .25);
        line(g, Math.cos(a)*w*.28, Math.sin(a)*h*.28, Math.cos(a)*w*.55, Math.sin(a)*h*.55, armed ? EYE : EDGE, 1.1);
      }
      poly(g, [-w*.35,-h*.2, -w*.08,-h*.46, w*.34,-h*.25, w*.44,h*.18, w*.08,h*.45, -w*.38,h*.23], BARK, EDGE);
      slit(g, w*.1, -.04, w*.25, 1, armed); jaw(g, w*.28, h*.15, w*.25, 1);
      if (armed) pulseRing(g, 0, 0, w*.72, .62);
    } else if (e.t === "ember") {
      const lift = reduced ? 0 : Math.sin(t * 5) * 1.2;
      g.translate(0, lift);
      poly(g, [-w*.45,h*.35, -w*.4,-h*.08, -w*.12,-h*.5, w*.2,-h*.28, w*.48,-h*.08, w*.3,h*.38, 0,h*.48], BARK, EDGE);
      poly(g, [-w*.18,h*.18, -w*.05,-h*.3, w*.2,h*.03], "#8b4d3b");
      slit(g, w*.22, -.05, w*.25, 1, true); jaw(g, w*.32, h*.16, w*.27, 1);
      line(g, -w*.25, h*.3, -w*.4, h*.58, EYE, .8); line(g, w*.08, h*.35, w*.2, h*.6, EYE, .8);
    } else if (e.t === "wisp") {
      const open = e.state === "open";
      const flap = reduced ? 1 : .9 + Math.sin(t * 6) * .12;
      poly(g, [-w*.05,0, -w*.62,-h*.5*flap, -w*.38,h*.15, -w*.7,h*.45, -.05,h*.25], open ? "#5e4649" : BARK, EDGE);
      poly(g, [w*.05,0, w*.62,-h*.5*flap, w*.38,h*.15, w*.7,h*.45, .05,h*.25], open ? "#5e4649" : BARK, EDGE);
      ellipse(g, 0, 0, w*.38, h*.48, CHITIN, EDGE);
      slit(g, w*.08, -.08, w*.25, 1, open); jaw(g, w*.22, h*.16, w*.3, 1);
    }
    g.restore();
    return true;
  }

  root.SporelingEnemies = { draw };
})(typeof window !== "undefined" ? window : globalThis);
