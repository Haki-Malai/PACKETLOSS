import { build } from 'esbuild';

await build({
    entryPoints: ['server/dev.ts'],
    outfile: '/tmp/packetloss-game.mjs',
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'esm',
    banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
});
const { main } = await import('/tmp/packetloss-game.mjs');
// A shared edit may restart the Lambda emulators at the same time as this process.
// Retry startup while they return; nodemon still handles build errors on the next save.
for (let attempt = 1; ; attempt += 1) {
    try {
        await main();
        break;
    } catch (error) {
        if (attempt >= 20) throw error;
        console.error(`Game startup waiting for local services (${attempt}/20): ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}
