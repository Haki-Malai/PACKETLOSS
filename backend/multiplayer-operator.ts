import { ApiError, nowSeconds } from './models';
import type { OperatorRequest } from './models';
import type { MultiplayerSettings } from './config';
import type { MultiplayerRepository } from './multiplayer-repository';
import type { StopGateway } from './instances';

/** Own direct IAM management operations, which are absent from public HTTP routes. */
export class MultiplayerOperator {
    /** Inject the same ownership repository used by admission and startup. */
    constructor(
        readonly settings: MultiplayerSettings,
        readonly repository: MultiplayerRepository,
        readonly instances: StopGateway,
        readonly clock = nowSeconds
    ) {}
    /** Drain admission, verify work, and fence ownership again before stopping the instance. */
    async stop(request: OperatorRequest) {
        const expected = await this.repository.getControl(),
            states = await this.instances.states(),
            region = request.region ?? expected?.activeRegion;
        if (!region) {
            if (Object.values(states).every((state) => state === 'stopped'))
                return { statusCode: 200, phase: 'stopped', region: null, operationId: null };
            throw new ApiError(409, 'RECONCILIATION_REQUIRED', 'No owned server was found.');
        }
        if (
            !expected ||
            expected.activeRegion !== region ||
            expected.instanceId !== this.settings.regions[region].instanceId
        )
            throw new ApiError(
                409,
                'RECONCILIATION_REQUIRED',
                'The selected instance is not owned.'
            );
        if (states[region] === 'stopped') {
            await this.repository.operatorPhase(expected, 'stopped', this.clock(), request.force);
            return {
                statusCode: 200,
                phase: 'stopped',
                region,
                operationId: expected.instanceRunId,
            };
        }
        if (states[region] === 'stopping')
            return {
                statusCode: 202,
                phase: 'stopping',
                region,
                operationId: expected.instanceRunId,
            };
        if (!['running', 'pending'].includes(states[region]))
            throw new ApiError(
                409,
                'RECONCILIATION_REQUIRED',
                'The instance cannot be safely stopped.'
            );
        const fenced = await this.repository.operatorPhase(
            expected,
            'draining',
            this.clock(),
            request.force
        );
        let interruptionConfirmed = false;
        try {
            const checked = await this.instances.prepareStop(region, request.force);
            interruptionConfirmed = request.force && checked.activeMatches === 0;
            if (
                !request.force &&
                !(
                    checked.safeToStop === true &&
                    checked.activeMatches === 0 &&
                    checked.pendingResults === 0
                )
            )
                throw new ApiError(
                    409,
                    'MATCHES_ACTIVE',
                    'The server is draining; retry when matches are saved.',
                    15
                );
        } catch (error) {
            if (!request.force) throw error;
        }
        // The local admission gate remains closed between the work check and this stop.
        await this.repository.operatorPhase(fenced, 'stopping', this.clock(), request.force);
        await this.instances.stop(region);
        return {
            statusCode: 202,
            phase: 'stopping',
            region,
            operationId: expected.instanceRunId,
            interruptionConfirmed,
        };
    }
}
