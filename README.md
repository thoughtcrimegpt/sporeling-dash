# Sporeling Dash

A tiny fungal platformer in a single HTML file.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform blooms where you land — jump off it to chain across the void before it wilts. Six chambers, strange residents, the things the previous sporelings became, and a frightened guardian at the bottom of it all.

Wall-cling, spore-glide, a lives system, a secret somewhere off the map, and **live leaderboards** — any% and full completion. Submit your time from the victory screen.

**Play:** https://thoughtcrimegpt.github.io/sporeling-dash/

## Controls

|            | Keyboard            | Gamepad      |
|------------|---------------------|--------------|
| Move       | WASD / Arrows       | Stick / D-pad|
| Jump       | Space / Z / K       | A / B        |
| Dash       | Shift / J           | X / RB / LB  |
| Pause      | Esc / P             | Start        |

No dependencies, no build step — open `index.html` and play.

## Development

Development work stays on `goal-mode-dev`; production `main` is never updated directly.

```text
npm run dev
npm test
```

`npm run dev` serves the same single-file game locally at `http://127.0.0.1:8765/` with DEV tools enabled. `npm test` runs the dependency-free script, level-map, and input-safety checks.
