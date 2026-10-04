import { describe, expect, it, vi } from 'vitest';
import { SnapshotSender } from '../../server/SnapshotSender';
import { encodeRaceSnapshot, type ServerMessage } from '../game/protocol/messages';
import { DataRace } from '../game/simulation/DataRace';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

/** Captures writes without draining so congestion and barrier ordering are observable. */
function sender() {
  let now = 0;
  const written: ServerMessage[] = [];
  const callbacks: Array<(_error?: Error) => void> = [];
  const socket = { readyState: 1, bufferedAmount: 0, close: vi.fn(),
    send: (raw: string, callback: (_error?: Error) => void) => {
      written.push(JSON.parse(raw) as ServerMessage); callbacks.push(callback);
    } };
  const coalesced = vi.fn();
  return { socket, written, coalesced, advance: (ms: number) => { now += ms; },
    drain: () => callbacks.shift()?.(), sender: new SnapshotSender(socket, () => now, coalesced) };
}
const map = dataRaceFixture();
const race = new DataRace(map, 'outbound', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
/** Builds independent authoritative publications; replacing one never invalidates the next. */
function snapshot(publication: number): ServerMessage {
  return { type: 'snapshot', publication, snapshot: encodeRaceSnapshot(map, race.snapshot()), serverTimeMs: 0,
    instanceRunId: 'run', processGeneration: 'process' };
}

describe('snapshot backpressure', () => {
  it('sends only the newest unsent state after congestion clears', () => {
    const h = sender();
    h.sender.send(snapshot(1));
    for (let index = 2; index <= 30; index += 1) h.sender.send(snapshot(index));
    expect(h.written).toEqual([snapshot(1)]);
    h.drain();
    expect(h.written).toEqual([snapshot(1), snapshot(30)]);
    expect(h.coalesced).toHaveBeenCalledTimes(28);
  });

  it('retains map/control/terminal order and discards pending previous-map movement', () => {
    const h = sender();
    h.sender.send({ type: 'map', map });
    h.sender.send(snapshot(1)); h.sender.send(snapshot(2));
    const warning = { type: 'warning', reason: 'deployment', remainingMs: 1000 } as const;
    h.sender.send(warning);
    const terminal = snapshot(3);
    if (terminal.type !== 'snapshot') throw new Error('Expected snapshot');
    terminal.snapshot.phase = 'finished'; terminal.snapshot.movementEnabled = false;
    h.sender.send(terminal);
    h.sender.send({ type: 'map', map: { ...map, id: 'next' } });
    for (let index = 0; index < 4; index += 1) h.drain();
    expect(h.written).toEqual([{ type: 'map', map }, warning, terminal, { type: 'map', map: { ...map, id: 'next' } }]);
  });

  it('closes after five seconds without progress and ignores late callbacks after disposal', () => {
    const h = sender();
    h.sender.send(snapshot(1)); h.sender.send(snapshot(2));
    h.advance(4999); h.sender.check(); expect(h.socket.close).not.toHaveBeenCalled();
    h.advance(1); h.sender.check(); expect(h.socket.close).toHaveBeenCalledExactlyOnceWith(4408, 'Client too slow');
    h.drain();
    expect(h.written).toHaveLength(1);
  });
});
