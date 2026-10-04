import { afterEach, describe, expect, it } from 'vitest';
import { helpText, parseOptions } from './dev-full.mjs';

const portEnvironment = [
    'PACKETLOSS_DEV_WEB_PORT',
    'PACKETLOSS_DEV_API_PORT',
    'PACKETLOSS_DEV_GAME_PORT',
    'PACKETLOSS_DEV_ADMIN_PORT',
    'PACKETLOSS_DEV_BOTS',
];
const original = Object.fromEntries(portEnvironment.map((name) => [name, process.env[name]]));

afterEach(() => {
    for (const name of portEnvironment) {
        const value = original[name];
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
    }
});

describe('complete development launcher options', () => {
    it('uses distinct loopback service defaults without starting a process', () => {
        portEnvironment.forEach((name) => delete process.env[name]);
        expect(parseOptions([])).toEqual({
            ports: { web: 5173, api: 8787, game: 8080, admin: 8081 },
            bots: 2,
            solo: false,
            reset: false,
            help: false,
            detached: false,
            stop: false,
        });
    });

    it('accepts pnpm separators, explicit ports, and the destructive reset flag', () => {
        expect(
            parseOptions([
                '--',
                '--web-port',
                '6001',
                '--api-port=6002',
                '--game-port',
                '6003',
                '--admin-port=6004',
                '--reset',
            ])
        ).toEqual({
            ports: { web: 6001, api: 6002, game: 6003, admin: 6004 },
            bots: 2,
            solo: false,
            reset: true,
            help: false,
            detached: false,
            stop: false,
        });
    });

    it('rejects invalid, duplicate, and unknown service options before setup', () => {
        expect(() => parseOptions(['--web-port', '80'])).toThrow('1024 through 65535');
        expect(() => parseOptions(['--web-port', '8080', '--game-port', '8080'])).toThrow(
            'four distinct ports'
        );
        expect(() => parseOptions(['--open'])).toThrow('Unknown option');
    });

    it('documents every local process and the explicit data reset', () => {
        expect(helpText()).toContain('--web-port');
        expect(helpText()).toContain('--api-port');
        expect(helpText()).toContain('--game-port');
        expect(helpText()).toContain('--admin-port');
        expect(helpText()).toContain('--solo');
        expect(helpText()).toContain('--reset');
    });

    it('supports persistent background runs and stopping without resetting data', () => {
        expect(parseOptions(['--detach']).detached).toBe(true);
        expect(parseOptions(['--stop'])).toMatchObject({ stop: true, reset: false });
    });

    it('allows disabling or filling local opponents and rejects invalid counts', () => {
        expect(parseOptions(['--bots', '0']).bots).toBe(0);
        expect(parseOptions(['--bots=3']).bots).toBe(3);
        process.env.PACKETLOSS_DEV_BOTS = '1';
        expect(parseOptions([]).bots).toBe(1);
        expect(() => parseOptions(['--bots', '4'])).toThrow('0 through 3');
        expect(() => parseOptions(['--bots', '-1'])).toThrow('0 through 3');
        expect(() => parseOptions(['--bots'])).toThrow('0 through 3');
    });

    it('forces bots off for instant solo rooms regardless of option order', () => {
        expect(parseOptions(['--solo'])).toMatchObject({ solo: true, bots: 0 });
        expect(parseOptions(['--bots=3', '--solo'])).toMatchObject({ solo: true, bots: 0 });
        expect(parseOptions(['--solo', '--bots=3'])).toMatchObject({ solo: true, bots: 0 });
    });
});
