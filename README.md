# Sporeling Dash

A fungal platformer built in a single HTML file.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform grows under your landing path. Jump from it and dash again before it wilts.

The main Adventure crosses 11 chambers, introduces wall-cling and spore-glide, and ends in a three-stage run of the Chorus, the Swallow, and the Unbloomed. Two hidden rooms, five persistent keepsakes, the Pale Root, and The Reach sit outside that route.

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

Every completed run qualifies for the Any% board. Collecting every berry, meeting every resident, finding the secret memory, and owning all five keepsakes also qualifies for the 100% board.

### New Game+

Finishing the main game unlocks The Pale Root: one long climb, two checkpoints, and its own leaderboard. Clearing the Pale Root unlocks The Reach, a separate five-part trial built around bloom chains, enemy refunds, wall work, and speed. It has exactly two checkpoints.

The leaderboard names each route directly: Any%, 100%, Pale Root, Reach Any%, and Reach Full. Reach Full requires the summit keepsake during that attempt. Each Reach board keeps its own champion ghost and personal-best ghost.

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

The Undrawn Map is hidden above the Spire. A second hidden room sits beyond the Bloomheart's risky right-wall route. The Pale Root unlocks after the main game is beaten; The Reach appears only after the Pale Root is cleared.

## Keepsakes

Five keepsakes persist on the device that found them. They are placed on the Rotroot tall-wall route, in the Skitterway alcove, beside a Swallow molar, inside the Bloomheart secret room, and at the Reach summit. The HUD shows the current collection total.

## Controls

| Action     | Keyboard              | Gamepad       |
|------------|-----------------------|---------------|
| Move       | A / D or Left / Right | Stick / D-pad |
| Jump       | Space / Z / K         | A / B         |
| Dash       | Shift / J             | X / RB / LB   |
| Finish dialogue text | E / Enter   | Y             |
| Pause      | Esc / P               | Start         |

Menus support arrows, WASD, D-pad, mouse, and touch. On touch screens, the title uses an Adventure/Timed selector and a large Play button; pause and win actions are direct tap targets. Gameplay controls disappear while a menu is open, and tap actions use short haptic and pressed feedback. Mobile controls appear automatically during play and can be mirrored for left-handed use. Reduced Motion is available from the pause menu.

No dependencies, no build step — open `index.html` and play.

## Development

Development work stays on `goal-mode-dev`; production `main` is never updated directly.

```text
npm run dev
npm test
npm run audit:route
```

`npm run dev` serves the same single-file game locally at `http://127.0.0.1:8765/` with DEV tools enabled. The local Test Level selector cycles through every chamber, secret room, and standalone trial in either mode. Test Damage can be switched off locally, but neither test control exists or works on the deployed game. `npm test` runs the dependency-free game checks, including progression, secret-room return, keepsake persistence, checkpoint budgets, Reach fuel spacing, and checkpoint-to-checkpoint Reach route probes in the real game engine. `npm run audit:route` runs the scripted chamber route probe.
