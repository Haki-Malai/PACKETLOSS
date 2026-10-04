import { describe, expect, it } from 'vitest';
import { MultiplayerControl } from '../multiplayer-control';
import { MultiplayerOperator } from '../multiplayer-operator';
import { ApiError } from '../models';
import type { MatchRecord } from '../models';
import { controlDependencies, multiplayerSettings, ready } from './fixtures';

describe('regional startup and admission', () => {
    it('allows only the configured owner to start a server', async () => {
        const { repository, instances } = controlDependencies(),
            control = new MultiplayerControl(
                multiplayerSettings,
                repository,
                instances,
                () => 1000
            );
        expect(control.capabilities('guest')).toEqual({ canStart: false });
        expect(control.capabilities('owner')).toEqual({ canStart: true });
        await expect(control.start('guest', 'eu')).rejects.toMatchObject({
            code: 'OWNER_REQUIRED',
        });
        expect(instances.states).not.toHaveBeenCalled();
    });
    it.each(['pending', 'running', 'stopping', 'shutting-down', 'terminated'])(
        'never starts while another region is %s',
        async (state) => {
            const { repository, instances } = controlDependencies();
            instances.states.mockResolvedValue({ eu: 'stopped', na: state });
            await expect(
                new MultiplayerControl(
                    multiplayerSettings,
                    repository,
                    instances,
                    () => 1000
                ).start('owner', 'eu')
            ).rejects.toMatchObject({ code: 'REGION_ACTIVE' });
            expect(instances.start).not.toHaveBeenCalled();
        }
    );
    it('checks actual instance state again after winning the lifecycle claim', async () => {
        const { repository, instances } = controlDependencies();
        repository.getControl.mockResolvedValue(undefined);
        instances.states
            .mockResolvedValueOnce({ eu: 'stopped', na: 'stopped' })
            .mockResolvedValueOnce({ eu: 'stopped', na: 'running' });
        await expect(
            new MultiplayerControl(
                multiplayerSettings,
                repository,
                instances,
                () => 1000,
                () => 'new-run'
            ).start('owner', 'eu')
        ).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' });
        expect(repository.failStart).toHaveBeenCalledWith('new-run');
        expect(instances.start).not.toHaveBeenCalled();
    });
    it('does not start after losing the conditional claim and reserves failed ambiguous starts', async () => {
        const { repository, instances } = controlDependencies();
        repository.getControl.mockResolvedValue(undefined);
        repository.replaceControl.mockResolvedValue(false);
        instances.states.mockResolvedValue({ eu: 'stopped', na: 'stopped' });
        const control = new MultiplayerControl(
            multiplayerSettings,
            repository,
            instances,
            () => 1000,
            () => 'new-run'
        );
        await expect(control.start('owner', 'eu')).rejects.toMatchObject({ code: 'START_PENDING' });
        expect(instances.start).not.toHaveBeenCalled();
        repository.replaceControl.mockResolvedValue(true);
        instances.start.mockRejectedValueOnce(new Error('response lost'));
        await expect(control.start('owner', 'eu')).rejects.toThrow('response lost');
        expect(repository.failStart).toHaveBeenCalledWith('new-run');
        repository.getControl.mockResolvedValue({
            ...ready,
            lifecycle: 'failed',
            activeRegion: 'na',
            processGeneration: null,
            startedAt: 0,
        });
        await expect(control.start('owner', 'eu')).rejects.toMatchObject({
            code: 'RECONCILIATION_REQUIRED',
        });
    });
    it('starts once when both instances are authoritatively stopped', async () => {
        const { repository, instances } = controlDependencies();
        repository.getControl.mockResolvedValue(undefined);
        instances.states.mockResolvedValue({ eu: 'stopped', na: 'stopped' });
        const result = await new MultiplayerControl(
            multiplayerSettings,
            repository,
            instances,
            () => 1000,
            () => 'new-run'
        ).start('owner', 'eu');
        expect(result).toEqual({ phase: 'starting', region: 'eu', operationId: 'new-run' });
        expect(repository.replaceControl).toHaveBeenCalledWith(
            0,
            expect.objectContaining({
                instanceRunId: 'new-run',
                uptimeDeadline: 15400,
                processGeneration: null,
            })
        );
        expect(instances.start).toHaveBeenCalledExactlyOnceWith('eu');
    });
    it.each([
        { heartbeatAt: 970 },
        { processGeneration: null },
        { uptimeDeadline: 1000 },
        { protocolVersion: 1 },
    ])('rejects stale or incompatible readiness %j', async (override) => {
        const { repository, instances } = controlDependencies();
        repository.getControl.mockResolvedValue({ ...ready, ...override });
        const control = new MultiplayerControl(
            multiplayerSettings,
            repository,
            instances,
            () => 1000
        );
        expect((await control.status()).phase).not.toBe('ready');
        await expect(
            control.joinCredential('alice', { region: 'eu', operation: 'create', roomCode: null })
        ).rejects.toMatchObject({ code: 'SERVER_NOT_READY' });
        expect(repository.putTicket).not.toHaveBeenCalled();
    });
    it('binds trusted profile and generation, and permits only reconnect credentials while draining', async () => {
        const { repository, instances } = controlDependencies(),
            control = new MultiplayerControl(
                multiplayerSettings,
                repository,
                instances,
                () => 1000,
                () => 'unused',
                () => 'opaque'
            );
        expect(
            await control.joinCredential('alice', {
                region: 'eu',
                operation: 'join',
                roomCode: 'ABCDEF',
            })
        ).toEqual({
            ticket: 'opaque',
            expiresAt: '1970-01-01T00:17:40Z',
            websocketUrl: 'wss://game.example/ws',
            processGeneration: 'generation',
        });
        expect(repository.putTicket).toHaveBeenCalledWith(
            'opaque',
            expect.objectContaining({
                subject: 'alice',
                nickname: 'TRUSTED',
                avatar: 'virus',
                roomCode: 'ABCDEF',
                instanceRunId: 'run',
                expiresAt: 1060,
            })
        );
        repository.getControl.mockResolvedValue({ ...ready, lifecycle: 'draining' });
        await expect(
            control.joinCredential('alice', { region: 'eu', operation: 'join', roomCode: 'ABCDEF' })
        ).rejects.toMatchObject({ code: 'SERVER_NOT_READY' });
        await expect(
            control.joinCredential('alice', {
                region: 'eu',
                operation: 'reconnect',
                roomCode: 'ABCDEF',
            })
        ).resolves.toHaveProperty('ticket', 'opaque');
    });
    it('never reveals results to nonparticipants or invents winners for unfinished matches', async () => {
        const { repository, instances } = controlDependencies(),
            control = new MultiplayerControl(
                multiplayerSettings,
                repository,
                instances,
                () => 1000
            );
        const match: MatchRecord = {
            matchId: 'match',
            roomId: 'room',
            region: 'eu',
            instanceRunId: 'run',
            processGeneration: 'generation',
            participants: ['alice', 'bob'],
            startedAt: 'start',
            lifecycle: 'started',
        };
        repository.getMatch.mockResolvedValue(match);
        await expect(control.match('mallory', 'match')).rejects.toMatchObject({
            code: 'MATCH_NOT_FOUND',
        });
        await expect(control.match('alice', 'match')).rejects.toMatchObject({
            code: 'MATCH_PENDING',
        });
        const result = {
            matchId: 'match',
            roomId: 'room',
            region: 'eu' as const,
            startedAt: 'start',
            completedAt: 'end',
            outcome: 'aborted' as const,
            reason: 'restart',
            standings: [],
        };
        repository.getMatch.mockResolvedValue({ ...match, lifecycle: 'aborted', result });
        expect(await control.match('alice', 'match')).toEqual(result);
    });
});

describe('IAM operator stop policy', () => {
    it('drains admission before checking work and stops only after a second ownership fence', async () => {
        const { repository, instances } = controlDependencies();
        const operator = new MultiplayerOperator(
            multiplayerSettings,
            repository,
            instances,
            () => 1000
        );
        expect(
            await operator.stop({ source: 'packetloss-operator', operation: 'stop', force: false })
        ).toMatchObject({ statusCode: 202, phase: 'stopping', interruptionConfirmed: false });
        expect(repository.operatorPhase.mock.calls.map((call) => call[1])).toEqual([
            'draining',
            'stopping',
        ]);
        expect(instances.stop).toHaveBeenCalledExactlyOnceWith('eu');
        expect(repository.operatorPhase.mock.invocationCallOrder[0]).toBeLessThan(
            instances.prepareStop.mock.invocationCallOrder[0]
        );
        expect(instances.prepareStop.mock.invocationCallOrder[0]).toBeLessThan(
            repository.operatorPhase.mock.invocationCallOrder[1]
        );
    });
    it.each([
        { activeMatches: 1, pendingResults: 0 },
        { activeMatches: 0, pendingResults: 1 },
    ])('refuses normal stop while work remains: %j', async (work) => {
        const { repository, instances } = controlDependencies();
        instances.prepareStop.mockResolvedValue({ safeToStop: true, ...work });
        await expect(
            new MultiplayerOperator(multiplayerSettings, repository, instances).stop({
                source: 'packetloss-operator',
                operation: 'stop',
                force: false,
            })
        ).rejects.toMatchObject({ code: 'MATCHES_ACTIVE' });
        expect(instances.stop).not.toHaveBeenCalled();
    });
    it('force attempts an abort but can stop an unreachable service', async () => {
        const { repository, instances } = controlDependencies();
        instances.prepareStop.mockRejectedValue(new Error('unreachable'));
        await expect(
            new MultiplayerOperator(multiplayerSettings, repository, instances).stop({
                source: 'packetloss-operator',
                operation: 'stop',
                force: true,
            })
        ).resolves.toMatchObject({ interruptionConfirmed: false });
        expect(instances.prepareStop).toHaveBeenCalledWith('eu', true);
        expect(instances.stop).toHaveBeenCalled();
    });
    it('losing ownership after the work check prevents even a forced stop', async () => {
        const { repository, instances } = controlDependencies();
        repository.operatorPhase
            .mockResolvedValueOnce({ ...ready, lifecycle: 'draining' })
            .mockRejectedValueOnce(new ApiError(409, 'LIFECYCLE_CHANGED', 'Changed'));
        await expect(
            new MultiplayerOperator(multiplayerSettings, repository, instances).stop({
                source: 'packetloss-operator',
                operation: 'stop',
                force: true,
            })
        ).rejects.toMatchObject({ code: 'LIFECYCLE_CHANGED' });
        expect(instances.stop).not.toHaveBeenCalled();
    });
    it('rejects region or instance mismatches without sending an SSM command', async () => {
        const { repository, instances } = controlDependencies();
        await expect(
            new MultiplayerOperator(multiplayerSettings, repository, instances).stop({
                source: 'packetloss-operator',
                operation: 'stop',
                force: true,
                region: 'na',
            })
        ).rejects.toMatchObject({ code: 'RECONCILIATION_REQUIRED' });
        expect(instances.prepareStop).not.toHaveBeenCalled();
        expect(instances.stop).not.toHaveBeenCalled();
    });
    it('reconciles an already stopped instance without issuing stop', async () => {
        const { repository, instances } = controlDependencies();
        instances.states.mockResolvedValue({ eu: 'stopped', na: 'stopped' });
        expect(
            await new MultiplayerOperator(multiplayerSettings, repository, instances).stop({
                source: 'packetloss-operator',
                operation: 'stop',
                force: false,
            })
        ).toMatchObject({ phase: 'stopped', statusCode: 200 });
        expect(instances.stop).not.toHaveBeenCalled();
        expect(instances.prepareStop).not.toHaveBeenCalled();
    });
});
