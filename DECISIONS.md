# Decisions

## Mobile and tablet rendering profile

- Added adaptive quality profiles for `mobile`, `tablet`, and `desktop`.
- Mobile/tablet reduce renderer DPR, composer DPR, bloom, film grain, generated particle density, and generated particle texture size.
- The animated jellyfish GLB and Draco-compressed spine scene stay unchanged so the main models keep their visible quality and animation fidelity.

## Interaction smooth mode

- During hover, scroll, and touch navigation, the renderer temporarily lowers DPR and postprocessing intensity, then restores the device profile when interaction settles.
- Non-hovered jellyfish morph mixers update on a staggered cadence during interaction, while the hovered jellyfish still updates every frame.
- This targets the heaviest moment: a large jellyfish close to the camera plus bloom/composer plus all background jellyfish animations.

## Click-to-focus jellyfish interaction

- Hover only marks the jellyfish under the pointer and changes the cursor; it no longer starts the camera-facing approach.
- The first click/tap on a jellyfish focuses it and moves it toward the camera. Clicking/tapping empty scene space releases it.
- Clicking/tapping the already focused jellyfish opens the detail modal.

## Runtime jellyfish asset slimming

- The published page now loads `assets/baked_geonodes_jellyfish.runtime.glb` before falling back to the original raw jellyfish GLB.
- The runtime GLB keeps the same mesh positions and morph-position animation, uses Draco for the base mesh, and strips morph-normal buffers to reduce transfer and parse cost.
- Inactive jellyfish morph mixers update on a staggered cadence even when idle; the hovered/focused jellyfish still updates every frame.
- The render loop pauses while the tab is hidden, and the local server caches `assets/` and `vendor/` files with long-lived immutable headers.
- Hover behavior was removed from the scene: pointer movement no longer raycasts or changes render state.
- Jellyfish focus is click-only. Pointer hit testing runs only for click/tap selection, using one pass over raycast intersections with a reusable world-position vector.
- Click hit proxies are deliberately small and tied to the jellyfish body, not the full tentacle height.
- When one jellyfish is focused, clicking anywhere except that same jellyfish closes the focus instead of selecting another jellyfish.
