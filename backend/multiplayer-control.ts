import { PROTOCOL_VERSION } from '../src/game/protocol/version';
import { randomBytes, randomUUID } from 'node:crypto';
import { ApiError, nowSeconds, resultSchema } from './models';
import type { ControlRecord, JoinRequest, Phase, Region, ServerStatus } from './models';
import type { MultiplayerSettings } from './config';
import type { MultiplayerRepository } from './multiplayer-repository';

export interface InstanceGateway {
    states(): Promise<Record<Region, string>>;
    start(region: Region): Promise<void>;
}
/** Serialize epoch seconds using the established UTC API timestamp format. */
export function isoTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().replace('.000Z', 'Z');
}
/** Coordinate regional startup and admission through the shared authoritative ownership record. */
export class MultiplayerControl {
    /** Inject time and credentials for deterministic boundary tests. */
    constructor(
        readonly settings: MultiplayerSettings,
        readonly repository: MultiplayerRepository,
        readonly instances: InstanceGateway,
        readonly clock = nowSeconds,
        readonly newRunId: () => string = randomUUID,
        readonly newTicket = () => randomBytes(32).toString('base64url')
    ) {}
    /** Report a capability without disclosing the configured owner identity. */
    capabilities(subject: string): { canStart: boolean } {
        return { canStart: subject === this.settings.ownerSub };
    }
    /** Polling observes state and never writes ownership or starts instances. */
    async status(): Promise<ServerStatus> {
        return this.describe(
            await this.instances.states(),
            await this.repository.getControl(),
            this.clock()
        );
    }
    /** Combine EC2 state with fresh, generation-bound process readiness. */
    private describe(
        states: Record<Region, string>,
        record: ControlRecord | undefined,
        now: number
    ): ServerStatus {
        const phases = {} as Record<Region, Phase>,
            active = (Object.keys(states) as Region[]).filter(
                (region) => states[region] !== 'stopped'
            );
        for (const region of ['eu', 'na'] as const) {
            const state = states[region];
            let phase: Phase =
                (
                    {
                        stopped: 'stopped',
                        pending: 'starting',
                        running: 'starting',
                        stopping: 'stopping',
                    } as Record<string, Phase>
                )[state] ?? 'failed';
            if (record?.activeRegion === region) {
                const fresh =
                    !!record.processGeneration &&
                    record.heartbeatAt > now - this.settings.heartbeatMaxAge &&
                    record.uptimeDeadline > now &&
                    record.protocolVersion === PROTOCOL_VERSION;
                if (state === 'running') {
                    if (record.lifecycle === 'draining') phase = fresh ? 'draining' : 'failed';
                    else if (record.lifecycle === 'stopping') phase = 'stopping';
                    else if (record.lifecycle === 'ready' && fresh) phase = 'ready';
                    else if (
                        record.lifecycle === 'failed' ||
                        now - record.startedAt >= this.settings.startupTimeout
                    )
                        phase = 'failed';
                } else if (state === 'stopped' && ['starting', 'failed'].includes(record.lifecycle))
                    phase =
                        record.lifecycle === 'starting' &&
                        now - record.startedAt < this.settings.startupTimeout
                            ? 'starting'
                            : 'failed';
            } else if (state === 'running') phase = 'failed';
            phases[region] = phase;
        }
        let region: Region | null = active.length === 1 ? active[0] : null;
        if (!active.length && record && ['starting', 'failed'].includes(record.lifecycle))
            region = record.activeRegion;
        let phase: Phase = region ? phases[region] : 'stopped';
        if (active.length > 1) {
            phase = 'failed';
            for (const key of active) phases[key] = 'failed';
        }
        const belongs = region !== null && record?.activeRegion === region;
        const regional = (key: Region) => ({
            region: key,
            phase: phases[key],
            ready: phases[key] === 'ready',
            hostname: new URL(this.settings.regions[key].websocketUrl).hostname,
            updatedAt: isoTime(now),
        });
        return {
            phase,
            activeRegion: region,
            instanceRunId: belongs ? record.instanceRunId : null,
            processGeneration: belongs ? record.processGeneration : null,
            websocketUrl: region ? this.settings.regions[region].websocketUrl : null,
            protocolVersion: belongs ? record.protocolVersion : null,
            regions: { eu: regional('eu'), na: regional('na') },
        };
    }
    /** Fence startup until both actual instances are stopped; ambiguous starts retain ownership. */
    async start(subject: string, region: Region) {
        if (subject !== this.settings.ownerSub)
            throw new ApiError(
                403,
                'OWNER_REQUIRED',
                'Only the server owner can start multiplayer.'
            );
        const now = this.clock(),
            states = await this.instances.states(),
            previous = await this.repository.getControl();
        const status = this.describe(states, previous, now),
            other = region === 'eu' ? 'na' : 'eu';
        if (states[other] !== 'stopped')
            throw new ApiError(409, 'REGION_ACTIVE', 'Wait for the other region to stop.');
        if (['pending', 'running'].includes(states[region])) {
            if (!previous || previous.activeRegion !== region)
                throw new ApiError(
                    409,
                    'RECONCILIATION_REQUIRED',
                    'The running server needs inspection.'
                );
            return { phase: status.phase, region, operationId: previous.instanceRunId };
        }
        if (states[region] !== 'stopped')
            throw new ApiError(409, 'SERVER_STOPPING', 'Wait for the server to finish stopping.');
        if (previous && ['starting', 'failed'].includes(previous.lifecycle)) {
            if (previous.activeRegion !== region && !previous.processGeneration)
                throw new ApiError(
                    409,
                    'RECONCILIATION_REQUIRED',
                    'The previous start needs inspection.'
                );
            if (
                previous.lifecycle === 'starting' &&
                now - previous.startedAt < this.settings.startupTimeout
            )
                throw new ApiError(409, 'START_PENDING', 'A server start is already pending.', 15);
        }
        await this.repository.limit(`start:${subject}`, 1, 60, now);
        const runId = this.newRunId();
        if (
            !(await this.repository.replaceControl(previous?.revision ?? 0, {
                lifecycle: 'starting',
                activeRegion: region,
                instanceRunId: runId,
                instanceId: this.settings.regions[region].instanceId,
                processGeneration: null,
                startedAt: now,
                uptimeDeadline: now + this.settings.maximumUptime,
                heartbeatAt: 0,
                protocolVersion: PROTOCOL_VERSION,
            }))
        )
            throw new ApiError(
                409,
                'START_PENDING',
                'Another lifecycle operation is in progress.',
                15
            );
        try {
            if (Object.values(await this.instances.states()).some((state) => state !== 'stopped'))
                throw new ApiError(
                    409,
                    'RECONCILIATION_REQUIRED',
                    'Instance state changed during start.'
                );
            await this.instances.start(region);
        } catch (error) {
            await this.repository.failStart(runId);
            throw error;
        }
        return { phase: 'starting' as const, region, operationId: runId };
    }
    /** Issue one 60-second capability bound to verified identity, operation, room, and process. */
    async joinCredential(subject: string, request: JoinRequest) {
        const now = this.clock();
        await this.repository.limit(`ticket:${subject}`, 30, 60, now);
        const status = await this.status();
        if (
            !(
                status.phase === 'ready' ||
                (status.phase === 'draining' && request.operation === 'reconnect')
            ) ||
            status.activeRegion !== request.region
        )
            throw new ApiError(
                409,
                'SERVER_NOT_READY',
                'The selected game server is not ready.',
                15
            );
        if (!status.instanceRunId || !status.processGeneration || !status.websocketUrl)
            throw new ApiError(503, 'CONTROL_UNAVAILABLE', 'Server status is unavailable.', 15);
        const profile = await this.repository.getProfile(subject),
            ticket = this.newTicket();
        await this.repository.putTicket(ticket, {
            subject,
            nickname: profile.nickname,
            avatar: profile.avatar,
            region: request.region,
            instanceRunId: status.instanceRunId,
            processGeneration: status.processGeneration,
            operation: request.operation,
            roomCode: request.roomCode,
            issuedAt: now,
            expiresAt: now + 60,
        });
        return {
            ticket,
            expiresAt: isoTime(now + 60),
            websocketUrl: status.websocketUrl,
            processGeneration: status.processGeneration,
        };
    }
    /** Return completed results only to members of the immutable participant roster. */
    async match(subject: string, matchId: string) {
        const item = await this.repository.getMatch(matchId);
        if (!item || !item.participants.includes(subject))
            throw new ApiError(404, 'MATCH_NOT_FOUND', 'This match is unavailable.');
        if (item.lifecycle === 'started' || !item.result)
            throw new ApiError(409, 'MATCH_PENDING', 'The final result is not available yet.', 5);
        return resultSchema.parse(item.result);
    }
}
