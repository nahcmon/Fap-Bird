Original prompt: Fix/implement the mobile view of this app so it works with touchscreens. It should just take up the whole screen on mobile devices as they are not widescreen like dekstops are anyway. Make sure to either come up with a new method for gamemodes other than singleplayer or remove those from the mobile app. Note that i am just running this on vercel so keep that in mind with all the changes you make.

## TODO
- None.

## Notes
- `index.html` is the deployed static app entrypoint.
- `fap-bird.html` appears to be an older standalone copy and is not the primary Vercel entrypoint.
- Mobile now switches to a fullscreen single-player layout on narrow viewports and touch-first devices.
- Touch handling moved to the game container so start and game-over overlays can respond to taps.
- Mobile hides `MULTIPLAYER` and `UNLIMITED` instead of trying to support keyboard join flows on phones.
- Added a local `favicon.svg` and linked it from `index.html`.
- The requested `imagegen` flow is prepared and dry-run validated, but live generation is blocked in this session because `OPENAI_API_KEY` is not set.
- Replaced the old angle-based anatomy chain with a constrained rope made of linked points so tip position, drawing, particles, and collisions all share the same geometry.
- Single-player now simulates in a fixed `384x720` world on both desktop and mobile, with the fullscreen mobile view only affecting rendering scale.
- Mobile audio now primes the existing Web Audio oscillator sounds on touch/key gestures and queues the first sound until `AudioContext.resume()` completes.
- Tablet/mobile fullscreen single-player now renders with a uniform contain-scale box inside the available screen instead of stretching the gameplay world.
- Added a fixed-step simulation loop (`window.advanceTime`) so gameplay speed no longer depends on device frame timing; pipe motion now uses difficulty presets instead of varying with mobile/tablet render cadence.
- Added a 3-level difficulty selector (`SLOW`, `MEDIUM`, `FAST`) that changes horizontal pipe speed globally across single-player and desktop multiplayer modes.
- Each flap now shortens the rope slightly, each scored pipe grows it more than a flap shrinks it, and fleshlight pickups can reset the length so score is no longer capped by guaranteed rope growth.
- Fleshlight pickups now spawn randomly in the course, pause the run for about 3 seconds on contact, attach to the rope during a thrust animation, briefly widen the bird's eye, then disappear and reset rope length.
- Replaced the placeholder-drawn fleshlight with a real product photo cutout stored locally at `assets/fleshlight-cropped.png`; `index.html` now preloads the image and falls back to the vector draw if the asset fails.
- `assets/fleshlight-attribution.txt` records the Wikimedia Commons source and the crop/background-removal changes applied to the licensed image.
- Refined the local cutout again so it reads cleaner at game scale and removed more of the leftover top-cap/edge artifacts from the first pass.
- Fleshlight pickups now live in the horizontal space between pipe pairs instead of inside the pipe gap, and they are biased toward either the top or bottom of the lane to make them harder to collect.
- The fleshlight thrust phase now runs at roughly 2x the previous speed, and the eye-pop moved to the end of the event so the run stays paused until the eyes return to normal.
- Difficulty got a broad retune: every tier now has tighter pipe spacing, smaller openings, and harsher bird physics, with `FAST` taking the largest jump (`pipeSpeed 4.85`, `pipeSpacing 312`, `pipeGap 176`, `gravity 0.46`).
- Verification:
- Desktop regression pass with the bundled Playwright game client completed successfully against `http://127.0.0.1:4173/index.html`.
- Mobile-sized browser checks confirmed the mobile menu hides extra modes and shows fullscreen single-player copy.
- Post-change regression pass completed again after the rope-physics update; gameplay screenshots show the chain bending as a rope.
- `curl -I http://127.0.0.1:4173/favicon.svg` returned `200 OK`, and the page head now points to `./favicon.svg`.
- Post-change regression pass completed again after the fixed-world physics/audio work; `render_game_to_text` now reports `singlePlayerWorld: { width: 384, height: 720 }`.
- Mobile-sized browser checks now show `audioContext.state === "running"` after interaction and the same fixed single-player world dimensions as desktop.
- Post-change regression pass completed again after the difficulty/fleshlight update; bundled Playwright gameplay output showed fixed `singlePlayerWorld` state, the difficulty label, and tap-based rope shrink in `render_game_to_text`.
- Tablet-sized forced-mobile checks (`1024x1366`) showed `activeArea` using an aspect-preserving fullscreen render box (`728.53x1366`) instead of stretching.
- Desktop smoke checks confirmed `FAST` difficulty moved multiplayer pipes by `3.8` per fixed step and that one player's fleshlight event pauses the shared multiplayer course.
- Manual screenshot inspection confirmed the fleshlight event renders on-screen as an attached 3-second animation with the bird held in place.
- The image-backed fleshlight asset loaded successfully in-browser (`337x634`) and manual screenshots confirmed both the floating pickup and the attached event animation use the real cutout instead of the placeholder vector.
- Follow-up browser checks confirmed between-pipes placement in the top/bottom bands, a final eye-pop phase (`phase: "eye-pop"`) after the thrust sequence, and resumed play only after that phase clears.
- Post-change regression pass completed again after the fleshlight-refinement update; bundled Playwright output still showed stable single-player state with fixed-world physics.
- Follow-up numeric checks confirmed the difficulty tiers now diverge correctly: after 10 fixed steps, pipe X moved to `354.5` on `SLOW`, `347.0` on `MEDIUM`, and `335.5` on `FAST`, with matching gravity/gap changes applied to new birds.
- Post-change regression pass completed again after the global difficulty retune; the bundled Playwright single-player burst now reaches `gameOver` faster on `MEDIUM`, confirming the base game is materially harder.
