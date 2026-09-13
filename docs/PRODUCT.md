# Product overview

PACKETLOSS is a work-in-progress maze arcade game for desktop and mobile browsers. The core experience is navigating a maze, collecting pellets, avoiding ghosts, and turning the chase around with power pellets. It uses animated 3D meshes, a following camera, and maps authored in Tiled.

## Gameplay

### Movement and mazes

The Packet moves along the maze corridors. Direction inputs queue the next turn, which takes effect when the path allows it. Walls and maze boundaries constrain movement. Linked portals let the Packet and ghosts travel between parts of the maze; the Packet briefly blinks and is protected from harmful ghost collisions after teleporting.

### Pellets and scoring

- Regular pellets are worth 10 points and disappear when collected.
- Power pellets are worth 50 points and temporarily make active ghosts scared.
- Eating scared ghosts awards increasing bonuses: 200, 400, 800, then 1,600 points.
- A new power pellet refreshes the scared period and resets the ghost bonus chain.

### Ghosts and lives

Ghosts start in a pen and are released into the maze. While scared, they can be eaten and return to the pen before rejoining play. A flashing warning signals when the scared period is ending.

The player starts with three lives. Contact with a dangerous ghost costs one life and holds the Packet at the contact position for a 900 ms digital-glitch death animation. Its body stays recognizable as it stutters through horizontally displaced cyan and magenta scan slices and echoes, scrambled binary digits, and brief signal dropouts, then cuts out. During this phase the Packet cannot move, collect pellets, or suffer another hit; ghosts and gameplay timers continue. The Packet then returns to its spawn and begins the usual blinking recovery period that prevents another immediate hit. Pausing freezes the death timer and animation. Score and lives appear in the HUD.

## Controls and pause

| Action          | Desktop                 | Mobile               |
| --------------- | ----------------------- | -------------------- |
| Move            | Arrow keys or WASD      | Swipe in a direction |
| Pause or resume | Space or click the game | Tap the game         |

Pausing freezes movement and gameplay timers and dims/desaturates the scene. Switching away from the window or tab pauses an active game; returning resumes it only if losing focus caused the pause. A manually paused game stays paused.

## Presentation

The camera follows the Packet smoothly and adapts to the viewport. Its orthographic view combines a 20-degree forward tilt with a fixed 5-degree lean from the right to reveal more wall faces. Maze rows and columns stay aligned with the screen, and the viewing angle stays constant as the Packet moves. Rendering interpolates movement between simulation updates, while portals and respawns show the destination immediately. The displayed camera aligns to physical pixels to stabilize the maze outlines; slow panning can advance in tiny pixel steps.

The maze walls, ghost prison, and PACKETLOSS logo share a 12-unit height, dark shaded faces, and crisp square outlines. Their outline colors distinguish them: muted pink for the maze, cyan for the prison, and gold for the logo. The lettering rises directly from the maze floor. The prison preserves its authored continuous rails with two rectangular openings per tile, extruded using the same geometry pipeline as the walls. The surrounding maze walls retain their faces and outer pink outlines; only pink edges touching the cyan prison bars are hidden. The prison retains its internal cyan bar outlines, without the outer cyan bounding box. Bars remain complete across ghost release paths; ghosts retain their existing pass-through rules. All three use the same material finish and approximately 1.75-CSS-pixel outlines at the default zoom, with normal depth testing and antialiasing and no emission, brightness boosts, or bloom. Gameplay movement rules remain unchanged. Pellets are shallow silver eight-tip stars with four long cardinal points, four shorter diagonal points, and dark gray bevels, matching the original point sprite. Regular and power pellets share the same shape, with power pellets appearing larger. The HUD, pause UI, and debug panels remain HTML overlays. A WebGL 2-capable browser is required.

The Packet is a shallow near-black beveled block hovering above the floor, with closely matched fixed colors on its top and sides, cyan corner outlines on the top and all four sides, depth edges, square pixel accents, and bright rectangular eyes mounted in shaded dark sockets on the upper surface visible from the game camera. Its presentation is enlarged by 15% while retaining its gameplay collision size. Four binary digits sit directly on the upper face among additional square pixel marks, staying attached and readable while independently switching between 0 and 1 with a soft flicker. Both eyes blink periodically and look toward actual movement, returning to center at rest. Its body is stretched 20% wider and stays aligned with the maze walls without rotational rocking, while ten surrounding floating binary digits form a tighter cluster around its center, face the camera, drift and fade independently, and update their 0/1 values at staggered intervals. Its simple silhouette echoes the maze outlines, with soft glow limited to the eyes. Three short speed marks trail behind actual movement in any direction and fade out within 120 ms of stopping; portals and respawns clear them immediately. Blinky and Clyde use red and orange block models with subtle rocking motion; Inky and Pinky use cyan and pink virus models that twist and pulse. Scared ghosts turn blue and retain their warning flashes. All character animation freezes when paused, while grounded shadows and existing collision sizes remain unchanged. The optimized enemy models load before gameplay starts; a missing enemy model produces a startup error.

## Maps

The default maze is `public/assets/mazes/default/maze.json`. Setting `VITE_GAME_ENV=DEMO` selects `public/assets/mazes/default/demo.json`; other values use the default maze.

Tiled map data defines walls, directional collision rules, portals, spawn locations, the ghost pen, and collectibles. After editing `public/assets/mazes/default/demo.tmx` or `public/assets/mazes/tileset.tsx`, regenerate the demo JSON with `pnpm map:demo:convert`.

## Development asset gallery

The development-only Asset gallery link opens `/dev/assets`, a catalog of current game assets with static thumbnails and a live inspector. It includes the Packet's idle, four movement directions, eating, death/respawn, recovery, and portal states; each ghost in normal, scared, and warning states; both pellet sizes and pickup effects; wall pieces and connected examples; the prison, wordmark, floor, and contact shadow. The death/respawn preview includes the 900 ms death effect followed by 1,200 ms of recovery.

Select an asset, then use play/pause, replay, seeking, and playback speed to inspect its animation. Switch between the game camera and an orbit camera to inspect its shape. Gallery playback does not start a game or change score, lives, or gameplay state. The gallery route and link are omitted from production builds.

## Current scope

The playable maze loop, scoring, lives, ghost recovery, portals, and desktop/mobile controls are implemented. Automatic level progression and a game-over/restart screen are not implemented yet: clearing the pellets does not load another level, and reaching zero lives does not end the running game.

Implementation details live in [Architecture](ARCHITECTURE.md); local checks and debugging shortcuts are in [Testing](TESTING.md).
