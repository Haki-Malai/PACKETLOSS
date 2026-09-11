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

Keep tests focused on observable behavior. For a bug fix, add a small regression case to the relevant test file. Reuse existing fixtures when useful and use fixed seeds or controlled inputs for deterministic results. Run the relevant test first, then `pnpm test:all` before handing off code changes.

## Visual checks and debugging

The automated suite does not verify the actual browser appearance or touch experience. When changing rendering or controls, also check movement, pause/resume, resizing, and mobile swipes in the browser.

- `Alt+C` (`Option+C` on macOS) toggles the collision overlay and FPS/frame-time panel.
- `Shift+C` copies the collision debug panel text.
- `H` toggles the scared state of active ghosts for debugging.

After editing the demo Tiled map, run `pnpm map:demo:convert` and `pnpm test` to check the generated map and its gameplay rules.
