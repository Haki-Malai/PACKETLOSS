import { z } from 'zod';

export const regionSchema = z.enum(['eu', 'na']);
export type Region = z.infer<typeof regionSchema>;
export type Phase = 'stopped' | 'starting' | 'ready' | 'draining' | 'stopping' | 'failed';
export const identifier = z.string().min(1).max(128);
export const profileSchema = z.strictObject({
    nickname: z.preprocess(
        (value) =>
            value === undefined
                ? undefined
                : typeof value === 'string'
                  ? value.trim().slice(0, 16) || 'PLAYER'
                  : 'PLAYER',
        z.string().min(1).max(16)
    ),
    avatar: z
        .enum(['packet', 'firewall', 'virus', 'ping', 'spam', 'lag', 'quarantine', 'trojan'])
        .default('packet'),
});
export type Profile = z.infer<typeof profileSchema>;
const email = z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(254)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
export const emailSchema = z.strictObject({ email });
export const confirmationSchema = emailSchema.extend({ code: z.string().min(4).max(16) });
export const loginSchema = emailSchema.extend({ password: z.string().min(1).max(128) });
/** Keep relaxed local passwords confined to the development composition. */
export function signupSchema(local = false) {
    return profileSchema.extend({
        email,
        password: z
            .string()
            .min(local ? 1 : 12)
            .max(128),
    });
}
/** Apply the same password policy to account creation and recovery. */
export function resetSchema(local = false) {
    return confirmationSchema.extend({
        password: z
            .string()
            .min(local ? 1 : 12)
            .max(128),
    });
}
const nonnegative = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const recordSchema = z
    .strictObject({
        id: z
            .string()
            .min(1)
            .max(64)
            .regex(/^[A-Za-z0-9._:-]+$/),
        completedAt: z
            .string()
            .refine((value) => Number.isFinite(Date.parse(value)), 'Invalid date'),
        map: z.enum(['default', 'demo']),
        nickname: z.string().min(1).max(16),
        outcome: z.enum(['lost', 'cleared']),
        score: nonnegative,
        lives: nonnegative,
        elapsedMs: nonnegative,
        pointsCollected: nonnegative,
        totalPoints: nonnegative,
        levelsCleared: nonnegative,
        mode: z.enum(['classic', 'endless']).default('classic'),
    })
    .refine(
        (record) =>
            record.pointsCollected <= record.totalPoints &&
            (record.mode !== 'endless' || record.map === 'default')
    );
export type RunRecord = z.infer<typeof recordSchema>;
export const recordsSchema = z.strictObject({ records: z.array(recordSchema).min(1).max(10) });
export const joinSchema = z
    .strictObject({
        region: regionSchema,
        operation: z.enum(['create', 'join', 'reconnect']),
        roomCode: z
            .string()
            .regex(/^[A-Z2-9]{6}$/)
            .nullable()
            .default(null),
    })
    .refine((request) => (request.operation === 'create') === (request.roomCode === null));
export type JoinRequest = z.infer<typeof joinSchema>;
export const standingSchema = z.strictObject({
    playerId: identifier,
    nickname: z.string().min(1).max(16),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    score: nonnegative,
    rank: z.number().int().min(1).max(4),
    connected: z.boolean(),
});
export const resultSchema = z.strictObject({
    matchId: identifier,
    roomId: identifier,
    region: regionSchema,
    startedAt: z.string(),
    completedAt: z.string().nullable(),
    outcome: z.enum(['completed', 'aborted']),
    reason: z.string().nullable(),
    standings: z.array(standingSchema).max(4),
});
export type MatchResult = z.infer<typeof resultSchema>;
export const generationSchema = z.strictObject({
    instanceRunId: identifier,
    processGeneration: identifier,
});
export const roomStatusSchema = z.strictObject({
    ready: z.boolean(),
    draining: z.boolean(),
    activeMatches: nonnegative,
    connectedPlayers: nonnegative,
    rooms: nonnegative,
    idleMs: z.number().nonnegative(),
    pendingResults: nonnegative,
    currentTickDebtMs: z.number().nonnegative(),
    maximumTickDebtMs: z.number().nonnegative(),
});
export type RoomStatus = z.infer<typeof roomStatusSchema>;
export const matchStartSchema = generationSchema.extend({
    matchId: identifier.regex(/^[A-Za-z0-9_-]+$/),
    roomId: identifier,
    participants: z.array(identifier).min(2).max(4),
    startedAt: z.string().min(1).max(64),
});
export type MatchStart = z.infer<typeof matchStartSchema> & { region: Region };
export const operatorSchema = z.strictObject({
    source: z.literal('packetloss-operator'),
    operation: z.literal('stop'),
    force: z.boolean(),
    region: regionSchema.nullable().optional(),
});
export type OperatorRequest = z.infer<typeof operatorSchema>;
export interface ControlRecord {
    pk?: string;
    revision: number;
    lifecycle: Phase;
    activeRegion: Region;
    instanceId: string;
    instanceRunId: string;
    processGeneration: string | null;
    startedAt: number;
    uptimeDeadline: number;
    heartbeatAt: number;
    protocolVersion: number;
    activeMatches?: number;
    connectedPlayers?: number;
    pendingResults?: number;
    rooms?: number;
    stopRequestedAt?: number;
    stopForced?: boolean;
}
export const ticketRecordSchema = z
    .object({
        subject: identifier,
        nickname: z.string().min(1).max(16),
        avatar: profileSchema.shape.avatar.removeDefault(),
        region: regionSchema,
        ...generationSchema.shape,
        operation: joinSchema.shape.operation,
        roomCode: joinSchema.shape.roomCode.removeDefault(),
        issuedAt: nonnegative,
        expiresAt: nonnegative,
        used: z.boolean().optional(),
    })
    .refine((ticket) => (ticket.operation === 'create') === (ticket.roomCode === null));
export type TicketRecord = z.infer<typeof ticketRecordSchema>;
export interface MatchRecord extends MatchStart {
    lifecycle: 'started' | 'completed' | 'aborted';
    result?: MatchResult;
}
export interface ServerStatus {
    phase: Phase;
    activeRegion: Region | null;
    instanceRunId: string | null;
    processGeneration: string | null;
    websocketUrl: string | null;
    protocolVersion: number | null;
    regions: Record<
        Region,
        { region: Region; phase: Phase; ready: boolean; hostname: string; updatedAt: string }
    >;
}

export class ApiError extends Error {
    /** Carries a stable public failure without exposing provider diagnostics. */
    constructor(
        public readonly statusCode: number,
        public readonly code: string,
        message: string,
        public readonly retryAfter?: number
    ) {
        super(message);
    }
}
/** Recognize provider errors without depending on a particular SDK error subclass. */
export function errorIs(error: unknown, ...names: string[]): boolean {
    return error instanceof Error && names.includes(error.name);
}
/** Return epoch seconds, the unit stored in DynamoDB lifecycle records. */
export function nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
}
