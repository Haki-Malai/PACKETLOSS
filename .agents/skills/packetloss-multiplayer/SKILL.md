---
name: packetloss-multiplayer
description: Implement, debug, and review PACKETLOSS multiplayer simulation, protocol, prediction, synchronization, room lifecycle, and reconnect behavior. Use for online gameplay changes and desync or disconnect bugs; not general rendering, account-only work, or infrastructure deployment.
---

# PACKETLOSS Multiplayer

Use the existing server-authoritative Battle Royale architecture. `DataRace` is its internal name, not a separate game mode. Read the [multiplayer architecture](../../../docs/ARCHITECTURE.md#shared-simulation-and-multiplayer-boundaries), [product rules](../../../docs/PRODUCT.md#battle-royale-multiplayer), and the relevant source before changing behavior. Resolve current protocol versions and timing limits from code; historical version descriptions in docs may lag.

## Locate the boundary

| Concern | Start here |
| --- | --- |
| Authority, fixed steps, command consumption | [DataRace.ts](../../../src/game/simulation/DataRace.ts), [types.ts](../../../src/game/simulation/types.ts) |
| Shared movement and paid boost rules | [movement.ts](../../../src/game/simulation/movement.ts), [boost.ts](../../../src/game/simulation/boost.ts) |
| Prediction, acknowledgements, interpolation and clocks | [MultiplayerSynchronization.ts](../../../src/game/simulation/MultiplayerSynchronization.ts), [prediction.ts](../../../src/game/simulation/prediction.ts) |
| Wire validation and compact snapshot reconstruction | [messages.ts](../../../src/game/protocol/messages.ts), [version.ts](../../../src/game/protocol/version.ts) |
| Admission, room ownership, reservations, results | [RoomService.ts](../../../server/RoomService.ts), [httpServer.ts](../../../server/httpServer.ts) |
| Congestion and snapshot ordering | [SnapshotSender.ts](../../../server/SnapshotSender.ts) |
| Browser connection and recovery | [MultiplayerSocketClient.ts](../../../src/game/infrastructure/adapters/MultiplayerSocketClient.ts), [MultiplayerRecovery.ts](../../../src/game/infrastructure/adapters/MultiplayerRecovery.ts), [useMultiplayerSession.ts](../../../src/game/ui/useMultiplayerSession.ts) |
| Rendering and visibility lifecycle | [MultiplayerPresentation.ts](../../../src/game/ui/MultiplayerPresentation.ts), [MultiplayerViewport.tsx](../../../src/game/ui/MultiplayerViewport.tsx) |

For a desync, trace one command through send acceptance, scheduled tick, server consumption, acknowledgement, replay, and displayed sample. Record match/map identity, process/run identity, sequence, target tick, snapshot tick, publication, receive time, and sampled tick where applicable. This separates transport delay from simulation or presentation defects without changing multiple layers at once.

## Preserve the contracts at the affected boundary

- **Authority:** Clients send validated intent, never authoritative position, score, pickups, or results. Keep simulation independent of React, Three.js, Express, and AWS. Reuse movement, boost, and combat rules shared with existing modes rather than creating a network-only implementation.
- **Ticks and commands:** Snapshot tick N is the state after step N. Consume due intent before that step's movement; receiving a message must not advance gameplay. Acknowledge consumed sequences, not merely received messages. Same-tick direction changes use the final direction, while boost edges remain ordered. Late commands apply at the next step without retroactive travel. Read queue and scheduling bounds from the implementation. Weapon activation has a separate sequence/acknowledgement stream and must survive direction coalescing.
- **Prediction:** Add a pending command only after transport accepts its send. Restore authoritative movement and replay only unacknowledged accepted commands; do not replay every command after reconnect. Fractional display sampling uses disposable state and must not mutate the completed prediction or rewrite a partially drawn input step. Boost prediction retains its private spending budget, but displayed scores, pickup claims, eliminations, and weapon outcomes stay authoritative. Honor `movementEnabled`, including terminal freeze and the explicit development-only solo exception.
- **Ordering:** Preserve protocol, process/run, match/map, and publication fences. A newer publication at the same tick can contain a reconnect or abort update; rejecting every equal-tick snapshot is incorrect. Send the matching map before its first or reconnect snapshot, then reconstruct compact pickup IDs against it. Keep the shared protocol constant and all peer schemas compatible when changing the wire contract.
- **Presentation:** Remote motion, heading, and confirmed effects use the same buffered sample. Interpolate along valid corridors; hold endpoints across unsafe gaps rather than drawing through walls or portals. Topology changes discard unsafe corrections while retaining valid history and camera follow. Portal travel, reconnection, and followed-player changes have different camera semantics from ordinary acknowledgements. Keep raw movement publications available to presentation without turning every tick into a React update.
- **Stalls and congestion:** Bound prediction and suppress ordinary commands when gameplay snapshots stall, even if heartbeat pongs continue. Preserve the boost-cancel escape. Coalesce only unsent playing snapshots, keeping control, map, and terminal messages in order; keep timeout and disposal cleanup intact.
- **Recovery and lifecycle:** Authoritative disconnect clears queued intent and active boost, freezes the player's position, and leaves arena vulnerability intact. Reconnect restores the reserved player or spectator using fresh authenticated single-use credentials; success requires authoritative room admission and, for active matches, the matching map and snapshot. Bound automatic retries by the original reservation deadline. Navigation, logout, terminal errors, or obsolete admissions must invalidate late callbacks. Hidden tabs suppress input without pausing server time; presentation reset must preserve commands already transmitted. Keep results durable before publishing final rankings or permitting rematch, and keep fresh rematch identities/maps isolated from old messages.

## Verify the changed behavior

Choose the smallest relevant existing scenario and extend it through public interfaces. Use authored maps, fixed seeds, controlled clocks, and an independent expected outcome; matching two repeat runs alone proves little. Follow [TESTING.md](../../../docs/TESTING.md#battle-royale-and-multiplayer-regression-scenarios) for commands and required checks.

- For scheduling changes, use [multiplayerSynchronization.test.ts](../../../src/__tests__/multiplayerSynchronization.test.ts): acknowledgement before/after the target step, same-tick direction plus ordered boost edges, late bursts, duplicate sequences, bounded future intent, and queue reset on disconnect.
- For replay or smoothing, use [multiplayerLatency.test.ts](../../../src/__tests__/multiplayerLatency.test.ts): compare client samples to corresponding authoritative ticks under latency/jitter and multiple display rates; cover failed sends, partial-step immutability, corners, portals, topology changes, terminal freeze, and stalled-stream cancellation as relevant.
- For boost lifecycle and held controls, reuse [boost.test.ts](../../../src/__tests__/boost.test.ts) and [multiplayerInput.test.tsx](../../../src/__tests__/multiplayerInput.test.tsx): queued versus consumed boost at disconnect, no replay after fresh admission, and a fresh press after cancellation.
- For admission and recovery, use [multiplayerSocketClient.test.ts](../../../src/__tests__/multiplayerSocketClient.test.ts), [multiplayerRecovery.test.ts](../../../src/__tests__/multiplayerRecovery.test.ts), and [multiplayerRooms.test.ts](../../../src/__tests__/multiplayerRooms.test.ts): stale generations, newer same-tick publications, fresh-ticket full admission, original reservation expiry, cancellation with late completion, rematch isolation, and persistence failures.
- For wire or congestion changes, use [multiplayerProtocol.test.ts](../../../src/__tests__/multiplayerProtocol.test.ts), [multiplayerTransport.test.ts](../../../src/__tests__/multiplayerTransport.test.ts), and [multiplayerSnapshotSender.test.ts](../../../src/__tests__/multiplayerSnapshotSender.test.ts). The transport suite already supplies real loopback WebSockets; prefer it to inventing a second transport harness.

Do not infer browser smoothness, live-network reliability, or deployed capacity from these checks. Browser inspection, dev-server startup, and remote operations retain the repository's authorization boundaries; loading this skill does not authorize them.
