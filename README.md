# Sporeling Dash

A tiny fungal platformer in a single HTML file.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform blooms where you land — jump off it to chain across the void before it wilts. Six chambers, strange residents, the things the previous sporelings became, and a frightened guardian at the bottom of it all.

Wall-cling, spore-glide, three Adventure difficulties, a secret somewhere off the map, and **live leaderboards** — Any% and 100% completion. Submit your time from the victory screen.

Adventure offers Easy (5 health, healing every 8 berries), Normal (4 health, every 12), and Hard (3 health, every 16). Every difficulty retries from the latest checkpoint.

Timed Run starts in The Hollow with 4 health. The clock continues through checkpoint retries. Every clear ranks on Any%; collecting every berry, meeting every resident, and finding the secret memory also qualifies for the 100% board.

**Play:** https://thoughtcrimegpt.github.io/sporeling-dash/

## Controls

|            | Keyboard            | Gamepad      |
|------------|---------------------|--------------|
| Move       | A / D or Left / Right | Stick / D-pad|
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
