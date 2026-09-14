# Working on PACKETLOSS

- Read `docs/PRODUCT.md` for gameplay and scope, and `docs/ARCHITECTURE.md` before changing runtime structure.
- Keep changes small, readable, and limited to the request.
- Use strict TypeScript; avoid `any` and unnecessary abstractions.
- Document new or changed non-JSX functions with JSDoc comments following `docs/CODING.md`.
- Prefer Tailwind utilities for UI styling.
- Every new or changed HTML interface must follow the canonical HTML visual contract in `docs/PRODUCT.md` and reuse the shared tokens and styles in `src/game/ui/gameUi.css`. Build menu UI with the shared React button/panel components in `src/game/ui/MenuPanel.tsx`; use its header/body/actions/footer slots and shared `MenuColumns` layout instead of duplicating layout markup. Keep ambient decoration owned by `GameShell` across menu navigation. This includes future development-tool UI changes; do not restyle unrelated tools as part of another task.
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
