import { describe, expect, it } from 'vitest';
import {
    decodeRaceSnapshot,
    encodeRaceSnapshot,
    parseClientMessage,
    parseServerMessage,
    PROTOCOL_VERSION,
} from '../game/protocol/messages';
import { createBattleArenaMap } from '../game/simulation/BattleArenaMap';
import { DataRace } from '../game/simulation/DataRace';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const generatedArena = createBattleArenaMap(7);

describe('multiplayer protocol validation', () => {
    it('rejects earlier peers before incompatible arena snapshots can enter a session', () => {
    const authenticate = { type: 'authenticate', version: PROTOCOL_VERSION, ticket: 'ticket' };
        const authenticated = {
            type: 'authenticated',
            version: PROTOCOL_VERSION,
            playerId: 'player',
            instanceRunId: 'run',
            processGeneration: 'generation',
        };
    expect(parseClientMessage(JSON.stringify(authenticate))).toEqual(authenticate);
    expect(parseServerMessage(JSON.stringify(authenticated))).toEqual(authenticated);
        for (const version of [1, 2, 3, 4, 5, 6, 7, 8]) {
            expect(parseClientMessage(JSON.stringify({ ...authenticate, version }))).toBeNull();
            expect(parseServerMessage(JSON.stringify({ ...authenticated, version }))).toBeNull();
        }
    });

    it('strictly validates generated arena metadata before accepting a map', () => {
        expect(parseServerMessage(JSON.stringify({ type: 'map', map: generatedArena }))).toEqual({
            type: 'map',
            map: generatedArena,
        });
        expect(
            parseServerMessage(
                JSON.stringify({
                    type: 'map',
                    map: { ...generatedArena, arena: { ...generatedArena.arena, version: 1 } },
                })
            )
        ).toBeNull();
        expect(
            parseServerMessage(
                JSON.stringify({
                    type: 'map',
                    map: { ...generatedArena, arena: { ...generatedArena.arena, extra: true } },
                })
            )
        ).toBeNull();
  });

  it('delivers an enemy-free authoritative snapshot through wire validation and reconstruction', () => {
    const map = dataRaceFixture();
        const race = new DataRace(
            map,
            'no-enemies',
            [
                { id: 'alice', name: 'Alice' },
                { id: 'bob', name: 'Bob' },
            ],
            4
        );
    const snapshot = race.snapshot();
    expect(snapshot.enemies).toEqual([]);
        const message = parseServerMessage(
            JSON.stringify({
                type: 'snapshot', publication: 1,
                snapshot: encodeRaceSnapshot(map, snapshot),
                serverTimeMs: 1000,
                instanceRunId: 'run',
                processGeneration: 'process',
            })
        );
        const reconstructed =
            message?.type === 'snapshot' ? decodeRaceSnapshot(map, message.snapshot) : null;
    expect(reconstructed).toEqual(snapshot);
  });

    it('round-trips a development solo snapshot without weakening the four-player maximum', () => {
        const map = dataRaceFixture();
        const race = new DataRace(
            map,
            'solo-practice',
            [{ id: 'alice', name: 'Alice' }],
            4,
            0,
            true
        );
        const snapshot = race.snapshot();
        const message = parseServerMessage(
            JSON.stringify({
                type: 'snapshot', publication: 1,
                snapshot: encodeRaceSnapshot(map, snapshot),
                serverTimeMs: 1000,
                instanceRunId: 'run',
                processGeneration: 'process',
            })
        );
        expect(
            message?.type === 'snapshot' ? decodeRaceSnapshot(map, message.snapshot) : null
        ).toEqual(snapshot);
    });

  it('accepts only sequenced direction/boost intent, rejecting forged authority and malformed payloads', () => {
    const input = { type: 'input', matchId: 'match', sequence: 1, targetTick: 12, direction: 'left' };
    expect(parseClientMessage(JSON.stringify(input))).toEqual(input);
    for (const boost of ['press', 'release', 'cancel']) {
      const command = { type: 'input', matchId: 'match', sequence: 2, targetTick: 12, boost };
      expect(parseClientMessage(JSON.stringify(command))).toEqual(command);
      expect(parseClientMessage(JSON.stringify({ ...input, boost }))).toEqual({ ...input, boost });
    }
        for (const forged of [
            { ...input, score: 99 },
            { ...input, x: 4 },
            { ...input, huntMs: 9999 },
            { ...input, sequence: 1.5 },
            { ...input, sequence: -1 },
            { ...input, targetTick: -1 },
            { ...input, targetTick: 1.5 },
            { ...input, targetTick: undefined },
            { ...input, direction: 'teleport' },
            { ...input, boost: 'teleport' },
            { ...input, direction: undefined },
            { ...input, boosting: true },
        ]) {
      expect(parseClientMessage(JSON.stringify(forged))).toBeNull();
    }
    expect(parseClientMessage('{')).toBeNull();
    expect(parseServerMessage('{"type":"snapshot","snapshot":{}}')).toBeNull();
  });

  it('round-trips active boost timers and rejects invalid spending state', () => {
    const map = dataRaceFixture();
    const game = new DataRace(map, 'boost-wire', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 4);
    const funded = game.snapshot();
    funded.players[0].score = 100;
    game.restore(funded);
    game.input(funded.players[0].id, 1, undefined, 1, 'press');
    game.step();
    game.step();
    const snapshot = game.snapshot();
    expect(snapshot.players[0]).toMatchObject({ boostTicks: 5.5, boostCostTicks: 0.5 });
    const envelope = { type: 'snapshot', publication: 1, snapshot: encodeRaceSnapshot(map, snapshot),
      serverTimeMs: 1000, instanceRunId: 'run', processGeneration: 'process' };
    const parsed = parseServerMessage(JSON.stringify(envelope));
    expect(parsed?.type === 'snapshot' && decodeRaceSnapshot(map, parsed.snapshot)).toEqual(snapshot);
    for (const invalid of [{ boostTicks: 8 }, { boostTicks: -1 }, { boostCostTicks: 1.5 }, { boostCostTicks: -0.5 }]) {
      const forged = structuredClone(envelope);
      Object.assign(forged.snapshot.players[0], invalid);
      expect(parseServerMessage(JSON.stringify(forged))).toBeNull();
    }
  });
});
