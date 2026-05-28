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

## Balanced mobile/tablet quality

- Mobile and tablet profiles now keep WebGL antialiasing enabled and use higher renderer/composer pixel ratios.
- Particle and generated texture scales are raised on mobile/tablet because the runtime GLB and click-only interaction already removed the largest load and hover costs.
- Mobile/tablet camera framing is slightly closer so objects do not look small and over-decimated.
- CSS canvas grading on mobile/tablet is closer to desktop contrast/saturation instead of the earlier muted low-power look.

## Mobile quality v32

- Active jellyfish count is capped at 12 across layout, click proxies, animation mixers, and rail navigation.
- The three removed tail items are hidden before replacement with the baked jellyfish mesh, so they do not spend mobile render or interaction budget.
- Mobile and tablet DPR/composer caps were raised again, with slightly stronger contrast/saturation and a lighter mobile grade overlay.

## Mobile quality v33

- Mobile/tablet interaction no longer drops renderer or composer DPR, so jellyfish stay sharp while scrolling.
- Mobile/tablet renderer DPR caps were raised again and paid for by reducing background particle density/opacity.
- Foreground additive dust and nebula layers now keep depth testing enabled and use lower mobile opacity/size to avoid full-screen flare when the camera crosses them.

## Mobile flare guard v34

- Mobile scroll/touch interaction disables bloom instead of only reducing it.
- Generated starfield, cluster, and nebula layers use normal alpha blending on mobile/tablet; desktop keeps additive glow.
- Baked GLB star/dust/milky materials are also softened on mobile/tablet with normal blending, lower opacity, and explicit depth testing.

## Stable mobile glow v35

- Mobile/tablet bloom strength is now stable during and after scroll, avoiding the visible color/glow jump when interaction ends.
- Constellation color is restored through stronger mobile particle opacity and baked dust saturation instead of additive blending.
- Foreground near-camera particles stay heavily capped, so the color return does not reintroduce full-screen white flares.

## Stable mobile interaction grade v36

- Mobile/tablet no longer switch any visual render grade during scroll: DPR, composer DPR, bloom, and film stay identical between idle and interaction.
- `interactionActive` is still tracked for animation cadence and diagnostics, but `stableInteractionGrade` prevents postprocessing changes on mobile/tablet.
- Render diagnostics now expose whether interaction grade is actually used, plus current bloom and film values for screenshot QA.

## Mobile jellyfish highlight clamp v37

- Mobile/tablet baked jellyfish use a matte `MeshStandardMaterial` instead of the desktop physical material, preventing close camera angles from turning bell surfaces white.
- Mobile/tablet scene light intensities are scaled down while jellyfish keep a small cyan/magenta emissive tint, so color remains without flare.
- Desktop keeps the physical jellyfish material and full light intensity.

## Mobile foreground particle removal v38

- Mobile/tablet no longer render generated foreground particle layers because they read as white jellyfish silhouettes and caused perceived flare.
- Background constellation, dust, nebula, and the 12 active baked jellyfish remain visible and colored.
- Desktop keeps the foreground particle layers for depth and atmosphere.

## Mobile procedural point cloud removal v39

- Mobile/tablet now skip all generated `Points` clouds, not only foreground clouds, because overlapping point clouds could still form bright white jellyfish-like silhouettes.
- GLB star/dust meshes, color cluster planes, nebula planes, and the 12 active baked jellyfish remain active on mobile/tablet.
- Desktop keeps the generated point clouds.

## Mobile procedural plane removal v40

- Mobile/tablet now also skip generated cluster and nebula planes after the point-cloud calls.
- The remaining mobile atmosphere comes from the baked GLB scene particles, which do not cross the camera as large white textured planes.
- Desktop keeps the full generated starfield, cluster planes, and nebula planes.

## Mobile overscroll lock v41

- The full-screen white flash is treated as a native mobile overscroll/viewport repaint issue, not as a white object in the 3D scene.
- The page, stage, and canvas are fixed to the viewport and disable browser overscroll.
- Canvas touch movement now explicitly prevents native scrolling while the existing custom rail swipe remains in control.
