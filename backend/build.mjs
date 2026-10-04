import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('backend-dist', { recursive: true });
await build({
    entryPoints: {
        account: 'backend/account.ts',
        multiplayer: 'backend/multiplayer.ts',
        development: 'backend/development.ts',
        bootstrap: 'backend/bootstrap-entry.ts',
    },
    outdir: 'backend-dist',
    outExtension: { '.js': '.mjs' },
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    sourcemap: true,
    banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
});
await writeFile('backend-dist/package.json', JSON.stringify({ type: 'module' }));
