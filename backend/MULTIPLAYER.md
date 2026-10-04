# Multiplayer control and storage contracts

`packetloss_api.multiplayer_lambda_handler.handler` is a separate Lambda application.
The existing account Lambda and its Cognito/password/solo-record routes remain unchanged.

Environment: `CONTROL_TABLE`, `TICKETS_TABLE`, `RESULTS_TABLE`, `PROFILE_TABLE_NAME`,
`MULTIPLAYER_CONTROL_REGION` (default `us-east-1`), `MULTIPLAYER_OWNER_SUB`, `SITE_ORIGIN`,
`STAGE=prod`, and `MULTIPLAYER_REGIONS_JSON`. The JSON has exactly `eu` and `na` entries,
each with `awsRegion`, `instanceId`, and `websocketUrl` (a WSS URL).

All multiplayer tables have one string partition key named `pk`. Profile reads use
the existing production account table's `pk=USER#<Cognito sub>, sk=PROFILE` key.
No password, Cognito client secret, or long-lived browser/server shared token is needed.

## HTTP API

All routes begin with `/v1/multiplayer`. `GET /status` is public and read-only.
`GET /capabilities`, `POST /start`, `POST /join-credentials`, and
`GET /matches/{matchId}` require the existing production Cognito JWT authorizer.
The Lambda trusts only its verified `requestContext.authorizer.jwt.claims.sub`.
The `x-test-user` header is accepted only by explicitly test-configured applications.

- Status: `{phase,activeRegion,instanceRunId,processGeneration,websocketUrl,protocolVersion,regions}`.
  Each region contains `{region,phase,ready,hostname,updatedAt}`. `updatedAt` is the
  time the API observed EC2 state. Phases are stopped, starting, ready, failed,
  draining, or stopping. Readiness requires a fresh process heartbeat and protocol 1.
- Capabilities: `{canStart}`. The configured immutable owner subject is never returned.
- Start request: `{region:"eu"|"na"}`; response 202 `{phase,region,operationId}`.
  `operationId` is the new `instanceRunId`. Regional starts require both real EC2
  instances to be stopped, a conditional central claim, then another real-state check.
  A failed/ambiguous initial start retains its region reservation. A timeout alone
  never releases it; reviewed operational reconciliation must mark a stop and confirm
  actual EC2 stop before switching regions. Same-region retry is permitted.
- Ticket request: `{region,operation:"create"|"join"|"reconnect",roomCode?}`.
  Create forbids a code; join/reconnect require six characters from `[A-Z2-9]`.
  Response `{ticket,expiresAt,websocketUrl,processGeneration}`. The secret is valid for
  60 seconds, and a fresh ticket is required for each connection attempt. The Node
  server still decides whether that room exists and whether admission is permitted.
- Match response: `{matchId,roomId,region,startedAt,completedAt,outcome,reason,standings}`.
  Each standing has `{playerId,nickname,color,score,rank,connected}`. Only original
  authenticated participants may read it. An unfinished result returns 409, not winners.

HTTP timestamps are UTC ISO strings. All responses use `Cache-Control: no-store`.
The service never starts EC2 during polling or ticket issuance. Owner startup is
limited to one new attempt per minute; tickets to 30 per authenticated user per minute.

## IAM operator invocation

The management CLI directly invokes the control Lambda through AWS IAM with
`{"source":"packetloss-operator","operation":"stop","force":false,"region":"eu"}`.
Omit region to use the current owned region; `force` must be an explicit boolean.
This is not an HTTP route, and an API Gateway request envelope never dispatches it.

The operator fences the current instance/run/process into draining, then uses SSM
to run the fixed installed `/usr/local/bin/packetloss-control-stop [--force]` helper.
The helper authenticates locally, closes admission, and reports JSON
`{safeToStop,activeMatches,pendingResults}` without revealing its admin token.
A normal busy/unverified stop is refused and leaves the server draining; retry once
its matches/results finish. A forced stop attempts an abort and bounded result flush,
but may proceed if the service is unreachable. The final conditional transition to
stopping still requires the same owned instance/run/process. Only that configured EC2
instance is stopped, preserving its disk. Control records `stopForced` and
`stopRequestedAt`; it does not fabricate final results for a crashed game process.

Success returns `{statusCode:202,phase:"stopping",region,operationId}`; an already
stopped instance returns 200. Failures return `{statusCode,code,message}` with 409
for active work or ownership changes and 503 for an unverified AWS operation.
The optional `interruptionConfirmed` flag reports whether forced local abortion
was observed with zero active matches. The CLI must inspect statusCode, then poll
the read-only status API until EC2 is confirmed stopped.

## Game-server direct DynamoDB contract

The instance IAM role uses the AWS SDK directly. These are not public HTTP endpoints.
`DynamoMultiplayerRepository` contains the reference conditional operations.

**Control** has `pk="SERVER"`, numeric `revision`, `lifecycle`, `activeRegion` (`eu`/`na`),
`instanceId`, `instanceRunId`, `processGeneration`, `startedAt`, `uptimeDeadline`,
`heartbeatAt`, and `protocolVersion=1`. Control times are integer epoch seconds.
Startup creates `processGeneration=null`, `heartbeatAt=0`, and a four-hour deadline.
On boot, the service must confirm its actual instance ID and region match this row,
then conditionally claim a fresh process generation for that run. Each heartbeat
must condition on instance/run/generation and increment `revision`; it cannot extend
`uptimeDeadline`. Publish readiness only after service initialization. Draining is
explicit and must not be overwritten by normal ready heartbeats. Do not put a TTL
`expiresAt` field on `SERVER`: automatic deletion would remove the regional fence.

**Tickets** use `pk=hex(SHA256(rawTicket))`, never plaintext. Fields are `subject`,
`nickname`, `avatar`, `region`, `instanceRunId`, `processGeneration`, `operation`,
`roomCode` (null for create), `issuedAt`, `expiresAt` (epoch seconds), and `used=false`.
Issue-time profile and identity are trusted snapshots. To consume a ticket, read it
consistently and execute one DynamoDB transaction:

1. Condition-check SERVER: expected run, generation, and region; lifecycle ready
   (or draining only for a reconnect ticket); `heartbeatAt > now - 30` and
   `uptimeDeadline > now`.
2. Update ticket: condition `used=false`, `expiresAt > now`, and matching region,
   run, generation; set `used=true` and `consumedAt=now`.

A transaction failure rejects authentication. TTL deletion is cleanup, not expiry
enforcement. Bind `subject` as player identity and `nickname` as its displayed name;
enforce the ticket's operation and room code for room admission. Do not let subsequent
client fields replace those values. Rate and connection limits also apply in Node.

**Results** use `pk=matchId`. Before announcing countdown, conditionally insert:
`matchId`, `roomId`, `region`, `instanceRunId`, `processGeneration`, `participants`
(2–4 unique authenticated subjects), `startedAt` (ISO), and `lifecycle="started"`.
An identical replay is successful; an existing conflicting identity is an error.

Finalization conditionally changes only an existing started match with the same run
and generation to `lifecycle="completed"|"aborted"`, storing the public summary under
`result`. Completed standings contain each original participant exactly once; aborted
matches have empty standings. Identical outbox replays succeed; a different terminal
outcome cannot replace an existing final result. Persist before announcing winners.
On process recovery, unfinished matches from the prior generation must be explicitly
aborted; already-completed results remain completed. Replaying a finalization from a
durable outbox does not require the old process to remain the active generation.

The control Lambda may read results but does not expose any route for writing them.
Game-server roles may condition-check SERVER, consume tickets, and write authoritative
results; browser credentials and the existing solo-record handler have no such writes.

## WebSocket snapshot contract

The server sends the validated immutable map once, then broadcasts authoritative state
at the configured snapshot rate (20 Hz by default). A snapshot never repeats the map's
pickup objects. Its `pickupSet` chooses the shorter of `{basis:"remaining",ids:[...]}`
and `{basis:"removed",ids:[...]}`; the browser validates those IDs against the received
map before rebuilding presentation state. Positions, scores, effects, elapsed steps,
and pickup membership remain server-authored. Clients submit only sequenced direction
intent tied to the current match ID. The server stops accepting new countdowns before
the three-second countdown plus 180-second match can cross the fixed uptime deadline.

## Full local development contract

`pnpm dev:full` runs `compose.dev.yml`: DynamoDB Local, account/control Python Lambda runtime emulators, a gateway at `http://127.0.0.1:8787`, and the authoritative game server at `ws://127.0.0.1:8080/ws`. Public requests use the same handlers and DynamoDB repositories as deployment; local Cognito replacement supplies simpler accounts and name-only guests. The production entrypoints retain their AWS adapters.

DynamoDB stores profiles/solo records, control state, hashed tickets, and multiplayer results in separate production-shaped tables. Development identities and refresh sessions use an additional local-only table. Data persists in the `packetloss-dev_dynamodb` volume; the Node outbox and auth signing key persist in `.packetloss-dev/data`. Bootstrap imports any existing SQLite data once without changing the source file. Lambda cold starts never reset runtime state. A launcher restart creates a new generation and replays the outbox, aborting unfinished matches without winners.

The game automatically becomes ready under the local `eu` identifier. Local account/control HTTP cooldowns are disabled; ticket expiry/consumption and WebSocket input limits remain enforced. `--stop` preserves data, while explicit `--reset` deletes the database volume and data directory. See the root README for Docker prerequisites, ports, logs, and development commands.

Local access tokens are signed development JWTs containing the stable account subject.
The API validates them directly because API Gateway is absent, while the browser uses
the same bearer-token and HttpOnly refresh-cookie flow. Access tokens last one hour;
opaque refresh-token digests last 30 days and use a SameSite=Strict, localhost-compatible
cookie only in the explicit development stage. The four confirmed seed users are
`owner@packetloss.local` and `friend1@packetloss.local` through
`friend3@packetloss.local`, all with password `packetloss-dev`. Their subjects are
`dev-owner` and `dev-friend-1` through `dev-friend-3`; the owner alone receives start
capability. Signup confirmation and password reset use the fixed local code `000000`
and send no email.

The Node development adapter authenticates to these loopback-only routes with a
per-launch bearer secret:

- `POST /internal/dev/heartbeat`
- `POST /internal/dev/tickets/consume`
- `POST /internal/dev/matches/start`
- `POST /internal/dev/matches/finish`

They bind the current instance run and process generation, consume each opaque ticket
once, and preserve start/final-result idempotency. They are development-only Lambda routes, have no
browser-facing CORS policy, and reject missing or incorrect
internal authorization. The internal secret exists only for that launcher process; the
JWT signing key is stored as `.packetloss-dev/data/auth.key` so refresh sessions survive
a normal restart. Neither value uses a `VITE_*` environment variable.

Local status preserves the regional response shape while describing one loopback game process. `eu` becomes ready after its heartbeat; `na` stays stopped. No AWS machine is started. This stack exercises Lambda invocation and DynamoDB transactions, accounts, profiles, scores, tickets, rooms, reconnects, rematches, and result outbox recovery. Cognito authorizers, IAM/SSM, EC2 regional exclusivity, DNS, TLS, cloud consistency guarantees, and real network/capacity characteristics still require deployed verification.

## Local checks

From `backend`, install `requirements-dev.txt` in an isolated Python 3.12 environment,
then run `ruff check .` and `PYTHONDONTWRITEBYTECODE=1 python -m pytest`.
The multiplayer repository tests use Moto's in-process DynamoDB emulator; they do not
contact AWS. Remote IAM, API Gateway authorizer wiring, EC2 startup, DNS, TLS, and Node
adapter parity still require the reviewed integration deployment and lifecycle checks.
