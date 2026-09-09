/* Authored four-act route layouts for Sporeling Dash.
 *
 * Integration is deliberately explicit:
 *   const campaign = createSporelingCampaign({ buildLevel, levels });
 *   campaign.apply();
 * The factory only replaces maps and selected NPC coordinates. Boss arenas,
 * secret rooms, trials, names, keepsakes, and ability metadata stay owned by
 * the main engine.
 */
(function (root) {
  "use strict";

  const layouts = {
    0: { w: 96, h: 14, notes: "Porch, two safe bloom lessons, berry bough, then the first thorn crossing.", build: ({ set, rect, seg }) => {
      seg(0, 10, 10); seg(11, 20, 9); seg(21, 25, 13); seg(26, 31, 8);
      seg(32, 38, 11); seg(39, 46, 13); seg(47, 53, 9); seg(54, 63, 13);
      seg(64, 70, 8); seg(71, 78, 12); seg(79, 87, 10); seg(88, 95, 7);
      for (let c = 22; c <= 24; c++) set(c, 11, "S");
      for (let c = 40; c <= 45; c++) set(c, 12, "S");
      for (let c = 55; c <= 62; c++) set(c, 12, "S");
      rect(16, 6, 17, 6); rect(29, 5, 30, 5); rect(44, 6, 44, 6); rect(58, 6, 59, 6); rect(75, 7, 76, 7);
      set(2, 9, "P"); set(67, 7, "C"); set(92, 5, "G");
      for (const [c, r, ch] of [[18, 8, "e"], [34, 10, "f"], [52, 8, "e"], [73, 11, "f"], [86, 9, "e"]]) set(c, r, ch);
      for (const [c, r] of [[6, 9], [14, 7], [28, 7], [35, 6], [49, 7], [67, 6], [73, 4], [84, 8]]) set(c, r, "B");
    } },
    1: { w: 120, h: 16, movers: [{ c0: 48, c1: 51, rA: 13, rB: 8, period: 3.4, phase: 0 }], notes: "Lantern steps teach a moving shelf, then alternate low and high crossings with two recovery ledges.", build: ({ set, rect, seg }) => {
      seg(0, 9, 12); seg(10, 18, 14); seg(19, 25, 10); seg(26, 32, 13); seg(33, 40, 8);
      seg(41, 48, 14); seg(49, 57, 11); seg(58, 65, 7); seg(66, 74, 13); seg(75, 82, 9);
      seg(83, 91, 14); seg(92, 101, 11); seg(102, 110, 7); seg(111, 119, 12);
      rect(22, 7, 24, 7); rect(36, 4, 38, 4); rect(52, 8, 54, 8); rect(69, 4, 71, 4); rect(86, 6, 88, 6); rect(104, 3, 106, 3);
      for (const c of [11, 12, 13, 42, 43, 44, 84, 85, 86]) set(c, 13, "S");
      set(2, 11, "P"); set(41, 13, "C"); set(116, 10, "G"); set(69, 3, "K");
      for (const [c, r, ch] of [[16, 13, "e"], [28, 12, "f"], [45, 13, "e"], [76, 12, "f"], [96, 13, "e"], [108, 10, "f"]]) set(c, r, ch);
      for (const [c, r] of [[7, 10], [23, 6], [35, 7], [52, 7], [69, 6], [87, 5], [104, 5], [113, 9]]) set(c, r, "B");
    } },
    3: { w: 30, h: 56, notes: "A vertical garden with alternating bloom shelves, a glide pocket, and a calm gardener landing before the crown. The upper half narrows to short shelves, with two inward wall lips that reward side transfers while leaving both outer walls usable.", build: ({ set, rect }) => {
      rect(0, 0, 0, 55); rect(29, 0, 29, 55); rect(1, 54, 28, 55);
      rect(3, 48, 10, 48); rect(19, 43, 26, 43); rect(5, 38, 13, 38); rect(16, 33, 24, 33);
      rect(4, 28, 9, 28); rect(20, 23, 25, 23); rect(7, 18, 12, 18); rect(16, 13, 21, 13); rect(5, 8, 10, 8); rect(20, 3, 25, 3);
      rect(1, 25, 4, 25); rect(25, 20, 28, 20);
      set(4, 47, "P"); set(24, 2, "G"); set(8, 37, "C"); set(5, 37, "B"); set(22, 42, "B"); set(8, 32, "B"); set(23, 22, "B"); set(9, 17, "B"); set(20, 12, "B");
      for (const [c, r, ch] of [[9, 47, "e"], [18, 42, "f"], [18, 32, "e"], [11, 22, "f"], [18, 12, "e"]]) set(c, r, ch);
    } },
    4: { w: 100, h: 12, notes: "A bright canopy sprint with three short committed spans and a sheltered alcove for the keepsake. After the mercy perch, three 5-tile landings rise and fall across a clear lane, ending with one isolated edge thorn.", build: ({ set, rect }) => {
      rect(0, 0, 99, 1); rect(0, 0, 0, 11); rect(99, 0, 99, 11); rect(1, 10, 13, 11); rect(86, 10, 98, 11);
      rect(17, 8, 24, 8); rect(29, 5, 35, 5); rect(40, 8, 48, 8); rect(53, 6, 57, 6); rect(65, 8, 69, 8); rect(78, 5, 82, 5);
      set(86, 9, "S");
      set(4, 9, "P"); set(94, 9, "G"); set(21, 7, "B"); set(32, 4, "B"); set(44, 7, "B"); set(56, 5, "B"); set(68, 7, "B"); set(81, 4, "B"); set(30, 3, "K");
      for (const [c, r, ch] of [[11, 9, "e"], [27, 7, "f"], [42, 7, "e"], [63, 7, "f"], [79, 4, "e"], [88, 9, "f"]]) set(c, r, ch);
    } },
    7: { w: 110, h: 20, movers: [{ c0: 53, c1: 56, rA: 15, rB: 7, period: 3.2, phase: 0.4 }], notes: "Rainbell Hollows descends through wide recovery shelves, then turns upward through a three-bloom storm.", build: ({ set, rect, seg }) => {
      seg(0, 10, 16); seg(11, 20, 12); seg(21, 31, 17); seg(32, 42, 10); seg(43, 52, 15); seg(53, 65, 8); seg(66, 76, 17); seg(77, 87, 11); seg(88, 99, 15); seg(100, 109, 7);
      rect(13, 11, 16, 11); rect(25, 13, 28, 13); rect(37, 7, 40, 7); rect(47, 11, 50, 11); rect(59, 5, 62, 5); rect(70, 12, 73, 12); rect(81, 8, 84, 8); rect(93, 11, 96, 11);
      for (const c of [22, 23, 24, 67, 68, 69]) set(c, 16, "S");
      set(2, 15, "P"); set(105, 6, "G"); set(55, 7, "C");
      for (const [c, r, ch] of [[18, 15, "e"], [29, 16, "f"], [44, 14, "w"], [64, 16, "e"], [79, 16, "f"], [96, 14, "w"]]) set(c, r, ch);
      for (const [c, r] of [[8, 14], [15, 10], [27, 12], [39, 6], [49, 10], [61, 4], [72, 11], [83, 7], [95, 10], [103, 6]]) set(c, r, "B");
    } },
    9: { w: 28, h: 68, notes: "The Swallow is a bell shaft: alternating wall transfers, two breathing ledges, and a final flutter choice.", build: ({ set, rect }) => {
      rect(0, 0, 27, 1); rect(0, 0, 0, 67); rect(27, 0, 27, 67); rect(1, 66, 26, 67);
      for (const [r, left] of [[60, 3], [53, 16], [46, 4], [39, 17], [32, 5], [25, 15], [18, 4], [11, 16], [5, 6]]) rect(left, r, left + 7, r);
      rect(3, 56, 10, 56); rect(17, 35, 24, 35); rect(4, 15, 11, 15);
      set(4, 64, "P"); set(21, 3, "G"); set(7, 59, "B"); set(19, 52, "B"); set(8, 45, "B"); set(20, 38, "B"); set(8, 31, "B"); set(19, 24, "B"); set(8, 17, "B"); set(20, 10, "B"); set(7, 35, "C"); set(20, 52, "K");
    } },
    10: { w: 56, h: 58, notes: "A down-slam lesson opens into six breakable drops, enemy refunds, and a safe landing pocket before the exit.", build: ({ set, rect }) => {
      rect(0, 0, 0, 57); rect(55, 0, 55, 57); rect(1, 56, 54, 57);
      rect(3, 48, 14, 48); rect(22, 41, 35, 41); rect(7, 34, 18, 34); rect(28, 27, 45, 27); rect(8, 20, 22, 20); rect(33, 13, 49, 13); rect(18, 6, 31, 6);
      for (const [c, r] of [[15, 48], [21, 41], [19, 34], [25, 27], [23, 20], [30, 13]]) set(c, r, "q");
      set(5, 47, "P"); set(25, 5, "G"); set(9, 46, "B"); set(31, 40, "B"); set(11, 33, "B"); set(39, 26, "B"); set(13, 19, "B"); set(43, 12, "B");
    } },
    11: { w: 176, h: 30, movers: [{ c0: 58, c1: 62, rA: 24, rB: 13, period: 3.6, phase: 0.2 }, { c0: 118, c1: 122, rA: 21, rB: 15, period: 3.8, phase: 1.1 }], notes: "Three long rain crossings alternate with visible truffle islands, moving shelves, and a midpoint reset ledge. After the checkpoint at 83,19, a high or low crossing passes beneath a short ordinary rock overhang, then approaches a moving shelf before a safe final ledge.", build: ({ set, rect, seg }) => {
      rect(0, 0, 0, 29); rect(175, 0, 175, 29); rect(1, 27, 20, 29); rect(155, 27, 174, 29);
      seg(1, 20, 24); seg(35, 49, 20); seg(65, 78, 25); seg(94, 99, 18); seg(124, 139, 23); seg(153, 174, 20);
      rect(23, 22, 27, 22); rect(52, 15, 56, 15); rect(81, 20, 86, 20);
      rect(94, 18, 99, 18); rect(100, 15, 107, 15); rect(103, 23, 108, 23);
      rect(111, 19, 116, 19); rect(127, 17, 132, 17); rect(136, 21, 141, 21); rect(146, 17, 151, 17);
      for (const [c, r] of [[29, 25], [30, 25], [58, 25], [59, 25], [87, 25], [88, 25], [117, 25], [118, 25]]) set(c, r, "q");
      for (const [c, r, ch] of [[24, 20, "f"], [32, 22, "w"], [54, 14, "e"], [61, 24, "f"], [79, 22, "w"], [96, 17, "e"], [110, 16, "f"], [120, 24, "w"], [149, 16, "e"], [149, 19, "f"], [28, 23, "f"], [43, 19, "f"], [68, 22, "f"], [105, 14, "f"], [128, 18, "f"], [158, 16, "f"]]) set(c, r, ch);
      for (const [c, r] of [[25, 24], [55, 18], [85, 22], [115, 19], [145, 17]]) set(c, r, "q");
      set(5, 23, "P"); set(165, 19, "G"); set(83, 19, "C");
      for (const [c, r] of [[12, 22], [25, 20], [43, 18], [54, 13], [71, 23], [84, 18], [101, 16], [113, 11], [130, 21], [144, 16], [162, 18]]) set(c, r, "B");
    } },
    13: { w: 178, h: 30, movers: [{ c0: 80, c1: 85, rA: 23, rB: 12, period: 3.8, phase: 0.7 }], notes: "Heartroot is the restoration climax: the familiar first chain leads to the C91,15 recovery, then staggered 4-tile helper platforms create rising and falling trajectory choices through two visible overhead rock gates before the safe ending.", build: ({ set, rect, seg }) => {
      rect(0, 0, 0, 29); rect(177, 0, 177, 29); rect(1, 27, 18, 29); rect(160, 27, 176, 29);
      seg(1, 18, 24); seg(33, 47, 19); seg(62, 76, 23); seg(91, 106, 16); seg(121, 136, 21); seg(151, 176, 18);
      rect(21, 21, 26, 21); rect(50, 14, 55, 14); rect(79, 18, 85, 18); rect(109, 11, 112, 11); rect(139, 15, 142, 15);
      rect(102, 11, 109, 11); rect(137, 12, 144, 12);
      rect(119, 21, 119, 21); rect(148, 20, 148, 20); set(119, 20, "S"); set(148, 19, "S");
      set(5, 23, "P"); set(168, 17, "G"); set(91, 15, "C");
      for (const [c, r, ch] of [[25, 21, "f"], [35, 18, "e"], [50, 17, "w"], [59, 22, "f"], [83, 17, "e"], [90, 15, "w"], [110, 14, "f"], [124, 20, "e"], [141, 17, "w"], [149, 17, "f"]]) set(c, r, ch);
      for (const [c, r] of [[28, 23], [43, 18], [68, 22], [100, 15], [128, 18], [158, 16]]) set(c, r, "f");
      for (const [c, r] of [[25, 24], [55, 18], [85, 22], [115, 19], [145, 17]]) set(c, r, "q");
      for (const [c, r] of [[11, 22], [23, 19], [40, 17], [53, 12], [68, 21], [82, 16], [98, 14], [112, 9], [128, 19], [142, 14], [164, 16]]) set(c, r, "B");
    } },
  };

  function createSporelingCampaign({ buildLevel, levels }) {
    if (typeof buildLevel !== "function" || !Array.isArray(levels)) throw new TypeError("campaign requires buildLevel and levels");
    const applied = [];
    return {
      layouts,
      apply() {
        const replace = new Set([0, 1, 3, 4, 7, 11, 13]);
        for (const [key, layout] of Object.entries(layouts)) {
          const index = Number(key), level = levels[index];
          if (!level || !replace.has(index)) continue;
          level.map = buildLevel(layout.w, layout.h, layout.build);
          level.campaignNotes = layout.notes;
          // A rebuilt room gets a fresh mover list. This prevents old moving
          // shelves from pointing into coordinates that no longer exist.
          level.movers = (layout.movers || []).map(mover => ({ ...mover }));
          applied.push(index);
        }
        const npcPositions = { 0: { BARNABY: [8, 9] }, 1: { COMMANTHA: [36, 3], "THE TWINS": [70, 10] }, 3: { "GRANNY MOREL": [10, 37] }, 4: {}, 7: { JB: [58, 7] }, 11: {}, 13: {} };
        for (const [key, placements] of Object.entries(npcPositions)) {
          const level = levels[Number(key)];
          for (const npc of level?.npcs || []) if (placements[npc.name]) [npc.c, npc.r] = placements[npc.name];
        }
        // Extra Adventure retries sit in open air above recovery shelves.
        if (levels[3]) levels[3].mercyCheckpoints = [{ c: 22, r: 22 }];
        if (levels[4]) levels[4].mercyCheckpoints = [{ c: 45, r: 7 }];
        if (levels[7]) levels[7].mercyCheckpoints = [{ c: 72, r: 16 }];
        return applied.slice();
      },
    };
  }

  root.createSporelingCampaign = createSporelingCampaign;
})(typeof window === "object" ? window : globalThis);
