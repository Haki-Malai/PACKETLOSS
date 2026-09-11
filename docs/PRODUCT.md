# Product overview

Pacman is a personal, work-in-progress remake of Pac-Man for desktop and mobile browsers. The core experience is navigating a maze, collecting pellets, avoiding ghosts, and turning the chase around with power pellets. It uses animated sprites, a following camera, and maps authored in Tiled.

## Gameplay

### Movement and mazes

Pac-Man moves along the maze corridors. Direction inputs queue the next turn, which takes effect when the path allows it. Walls and maze boundaries constrain movement. Linked portals let Pac-Man and ghosts travel between parts of the maze; Pac-Man briefly blinks and is protected from harmful ghost collisions after teleporting.

### Pellets and scoring

- Regular pellets are worth 10 points and disappear when collected.
- Power pellets are worth 50 points and temporarily make active ghosts scared.
- Eating scared ghosts awards increasing bonuses: 200, 400, 800, then 1,600 points.
- A new power pellet refreshes the scared period and resets the ghost bonus chain.

### Ghosts and lives

Ghosts start in a pen and are released into the maze. While scared, they can be eaten and return to the pen before rejoining play. A flashing warning signals when the scared period is ending.

The player starts with three lives. Contact with a dangerous ghost costs one life and returns Pac-Man to his spawn, with a brief blinking recovery period that prevents another immediate hit. Score and lives appear in the HUD.

## Controls and pause

| Action          | Desktop                 | Mobile               |
| --------------- | ----------------------- | -------------------- |
| Move            | Arrow keys or WASD      | Swipe in a direction |
| Pause or resume | Space or click the game | Tap the game         |

Pausing freezes movement and gameplay timers and dims/desaturates the scene. Switching away from the window or tab pauses an active game; returning resumes it only if losing focus caused the pause. A manually paused game stays paused.

## Presentation

The camera follows Pac-Man smoothly and adapts to the viewport. Rendering interpolates movement between simulation updates, while portals and respawns show the destination immediately. The maze and sprites share a pixel-aligned Canvas2D renderer; the HUD and pause UI are HTML overlays.

## Maps

The default maze is `public/assets/mazes/default/maze.json`. Setting `VITE_GAME_ENV=DEMO` selects `public/assets/mazes/default/demo.json`; other values use the default maze.

Tiled map data defines walls, directional collision rules, portals, spawn locations, the ghost pen, and collectibles. After editing `public/assets/mazes/default/demo.tmx` or `public/assets/mazes/tileset.tsx`, regenerate the demo JSON with `pnpm map:demo:convert`.

## Current scope

The playable maze loop, scoring, lives, ghost recovery, portals, and desktop/mobile controls are implemented. Automatic level progression and a game-over/restart screen are not implemented yet: clearing the pellets does not load another level, and reaching zero lives does not end the running game.

Implementation details live in [Architecture](ARCHITECTURE.md); local checks and debugging shortcuts are in [Testing](TESTING.md).
