---
name: packetloss-performance
description: Diagnose and improve PACKETLOSS server timing, snapshot traffic, connection lifecycle, browser frame time, and Three.js resource use with comparable measurements. Use for lag, capacity, bandwidth, frame drops, and leaks; not ordinary feature work or asset authoring.
---

# PACKETLOSS performance

Read [architecture](../../../docs/ARCHITECTURE.md) and the relevant [testing guidance](../../../docs/TESTING.md). Ground the investigation in current code; the entry points below are a map, not frozen performance targets.

## Establish the measurement

- Record the symptom, game mode/map/seed, player and room counts, input workload, runtime/build, hardware, and measurement interval. For browser measurements also record viewport, drawing-buffer size, effective pixel ratio, and visibility state.
- Separate startup/shader preparation, active play, stage changes, reconnects, and teardown. Capture a baseline before editing and repeat the same scenario after the change. Report sample count and tail latency, not just average FPS.
- Installing or invoking this skill does not authorize a browser session, dev server, or load test. Use existing evidence and bounded domain tests unless the user has requested that execution. A requested load test needs a concrete target, concurrency, duration, and stop condition; do not silently exercise deployed infrastructure.
- Reuse available diagnostics before adding instrumentation. Use Node/TypeScript for tooling, keep instrumentation at transport/rendering boundaries, and avoid a permanent helper unless it has a concrete recurring use. Verify version-sensitive profiling APIs against current official documentation before using them.

## Server and network

Start with [httpServer](../../../server/httpServer.ts), [RoomService](../../../server/RoomService.ts), [SnapshotSender](../../../server/SnapshotSender.ts), and [simulation constants](../../../src/game/simulation/types.ts).

- The existing authenticated `/internal/status` read reports simulation-work samples, P99/max work, tick debt, coalesced snapshots, memory, rooms, connected players, and pending results. Reuse an authorized endpoint without exposing its admin token. Drain/resume/abort endpoints mutate state and are not profiling reads.
- `simulationWorkP99Ms` times a whole `RoomService.pump()` invocation while matches are active, including any catch-up work. It is not one simulation step or event-loop delay. Record these separately when that distinction is needed. Tick debt and overload aborts must remain visible; never make an optimization look successful by discarding simulation debt or relaxing overload rules.
- Measure serialized snapshot bytes, actual send rate, recipients, socket buffering, and coalescing together. Distinguish application payload from wire overhead. Preserve reliable control/map/terminal ordering when changing batching; playing snapshots can replace obsolete queued state, but input intent and terminal transitions have different semantics.
- For connection churn, check cleanup after disconnect/reconnect, stale callbacks, heartbeat timers, reservations, queued messages, and result persistence. Memory should settle across repeated equivalent cycles; one RSS increase alone does not prove a leak.
- Compare server timings with [client synchronization diagnostics](../../../src/game/simulation/MultiplayerSynchronization.ts): RTT, snapshot age, pending inputs, interpolation underruns, and correction magnitude/reason. Do not attribute a client frame stall to network delay from RTT alone.

## Rendering and resource ownership

Start with [ThreeRendererAdapter](../../../src/game/infrastructure/adapters/ThreeRendererAdapter.ts), [fixed-step loop](../../../src/engine/loop.ts), [DebugOverlaySystem](../../../src/game/systems/DebugOverlaySystem.ts), and [multiplayer presentation](../../../src/game/ui/MultiplayerPresentation.ts).

- Existing frame diagnostics measure frame intervals, not GPU execution time. Separate simulation, presentation, draw submission, and GPU work before choosing an optimization. Capture draw calls/triangles and resource counts when useful; those counts alone are not a performance result.
- Gameplay already adapts resolution after sustained slow active frames. Report quality-tier/drawing-buffer changes alongside timings so lower resolution cannot masquerade as a like-for-like speedup. Paused, hidden, and debug-frozen time must not drive adaptation.
- Inspect [MazeScene](../../../src/game/infrastructure/three/MazeScene.ts) and its callers for geometry construction during play. Arena transitions prepare geometry before closures; preserve this bounded preparation and cancellation cleanup rather than moving work back into closure frames.
- Follow ownership in [ArcadeAssets](../../../src/game/infrastructure/three/ArcadeAssets.ts): shared GLB resources live with the asset library; instance-specific resources live with their instances. Check cancelled loading, repeated start/destroy, effect expiry, preview switching, and unused prepared stages before introducing pools or caches.

## Verify and report

Use the smallest scenario that demonstrates the bottleneck and the preserved behavior. Relevant existing suites include `multiplayerRooms`, `multiplayerSnapshotSender`, `multiplayerLatency`, `multiplayerPresentation`, `threeRendererAdapter`, `threeSceneLifecycle`, and `assetPreviewSession` under [src/__tests__](../../../src/__tests__). Keep timing benchmarks separate from deterministic correctness assertions; do not add machine-dependent wall-clock thresholds to ordinary unit tests.

After code changes, follow the repository's required checks and the affected-area checks in `docs/TESTING.md`. Report baseline versus result, workload and environment, quality changes, remaining bottleneck, and skipped validation. Local unit tests do not establish deployed capacity, GPU timing, or visible smoothness. Do not invent FPS, bandwidth, memory, or concurrency budgets; use an existing project requirement or an explicitly agreed target.
