import { copyFile, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { developmentSettings } from './config';
import { initializeDatabase, LOCAL_TABLES, localClient } from './dynamo';
import { LocalRepository } from './local-repository';
import { LocalAuth } from './local-auth';
import { nowSeconds, profileSchema, recordSchema } from './models';

/** Detect an absent legacy database without swallowing filesystem permission failures. */
async function exists(path: string): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false;
        throw error;
    }
}
/** Import a stopped SQLite snapshot once, retaining original files and active session formats. */
export async function migrate(repository: LocalRepository, path: string): Promise<void> {
    const marker = { pk: 'MIGRATION#sqlite-v1' };
    if (!(await exists(path)) || (await repository.store.get(LOCAL_TABLES.auth, marker))) return;
    const directory = await mkdtemp(join(tmpdir(), 'packetloss-migration-')),
        copied = join(directory, 'legacy.sqlite');
    try {
        // WAL-mode SQLite needs writable shared memory; only the stopped copy may be modified.
        await copyFile(path, copied);
        if (await exists(`${path}-wal`)) await copyFile(`${path}-wal`, `${copied}-wal`);
        const database = new DatabaseSync(copied);
        try {
            for (const user of database.prepare('SELECT * FROM users').all()) {
                const subject = z.string().parse(user.subject),
                    email = z.string().parse(user.email);
                if (!(await repository.identityForSubject(subject))) {
                    await repository.createIdentity(
                        subject,
                        email,
                        z.instanceof(Uint8Array).parse(user.password_salt),
                        z.instanceof(Uint8Array).parse(user.password_hash),
                        user.confirmed ? null : z.string().parse(user.confirmation_code)
                    );
                    if (user.reset_code)
                        await repository.setResetCode(email, z.string().parse(user.reset_code));
                }
            }
            for (const row of database.prepare('SELECT * FROM profiles').all())
                await repository.putProfile(
                    z.string().parse(row.subject),
                    profileSchema.parse({ nickname: row.nickname, avatar: row.avatar })
                );
            for (const row of database.prepare('SELECT * FROM records').all())
                await repository.saveRecords(z.string().parse(row.subject), [
                    recordSchema.parse(JSON.parse(z.string().parse(row.payload)) as unknown),
                ]);
            for (const row of database
                .prepare('SELECT * FROM refresh_sessions WHERE revoked = 0')
                .all())
                await repository.putRefreshSession(
                    z.string().parse(row.token_hash),
                    z.string().parse(row.subject),
                    z.number().parse(row.expires_at)
                );
            for (const row of database.prepare('SELECT * FROM matches').all()) {
                const payload = z
                    .record(z.string(), z.unknown())
                    .parse(JSON.parse(z.string().parse(row.payload)) as unknown);
                await repository.store.put(LOCAL_TABLES.results, {
                    pk: z.string().parse(row.match_id),
                    ...payload,
                });
            }
        } finally {
            database.close();
        }
        await repository.store.put(LOCAL_TABLES.auth, marker);
        console.log('Imported existing SQLite data into DynamoDB Local; original file retained.');
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}
/** Initialize local storage once per launcher run before either Lambda emulator starts. */
export async function bootstrap(): Promise<void> {
    const settings = developmentSettings(),
        client = localClient(settings.dynamodbEndpoint);
    try {
        await initializeDatabase(client);
        const repository = new LocalRepository(settings.dynamodbEndpoint);
        try {
            await migrate(repository, '/data/packetloss.sqlite');
            await new LocalAuth(repository, settings.authKey).seedAccounts();
            await repository.resetRuntime(settings.runId, settings.processGeneration, nowSeconds());
        } finally {
            repository.store.client.destroy();
        }
        console.log('DynamoDB Local initialized; multiplayer starts automatically.');
    } finally {
        client.destroy();
    }
}
