/* Small, source-level route contract for the authored challenge rooms.
 * It keeps reviewable route intent beside the maps without changing the game
 * harness or granting the probe any physics shortcuts.
 */

export const CHALLENGE_ROUTES = Object.freeze({
  0: Object.freeze({ room: "opening", checkpoints: [47, 83], sequences: [
    "porch bloom placement", "thorn bank and low landing", "checkpoint bloom transfer", "canopy descent to goal",
  ] }),
  1: Object.freeze({ room: "rootbridge", checkpoints: [55, 110], sequences: [
    "stepped banks and moving landing", "supported thorn bank", "low roof and bloom transfer", "last rising crossing and thorn shelf",
  ] }),
  19: Object.freeze({ room: "reedbank", checkpoints: [30, 75], sequences: [
    "interleaved bank ring dodge", "first two bloom crossing", "checkpoint canopy route", "second bloom crossing to goal",
  ] }),
  20: Object.freeze({ room: "lantern-lift", checkpoints: [26, 11], sequences: [
    "lower alternating ledges", "first checkpoint wall transfer", "offset middle geometry", "second checkpoint final ascent",
  ] }),
  21: Object.freeze({ room: "silver-sluice", checkpoints: [48, 81], sequences: [
    "high shelf departure", "descending glide with hazard choice", "safe checkpoint landing", "low sluice to gate",
  ] }),
  22: Object.freeze({ room: "stillwater", checkpoints: [30, 73], sequences: [
    "ringwave timing", "marked impact bait and hop", "safe checkpoint reset", "final ringwave and quiet gate",
  ] }),
});

export function inspectChallengeMap(map) {
  const rows = Array.isArray(map) ? map : [];
  const width = rows[0]?.length || 0;
  const text = rows.join("");
  return {
    width,
    height: rows.length,
    spawnCount: (text.match(/P/g) || []).length,
    goalCount: (text.match(/G/g) || []).length,
    checkpointCount: (text.match(/C/g) || []).length,
    berryCount: (text.match(/B/g) || []).length,
    enemyCount: (text.match(/[eEfFkwos]/g) || []).length,
    spikeCount: (text.match(/S/g) || []).length,
    supported: rows.every(row => typeof row === "string" && row.length === width && [...row].every(cell => ".#PCGBKefFkwosS".includes(cell))),
  };
}

export function validateChallengeMap(map, { minCheckpoints = 0, minBerries = 4, maxEnemies = 8 } = {}) {
  const report = inspectChallengeMap(map);
  return report.supported && report.spawnCount === 1 && report.goalCount <= 1 &&
    report.checkpointCount >= minCheckpoints && report.berryCount >= minBerries && report.enemyCount <= maxEnemies;
}

// Recorded ordinary keyboard inputs, with enemies active. No player state or
// resources are changed after the normal level load.
export async function runActualInputRoute(index) {
  if (![0, 1].includes(index)) throw new RangeError("Use the chapter route controller for other rooms");
  const { probePracticalRoute } = await import("./practical-route.mjs");
  const result = probePracticalRoute(index, { includeEnemies: true });
  return { ...result, index, frames: result.inputs.length, deaths: result.ok ? 0 : 1,
    endX: result.x, endY: result.y };
}
