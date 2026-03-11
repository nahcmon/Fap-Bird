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
- Verification:
- Desktop regression pass with the bundled Playwright game client completed successfully against `http://127.0.0.1:4173/index.html`.
- Mobile-sized browser checks confirmed the mobile menu hides extra modes and shows fullscreen single-player copy.
- Post-change regression pass completed again after the rope-physics update; gameplay screenshots show the chain bending as a rope.
- `curl -I http://127.0.0.1:4173/favicon.svg` returned `200 OK`, and the page head now points to `./favicon.svg`.
- Post-change regression pass completed again after the fixed-world physics/audio work; `render_game_to_text` now reports `singlePlayerWorld: { width: 384, height: 720 }`.
- Mobile-sized browser checks now show `audioContext.state === "running"` after interaction and the same fixed single-player world dimensions as desktop.
