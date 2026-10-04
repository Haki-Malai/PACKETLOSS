import { randomInt } from 'node:crypto';
import { WebSocket } from 'ws';
import { z } from 'zod';
import {
    decodeRaceSnapshot,
    parseServerMessage,
    PROTOCOL_VERSION,
    type ClientMessage,
    type RoomState,
} from '../src/game/protocol/messages';
import {
    RACE,
    type Direction,
    type RaceMap,
    type RaceSnapshot,
} from '../src/game/simulation/types';
import { movementEdge } from '../src/game/simulation/movement';
import { battleArenaMapAtStage } from '../src/game/simulation/BattleArenaMap';

interface Options {
    count: number;
    apiOrigin: string;
    websocketUrl: string;
    siteOrigin: string;
    rooms: () => RoomState[];
}
interface Player {
    name: string;
    roomCode: string;
    id: string | null;
    token: string | null;
    socket: WebSocket | null;
    map: RaceMap | null;
    snapshot: RaceSnapshot | null;
    snapshotAt: number;
    sequence: number;
    nextInput: number;
    readyPending: boolean;
    retryAt: number;
}
const accessSchema = z.object({ accessToken: z.string().min(1) });
const ticketSchema = z.object({ ticket: z.string().min(1), processGeneration: z.string().min(1) });
const NAMES = ['Pixel', 'Byte', 'Ping', 'Echo', 'Glitch', 'Cache', 'Flux', 'Nova'];

/** Local-only opponents using ordinary guest HTTP credentials and real WebSocket inputs. */
export class DevelopmentPlayers {
    private readonly players = new Set<Player>();
    private readonly identities = new Set<string>();
    private readonly shutdown = new AbortController();
    private readonly timer: ReturnType<typeof setInterval>;
    private pending = false;
    private nextRoster = 0;

    /** Limits all traffic to loopback and starts bounded roster/input polling. */
    constructor(private readonly options: Options) {
        if (!Number.isInteger(options.count) || options.count < 0 || options.count > 3) {
            throw new Error('Development bots must be an integer from 0 through 3.');
        }
        for (const [value, protocol] of [
            [options.apiOrigin, 'http:'],
            [options.websocketUrl, 'ws:'],
            [options.siteOrigin, 'http:'],
        ]) {
            const url = new URL(value);
            if (
                url.protocol !== protocol ||
                !['127.0.0.1', 'localhost'].includes(url.hostname) ||
                url.username ||
                url.password
            )
                throw new Error('Development bots require loopback URLs.');
        }
        this.timer = setInterval(() => {
            this.players.forEach((player) => this.move(player));
            if (!this.pending && performance.now() >= this.nextRoster && options.count > 0) {
                void this.reconcile();
            }
        }, 100);
        this.timer.unref();
    }

    /** Cancels in-flight requests and releases sockets without creating reconnect loops. */
    dispose(): void {
        this.shutdown.abort();
        clearInterval(this.timer);
        this.players.forEach((player) => this.leave(player));
    }

    /** Fills human lobbies, respects reservations, and gives lobby/results controls back to humans. */
    private async reconcile(): Promise<void> {
        this.pending = true;
        this.nextRoster = performance.now() + 500;
        try {
            const rooms = this.options.rooms();
            for (const player of this.players) {
                const room = rooms.find((entry) => entry.code === player.roomCode);
                const humans =
                    room?.players.filter((entry) => !this.identities.has(entry.id)) ?? [];
                if (
                    !room ||
                    humans.length === 0 ||
                    (room.ownerId === player.id &&
                        ['lobby', 'results'].includes(room.phase) &&
                        humans.some((entry) => entry.connected))
                ) {
                    this.leave(player);
                    continue;
                }
                if (player.socket?.readyState === WebSocket.OPEN) continue;
                const member = room.players.find((entry) => entry.id === player.id);
                if (!member) {
                    this.leave(player);
                    continue;
                }
                if (performance.now() >= player.retryAt) await this.connect(player, 'reconnect');
            }
            // Refresh after any awaited connection: humans may have left or started the match.
            for (const room of this.options.rooms()) {
                if (this.shutdown.signal.aborted) return;
                if (
                    room.phase !== 'lobby' ||
                    room.players.length >= 4 ||
                    !room.players.some((entry) => entry.connected && !this.identities.has(entry.id))
                )
                    continue;
                if (
                    [...this.players].filter((player) => player.roomCode === room.code).length >=
                    this.options.count
                )
                    continue;
                const player: Player = {
                    name: `BOT ${NAMES[randomInt(NAMES.length)]}${randomInt(10, 100)}`,
                    roomCode: room.code,
                    id: null,
                    token: null,
                    socket: null,
                    map: null,
                    snapshot: null,
                    snapshotAt: 0,
                    sequence: 0,
                    nextInput: 0,
                    readyPending: false,
                    retryAt: 0,
                };
                this.players.add(player);
                try {
                    await this.connect(player, 'join');
                } catch (error) {
                    this.leave(player);
                    throw error;
                }
            }
            const present = new Set(
                this.options.rooms().flatMap((room) => room.players.map((entry) => entry.id))
            );
            this.identities.forEach((id) => {
                if (!present.has(id) && ![...this.players].some((player) => player.id === id))
                    this.identities.delete(id);
            });
        } catch {
            this.nextRoster = performance.now() + 5000;
            if (!this.shutdown.signal.aborted)
                console.warn('Local bots: connection unavailable; retrying in 5 seconds.');
        } finally {
            this.pending = false;
        }
    }

    /** Signs up once, obtains a single-use ticket, and joins through the public protocol. */
    private async connect(player: Player, operation: 'join' | 'reconnect'): Promise<void> {
        player.retryAt = performance.now() + 5000;
        player.snapshot = null;
        player.readyPending = false;
        if (!player.token) {
            player.token = accessSchema.parse(
                await this.post('/v1/auth/guest', { nickname: player.name })
            ).accessToken;
        }
        const credential = ticketSchema.parse(
            await this.post(
                '/v1/multiplayer/join-credentials',
                {
                    region: 'eu',
                    operation,
                    roomCode: player.roomCode,
                },
                player.token
            )
        );
        this.shutdown.signal.throwIfAborted();
        // Containers use their internal loopback port, not the configurable published host port.
        const socket = new WebSocket(this.options.websocketUrl, {
            origin: this.options.siteOrigin,
            handshakeTimeout: 5000,
            maxPayload: 512 * 1024,
        });
        player.socket = socket;
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                socket.terminate();
                reject(new Error('Bot join timed out.'));
            }, 5000);
            let joined = false;
            let instanceRunId: string | null = null;
            socket.once('open', () =>
                this.send(player, {
                    type: 'authenticate',
                    version: PROTOCOL_VERSION,
                    ticket: credential.ticket,
                })
            );
            socket.on('error', () => {
                socket.terminate();
            });
            socket.once('close', () => {
                clearTimeout(timeout);
                player.snapshot = null;
                if (joined) player.retryAt = performance.now() + 1000;
                if (!joined) reject(new Error('Bot connection closed.'));
            });
            socket.on('message', (raw, binary) => {
                const text = Buffer.isBuffer(raw)
                    ? raw.toString('utf8')
                    : raw instanceof ArrayBuffer
                      ? Buffer.from(raw).toString('utf8')
                      : Buffer.concat(raw).toString('utf8');
                const message = binary ? null : parseServerMessage(text);
                if (!message) {
                    socket.terminate();
                    return;
                }
                switch (message.type) {
                    case 'authenticated':
                        if (
                            message.processGeneration !== credential.processGeneration ||
                            (player.id !== null && player.id !== message.playerId)
                        ) {
                            socket.terminate();
                            return;
                        }
                        player.id = message.playerId;
                        instanceRunId = message.instanceRunId;
                        this.identities.add(message.playerId);
                        this.send(player, { type: 'join', code: player.roomCode });
                        break;
                    case 'map':
                        player.map = message.map;
                        break;
                    case 'room': {
                        const self = message.room.players.find((entry) => entry.id === player.id);
                        if (!self?.connected) return;
                        joined = true;
                        clearTimeout(timeout);
                        resolve();
                        if (message.room.phase !== 'lobby') player.readyPending = false;
                        else {
                            player.snapshot = null;
                            if (!self.ready && !player.readyPending) {
                                player.readyPending = true;
                                this.send(player, { type: 'ready', ready: true });
                            } else if (self.ready) player.readyPending = false;
                        }
                        break;
                    }
                    case 'snapshot': {
                        if (
                            !player.map ||
                            message.processGeneration !== credential.processGeneration ||
                            message.instanceRunId !== instanceRunId
                        )
                            return;
                        const snapshot = decodeRaceSnapshot(player.map, message.snapshot);
                        if (!snapshot) {
                            socket.terminate();
                            return;
                        }
                        if (snapshot.matchId !== player.snapshot?.matchId) player.sequence = 0;
                        player.sequence = Math.max(
                            player.sequence,
                            snapshot.players.find((entry) => entry.id === player.id)
                                ?.acknowledgedInput ?? 0
                        );
                        player.snapshot = snapshot;
                        player.snapshotAt = performance.now();
                        break;
                    }
                    case 'left':
                        this.leave(player);
                        break;
                    case 'error':
                        if (!joined) socket.terminate();
                        break;
                }
            });
        });
    }

    /** Sends direction intent at human-scale intervals; effects and scores remain authoritative. */
    private move(player: Player): void {
        const now = performance.now(),
            snapshot = player.snapshot;
        if (
            !snapshot ||
            !player.map ||
            snapshot.phase !== 'playing' ||
            now < player.nextInput ||
            now - player.snapshotAt > 1000 ||
            snapshot.playTicks * RACE.stepMs + now - player.snapshotAt >=
                RACE.matchTicks * RACE.stepMs - 250
        )
            return;
        const direction = pickupDirection(
            battleArenaMapAtStage(player.map, snapshot.shrinkStage),
            snapshot,
            player.id ?? '',
            Math.random
        );
        player.nextInput = now + randomInt(120, 241);
        if (direction)
            this.send(player, {
                type: 'input',
                matchId: snapshot.matchId,
                sequence: ++player.sequence,
                direction,
            });
    }

    /** Leaves through the protocol so no unnecessary slot reservation survives intentional departure. */
    private leave(player: Player): void {
        this.players.delete(player);
        this.send(player, { type: 'leave' });
        if (player.socket?.readyState === WebSocket.CONNECTING) player.socket.terminate();
        else player.socket?.close();
    }

    /** Writes only validated client-shaped commands to a healthy bounded transport. */
    private send(player: Player, message: ClientMessage): void {
        if (player.socket?.readyState === WebSocket.OPEN && player.socket.bufferedAmount < 8192) {
            player.socket.send(JSON.stringify(message));
        }
    }

    /** Uses the same local guest and ticket HTTP routes as a browser, without internal credentials. */
    private async post(path: string, body: unknown, token?: string): Promise<unknown> {
        const response = await fetch(`${this.options.apiOrigin}${path}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                origin: this.options.siteOrigin,
                ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
            redirect: 'error',
            signal: AbortSignal.any([this.shutdown.signal, AbortSignal.timeout(5000)]),
        });
        if (!response.ok) throw new Error(`Local player request failed (${response.status}).`);
        return response.json() as Promise<unknown>;
    }
}

/** Chooses a shortest legal route to a remaining pickup, randomizing equally useful exits. */
export function pickupDirection(
    map: RaceMap,
    snapshot: RaceSnapshot,
    id: string,
    random: () => number
): Direction | null {
    const player = snapshot.players.find((entry) => entry.id === id);
    if (!player?.connected || player.eliminatedAtTick !== null || player.deathMs > 0) return null;
    const movement = player.movement;
    const occupied = movementEdge(map, movement);
    const returningFromPortal = occupied?.portal && occupied.direction !== movement.direction;
    const anchor = returningFromPortal ? movement.cell : movement.to ?? movement.cell;
    const previous = returningFromPortal ? movement.to : movement.cell;
    const exits = [...map.cells[anchor].edges];
    for (let index = exits.length - 1; index > 0; index -= 1) {
        const other = Math.floor(random() * (index + 1));
        [exits[index], exits[other]] = [exits[other], exits[index]];
    }
    const targets = new Set(snapshot.pickups.map((pickup) => pickup.cell));
    const seen = new Set([anchor]);
    // Queue a turn ahead, without oscillating back toward the cell still being traversed.
    const forward = exits.filter((edge) => movement.to === null || edge.to !== previous);
    const queue = (forward.length ? forward : exits).map((edge) => ({
        cell: edge.to,
        direction: edge.direction,
    }));
    queue.forEach((entry) => seen.add(entry.cell));
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
        const entry = queue[cursor];
        if (targets.has(entry.cell)) return entry.direction;
        for (const edge of map.cells[entry.cell].edges) {
            if (seen.has(edge.to)) continue;
            seen.add(edge.to);
            queue.push({ cell: edge.to, direction: entry.direction });
        }
    }
    return queue[0]?.direction ?? null;
}
