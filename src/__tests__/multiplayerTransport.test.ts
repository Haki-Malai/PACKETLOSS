import { afterEach, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';
import { createGameServer } from '../../server/httpServer';
import { localBrowserOrigins } from '../../server/dev';
import { MemoryResultStore, MemoryTickets, RoomService } from '../../server/RoomService';
import { parseServerMessage, PROTOCOL_VERSION } from '../game/protocol/messages';
import { dataRaceFixture } from './fixtures/dataRaceFixture';

const disposers: (() => void)[] = [];
afterEach(() => { disposers.splice(0).forEach((dispose) => dispose()); });

/** Starts only an ephemeral loopback transport for protocol integration tests. */
async function fixture(allowedOrigins = ['https://game.example']) {
  const tickets = new MemoryTickets(() => Date.now());
  const rooms = new RoomService({ map: dataRaceFixture(), results: new MemoryResultStore(), now: () => performance.now(),
    epochNow: () => Date.now(), randomId: () => 'match', randomCode: () => 'ABC234', randomSeed: () => 1 });
  const game = createGameServer({ rooms, tickets, allowedOrigins, adminToken: 'x'.repeat(32),
    instanceRunId: 'run', processGeneration: 'process' });
  const clients: WebSocket[] = [];
  disposers.push(() => { clients.forEach((client) => client.terminate()); game.dispose(); });
  await new Promise<void>((resolve, reject) => { game.server.once('error', reject); game.server.listen(0, '127.0.0.1', resolve); });
  const port = (game.server.address() as AddressInfo).port;
  /** Opens a real WebSocket with a browser-equivalent explicit Origin. */
  const connect = (origin = 'https://game.example'): Promise<WebSocket> => new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:${port}/ws`, { origin }); clients.push(socket);
    socket.once('open', () => resolve(socket)); socket.on('error', reject);
  });
  /** Issues a short-lived server-side fixture ticket and consumes it over the real transport. */
  const authenticate = async (socket: WebSocket, ticket: string): Promise<ReturnType<typeof parseServerMessage>> => {
    tickets.issue(ticket, { playerId: 'alice', name: 'Alice', operation: 'create' }, Date.now() + 30000);
    const response = new Promise<ReturnType<typeof parseServerMessage>>((resolve) => {
      socket.once('message', (data: unknown) => resolve(Buffer.isBuffer(data) ? parseServerMessage(data.toString('utf8')) : null));
    });
    socket.send(JSON.stringify({ type: 'authenticate', version: PROTOCOL_VERSION, ticket }));
    return response;
  };
  return { tickets, connect, authenticate };
}

describe('game WebSocket transport', () => {
  it('accepts both development browser aliases while rejecting an unrelated origin', async () => {
    const game = await fixture(localBrowserOrigins('http://127.0.0.1:5173'));
    const socket = await game.connect('http://localhost:5173');
    expect(await game.authenticate(socket, 'local-ticket')).toMatchObject({ playerId: 'alice' });
    expect((await game.connect('http://127.0.0.1:5173')).readyState).toBe(WebSocket.OPEN);
    await expect(game.connect('http://localhost:5174')).rejects.toThrow('403');
    await expect(game.connect('https://foreign.example')).rejects.toThrow('403');
  });

  it('rejects a foreign Origin and any gameplay message before authentication', async () => {
    const game = await fixture();
    await expect(game.connect('https://foreign.example')).rejects.toThrow('403');
    const socket = await game.connect();
    const closed = new Promise<number>((resolve) => socket.once('close', resolve));
    socket.send(JSON.stringify({ type: 'create' })); expect(await closed).toBe(4401);
  });

  it('binds the process generation and rejects a second healthy authenticated socket for one account', async () => {
    const game = await fixture(), first = await game.connect();
    expect(await game.authenticate(first, 'first')).toMatchObject({ type: 'authenticated', playerId: 'alice',
      instanceRunId: 'run', processGeneration: 'process' });
    const second = await game.connect();
    game.tickets.issue('second', { playerId: 'alice', name: 'Alice', operation: 'create' }, Date.now() + 30000);
    const closed = new Promise<number>((resolve) => second.once('close', resolve));
    second.send(JSON.stringify({ type: 'authenticate', version: PROTOCOL_VERSION, ticket: 'second' }));
    expect(await closed).toBe(4409); expect(first.readyState).toBe(WebSocket.OPEN);
  });

  it('closes an authenticated connection that exceeds its input budget', async () => {
    const game = await fixture(), socket = await game.connect(); await game.authenticate(socket, 'input-ticket');
    const closed = new Promise<number>((resolve) => socket.once('close', resolve));
    for (let count = 0; count < 200; count += 1) socket.send(JSON.stringify({ type: 'ping', sentAt: count }));
    expect(await closed).toBe(4408);
  });
});
