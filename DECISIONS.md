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
