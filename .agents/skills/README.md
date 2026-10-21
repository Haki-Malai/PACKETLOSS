# PACKETLOSS agent skills

These skills are installed locally for PACKETLOSS in `.agents/skills/`.

## Gameplay, online services, and testing

- [PACKETLOSS multiplayer](packetloss-multiplayer/SKILL.md) — authoritative simulation, prediction, acknowledgements, room lifecycle, reconnects, and focused regressions.
- [Security threat modeling](security-threat-model/SKILL.md) — scoped, evidence-based analysis of trust boundaries and abuse paths, including ticket replay and match-result integrity. Use when a security threat model or abuse-path review is requested.
- [Playwright](playwright/SKILL.md) — explicitly requested browser testing for lobby/match/reconnect/rematch flows, controls, and visual checks, using the project-local CLI wrapper.
- [DynamoDB](amazon-dynamodb/SKILL.md) — access patterns, conditional writes, atomic ticket consumption, durable results, retention, and cost analysis through the existing Node.js repositories.
- [PACKETLOSS performance](packetloss-performance/SKILL.md) — measured server timing, bandwidth, connection cleanup, frame time, and GPU resource investigations.
- [Three.js](three-js/SKILL.md) — runtime GLB playback, materials, shaders, loading, and resource ownership in the existing vanilla Three.js renderer.

Skills are available by name (for example, `$packetloss-multiplayer`) or through relevant task requests. Installing a skill does not start a server, browser, load test, or AWS operation. Repository authorization rules still apply. These additions install no application dependencies; Playwright's wrapper resolves its CLI through npx when invoked.

## Assets and Blender

- [PACKETLOSS asset workflow](packetloss-asset-workflow/SKILL.md) — project-specific A/B/C 3D drafts, small animated previews, selection, refinement, and runtime validation. Start here for new asset designs or visual redesigns. Previews appear in chat by default; explicitly request a preview PR into `dev`, or “PR only” for delivery there without duplicating previews in chat.

- [Blender core](blender-core/SKILL.md) — execution through Blender MCP or headless Blender, API guidance, and verification.
- [Animation](blender-animation/SKILL.md) — keyframes, loops, actions, NLA clips, baking, and root motion.
- [Export pipelines](blender-export-pipelines/SKILL.md) — GLB/glTF export and checks of exported meshes, materials, skins, and animation clips.
- [Asset QA](blender-asset-qa/SKILL.md) — geometry checks and visual review.
- [Game optimization](blender-game-optimization/SKILL.md) — triangle, material, texture, and bone budgets for real-time assets.

For direct Blender tasks, start with Blender core, then load the skills relevant to the asset task. Follow PACKETLOSS's [product](../../docs/PRODUCT.md) and [architecture](../../docs/ARCHITECTURE.md) contracts when editing assets, including existing clip names and timing.

The upstream pack targets **Blender 5.2+**. Live workflows require a running Blender MCP addon; headless workflows require a local Blender executable. The bundled Python helpers belong to the Blender skill pack and are not application dependencies. Installation has been checked; live Blender execution has not yet been validated for this project.

The PACKETLOSS asset workflow is maintained in this repository. The five Blender support skills come from upstream.

Source: [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills), pinned to revision [71d031dab8bc6729504d11a78cbe91945401045f](https://github.com/EL4CTEO/blender-skills/tree/71d031dab8bc6729504d11a78cbe91945401045f). The five skill folders are preserved unchanged from upstream. License: [MIT](https://github.com/EL4CTEO/blender-skills/blob/71d031dab8bc6729504d11a78cbe91945401045f/LICENSE).

## Sources for the gameplay and service skills

The multiplayer and performance skills are maintained in this repository. The following skills have local adaptations; preserve those changes when updating from upstream.

| Skill | Pinned source | Local adaptation |
| --- | --- | --- |
| Security threat model | [openai/skills, 49f948f](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model) | PACKETLOSS boundaries, scoped output, targeted context clarification, and reports only when requested. |
| Playwright | [openai/skills, 49f948f](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/playwright) | Project-local paths, explicit browser scope, isolated player sessions, and temporary artifacts. |
| DynamoDB | [aws/agent-toolkit-for-aws, 8abb89d](https://github.com/aws/agent-toolkit-for-aws/tree/8abb89d6d4e52017eda516748b97dbbea7dffcb6/skills/specialized-skills/database-skills/amazon-dynamodb) | Rewritten for current Node.js repositories; no upstream Python deployment/benchmark scripts or dependencies. |
| Three.js | [Jbmanllr/agent-skills, 319a0f1](https://github.com/Jbmanllr/agent-skills/tree/319a0f1aac3b3580e736d457f217d716b356aa35/skills/three-js) (formerly noklip-io) | Project-specific entrypoint with upstream references; shared-resource ownership and absolute animation clocks take precedence over standalone examples. |

Upstream license and notice files are included in the corresponding skill folders. Installation validation checks structure, local links, and the CLI wrapper; it does not establish runtime, browser, or deployed-cloud behavior.
