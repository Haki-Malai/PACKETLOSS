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
1. `src/main.ts` creates a game instance through `createPacketGame`.
2. `createPacketGame` builds a `GameRuntime` with `GameCompositionRoot`.
3. `GameCompositionRoot` wires map/adapters/domain services/systems.
4. `GameRuntime` drives ordered updates and rendering via fixed-step loop.

## Directory Layout
```text
src/game/
  app/
    createPacketGame.ts
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
    adapters/
    three/
  shared/
    random/
    events/
```

## Layer Responsibilities

### `app`
Composition and lifecycle orchestration.
- `createPacketGame.ts`: public API factory (`start`, `pause`, `resume`, `destroy`).
- `GameRuntime.ts`: fixed-step runtime loop and system execution. Concurrent `start()` calls share initialization; destruction cancels pending startup before it can mount a scene or reset shared game state. Composition checks cancellation after map loading, mounts only after scene construction, and removes only its owned canvas. A failed system startup releases the partial composition and listeners before allowing a retry.
- `GameCompositionRoot.ts`: composition root; builds world + systems + adapters.
- `contracts.ts`: runtime and system interfaces.

### `domain`
Gameplay model and pure logic.
- `entities`: `PacketEntity`, `GhostEntity`.
- `valueObjects`: `Direction`, `TilePosition`, `MovementProgress`.
- `world`: `WorldState`, `CollisionGrid`, map/world data types.
- `services`: movement rules, ghost decisions, ghost jail behavior, portal behavior.
- `GhostJailLayout` holds map-based jail and spawn inference; `GhostJailService` keeps its existing public operations.
- Packet/ghost contact uses renderer-independent circular bodies derived from entity dimensions. The 3D meshes do not change gameplay collision coordinates or rules.

### `systems`
Frame-by-frame behavior execution.
- `InputSystem`
- `PacketMovementSystem`
- `GhostReleaseSystem`
- `GhostMovementSystem`
- `GhostPacketCollisionSystem`
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
- adapters for renderer/input/timer/hud
- `ThreeRendererAdapter` owns the WebGL renderer and viewport sizing. It renders directly to the antialiased canvas with sRGB output and tone mapping, without bloom or intermediate postprocessing targets, and disposes the renderer on destruction.
- `RenderSystem` owns a Three.js scene with `MazeScene`, procedural `ArcadeAssets`, and `CollisionDebugScene`, and disposes their GPU resources when destroyed. It reads the injected `CollectibleSystem`; only the update pipeline advances collection and effect timers.
- `MazeGeometry` builds wall and jail footprints from code-native tile templates, applies the map's rotation and flip transforms, then traces and extrudes continuous contours. The templates preserve the former authored silhouettes without runtime image assets. `MazeScene` batches the outline strips into static instanced meshes and supplies the floor, jail, and extruded vector lettering separately.
- `buildMazePenFootprint` selects jail tiles (local ID 16) and preserves the outer and center rails with two rectangular openings. Wall outline generation uses that footprint to omit touching edge segments, while jail outline generation skips exterior contours. `PacketSignGeometry` uses the shared wall height and square profile. Maze walls, the jail, and lettering use the same material and outline machinery with separate colors.
- Character meshes and instanced pellets share reusable geometry and materials. Pellet transforms refresh only when the collectible count changes, avoiding per-frame array copies. Collision markings render in the 3D scene; `DebugOverlaySystem` owns the HTML debug panels.

### `shared`
Cross-cutting utilities.
- `RandomSource` and `SeededRandom` for deterministic behavior
- generic event bus used by state/UI integration
- `blinkCadence` shares the next-toggle calculation for death recovery and scared-ghost warnings; systems retain their own state transitions.

## Dependency Direction
Allowed direction:
1. `app` -> `systems`, `domain`, `infrastructure`, `shared`, `engine`
2. `systems` -> `domain`, `shared`, and infrastructure adapters/3D presentation
3. `domain` -> `shared`
4. `infrastructure` -> `domain`, `shared`, `engine`
5. no circular imports

Keep these boundaries intact when adding imports or moving code.

## Runtime Update and Render Order
Before each active fixed update, render systems capture presentation history before the scheduler and gameplay systems run. `EntityPresentation` reuses previous-position records; tile-object replacement marks portal and position-reset discontinuities.

Update order (fixed):
1. `InputSystem`
2. `PacketMovementSystem`
3. `GhostReleaseSystem`
4. `GhostMovementSystem`
5. `GhostPacketCollisionSystem`
6. `AnimationSystem`
7. `CameraSystem`
8. `CollectibleSystem`
9. `HudSystem`
10. `PauseOverlaySystem`
11. `DebugOverlaySystem`

Render order:
1. `RenderSystem` presents the camera and interpolated entity positions, then synchronizes collectibles, effects, and collision markings.
2. `ThreeRendererAdapter` renders the complete scene with depth testing.
3. `DebugOverlaySystem` refreshes HTML debug panels.
4. HUD and pause UI remain DOM-based.

## Camera Behavior Contract
- `CameraSystem.start()` configures bounds, zoom, follow target, and viewport, then calls a one-time snap so the first gameplay frame is centered on Packet instead of animating in from `(0, 0)`.
- After startup, camera movement remains lerp-based via `CAMERA.followLerp` and updates each frame in `CameraSystem.update()`.
- `Camera3D` wraps the existing `Camera2D` follow tracker and presents an orthographic camera with a fixed 20-degree forward tilt and 5-degree lean from the right, with north as its up reference. Projection correction cancels the side lean's ground-plane shear and horizontal compression, keeping maze rows and columns aligned with the screen at the original scale while height reveals wall sides. Bounds, zoom, and viewport changes rebuild this correction and the inverse projection used for ground-plane ray picking.
- Rendering interpolates the camera using the fixed-step loop's alpha, then rounds its displayed translation to physical pixels using the renderer's capped DPR, integer drawing-buffer dimensions, and tilt-adjusted ground scale. Follow simulation state remains continuous; exact boundary stops and small-world centering are preserved. Pointer picking uses this displayed camera transform.
- Moving meshes interpolate their previous/current positions using the same alpha. Portal, respawn, and jail position resets present the destination immediately without changing collision coordinates.
- Paused rendering uses current positions. After startup or resume, interpolation starts only after a fresh active fixed update so old movement is not replayed.
- The `Camera2D` tracker retains its per-axis bounds policy on both startup snap and regular updates: clamp on axes where the world is larger than the viewport, and center on axes where the viewport is larger than the world.
- Resize handling updates renderer size and camera viewport dimensions before subsequent follow updates.
- Regression coverage includes `src/__tests__/camera2d.test.ts`, `src/__tests__/camera3d.test.ts`, and `src/__tests__/cameraSystem.test.ts`.

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
- Presentation maps gameplay `(x, y)` to Three.js `(x, height, z)` with gameplay `y` becoming `z`; map parsing and movement remain two-dimensional.

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

## Validation
Required checks:
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test`

`pnpm run test:all` runs these checks followed by a production build. Follow explicit task limits when checks are deferred and report the missing evidence. See [Testing](TESTING.md) for focused commands and the policy on independent behavioral assertions and integration coverage.

Nested checkouts under `.codex/worktrees/` are excluded from lint and test discovery.

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
