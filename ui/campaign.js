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
    0: { w: 120, h: 16, notes: "A short porch teaches one bloom placement, then three readable sequences escalate from a four-tile gap to thorn timing and a final two-bloom landing. Checkpoints at the two recovery porches keep the demanding last sequence fair; all mandatory landings are grounded or bloom-assisted and wall-free.", build: ({ set, rect, seg }) => {
      seg(0, 12, 12); seg(13, 28, 12); seg(34, 45, 13); seg(46, 63, 13); seg(70, 81, 12); seg(82, 101, 12); seg(108, 119, 12);
      rect(13, 10, 16, 10); rect(29, 8, 33, 8); rect(46, 10, 51, 10); rect(64, 7, 69, 7); rect(82, 9, 88, 9); rect(102, 6, 107, 6);
      rect(37, 11, 40, 11); rect(75, 10, 78, 10); rect(94, 7, 98, 7);
      // The first escalation is the bloom gap itself. Keep the landing clear
      // so the opening teaches placement before the later thorn timing.
      for (let c = 55; c <= 61; c++) set(c, 12, "S");
      for (let c = 92; c <= 96; c++) set(c, 11, "S");
      rect(22, 6, 25, 6); rect(40, 5, 43, 5); rect(57, 4, 60, 4); rect(76, 3, 79, 3); rect(96, 2, 99, 2);
      set(2, 11, "P"); set(47, 9, "C"); set(83, 8, "C"); set(115, 11, "G");
      for (const [c, r, ch] of [[10, 11, "e"], [26, 9, "f"], [40, 12, "e"], [59, 10, "f"], [76, 11, "e"], [96, 8, "f"], [111, 11, "e"]]) set(c, r, ch);
      for (const [c, r] of [[7, 10], [15, 9], [32, 7], [39, 10], [57, 10], [67, 6], [94, 6], [105, 5]]) set(c, r, "B");
    } },
    1: { w:150,h:18,
      movers:[{c0:36,c1:39,rA:17,rB:12,period:4.4,phase:0},{c0:98,c1:101,rA:15,rB:10,period:4.8,phase:1.2}],
      notes:"Rootbridge Crossing alternates open bloom gaps, moving recovery shelves, a raised launch over thorns, and a low overhang. Two earned checkpoints divide the route. A high keepsake path rewards extra bloom control; the main route never requires wall jumping.",
      build:({set,rect,seg})=>{
        seg(0,15,15);seg(22,34,14);seg(41,56,13);seg(62,74,15);seg(81,95,12);seg(103,118,14);seg(125,149,12);
        rect(44,11,46,11);rect(66,11,70,11);rect(85,8,89,8);rect(127,10,129,10);
        rect(62,12,64,12);rect(68,7,72,7);rect(113,10,116,10);
        for(let c=48;c<=52;c++)set(c,12,'S');
        for(let c=131;c<=135;c++)set(c,11,'S');
        set(2,14,'P');set(55,12,'C');set(110,13,'C');set(146,11,'G');set(70,6,'K');
        for(const[c,r,ch]of[[10,14,'e'],[40,11,'f'],[54,12,'e'],[91,11,'e'],[116,12,'f'],[140,11,'e']])set(c,r,ch);
        for(const[c,r]of[[7,13],[28,12],[38,10],[50,10],[67,13],[93,10],[112,12],[138,10]])set(c,r,'B');
      }
    },
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
    7: { w: 110, h: 20, movers: [{ c0: 53, c1: 56, rA: 15, rB: 7, period: 3.2, phase: 0.4 }], notes: "Rainbell Hollows alternates broad low and high runways with two-tile rises, two readable thorn dips, and a checkpoint recovery porch before the final climb. The goal sits on the final floor rather than behind a blind vertical catch.", build: ({ set, rect, seg }) => {
      seg(0, 10, 16); seg(11, 20, 14); seg(21, 31, 16); seg(32, 42, 14); seg(43, 52, 16); seg(53, 65, 14); seg(66, 76, 16); seg(77, 87, 14); seg(88, 97, 16); seg(98, 99, 14); seg(100, 109, 13);
      rect(13, 11, 16, 11); rect(25, 13, 28, 13); rect(37, 7, 40, 7); rect(47, 11, 50, 11); rect(59, 5, 62, 5); rect(70, 12, 73, 12); rect(81, 8, 84, 8); rect(93, 11, 96, 11);
      rect(57, 12, 62, 12);
      for (const c of [22, 23, 24, 67, 68, 69]) set(c, 15, "S");
      set(2, 15, "P"); set(105, 12, "G"); set(55, 13, "C");
      for (const [c, r, ch] of [[18, 13, "e"], [29, 14, "f"], [44, 14, "w"], [64, 13, "e"], [79, 13, "f"], [96, 14, "w"]]) set(c, r, ch);
      for (const [c, r] of [[8, 14], [15, 10], [27, 12], [39, 6], [49, 10], [61, 4], [72, 11], [83, 7], [95, 10], [103, 12]]) set(c, r, "B");
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
      rect(23, 22, 30, 22); rect(52, 15, 57, 15); rect(81, 20, 87, 20);
      rect(94, 18, 99, 18); rect(100, 15, 107, 15); rect(103, 23, 108, 23);
      rect(111, 19, 116, 19); rect(127, 17, 132, 17); rect(136, 21, 141, 21); rect(146, 17, 151, 17);
      for (const [c, r] of [[29, 25], [30, 25], [58, 25], [59, 25], [87, 25], [88, 25], [117, 25], [118, 25]]) set(c, r, "q");
      for (const [c, r, ch] of [[24, 20, "f"], [32, 22, "w"], [54, 14, "e"], [61, 24, "f"], [79, 22, "w"], [96, 17, "e"], [110, 16, "f"], [120, 24, "w"], [149, 16, "e"], [149, 19, "f"], [28, 23, "f"], [43, 19, "f"], [68, 22, "f"], [105, 14, "f"], [128, 15, "f"], [158, 16, "f"]]) set(c, r, ch);
      for (const [c, r] of [[25, 24], [55, 18], [85, 22], [115, 19], [145, 17]]) set(c, r, "q");
      set(5, 23, "P"); set(165, 19, "G"); set(83, 19, "C");
      for (const [c, r] of [[12, 22], [25, 20], [43, 18], [54, 13], [71, 23], [84, 18], [101, 16], [113, 11], [130, 21], [144, 16], [162, 18]]) set(c, r, "B");
    } },
    13: { w: 178, h: 30, movers: [{ c0: 80, c1: 85, rA: 23, rB: 12, period: 3.8, phase: 0.7 }], notes: "Heartroot is the restoration climax: the familiar first chain leads to the C91,15 recovery, then staggered helper platforms give carried momentum room to land while creating rising and falling trajectory choices through two visible overhead rock gates before the safe ending.", build: ({ set, rect, seg }) => {
      rect(0, 0, 0, 29); rect(177, 0, 177, 29); rect(1, 27, 18, 29); rect(160, 27, 176, 29);
      seg(1, 18, 24); seg(33, 47, 19); seg(62, 76, 23); seg(91, 106, 16); seg(121, 136, 21); seg(151, 176, 18);
      rect(21, 21, 28, 21); rect(50, 14, 57, 14); rect(79, 18, 87, 18); rect(109, 11, 115, 11); rect(139, 15, 145, 15);
      rect(102, 11, 109, 11); rect(137, 12, 144, 12);
      rect(119, 21, 119, 21); rect(148, 20, 148, 20); set(119, 20, "S"); set(148, 19, "S");
      set(5, 23, "P"); set(168, 17, "G"); set(91, 15, "C");
      for (const [c, r, ch] of [[25, 19, "f"], [35, 18, "e"], [50, 17, "w"], [59, 22, "f"], [83, 17, "e"], [90, 15, "w"], [110, 14, "f"], [124, 20, "e"], [141, 17, "w"], [149, 17, "f"]]) set(c, r, ch);
      for (const [c, r] of [[28, 19], [43, 18], [68, 22], [100, 15], [128, 15], [158, 16]]) set(c, r, "f");
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
        const npcPositions = { 0: { BARNABY: [8, 11] }, 1: { COMMANTHA: [26, 13], "THE TWINS": [110, 13] }, 3: { "GRANNY MOREL": [10, 37] }, 4: {}, 7: { JB: [58, 11] }, 11: {}, 13: {} };
        for (const [key, placements] of Object.entries(npcPositions)) {
          const level = levels[Number(key)];
          for (const npc of level?.npcs || []) if (placements[npc.name]) [npc.c, npc.r] = placements[npc.name];
        }
        // Extra Adventure retries sit in open air above recovery shelves.
        if (levels[3]) levels[3].mercyCheckpoints = [{ c: 22, r: 22 }];
        if (levels[4]) levels[4].mercyCheckpoints = [{ c: 45, r: 7 }];
        if (levels[7]) levels[7].mercyCheckpoints = [{ c: 72, r: 15 }];
        return applied.slice();
      },
    };
  }

  root.createSporelingCampaign = createSporelingCampaign;
})(typeof window === "object" ? window : globalThis);
