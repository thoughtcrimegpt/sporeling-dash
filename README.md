# Sporeling Dash

A fungal platformer with a single-file game engine and a painted environment asset.

The V5 remake adds a bioluminescent cathedral backdrop, illustrated mushroom characters and blooms, smooth lighting, richer stone and moss, and a four-times-resolution drawing buffer. Gameplay stays strictly 2D. The procedural backdrop remains available if the image cannot load.

The Mother Bloom has gone quiet. Dash in mid-air and a mushroom platform grows under your landing path. Jump from it and dash again before it wilts.

The main Adventure crosses 15 chambers. It introduces wall-cling, spore-glide, cracked floors, and the straight-down slam before a four-boss route through Barrow, the Chorus, the Boar Pit, and the Unbloomed/Shoggoth finale. Two hidden rooms, four persistent keepsakes, the Pale Root, and The Reach sit outside that route.

Adventure also has Resonance: bounce or dash through ordinary enemies and chain blooms to fill the meter. At full charge, press Q, gamepad Y, or the touch burst button for a radial burst that clears nearby ordinary enemies, restores dash and blooms, and lifts you upward. A released and re-pressed jump provides one midair flutter jump; solid landings refresh it.

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
11. The Underfield — a one-time down-slam lesson followed by six breakable floors, fast runners, wisps, spitters, and bouncing firecaps
12. The Truffle Runs — slam drops lead into a much longer enemy-refund crossing marked by visible truffles
13. The Boar Pit — a flat arena for its unnamed boss
14. The Rootworks — three long horizontal enemy chains and one midpoint checkpoint
15. The Mother's Throat — the Unbloomed and Shoggoth

The Undrawn Map is hidden above the Spire. A second hidden room sits high beyond the Bloomheart's right wall. A small Frog sign and a berry trail mark the start, but three overhangs stop a straight wall climb; two enemy connectors return after a failed attempt. FROG lives inside beneath a pile of old hardware and only makes frog noises. The Pale Root unlocks after the main game is beaten; The Reach appears only after the Pale Root is cleared.

The Boar Pit's unnamed boss is drawn as a pink boar with swept dark hair, an oversized snout, and two uneven white eyes. A hard white title card, heavy opening shake, and brighter arena announce the fight without hiding its silhouette. The arena has a clear floor so the marked flank is always reachable. Only a straight-down slam on that flank deals damage. Each phase raises the charge speed, the tell locks before the rush, and the last phase rebounds into a second full-arena charge. The boss stays belly-up long enough to reposition and attack. Its former projectile fan and ground wave are gone. If the player dies during any boss encounter, that boss returns to full health. The Rootworks then tests the enemy-bounce and dash-refund mechanics across three long horizontal gaps before the final encounter. The credits resolve the missing-truffle story with a luau.

During the Shoggoth's opening, any player contact with the raised eye deals damage, regardless of movement direction. Dashing through the body during that same opening also deals damage.

Ordinary checkpoint, enemy, and boss notices use a small high-contrast card in the upper-right corner, leaving the route visible. Their timers pause whenever resident dialogue is active, so the two kinds of text never compete. The first checkpoint explanation appears briefly once on that device; later checkpoints communicate through their sound and activation animation. The down-slam is first taught where it becomes useful in the Underfield: play pauses for a one-time high-contrast lesson until the player confirms it with A, Space, Enter, or the touch A button.

## Keepsakes

Four keepsakes persist on the device that found them. They are placed on the Rotroot tall-wall route, in the Skitterway alcove, beside a Swallow molar, and inside the Bloomheart secret room. They are optional extras for the main 100% board; The Reach has no collectibles and hides the collectible HUD entirely.

## Controls

| Action     | Keyboard              | Gamepad       |
|------------|-----------------------|---------------|
| Move       | A / D or Left / Right | Stick / D-pad |
| Jump       | Space / Z / K         | A / B         |
| Dash       | Shift / J             | X / RB / LB   |
| Spore burst (Adventure, full Resonance) | Q | Y |
| Down-slam  | Hold Down + Dash in air | Down + Dash |
| Finish dialogue text | E / Enter   | Y             |
| Pause      | Esc / P               | Start         |

Menus support arrows, WASD, D-pad, mouse, and touch. Responsive title and pause screens use readable text and large buttons, with Controls & Help and Settings available in both. Extras & challenges contains reviews, patch notes, leaderboards, and unlockable trials. Review and leaderboard handles link to their X profiles, and recorded ghosts can be raced from the leaderboard. Restarting from the beginning requires confirmation.

On phones, drag Move to aim, then tap Jump or Dash. Release Jump and tap again in the air to flutter in Adventure. A dedicated Slam button appears when the move is introduced; Burst shows its charge and lights up when ready. Controls support simultaneous fingers, and Settings can mirror the layout. Touch menus use direct buttons. Gameplay instructions, conversations, and status use text sized for the screen. Reduced motion and music settings are available from either menu.

No dependencies or build step. Keep the `assets` and `ui` folders beside `index.html`, then open it and play. The developer server and tests require Node.js 20 or newer.

## Development

Development work stays on `goal-mode-dev`; production `main` is never updated directly.

```text
npm run dev
npm test
npm run audit:route
```

`npm run dev` serves the same single-file game locally at `http://127.0.0.1:8765/` with DEV tools enabled. The local Test Level selector cycles through every chamber, secret room, and standalone trial in either mode. Test Damage can be switched off locally, but neither test control exists or works on the deployed game. `npm test` runs the dependency-free game checks, including progression, secret-room return, keepsake persistence, checkpoint budgets, Reach fuel spacing, and checkpoint-to-checkpoint Reach route probes in the real game engine. `npm run audit:route` runs the scripted chamber route probe.
