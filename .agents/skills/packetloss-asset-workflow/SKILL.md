---
name: packetloss-asset-workflow
description: Create or visually redesign PACKETLOSS game assets with selectable 3D drafts and short animated previews, then refine the chosen option and validate GLB integration. Use for enemy, pickup, weapon, or effect art and animation work; not unrelated UI work or mechanical asset fixes.
---

# PACKETLOSS asset workflow

## Establish the asset contract

Read the repository's AGENTS.md and the relevant sections of [PRODUCT.md](../../../docs/PRODUCT.md), [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md), and [TESTING.md](../../../docs/TESTING.md). Resolve paths from the repository root when running commands.

Inspect the existing asset and its consumers before authoring. Record its identity, role, dimensions, axes, pivot, required node/material/morph names, clip names, durations, loop flags, and runtime-controlled transforms. Derive these from current files; do not substitute generic Blender units or naming conventions. Keep gameplay collision and timing unchanged unless requested.

Use [blender-core](../blender-core/SKILL.md) for Blender execution and [blender-animation](../blender-animation/SKILL.md) for motion. Check the installed Blender version before using the pack's 5.2+ recipes. Use the existing MCP connection, or local headless Blender when live access is unavailable. Never reset the user's live scene to build options.

Useful sources, selected by task:

- Enemies and multipliers: [ArcadeAssets.ts](../../../src/game/infrastructure/three/ArcadeAssets.ts), and their GLBs under public/assets/models/.
- Powerups: [manifest.json](../../../public/assets/models/powerups/manifest.json), [PowerupAssets.ts](../../../src/game/infrastructure/three/PowerupAssets.ts), and [offensivePowerups.ts](../../../src/game/shared/offensivePowerups.ts). The manifest selects exact clips and loop behavior; the runtime also depends on named nodes.
- Procedural player: [HologramPacket.ts](../../../src/game/infrastructure/three/HologramPacket.ts). Do not convert it into a GLB merely to follow this workflow.
- Preview behavior: [assetCatalog.ts](../../../src/dev/assets/assetCatalog.ts), [AssetPreviewScene.ts](../../../src/dev/assets/AssetPreviewScene.ts), [PowerupPreviewAssets.ts](../../../src/dev/assets/PowerupPreviewAssets.ts), and [AssetPreviewViewport.ts](../../../src/dev/assets/AssetPreviewViewport.ts).

## Generate selectable options first

For a new design or a visual redesign, default to **three distinct options, A/B/C**, unless the user specifies a count or has already selected a direction. Vary meaningful silhouette, construction, or motion choices while preserving the asset's gameplay identity and established palette. For a precise mechanical fix or an already chosen revision, work directly on that target; do not restart ideation.

Create lightweight, actual 3D drafts with simple materials and a representative animation. Store candidates, renders, and a short index in a task-specific temporary directory outside shipped assets. Keep each candidate's editable source until selection and refinement are complete. Do not replace canonical GLBs or change runtime consumers during this stage.

Prefer renders of these drafts over generated concept images: they expose real proportions and feasible motion. If image generation is explicitly requested or useful before modeling, use the imagegen skill and label those images as concept art. A generated still or simulated camera pan is not evidence of a working mesh or authored animation.

For each option provide:

- A crisp PNG still and a small animated GIF, normally **320 × 320 at 12 fps**. Use a wider frame for beams or effects when needed to keep the full silhouette visible.
- About **2–3 seconds of idle motion**, or the complete authored action at its real duration. A one-shot may repeat for comparison with a clearly separated hold/reset; do not pretend its reset is a seamless loop. Keep a loop's period exact rather than stretching it to the preview default.
- A stable game-like view, consistent lighting, background, scale, and timing across candidates. Use the actual game camera parameters where practical and include a gameplay-size view for readability. Frame the full animated bounds once; do not auto-zoom each frame. A turntable may supplement, but must not replace, the minor animation preview.
- A clearly labeled A/B/C comparison sheet, individual preview links, and one sentence per option describing its distinguishing design and motion. Label Blender renders as drafts, not verified in-game output.

PNG frames are the visual reference; GIF is a convenient motion proxy with limited colors and transparency. Use a common opaque game-like background for GIF comparisons so glow and edges remain readable. If a working local encoder supports animated WebP, it can supplement GIF for better color/alpha fidelity. Do not make format selection another required user decision.

Discover available render/encoding tools first. Reuse installed tools and existing helpers; keep new orchestration in Node.js and Blender-specific code inside Blender. Do not silently install dependencies or add one-off scripts to the repository. If animated encoding is unavailable, deliver an explicitly labeled PNG frame strip with timestamps and explain the missing encoder; never claim it is an animated preview. If Blender cannot run, explain that actual 3D previews are blocked rather than substituting unverified concept images.

Inspect the stills and representative start/middle/end frames, check dimensions and frame timing, and check file existence and nonzero size. Verify encoded frame count/duration with available tools. Check silhouette, clipping, palette, and loop seams. Report separately whether actual playback was observed.

Present the completed options and **wait for the user's selection before final refinement or integration**. Ask for A/B/C or a specific combination, with a brief recommendation. Reuse a selection already given; if the user explicitly delegates the choice, select and explain it without asking again. Preserve candidate IDs and previews across revisions so comparisons remain meaningful.

## Deliver previews in chat or an explicitly requested PR

**Default: show the comparison sheet, individual animated previews, and short option descriptions in chat.** Do not create a branch, publish files, or open a PR just because this skill is active.

Within this asset-preview task only:

- “Open a PR” or “put the previews in a PR” requests a preview PR as well as the normal chat presentation.
- “PR only” requests the same preview generation, delivered in the PR instead of duplicating the previews in chat. Return only a concise status and the PR link in chat, plus any blocker or required reporting.
- An unrelated PR request must not trigger asset generation or this delivery mode. A request to edit this skill's PR behavior does not itself request a PR.

When explicitly requested, prepare the previews first, then create a **draft PR targeting dev** from a dedicated preview branch based on the current remote dev. Use gh for repository/PR context and follow the repository's remote-action and git rules. Keep unrelated working-tree changes out of the branch. Reuse an existing PR only when it belongs to this same preview task; do not overwrite an unrelated PR. Do not merge or write directly to dev.

Keep the PR limited to review artifacts in docs/asset-previews/<task-slug>/ (comparison PNG, individual GIFs/PNGs, and a short index). This is the PR-mode exception to keeping previews only in temporary storage. Keep large editable drafts local unless explicitly requested. Do not replace shipped GLBs or implement any option before the selection step.

Use a short title such as “preview: Firewall design options”. The body should contain one or two sentences describing the asset and the differences being explored, the labeled A/B/C stills and animated previews with one sentence per option, and a brief validation/limitations note. State that these are drafts awaiting selection. Use repository-hosted image URLs tied to the preview commit, with direct file links as fallbacks; never use local filesystem paths or temporary-machine URLs. Preserve repository access controls and do not upload private previews to a public third-party host. If only timestamped frame strips could be produced, label that limitation in the PR too.

Prepare the exact multiline body in a file for gh's body-file input. After creation or update, re-read the PR to verify its base is dev, its head is the intended preview branch, and its body and referenced preview files are present and accessible through the authenticated repository connection. Do not claim inline animation playback was verified unless it was actually observed. If publication fails, retain the completed local artifacts and report the blocker; “PR only” is not permission to claim delivery or silently switch to chat previews.

Keep the selection gate above in every delivery mode. Opening the preview PR does not select an option or authorize final integration.

## Refine and integrate the selected option

Refine the chosen draft, preserving its approved silhouette and motion. Use [blender-asset-qa](../blender-asset-qa/SKILL.md), [blender-game-optimization](../blender-game-optimization/SKILL.md), and [blender-export-pipelines](../blender-export-pipelines/SKILL.md) as applicable. Project contracts override generic presets. Check actual loader support before adding compression or glTF extensions; do not assume the upstream web preset matches this project.

For GLB assets, export a candidate, inspect its JSON/animation data, and re-import it for verification before replacing the canonical file. Compare required clips, names, durations, loop expectations, bounds, materials, skins/morphs, and required nodes with the recorded contract. When practical, produce the final preview from the re-imported GLB to expose export losses. Blender re-import checks do not prove Three.js rendering parity.

Keep absolute-time sampling, pause, rewind, and one-shot clamping intact. Animate presentation children without moving gameplay roots or grounded shadows. Preserve the existing ownership of shared geometry, private materials, and mixers. Update only the selected asset and necessary consumers or metadata; follow the repository's git preflight and validation instructions.

For procedural assets, reuse their existing runtime implementation and preview paths instead of creating a parallel production model. Browser inspection and dev servers still require explicit authorization. When authorized, verify through the existing Asset Lab at /dev/assets with the shared runtime player; check game-scale appearance, pause, seeking, rewind, and relevant states. When not authorized, report in-game visual verification as pending.

Run focused asset checks and the repository's required checks for code changes. Regenerate enemy portraits with the maintained scripts/render-enemy-portraits.js tool when the selected enemy changes. Update product documentation only if product behavior changes. Deliver the selected asset paths, final still/motion preview, relevant contract checks, and any unverified runtime behavior. Remove disposable generators after retaining required outputs; do not discard drafts while the user is still choosing.
