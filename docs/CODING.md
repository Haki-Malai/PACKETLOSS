# Coding guide

## Development features

Use `useEnvironment().isDev` from `src/config/EnvironmentContext.tsx` for development UI. Keep an `IS_DEV` guard from `src/config/environment.ts` around development entrypoints and imports so production builds can remove the implementation. Non-React code uses that same constant directly; gameplay systems must not import React context. Do not enable tools based on the URL, saved preferences, or `VITE_GAME_ENV`, which only chooses the maze.

## Function documentation

Use [JSDoc comments](https://jsdoc.app/about-getting-started) for new or changed non-JSX functions: hooks, helpers, named handlers, class methods, and functions exposed on returned objects. This applies in both `.ts` and `.tsx` files. JSX-rendering components do not require JSDoc; their non-JSX helpers still do. Trivial inline callbacks passed to JSX, array methods, or React hooks do not need separate documentation; describe significant lifecycle behavior on the owning function or hook.

Place a `/** ... */` block immediately before the declaration or object property. Start with a concise description of behavior or purpose. Explain units, side effects, resource ownership, cancellation, or other constraints when they matter. Preserve useful existing comments and keep documentation accurate when behavior changes.

- Use [`@param name - Description.`](https://jsdoc.app/tags-param) when a parameter needs context beyond its name and TypeScript type.
- Use [`@returns Description.`](https://jsdoc.app/tags-returns) to explain result semantics, returned cleanup functions, or when an asynchronous operation settles. Omit it for `void` returns or when the summary already explains the result.
- Use [`@throws`](https://jsdoc.app/tags-throws) for errors callers must handle. For asynchronous functions, describe promise rejection in `@returns`; do not claim an error escapes when the function catches it.
- Keep types in TypeScript signatures; omit duplicate `{Type}` annotations in comments.
- A one-line JSDoc comment is enough for a simple function. Avoid restating the implementation line by line.

```ts
/** Formats a score with consistent US-English digit grouping. */
export function score(value: number): string {
    return value.toLocaleString('en-US');
}

/**
 * Formats active play time for result and record displays.
 *
 * @param elapsedMs - Active play time in milliseconds.
 * @returns Whole minutes and zero-padded seconds, discarding partial seconds.
 */
export function duration(elapsedMs: number): string {
    const seconds = Math.floor(elapsedMs / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
```
