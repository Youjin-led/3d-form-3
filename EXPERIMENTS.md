# Experiments

## 2026-05-28 Runtime jellyfish GLB slimming

- Checked `assets/baked_geonodes_jellyfish.glb`: 50,074,804 bytes, one mesh, 195,566 vertices, 9 morph targets, 1 animation.
- Blender Draco re-export alone produced `assets/baked_geonodes_jellyfish.draco.glb` at 45,426,392 bytes because morph target buffers remained uncompressed.
- Stripping morph-normal targets from the Draco export produced `assets/baked_geonodes_jellyfish.runtime.glb` at 24,303,904 bytes while preserving all morph-position targets.
- `node --check main.js`, `node --check server.js`, and `node --check tools/strip_morph_normals_glb.js` passed.
- Puppeteer browser verification was blocked by local browser launch timeout before page navigation; local server HEAD check for the runtime GLB returned 200 with immutable cache headers.

## 2026-05-28 Hover lag cleanup

- Found a hot-path issue: focused jellyfish called `material.needsUpdate = true` every animation frame while changing/restoring depth test state.
- Changed depth-test helpers to update materials only when the requested state differs from the current state.
- Replaced hover raycast hit sorting with a single-pass nearest-screen-distance selection and one reusable world-position vector.
- Added `portrait` to responsive settings because existing code read `settings.portrait` but the setting was not returned.
- Removed a dead starfield loop that never executed (`cluster < 0`).

## 2026-05-28 Click-only interaction

- Removed pointer-move, pointer-leave, and pointer-cancel scene listeners.
- Removed the hovered-card state path; click/tap is now the only interaction that raycasts against jellyfish hit proxies.
- Renamed focus internals away from hover terminology so the code matches the product behavior.
- Bumped asset/cache version to `jelly-click-only-v29`.

## 2026-05-28 Click target correction

- Reduced invisible jellyfish click-proxy radius from full-body/tentacle scale to a smaller body-scale proxy.
- Changed focused-state click behavior: if a jellyfish is focused, clicking another jellyfish or empty space only releases the current focus.
- Bumped cache version to `jelly-click-only-v30`.

## 2026-05-28 Mobile/tablet quality recovery

- Raised mobile renderer DPR cap from 1.12 to 1.48 and composer DPR cap from 0.96 to 1.32.
- Raised tablet renderer DPR cap from 1.28 to 1.58 and composer DPR cap from 1.16 to 1.44.
- Enabled antialiasing outside desktop profiles.
- Restored more bloom, film grain, particle density, particle opacity, and generated texture size on mobile/tablet.
- Slightly tightened mobile/tablet framing so the scene reads with more detail on smaller screens.
