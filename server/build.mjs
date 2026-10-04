import { build } from 'esbuild';
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { PROTOCOL_VERSION } from '../src/game/protocol/version.ts';

await mkdir('server-dist', { recursive: true });
await build({ entryPoints: ['server/index.ts'], outfile: 'server-dist/server.js', bundle: true,
  platform: 'node', target: 'node24', format: 'esm', sourcemap: true,
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } });
await build({ entryPoints: ['server/exportMap.ts'], outfile: 'server-dist/export-map.mjs', bundle: true,
  platform: 'node', target: 'node24', format: 'esm' });
execFileSync(process.execPath, ['server-dist/export-map.mjs'], { stdio: 'inherit' });
await rm('server-dist/export-map.mjs');
const version = process.env.GAME_BUILD_VERSION ?? execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { encoding: 'utf8' }).trim();
const checksums = {};
for (const file of ['server.js', 'server.js.map', 'map.json']) checksums[file] = createHash('sha256').update(await readFile(`server-dist/${file}`)).digest('hex');
await writeFile('server-dist/package.json', JSON.stringify({ type: 'module' }));
await writeFile('server-dist/manifest.json', JSON.stringify({ version, protocolVersion: PROTOCOL_VERSION, node: '>=24', checksums }, null, 2));
