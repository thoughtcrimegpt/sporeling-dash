# Sporeling Dash

A woodland platformer with a dependency-free canvas engine, the original pixel mushroom hero, and four painted environments.

The storybook overhaul restores the original pixel hero and builds a warmer world around it: Hearthwood, Lantern Canopy, Rainbell Hollows, and Heartroot. Seven main-route chambers have new terrain and pacing. Wall-cling, spore-glide, temporary bloom platforms, and the down-slam remain the foundation of movement.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom catches you at the end of the dash. Jump or dash straight from that new step before it wilts. Each fresh mushroom spends one spore; solid ground and enemies restore your supply.

The main Adventure crosses 15 chambers and four guardian encounters: Barrow, the Chorus, Brambleback, and the Heartwood Guardian. Two hidden rooms, four persistent keepsakes, the Pale Root, and The Reach sit outside that route.

Adventure also has Resonance: bounce or dash through ordinary enemies and chain blooms to fill the meter. At full charge, press Q, gamepad Y, or the touch burst button for a radial burst that clears nearby ordinary enemies, restores dash and blooms, and lifts you upward. A released and re-pressed jump provides one midair flutter jump; an input just before landing waits for a normal jump. Adventure mushrooms last longer to give you time to choose your next step.

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

Every completed run qualifies for the Any% board. Collecting every berry, meeting every resident, finding the secret memory, and owning all four keepsakes also qualifies for the optional 100% board. The storybook route uses fresh Any% and 100% board categories and personal bests so its times and ghosts are not mixed with previous layouts.

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
11. The Underfield — a one-time down-slam lesson followed by six breakable floors, fast runners, wisps, spitters, and bouncing firecaps
12. The Truffle Runs — slam drops lead into a much longer enemy-refund crossing marked by visible truffles
13. Brambleback’s Clearing: a flat charge-and-slam arena
14. The Rootworks — three long horizontal enemy chains and one midpoint checkpoint
15. Heartroot: the Heartwood Guardian

The Undrawn Map is hidden above the Spire. A second hidden room sits high beyond the Bloomheart's right wall. A small Frog sign and a berry trail mark the start, but three overhangs stop a straight wall climb; two enemy connectors return after a failed attempt. FROG lives inside beneath a pile of old hardware and only makes frog noises. The Pale Root unlocks after the main game is beaten; The Reach appears only after the Pale Root is cleared.

Brambleback is a woodland boar with a leafy flank. Its charge direction is announced before the rush; after a crash, the mint flank marks a straight-down slam opportunity. Later phases introduce faster charges and a rebound. Every boss resets to full health on a retry.

The Heartwood Guardian's crown marks its first opening. During its final form, touching the raised flower or dashing through its body during the opening deals damage. Directional warnings announce lunges, and amber ground marks announce rising roots. The ending restores the forest and brings its residents together for supper.

Ordinary checkpoint, enemy, and boss notices use a small high-contrast card in the upper-right corner, leaving the route visible. Their timers pause whenever resident dialogue is active, so the two kinds of text never compete. The first checkpoint explanation appears briefly once on that device; later checkpoints communicate through their sound and activation animation. The down-slam is first taught where it becomes useful in the Underfield: play pauses for a one-time high-contrast lesson until the player confirms it with A, Space, Enter, or the touch A button.

## Keepsakes

Four keepsakes persist on the device that found them. They are placed on the Rotroot tall-wall route, in the Skitterway alcove, beside a Swallow molar, and inside the Bloomheart secret room. They are optional extras for the main 100% board; The Reach has no collectibles and hides the collectible HUD entirely.

## Controls

| Action     | Mouse and keyboard    | Gamepad       |
|------------|-----------------------|---------------|
| Move       | A / D or Left / Right | Stick / D-pad |
| Jump       | Right mouse or Space / Z / K | A / B         |
| Dash       | Aim pointer + left mouse, or Shift / J | X / RB / LB   |
| Spore burst (Adventure, full Resonance) | Q | Y |
| Down-slam  | Hold Down + Dash in air | Down + Dash |
| Finish dialogue text | E / Enter   | Y             |
| Pause      | Esc / P               | Start         |

Press F or click Full screen in the title/pause menu. Fullscreen includes the menus and touch controls. Use F or the browser's Escape shortcut to leave it. The desktop HUD stays compact as the game window grows, including on Retina displays.

Menus support arrows, WASD, D-pad, mouse, and touch. Responsive title and pause screens use readable text and large buttons, with Controls & Help and Settings available in both. Extras & challenges contains reviews, patch notes, leaderboards, and unlockable trials. Review and leaderboard handles link to their X profiles, and recorded ghosts can be raced from the leaderboard. Restarting from the beginning requires confirmation.

On phones, drag Move to move and tap Jump. Drag the Dash button in a direction and release to dash; a quick tap uses the movement direction. Release Jump and tap again in the air to flutter in Adventure. A dedicated Slam button appears when the move is introduced; Burst shows its charge and lights up when ready. Controls support simultaneous fingers, and Settings can mirror the layout. Touch menus use direct buttons. Gameplay instructions, conversations, and status use text sized for the screen. Reduced motion and music settings are available from either menu.

Aiming the pointer or dragging Dash downward performs an ordinary dash. Slam is a deliberate Down + Dash command, or the dedicated touch button. Jump and Dash pressed together take off first, then launch the captured dash on the next simulation tick.

No dependencies or build step. Keep the `assets` and `ui` folders beside `index.html`, then open it and play. The developer server and tests require Node.js 20 or newer.

## Development

The storybook overhaul is developed on `storybook-overhaul`; production is updated only after release approval.

```text
npm run dev
npm test
npm run audit:route
```

`npm run dev` serves the same static game locally at `http://127.0.0.1:8765/` with DEV tools enabled. The local Test Level selector cycles through every chamber, secret room, and standalone trial in either mode. Test Damage can be switched off locally, but neither test control exists or works on the deployed game. `npm test` runs the dependency-free game checks, including progression, secret-room return, keepsake persistence, checkpoint budgets, Reach fuel spacing, and checkpoint-to-checkpoint Reach route probes in the real game engine. `npm run audit:route` runs the scripted chamber route probe.
