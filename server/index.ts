import { readFile } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import { fileURLToPath } from 'node:url';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { raceMapSchema } from '../src/game/protocol/messages';
import { createGameServer } from './httpServer';
import { RoomService } from './RoomService';
import { DynamoAdapters } from './DynamoAdapters';

/** Starts the packaged backend with explicit credentials supplied by its host service. */
export async function main(): Promise<void> {
  const map = raceMapSchema.parse(JSON.parse(await readFile(new URL('./map.json', import.meta.url), 'utf8')) as unknown);
  const adminToken = process.env.GAME_ADMIN_TOKEN;
  const allowedOrigins = process.env.GAME_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean);
  const controlTable = process.env.GAME_CONTROL_TABLE, ticketsTable = process.env.GAME_TICKETS_TABLE;
  const resultsTable = process.env.GAME_RESULTS_TABLE, instanceId = process.env.GAME_INSTANCE_ID;
  const instanceRunId = process.env.GAME_INSTANCE_RUN_ID, region = process.env.GAME_REGION;
  if (!adminToken || !allowedOrigins?.length || !controlTable || !ticketsTable || !resultsTable
    || !instanceId || !instanceRunId || region !== 'eu' && region !== 'na') throw new Error('Game table, instance, region, admin, and origin configuration is required.');
  const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1', maxAttempts: 2 });
  const processGeneration = randomUUID();
  const adapters = new DynamoAdapters({ client, controlTable, ticketsTable, resultsTable, instanceId,
    instanceRunId, processGeneration, region,
    outboxDirectory: process.env.GAME_OUTBOX_DIR ?? '/var/lib/packetloss/results' });
  const claim = await adapters.claim();
  await adapters.recover();
  const rooms = new RoomService({ map, results: adapters, now: () => performance.now(), epochNow: () => Date.now(),
    snapshotHz: Number(process.env.GAME_SNAPSHOT_HZ ?? 20), instanceRunId, processGeneration,
    randomId: randomUUID, randomSeed: () => randomBytes(4).readUInt32LE(), randomCode: () => {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      return [...randomBytes(6)].map((value) => alphabet[value % alphabet.length]).join('');
    } });
  if (claim.draining) rooms.drain();
  const game = createGameServer({ rooms, tickets: adapters, allowedOrigins, adminToken, instanceRunId, processGeneration,
    onResume: () => adapters.resume(),
    maximumUptimeMs: Math.max(0, claim.deadline - Date.now()) });
  try {
    await Promise.all([
      listen(game.server, Number(process.env.PORT ?? 8080), process.env.HOST ?? '127.0.0.1'),
      listen(game.adminServer, Number(process.env.ADMIN_PORT ?? 8081), '127.0.0.1'),
    ]);
    await adapters.heartbeat(rooms.status());
  } catch (error) {
    game.dispose(); client.destroy(); throw error;
  }
  let heartbeatPending = false;
  const heartbeat = setInterval(() => {
    if (heartbeatPending) return;
    heartbeatPending = true;
    void adapters.heartbeat(rooms.status()).then(() => rooms.setControlHealthy(true), async (error: unknown) => {
      rooms.setControlHealthy(false);
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        try {
          const ownership = await adapters.ownership();
          if (ownership === 'draining') rooms.drain();
          else if (ownership === 'lost') rooms.abortAll('ownership_lost');
        } catch { /* A failed ownership read keeps admission closed until the next heartbeat. */ }
      }
    }).finally(() => { heartbeatPending = false; });
  }, 5000);
  process.on('SIGTERM', () => { clearInterval(heartbeat); game.dispose(); client.destroy(); });
  process.on('SIGINT', () => { clearInterval(heartbeat); game.dispose(); client.destroy(); });
}

/** Resolves only after the socket is bound, so central readiness never precedes local listeners. */
function listen(server: Server, port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const failed = (error: Error): void => { reject(error); };
    server.once('error', failed);
    server.listen(port, host, () => { server.off('error', failed); resolve(); });
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Game server startup failed.'); process.exitCode = 1;
});
