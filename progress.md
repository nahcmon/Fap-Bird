Original prompt: Fix/implement the mobile view of this app so it works with touchscreens. It should just take up the whole screen on mobile devices as they are not widescreen like dekstops are anyway. Make sure to either come up with a new method for gamemodes other than singleplayer or remove those from the mobile app. Note that i am just running this on vercel so keep that in mind with all the changes you make.

## TODO
- None.

## Notes
- `index.html` is the deployed static app entrypoint.
- `fap-bird.html` appears to be an older standalone copy and is not the primary Vercel entrypoint.
- Mobile now switches to a fullscreen single-player layout on narrow viewports and touch-first devices.
- Touch handling moved to the game container so start and game-over overlays can respond to taps.
- Mobile hides `MULTIPLAYER` and `UNLIMITED` instead of trying to support keyboard join flows on phones.
- Verification:
- Desktop regression pass with the bundled Playwright game client completed successfully against `http://127.0.0.1:4173/index.html`.
- Mobile-sized browser checks confirmed the mobile menu hides extra modes and shows fullscreen single-player copy.
