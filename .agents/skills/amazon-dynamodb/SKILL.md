---
name: amazon-dynamodb
description: Design, review, and debug PACKETLOSS DynamoDB persistence, access patterns, conditional writes, ticket consumption, immutable results, retention, and capacity costs. Use for DynamoDB-backed backend changes and throttling or persistence failures; not unrelated gameplay or rendering work.
---

# DynamoDB for PACKETLOSS

Apply access-pattern-first design to the existing Node.js repositories. Keep the scope proportional: a ticket bug needs its relevant contract and tests, not a full database redesign. Skill activation does not authorize AWS mutations, paid benchmarks, local stack startup, or data resets; use the user's existing authorization and repository rules.

## Locate the existing boundary

Read `docs/ARCHITECTURE.md` and the relevant section of `docs/TESTING.md`. Verify current source before relying on these pointers:

| Concern | Existing owner |
| --- | --- |
| SDK v3 commands, marshalling, consistent reads, query pagination | `backend/dynamo.ts` |
| Lifecycle revisions, ticket hashes and atomic consumption, match identity and final outcomes | `backend/multiplayer-repository.ts` |
| Account partitions, immutable record IDs, score retention, signup reservations | `backend/profile-repository.ts` |
| Process ownership, heartbeat fences, fsynced result outbox and restart recovery | `server/DynamoAdapters.ts` |
| Participant authorization and ticket issuance | `backend/multiplayer-app.ts`, `backend/multiplayer-control.ts` |
| Local identities and production-shaped repository reuse | `backend/local-repository.ts` |

Reuse `DynamoStore`, `DynamoMultiplayerRepository`, shared schemas, and existing configuration. Preserve the SDK v3 low-level command boundary unless the task requires changing it; do not add a second persistence abstraction or Python tooling. Production infrastructure is owned separately; local bootstrap declarations do not prove deployed TTL, IAM, indexes, or capacity settings.

For API details, limits, or regional pricing, use the available `find-docs` skill and primary AWS documentation. Check the installed SDK version in `package.json`/the lockfile. Do not treat this adaptation or its upstream source as a substitute for current service documentation.

## Model only the affected access patterns

Before proposing keys, indexes, or consistency changes, identify the caller and authenticated identity, operation, keys, expected result size, ordering/pagination, consistency requirement, and expected frequency. Mark unknown scale inputs as unknown; a small code correction need not wait for a full traffic forecast.

Keep table boundaries aligned with actual access patterns and operational needs: authorization, backup/restore scope, retention, and capacity. Neither single-table design nor table-per-entity is a goal. Prefer keyed reads/queries for request paths; a filter is applied after reading and is not an authorization control or a way to avoid read cost. Preserve query pagination. Add an index only for a concrete required query, with a migration and read cutover plan if existing data is affected.

Account reads must use the authenticated subject. Match IDs alone do not authorize result access: follow the participant check at the API boundary. Never log raw tickets or credentials to explain a key or failure.

## Preserve correctness across retries and races

- Single-item conditional writes are atomic. Use a transaction when the invariant spans multiple items; do not replace the ticket transaction with a read followed by an unguarded update. Its control-record check and ticket consumption must succeed together.
- Ticket consumption must retain the unused flag, explicit expiry check, region/run/generation binding, current lifecycle, fresh heartbeat, and uptime fence. Reconnect admission during draining is operation-specific. A failed transaction must not be treated as successful admission.
- Use conditions to protect create-only writes, existing-row updates, and state transitions. Do not remove generation or revision conditions merely to make retries succeed. Distinguish expected contention, ambiguous network outcomes, and service failures using the SDK's actual error details and the established public API contract.
- A retry must preserve the operation's identity and payload. Match-start replays accept the same registered identity; completed-result replays accept only an identical final result. Conflicting rosters, generations, or terminal outcomes must remain conflicts.
- Keep terminal results durable before acknowledging delivery. Preserve the outbox's local write, file sync, atomic rename, directory sync, and delivered marker ordering. Recovery publishes durable completed outcomes before aborting unfinished starts; replay retains the original registered run/generation and result timestamp.
- Profile retention preserves the union of best and recent records by mode/map, first-write record identity, and snapshot-scoped pruning. Do not delete a concurrent record absent from the pruning snapshot.
- TTL is asynchronous cleanup, not an authorization deadline. Enforce expiry explicitly even while expired rows remain readable. Verify the configured TTL attribute name and epoch-second units separately for each table; the code uses both `expiresAt` and `expires_at` in different contexts.
- Batch operations are not transactions. If introduced, handle partial unprocessed work with bounded retry/backoff. Do not retry business conflicts indefinitely or blindly replay operations whose outcome is unknown.

## Capacity and cost work

Estimate from measured or stated traffic, item sizes, read consistency, transactions, retries, retention, and index write amplification. Include region, billing mode, pricing date, and assumptions; no invented dollar estimate. Inspect hot keys such as central ownership/counters using evidence before suggesting sharding, which can change concurrency guarantees. DynamoDB Local does not establish production throughput, IAM, TTL timing, or AWS availability behavior.

For a requested schema/capacity change, identify the additive migration, backfill or expiry behavior, expected temporary cost, verification, and rollback before executing an authorized remote change. Do not bundle scratch deployments or benchmarking into ordinary design/review work.

## Validate the behavior changed

Start with the relevant existing tests: `backend/tests-node/repositories.test.ts`, `backend/tests-node/control.test.ts`, `backend/tests-node/development.test.ts`, `src/__tests__/multiplayerDynamo.test.ts`, and `src/__tests__/developmentAdapters.test.ts`. Select meaningful cases for the change: concurrent consumption, expired-but-present tickets, stale-generation writes, exact versus conflicting result replay, failed delivery/recovery, account isolation, or concurrent retention.

Use deterministic Node tests without AWS credentials for ordinary development. A mocked command can verify SDK wiring but cannot prove real DynamoDB concurrency semantics; use an explicitly authorized DynamoDB Local integration when that guarantee matters. Follow the repository's required checks for code changes, and report cloud or local integration behavior as unverified unless exercised.

Return the concrete change or finding, its evidence, tests run, and remaining uncertainty. Full schema reviews should also provide the affected access-pattern table and migration/cost assumptions; omit those artifacts for narrow fixes when they add no value.

## Source and local adaptation

Substantially adapted from AWS's [amazon-dynamodb skill](https://github.com/aws/agent-toolkit-for-aws/blob/8abb89d6d4e52017eda516748b97dbbea7dffcb6/skills/specialized-skills/database-skills/amazon-dynamodb/SKILL.md), revision `8abb89d6d4e52017eda516748b97dbbea7dffcb6`. This version replaces the generic architecture and Python deployment/benchmark pipeline with PACKETLOSS-specific Node.js boundaries, scoped workflows, and existing persistence invariants. It does not vendor the upstream scripts or reference manuals. Retain [LICENSE](LICENSE) and [NOTICE](NOTICE).

Primary references: [DynamoDB developer guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [TTL behavior](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html), [expired items](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ttl-expired-items.html).
