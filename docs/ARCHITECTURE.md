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
1. `src/main.ts` selects the development-only `/dev/assets` gallery; otherwise it creates `GameShell`, which shows the title screen before initializing gameplay.
2. Starting a run calls `createPacketGame`, which builds a `GameRuntime` with `GameCompositionRoot`.
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
  ui/
    GameShell.ts
    gameUi.css
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
- `GameCompositionRoot.ts`: composition root; loads the map and required enemy models before resetting shared state or mounting the game, then builds world + systems + adapters. Cancellation and construction failures release loaded assets and any created adapters.
- `contracts.ts`: runtime and system interfaces.

### `ui`
`GameShell` owns title, loading/error, pause, result, settings, help, and profile/record screens outside the renderer-owned mount. It controls the public game lifecycle, consumes runtime state notifications, and destroys/recreates the runtime for a fresh run. Returning to the title cancels pending startup and destroys the current runtime. Generation guards ignore repeated actions and late callbacks from obsolete runs.

`MenuPanel` provides shared DOM element/button/panel constructors and header, body, actions, and footer slots. All menus use the same frame and spacing with standard (640-pixel maximum) and wide (1,040-pixel maximum) variants; help and profile share responsive `.packet-columns`. The shared header owns the labelled top-right Back control for submenus, while the shell owns parent navigation and focus restoration. `GameShell` mounts ambient decoration once beside a dedicated scrollable `.packet-menu-viewport`; screen changes replace only the panel. This keeps background CSS animation continuous across menu navigation without recreating decorative nodes or gameplay timers. Shell disposal removes both, and reduced-motion rules still apply to the persistent background.

The title lazily imports `TitleWordmark`, a small independent Three.js view of the actual map lettering. It reuses `MazeScene`, scene lighting, and `Camera3D` without loading a map, enemy models, or gameplay systems. It renders only on mounting, resizing, and occasional single-letter flicker transitions. Title-owned vertex and outline-instance colors dim one authored glyph without changing the map asset. Leaving the title cancels its timer and disposes its renderer, scene resources, and listeners; stale imports cannot mount into a replacement menu. The accessible text heading remains as a fallback on load failure or context loss.

`MenuMotion.observeMenuMotion` supplies the same motion-preference and document-visibility policy to the title wordmark and enemy portraits. Reduced motion and hidden tabs stop their scheduling; returning starts from a steady state without catching up hidden time. `MenuPanel` owns the decorative edge sweep and corner pixels for all screens, animated by shared CSS keyframes and a single panel-accent token alongside the existing frame effects.

Help lazily imports `EnemyPortraits`, independently of gameplay. It loads the current `ArcadeAssets` models and samples their authored idle clips with shared scene lighting and `Camera3D`. One detached transparent WebGL renderer renders each portrait and immediately copies it into one of five 2D canvases displayed at 80 CSS pixels, at no more than 30 frames per second. Static PNG portraits remain until the previews are ready and serve as failure fallbacks. Mounting returns a disposer synchronously while asset loading uses an `AbortSignal`; navigation cancels loading, rejects stale imports, and releases animation frames, listeners, and GPU resources. Menu motion preferences control animation, and hidden tabs stop both frame scheduling and preview time.

The shell contains/restores menu focus, handles submenu navigation and abandon/clear confirmations, and keeps gameplay input inactive while menus own control. The runtime clears held keys and gestures at transitions. Explicit menu interaction clears the intent to resume automatically after focus returns; only an untouched focus-caused pause resumes that way. Terminal results cannot resume.

A small versioned local-storage adapter owns the optional nickname, menu motion preference, and top 10/recent 10 completed runs per map. Records contain a stable run ID, completion date, map, nickname snapshot, and result; duplicate result delivery cannot save a run twice. Scores sort descending with most recent completion breaking ties. Invalid or unavailable storage uses defaults/in-memory state and reports save status. The shell renders nicknames as text and reflects browser fullscreen state without persisting it. `gameUi.css` holds shared tokens and Tailwind-backed styles governed by the HTML contract in [Product](PRODUCT.md#canonical-html-visual-contract).

### `domain`
Gameplay model and pure logic.
- `entities`: `PacketEntity`, `EnemyEntity`.
- `valueObjects`: `Direction`, `TilePosition`, `MovementProgress`.
- `world`: `WorldState`, `CollisionGrid`, map/world data types.
- `services`: movement rules, enemy decisions, enemy jail behavior, portal behavior.
- Enemy archetypes are Firewall, Virus, Ping, Spam, and Lag. Entities carry their own base speed, copy role, and ability state. Five original enemies and three inactive Spam slots form a fixed collection, allowing rendering and collision-debug capacity to remain bounded.
- Navigation uses legal directional transitions from movement rules and the portal service. Ordinary steps cost one tile and outward teleports cost half a tile, with up/right/down/left tie-breaking. Firewall caches a right-hand patrol and rejoins it; Virus follows the current player tile; Ping follows a copied last-detected target.
- `EnemyJailLayout` holds map-based jail and spawn inference; `EnemyJailService` keeps its existing public operations. Defeated enemies use the navigation service’s return mode: Dijkstra searches physical tile transitions without portal edges, with explicit jail ingress and home-row movement matching the authored release bounds. Off-center captures compare travel through either adjacent tile center before choosing the shortest route.
- Packet/enemy contact uses renderer-independent circular bodies derived from entity dimensions. The 3D meshes do not change gameplay collision coordinates or rules.

### `systems`
Frame-by-frame behavior execution.
- `InputSystem`
- `EnemyAbilitySystem`
- `PacketMovementSystem`
- `EnemyReleaseSystem`
- `EnemyMovementSystem`
- `EnemyPacketCollisionSystem`
- `AnimationSystem`
- `CameraSystem`
- `CollectibleSystem`
- `HudSystem`
- `DebugOverlaySystem`
- `RenderSystem`

`EnemyPacketCollisionSystem` owns the 900 ms death phase through `PacketEntity.deathAnimationRemainingMs`. Dangerous contact removes one life and leaves the Packet at the contact position; further contacts are ignored until the timer expires. With lives remaining, it returns the Packet to `packetSpawnTile`, resets its direction and portal blink state, and starts the existing recovery protection. At zero lives, it finalizes loss with the Packet hidden instead of respawning. `PacketMovementSystem` suppresses movement during death, while `CollectibleSystem` suppresses consumption but continues existing effects. Enemies and other gameplay timers continue; pausing stops the fixed updates that advance death.

The last collected data pickup finalizes a clear only after its points are applied. Collision runs before collection, so dangerous contact blocks that tick's pickup. A world created without collectibles does not immediately clear. Terminal outcome is independent of pause state; completion freezes simulation and gameplay timers, publishes one result snapshot, and prevents pause/resume or focus events from reviving the run. Elapsed play time advances only with active simulation updates, including death/recovery and excluding pauses/loading.

`EnemyAbilitySystem` advances simulation-owned cooldowns, Ping/split effects, and Lag-zone lifetimes before packet movement. New copies enter an inactive pool slot only after a legal, non-overlapping adjacent spawn is found; they receive a full split cooldown. Eating an enemy sets `state.dead`, clears its scared/ability state, and preserves its contact position. `EnemyMovementSystem` advances `eatenElapsedMs` through the shared 420 ms collapse before physically moving it home. Dead enemies are excluded from release movement, queued release callbacks, power windows, collisions, and abilities. Arrival alone restores originals to the normal release cycle or retires a Spam copy into its reusable pool slot. Power cores clear Lag zones and suppress abilities while scared. All movement, release, collision, animation, and debug paths ignore inactive slots.

Movement code resolves per-archetype speed and the non-stacking Lag slowdown. Animation does not restore a global enemy speed. Movement clamps at the next tile center and discards any excess budget for that tick, allowing fractional speed changes without skipping turns or centered collectibles. Scared speed is half the enemy's base speed.

### `infrastructure`
Browser/engine integration and data loading.
- map parser/repository (`TiledParser`, `TiledMapRepository`)
- `TiledMapTopology` handles portal inference and void-boundary guards after tile trimming.
- adapters for renderer/input/timer/hud
- `ThreeRendererAdapter` owns the WebGL renderer and viewport sizing. It renders directly to the antialiased canvas with sRGB output and tone mapping, without bloom or intermediate postprocessing targets, and disposes the renderer on destruction.
- `RenderSystem` owns a Three.js scene with `MazeScene`, injected `ArcadeAssets`, and `CollisionDebugScene`, and disposes their GPU resources when destroyed. It reads the injected `CollectibleSystem`; only the update pipeline advances collection and effect timers.
- `MazeGeometry` builds wall and jail footprints from code-native tile templates, applies the map's rotation and flip transforms, then traces and extrudes continuous contours. The templates preserve the former authored silhouettes without runtime image assets. `MazeScene` batches the outline strips into static instanced meshes and supplies the floor, jail, and extruded vector lettering separately.
- `buildMazePenFootprint` selects jail tiles (local ID 16) and preserves the outer and center rails with two rectangular openings. Wall outline generation uses that footprint to omit touching edge segments, while jail outline generation skips exterior contours. `PacketSignGeometry` uses the shared wall height and square profile. Maze walls, the jail, and lettering use the same material and outline machinery with separate colors.
- `ArcadeAssets.load(signal)` fetches and parses five self-contained GLBs in `public/assets/models/enemies/`. A failed or cancelled load releases successfully parsed models, including late parser results. Synchronous construction accepts the five parsed templates for scene tests. Enemy instances share geometry, own mutable material clones and animation mixers, and release all owned resources exactly once. Inactive Spam slots retain their owned instances for reuse.
- Data-bit instances share `point-star.json`, a bundled Three.js geometry exported from Blender with baked normals and linear vertex colors. `public/assets/models/point.glb` is the matching reusable model. Power cores instead share the solid `power-star.json` geometry and `public/assets/models/power-point.glb`, built reproducibly by `scripts/build-power-star.py`. The shallow eight-tip silver star lies in the XZ plane with a unit cardinal radius, so existing collectible sizes and placement apply directly. `ArcadeAssets` owns and disposes its geometry and materials. Collected stars retain their collectible kind, borrow the corresponding geometry, and own separate cyan-tinted materials. Power absorption starts from its sampled hover and rotation at collection time. `PickupPresentation` samples their shrink, rotation, and rise toward the Packet’s `pickup-target` anchor over 180 ms; the remaining 120 ms drives a corner-outline pulse. `CollectibleSystem` owns effect lifetimes, and both gameplay and the gallery sample the same timeline. Death and position resets suppress old intake effects; retiring effects disposes only their materials.
- Each archetype has its own GLB with one six-second `idle` clip and a stationary root. Materials named `identity-*` and `accent-*` color the trim and support scared warnings. The `shell-dark` body fill matches the Packet (`#030b11`) on Firewall, Ping, and Spam; Virus and Lag retain their original `#090e19` shells without added face panels. Virus uses a smaller body and thin spikes with pale tip facets; Lag uses its original slim rings without pale highlights. Authored dark panels and `shell-light` highlights where present, plus `eye-core` and `eye-socket`, retain their colors. Eye meshes express each default mood without separate brow meshes: Firewall, Virus, and Spam use angry wedges, Ping uses upright symmetric eyes, and Lag uses low, half-closed eyes with an asymmetric droop. All eye meshes share a `scared` morph target for wide, worried eyes. Each instance applies that expression from edible state independently of warning colors, preserving the scared face through normal-color flashes and retaining the idle clip's blinking. Spam copies scale the model to 80% while keeping contact shadows grounded; domain collision dimensions use the same scale. `scripts/build-enemies.py` is the reproducible Blender authoring source; original downloads and retired GLBs are preserved.
- `HologramPacket` samples a gold hunter variation from edible enemy state and a snapping intake from `PacketEntity.enemyEatRemainingMs`. `ArcadeAssets` collapses the existing enemy GLB inside an independent wrapper and reveals `ReturnEnemyPresentation`, a small bug with oversized eyes and animated feet. These wrappers preserve the root, copy scale, and contact shadow. Return-form geometry/materials belong to the assets lifetime. `EnemyEatPresentation` owns the short-lived pixel stream into the presented Packet anchor; expiry, death, position resets, and scene disposal clean up or suppress it. Gameplay and gallery use the same presentation APIs and 420 ms timeline. `StateTransition` samples short eased blends on the presentation clock for the hunter form, scared expression and tint, and jail restoration; interrupted blends continue from the current pose. The gallery supplies absolute blend weights for independent seeking. Retired Spam slots clear these blends before reuse.
- Ping waves and target markers, Spam split echoes, and Lag-zone outlines consume domain effect snapshots. Rendering may interpolate effect age but never advances cooldowns, spawns copies, or applies slowdown. Expired visuals release their owned resources, and all effects freeze with the game clock.
- `HologramPacket` builds the player from a shallow beveled block with closely matched near-black fixed colors for the top and sides, cyan corner outlines on the top and all four vertical faces, shaded eye sockets, solid depth rails, top-mounted eyes and face frame, restrained square pixel accents, ten surrounding floating glyphs, and three short speed marks. The body has an authored height of 3.8 units and a presentation scale of 1.15; gameplay collision dimensions remain unchanged. Four additional binary digits and four extra square pixel marks attach directly to the upper face. Surface digits stay readable and independently switch 0/1 values with soft flickering. The body also has a 1.2 scale on its world X axis. Scene lighting does not change the core colors. The eyes blink periodically and shift together toward actual movement, returning to center at rest. A camera-facing presentation group compensates for the gameplay root's heading; its body child cancels the camera rotation to stay aligned with the maze's world axes, without rotational rocking. Floating glyphs cluster about 20% closer to the center at the same authored size and remain readable in the camera plane with slight depth drift; time-seeded noise selects each digit's 0/1 value independently at staggered intervals. Projected ground movement orients the trail independently of the body. Additive quads provide local eye glow without a global bloom pass. Direct sampling of the shared presentation time drives body and eye motion, the trail, and independent digit fading. During death, simulation timing drives body stutters, horizontally displaced cyan and magenta scan slices and echoes, scrambled binary digits, and brief signal dropouts at the contact position. The body remains recognizable until it cuts out before respawn restores the normal pose. It owns and disposes its geometry, materials, and textures. Only model children animate, leaving entity roots and contact shadows grounded.
- `RenderSystem` also participates in fixed updates, advancing an animation clock only while active. It derives trail direction from captured player displacement, preserving immediate turns while interpolating trail intensity and fading it over 120 ms at rest. Tile-object replacement clears the trail on portals and respawns. It snapshots and interpolates the animation clock alongside entity presentation, then samples mixers and digit opacity at the same absolute time. Pause freezes animation and trail fading. Data-bit transforms refresh only when the collectible count changes, avoiding per-frame array copies. Remaining power-core positions are cached; only their instance transforms and bounds refresh from the shared presentation clock for rotation and hover. The gallery samples the same six-second animation directly for pause and arbitrary seeking. Collision markings render in the 3D scene; `DebugOverlaySystem` owns the HTML debug panels.

### `shared`
Cross-cutting utilities.
- `RandomSource` and `SeededRandom` for deterministic behavior
- generic event bus used by state/UI integration
- `blinkCadence` shares the next-toggle calculation for death recovery and scared-enemy warnings; systems retain their own state transitions.

## Development Asset Gallery

The development entry branch loads `/dev/assets` independently of the game composition. It does not construct `GameRuntime`, reset shared game state, or start gameplay systems. Production builds omit the gallery branch and navigation link.

The gallery owns one renderer for static catalog thumbnails and the selected asset's live inspector. Preview scenes reuse current `ArcadeAssets`, `HologramPacket`, maze geometry/materials, scene lighting, and effect presentation helpers. Each enemy has normal, scared, warning, and ability previews. Authored timelines and a finite Spam copy pool demonstrate abilities without starting gameplay systems or mutating shared state. Small authored map examples expose the ten wall footprints, connected walls, prison joins, and the complete wordmark without a live world simulation. The catalog excludes retired models and unimplemented collectible types.

A pure playback timeline supplies absolute preview time for play/pause, replay, seeking, and speed changes. State sampling handles directional motion, scared warnings, portal/recovery blinking, and the 900 ms death plus 1,200 ms recovery sequence without changing gameplay state. The inspector supports the game camera and an orbit camera. Gallery teardown releases its scenes, controls, renderer, listeners, and owned assets, and cancels pending loading work.

## Dependency Direction
Allowed direction:
1. `ui` -> public `app` API, local persistence, and shared infrastructure/engine presentation for the title wordmark and enemy portraits; gameplay systems do not depend on the menu shell
2. `app` -> `systems`, `domain`, `infrastructure`, `shared`, `engine`
3. `systems` -> `domain`, `shared`, and infrastructure adapters/3D presentation
4. `domain` -> `shared`
5. `infrastructure` -> `domain`, `shared`, `engine`
6. no circular imports

Keep these boundaries intact when adding imports or moving code.

## Runtime Update and Render Order
Before each active fixed update, render systems capture presentation history before the scheduler and gameplay systems run. `EntityPresentation` reuses previous-position records; tile-object replacement marks portal and position-reset discontinuities.

Update order (fixed):
1. `InputSystem`
2. `EnemyAbilitySystem`
3. `PacketMovementSystem`
4. `EnemyReleaseSystem`
5. `EnemyMovementSystem`
6. `EnemyPacketCollisionSystem`
7. `AnimationSystem`
8. `RenderSystem` character animation clock
9. `CameraSystem`
10. `CollectibleSystem`
11. `HudSystem`
12. `DebugOverlaySystem`

Render order:
1. `RenderSystem` presents the camera and interpolated entity positions, then synchronizes collectibles, effects, and collision markings.
2. `ThreeRendererAdapter` renders the complete scene with depth testing.
3. `DebugOverlaySystem` refreshes HTML debug panels.
4. The HUD and application menu shell remain DOM-based; no pause overlay system runs inside the simulation.

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

Runtime options accept `onStateChange(state: RuntimeState)`. `RuntimeState` carries `paused` and an optional `RunResult`; the result contains outcome (`lost` or `cleared`), score, remaining lives, elapsed time, collected data, and total data. The mutable run outcome is `lost | cleared | null`, separate from pause state. Result notifications provide the shell with a completed snapshot rather than exposing mutable world state.

The previous `startGameApp`/`stopGameApp` API was intentionally removed.

### Tutorial practice

The optional `tutorialLesson` launch option selects a guided lesson. `RuntimeState` additionally carries an optional immutable tutorial snapshot with its lesson and phase (`introduction`, `playing`, `explanation`, `success`, or `retry`); the public `PacketGame` lifecycle methods are unchanged. The shell creates a fresh runtime for each lesson or retry, retains the current lesson on a loading failure, and uses its normal startup-generation guards on cancellation. Explanatory substeps resume the same frozen runtime. Tutorial sessions bypass ordinary results and record persistence.

Tutorial composition always loads the existing demo map without editing its assets. Fixed seeds, explicit spawns, active enemy selection, and explicit collectible lists—including empty lists—are applied before constructing the renderer. Practice omits automatic jail releases, disables the debug power shortcut, and uses normal movement speeds and ability timings. A renderer-independent tutorial controller runs after simulation updates to recognize real movement, collection, teleports, scans, splits, and slowdown. Dangerous contact takes precedence over success; required-effect expiry offers retry. Runtime and shell both gate resume at terminal checkpoints.

`RenderSystem` optionally receives a callback returning the current target tile. Only tutorial scenes allocate `TutorialMarker`, a static cyan floor bracket with its own geometry and material. Rendering synchronizes the target even while simulation is paused and disposes marker resources with the scene. `CameraSystem` fits the complete demo maze with a margin for practice, including after resize; normal gameplay keeps its following camera. The shell's active objective is outside its hidden menu layer and does not intercept gameplay gestures; explanation and checkpoint panels reuse `MenuPanel`, focus handling, and shared visual tokens.

## State and Data Flow
- `TiledMapRepository` loads and parses maze JSON into `WorldMapData`.
- `CollisionGrid` exposes safe tile/collision reads.
- `WorldState` stores runtime mutable state (entities, debug flags, tick, jail state, animation state, and run outcome); `GameRuntime` tracks active run duration and the terminal result snapshot.
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
- The former enemy simulation module under `src/game/runtime/`
- `src/game/ui/HudOverlay.ts`

Equivalent behavior now exists in domain services/systems/infrastructure adapters.

## Troubleshooting
If you see a blank page after changes:
1. run `pnpm run typecheck`
2. run `pnpm run build`
3. check browser console for module import errors
4. ensure type-only symbols are imported/exported with `import type` / `export type`
