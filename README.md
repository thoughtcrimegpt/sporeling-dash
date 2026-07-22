# Sporeling Dash

A fungal platformer built in a single HTML file.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform grows under your landing path. Jump from it and dash again before it wilts.

The main Adventure crosses 15 chambers. It introduces wall-cling, spore-glide, cracked floors, and the straight-down slam before a four-boss route through Barrow, the Chorus, Nikita Boar, and the Unbloomed/Shoggoth finale. Two hidden rooms, four persistent keepsakes, the Pale Root, and The Reach sit outside that route.

**Play:** https://thoughtcrimegpt.github.io/sporeling-dash/

## Modes

### Adventure

Adventure has no clock or leaderboard submission. Level select becomes available after the first chamber clear. A player who finishes Adventure can optionally add a public name before the credits roll; those names appear in completion order after "Thanks for playing."

| Difficulty | Health | Berry healing | Checkpoints |
|------------|--------|---------------|-------------|
| Easy       | 5      | Every 8       | Mercy retries in Skitterway, Marrow, and Swallow |
| Normal     | 4      | Every 12      | Mercy retries in Skitterway, Marrow, and Swallow |
| Hard       | 3      | Every 16      | Original sparse layout |

Deaths return you to the latest checkpoint and restore the current difficulty's full health.

### Timed Run

Timed Run always starts in The Hollow with 4 health. Its original sparse checkpoint layout stays intact, and the clock keeps running through deaths. Ghosts are off by default; players can opt into a personal-best or leaderboard ghost.

Every completed run qualifies for the Any% board. Collecting every berry, meeting every resident, finding the secret memory, and owning all four keepsakes also qualifies for the optional 100% board. The 15-chamber route uses fresh Any% and 100% board categories so its times are not mixed with the former 11-chamber route.

### New Game+

Finishing the main game unlocks The Pale Root: one long climb, two checkpoints, and its own leaderboard. Clearing the Pale Root unlocks The Reach, a separate five-part trial built around long horizontal and vertical bloom chains, enemy refunds, wall transfers, and speed. It has exactly two checkpoints. Every wall used by the intended route is rough and climbable; clearly striped smooth stone marks the shortcut barriers. The Gale includes one small recovery island inside its full-width enemy chain, while the Spire and final ascent trade resting shelves for longer connector sequences. If the player falls back from the final climb and lands below it, that section's enemy connectors reset for another attempt.

The leaderboard names each route directly: Any%, 100%, Pale Root, and The Reach. The Reach has no collectibles or completion variants: reaching its crown is the whole trial, with one champion ghost and one personal-best ghost.

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
11. The Underfield — cracked floors teach the down-slam
12. The Truffle Runs — slam drops lead into a long enemy-refund crossing
13. The Boar Pit — Nikita Boar
14. The Rootworks
15. The Mother's Throat — the Unbloomed and Shoggoth

The Undrawn Map is hidden above the Spire. A second hidden room sits high beyond the Bloomheart's right wall. A small Frog sign and a berry trail mark the start, but three overhangs stop a straight wall climb; two enemy connectors return after a failed attempt. FROG lives inside beneath a pile of old hardware and only makes frog noises. The Pale Root unlocks after the main game is beaten; The Reach appears only after the Pale Root is cleared.

Nikita Boar is the boss of the Boar Pit. He charges into the arena wall and rolls onto his side; only a straight-down slam on the marked flank hurts him. Later phases add one ground wave after each crash. The Rootworks gives the route a short cooldown before the final encounter, and the credits resolve the missing-truffle story with a luau.

## Keepsakes

Four keepsakes persist on the device that found them. They are placed on the Rotroot tall-wall route, in the Skitterway alcove, beside a Swallow molar, and inside the Bloomheart secret room. They are optional extras for the main 100% board; The Reach has no collectibles and hides the collectible HUD entirely.

## Controls

| Action     | Keyboard              | Gamepad       |
|------------|-----------------------|---------------|
| Move       | A / D or Left / Right | Stick / D-pad |
| Jump       | Space / Z / K         | A / B         |
| Dash       | Shift / J             | X / RB / LB   |
| Down-slam  | Hold Down + Dash in air | Down + Dash |
| Finish dialogue text | E / Enter   | Y             |
| Pause      | Esc / P               | Start         |

Menus support arrows, WASD, D-pad, mouse, and touch. The title has separate Reviews, Patch Notes, and Leaderboards screens; review handles link to their X profiles. On touch screens, a compact stick and A button remain visible on the title and those auxiliary screens, which also have a large Back button. The title uses an Adventure/Timed selector and a large Play button, while pause, completion-name, and win actions are direct tap targets. Tap actions use short haptic and pressed feedback. Full mobile controls appear automatically during play and can be mirrored for left-handed use. Reduced Motion is available from the pause menu.

No dependencies, no build step — open `index.html` and play.

## Development

Development work stays on `goal-mode-dev`; production `main` is never updated directly.

```text
npm run dev
npm test
npm run audit:route
```

`npm run dev` serves the same single-file game locally at `http://127.0.0.1:8765/` with DEV tools enabled. The local Test Level selector cycles through every chamber, secret room, and standalone trial in either mode. Test Damage can be switched off locally, but neither test control exists or works on the deployed game. `npm test` runs the dependency-free game checks, including progression, secret-room return, keepsake persistence, checkpoint budgets, Reach fuel spacing, and checkpoint-to-checkpoint Reach route probes in the real game engine. `npm run audit:route` runs the scripted chamber route probe.
