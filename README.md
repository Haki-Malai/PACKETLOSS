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

Settings include menu motion and fullscreen where supported. Sound is a disabled placeholder for future support. Profile & records stores an optional nickname, top scores, and recent completed runs on this device. Configured deployments and the full local development stack also provide accounts, profile synchronization, retained single-player records, and private Battle Royale rooms. There is no public leaderboard or saved unfinished single-player run.

## Development

The full local stack uses Docker Compose: **DynamoDB Local**, two **AWS Node.js 22 Lambda runtime emulators**, the HTTP gateway, Node.js 24 game server, and Vite. Start Docker Desktop or Colima first (`colima start --cpu 4 --memory 4` on this machine), then:

```sh
node scripts/dev-full.mjs
# Or, with pnpm installed:
pnpm dev:full
```

Node.js 24 runs the game server and toolchain; API Lambdas use Node.js 22, matching the runtime supported by the pinned infrastructure provider. No AWS account, LocalStack subscription, or cloud credentials are needed. The first run downloads images and dependencies; later runs use cached images. Open **http://127.0.0.1:5173** or **http://localhost:5173**, enter a name, and choose **Play as guest**. Multiplayer becomes **Ready** automatically; no owner login, region startup, or local cooldown is required.

| Service | Address |
| --- | --- |
| Browser | http://127.0.0.1:5173 |
| Lambda HTTP gateway | http://127.0.0.1:8787 |
| Game HTTP / WebSocket | http://127.0.0.1:8080 / ws://127.0.0.1:8080/ws |
| Private game administration | http://127.0.0.1:8081 (requires generated token) |

Only loopback ports are published. The API follows the page’s hostname so refresh cookies work with either local address; keep using the same hostname to retain that browser session. DynamoDB and Lambda invocation ports remain inside Docker.

Code changes reload automatically, including with `--detach`: Vite updates the frontend; game/server, shared simulation, protocol, and Classic map edits rebuild and restart the game process; gateway edits restart the gateway; TypeScript API edits rebuild and restart both Lambda emulators. Watchers poll mounted files for reliable Docker Desktop/Colima detection and recover after you fix a syntax error. A game restart interrupts local matches and returns multiplayer with a new process identity; accounts, scores, completed results, and the database remain intact. Frontend presentation-only edits do not restart the game. Restart the launcher after dependency, Dockerfile, Compose, or environment configuration changes to rebuild/reconfigure the containers.

Guests have independent identities and persistent scores. Reusing a name never takes over another player. Refresh cookies restore the same guest until logout, cookie removal, or expiry. Use separate browser profiles for simultaneous players; ordinary tabs share cookies. Full signup, confirmation, login, recovery, profile editing, high scores, multiplayer tickets, rooms, reconnects, and results are also available locally.

Create a multiplayer room and two randomly named **BOT** players automatically join and ready up, leaving one spare seat for a friend. Ready yourself and press Start. Bots run in the local Node service and use guest authentication, single-use tickets, real WebSockets, and directional inputs to collect pickups; the server applies the normal scoring, collision, and respawn rules. They ready again after Rematch and leave when no human participants or reconnect reservations remain. Bots never create rooms or start matches. Use `--bots 0` for manual multi-browser tests, or `--bots 3` for a full four-player solo test; `PACKETLOSS_DEV_BOTS` also accepts 0–3. Production has no automated players.

Use `--solo` for a development-only one-player Battle Royale. It disables bots and starts play immediately after **Create room**, while retaining movement, shrinking walls, elimination, and reconnect behavior. Solo practice results are not saved, and deployed rooms still require two to four players.

For account testing, seeded emails are `owner@packetloss.local` and `friend1@packetloss.local` through `friend3@packetloss.local`, all with password `packetloss-dev`. New local passwords may be any non-empty string up to 128 characters. Confirmation and recovery use `000000`; no email is sent. Production policies are unchanged.

```sh
pnpm dev:full -- --detach  # Keep containers running in the background
pnpm dev:full -- --solo    # Start a one-player Battle Royale from Create room
pnpm dev:full -- --bots 0  # Disable automatic players for games with friends
pnpm dev:full -- --stop    # Stop; preserve database and outbox
pnpm dev:full -- --reset   # Explicitly erase local data and start fresh
```

`--web-port`, `--api-port`, `--game-port`, and `--admin-port` override published ports. `--help` lists options. The matching `PACKETLOSS_DEV_*_PORT` environment variables work too. Ctrl+C stops a foreground run without erasing data. To inspect logs:

```sh
docker compose --env-file .packetloss-dev/compose.env -f compose.dev.yml logs --tail 100
# On Homebrew installations without the plugin, use docker-compose instead.
```

DynamoDB persists in the `packetloss-dev_dynamodb` Docker volume. Signing credentials and the result outbox stay in `.packetloss-dev/data`; the launcher saves its private Compose environment in `.packetloss-dev/compose.env`. Keep both the volume and data directory. The first Docker launch imports existing `packetloss.sqlite` identities, sessions, profiles, scores, and match records without modifying the original file. `--reset` removes both stores deliberately.

Profiles, scores, single-use tickets, and match results use the **production DynamoDB repositories and transactions** against DynamoDB Local. HTTP requests invoke the same Node.js API handlers through AWS's Lambda runtime emulator using API Gateway v2 events. Only Cognito authentication is replaced with local signed sessions and simpler signup rules. EC2, DNS, TLS, IAM, quotas, and real regional behavior still require deployed verification. The local game runs under the `eu` identifier; it does not represent a physical AWS region.

For the frontend alone, without the local APIs or multiplayer server, use:

```sh
pnpm install
pnpm dev
```

`pnpm build` creates the production bundle in `dist/`; `pnpm preview` serves that build locally. `pnpm test:all` runs frontend, server, simulation, backend, and development-tool typechecks, lint, tests, and all three builds. The `dev/` entrypoints are strict TypeScript; `dev/run.ts` bundles them for Node without adding a separate TypeScript runtime dependency. Run `pnpm typecheck:dev` to check them directly.

`pnpm dev` enables development tools. `pnpm build --mode development` includes those tools in an optimized build; the default production build excludes the asset gallery, debug panels, collision inspection, and debug shortcuts. React UI reads the shared environment context, while runtime code uses the same build-time flag. `VITE_GAME_ENV=DEMO` selects a maze independently of development tools.

To run the demo maze:

```sh
VITE_GAME_ENV=DEMO pnpm dev
```

After editing its Tiled map, run `pnpm map:demo:convert` to regenerate the demo JSON.

The shipped GLBs and geometry JSON are the maintained asset sources. One-off model generators have been removed. Regenerate the seven transparent enemy portrait PNGs with `pnpm assets:portraits`, or preview them in another directory with `pnpm assets:portraits --output /tmp/packetloss-portraits`. The JavaScript tool uses the runtime models, palette, idle pose, camera, and lights through a CPU renderer. It needs only Node.js and existing project dependencies; its simple diffuse shading does not reproduce Blender's path-traced shadows.

## Deployment

Successful CI on `dev` deploys to `https://dev.packetloss.hakimalai.com/`;
successful CI on `main` deploys to `https://packetloss.hakimalai.com/`.
Both builds use `/` as their asset base. Development includes debug tools and
the gallery at `/dev/assets`; production excludes them. Pull requests never deploy.
Run CI manually on either branch to retest and redeploy its current commit.

CI calls `Haki-Malai/infra`'s reusable `.github/workflows/deploy-packetloss.yml`
at a pinned commit SHA. The pin versions deployment instructions; each run
still checks out the triggering PACKETLOSS SHA. Environments and OIDC remain
here. Publish new infra workflow versions before updating the pin on both
deployment branches.

The Node migration requires publishing the updated infra workflow first, then replacing the caller's existing SHA and adding `with.infra_ref` with that same full published SHA before deploying this branch. The old pinned workflow cannot package the new backend. Follow `infra/docs/game-server.md` for the coordinated Lambda runtime/handler transition and migration of existing game hosts; changing bootstrap source alone does not update running instances.

The reusable workflow uses the matching GitHub environment's
`AWS_REGION`, `AWS_ROLE_ARN`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `SITE_URL`,
`BUILD_MODE`, and `VITE_GAME_ENV` variables. Terraform in `infra` owns these
environments, branch restrictions, AWS resources, DNS, and cost alerts. Build
variables are public; do not put secrets in `VITE_*` variables. AWS authentication
uses a separate OIDC role for each stage, without stored AWS access keys.

Assets upload before `index.html`; earlier hashed bundles remain available for
open sessions. CloudFront invalidation completes before the deployment finishes.
`/deployment.json` identifies the published commit and stage. See the
[`infra` deployment runbook](https://github.com/Haki-Malai/infra/blob/main/docs/packetloss.md) for migration,
cost controls, verification, and rollback. The workflow replaces GitHub Pages
publishing and must be present on both deployment branches before migration.

## Project layout

- `src/main.tsx` mounts the React title/menu shell; starting a run initializes the game.
- `src/engine/` contains the loop, camera, input, timers, and tweens.
- `src/game/` contains gameplay logic, runtime wiring, map loading, Three.js presentation, and UI integration.
- `server/` contains the authoritative Battle Royale service plus production and local persistence adapters.
- `backend/` contains the account and multiplayer Lambda applications and their development-only local composition.
- `scripts/dev-full.mjs` supervises the complete loopback development stack.
- `public/assets/` contains fonts and maze data.
