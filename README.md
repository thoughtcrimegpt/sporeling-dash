# Sporeling Dash

A fungal platformer built in a single HTML file.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform grows under your landing path. Jump from it and dash again before it wilts.

The main Adventure crosses 11 chambers, introduces wall-cling and spore-glide, and ends in a three-stage run of the Chorus, the Swallow, and the Unbloomed. There is also a hidden chamber and an unlockable Pale Root gauntlet.

**Play:** https://thoughtcrimegpt.github.io/sporeling-dash/

## Modes

### Adventure

Adventure has no clock or leaderboard submission. Level select becomes available after the first chamber clear.

| Difficulty | Health | Berry healing | Checkpoints |
|------------|--------|---------------|-------------|
| Easy       | 5      | Every 8       | Mercy retries in Skitterway, Marrow, and Swallow |
| Normal     | 4      | Every 12      | Mercy retries in Skitterway, Marrow, and Swallow |
| Hard       | 3      | Every 16      | Original sparse layout |

Deaths return you to the latest checkpoint and restore the current difficulty's full health.

### Timed Run

Timed Run always starts in The Hollow with 4 health. Its original sparse checkpoint layout stays intact, and the clock keeps running through deaths. Ghosts are off by default; players can opt into a personal-best or leaderboard ghost.

Every completed run qualifies for the Any% board. Collecting every berry, meeting every resident, and finding the secret memory also qualifies for the 100% board.

### New Game+

Finishing the main game unlocks The Pale Root: one long climb, two checkpoints, and its own leaderboard.

## Chambers

1. The Hollow
2. Rotroot Chasm
3. The Spire
4. Mycel Gardens
5. The Skitterway
6. The Broodnest — Barrow
7. The Bloomheart
8. The Marrow
9. The Chorus Hall — Chorus
10. The Swallow
11. The Mother's Throat — the Unbloomed and Shoggoth

The Undrawn Map is hidden outside the main route. The Pale Root unlocks after the main game is beaten.

## Controls

| Action     | Keyboard              | Gamepad       |
|------------|-----------------------|---------------|
| Move       | A / D or Left / Right | Stick / D-pad |
| Jump       | Space / Z / K         | A / B         |
| Dash       | Shift / J             | X / RB / LB   |
| Finish dialogue text | E / Enter   | Y             |
| Pause      | Esc / P               | Start         |

Menus support arrows, WASD, D-pad, mouse, and touch. Mobile controls appear automatically and can be mirrored for left-handed play. Reduced Motion is available from the pause menu.

No dependencies, no build step — open `index.html` and play.

## Development

Development work stays on `goal-mode-dev`; production `main` is never updated directly.

```text
npm run dev
npm test
npm run audit:route
```

`npm run dev` serves the same single-file game locally at `http://127.0.0.1:8765/` with DEV tools enabled. `npm test` runs the dependency-free game checks. `npm run audit:route` runs the scripted chamber route probe.
