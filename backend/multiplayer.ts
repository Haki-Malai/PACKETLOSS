import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { z } from 'zod';
import { multiplayerSettings } from './config';
import { DynamoStore } from './dynamo';
import { DynamoMultiplayerRepository } from './multiplayer-repository';
import { MultiplayerControl } from './multiplayer-control';
import { MultiplayerOperator } from './multiplayer-operator';
import { Ec2Instances } from './instances';
import { createMultiplayerApp } from './multiplayer-app';
import { ApiError, operatorSchema } from './models';
import type { GatewayEvent } from './http';

const settings = multiplayerSettings(),
    repository = new DynamoMultiplayerRepository(
        new DynamoStore(new DynamoDBClient({ region: settings.controlRegion })),
        settings
    );
const instances = new Ec2Instances(settings),
    httpHandler = createMultiplayerApp(
        settings,
        new MultiplayerControl(settings, repository, instances)
    );
/** Accept operator commands only through their direct IAM envelope, never HTTP requests. */
export async function handler(event: GatewayEvent & { source?: string }) {
    if (event.source !== 'packetloss-operator' || 'requestContext' in event)
        return httpHandler(event);
    try {
        return await new MultiplayerOperator(settings, repository, instances).stop(
            operatorSchema.parse(event)
        );
    } catch (error) {
        if (error instanceof z.ZodError)
            return { statusCode: 422, code: 'INVALID_REQUEST', message: 'Invalid operator event.' };
        if (error instanceof ApiError)
            return { statusCode: error.statusCode, code: error.code, message: error.message };
        return {
            statusCode: 503,
            code: 'CONTROL_UNAVAILABLE',
            message: 'Stop status is uncertain; inspect before retrying.',
        };
    }
}
