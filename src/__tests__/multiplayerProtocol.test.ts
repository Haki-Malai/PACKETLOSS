import { describe, expect, it } from 'vitest';
import { decodeRaceSnapshot, encodeRaceSnapshot, parseClientMessage, parseServerMessage, PROTOCOL_VERSION } from '../game/protocol/messages';
import { DataRace } from '../game/simulation/DataRace';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

describe('multiplayer protocol validation', () => {
  it('rejects version-one peers before their incompatible portal movement can enter a session', () => {
    const authenticate = { type: 'authenticate', version: PROTOCOL_VERSION, ticket: 'ticket' };
    const authenticated = { type: 'authenticated', version: PROTOCOL_VERSION, playerId: 'player',
      instanceRunId: 'run', processGeneration: 'generation' };
    expect(parseClientMessage(JSON.stringify(authenticate))).toEqual(authenticate);
    expect(parseServerMessage(JSON.stringify(authenticated))).toEqual(authenticated);
    expect(parseClientMessage(JSON.stringify({ ...authenticate, version: 1 }))).toBeNull();
    expect(parseServerMessage(JSON.stringify({ ...authenticated, version: 1 }))).toBeNull();
  });

  it('delivers an enemy-free authoritative snapshot through wire validation and reconstruction', () => {
    const map = dataRaceFixture();
    const race = new DataRace(map, 'no-enemies', [{ id: 'alice', name: 'Alice' }, { id: 'bob', name: 'Bob' }], 4);
    const snapshot = race.snapshot();
    expect(snapshot.enemies).toEqual([]);
    const message = parseServerMessage(JSON.stringify({ type: 'snapshot',
      snapshot: encodeRaceSnapshot(map, snapshot), serverTimeMs: 1000,
      instanceRunId: 'run', processGeneration: 'process' }));
    const reconstructed = message?.type === 'snapshot' ? decodeRaceSnapshot(map, message.snapshot) : null;
    expect(reconstructed).toEqual(snapshot);
  });

  it('accepts only sequenced direction input, rejecting forged authority and malformed payloads', () => {
    const input = { type: 'input', matchId: 'match', sequence: 1, direction: 'left' };
    expect(parseClientMessage(JSON.stringify(input))).toEqual(input);
    for (const forged of [{ ...input, score: 99 }, { ...input, x: 4 }, { ...input, huntMs: 9999 },
      { ...input, sequence: 1.5 }, { ...input, sequence: -1 }, { ...input, direction: 'teleport' }]) {
      expect(parseClientMessage(JSON.stringify(forged))).toBeNull();
    }
    expect(parseClientMessage('{')).toBeNull();
    expect(parseServerMessage('{"type":"snapshot","snapshot":{}}')).toBeNull();
  });
});
