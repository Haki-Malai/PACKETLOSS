# Testing

Tests use Vitest in a Node environment and live in `src/__tests__/`. They cover movement and collision rules, ghosts and collectibles, portals and map parsing, input and pause behavior, the runtime, camera, rendering, and HUD adapters. Browser dependencies are stubbed where needed.

## Commands

- `pnpm test` — run the regression suite.
- `pnpm typecheck` — check TypeScript types.
- `pnpm lint` — run ESLint with zero warnings allowed.
- `pnpm test:all` — run all three checks and build the production bundle.

Run a focused test while working on a feature:

```sh
pnpm test src/__tests__/portalService.test.ts
```

## Adding or changing tests

Each test should identify a meaningful failure it would catch. Prefer small authored scenarios with independent expected outcomes, especially boundary conditions, state transitions, and resource ownership. For a bug fix, add a regression case to the relevant test file and remove any redundant coverage it replaces.

- Exercise gameplay through domain services and systems. Use authored map objects and public operations instead of injecting private state; do not construct a Three.js scene to check scoring or movement rules.
- Use controlled inputs and fixed seeds to make failures reproducible. Assert valid movement, reachable unique pellets, or another gameplay invariant. Comparing two runs alone cannot establish correctness, and changing a seed need not produce a different result in every scenario.
- Do not copy production traversal, filtering, or selection algorithms into fixtures to generate expected answers. Use hand-authored expected tile sets for small maps and a few independent invariants for real maps.
- Keep integration checks for entity/camera interpolation, teleport and respawn snaps, pause/resume, collectible removal, startup cancellation, and GPU disposal. Stub browser/WebGL boundaries while using real scene and gameplay objects where those interactions matter.
- Geometry checks should protect clearance, transformed footprints, open holes/portals/pen exits, and connected outlines. Avoid locking down incidental vertex counts, exact decorative colors, or implementation-specific object IDs. A structural assertion is useful when it protects a stated contract, such as shared resource ownership.
- Consolidate duplicate assertions across layers. Keep distinct regressions even if that means more tests; test count and coverage percentage are not the goal.

Run the relevant test first, then `pnpm test:all` before handing off code changes unless the user has deferred those checks. Report exactly which checks ran and which remain unverified.

## Visual checks and debugging

The Node suite does not verify actual browser appearance, WebGL output, or touch experience. Browser inspection and dev servers require an explicit user request. When authorized, check movement, outline shimmer, pause/resume, resizing, and mobile swipes. If inspection is deferred, record the visual limitation rather than adding tests that merely pin material settings.

- `Alt+C` (`Option+C` on macOS) toggles the collision overlay and FPS/frame-time panel.
- `Shift+C` copies the collision debug panel text.
- `H` toggles the scared state of active ghosts for debugging.

After editing the demo Tiled map, run `pnpm map:demo:convert` and `pnpm test` to check the generated map and its gameplay rules.
