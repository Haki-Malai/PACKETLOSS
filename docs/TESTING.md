# Testing

Tests use Vitest and live in `src/__tests__/`. They cover movement and collision rules, enemies and collectibles, portals and map parsing, input and pause behavior, the runtime, camera, rendering, and React overlays. Domain and renderer tests stay in the Node environment, with browser/WebGL boundaries stubbed where needed. React shell, HUD, startup, and asset-gallery tests opt into jsdom per file and use React Testing Library. UI actions use bubbling DOM events or user-event; async runtime notifications and lazy imports settle inside `act`. Strict Mode tests verify repeated effect setup/cleanup, cancellation, and subscription disposal.

## Commands

- `pnpm test` — run the regression suite.
- `pnpm typecheck` — check TypeScript types.
- `pnpm lint` — run ESLint with zero warnings allowed.
- `pnpm build` — create the production bundle.
- `pnpm test:all` — typecheck the app, shared simulation, server, APIs, and development tools; run lint and tests; build frontend, server, and Lambda artifacts.

Run a focused test while working on a feature:

```sh
pnpm test src/__tests__/portalService.test.ts
```

## Adding or changing tests

Each test should identify a meaningful failure it would catch. Prefer small authored scenarios with independent expected outcomes, especially boundary conditions, state transitions, and resource ownership. For a bug fix, add a regression case to the relevant test file and remove any redundant coverage it replaces.

- Exercise gameplay through domain services and systems. Use authored map objects and public operations instead of injecting private state; do not construct a Three.js scene to check scoring or movement rules.
- Use controlled inputs and fixed seeds to make failures reproducible. Assert valid movement, reachable unique collectibles, or another gameplay invariant. Comparing two runs alone cannot establish correctness, and changing a seed need not produce a different result in every scenario.
- Do not copy production traversal, filtering, or selection algorithms into fixtures to generate expected answers. Use hand-authored expected tile sets for small maps and a few independent invariants for real maps.
- Keep integration checks for entity/camera interpolation, teleport and respawn snaps, pause/resume, collectible removal, startup cancellation, and GPU disposal. Stub browser/WebGL boundaries while using real scene and gameplay objects where those interactions matter.
- Geometry checks should protect maze clearance, transformed wall/bar footprints, authored holes and portals, and connected outlines. Prison bars remain complete across release paths; check enemy pass-through rules in gameplay tests rather than requiring visual exit cutouts. Avoid locking down incidental vertex counts, exact decorative colors, or implementation-specific object IDs. A structural assertion is useful when it protects a stated contract, such as shared resource ownership.
- Consolidate duplicate assertions across layers. Keep distinct regressions even if that means more tests; test count and coverage percentage are not the goal.

Run the relevant test first, then `pnpm test:all` before handing off code changes unless the user has deferred those checks. Report exactly which checks ran and which remain unverified.

## Battle Royale and multiplayer regression scenarios

- `battleArenaPresentation.test.ts` verifies full boundary rails, clean corners, portal openings, clear pickup lanes, and retained-only geometry at all 21 sizes. An authored junction checks pulse ownership across rail faces, portal tips, and a branch with both disappearing and surviving segments. Corner tests check Classic’s three-pixel caps in every orientation without outward stubs. Countdown tests cover increasing pulse frequency, reduced motion, normal outlines before play, and the return to steady pink at the final size. The real multiplayer scene with stubbed browser/GPU boundaries checks next-stage wall ownership, stage replacement, resource reuse/disposal, and camera continuity. Camera suites cover unrestricted edge following, shrinking bounds, resizing, and pixel alignment; latency tests check topology correction resets without camera snaps.

- `battleArenaMap.test.ts` covers shared Endless-carver corner cleanup across the fixed axes and every nested boundary, corridor proportions and run limits alongside seed repeatability and variation, horizontal symmetry, protected logo/portal lanes, moving portals, and connectivity at every retained size. `dataRace.test.ts` covers immediate starts, seeded spawn rotation, contested pickups, shrink timing, boundary elimination, active-area refills, survivor and timeout rankings, reconnect state, development solo movement, and fresh rematches.
- `gameStateSession.test.ts` and `localSimulation.test.ts` interleave independent sessions and exercise fixed-step lifecycle ownership. `tsconfig.simulation.json` is the Node-only import boundary for shared simulation and protocol modules.
- Protocol and admission tests reject protocol versions one through four before tickets or gameplay snapshots are accepted. They also admit the one-player snapshot shape required only by the local solo-practice server. Movement parity scenarios cover queued turns while reversing into portal mouths, and shared input tests cover keyboard filtering and touch direction locking.
- Launcher, shell, room, input, and real network-bot tests cover `--multi` startup, refresh replacement, the configured bot count, and the development-only C shortcut. Authority tests verify one closure per request, unchanged movement/effect timers, stale-match and noncreator rejection, and the final-stage limit.
- `multiplayerProtocol.test.ts` validates strict input messages and an enemy-free snapshot round trip through encoding, server-message validation, and reconstruction. `multiplayerRooms.test.ts` exercises room admission, readiness, reservations, creator transfer, persistence-before-results, outbox recovery, draining, overload aborts, and the maximum-uptime start boundary. `multiplayerTransport.test.ts` uses a real loopback WebSocket for authentication, origin, replay/rate-limit, payload, duplicate-connection, and reconnect behavior.
- `multiplayerAvailability.test.tsx` and `multiplayerSocketClient.test.ts` cover status polling/backoff, drain-time reconnect and retry, continued input sequencing, authoritative snapshot reconstruction, stale process/run rejection, cancelled admission, and cached React publication. Movement-only snapshots must remain available to the raw presentation store without notifying React; score, displayed clock second, phase, connection, warning, room, and result changes must notify it. Back and local-run navigation invalidate delayed tickets and retained socket callbacks without discarding a valid reconnect reservation. Backend TypeScript tests cover owner authorization, regional exclusivity, ticket hashing/consumption data, result authorization, and operator stop policy.
- `multiplayerLatency.test.ts` exercises the presentation clock and correction easing at 0–200 ms RTT with ordered jitter, including continuous 60, 120, and 144 Hz movement between 20 Hz snapshots. It covers same-tick reconciliation, exact fractional input timing, bounded prediction, immediate acknowledged reversals, corridor and wall clamping, remote history endpoints, portal/death/respawn snaps, reconnects, rematches, and recovery after stalled snapshot delivery. `multiplayerPresentation.test.ts` checks actor synchronization before camera snap, shader preparation before first render, latest-state resampling, responsive zoom, hidden-tab suspension and fresh resume, a single frame loop, and once-only cleanup on cancellation or failure. `multiplayerRooms.test.ts` also verifies that server catch-up sends only the newest snapshot and preserves the subsequent broadcast cadence. These deterministic checks do not replace browser playability or frame-time profiling.

Run the main, server, and simulation TypeScript checks, full ESLint and Vitest suites, server and frontend builds, and backend TypeScript checks and Lambda build after multiplayer changes. Infrastructure validation lives in the infra repository and includes Terraform format/validate, unit tests, shell syntax, and workflow YAML parsing. Browser sessions, visual fairness review, latency/jitter playability, live ARM capacity, DNS/TLS, and regional lifecycle checks require their separately authorized environments; local tests do not establish those outcomes.

`multiplayerLatency.test.ts` also requires constant presentation speed through snapshot and RTT jitter at 60, 120, and 144 Hz, gradual convergence after lasting latency changes, and camera continuity across small corner corrections. A merely positive frame delta is insufficient: packet arrival must not produce periodic speed pulses.

## Full local development validation

The development launcher and adapters must be checked without AWS credentials or
network dependencies. Run the complete static and automated validation set from the
repository root:

```sh
pnpm typecheck
pnpm typecheck:server
pnpm lint
pnpm test
pnpm build
pnpm build:server
```

Run the backend checks with the same Node.js 24 toolchain:

```sh
pnpm typecheck:backend
pnpm typecheck:dev
pnpm test backend
pnpm build:backend
```

When changing the launcher, cover argument and port validation, Compose dependency
readiness, foreground shutdown, explicit reset scope, durable Docker volume reuse,
legacy SQLite migration, and the absence of AWS credentials. Development API tests cover signed access/refresh tokens,
signup confirmation and password recovery, account isolation, durable profile and
single-player record retention, immutable record IDs, DynamoDB restart behavior, hashed
single-use tickets, owner capability, internal-route authorization, process fencing,
participant-only results, and interrupted-match recovery. Development Node adapter
tests retain the real fsynced outbox and verify heartbeat, ticket, start, finish, replay,
and abort-on-restart behavior against the loopback contract.

For local automatic reload checks, use an idle Docker stack and verify server/shared gameplay/map edits produce a fresh game generation within the same run; old tickets and heartbeats must fail. Verify gateway and backend TypeScript edits restart their processes without replacing DynamoDB or resetting accounts, scores, or completed results. Introduce and fix a temporary source error to check recovery on the next save. Changing only frontend presentation must not restart the game. Watchers must remain active with `--detach`. The API regression suite also checks generation registration, unchanged uptime, durable account data, and Lambda cold starts retaining the current game generation.

Run the two development-boundary suites directly while iterating:

```sh
pnpm test src/__tests__/developmentAdapters.test.ts
pnpm test src/__tests__/developmentPlayers.test.ts
pnpm test backend
```

The Docker HTTP/WebSocket smoke script needs no browser. With the stack running:

```sh
pnpm dev:full -- --detach --bots 0       # Reserve all seats for the scripted clients
node dev/run.ts smoke                    # Accounts, scores, four players, full match, rematch
node dev/run.ts smoke --localhost        # Same flow through localhost, including CORS preflights
pnpm dev:full -- --stop
pnpm dev:full -- --detach
node dev/run.ts smoke --after-restart    # Guest session, score, and result survive restart
```

The full match takes just over three minutes. It creates isolated smoke identities and
records in the local database and saves its restart evidence under `.packetloss-dev`.
It must run without other active players occupying the single room.

For an authorized manual browser check, start clean with:

```sh
pnpm dev:full -- --reset --bots 0
```

Open `http://127.0.0.1:5173` in separate browsers or browser profiles. Ordinary tabs
share the API refresh cookie and cannot represent independent players reliably. Enter
a name and Play as guest; multiplayer must become Ready automatically. Use two to four
independent guests or seeded `@packetloss.local` accounts,
create and join one room, ready every player, finish or leave the match, reconnect within
the reservation window, and request a rematch. Also finish one Classic or Endless run,
stop the launcher, start it again without `--reset`, and confirm the profile, retained
score, and terminal multiplayer result remain available. A new signup and password reset
both use local code `000000`.

This manual flow checks the loopback browser/API/WebSocket integration and durable local
storage. It does not verify email delivery, API Gateway/Cognito JWT validation, AWS service
consistency and IAM, EC2 start/stop or regional exclusion, Route 53, HTTPS/WSS, nginx,
certificate renewal, live network latency, ARM performance, idle shutdown, or maximum
uptime enforcement outside the process. Record those as unverified unless their reviewed
AWS/browser environments were exercised separately.

## Run flow and menu regression scenarios

- Use authored domain scenarios for nonfinal death/respawn with the original enemy roster restored to jail, copy/effect retirement, loss only after the final scaled death phase, hidden Packet at loss, final-collectible points and clear checkpoint, collision-before-collection, and no automatic clear for initially empty maps.
- Exercise the runtime's public state callback to check exactly one clear checkpoint, explicit same-runtime Continue, exact point refill, compounding 1.25 multipliers, cumulative level/data results, wall-clock active play timing, frozen checkpoint/terminal timers, and immunity to resume/focus events. Preserve focused pause/resume, restart disposal, and cancelled-startup coverage.
- Check all five preset bonus tiles are packet-reachable, symmetric, and distant from spawn on each map; each mirrored pair is close enough by physical route to chain at base speed; all five icons appear at level start and remain until collected or clear; distinct pickup factors multiply and refresh the timer; expired boosts start fresh; combined awards round once; pause/death/level resets, tutorial exclusion, and maze-clear counts. Verify all five GLBs load, menu previews release resources, and the HUD reports the available count or combined factor and whole-second active boost status.
- Exercise observable menu actions with a stubbed game boundary: title without runtime initialization, repeated Start clicks, retry after load failure, cancellation and late callbacks, pause/settings/help navigation, confirmation before abandonment, and focus routing. Verify arrows wrap through enabled buttons and move the primary-action style, Enter activates the selection, focused form controls retain native behavior, menu typing/buttons do not trigger movement, pause, or debug shortcuts, and held keys/touches do not leak back into play.
- Exercise the labelled top-right Back control and Escape from settings/help/profile, including focus returning to the parent panel without an action outline and continued pause. Keep explicit Resume, replay/main-menu, and Cancel/Confirm behaviors covered, including confirmation focus restoration. Check that menu navigation retains the same ambient decoration while replacing panel content, and shell disposal removes it; do not assert decorative node counts or animation geometry.
- Keep the title wordmark's renderer stubbed in menu tests and verify it receives the current motion setting after settings navigation. Separately exercise its real scene with a stubbed WebGL boundary: narrow/wide framing, resize without repeated scene allocation or a continuous animation loop, single-letter dimming and restoration, reduced-motion/hidden-tab cancellation, resource disposal, failed initialization, context loss, and text fallback. Navigation or disposal during its lazy import must not mount a stale canvas.
- Keep enemy portraits stubbed in menu tests and verify help exposes basics plus all seven enemy descriptions without starting/resuming gameplay. Leaving help during its lazy import must not mount previews into a replacement menu; leaving after mounting must dispose them once.
- Exercise portrait loading and animation with stubbed rendering boundaries: one shared renderer copies all seven views, idle time advances at a capped frame rate, Reduced is static, system preference changes take effect, and hidden tabs stop scheduling without advancing time. Check static fallbacks on failure, cancellation during asset loading, and cleanup of frames, listeners, and GPU resources.
- Test local storage reload and version-one migration, malformed data, unavailable reads/writes, nickname trimming/default/length and rendering as text, per-map score ordering and limits, recent results, exactly-once final-loss persistence, and clearing records without clearing preferences. Clear checkpoints and abandoned runs must not be saved.

These scenarios protect observable behavior; avoid snapshots of decorative geometry or CSS. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` for the menu/run-flow change. Authored scenarios alone do not establish that these checks passed.

## Endless mode regression scenarios

`src/__tests__/endlessMaze.test.ts` uses fixed seeds to check one connected physical movement graph, a minimum of two exits per corridor tile (counting exits beyond the outer resident seam), and no enclosed one-entrance pockets after removing any corridor tile. It also checks matching top/bottom seam masks and wall pixels, ID-0 side rails with ID-23 portal-tip gaps, no fully open 2 × 2 wall corners, the guaranteed opening logo above the center spawn corridor, additional long horizontal routes, roughly three-quarters two-exit corridors with straight lanes dominating bends, complete centered wordmarks with a full open row between equal straight upper/lower wall spans and correctly paired mouths, 24-row spacing after eviction and regeneration, a reachable 16-step Firewall patrol, retained section scene objects through shifts, fresh evicted geometry on revisit, and a resident scene count of five through reversals. `src/__tests__/endlessVerticalRuns.test.ts` caps uninterrupted physical north/south runs at four tiles and horizontal wall spans at ten corridor columns in initial and shifted windows, including across section seams. Temporary Quarantine traps are outside these permanent-topology checks.

`src/__tests__/endlessRuntime.test.ts` exercises a generated domain world without WebGL. It checks bidirectional logo portals and physical-only routing, rebased and evicted links, complete-section rebasing of actor offsets, saved targets, hazards, visits, camera-relative positions, and interpolation; bounded pickups and sections over long upward/downward travel; offscreen waves with inherited power; harmless eaten-bug corridor flight; and exact-position nonfinal recovery. `portalService.test.ts` checks replacement of stale links. `gameCompositionRoot.test.ts` verifies that Endless starts exactly at the center crossing, skips the authored map and jail release, and builds the fixed ten-slot roster. `gameRuntime.test.ts` checks that empty resident pickups never produce an Endless clear checkpoint and that the final result uses the touched-pickup count. `gameShell.test.tsx` covers Endless launch, mode-preserving replay/restart, result fields, and the Profile selector. `localProfileStore.test.ts` covers mode-less record migration and separate score lists. Keep the existing Classic and tutorial checks when changing shared systems. Run all four commands above after implementation.

Browser and visual playtesting remain deferred until explicitly requested. The Node checks cannot establish apparent contour quality, phone-sized camera clearance, or moment-to-moment encounter feel.

## Guided tutorial regression scenarios

- Exercise all nine lessons through real domain systems on the demo maze: a valid automatic start in every lesson, turns plus the four sparse movement pickups and their markers, both Firewall checkpoints using the seeded standard patrol planner, the power core at `(2,6)`, the Virus target at `(11,11)`, the Spam target at `(11,1)`, chase movement, completed scared-enemy intake, chase guidance covering power suppression, a successful saved-target scan, a real split, slowed movement through a live zone, Quarantine walls and the subsequent point, and Trojan disguise, reveal, and escape. Premature actions must not complete lessons; dangerous contact wins over success, and required power/zone expiry offers retry.
- Check fresh practice on each lesson/retry, fixed scenario setup before renderer construction, explicit empty collectibles, omitted automatic releases, and unchanged configured maps for normal games. Tutorial completion and abandonment must never persist a record or produce normal run results.
- Exercise Tutorial immediately below How to play in the main menu, direct tutorial launch, absence of practice controls in help, automatic success advancement without lesson outros, same-lesson loading retry, cancellation and obsolete callbacks, disposal, unlimited retry, final completion actions, and return to the main menu with Tutorial focused on exit. Check manual and focus-caused pauses, held-input clearing, and checkpoint immunity to Escape, Space, and focus return.
- Keep marker coverage at the renderer boundary: current tile placement, depth-independent visibility over maze walls, target updates while paused, no marker for normal play, and exact resource disposal. `pnpm test src/__tests__/renderTutorialMarker.test.ts` runs that focused check.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` after implementation. Browser QA remains deferred until explicitly requested; then check tutorial objective readability, marker visibility around collectibles, touch gestures, short screens, focus, and reduced motion through the complete flow. Domain and renderer tests do not establish browser usability.

## Visual checks and debugging

Enemy regression scenarios cover Firewall's random reachable targets, 16-step minimum loops, player-independent patrols, and per-release reselection; portal routes for eligible enemies and physical-only Virus pursuit; Ping range and saved targets; bounded Spam spawning and slot reuse; and Lag expiry/non-stacking slowdown. Include fractional speed changes near turns and collectibles, power-point ability suppression, paused effects, inactive-copy visibility, and seven-model loading cancellation. Asset Lab scenarios should rewind ability demonstrations without accumulating copies or effect resources. Authored tests are not evidence of passing checks until they are executed.

The Node suite does not verify actual browser appearance, WebGL output, or touch experience. Browser inspection and dev servers require an explicit user request. When authorized, check movement, outline shimmer, pause/resume, resizing, and mobile swipes. If inspection is deferred, record the visual limitation rather than adding tests that merely pin material settings.

For menus, additionally inspect the shared scene palette and typography, the title's actual map lettering and brief single-letter flicker at desktop/mobile sizes, stationary panels with synchronized opposite-direction top/bottom edge sweeps, corner pixels and slow button light pulses, frozen full-color scene under pause/results, loss/clear entrances, system and explicit reduced motion, keyboard focus containment/restoration, short-screen scrolling, safe areas, 44-pixel touch targets, and actual fullscreen behavior. The initial menu implementation explicitly defers dev-server and browser inspection; appearance, fullscreen, and touch usability remain unverified until separately authorized checks are completed.

When visual checks are authorized, inspect the shared standard/wide frames, top-right Back controls, and the basics-above-enemies help layout at widths of at least 800 pixels and stacked below that, including short-screen scrolling. Confirm all seven help portraits show their current models and idle motion clearly at 80 pixels, keep static fallbacks while loading, and leave their adjacent names and descriptions readable. Check that ambient animation continues across menu navigation, remains visible in wide-panel gutters, and becomes static under Reduced or the system preference. These scenarios do not imply completed browser validation.

These shortcuts are available only in the local development server or an explicit `--mode development` build; production ignores them:

- `C` toggles the collision overlay and FPS/frame-time panel.
- `Shift+C` copies the collision debug panel text.
- `F` compounds gameplay speed and scoring by 25% without resetting the current run.
- `G` divides gameplay speed and scoring by 1.25 per press, including below the starting speed.
- `Shift+F` freezes or unfreezes simulation and animation without opening the pause menu.
- `V` toggles persistent portal blinking and collision protection until pressed again.
- `N` skips directly to the next guided-tutorial lesson.
- `H` toggles a persistent scared-state override for active enemies during normal play; real power cores do not shorten it, and it is disabled in tutorial practice.

After editing the demo Tiled map, run `pnpm map:demo:convert` and `pnpm test` to check the generated map and its gameplay rules.

## React migration checks

- Keep canvas mounting independent of React overlays; starting/restarting a game must not remove the HUD or menu hosts.
- Exercise live score/lives changes and subscription cleanup, plus diagnostic text publication, disabling, and reset between runs.
- Exercise gallery filtering/selection, playback and seeking, camera/transform controls, loading failure/retry, hidden-tab timing, cancelled thumbnails, and unmount. Stub preview sessions in UI tests; retain the existing real preview scene/session/viewport tests for resource ownership.
- Check development/production behavior at the app and runtime boundaries: production must omit the gallery route/link, debug panels and callbacks, diagnostic systems, and collision geometry. Debug shortcuts must do nothing while ordinary movement and pause continue to work. An explicit development build must expose the gallery under a nested deployment base URL.
- A production build must omit the gallery, diagnostic panels/systems, collision inspection scene, and debug shortcut/clipboard code, and include Tailwind utilities for the shared theme and responsive layouts. Inspect emitted JavaScript as well as testing runtime guards. The build uses Tailwind 4's PostCSS integration; ESLint and Prettier use `src/tailwind.css` as their theme entrypoint.

## Development asset gallery

When starting a dev server is authorized, run `pnpm dev` and open the Asset gallery link or `/dev/assets`. Select a thumbnail to inspect the current asset, switch between the game and orbit cameras, and use play/pause, replay, seeking, and speed controls. The gallery is excluded from production builds and does not start a game.

Future acceptance checks, when validation is authorized:

- Confirm the development route loads without constructing the game or resetting score/lives, and that production omits the route and link.
- Inspect player and enemy states, both star sizes and pickup effects, all wall footprints and connected examples, prison joins, the wordmark, floor, and shadow against their shared runtime assets.
- Check motion and trail directions, scared warnings, eating and blinking; seek across the death-to-respawn boundary at 900 ms and the following 1,200 ms recovery. Pausing must hold the displayed state, and replay must restart it.
- Inspect both cameras at gameplay scale and close range, including outline seams, small glyph readability, resizing, and camera controls while playback is paused.
- Exercise asset switching, failed/cancelled loading, and leaving the gallery; confirm previews, listeners, controls, and GPU resources are released without affecting later game startup.

These are acceptance scenarios, not a record of completed validation. Follow any task-specific deferral of tests, builds, browser inspection, or dev servers.

## Quarantine and Trojan regressions

`mazeHazards.test.ts` checks symmetric directional passage closures, other exits remaining open, temporary corridor trapping and exact collision restoration, actor/portal/jail clearance, extension capacity and pause, power suppression, actually traversed disguise sites, physical Trojan travel without a position jump, rejection of a site occupied before arrival, exclusion around real data bits and power cores, unchanged scoring, reveal grace, immunity to other enemies and unattended disguise expiry, and cleared visit history on refill. `mazeGeometry.test.ts` checks thin joins, surviving openings, outline ownership, and replacement resource disposal. `mazeHazardPresentation.test.ts` checks simulation-to-model travel and in-place disguise/reveal wiring, shared point resources, frozen reveal presentation, and bounded beam resource disposal. Asset-preview regressions cover seeking backward through the transformation and switching away from both ability demonstrations. Regenerate the documented SVG atlas with `node scripts/generate-maze-atlas.mjs` after changing footprint templates. These checks do not replace in-browser visual/playability testing, which requires an explicit request.
