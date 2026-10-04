import { execFileSync, spawn } from 'node:child_process';

// Build before each emulator start so a failed edit can recover on the next save.
execFileSync(process.execPath, ['backend/build.mjs'], { stdio: 'inherit' });
if (process.argv.includes('--bootstrap')) {
    execFileSync(process.execPath, ['backend-dist/bootstrap.mjs'], { stdio: 'inherit' });
} else {
    const runtime = spawn('/lambda-entrypoint.sh', ['backend-dist/development.handler'], {
        stdio: 'inherit',
    });
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        process.on(signal, () => runtime.kill(signal));
    }
    runtime.once('error', (error) => { console.error(error.message); process.exitCode = 1; });
    runtime.once('exit', (code) => { process.exitCode = code ?? 0; });
}
