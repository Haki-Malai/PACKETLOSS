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
1. `src/main.tsx` mounts one React root inside `EnvironmentProvider`. `App` selects the development-only `/dev/assets` gallery relative to the configured base URL; otherwise it preloads both maps, shared character assets, and menu/runtime modules before rendering `GameShell` and its title screen.
2. Starting a run calls `createPacketGame`, which builds a `GameRuntime` with `GameCompositionRoot`.
3. `GameCompositionRoot` wires an authored Classic map or a generated Endless stream with adapters, domain services, and systems.
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
    GameShell.tsx
    useGameSession.ts
    MenuPanel.tsx
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
- `createPacketGame.ts`: public API factory (`start`, `pause`, `resume`, `continueLevel`, `destroy`).
- `GameRuntime.ts`: fixed-step runtime loop and system execution. Concurrent `start()` calls share initialization; destruction cancels pending startup before it can mount a scene or reset shared game state. Composition checks cancellation after map loading, mounts only after scene construction, and removes only its owned canvas. A failed system startup releases the partial composition and listeners before allowing a retry.
- `GameCompositionRoot.ts`: composition root; consumes first-visit prepared enemy models and, for Classic, the authored map when available. It builds an `EndlessMazeStream` instead of loading a map for Endless. Cancellation and construction failures release loaded assets and any created adapters.
- `contracts.ts`: runtime and system interfaces.

### `ui`
`GameShell` and its `useGameSession` hook own title, loading/error, pause, level-clear checkpoint, terminal result, settings, help, and profile/record screens outside the renderer-owned mount. The hook controls the public game lifecycle, consumes runtime state notifications, continues the same runtime after a clear, and destroys/recreates the runtime for a fresh run. Returning to the title cancels pending startup and destroys the current runtime. Generation guards ignore repeated actions and late callbacks from obsolete runs.

`MenuPanel` and `MenuButton` provide shared React components and header, body, actions, and footer slots. Enter on a panel activates its enabled primary action, while focused interactive controls keep native keyboard behavior. All menus use the same frame and spacing with compact (480-pixel maximum, used by the mode submenu), standard (640-pixel maximum), and wide (1,040-pixel maximum) variants; help and profile share the responsive `MenuColumns` component. Shared text headers are left-aligned and own the labelled Back control in the same row; custom wordmark headings remain centered in a balanced row. The shell owns parent navigation, returning submenu focus to the parent panel so no action gains a return-time outline; confirmation cancellation still restores its initiating action. `GameShell` mounts ambient decoration once beside a dedicated scrollable `.packet-menu-viewport`; screen changes replace only the panel. This keeps background CSS animation continuous across menu navigation without recreating decorative nodes or gameplay timers. Shell disposal removes both, and reduced-motion rules still apply to the persistent background.

The initial bootstrap primes `TitleWordmark` and the enemy-portrait module before revealing the menu. `TitleWordmark` is a small independent Three.js view of the actual map lettering, reused as the accessible heading on both the title and mode screens. It reuses `MazeScene`, scene lighting, and `Camera3D` without loading another map, enemy models, or gameplay systems. It renders only on mounting, resizing, and occasional single-letter flicker transitions. Title-owned vertex and outline-instance colors dim one authored glyph without changing the map asset. Leaving either wordmark screen cancels its timer and disposes its renderer, scene resources, and listeners. The text wordmark remains as a fallback on load failure or context loss.

`MenuMotion.observeMenuMotion` supplies the same motion-preference and document-visibility policy to the title wordmark and enemy portraits. Reduced motion and hidden tabs stop their scheduling; returning starts from a steady state without catching up hidden time. `MenuPanel` owns the decorative edge sweep and corner pixels for all screens, animated by shared CSS keyframes and a single panel-accent token alongside the existing frame effects.

Help lazily imports `EnemyPortraits`, independently of gameplay. It loads the current `ArcadeAssets` models and samples their authored idle clips with shared scene lighting and `Camera3D`. One detached transparent WebGL renderer draws all seven models into a horizontal atlas once per frame, then copies each region into its own 80-pixel 2D canvas, at no more than 30 frames per second. Static PNG portraits remain until the previews are ready and serve as failure fallbacks. Mounting returns a disposer synchronously while asset loading uses an `AbortSignal`; navigation cancels loading, rejects stale imports, and releases animation frames, listeners, and GPU resources. Menu motion preferences control animation, and hidden tabs stop both frame scheduling and preview time.

The shell contains/restores menu focus, handles submenu navigation and abandon/clear confirmations, and keeps gameplay input inactive while menus own control. The runtime clears held keys and gestures at transitions. Explicit menu interaction clears the intent to resume automatically after focus returns; only an untouched focus-caused pause resumes that way. Terminal results cannot resume, while a level-clear checkpoint resumes only through `continueLevel()`.

A small versioned local-storage adapter owns the optional nickname, menu motion preference, and top 10/recent 10 terminal-loss runs per authored map and mode. Version-two records contain a stable run ID, completion date, map, mode, nickname snapshot, levels cleared, and result; records without mode migrate as Classic, and version-one records keep their historical clear results. Duplicate result delivery cannot save a run twice. Scores sort descending with most recent completion breaking ties. Endless records use a separate Profile selector and the default map key regardless of authored map selection. Invalid or unavailable storage uses defaults/in-memory state and reports save status. The shell renders nicknames as text and reflects browser fullscreen state without persisting it. `tailwind.css` imports Tailwind 4 through PostCSS, maps the shared tokens into theme utilities, and limits source scanning to application files and the HTML entrypoint. `gameUi.css` retains shared tokens, safe-area rules, and complex decorative/motion styles; component layouts and controls use Tailwind JSX utilities governed by the HTML contract in [Product](PRODUCT.md#canonical-html-visual-contract).

The HUD is a React sibling of the dedicated `packet-scene` canvas mount. It subscribes to score/lives events using `useSyncExternalStore` with primitive snapshots. The former HUD adapter/system is removed from runtime composition. An inert wrapper around the canvas and HUD prevents interaction while a menu owns control. In development, `DebugOverlaySystem` computes pointer/tile diagnostics and frame timings and publishes readonly `DebugSnapshot` values through optional `onDebugChange` composition options. A session-owned store updates only the React debug subscriber; stale generations cannot publish into a newer run. Production sessions create no debug store or callback, and runtime composition excludes debug systems and collision inspection geometry.

React effects own preview loading, listeners, observers, and disposal. Lazy menu preview imports are shared across concurrent effect setups; each active setup still owns its own resources. The root runs in Strict Mode, and pagehide/HMR unmount it. Persisted pageshow reloads a previously disposed page. Startup render/import errors have a readable React fallback.

### `domain`
Gameplay model and pure logic.
- `entities`: `PacketEntity`, `EnemyEntity`.
- `valueObjects`: `Direction`, `TilePosition`, `MovementProgress`.
- `world`: `WorldState`, `CollisionGrid`, map/world data types, `EndlessMazeGenerator`, and `EndlessMazeStream`.
- `services`: movement rules, enemy decisions, enemy jail behavior, portal behavior.
- Enemy archetypes are Firewall, Virus, Ping, Spam, Lag, Quarantine, and Trojan. `ENEMY_KEYS` supplies their shared roster order. Entities carry their own base speed, copy role, and ability state. Seven original enemies and three inactive Spam slots form a fixed collection, allowing rendering and collision-debug capacity to remain bounded.
- Navigation uses legal directional transitions from movement rules and the portal service. Ordinary steps cost one tile and outward teleports cost half a tile, with up/right/down/left tie-breaking. For every release, Firewall randomly selects a reachable destination with a right-hand loop of at least 16 steps, travels to it, caches the loop, and rejoins it after scared movement; Virus follows the current player tile through physical corridors without portal edges or teleportation; Ping follows a copied last-detected target.
- `EnemyJailLayout` holds map-based jail and spawn inference; `EnemyJailService` keeps its existing public operations. Defeated enemies use the navigation service’s return mode: Dijkstra searches physical tile transitions without portal edges, with explicit jail ingress and home-row movement matching the authored release bounds. Off-center captures compare travel through either adjacent tile center before choosing the shortest route.
- Packet/enemy contact uses renderer-independent circular bodies derived from entity dimensions. The 3D meshes do not change gameplay collision coordinates or rules.

Endless generation uses 23 corridor columns and two non-traversable side rails inside each 25 × 24 section. The initial section zero reserves a wordmark on row 11 and its full portal corridor on row 12; composition starts the Packet at its center in rolling-map coordinates `(12,60)`. If section zero regenerates after eviction, that logo position is used only when it still satisfies spacing against resident neighbors. Other non-wordmark sections sometimes reserve another full row or a shorter long run, independently of topology retries. A requested five-tile wordmark is fixed at columns 10–14; its row and the complete horizontal corridor immediately below are reserved before topology retries. Matching nine-tile upper and lower wall spans frame that corridor at columns 8–16, with vertical openings at columns 7 and 17. The corridor ends in a paired portal at columns 1 and 23, with ID-23 visual tips interrupting the otherwise continuous ID-0 rails. The generator also protects a long Firewall loop, then biases wall removal toward parallel rails, offset ladders, nested bends, and rectangular loops. Connection changes keep the physical graph connected with at least two exits per corridor tile, including open section seams, and reject articulation points that would leave an area with only one physical way out. Vertical passages end within four consecutive tiles, including across section seams, and horizontal walls break within ten corridor columns. Staggered vertical cuts use a phase shared across sections, while separated seam crossings match in either generation direction. A local corner rule closes at least one passage around every 2 × 2 group without closing protected corridor edges; rare trapped candidates are retried with a deterministic seed. The five-section rolling map is 25 × 120 tiles and increments `topologyRevision` on a shift. It rebases resident portal pairs with the tiles; streaming replaces the live portal links before invalidating navigation, and hazard reachability refreshes against the new map. Evicted sections lose their geometry and pickup state, while retained section objects remain unchanged. `shared/endlessSettings.ts` contains its initial numeric defaults.

### `systems`
Frame-by-frame behavior execution.
- `InputSystem`
- `EnemyAbilitySystem`
- `MazeHazardSystem`
- `PacketMovementSystem`
- `EnemyReleaseSystem`
- `EnemyMovementSystem`
- `EnemyPacketCollisionSystem`
- `AnimationSystem`
- `CameraSystem`
- `CollectibleSystem`
- `EndlessBonusSystem`, `EndlessEncounterSystem`, and `EndlessStreamingSystem` (Endless only)
- `DebugOverlaySystem` (development only)
- `RenderSystem`

`EnemyPacketCollisionSystem` owns the 900 ms level-one death phase through `PacketEntity.deathAnimationRemainingMs`. Dangerous contact removes one life and leaves the Packet at the contact position; further contacts are ignored until the timer expires. With lives remaining, Classic returns the Packet to `packetSpawnTile`; Endless keeps its exact tile, direction, and corridor offset. Both start recovery protection and invoke a composition-owned enemy reset. `EnemyReleaseSystem` restores the Classic jail roster and release cycle; `EndlessEncounterSystem` removes visible enemies and hazards and restarts its five-second delay. At zero lives, loss freezes at the collision without an enemy reset. `PacketMovementSystem` suppresses movement during death, while `CollectibleSystem` suppresses consumption but continues existing effects. Enemies and other gameplay timers continue until respawn; pausing stops the fixed updates that advance death.

In Classic, the last collected data pickup publishes a nonterminal clear checkpoint only after its points are applied. Collision runs before collection, so dangerous contact blocks that tick's pickup. A world created without collectibles does not immediately clear. The checkpoint freezes simulation and gameplay timers and cannot be bypassed by pause/resume or focus events. `continueLevel()` refills the original point layout, resets Packet and enemy state, compounds the level multiplier by 1.25, and resumes the same runtime with score, lives, and wall-clock play time intact. Endless has no clear checkpoint or automatic score multiplier; `CollectibleSystem` counts only touched points so eviction never inflates recovered data. Only final loss publishes a persisted run result.

`WorldState.levelMultiplier` is the shared gameplay/scoring factor. The runtime counts unscaled active play time from real frame intervals, including time omitted by the fixed-step catch-up cap, then divides scaled simulation time at movement centers, portal thresholds, and other actor boundaries before advancing the scheduler and gameplay systems. Movement derives distance from each bounded duration, so the multiplier is applied once and fractional travel is preserved. Input runs before these slices; camera and diagnostics update once after them. Score sources round their base award multiplied by the current factor. UI/menu timing and render cadence are not scaled.

Endless adds a separate simulation-only speed factor of `sqrt(1 + score / 10_000)` at each fixed update. `ENDLESS_SETTINGS.speedStartMultiplier` and `speedScoreScale` tune the starting factor and score divisor. Every score point contributes without milestone rounding or a cap, with diminishing increases as score rises. The stream records the lowest and highest global sections entered by the Packet, so retained, revisited, and regenerated sections do not inflate progress. The encounter system reduces its next wave interval by 500 ms per explored section, with 2–4 second floors, and prefers physical offscreen entrances ahead of the Packet on 80% of waves. Pending forward entries reevaluate after a turn. Four camera edges are eligible; wide views can use top/bottom corridors on the forward half of the maze.

`ScoreBonusSystem` places all five icon kinds immediately at map-specific, packet-reachable tiles arranged as two mirrored pairs and one centerline tile, distant from the Packet spawn. The physical route within each pair fits within one boost window at base speed. They remain until collected or level clear; only the 15-second active boost uses scaled simulation time. Collecting another icon during an active boost multiplies the current bonus factor by that icon's factor and resets its timer. Death removes the active factor, while a clear checkpoint removes all bonus state. Bonus icons are excluded from the clear count and tutorial composition. Both award sources use one helper that rounds base × level × active bonus once. The HUD receives only changes to the available count or active combined factor and whole-second countdown.

`EnemyAbilitySystem` advances simulation-owned cooldowns, Ping/split effects, and Lag-zone lifetimes before packet movement. Lag skips new drops while both zone slots are occupied, preserving each zone's twenty-second lifetime. New Spam copies enter an inactive pool slot only after a legal, non-overlapping adjacent spawn is found; they receive a full split cooldown. Eating an enemy sets `state.dead`, clears its scared/ability state, and preserves its contact position. `EnemyMovementSystem` advances `eatenElapsedMs` through the shared 420 ms collapse before physically moving it home. Dead enemies are excluded from release movement, queued release callbacks, power windows, collisions, and abilities. Arrival alone restores originals to the normal release cycle or retires a Spam copy into its reusable pool slot. Power cores clear Lag zones and suppress abilities while scared. All movement, release, collision, animation, and debug paths ignore inactive slots.

Movement code resolves per-archetype speed and the non-stacking Lag slowdown. Animation does not restore a global enemy speed. Each simulation slice ends at the earliest relevant center or portal threshold; collision and collection then run before remaining scaled time continues. A defensive distance carry prevents direct system calls from losing excess travel. Scared speed is half the enemy's base speed.

`MazeHazardSystem` runs after the existing enemy abilities and before movement. It ages Quarantine wall records and publishes their canonical right/down tile connections to `CollisionGrid` as symmetric directional closures, leaving the authored map intact. Movement and shortest-path navigation read this overlay. Firewall selects its long patrol from the original grid and follows legal detours around temporary obstructions. Selection requires an open visual center and a cap overlapping permanent wall pixels, so independently expiring extensions remain attached. It reserves actor corridor segments, spawn, portals, signs, and jail access; disconnected routes are allowed until expiry. Power cores and jail resets clear collision and presentation records together.

`PacketMovementSystem` records physically occupied tiles after actual movement in `WorldState.visitedPacketTiles`. Trojan chooses a reachable tile from that history using the live collectible inventory, excluding the surrounding eight tiles of every real collectible. It stores the destination on the enemy; `EnemyDecisionService` routes it there through normal movement. `MazeHazardSystem` rechecks the tile on arrival, then starts the in-place disguise or retries if it is occupied. Its disguise expires after ten seconds if the Packet has not approached. Disguise and reveal timers stay on the existing enemy entity; movement and contact ignore it while disguised or within its reveal grace window. `TrojanDisguise` borrows the normal data-bit geometry/material from `ArcadeAssets`; no fake entry is added to the collectible system. `QuarantineWalls` owns a fixed pool of short source beams; `MazeScene` owns the joined body and purple outline. The Asset Lab samples these same visual helpers for reversible ability previews.

### `infrastructure`
Browser/engine integration and data loading.
- map parser/repository (`TiledParser`, `TiledMapRepository`)
- `TiledMapTopology` handles portal inference and void-boundary guards after tile trimming.
- adapters for renderer/input/timer
- `ThreeRendererAdapter` owns the WebGL renderer and viewport sizing. It renders directly to the antialiased canvas with sRGB output and tone mapping, without bloom or intermediate postprocessing targets, and disposes the renderer on destruction.
- `RenderSystem` owns a Three.js scene with `MazeScene`, injected `ArcadeAssets`, and `CollisionDebugScene`, and disposes their GPU resources when destroyed. It reads the injected `CollectibleSystem`; only the update pipeline advances collection and effect timers.
- Endless rendering uses `EndlessMazePresentation`: five `MazeScene` sections each include one neighboring row as contour context and clip to an owned 24-row slice. A shift repositions four retained scenes, rebuilds the incoming scene and its seam neighbor, and disposes the evicted resources immediately. The collision overlay, floor, pink outlines, and gold sign all derive from the same generated tile topology. `RenderSystem` also refreshes point instances on a content revision even when pickup count is unchanged, and keeps pickup animation phases steady across coordinate rebases.
- `MazeFootprint` holds the code-native tile templates and pure rotated/flipped rasterization shared by gameplay placement and rendering. `MazeGeometry` traces and extrudes continuous contours from the authored footprint unioned with temporary rails, then splits exposed outlines by authored versus temporary ownership. `MazeScene` replaces the joined mesh and instanced outline batches only when the active connection set changes, disposes old GPU resources immediately, and samples the purple pulse without rebuilding geometry. It supplies the floor, jail, and extruded vector lettering separately. See the [maze atlas](MAZES.md) for each map and tile.
- `buildMazePenFootprint` selects jail tiles (local ID 16) and preserves the outer and center rails with two rectangular openings. Wall outline generation uses that footprint to omit touching edge segments, while jail outline generation skips exterior contours. `PacketSignGeometry` uses the shared wall height and square profile. Maze walls, the jail, and lettering use the same material and outline machinery with separate colors.
- `ArcadeAssets.load(signal)` fetches and parses seven enemy GLBs and five score-multiplier GLBs. A failed or cancelled load releases successfully parsed models, including late parser results. Synchronous construction accepts the seven enemy templates for scene tests. Enemy instances share geometry, own mutable material clones and animation mixers, and release all owned resources exactly once. Multiplier pickup instances borrow their template geometry and materials, which the asset owner disposes at run teardown. Inactive Spam slots retain their owned instances for reuse.
- Data-bit instances share `point-star.json`, a bundled Three.js geometry exported from Blender with baked normals and linear vertex colors. `public/assets/models/point.glb` is the matching reusable model. Power cores instead share the solid `power-star.json` geometry and `public/assets/models/power-point.glb`, built reproducibly by `scripts/build-power-star.py`. The shallow eight-tip silver star lies in the XZ plane with a unit cardinal radius, so existing collectible sizes and placement apply directly. `ArcadeAssets` owns and disposes its geometry and materials. Collected stars retain their collectible kind, borrow the corresponding geometry, and own separate cyan-tinted materials. Power absorption starts from its sampled hover and rotation at collection time. `PickupPresentation` samples their shrink, rotation, and rise toward the Packet’s `pickup-target` anchor over 180 ms; the remaining 120 ms drives a corner-outline pulse. `CollectibleSystem` owns effect lifetimes, and both gameplay and the gallery sample the same timeline. Death and position resets suppress old intake effects; retiring effects disposes only their materials.
- Each archetype has its own GLB with one six-second `idle` clip and a stationary root. Materials named `identity-*` and `accent-*` color the trim and support scared warnings. The `shell-dark` body fill matches the Packet (`#030b11`) on Firewall, Ping, and Spam; Virus and Lag retain their original `#090e19` shells without added face panels. Virus uses a smaller body and thin spikes with pale tip facets; Lag uses its original slim rings without pale highlights. Authored dark panels and `shell-light` highlights where present, plus `eye-core` and `eye-socket`, retain their colors. Eye meshes express each default mood without separate brow meshes: Firewall, Virus, and Spam use angry wedges, Ping uses upright symmetric eyes, and Lag uses low, half-closed eyes with an asymmetric droop. All eye meshes share a `scared` morph target for wide, worried eyes. Each instance applies that expression from edible state independently of warning colors, preserving the scared face through normal-color flashes and retaining the idle clip's blinking. Spam copies scale the model to 80% while keeping contact shadows grounded; domain collision dimensions use the same scale. `scripts/build-enemies.py` is the reproducible Blender authoring source for the original five enemies; Quarantine and Trojan use their separately authored GLBs; original downloads and retired GLBs are preserved.
- `HologramPacket` samples a gold hunter variation from edible enemy state and a snapping intake from `PacketEntity.enemyEatRemainingMs`. `ArcadeAssets` collapses the existing enemy GLB inside an independent wrapper and reveals `ReturnEnemyPresentation`, a small bug with oversized eyes and animated feet. These wrappers preserve the root, copy scale, and contact shadow. Return-form geometry/materials belong to the assets lifetime. `EnemyEatPresentation` owns the short-lived pixel stream into the presented Packet anchor; expiry, death, position resets, and scene disposal clean up or suppress it. Gameplay and gallery use the same presentation APIs and 420 ms timeline. `StateTransition` samples short eased blends on the presentation clock for the hunter form, scared expression and tint, and jail restoration; interrupted blends continue from the current pose. The gallery supplies absolute blend weights for independent seeking. Retired Spam slots clear these blends before reuse.
- Ping waves and target markers, Spam split echoes, and Lag-zone outlines consume domain effect snapshots. Rendering may interpolate effect age but never advances cooldowns, spawns copies, or applies slowdown. Expired visuals release their owned resources, and all effects freeze with the game clock.
- `HologramPacket` builds the player from a shallow beveled block with closely matched near-black fixed colors for the top and sides, cyan corner outlines on the top and all four vertical faces, shaded eye sockets, solid depth rails, top-mounted eyes and face frame, restrained square pixel accents, ten surrounding floating glyphs, and three short speed marks. The body has an authored height of 3.8 units and a presentation scale of 1.15; gameplay collision dimensions remain unchanged. Four additional binary digits and four extra square pixel marks attach directly to the upper face. Surface digits stay readable and independently switch 0/1 values with soft flickering. The body also has a 1.2 scale on its world X axis. Scene lighting does not change the core colors. The eyes blink periodically and shift together toward actual movement, returning to center at rest. A camera-facing presentation group compensates for the gameplay root's heading; its body child cancels the camera rotation to stay aligned with the maze's world axes, without rotational rocking. Floating glyphs cluster about 20% closer to the center at the same authored size and remain readable in the camera plane with slight depth drift; time-seeded noise selects each digit's 0/1 value independently at staggered intervals. Projected ground movement orients the trail independently of the body. Additive quads provide local eye glow without a global bloom pass. Direct sampling of the shared presentation time drives body and eye motion, the trail, and independent digit fading. During death, simulation timing drives body stutters, horizontally displaced cyan and magenta scan slices and echoes, scrambled binary digits, and brief signal dropouts at the contact position. The body remains recognizable until it cuts out before respawn restores the normal pose. It owns and disposes its geometry, materials, and textures. Only model children animate, leaving entity roots and contact shadows grounded.
- `RenderSystem` also participates in fixed updates, advancing an animation clock only while active. It derives trail direction from captured player displacement, preserving immediate turns while interpolating trail intensity and fading it over 120 ms at rest. Tile-object replacement clears the trail on portals and Classic respawns. It snapshots and interpolates the animation clock alongside entity presentation, then samples mixers and digit opacity at the same absolute time. Pause freezes animation and trail fading. Multiplier models share the power-core rotation sampler. Data bits covered by available multipliers are omitted from the instance batch without removing domain collectibles. Data-bit transforms refresh when collectible content or available multipliers change. Remaining power-core positions are cached; only their instance transforms and bounds refresh from the shared presentation clock for rotation and hover. The gallery samples the same six-second animation directly for pause and arbitrary seeking. Collision markings render in the 3D scene; `DebugOverlaySystem` publishes data for React debug panels.

### `shared`
Cross-cutting utilities.
- `RandomSource` and `SeededRandom` for deterministic behavior
- generic event bus used by state/UI integration
- `blinkCadence` shares the next-toggle calculation for death recovery and scared-enemy warnings; systems retain their own state transitions.

## Application environment

`src/config/environment.ts` defines `IS_DEV` from Vite's development-server flag or the explicit `development` build mode. `EnvironmentProvider` exposes the same value as `useEnvironment().isDev` to React. Gameplay systems import the shared flag directly so they do not depend on React. `VITE_GAME_ENV` continues to select the normal-run maze and does not enable development features; tutorial practice remains available in production.

Development entrypoints retain an `IS_DEV` build-time guard as well as the UI context check. This lets the bundler remove the gallery, debug panels, diagnostic systems, collision inspection scene, and `DebugInput` shortcut/clipboard implementation from production. Hiding controls through React context alone would leave their code in the bundle. Pointer inspection state is collected only in development.

The AWS deployment workflow supports only `dev` and `prod`. CI maps the `dev` branch to a development build at `https://dev.packetloss.hakimalai.com/` and `main` to a production build at `https://packetloss.hakimalai.com/`. Both build at the domain root with `--base /`; there is no `/prod` publication path or redirect. CloudFront rewrites only the development gallery routes `/dev/assets` and `/dev/assets/` to the root entry point for direct navigation and reload. A development build still uses optimized React; Vite build mode is separate from `NODE_ENV` ([Vite environment guide](https://v4.vitejs.dev/guide/env-and-mode.html)).

## Development Asset Gallery

The development entry branch loads `/dev/assets` independently of the game composition. It does not construct `GameRuntime`, reset shared game state, or start gameplay systems. Production builds omit the gallery branch and navigation link.

React owns the gallery library, inspector, loading states, and controls. The inspector hook owns its preview session, resize observer, and animation loop; timeline updates do not rerender the library. Selection resets playback/transform controls, and unmount cancels loading and thumbnail preparation.

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
11. `ScoreBonusSystem` (Classic) or `EndlessBonusSystem` (Endless)
12. `EndlessEncounterSystem` (Endless)
13. `EndlessStreamingSystem` (Endless, after camera following, once per fixed update)
14. `DebugOverlaySystem` (development only)

Render order:
1. `RenderSystem` presents the camera and interpolated entity positions, then synchronizes collectibles, effects, and collision markings.
2. `ThreeRendererAdapter` renders the complete scene with depth testing.
3. `DebugOverlaySystem` publishes diagnostic snapshots in development.
4. React renders the HUD, diagnostics, and menu shell; no pause overlay system runs inside the simulation.

## Camera Behavior Contract
- `CameraSystem.start()` configures bounds, zoom, follow target, and viewport, then calls a one-time snap so the first gameplay frame is centered on Packet instead of animating in from `(0, 0)`.
- After startup, camera movement remains lerp-based via `CAMERA.followLerp` and updates each frame in `CameraSystem.update()`.
- `Camera3D` wraps the existing `Camera2D` follow tracker and presents an orthographic camera with a fixed 20-degree forward tilt and 5-degree lean from the right, with north as its up reference. Projection correction cancels the side lean's ground-plane shear and horizontal compression, keeping maze rows and columns aligned with the screen at the original scale while height reveals wall sides. Bounds, zoom, and viewport changes rebuild this correction and the inverse projection used for ground-plane ray picking.
- The game measures the scene mount with a `ResizeObserver` and sizes the orthographic viewport in CSS pixels. Gameplay zoom scales with container height from a 1920×1080 reference, while the tutorial remains fitted to its maze. The gameplay renderer caps its drawing buffer at 1080p and lowers resolution through two additional tiers after sustained slow active frames; other renderer consumers keep their existing policy. The runtime supplies frame timing, excluding paused, hidden, and debug-frozen play. Rendering interpolates the camera using the fixed-step loop's alpha, then rounds its displayed translation to rendered pixels using the renderer's effective pixel ratio, integer drawing-buffer dimensions, and tilt-adjusted ground scale. Follow simulation state remains continuous; exact boundary stops and small-world centering are preserved. Pointer picking uses this displayed camera transform.
- Moving meshes interpolate their previous/current positions using the same alpha. Portal, respawn, and jail position resets present the destination immediately without changing collision coordinates.
- Endless section shifts translate the camera's previous/current follow positions and every actor/interpolation sample by the same complete-section offset. This leaves the apparent screen position unchanged during a window rebase.
- Paused rendering uses current positions. After startup or resume, interpolation starts only after a fresh active fixed update so old movement is not replayed.
- The `Camera2D` tracker retains its per-axis bounds policy on both startup snap and regular updates: clamp on axes where the world is larger than the viewport, and center on axes where the viewport is larger than the world.
- Resize handling updates renderer size and camera viewport dimensions before subsequent follow updates.
- Regression coverage includes `src/__tests__/camera2d.test.ts`, `src/__tests__/camera3d.test.ts`, and `src/__tests__/cameraSystem.test.ts`.

## Core Runtime Contracts
Public runtime contract:
- `start(): Promise<void>`
- `pause(): void`
- `resume(): void`
- `continueLevel(): void`
- `destroy(): void`

Runtime options accept `onStateChange(state: RuntimeState)` and `mode: 'classic' | 'endless'`, defaulting to Classic. Authored `mapVariant` selection remains separate. Tests can pass an `endlessSeed`; normal restarts choose a new seed. `RuntimeState` carries `paused`, an optional nonterminal `LevelClearCheckpoint`, and an optional terminal `RunResult` with the run mode. The checkpoint contains the cleared Classic level, cumulative score, remaining lives, wall-clock play time, cumulative data counts, and next multiplier. The terminal result is emitted only for loss; Endless uses a direct collected-point counter and has no finite total or clear checkpoint. The mutable world outcome is `lost | cleared | null`, separate from pause state; the runtime converts a Classic `cleared` into a checkpoint and resets it on continuation.

The previous `startGameApp`/`stopGameApp` API was intentionally removed.

### Tutorial practice

The optional `tutorialLesson` launch option selects a guided lesson. `RuntimeState` additionally carries an optional immutable tutorial snapshot with its lesson and phase (`introduction`, `playing`, `explanation`, `success`, or `retry`). Tutorial sessions do not call the normal-run-only `continueLevel()` method. The shell creates a fresh runtime for each lesson or retry, retains the current lesson on a loading failure, and uses its normal startup-generation guards on cancellation. Explanatory substeps resume the same frozen runtime. Tutorial sessions bypass ordinary results and record persistence.

Tutorial composition always loads the existing demo map without editing its assets. Fixed seeds, explicit spawns, active enemy selection, and explicit collectible lists—including empty lists—are applied before constructing the renderer. Practice omits automatic jail releases, disables the debug power shortcut, and uses normal movement speeds and ability timings. A renderer-independent tutorial controller runs after simulation updates to recognize real movement, collection, teleports, scans, splits, slowdown, Quarantine walls, and Trojan disguise and reveal. Dangerous contact takes precedence over success; required-effect expiry offers retry. Runtime and shell both gate resume at terminal checkpoints.

`RenderSystem` optionally receives a callback returning the current target tile. Only tutorial scenes allocate `TutorialMarker`, a static cyan floor bracket with its own geometry and material. Rendering synchronizes the target even while simulation is paused and disposes marker resources with the scene. `CameraSystem` fits the complete demo maze with a margin for practice, including after resize; normal gameplay keeps its following camera. The shell's active objective is outside its hidden menu layer and does not intercept gameplay gestures; explanation and checkpoint panels reuse `MenuPanel`, focus handling, and shared visual tokens.

## State and Data Flow
- `TiledMapRepository` loads and parses maze JSON into `WorldMapData`.
- `CollisionGrid` exposes safe tile/collision reads.
- `WorldState` stores runtime mutable state (entities, debug flags, tick, jail state, animation state, level multiplier, and run outcome); `GameRuntime` tracks wall-clock run duration, cumulative level counts, clear checkpoints, and the terminal loss snapshot.
- Systems mutate `WorldState` in order; render systems consume the latest state.
- Presentation maps gameplay `(x, y)` to Three.js `(x, height, z)` with gameplay `y` becoming `z`; map parsing and movement remain two-dimensional.

## Determinism and Randomness
All game randomness is routed through `RandomSource`.
- production can use `Math.random`
- tests use `SeededRandom` for deterministic simulations
- Endless uses separate seeded streams for section geometry/signs, point placement, bonus placement, enemy behavior, and wave encounters. Encounter activity cannot change future section geometry or pickups.

## Portals
Portal behavior is encapsulated in `PortalService`:
- requires explicit direction and outward endpoint direction match
- allows outward bootstrap movement from centered portal endpoints via systems
- teleports when outward movement offset reaches at least half a tile (`>= tileSize / 2`)
- prevents same-tick bounce via per-entity tick guard
- blocks teleport if destination portal tile is fully blocking
- replaces all links when Endless sections shift, removing evicted mouths and rebasing retained ones

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
