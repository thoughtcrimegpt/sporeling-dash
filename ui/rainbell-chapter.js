/* Rainbell Hollows, the five-room chapter extension.
 *
 * The chapter is intentionally a small factory.  The host owns LEVELS and
 * supplies its existing buildLevel implementation, so loading this file does
 * not mutate the live campaign or any of its older maps.
 */
(function (root) {
  "use strict";

  const ACT = "rainbell-hollows";
  const ACT_TITLE = "RAINBELL HOLLOWS";
  const COMMON = {
    act: ACT,
    actTitle: ACT_TITLE,
    pal: 2,
    music: "rainbell",
    abilityLevel: 7,
    storyAct: "rainbell",
    terrainPalette: "dusk",
    npcs: [],
    rainbellHazard: { w: 12, h: 7, speed: 95, warning: 0.9 },
  };

  const rooms = [
    {
      id: "reedbank",
      name: "THE REEDBANK",
      displayName: "The Reedbank",
      unlockText: "Read the bell's warning, then dash across the low bank.",
      authoringNotes: "A wide, low first room teaches a single traveling ring. Broad shelves on both sides give every jump a safe recovery.",
      routeDescription: "Run the low bank, hop the traveling ring, and use the raised reed shelves as optional recovery landings.",
      width: 100, height: 16,
      rainbells: [
        {x:256,y:192,left:48,right:304,dir:-1,period:5.2,phase:0},
        {x:960,y:192,left:752,right:1008,dir:-1,period:5.6,phase:0},
      ],
      build: ({set,rect,seg}) => {
        seg(0,18,12); seg(26,40,10); seg(47,62,12);
        rect(66,11,68,11); seg(72,84,9); seg(85,99,12);
        rect(14,6,18,6); rect(35,4,39,4); rect(55,6,59,6); rect(87,6,91,6);
        set(2,11,'P'); set(30,9,'C'); set(75,8,'C'); set(96,11,'G');
        for (const [c,r] of [[7,10],[22,9],[31,8],[50,10],[67,9],[78,7],[93,10]]) set(c,r,'B');
        for (const [c,r,ch] of [[36,9,'e'],[60,10,'f'],[90,11,'w']]) set(c,r,ch);
      },
    },
    {
      id: "lantern-lift",
      name: "THE LANTERN LIFT",
      displayName: "The Lantern Lift",
      unlockText: "Cling to the walls, then climb the lantern shelves.",
      authoringNotes: "A generous vertical alternating-shelf room. Two grounded checkpoints split the climb; the moving lifts are optional and never required for the wall route.",
      routeDescription: "Wall jump between alternating shelves, pausing at either checkpoint before the final lantern rise.",
      width: 24,
      height: 44,
      mercyCheckpoints: [],
      movers: [
        { c0: 8, c1: 10, rA: 28, rB: 20, period: 4.8, phase: 0.2 },
        { c0: 11, c1: 13, rA: 13, rB: 5, period: 5.4, phase: 1.1 },
      ],
      rainbells: [
        { x: 304, y: 560, left: 224, right: 352, dir: -1, period: 5.8, phase: 0.7 },
        { x: 224, y: 320, left: 208, right: 336, dir: 1, period: 6.2, phase: 2.0 },
      ],
      build: ({ set, rect }) => {
        rect(0, 0, 0, 43); rect(23, 0, 23, 43); rect(1, 42, 22, 43);
        rect(2, 38, 9, 38); rect(14, 35, 21, 35); rect(3, 31, 11, 31); rect(15, 27, 22, 27);
        rect(2, 23, 8, 23); rect(13, 20, 20, 20); rect(3, 16, 11, 16); rect(15, 12, 22, 12); rect(2, 8, 9, 8); rect(13, 4, 21, 4);
        rect(10, 29, 13, 29); rect(10, 14, 13, 14);
        set(11, 41, "P"); set(17, 26, "C"); set(17, 11, "C"); set(17, 3, "G");
        for (const [c, r] of [[7, 37], [18, 26], [5, 22], [16, 19], [7, 15], [18, 11], [6, 7]]) set(c, r, "B");

        for (const [c, r, ch] of [[5, 37, "e"], [17, 31, "f"], [6, 29, "w"]]) set(c, r, ch);
      },
    },
    {
      id: "silver-sluice",
      name: "THE SILVER SLUICE",
      displayName: "The Silver Sluice",
      unlockText: "Choose the high shelf or glide down to the silver floor.",
      authoringNotes: "A horizontal sluice with readable high and low choices. The goal is deliberately below the elevated spawn, with an open floor landing and recovery shelf.",
      routeDescription: "Leave the high start, choose a shelf or glide through the open sluice, then land on the low silver run before the goal.",
      width: 104, height: 24,
      rainbells: [{x:1392,y:336,left:1248,right:1504,dir:-1,period:5.2,phase:0}],
      build: ({set,rect,seg}) => {
        seg(0,10,5); rect(16,7,24,7); rect(31,10,38,10); rect(44,12,54,12);
        rect(60,15,67,15); rect(71,17,83,17); seg(78,94,21); seg(98,103,21);
        // Roofs force a controlled drop instead of one held glide across the room.
        rect(26,0,29,5); rect(40,0,43,8); rect(57,0,60,10); rect(69,0,72,13);
        set(4,4,'P'); set(48,11,'C'); set(81,20,'C'); set(101,20,'G');
        for(const [c,r] of [[9,3],[20,6],[35,9],[50,11],[65,14],[79,16],[92,19]])set(c,r,'B');
        for(const [c,r,ch]of[[33,9,'e'],[64,14,'f'],[88,20,'w']])set(c,r,ch);
      },
    },
    {
      id: "stillwater",
      name: "THE STILLWATER PATH",
      displayName: "The Stillwater Path",
      unlockText: "Take each quiet runway one ring at a time.",
      authoringNotes: "A deliberate pre-boss approach. Isolated ring dodges sit over long, safe runways, with two checkpoints before the final calm stretch.",
      routeDescription: "Cross the isolated runways, recover at either checkpoint, and reach the quiet gate without rushing the final ring.",
      width: 100, height: 16,
      mercyCheckpoints: [],
      rainbells: [
        {x:256,y:192,left:48,right:320,dir:-1,period:5.5,phase:0},
        {x:960,y:192,left:736,right:1008,dir:-1,period:5.4,phase:0},
      ],
      build: ({set,rect,seg}) => {
        seg(0,19,12); seg(27,38,10); seg(46,62,12); seg(70,83,10); seg(88,99,12);
        rect(10,7,17,7); rect(33,5,38,5); rect(53,7,59,7); rect(78,5,82,5);
        rect(22,11,24,11); rect(41,11,43,11); rect(65,11,67,11); rect(85,11,86,11);
        set(2,11,'P'); set(30,9,'C'); set(73,9,'C'); set(96,11,'G');
        for(const[c,r]of[[7,10],[23,9],[31,8],[48,10],[66,9],[75,8],[93,10]])set(c,r,'B');
        for(const[c,r,ch]of[[35,9,'s'],[56,11,'e'],[80,9,'s']])set(c,r,ch);
      },
    },
    {
      id: "rainmaker",
      name: "THE RAINMAKER",
      displayName: "The Rainmaker",
      unlockText: "Listen for the warning, then cross beneath the Rainmaker.",
      authoringNotes: "A compact 20 by 14 boss chamber that fits one 320-pixel viewport. The flat floor leaves the root's ground wave readable and gives the player a clear five-column start.",
      routeDescription: "Read the ground warning and use the Rainmaker's openings to strike and retreat.",
      width: 20,
      height: 14,
      boss: "rainmaker",
      rainbells: [],
      build: ({ set, rect }) => {
        rect(0, 0, 0, 13); rect(19, 0, 19, 13); rect(1, 12, 18, 12); rect(1, 13, 18, 13);
        set(5, 11, "P");
      },
    },
  ];

  function create(buildLevel) {
    if (typeof buildLevel !== "function") throw new TypeError("rainbell chapter requires buildLevel");
    return rooms.map(room => {
      const level = { ...COMMON, ...room, npcs: [], movers: (room.movers || []).map(mover => ({ ...mover })) };
      level.map = buildLevel(room.width, room.height, room.build);
      delete level.width;
      delete level.height;
      delete level.build;
      return level;
    });
  }

  root.SporelingRainbellChapter = Object.freeze({ create });
})(typeof window === "object" ? window : globalThis);
