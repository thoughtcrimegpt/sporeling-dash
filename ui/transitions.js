(function (root) {
  "use strict";

  var BASE_W = 320;
  var BASE_H = 180;
  var DEFAULT_PALETTE = {
    cream: "#f6e7bd",
    parchment: "#e8c983",
    gold: "#c99543",
    ochre: "#a96f32",
    sage: "#6e7e59",
    deepSage: "#3f5945",
    bark: "#5a4439",
    dusk: "#453d3b"
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function smooth(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function fadeInOut(progress, inEnd, outStart) {
    var inAmount = smooth(progress / inEnd);
    var outAmount = smooth((1 - progress) / (1 - outStart));
    return inAmount * outAmount;
  }

  function rgba(hex, alpha) {
    var value = String(hex || "#000000").replace("#", "");
    if (value.length === 3) {
      value = value.split("").map(function (part) { return part + part; }).join("");
    }
    var number = parseInt(value, 16);
    if (!isFinite(number)) return "rgba(0,0,0," + alpha + ")";
    return "rgba(" + ((number >> 16) & 255) + "," + ((number >> 8) & 255) + "," + (number & 255) + "," + alpha + ")";
  }

  function leaf(g, x, y, length, width, rotation, color, alpha, vein) {
    g.save();
    g.translate(x, y);
    g.rotate(rotation);
    g.globalAlpha = alpha;
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, 0);
    g.bezierCurveTo(length * 0.22, -width * 0.9, length * 0.72, -width, length, 0);
    g.bezierCurveTo(length * 0.72, width, length * 0.22, width * 0.9, 0, 0);
    g.closePath();
    g.fill();
    if (vein) {
      g.globalAlpha = alpha * 0.46;
      g.strokeStyle = vein;
      g.lineWidth = 0.65;
      g.beginPath();
      g.moveTo(2, 0);
      g.lineTo(length * 0.84, 0);
      g.stroke();
    }
    g.restore();
  }

  function branch(g, points, color, alpha, width) {
    g.save();
    g.globalAlpha = alpha;
    g.strokeStyle = color;
    g.lineWidth = width;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(points[0], points[1]);
    g.quadraticCurveTo(points[2], points[3], points[4], points[5]);
    g.quadraticCurveTo(points[6], points[7], points[8], points[9]);
    g.stroke();
    g.restore();
  }

  function leafFrame(g, amount, palette) {
    if (amount <= 0.001) return;
    var sage = palette.sage;
    var deep = palette.deepSage;
    var ochre = palette.ochre;
    var cream = palette.cream;
    var reach = 10 + amount * 112;
    var branchAlpha = 0.42 + amount * 0.24;
    var leafAlpha = 0.5 + amount * 0.18;

    // Fine branches keep the frame open, while small offset leaves add depth.
    branch(g, [-3, 12, reach * 0.32, 25, reach * 0.6, 47, reach * 0.88, 61, reach, 78], deep, branchAlpha, 1.6);
    branch(g, [-3, 142, reach * 0.35, 132, reach * 0.55, 112, reach * 0.82, 103, reach, 88], palette.bark, branchAlpha * 0.82, 1.25);
    branch(g, [BASE_W + 3, BASE_H - 12, BASE_W - reach * 0.32, BASE_H - 25, BASE_W - reach * 0.6, BASE_H - 47, BASE_W - reach * 0.88, BASE_H - 61, BASE_W - reach, BASE_H - 78], deep, branchAlpha, 1.6);
    branch(g, [BASE_W + 3, BASE_H - 142, BASE_W - reach * 0.35, BASE_H - 132, BASE_W - reach * 0.55, BASE_H - 112, BASE_W - reach * 0.82, BASE_H - 103, BASE_W - reach, BASE_H - 88], palette.bark, branchAlpha * 0.82, 1.25);
    branch(g, [18, -3, 32, reach * 0.18, 52, reach * 0.28, 72, reach * 0.35, 94, reach * 0.39], deep, branchAlpha * 0.62, 1.2);
    branch(g, [BASE_W - 18, BASE_H + 3, BASE_W - 32, BASE_H - reach * 0.18, BASE_W - 52, BASE_H - reach * 0.28, BASE_W - 72, BASE_H - reach * 0.35, BASE_W - 94, BASE_H - reach * 0.39], palette.bark, branchAlpha * 0.58, 1.05);

    leaf(g, reach * 0.42, 29 + amount * 10, 13 + amount * 11, 3.8 + amount * 1.2, -0.2, sage, leafAlpha, cream);
    leaf(g, reach * 0.69, 50 + amount * 14, 10 + amount * 10, 3.3 + amount, 0.24, ochre, leafAlpha * 0.82, palette.parchment);
    leaf(g, reach * 0.54, 119 - amount * 9, 12 + amount * 9, 3.5 + amount, -0.4, deep, leafAlpha * 0.9, cream);
    leaf(g, BASE_W - reach * 0.42, BASE_H - 29 - amount * 10, 13 + amount * 11, 3.8 + amount * 1.2, Math.PI + 0.2, sage, leafAlpha, cream);
    leaf(g, BASE_W - reach * 0.69, BASE_H - 50 - amount * 14, 10 + amount * 10, 3.3 + amount, Math.PI - 0.24, ochre, leafAlpha * 0.82, palette.parchment);
    leaf(g, BASE_W - reach * 0.54, BASE_H - 119 + amount * 9, 12 + amount * 9, 3.5 + amount, Math.PI + 0.4, deep, leafAlpha * 0.9, cream);
    leaf(g, 47 + amount * 14, reach * 0.42, 10 + amount * 8, 3.1 + amount, 1.4, sage, leafAlpha * 0.72, cream);
    leaf(g, BASE_W - 47 - amount * 14, BASE_H - reach * 0.42, 10 + amount * 8, 3.1 + amount, -1.4, deep, leafAlpha * 0.68, cream);
  }

  function warmFade(g, progress, palette, depart) {
    var amount = depart ? smooth((progress - 0.78) / 0.22) : (1 - smooth(progress / 0.22)) * 0.1;
    if (amount <= 0.001) return;
    var gradient = g.createLinearGradient(0, 0, 0, BASE_H);
    gradient.addColorStop(0, rgba(palette.parchment, amount * 0.95));
    gradient.addColorStop(0.5, rgba(palette.cream, amount));
    gradient.addColorStop(1, rgba(palette.ochre, amount * 0.92));
    g.fillStyle = gradient;
    g.fillRect(0, 0, BASE_W, BASE_H);
  }

  function drawLeaves(g, progress, palette, depart) {
    var amount = depart ? smooth(progress) : Math.min(0.08, 1 - smooth(progress));
    leafFrame(g, amount, palette);
    warmFade(g, progress, palette, depart);
  }

  function drawDeath(g, progress, palette) {
    var p = smooth(progress);
    var edge = 0.17 + 0.16 * Math.sin(p * Math.PI);
    var gradient = g.createRadialGradient(BASE_W / 2, BASE_H * 0.48, 18, BASE_W / 2, BASE_H * 0.5, 154);
    gradient.addColorStop(0, rgba(palette.cream, 0.035 + p * 0.025));
    gradient.addColorStop(0.58, rgba(palette.dusk, 0.10 + p * 0.04));
    gradient.addColorStop(1, rgba(palette.bark, edge));
    g.fillStyle = gradient;
    g.fillRect(0, 0, BASE_W, BASE_H);
    g.fillStyle = rgba(palette.parchment, 0.035 * Math.sin(p * Math.PI));
    g.fillRect(0, 0, BASE_W, BASE_H);
  }

  function drawBoss(g, progress, palette, title, subtitle, placement) {
    var opacity = fadeInOut(progress, 0.18, 0.76);
    if (opacity <= 0.001) return;
    var lineY = placement === "top" ? 40 : 150;
    var center = BASE_W / 2;
    var titleText = title || "A QUIET GIANT STIRS";
    var subtitleText = subtitle || "breathe softly, and watch the roots";
    g.save();
    g.globalAlpha = opacity;
    g.strokeStyle = palette.gold;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(center - 66, lineY); g.lineTo(center + 66, lineY);
    g.stroke();
    g.fillStyle = rgba(palette.cream, 0.74);
    g.beginPath(); g.arc(center - 70, lineY, 1.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(center + 70, lineY, 1.5, 0, Math.PI * 2); g.fill();
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "600 11px Georgia, 'Times New Roman', serif";
    g.fillStyle = palette.cream;
    g.fillText(String(titleText), center, lineY - 10);
    if (subtitleText) {
      g.font = "8px Georgia, 'Times New Roman', serif";
      g.fillStyle = rgba(palette.parchment, 0.9);
      g.fillText(String(subtitleText), center, lineY + 8);
    }
    g.restore();
  }

  function draw(g, options) {
    options = options || {};
    if (!g || typeof g.save !== "function") return;
    var width = Number(options.width) || BASE_W;
    var height = Number(options.height) || BASE_H;
    var progress = clamp(options.progress, 0, 1);
    var palette = Object.assign({}, DEFAULT_PALETTE, options.palette || {});
    var phase = String(options.phase || "depart").toLowerCase();
    var scaleX = width / BASE_W;
    var scaleY = height / BASE_H;

    g.save();
    g.scale(scaleX, scaleY);
    if (phase === "depart" || phase === "arrive") {
      if (!options.reducedMotion) drawLeaves(g, progress, palette, phase === "depart");
      else warmFade(g, progress, palette, phase === "depart");
    } else if (phase === "death") {
      drawDeath(g, progress, palette);
    } else if (phase === "boss") {
      drawBoss(g, progress, palette, options.title, options.subtitle, options.placement);
    }
    g.restore();
  }

  root.SporelingTransitions = { draw: draw };
}(typeof window !== "undefined" ? window : this));
