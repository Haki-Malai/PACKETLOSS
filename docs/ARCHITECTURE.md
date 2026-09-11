# Architecture

## Purpose
This document explains the post-migration architecture of the game runtime and the reasoning behind the current module boundaries.

The project moved from a single large runtime file to a layered OOP structure focused on:
- behavior parity and deterministic gameplay
- strict dependency direction
- easier feature extension (especially gameplay mechanics like portals)
- testability of domain logic independent of browser rendering

## High-Level Summary
The runtime is now composed from small, explicit systems operating on a shared `WorldState`.

Entrypoint flow:
1. `src/main.ts` creates a game instance through `createPacmanGame`.
2. `createPacmanGame` builds a `GameRuntime` with `GameCompositionRoot`.
3. `GameCompositionRoot` wires map/assets/adapters/domain services/systems.
4. `GameRuntime` drives ordered updates and rendering via fixed-step loop.

## Directory Layout
```text
src/game/
  app/
    createPacmanGame.ts
    GameRuntime.ts
    GameCompositionRoot.ts
    contracts.ts
  domain/
    entities/
    valueObjects/
    world/
    services/
  systems/
  infrastructure/
    map/
    assets/
    adapters/
  shared/
    random/
    events/
```

## Layer Responsibilities

### `app`
Composition and lifecycle orchestration.
- `createPacmanGame.ts`: public API factory (`start`, `pause`, `resume`, `destroy`).
- `GameRuntime.ts`: fixed-step runtime loop and system execution.
- `GameCompositionRoot.ts`: composition root; builds world + systems + adapters.
- `contracts.ts`: runtime and system interfaces.

### `domain`
Gameplay model and pure logic.
- `entities`: `PacmanEntity`, `GhostEntity`.
- `valueObjects`: `Direction`, `TilePosition`, `MovementProgress`.
- `world`: `WorldState`, `CollisionGrid`, map/world data types.
- `services`: movement rules, ghost decisions, ghost jail behavior, portal behavior.
- `GhostJailLayout` holds map-based jail and spawn inference; `GhostJailService` keeps its existing public operations.
- Pixel-mask collision checks prepare transforms once per sample and reuse Pac-Man's preparation within one collision search.

### `systems`
Frame-by-frame behavior execution.
- `InputSystem`
- `PacmanMovementSystem`
- `GhostReleaseSystem`
- `GhostMovementSystem`
- `GhostPacmanCollisionSystem`
- `AnimationSystem`
- `CameraSystem`
- `CollectibleSystem`
- `HudSystem`
- `PauseOverlaySystem`
- `DebugOverlaySystem`
- `RenderSystem`

### `infrastructure`
Browser/engine integration and data loading.
- map parser/repository (`TiledParser`, `TiledMapRepository`)
- `TiledMapTopology` handles portal inference and void-boundary guards after tile trimming.
- assets (`AssetCatalog`)
- adapters for renderer/input/timer/hud
- `DeviceTileCache` owns device tile images and pixel normalization, with one cache per `RenderSystem`.
- `MapLayerRenderer` visits only viewport-intersecting tiles and batches canvas state per layer. Its tile cache reuses the last image for unchanged tile attributes and scale.

### `shared`
Cross-cutting utilities.
- `RandomSource` and `SeededRandom` for deterministic behavior
- generic event bus used by state/UI integration
- `blinkCadence` shares the next-toggle calculation for death recovery and scared-ghost warnings; systems retain their own state transitions.

## Dependency Direction (Enforced)
Allowed direction:
1. `app` -> `systems`, `domain`, `infrastructure`, `shared`, `engine`
2. `systems` -> `domain`, `shared`, and infrastructure adapters/assets
3. `domain` -> `shared`
4. `infrastructure` -> `domain`, `shared`, `engine`
5. no circular imports

Automated in `scripts/arch-check.mjs`.

## Runtime Update and Render Order
Before each active fixed update, render systems capture presentation history before the scheduler and gameplay systems run. `EntityPresentation` reuses previous-position records; tile-object replacement marks portal and position-reset discontinuities.

Update order (fixed):
1. `InputSystem`
2. `PacmanMovementSystem`
3. `GhostReleaseSystem`
4. `GhostMovementSystem`
5. `GhostPacmanCollisionSystem`
6. `AnimationSystem`
7. `CameraSystem`
8. `CollectibleSystem`
9. `HudSystem`
10. `PauseOverlaySystem`
11. `DebugOverlaySystem`

Render order:
1. `RenderSystem` map
2. `RenderSystem` entities
3. `DebugOverlaySystem` overlay
4. HUD is DOM-based (managed by `HudSystem`/adapter)

## Camera Behavior Contract
- `CameraSystem.start()` configures bounds, zoom, follow target, and viewport, then calls a one-time snap so the first gameplay frame is centered on Pac-Man instead of animating in from `(0, 0)`.
- After startup, camera movement remains lerp-based via `CAMERA.followLerp` and updates each frame in `CameraSystem.update()`.
- Rendering uses the fixed-step loop's alpha to present map and entity layers at the same interpolated camera position without mutating camera simulation state.
- Moving sprites interpolate their previous/current positions using the same alpha. Portal, respawn, and jail position resets present the destination immediately without changing collision coordinates.
- `RenderSystem` computes device metrics once per render and shares them across map, collectible, and effect layers.
- Entity batches use the same snapped scale and origin as map layers, including fractional device pixel ratios.
- Paused rendering uses current positions. After startup or resume, interpolation starts only after a fresh active fixed update so old movement is not replayed.
- `Camera2D` applies per-axis bounds policy on both startup snap and regular updates: clamp on axes where the world is larger than the viewport, and center on axes where the viewport is larger than the world.
- Resize handling updates renderer size and camera viewport dimensions before subsequent follow updates.
- Regression coverage lives in `src/__tests__/camera2d.test.ts`, `src/__tests__/cameraPresentation.test.ts`, and `src/__tests__/cameraSystem.test.ts`.

## Core Runtime Contracts
Public runtime contract:
- `start(): Promise<void>`
- `pause(): void`
- `resume(): void`
- `destroy(): void`

The previous `startGameApp`/`stopGameApp` API was intentionally removed.

## State and Data Flow
- `TiledMapRepository` loads and parses maze JSON into `WorldMapData`.
- `CollisionGrid` exposes safe tile/collision reads.
- `WorldState` stores runtime mutable state (entities, debug flags, tick, jail state, animation state).
- Systems mutate `WorldState` in order; render systems consume the latest state.

## Determinism and Randomness
All game randomness is routed through `RandomSource`.
- production can use `Math.random`
- tests use `SeededRandom` for deterministic simulations

## Portals
Portal behavior is encapsulated in `PortalService`:
- requires explicit direction and outward endpoint direction match
- allows outward bootstrap movement from centered portal endpoints via systems
- teleports when outward movement offset reaches at least half a tile (`>= tileSize / 2`)
- prevents same-tick bounce via per-entity tick guard
- blocks teleport if destination portal tile is fully blocking

Covered by `src/__tests__/portalService.test.ts`.

## Quality Gates
Required checks:
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run arch:check`
- `pnpm run size:check`

Additional constraints:
- no cycles, no layer boundary violations (`arch-check`)
- TypeScript file line caps (default 350; parser override 450) (`size-check`)
- Nested checkouts under `.codex/worktrees/` are excluded from lint and test discovery.

## Migration Notes
Legacy files removed:
- `src/game/startGameApp.ts`
- `src/types.ts`
- `src/movement.ts`
- `src/game/map/tiled.ts`
- `src/game/runtime/ghostSimulation.ts`
- `src/game/ui/HudOverlay.ts`

Equivalent behavior now exists in domain services/systems/infrastructure adapters.

## Troubleshooting
If you see a blank page after changes:
1. run `pnpm run typecheck`
2. run `pnpm run build`
3. check browser console for module import errors
4. ensure type-only symbols are imported/exported with `import type` / `export type`
