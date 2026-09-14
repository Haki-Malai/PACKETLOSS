# PACKETLOSS

PACKETLOSS is a maze arcade game for the browser, built with TypeScript, Vite, and Three.js. Requires WebGL 2.

Recover data bits, avoid enemies, and use power cores to turn the chase around. The game includes enemy pen/release behavior, lives and respawn recovery, linked portals, a following camera, and desktop/mobile controls. Start from the title screen, clear the maze or retry after losing all lives, and keep scores in a device-local profile. Maps are made in Tiled.

## Documentation

- [Product overview](docs/PRODUCT.md) — gameplay, scoring, controls, maps, and current scope.
- [Architecture](docs/ARCHITECTURE.md) — runtime structure, system order, rendering, and module boundaries.
- [Coding guide](docs/CODING.md) — JSDoc conventions for non-JSX functions.
- [Testing](docs/TESTING.md) — local checks, focused tests, and debugging shortcuts.

## Controls

- Move: arrow keys or WASD; swipe on mobile.
- Pause: Space, Escape, the HUD pause button, or a click/tap on the game canvas. Resume through the pause menu or Space/Escape; clicking its backdrop does not resume.
- Navigate menus with Tab and Enter/Space; Escape returns from a submenu. Restarting or leaving an unfinished run requires confirmation.
- Leaving the window pauses an active game; returning resumes only a focus-caused pause with no explicit menu interaction.

Settings include menu motion and fullscreen where supported. Sound is a disabled placeholder for future support. Profile & records stores an optional nickname, top scores, and recent completed runs on this device; there are no accounts, online leaderboards, or saved unfinished runs.

## Development

```sh
pnpm install
pnpm dev
```

`pnpm build` creates the production bundle in `dist/`; `pnpm preview` serves that build locally. `pnpm test:all` runs typecheck, lint, tests, and the production build.

`pnpm dev` enables development tools. `pnpm build --mode development` includes those tools in an optimized build; the default production build excludes the asset gallery, debug panels, collision inspection, and debug shortcuts. React UI reads the shared environment context, while runtime code uses the same build-time flag. `VITE_GAME_ENV=DEMO` selects a maze independently of development tools.

To run the demo maze:

```sh
VITE_GAME_ENV=DEMO pnpm dev
```

After editing its Tiled map, run `pnpm map:demo:convert` to regenerate the demo JSON.

## Project layout

- `src/main.tsx` mounts the React title/menu shell; starting a run initializes the game.
- `src/engine/` contains the loop, camera, input, timers, and tweens.
- `src/game/` contains gameplay logic, runtime wiring, map loading, Three.js presentation, and UI integration.
- `public/assets/` contains fonts and maze data.
