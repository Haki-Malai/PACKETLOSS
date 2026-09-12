# Working on Pacman

- Read `docs/PRODUCT.md` for gameplay and scope, and `docs/ARCHITECTURE.md` before changing runtime structure.
- Keep changes small, readable, and limited to the request.
- Use strict TypeScript; avoid `any` and unnecessary abstractions.
- Prefer Tailwind utilities for UI styling.
- Keep gameplay logic in `src/game/` and engine primitives in `src/engine/`.
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` after code changes.
- Add focused regression tests when fixing gameplay bugs.
- Keep tests that protect a meaningful gameplay rule, observable integration behavior, or resource lifecycle. Prefer a small authored scenario with an independent expected outcome; test boundaries and state transitions where regressions are likely.
- Use fixed inputs or seeds for reproducibility, but do not treat repeated identical output as proof of correctness. Avoid copied production algorithms as test oracles, private-state injection, incidental styling/geometry snapshots, and duplicate assertions at multiple layers.
- Test domain behavior directly without constructing a renderer. Keep a few integration checks for simulation-to-scene wiring, pause/resume, and disposal. Consolidate or remove redundant tests when changing coverage; do not target a test count.
- Follow explicit task limits on validation. Report skipped checks, and do not start a dev server or inspect a browser without the user's request.
- Keep documentation focused; update `docs/PRODUCT.md` when product behavior changes. Check `docs/TESTING.md` for validation guidance.
- Do not stage, commit, push, or change remote resources without explicit instruction.
- If asked to commit, follow Conventional Commits.
