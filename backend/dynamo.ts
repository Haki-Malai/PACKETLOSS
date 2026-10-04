import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    UpdateItemCommand,
    QueryCommand,
    TransactWriteItemsCommand,
    CreateTableCommand,
    ListTablesCommand,
    waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import type {
    TransactWriteItem,
    UpdateItemCommandInput,
    PutItemCommandInput,
    AttributeValue,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { ApiError, errorIs } from './models';

type Values = Record<string, unknown>;
export type WriteOptions = Omit<
    PutItemCommandInput,
    'TableName' | 'Item' | 'ExpressionAttributeValues'
> & { ExpressionAttributeValues?: Values };
export type UpdateOptions = Omit<
    UpdateItemCommandInput,
    'TableName' | 'Key' | 'ExpressionAttributeValues'
> & { ExpressionAttributeValues?: Values };
/** Marshal values exactly once at the AWS SDK boundary, including binary password hashes. */
export function attributes(value: Values) {
    return marshall(value, { removeUndefinedValues: true });
}
/** Share the small DynamoDB command boundary across production and development repositories. */
export class DynamoStore {
    /** Accept a client so tests can exercise commands without cloud credentials. */
    constructor(readonly client: DynamoDBClient) {}
    /** Read one strongly consistent item. */
    async get<T>(table: string, key: Values): Promise<T | undefined> {
        const response = await this.client.send(
            new GetItemCommand({ TableName: table, Key: attributes(key), ConsistentRead: true })
        );
        return response.Item ? (unmarshall(response.Item) as T) : undefined;
    }
    /** Write one item with optional optimistic concurrency conditions. */
    async put(table: string, item: Values, options: WriteOptions = {}): Promise<void> {
        await this.client.send(
            new PutItemCommand({
                ...options,
                TableName: table,
                Item: attributes(item),
                ExpressionAttributeValues: options.ExpressionAttributeValues
                    ? attributes(options.ExpressionAttributeValues)
                    : undefined,
            })
        );
    }
    /** Update one item and return its new value only when requested. */
    async update<T>(table: string, key: Values, options: UpdateOptions): Promise<T | undefined> {
        const response = await this.client.send(
            new UpdateItemCommand({
                ...options,
                TableName: table,
                Key: attributes(key),
                ExpressionAttributeValues: options.ExpressionAttributeValues
                    ? attributes(options.ExpressionAttributeValues)
                    : undefined,
            })
        );
        return response.Attributes ? (unmarshall(response.Attributes) as T) : undefined;
    }
    /** Remove a known item; retention never sweeps records outside its observed snapshot. */
    async delete(table: string, key: Values): Promise<void> {
        await this.client.send(new DeleteItemCommand({ TableName: table, Key: attributes(key) }));
    }
    /** Read all pages of a single account partition using strongly consistent queries. */
    async query<T>(table: string, pk: string): Promise<T[]> {
        const items: T[] = [];
        let cursor: Record<string, AttributeValue> | undefined;
        do {
            const page = await this.client.send(
                new QueryCommand({
                    TableName: table,
                    KeyConditionExpression: 'pk = :pk',
                    ExpressionAttributeValues: attributes({ ':pk': pk }),
                    ConsistentRead: true,
                    ExclusiveStartKey: cursor,
                })
            );
            items.push(...(page.Items ?? []).map((item) => unmarshall(item) as T));
            cursor = page.LastEvaluatedKey;
        } while (cursor);
        return items;
    }
    /** Submit one atomic transaction containing already marshalled AWS items. */
    async transact(items: TransactWriteItem[]): Promise<void> {
        await this.client.send(new TransactWriteItemsCommand({ TransactItems: items }));
    }
}
export const LOCAL_TABLES = {
    profiles: 'packetloss-local-profiles',
    auth: 'packetloss-local-auth',
    control: 'packetloss-local-control',
    tickets: 'packetloss-local-tickets',
    results: 'packetloss-local-results',
};
/** Supply fixed dummy credentials and reject every non-local DynamoDB endpoint. */
export function localClient(endpoint: string): DynamoDBClient {
    const url = new URL(endpoint);
    if (
        url.protocol !== 'http:' ||
        !['dynamodb', 'localhost', '127.0.0.1'].includes(url.hostname) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
    )
        throw new Error('DynamoDB development endpoint must be local');
    return new DynamoDBClient({
        endpoint,
        region: 'us-east-1',
        credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    });
}
/** Create missing production-shaped local tables without replacing persistent data. */
export async function initializeDatabase(client: DynamoDBClient): Promise<void> {
    const response = await client.send(new ListTablesCommand({}));
    for (const name of Object.values(LOCAL_TABLES)) {
        if (response.TableNames?.includes(name)) continue;
        const keys: { AttributeName: string; KeyType: 'HASH' | 'RANGE' }[] = [
            { AttributeName: 'pk', KeyType: 'HASH' },
        ];
        if (name === LOCAL_TABLES.profiles) keys.push({ AttributeName: 'sk', KeyType: 'RANGE' });
        await client.send(
            new CreateTableCommand({
                TableName: name,
                KeySchema: keys,
                BillingMode: 'PAY_PER_REQUEST',
                AttributeDefinitions: keys.map((key) => ({
                    AttributeName: key.AttributeName,
                    AttributeType: 'S',
                })),
            })
        );
        await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: name });
    }
}
/** Translate account persistence failures into the established retryable public response. */
export function storageError(error: unknown): never {
    if (error instanceof ApiError) throw error;
    const busy = errorIs(
        error,
        'ProvisionedThroughputExceededException',
        'RequestLimitExceeded',
        'ThrottlingException'
    );
    throw new ApiError(
        503,
        'SAVE_UNAVAILABLE',
        busy ? 'Cloud saving is busy. Try again.' : 'Cloud saving is temporarily unavailable.',
        busy ? 10 : 30
    );
}
