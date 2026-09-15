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
- `public/assets/` contains fonts and maze data.
