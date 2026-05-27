# Decisions

## Mobile and tablet rendering profile

- Added adaptive quality profiles for `mobile`, `tablet`, and `desktop`.
- Mobile/tablet reduce renderer DPR, composer DPR, bloom, film grain, generated particle density, and generated particle texture size.
- The animated jellyfish GLB and Draco-compressed spine scene stay unchanged so the main models keep their visible quality and animation fidelity.
