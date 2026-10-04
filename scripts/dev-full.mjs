#!/usr/bin/env node

import { randomBytes, randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOOPBACK = '127.0.0.1';
const DEFAULT_PORTS = { web: 5173, api: 8787, game: 8080, admin: 8081 };

/** Parses launcher flags while keeping every service loopback-only. */
export function parseOptions(arguments_) {
    const ports = {
        web: environmentPort('PACKETLOSS_DEV_WEB_PORT', DEFAULT_PORTS.web),
        api: environmentPort('PACKETLOSS_DEV_API_PORT', DEFAULT_PORTS.api),
        game: environmentPort('PACKETLOSS_DEV_GAME_PORT', DEFAULT_PORTS.game),
        admin: environmentPort('PACKETLOSS_DEV_ADMIN_PORT', DEFAULT_PORTS.admin),
    };
    let reset = false;
    let help = false;
    let detached = false;
    let stop = false;
    let solo = false;
    let multi = false;
    let bots = parseBotCount(process.env.PACKETLOSS_DEV_BOTS ?? '2');
    const names = new Map([
        ['--web-port', 'web'],
        ['--api-port', 'api'],
        ['--game-port', 'game'],
        ['--admin-port', 'admin'],
    ]);
    for (let index = 0; index < arguments_.length; index += 1) {
        const argument = arguments_[index];
        if (argument === '--') continue;
        if (argument === '--detach') {
            detached = true;
            continue;
        }
        if (argument === '--stop') {
            stop = true;
            continue;
        }
        if (argument === '--reset') {
            reset = true;
            continue;
        }
        if (argument === '--solo') {
            solo = true;
            continue;
        }
        if (argument === '--multi') {
            multi = true;
            continue;
        }
        if (argument === '--help' || argument === '-h') {
            help = true;
            continue;
        }
        const [flag, inline] = argument.split('=', 2);
        if (flag === '--bots') {
            bots = parseBotCount(inline ?? arguments_[++index]);
            continue;
        }
        const name = names.get(flag);
        if (!name) throw new Error(`Unknown option: ${argument}`);
        const raw = inline ?? arguments_[++index];
        if (!raw) throw new Error(`${flag} requires a port.`);
        ports[name] = parsePort(raw, flag);
    }
    if (new Set(Object.values(ports)).size !== Object.keys(ports).length) {
        throw new Error('Development services must use four distinct ports.');
    }
    if (multi && solo) throw new Error('--multi and --solo cannot be combined.');
    if (multi && bots === 0) throw new Error('--multi requires at least one bot.');
    if (solo) bots = 0;
    return { ports, bots, solo, multi, reset, help, detached, stop };
}

/** Runs the Docker stack without requiring host Node 24 or AWS credentials. */
async function main() {
    const options = parseOptions(process.argv.slice(2));
    if (options.help) {
        console.log(helpText());
        return;
    }
    process.chdir(ROOT);
    const compose = composeCommand();
    if (spawnSync('docker', ['info'], { stdio: 'ignore' }).status !== 0) {
        throw new Error(
            'Docker is not running. Start Docker Desktop or run: colima start --cpu 4 --memory 4'
        );
    }
    const directory = join(ROOT, '.packetloss-dev');
    const data = join(directory, 'data');
    const envFile = join(directory, 'compose.env');
    const arguments_ = [...compose.args, '--env-file', envFile, '-f', 'compose.dev.yml'];
    if (options.stop) {
        await run(compose.command, [...arguments_, 'down']);
        return;
    }
    await mkdir(data, { recursive: true, mode: 0o700 });
    // Stop this project's previous containers, never other Docker workloads.
    if (await readFile(envFile, 'utf8').catch(() => '')) {
        await run(compose.command, [...arguments_, 'down']);
    }
    await checkPorts(Object.values(options.ports));
    if (options.reset) {
        await rm(data, { recursive: true, force: true });
        await mkdir(data, { recursive: true, mode: 0o700 });
    }
    const environment = {
        PACKETLOSS_DEV_AUTH_KEY: await persistentSecret(join(data, 'auth.key')),
        PACKETLOSS_DEV_INTERNAL_TOKEN: randomBytes(32).toString('hex'),
        PACKETLOSS_DEV_RUN_ID: randomUUID(),
        PACKETLOSS_DEV_PROCESS_GENERATION: randomUUID(),
        PACKETLOSS_DEV_BOTS: String(options.bots),
        PACKETLOSS_DEV_SOLO: options.solo ? '1' : '0',
        PACKETLOSS_DEV_MULTI: options.multi ? '1' : '0',
        ...Object.fromEntries(
            Object.entries(options.ports).map(([name, port]) => [
                `PACKETLOSS_DEV_${name.toUpperCase()}_PORT`,
                String(port),
            ])
        ),
    };
    await writeFile(
        envFile,
        Object.entries(environment)
            .map(([key, value]) => `${key}=${value}\n`)
            .join(''),
        { mode: 0o600 }
    );
    await chmod(envFile, 0o600);
    if (options.reset) await run(compose.command, [...arguments_, 'down', '--volumes']);
    const lifecycle = new AbortController();
    const stop = () => lifecycle.abort();
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    let ready = false;
    try {
        await run(
            compose.command,
            [...arguments_, 'up', '--build', '--detach', '--wait', '--wait-timeout', '180'],
            lifecycle.signal
        );
        const url = `http://127.0.0.1:${options.ports.web}`;
        await waitFor(url, 30000, lifecycle.signal);
        ready = true;
        console.log(`\nPACKETLOSS ready at ${url}${options.multi ? '' : ' — enter a name and Play as guest.'}`);
        console.log(
            'DynamoDB Local + Node 22 Lambda emulators + Node 24 game server. Multiplayer is ready automatically.'
        );
        console.log('Seed login: owner@packetloss.local / packetloss-dev. Recovery code: 000000.');
        console.log(options.multi
            ? `Instant Battle Royale: ${options.bots} bots, a fresh match on every refresh. Press C to close the next wall.`
            : options.solo
            ? 'Solo Battle Royale: create a room to start immediately without bots or saved results.'
            : `Local bots: ${options.bots}. Create a room; bots join and ready automatically. You start the match.`);
        console.log('Code reloads automatically: frontend, game server, gateway, and Node Lambdas. Game reloads interrupt local matches.');
        console.log('Data persists between runs. Stop: pnpm dev:full -- --stop');
        if (!options.detached) {
            await run(
                compose.command,
                [...arguments_, 'logs', '--follow', '--tail', '20'],
                lifecycle.signal
            );
        }
    } catch (error) {
        if (!lifecycle.signal.aborted) {
            await run(compose.command, [...arguments_, 'logs', '--tail', '30']).catch(
                () => undefined
            );
            throw error;
        }
    } finally {
        if (!ready || !options.detached || lifecycle.signal.aborted) {
            await run(compose.command, [...arguments_, 'down']);
        }
        process.off('SIGINT', stop);
        process.off('SIGTERM', stop);
    }
}

/** Finds either the Docker plugin or the Homebrew standalone Compose installation. */
function composeCommand() {
    if (spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' }).status === 0) {
        return { command: 'docker', args: ['compose'] };
    }
    if (spawnSync('docker-compose', ['version'], { stdio: 'ignore' }).status === 0) {
        return { command: 'docker-compose', args: [] };
    }
    throw new Error('Docker Compose is required. Install Docker Desktop or docker-compose.');
}

/** Makes the generated env file authoritative for this project's runtime identity. */
function composeEnvironment() {
    return Object.fromEntries(
        Object.entries(process.env).filter(([name]) => !name.startsWith('PACKETLOSS_DEV_'))
    );
}

/** Executes a finite local Compose command without involving a shell. */
function run(command, args, signal) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', signal, env: composeEnvironment() });
        child.once('error', reject);
        child.once('exit', (code) =>
            code === 0
                ? resolve()
                : reject(
                      new Error(
                          `Docker Compose exited with ${code}. Inspect: docker compose --env-file .packetloss-dev/compose.env -f compose.dev.yml logs`
                      )
                  )
        );
    });
}

/** Waits for the published frontend after Compose has checked backend readiness. */
export async function waitFor(url, timeoutMs, signal) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        signal?.throwIfAborted();
        try {
            if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return;
        } catch {
            /* The published port may still be settling. */
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
    }
    throw new Error(`The frontend did not become ready at ${url}.`);
}

/** Allows Docker's VM port forwarding to settle after stopping the previous stack. */
async function checkPorts(ports) {
    await Promise.all(
        ports.map(async (port) => {
            const deadline = Date.now() + 10000;
            for (;;) {
                try {
                    await new Promise((resolvePromise, reject) => {
                        const server = createServer();
                        server.unref();
                        server.once('error', reject);
                        server.listen(port, LOOPBACK, () => server.close(resolvePromise));
                    });
                    return;
                } catch (error) {
                    if (error?.code !== 'EADDRINUSE' || Date.now() >= deadline) {
                        throw new Error(`Port ${port} is unavailable: ${error.message}`);
                    }
                    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
                }
            }
        })
    );
}

/** Reads or creates the persistent key that keeps local refresh cookies usable after restart. */
async function persistentSecret(path) {
    const existing = await readFile(path, 'utf8').catch(() => '');
    if (existing.trim().length >= 64) return existing.trim();
    const secret = randomBytes(32).toString('hex');
    try {
        await writeFile(path, `${secret}\n`, { flag: 'wx', mode: 0o600 });
        return secret;
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
            const raced = (await readFile(path, 'utf8')).trim();
            if (raced.length >= 64) return raced;
        }
        throw error;
    } finally {
        await chmod(path, 0o600).catch(() => undefined);
    }
}

/** Reads one optional port override from the environment. */
function environmentPort(name, fallback) {
    return process.env[name] === undefined ? fallback : parsePort(process.env[name], name);
}

/** Parses one TCP port in the non-privileged range. */
function parsePort(raw, name) {
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1024 || value > 65535) {
        throw new Error(`${name} must be an integer from 1024 through 65535.`);
    }
    return value;
}

/** Bounds automatic local opponents, including zero for manual multi-client tests. */
function parseBotCount(raw) {
    if (!/^[0-3]$/.test(raw ?? '')) throw new Error('--bots must be an integer from 0 through 3.');
    return Number(raw);
}

/** Returns stable launcher help for terminal display and focused tests. */
export function helpText() {
    return (
        `Usage: pnpm dev:full -- [options]\n\n` +
        `  --web-port PORT   Vite port (default ${DEFAULT_PORTS.web})\n` +
        `  --api-port PORT   Local API port (default ${DEFAULT_PORTS.api})\n` +
        `  --game-port PORT  Game HTTP/WebSocket port (default ${DEFAULT_PORTS.game})\n` +
        `  --admin-port PORT Game admin port (default ${DEFAULT_PORTS.admin})\n` +
        `  --bots COUNT      Automatic local opponents, 0–3 (default 2; 0 disables)\n` +
        `  --solo            Start new rooms immediately with one player and no bots\n` +
        `  --multi           Skip menus, start with bots, reset on refresh; C closes the next wall\n` +
        `  --reset           Clear persistent local accounts, records, results, and auth state\n` +
        `  --detach          Leave the Docker stack running in the background\n` +
        `  --stop            Stop containers, retaining database and outbox\n` +
        `  --help            Show this help`
    );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    void main().catch((error) => {
        console.error(error instanceof Error ? error.message : 'Local development failed.');
        process.exitCode = 1;
    });
}
