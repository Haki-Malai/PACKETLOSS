# Testing

Tests use Vitest and live in `src/__tests__/`. They cover movement and collision rules, enemies and collectibles, portals and map parsing, input and pause behavior, the runtime, camera, rendering, and React overlays. Domain and renderer tests stay in the Node environment, with browser/WebGL boundaries stubbed where needed. React shell, HUD, startup, and asset-gallery tests opt into jsdom per file and use React Testing Library. UI actions use bubbling DOM events or user-event; async runtime notifications and lazy imports settle inside `act`. Strict Mode tests verify repeated effect setup/cleanup, cancellation, and subscription disposal.

## Commands

- `pnpm test` — run the regression suite.
- `pnpm typecheck` — check TypeScript types.
- `pnpm lint` — run ESLint with zero warnings allowed.
- `pnpm build` — create the production bundle.
- `pnpm test:all` — run all three checks and build the production bundle.

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

## Run flow and menu regression scenarios

- Use authored domain scenarios for nonfinal death/respawn, loss only after the final 900 ms death phase, hidden Packet at loss, final-collectible points and clear, collision-before-collection, and no automatic clear for initially empty maps.
- Exercise the runtime's public state callback to check exactly one completed snapshot, active play timing, frozen terminal timers, and immunity to resume/focus events after completion. Preserve focused pause/resume, restart disposal, and cancelled-startup coverage.
- Exercise observable menu actions with a stubbed game boundary: title without runtime initialization, repeated Start clicks, retry after load failure, cancellation and late callbacks, pause/settings/help navigation, confirmation before abandonment, and focus restoration. Verify menu typing/buttons do not trigger movement, pause, or debug shortcuts, and held keys/touches do not leak back into play.
- Exercise the labelled top-right Back control and Escape from settings/help/profile, including parent focus restoration and continued pause. Keep explicit Resume, replay/main-menu, and Cancel/Confirm behaviors covered. Check that menu navigation retains the same ambient decoration while replacing panel content, and shell disposal removes it; do not assert decorative node counts or animation geometry.
- Keep the title wordmark's renderer stubbed in menu tests and verify it receives the current motion setting after settings navigation. Separately exercise its real scene with a stubbed WebGL boundary: narrow/wide framing, resize without repeated scene allocation or a continuous animation loop, single-letter dimming and restoration, reduced-motion/hidden-tab cancellation, resource disposal, failed initialization, context loss, and text fallback. Navigation or disposal during its lazy import must not mount a stale canvas.
- Keep enemy portraits stubbed in menu tests and verify help exposes basics plus all five enemy descriptions without starting/resuming gameplay. Leaving help during its lazy import must not mount previews into a replacement menu; leaving after mounting must dispose them once.
- Exercise portrait loading and animation with stubbed rendering boundaries: one shared renderer copies all five views, idle time advances at a capped frame rate, Reduced is static, system preference changes take effect, and hidden tabs stop scheduling without advancing time. Check static fallbacks on failure, cancellation during asset loading, and cleanup of frames, listeners, and GPU resources.
- Test local storage reload, malformed data, unavailable reads/writes, nickname trimming/default/length and rendering as text, per-map score ordering and limits, recent results, exactly-once completed-run persistence, and clearing records without clearing preferences. Abandoned runs must not be saved.

These scenarios protect observable behavior; avoid snapshots of decorative geometry or CSS. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` for the menu/run-flow change. Authored scenarios alone do not establish that these checks passed.

## Guided tutorial regression scenarios

- Exercise all seven lessons through real domain systems on the demo maze: a valid automatic start in every lesson, turns plus the four sparse movement pickups and their markers, both Firewall checkpoints constrained to `(1,1)`–`(2,5)`, the power core at `(2,6)`, the Virus target at `(11,11)`, the Spam target at `(11,1)`, chase movement, completed scared-enemy intake, chase guidance covering power suppression, a successful saved-target scan, a real split, and slowed movement through a live zone. Premature actions must not complete lessons; dangerous contact wins over success, and required power/zone expiry offers retry.
- Check fresh practice on each lesson/retry, fixed scenario setup before renderer construction, explicit empty collectibles, omitted automatic releases, and unchanged configured maps for normal games. Tutorial completion and abandonment must never persist a record or produce normal run results.
- Exercise Tutorial immediately below How to play in the main menu, direct tutorial launch, absence of practice controls in help, automatic success advancement without lesson outros, same-lesson loading retry, cancellation and obsolete callbacks, disposal, unlimited retry, final completion actions, and return to the main menu with Tutorial focused on exit. Check manual and focus-caused pauses, held-input clearing, and checkpoint immunity to Escape, Space, and focus return.
- Keep marker coverage at the renderer boundary: current tile placement, depth-independent visibility over maze walls, target updates while paused, no marker for normal play, and exact resource disposal. `pnpm test src/__tests__/renderTutorialMarker.test.ts` runs that focused check.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` after implementation. Browser QA remains deferred until explicitly requested; then check tutorial objective readability, marker visibility around collectibles, touch gestures, short screens, focus, and reduced motion through the complete flow. Domain and renderer tests do not establish browser usability.

## Visual checks and debugging

Enemy regression scenarios cover fixed patrols despite player movement, shortest routes through portals, Ping range and saved targets, bounded Spam spawning and slot reuse, and Lag expiry/non-stacking slowdown. Include fractional speed changes near turns and collectibles, power-point ability suppression, paused effects, inactive-copy visibility, and five-model loading cancellation. Asset Lab scenarios should rewind ability demonstrations without accumulating copies or effect resources. Authored tests are not evidence of passing checks until they are executed.

The Node suite does not verify actual browser appearance, WebGL output, or touch experience. Browser inspection and dev servers require an explicit user request. When authorized, check movement, outline shimmer, pause/resume, resizing, and mobile swipes. If inspection is deferred, record the visual limitation rather than adding tests that merely pin material settings.

For menus, additionally inspect the shared scene palette and typography, the title's actual map lettering and brief single-letter flicker at desktop/mobile sizes, stationary panels with synchronized opposite-direction top/bottom edge sweeps, corner pixels and slow button light pulses, frozen full-color scene under pause/results, loss/clear entrances, system and explicit reduced motion, keyboard focus containment/restoration, short-screen scrolling, safe areas, 44-pixel touch targets, and actual fullscreen behavior. The initial menu implementation explicitly defers dev-server and browser inspection; appearance, fullscreen, and touch usability remain unverified until separately authorized checks are completed.

When visual checks are authorized, inspect the shared standard/wide frames, top-right Back controls, and help/profile columns at widths of at least 800 pixels and stacked below that, including short-screen scrolling. Confirm all five help portraits show their current models and idle motion clearly at 80 pixels, keep static fallbacks while loading, and leave their adjacent names and descriptions readable. Check that ambient animation continues across menu navigation, remains visible in wide-panel gutters, and becomes static under Reduced or the system preference. These scenarios do not imply completed browser validation.

These shortcuts are available only in the local development server or an explicit `--mode development` build; production ignores them:

- `C` toggles the collision overlay and FPS/frame-time panel.
- `Shift+C` copies the collision debug panel text.
- `F` freezes or unfreezes simulation and animation without opening the pause menu.
- `N` skips directly to the next guided-tutorial lesson.
- `H` toggles the scared state of active enemies for debugging during normal play; it is disabled in tutorial practice.

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
