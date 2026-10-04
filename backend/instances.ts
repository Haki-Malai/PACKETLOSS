import {
    EC2Client,
    DescribeInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand,
} from '@aws-sdk/client-ec2';
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from '@aws-sdk/client-ssm';
import { setTimeout as sleep } from 'node:timers/promises';
import { ApiError, errorIs } from './models';
import type { Region } from './models';
import type { MultiplayerSettings } from './config';
import type { InstanceGateway } from './multiplayer-control';

export interface StopStatus {
    safeToStop: boolean;
    activeMatches?: number;
    pendingResults?: number;
}
export interface StopGateway {
    states(): Promise<Record<Region, string>>;
    prepareStop(region: Region, force: boolean): Promise<StopStatus>;
    stop(region: Region): Promise<void>;
}
/** Restrict lifecycle operations to the two provisioned instances. */
export class Ec2Instances implements InstanceGateway, StopGateway {
    readonly clients: Record<Region, EC2Client>;
    readonly ssm: Record<Region, SSMClient>;
    /** Disable automatic retries of potentially accepted stateful lifecycle operations. */
    constructor(
        readonly settings: MultiplayerSettings,
        clients?: Record<Region, EC2Client>,
        ssm?: Record<Region, SSMClient>
    ) {
        const config = (region: Region) => ({
            region: settings.regions[region].awsRegion,
            maxAttempts: 1,
            requestHandler: { connectionTimeout: 2000, requestTimeout: 3000 },
        });
        this.clients = clients ?? {
            eu: new EC2Client(config('eu')),
            na: new EC2Client(config('na')),
        };
        this.ssm = ssm ?? { eu: new SSMClient(config('eu')), na: new SSMClient(config('na')) };
    }
    /** Fail closed when either provisioned instance cannot be authoritatively inspected. */
    async states(): Promise<Record<Region, string>> {
        const states = {} as Record<Region, string>;
        for (const region of ['eu', 'na'] as const) {
            const id = this.settings.regions[region].instanceId;
            const result = await this.clients[region].send(
                new DescribeInstancesCommand({ InstanceIds: [id] })
            );
            const instances = (result.Reservations ?? [])
                .flatMap((reservation) => reservation.Instances ?? [])
                .filter((instance) => instance.InstanceId === id);
            if (instances.length !== 1 || !instances[0].State?.Name)
                throw new ApiError(503, 'CONTROL_UNAVAILABLE', 'Server status is unavailable.', 15);
            states[region] = instances[0].State.Name;
        }
        return states;
    }
    /** Start exactly the configured regional instance. */
    async start(region: Region): Promise<void> {
        await this.clients[region].send(
            new StartInstancesCommand({ InstanceIds: [this.settings.regions[region].instanceId] })
        );
    }
    /** Stop the configured instance while preserving its persistent disk. */
    async stop(region: Region): Promise<void> {
        await this.clients[region].send(
            new StopInstancesCommand({ InstanceIds: [this.settings.regions[region].instanceId] })
        );
    }
    /** Run the installed fixed helper; no admin secret is placed in SSM command text. */
    async prepareStop(region: Region, force: boolean): Promise<StopStatus> {
        const client = this.ssm[region],
            instanceId = this.settings.regions[region].instanceId;
        const sent = await client.send(
            new SendCommandCommand({
                InstanceIds: [instanceId],
                DocumentName: 'AWS-RunShellScript',
                Parameters: {
                    commands: [`/usr/local/bin/packetloss-control-stop${force ? ' --force' : ''}`],
                },
                TimeoutSeconds: 30,
            })
        );
        const deadline = performance.now() + 20000;
        while (performance.now() < deadline) {
            try {
                const result = await client.send(
                    new GetCommandInvocationCommand({
                        CommandId: sent.Command?.CommandId,
                        InstanceId: instanceId,
                    })
                );
                if (result.Status === 'Success') {
                    let value: unknown;
                    try {
                        value = JSON.parse(result.StandardOutputContent ?? '');
                    } catch {
                        throw new ApiError(
                            503,
                            'STOP_UNVERIFIED',
                            'The stop check was unreadable.'
                        );
                    }
                    if (
                        typeof value !== 'object' ||
                        !value ||
                        !('safeToStop' in value) ||
                        typeof value.safeToStop !== 'boolean'
                    )
                        throw new ApiError(
                            503,
                            'STOP_UNVERIFIED',
                            'The stop check was unreadable.'
                        );
                    return value as StopStatus;
                }
                if (!['Pending', 'InProgress', 'Delayed'].includes(result.Status ?? ''))
                    throw new ApiError(
                        503,
                        'STOP_UNVERIFIED',
                        'The server could not confirm a safe stop.'
                    );
            } catch (error) {
                if (!errorIs(error, 'InvocationDoesNotExist')) throw error;
            }
            await sleep(1000);
        }
        throw new ApiError(503, 'STOP_UNVERIFIED', 'The server stop check timed out.', 15);
    }
}
