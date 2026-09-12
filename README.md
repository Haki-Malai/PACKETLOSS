# Pacman

A Pac-Man game for the browser, built for fun with TypeScript, Vite, and Three.js. Requires WebGL 2.

Collect pellets, avoid ghosts, and use power pellets to turn the chase around. The game includes ghost pen/release behavior, lives and respawn recovery, linked portals, a following camera, and desktop/mobile controls. Maps are made in Tiled.

## Documentation

- [Product overview](docs/PRODUCT.md) — gameplay, scoring, controls, maps, and current scope.
- [Architecture](docs/ARCHITECTURE.md) — runtime structure, system order, rendering, and module boundaries.
- [Testing](docs/TESTING.md) — local checks, focused tests, and debugging shortcuts.

## Controls

- Move: arrow keys or WASD; swipe on mobile.
- Pause/resume: Space, click, or tap. Leaving the window pauses an active game; returning resumes it unless it was manually paused.

## Development

```sh
pnpm install
pnpm dev
```

`pnpm build` creates the production bundle in `dist/`; `pnpm preview` serves that build locally. `pnpm test:all` runs typecheck, lint, tests, and the production build.

To run the demo maze:

```sh
VITE_GAME_ENV=DEMO pnpm dev
```

After editing its Tiled map, run `pnpm map:demo:convert` to regenerate the demo JSON.

## Project layout

- `src/main.ts` starts the game.
- `src/engine/` contains the loop, camera, input, timers, and tweens.
- `src/game/` contains gameplay logic, runtime wiring, map loading, Three.js presentation, and UI integration.
- `public/assets/` contains sprites, fonts, and maze data.
