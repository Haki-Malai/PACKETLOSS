import { execFile } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));

describe('native Node development runner', () => {
    it.each([
        ['../server/index', 'Usage: node dev/run.ts'],
        ['gateway', 'Both local Lambda emulator URLs are required.'],
    ])('rejects or reports %s without leaving a temporary bundle', async (entrypoint, message) => {
        const directory = await mkdtemp(join(tmpdir(), 'packetloss-runner-test-'));
        const environment: NodeJS.ProcessEnv = { ...process.env, TMPDIR: directory };
        delete environment.ACCOUNT_LAMBDA_URL;
        delete environment.MULTIPLAYER_LAMBDA_URL;
        try {
            // The gateway case must bundle and load its real entrypoint, then fail before listening.
            await expect(execute(process.execPath, ['dev/run.ts', entrypoint], {
                cwd: root,
                env: environment,
                timeout: 10000,
            })).rejects.toThrow(message);
            expect(await readdir(directory)).toEqual([]);
        } finally {
            await rm(directory, { recursive: true, force: true });
        }
    });
});
