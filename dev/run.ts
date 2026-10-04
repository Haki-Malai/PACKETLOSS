import { build } from 'esbuild';
import { mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [entrypoint, ...args] = process.argv.slice(2);
if (!entrypoint || !['game', 'gateway', 'lambda', 'smoke'].includes(entrypoint)) {
    throw new Error('Usage: node dev/run.ts <game|gateway|lambda|smoke> [arguments]');
}

// Bundle the same checked TypeScript sources used by the app, server, and APIs.
// Temporary bundles contain no copied source helpers or separately maintained contracts.
const directory = await mkdtemp(join(tmpdir(), 'packetloss-dev-'));
const outfile = join(await realpath(directory), `${entrypoint}.mjs`);
try {
    await build({
        entryPoints: [join(import.meta.dirname, `${entrypoint}.ts`)],
        outfile,
        bundle: true,
        platform: 'node',
        target: 'node22',
        format: 'esm',
        banner: {
            js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
        },
    });
    // Preserve ordinary executable-entrypoint guards and command-line arguments.
    process.argv.splice(1, process.argv.length - 1, outfile, ...args);
    await import(pathToFileURL(outfile).href);
} finally {
    await rm(directory, { recursive: true, force: true });
}
