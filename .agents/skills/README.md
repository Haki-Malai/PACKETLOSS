# Blender agent skills

These skills are installed locally for PACKETLOSS in `.agents/skills/`.

- [PACKETLOSS asset workflow](packetloss-asset-workflow/SKILL.md) — project-specific A/B/C 3D drafts, small animated previews, selection, refinement, and runtime validation. Start here for new asset designs or visual redesigns.

- [Blender core](blender-core/SKILL.md) — execution through Blender MCP or headless Blender, API guidance, and verification.
- [Animation](blender-animation/SKILL.md) — keyframes, loops, actions, NLA clips, baking, and root motion.
- [Export pipelines](blender-export-pipelines/SKILL.md) — GLB/glTF export and checks of exported meshes, materials, skins, and animation clips.
- [Asset QA](blender-asset-qa/SKILL.md) — geometry checks and visual review.
- [Game optimization](blender-game-optimization/SKILL.md) — triangle, material, texture, and bone budgets for real-time assets.

For direct Blender tasks, start with Blender core, then load the skills relevant to the asset task. Follow PACKETLOSS's [product](../../docs/PRODUCT.md) and [architecture](../../docs/ARCHITECTURE.md) contracts when editing assets, including existing clip names and timing.

The upstream pack targets **Blender 5.2+**. Live workflows require a running Blender MCP addon; headless workflows require a local Blender executable. The bundled Python helpers belong to the Blender skill pack and are not application dependencies. Installation has been checked; live Blender execution has not yet been validated for this project.

The PACKETLOSS asset workflow is maintained in this repository. The five Blender support skills come from upstream.

Source: [EL4CTEO/blender-skills](https://github.com/EL4CTEO/blender-skills), pinned to revision [71d031dab8bc6729504d11a78cbe91945401045f](https://github.com/EL4CTEO/blender-skills/tree/71d031dab8bc6729504d11a78cbe91945401045f). The five skill folders are preserved unchanged from upstream. License: [MIT](https://github.com/EL4CTEO/blender-skills/blob/71d031dab8bc6729504d11a78cbe91945401045f/LICENSE).
