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

## 2026-05-28 Mobile quality v32

- Raised mobile renderer DPR cap to 1.68 and composer DPR cap to 1.52.
- Raised tablet renderer DPR cap to 1.72 and composer DPR cap to 1.58.
- Limited active jellyfish/cards from 15 to 12 before baked mesh replacement, click proxy creation, and rail stop generation.
- Increased mobile/tablet canvas contrast and saturation while reducing the mobile grade overlay opacity.

## 2026-05-28 Mobile jellyfish sharpness and flare guard

- Raised mobile renderer DPR cap to 2.0 and composer DPR cap to 1.82.
- Raised tablet renderer DPR cap to 1.92 and composer DPR cap to 1.78.
- Kept mobile/tablet DPR stable during scroll/touch interaction instead of lowering render resolution.
- Lowered mobile/tablet particle budgets and foreground additive opacity to reserve frame budget for the jellyfish.
- Enabled depth testing on foreground dust, cluster, and nebula layers so bright particles cannot draw through the whole scene when close to the camera.

## 2026-05-28 Mobile flare guard v34

- Follow-up after phone testing showed flare increased, so the issue was not only foreground generated particles.
- Found baked `star/dust/milky` scene materials still used additive blending and high opacity after material conversion.
- Switched mobile/tablet generated particles and baked space-dust materials to normal blending.
- Set mobile interaction bloom to 0 and tablet interaction bloom to 0.018 to prevent scroll movement from amplifying near-camera bright layers.

## 2026-05-28 Stable mobile glow v35

- Phone testing showed v34 removed too much color during scroll and made glow pop back when scrolling stopped.
- Set mobile/tablet interaction bloom equal to idle bloom so the image no longer changes grade between motion and rest.
- Reduced mobile/tablet bloom strength and raised threshold further, then restored constellation color through particle opacity and baked dust saturation.
- Kept foreground particle opacity lower than background opacity to protect against near-camera flare.

## 2026-05-28 Mobile screenshot QA v36

- Captured Edge headless mobile screenshots at 390x844 before scroll, during touch scroll, and after touch scroll.
- Confirmed the page uses the mobile profile, canvas renders at 780x1688, 12 baked jellyfish are active, and there are no console errors.
- Found FilmPass still changed during interaction even after bloom/DPR were stabilized.
- Added `stableInteractionGrade` for mobile/tablet so postprocessing values remain unchanged during scroll.

## 2026-05-28 Mobile jellyfish highlight clamp v37

- Multi-scroll screenshots showed the remaining flare was from close jellyfish surfaces, not from global bloom or starfield changes.
- Added mobile/tablet `jellyfishHighlightLimit` to switch baked jellyfish from the desktop physical material to a matte standard material.
- Added mobile/tablet `lightScale` to reduce point-light peaks while preserving color through a low emissive tint.

## 2026-05-28 Mobile foreground particle removal v38

- Follow-up screenshots showed the bright silhouettes were generated `foreground` point-cloud layers, not the 12 active baked jellyfish.
- Disabled foreground `dustCloud`, foreground `verticalStream`, and order-7 particle clusters on mobile/tablet.
- Kept background particle layers enabled so the scene stays colorful without white foreground flare.

## 2026-05-28 Mobile procedural point cloud removal v39

- v38 screenshots still showed white jellyfish-like silhouettes, so the source was broader than foreground-only layers.
- Disabled generated `pointsLayer`, `centralDust`, `dustCloud`, and `verticalStream` on mobile/tablet.
- Kept non-Points color planes and GLB particles to preserve the colored constellation look without procedural white flare.

## 2026-05-28 Mobile procedural plane removal v40

- Compared mobile screenshots while hiding GLB `milky/deep_space/star/dust` layers and found the white silhouettes stayed visible.
- Hiding model layers did not remove them because the culprit was unnamed generated cluster/nebula plane meshes from `addStarField()`.
- Added an early mobile/tablet return before those textured planes are created, while leaving desktop unchanged.

## 2026-05-28 Mobile overscroll lock v41

- User clarified the visible bug is a full-screen white flash, not white jellyfish hoods or individual bright points.
- Found the app still allowed native vertical touch panning through `touch-action: pan-y`, while the scene also uses swipe gestures for rail movement.
- Locked the viewport/page/canvas against native overscroll and added a non-passive canvas `touchmove` guard to prevent browser repaint flashes during scene swipes.
