import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../ui/rainbell-chapter.js", import.meta.url), "utf8");

function buildLevel(w, h, fn) {
  const grid = Array.from({ length: h }, () => Array(w).fill("."));
  const set = (c, r, ch) => { if (c >= 0 && c < w && r >= 0 && r < h) grid[r][c] = ch; };
  const rect = (c0, r0, c1, r1, ch = "#") => {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) set(c, r, ch);
  };
  const seg = (c0, c1, top) => rect(c0, top, c1, h - 1);
  fn({ set, rect, seg });
  return grid.map(row => row.join(""));
}

function levels() {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.SporelingRainbellChapter.create(buildLevel);
}

test("Rainbell factory returns the five stable chapter rooms", () => {
  const got = levels();
  assert.equal(got.map(level => level.id).join("|"), "reedbank|lantern-lift|silver-sluice|stillwater|rainmaker");
  assert.equal(got.map(level => level.name).join("|"), "THE REEDBANK|THE LANTERN LIFT|THE SILVER SLUICE|THE STILLWATER PATH|THE RAINMAKER");
  assert.equal(got.map(level => level.displayName).join("|"), "The Reedbank|The Lantern Lift|The Silver Sluice|The Stillwater Path|The Rainmaker");
  for (const level of got) {
    assert.equal(level.act, "rainbell-hollows");
    assert.equal(level.actTitle, "RAINBELL HOLLOWS");
    assert.equal(level.pal, 2);
    assert.equal(level.music, "rainbell");
    assert.equal(level.abilityLevel, 7);
    assert.equal(level.storyAct, "rainbell");
    assert.equal(level.terrainPalette, "dusk");
    assert.equal(level.npcs.length, 0);
    assert.match(level.unlockText, /\S/);
    assert.match(level.authoringNotes, /\S/);
    assert.match(level.routeDescription, /\S/);
  }
});

test("rooms preserve map contracts, checkpoint support, and enemy budgets", () => {
  const got = levels();
  for (const level of got) {
    const width = level.map[0].length;
    assert.ok(level.map.length > 0 && level.map.every(row => row.length === width), level.name);
    assert.equal(level.map.join("").split("P").length - 1, 1, `${level.name} has one spawn`);
    assert.ok(level.map.join("").split("B").length - 1 <= 7, `${level.name} berry budget`);
    assert.ok((level.map.join("").match(/[eEfFkwos]/g) || []).length <= 3, `${level.name} enemy budget`);
    for (const row of level.map) for (const cell of row) assert.ok(".#PCGBefFkwos".includes(cell), `${level.name} uses supported map symbols`);
    for (const cp of level.mercyCheckpoints || []) assert.equal(level.map[cp.r + 1][cp.c], "#", `${level.name} checkpoint support`);
  }
  const boss = got[4];
  assert.equal(boss.boss, "rainmaker");
  assert.equal(boss.map.length, 14);
  assert.equal(boss.map[0].length, 20);
  assert.equal(boss.map[12].slice(1, 19), "##################");
  assert.equal(boss.map[11][5], "P");
  assert.equal(boss.map.join("").includes("G"), false);
});

test("rainbell lanes are finite flat-floor metadata with readable timing", () => {
  for (const level of levels()) {
    let previousRight = -Infinity;
    for (const lane of level.rainbells) {
      assert.deepEqual(Object.keys(lane).sort(), ["dir", "left", "period", "phase", "right", "x", "y"]);
      assert.ok(lane.left < lane.right);
      assert.ok(lane.period >= 4.5);
      assert.ok(lane.dir === -1 || lane.dir === 1);
      assert.ok(lane.x >= lane.left && lane.x <= lane.right);
      assert.ok(lane.y % 16 === 0);
      assert.ok(lane.left >= previousRight || level.id === "lantern-lift");
      previousRight = lane.right;
    }
  }
});

test("main rooms have authored terrain changes and map checkpoints only", () => {
  for (const level of levels().slice(0, 4)) {
    const floors = level.map.map(row => row.replace(/[.PCGBefFkwos]/g, "").length);
    assert.ok(new Set(floors).size > 1, `${level.name} varies its terrain footprint`);
    const mapCheckpoints = [...level.map.join("")].filter(cell => cell === "C").length;
    const customCheckpoints = level.mercyCheckpoints?.length || 0;
    assert.equal(customCheckpoints, 0, `${level.name} does not duplicate map checkpoints`);
    assert.ok(mapCheckpoints >= (level.id === "reedbank" ? 1 : 2), `${level.name} has its intended visible checkpoints`);
  }
});
