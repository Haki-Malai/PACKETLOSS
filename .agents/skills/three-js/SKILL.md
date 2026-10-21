---
name: three-js
description: Implement or debug PACKETLOSS's vanilla Three.js renderer, GLB loading and playback, materials, shaders, and GPU resource lifecycle. Use for runtime 3D rendering work; use the asset workflow for visual asset design and packetloss-performance for measurement-led profiling.
license: MIT
metadata:
  upstream: Jbmanllr/agent-skills
  revision: 319a0f1aac3b3580e736d457f217d716b356aa35
---

# Three.js for PACKETLOSS

Use the existing imperative Three.js presentation. React owns menus and composition; it does not imply React Three Fiber. Check the installed version in [package.json](../../../package.json), then use `find-docs` for version-sensitive APIs. The bundled upstream examples span older releases: treat them as reference material, not drop-in project code. Do not migrate renderers, introduce another render loop, or add physics libraries for an ordinary rendering task.

## Follow the existing ownership and time boundaries

- Read [Architecture](../../../docs/ARCHITECTURE.md), then locate the caller and lifecycle owner in [three infrastructure](../../../src/game/infrastructure/three). Keep gameplay rules outside rendering. Gameplay `(x, y)` maps to scene `(x, height, z)`.
- Reuse [ArcadeAssets](../../../src/game/infrastructure/three/ArcadeAssets.ts), [GlbResources](../../../src/game/infrastructure/three/GlbResources.ts), and [PowerupAssets](../../../src/game/infrastructure/three/PowerupAssets.ts). Inspect cancellation and partial-load failure paths before adding asset work.
- Preserve authored clip and node names, morph targets, durations, and the [powerup manifest](../../../public/assets/models/powerups/manifest.json). Validate required decoder/extension support in the actual loader before compressing a GLB or adopting a generic export preset.
- Sample animation from the owning game/preview/synchronization clock. `PowerupModel.sample` seeks authored clips at absolute elapsed time; adding wall-clock deltas breaks pause, rewind, late snapshots, and preview parity. Keep cosmetic offsets separate from the gameplay root.
- Track resource ownership before cleanup: shared geometry belongs to the asset library; cloned instance materials and mixers belong to the instance. Do not apply a generic recursive dispose recipe to shared templates. Loading cancellation, replacement, and repeated teardown must release only owned resources.
- Keep the existing camera, lighting, palette, resolution policy, and shared scene presentation unless changing them is requested. Frontend/WebGL inspection and starting a dev server require the user's explicit request under [AGENTS.md](../../../AGENTS.md).

## Load references selectively

The following upstream references are retained for topic lookup. Project ownership, clock, and validation rules above take precedence over their standalone examples.

| Topic | Reference |
| --- | --- |
| Scene hierarchy, renderer, coordinates | [Fundamentals](references/01-fundamentals.md) |
| Geometry and instancing | [Geometry](references/02-geometry.md) |
| Materials and textures | [Materials](references/03-materials.md), [textures](references/04-textures.md) |
| Lighting and cameras | [Lighting](references/05-lighting.md), [cameras](references/06-cameras.md) |
| Loading and animation | [Loaders](references/07-loaders.md), [animation](references/08-animation.md) |
| Interaction and controls | [Interaction](references/09-interaction.md), [controls](references/10-controls.md) |
| Shaders and postprocessing | [Shaders](references/11-shaders.md), [postprocessing](references/12-postprocessing.md) |
| Math, performance, ownership patterns | [Math](references/13-math.md), [performance](references/14-performance.md), [patterns](references/18-patterns.md) |
| Explicitly requested experimental work | [Node materials](references/15-node-materials.md), [physics/XR](references/16-physics-vr.md), [WebGPU](references/17-webgpu.md) |

## Validate the changed behavior

Use [Testing](../../../docs/TESTING.md) to choose relevant model, preview, and scene-lifecycle regressions. Check shared-resource survival, private-resource disposal, cancelled loading, pause/resume, rewind, and gameplay/preview parity where affected. A Node test passing does not establish visual quality or real GPU behavior. When browser testing is authorized, inspect the actual changed scene at gameplay scale and record remaining limitations. Follow repository checks after application code changes.

Source: [Jbmanllr/agent-skills](https://github.com/Jbmanllr/agent-skills/tree/319a0f1aac3b3580e736d457f217d716b356aa35/skills/three-js), formerly noklip-io/agent-skills. The entrypoint was rewritten for PACKETLOSS on 2026-10-21; reference files are unchanged. See [LICENSE.txt](LICENSE.txt).
