import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { accountSettings } from './config';
import { CognitoAuth } from './auth';
import { DynamoStore } from './dynamo';
import { DynamoProfileRepository } from './profile-repository';
import { createAccountApp } from './account-app';

const settings = accountSettings();
export const handler = createAccountApp(
    settings,
    new CognitoAuth(settings),
    new DynamoProfileRepository(new DynamoStore(new DynamoDBClient({})), settings.tableName)
);
