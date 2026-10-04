import { createServer } from 'node:http';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { freemem } from 'node:os';
import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';
import { parseClientMessage, PROTOCOL_VERSION } from '../src/game/protocol/messages';
import { RACE, SYNCHRONIZATION } from '../src/game/simulation/types';
import { SnapshotSender } from './SnapshotSender';
import { RoomService, type AuthenticatedPlayer, type TicketConsumer } from './RoomService';

export interface GameServerOptions {
  rooms: RoomService;
  tickets: TicketConsumer;
  allowedOrigins: readonly string[];
  adminToken: string;
  instanceRunId: string;
  processGeneration: string;
  maximumUptimeMs?: number;
  now?: () => number;
  onResume?: () => Promise<void>;
}

/** Creates HTTP/WS routing without opening a listener; HTTPS terminates at the host proxy. */
export function createGameServer(options: GameServerOptions) {
  if (options.adminToken.length < 32 || options.allowedOrigins.length === 0) throw new Error('Admin token and allowed origins are required.');
  const now = options.now ?? (() => performance.now());
  const started = now();
  const maximumUptimeMs = options.maximumUptimeMs ?? 4 * 60 * 60 * 1000;
  const latestSafeStartMs = 1000 + (RACE.countdownTicks + RACE.matchTicks) * RACE.stepMs;
  if (maximumUptimeMs <= latestSafeStartMs) options.rooms.drain();
  const simulationWorkSamples: number[] = [];
  let simulationWorkCursor = 0;
  let maximumSimulationWorkMs = 0;
  let coalescedSnapshots = 0;
  /** Returns local-only operational and simulation benchmark measurements. */
  const diagnostics = () => {
    const ordered = [...simulationWorkSamples].sort((a, b) => a - b);
    const percentile = ordered.length ? ordered[Math.max(0, Math.ceil(ordered.length * 0.99) - 1)] : 0;
    const memory = process.memoryUsage();
    return { ...options.rooms.status(), simulationWorkP99Ms: percentile,
      maximumSimulationWorkMs, coalescedSnapshots, simulationWorkSamples: ordered.length,
      residentSetBytes: memory.rss, heapUsedBytes: memory.heapUsed,
      memoryAvailableBytes: availableMemoryBytes(),
      uptimeRemainingMs: Math.max(0, maximumUptimeMs - (now() - started)) };
  };
  const app = express();
  const adminApp = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '4kb' }));
  app.get('/health', (_request, response) => { response.json({ healthy: true }); });
  app.get('/ready', (_request, response) => {
    const status = options.rooms.status(); response.status(status.ready ? 200 : 503).json({ ready: status.ready });
  });
  adminApp.use('/internal', (request, response, next) => {
    const expected = Buffer.from(`Bearer ${options.adminToken}`), actual = Buffer.from(request.headers.authorization ?? '');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) { response.sendStatus(401); return; }
    next();
  });
  adminApp.get('/internal/status', (_request, response) => { response.json(diagnostics()); });
  adminApp.post('/internal/drain', (_request, response) => { options.rooms.drain(); response.json(diagnostics()); });
  adminApp.post('/internal/resume', async (_request, response) => {
    try { await options.onResume?.(); options.rooms.resume(); response.json(diagnostics()); }
    catch { options.rooms.drain(); response.status(503).json({ error: 'Server remains unhealthy.' }); }
  });
  adminApp.post('/internal/abort', (_request, response) => { options.rooms.abortAll('operator_stop'); response.json(diagnostics()); });
  const server = createServer(app);
  const adminServer = createServer(adminApp);
  const sockets = new WebSocketServer({ noServer: true, maxPayload: 8192, perMessageDeflate: false });
  const authenticatedPeers = new Map<string, WebSocket>();
  const upgrades = new Map<string, { at: number; count: number }>();
  server.on('upgrade', (request, socket, head) => {
    const address = request.socket.remoteAddress ?? 'unknown';
    const record = upgrades.get(address);
    const rate = record && now() - record.at < 10000 ? record : { at: now(), count: 0 };
    rate.count += 1; upgrades.set(address, rate);
    if (request.url !== '/ws' || !options.allowedOrigins.includes(request.headers.origin ?? '')
      || rate.count > 20 || sockets.clients.size >= 32) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); socket.destroy(); return;
    }
    sockets.handleUpgrade(request, socket, head, (connection) => sockets.emit('connection', connection, request));
  });
  sockets.on('connection', (socket) => {
    const peerId = randomUUID();
    let identity: AuthenticatedPlayer | null = null;
    let authenticating = false;
    let lastPong = now();
    let budget = 90;
    let lastRefill = now();
    const authTimeout = setTimeout(() => socket.close(4401, 'Authentication timeout'), 5000);
    const sender = new SnapshotSender(socket, now, () => { coalescedSnapshots += 1; });
    const send = sender.send.bind(sender);
    const heartbeat = setInterval(() => {
      sender.check();
      if (now() - lastPong >= SYNCHRONIZATION.timeoutMs) { socket.terminate(); return; }
      socket.ping();
    }, SYNCHRONIZATION.heartbeatMs);
    socket.on('pong', () => { lastPong = now(); });
    socket.on('message', (data, binary) => {
      const current = now(); budget = Math.min(90, budget + (current - lastRefill) * 60 / 1000); lastRefill = current;
      if (binary || budget < 1) { socket.close(4408, 'Invalid frame or excessive input'); return; }
      budget -= 1;
      const text = Buffer.isBuffer(data) ? data.toString('utf8')
        : data instanceof ArrayBuffer ? Buffer.from(data).toString('utf8')
          : Buffer.concat(data).toString('utf8');
      const message = parseClientMessage(text);
      if (!message) { socket.close(4400, 'Invalid protocol message'); return; }
      if (!identity) {
        if (message.type !== 'authenticate' || authenticating) { socket.close(4401, 'Authenticate first'); return; }
        authenticating = true;
        void options.tickets.consume(message.ticket).then((authenticated) => {
          if (socket.readyState !== WebSocket.OPEN) return;
          if (!authenticated || authenticated.name.length > 32) { socket.close(4401, 'Invalid or expired ticket'); return; }
          const existing = authenticatedPeers.get(authenticated.playerId);
          if (existing?.readyState === WebSocket.OPEN) { socket.close(4409, 'Account already connected'); return; }
          identity = authenticated; clearTimeout(authTimeout);
          authenticatedPeers.set(identity.playerId, socket);
          send({ type: 'authenticated', version: PROTOCOL_VERSION, playerId: identity.playerId,
            instanceRunId: options.instanceRunId, processGeneration: options.processGeneration });
        }, () => { socket.close(4503, 'Authentication unavailable'); });
        return;
      }
      options.rooms.handle(peerId, identity, message, send);
    });
    socket.on('error', () => { socket.terminate(); });
    socket.on('close', () => {
      clearTimeout(authTimeout); clearInterval(heartbeat); sender.dispose();
      if (identity) options.rooms.disconnect(peerId, identity.playerId);
      if (identity && authenticatedPeers.get(identity.playerId) === socket) authenticatedPeers.delete(identity.playerId);
    });
  });
  let warningStage = 0;
  let uptimeExpired = false;
  const warnings = [900000, 300000, 60000];
  const timer = setInterval(() => {
    const active = options.rooms.status().activeMatches > 0;
    const workStarted = performance.now();
    options.rooms.pump();
    if (active) {
      const work = performance.now() - workStarted;
      maximumSimulationWorkMs = Math.max(maximumSimulationWorkMs, work);
      if (simulationWorkSamples.length < 3600) simulationWorkSamples.push(work);
      else {
        simulationWorkSamples[simulationWorkCursor] = work;
        simulationWorkCursor = (simulationWorkCursor + 1) % simulationWorkSamples.length;
      }
    }
    const remaining = Math.max(0, maximumUptimeMs - (now() - started));
    if (remaining <= latestSafeStartMs) options.rooms.drain();
    if (warningStage < warnings.length && remaining <= warnings[warningStage]) {
      options.rooms.warn('shutdown', remaining); warningStage += 1;
    }
    if (remaining === 0 && !uptimeExpired) { uptimeExpired = true; options.rooms.abortAll('maximum_uptime'); }
    for (const [address, rate] of upgrades) if (now() - rate.at > 10000) upgrades.delete(address);
  }, 1000 / 60);
  timer.unref();
  /** Stops accepting work and releases all timers and connections during process teardown. */
  const dispose = (): void => {
    clearInterval(timer); options.rooms.drain();
    sockets.clients.forEach((socket) => socket.terminate());
    sockets.close(); server.close(); adminServer.close();
  };
  return { app, server, adminServer, dispose };
}

/** Reads Linux reclaimable headroom for Graviton benchmarks, with a portable local fallback. */
function availableMemoryBytes(): number {
  try {
    const value = /^MemAvailable:\s+(\d+)\s+kB$/m.exec(readFileSync('/proc/meminfo', 'utf8'))?.[1];
    if (value) return Number(value) * 1024;
  } catch { /* Local development may not expose Linux procfs. */ }
  return freemem();
}
