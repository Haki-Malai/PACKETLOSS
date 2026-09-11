# Working on Pacman

- Read `docs/PRODUCT.md` for gameplay and scope, and `docs/ARCHITECTURE.md` before changing runtime structure.
- Keep changes small, readable, and limited to the request.
- Use strict TypeScript; avoid `any` and unnecessary abstractions.
- Prefer Tailwind utilities for UI styling.
- Keep gameplay logic in `src/game/` and engine primitives in `src/engine/`.
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` after code changes.
- Add focused regression tests when fixing gameplay bugs.
- Keep documentation focused; update `docs/PRODUCT.md` when product behavior changes. Check `docs/TESTING.md` for validation guidance.
- Do not stage, commit, push, or change remote resources without explicit instruction.
- If asked to commit, follow Conventional Commits.
