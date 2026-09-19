# Product overview

PACKETLOSS is a work-in-progress maze arcade game for desktop and mobile browsers. The core experience is navigating a maze, recovering data bits, avoiding enemies, and turning the chase around with power cores. It uses animated 3D meshes, a following camera, and maps authored in Tiled.

## Gameplay

### Movement and mazes

The Packet moves along the maze corridors. Perpendicular direction inputs queue the next turn, which takes effect at the next center where the path allows it; reversing direction takes effect immediately within the current corridor. Walls and maze boundaries constrain movement. Linked portals let the Packet and enemies travel between parts of the maze; the Packet briefly blinks and is protected from harmful enemy collisions after teleporting.

### Data and scoring

- Data bits are worth 10 points and disappear when collected.
- Power cores are worth 50 points and temporarily make active enemies scared.
- The Packet collects either pickup as soon as its body touches it, even before reaching the tile center.
- Eating scared enemies awards increasing bonuses: 200, 400, 800, then 1,600 points.
- A new power core refreshes the scared period and resets the enemy bonus chain.

The first level uses these base awards and normal simulation speed. Continuing after a clear compounds both the entire gameplay simulation and every score award by 25% per level. Movement consumes the full scaled travel distance while still resolving each crossed center, so fractional multipliers do not round actor speed down. Awards are calculated from their base value and rounded to the nearest integer when granted. Active play time remains wall-clock time rather than scaled simulation time.

Generated data bits fill every eligible reachable tile, including straight corridors and wider floor areas. Large power cores are scarce: 12 in the default maze and four in the demo. They favor outer corner bends, then well-separated interior bends, away from the player spawn, portal mouths, and jail entrances. Explicitly map-authored collectibles keep their authored positions.

### Enemies and lives

The default roster starts with one Firewall, Virus, Ping, Spam, and Lag, released from the pen at the existing staggered intervals. Each body is lethal on contact. While scared, enemies move at half their own normal speed and can be eaten. Eaten enemies spend 420 ms collapsing into tiny, harmless, wide-eyed bugs with scurrying feet, then move back to the pen at twice their own normal speed. They follow the shortest physical corridor route, including access through the prison bars, without teleporting through portals. Original enemies regain their bodies only after reaching the jail center and enter the usual release cycle; Spam copies disappear on arrival. Returning bugs cannot be eaten again and do not use enemy abilities. A flashing warning signals when the scared period is ending.

| Enemy | Behavior |
| --- | --- |
| Firewall | While in the pen, chooses a random reachable patrol destination. After release it travels there and repeats a right-hand loop of at least 16 tile steps, independent of the player. It chooses again for every release and rejoins its current loop after scared mode. It does not physically block other enemies. |
| Virus | Pursues the player using the shortest legal route, including portal shortcuts and reversals. |
| Ping | Every three seconds, detects the player through walls within eight tiles and pursues that last detected position. A pulse and brief target marker show successful detection. Other enemies receive no alert. |
| Spam | Attempts to split every four seconds into an unoccupied adjacent tile. Copies can reproduce, up to four Spam total. Blocked attempts retry after one second. Copies are 80% size and award the normal scared-enemy chain score when eaten. |
| Lag | Roams at half normal enemy speed and drops a zone on newly traversed tiles at most once per second. Zones last four seconds and halve player speed without stacking. The body is lethal; zones only slow. |

Power cores disable detection, splitting, and new zone creation and immediately clear existing Lag zones. Ability cooldowns restart after release and scared mode. There are at most eight enemies: the five originals and three reusable Spam copies. Abilities and lingering effects continue during player death and freeze while paused. Later-level speed applies to movement, releases, abilities, power windows, death/recovery, effects, and gameplay animation, while movement still stops exactly at tile centers to preserve queued turns and check every crossed corridor for pickups.

The player starts with three lives. Contact with a dangerous enemy costs one life and holds the Packet at the contact position for a 900 ms level-one digital-glitch death animation. Its body stays recognizable as it stutters through horizontally displaced cyan and magenta scan slices and echoes, scrambled binary digits, and brief signal dropouts, then cuts out. During this phase the Packet cannot move, collect data, or suffer another hit; enemies and gameplay timers continue. With lives remaining, the Packet then returns to its spawn and begins the usual blinking recovery period that prevents another immediate hit. Every original enemy is restored to its initial jail placement, Spam copies retire, transient enemy effects are cleared, and the normal staggered release cycle restarts. At zero lives, the death animation finishes without a respawn or enemy reset, the Packet stays hidden, and the run ends with **PACKET LOST**. Pausing freezes the death timer and animation. Score and lives appear in the HUD.

Collecting the last data pickup pauses the run at a **MAZE CLEARED** checkpoint, including that pickup's scaled points. The checkpoint states **GAME IS NOW SPED UP AND SCORING IS INCREASED** without presenting final-run statistics. Dangerous contact is resolved before collection and blocks pickup on that tick. A map that starts without collectibles does not automatically award a clear. The cleared maze remains empty behind the checkpoint until the player selects **Continue**. Continuing refills the exact original collectible layout, resets the Packet and enemies, preserves score and remaining lives, and starts the next level at 1.25 times the prior level's simulation speed and scoring. The multiplier compounds without a level cap. Leaving from a clear checkpoint requires confirmation and abandons the unsaved run.

Only losing all lives completes and records a new multi-level run. The loss result freezes the simulation and shows final score, local best, cumulative data recovered, levels cleared, and active play time. Play time includes active death and recovery but excludes loading, pauses, and clear checkpoints. Historical clear records remain readable.

## Menus, settings, and local records

The first page visit shows a themed loading screen while both maps, the optimized enemy models, and the menu/runtime modules are prepared. The title appears only after these resources are ready, and the first selected run consumes the prepared map and models instead of loading them again. Its PACKETLOSS wordmark is a small Three.js scene using the actual map's dark extruded letters, gold outlines, lighting, and camera angle. One random letter briefly dims at occasional intervals, echoing the Packet's signal flicker. The wordmark renders only on opening, resizing, and flicker transitions, with a readable text fallback if WebGL is unavailable, and releases its resources when leaving the title. Reduced motion leaves every letter steady, and hidden tabs stop the effect. The logo and subtle maze-line decoration frame Start game, Profile & records, Settings, How to play, and Tutorial. The screen also shows the current nickname and best score. An initial loading failure offers Retry; later run loading failures offer Retry and Main menu.

The pause menu offers Resume, Restart, Settings, How to play, and Main menu. Restart or Main menu requires confirmation when abandoning an unfinished run, as does leaving a clear checkpoint. Terminal loss results need no confirmation. Restarting creates a fresh run; returning to the title releases the current game.

Settings, How to play, and Profile & records use a labelled Back arrow in the top-right corner instead of a bottom Back button. It returns to the parent menu and restores focus to the control that opened the screen, as Escape does. Resume, replay/main-menu actions, and confirmation Cancel/Confirm remain explicit controls for their respective flows.

How to play places the basics on the left and an Enemies section on the right, separated by a thin outline; below 800 pixels wide, the sections stack. Each of the five enemies has an 80-pixel portrait using its actual model and authored idle animation beside a brief behavior explanation. Static portraits remain visible while the animated previews load or if loading fails. Previews honor menu motion preferences: Reduced is static, Follow system observes reduced motion, and hidden tabs pause animation. Help is available from the title and pause menus without starting or resuming gameplay; leaving it releases the previews.

- **Profile & records:** optional nickname, defaulting to `PLAYER`; surrounding whitespace is trimmed, input is limited to 16 characters, and blank input restores the default. The profile shows the top 10 scores and 10 recent completed runs per map. Tied scores put the most recent completion first. Each loss-completed multi-level run is saved once with its date, map, levels cleared, and nickname when the run started. Clear checkpoints and abandoned runs are not recorded. Historical clear records remain available. Clearing records requires confirmation and preserves preferences.
- **Settings:** Sound is disabled and marked **Coming soon**; no audio is loaded or played. Menu motion defaults to the system preference, with Reduced and Full overrides. Fullscreen is available where supported, reflects the browser's current state, and is not saved as a preference.
- **Storage:** nickname, motion preference, and records use versioned local storage. Invalid or unavailable storage falls back to defaults or in-memory state with a brief save-status message. Clearing browser data removes the saved profile and records; there is no backend, account, or synchronization across devices.

## Guided tutorial

**Tutorial** appears immediately below **How to play** in the main menu and launches guided practice directly. How to play contains instructions and enemy information without a tutorial launch button. Practice uses the existing demo maze regardless of the configured game map, and never saves scores or records.

Each lesson opens paused with a short explanation and **Try it**. During play, the lesson number, one objective, and cyan floor markers identify what to do. The movement lesson marks every remaining data bit; other lessons retain their single current target. Lessons advance on actual gameplay milestones:

| Lesson | Milestone |
| --- | --- |
| Movement and data | Start moving automatically and recover the marked data bits at `(1,1)`, `(1,11)`, `(6,5)`, and `(11,3)`. |
| Meet Firewall | Collect the data bit at `(1,2)` while Firewall travels to and follows its seeded long patrol. |
| Meet Virus | Reach the data bit at `(11,11)` while Virus follows its chase route. |
| Meet Ping | Start moving automatically, observe a successful scan, then recover the data bit at `(10,11)`. |
| Meet Spam | Observe a real split, pause to explain the copy, then recover the data bit at `(11,1)`. |
| Meet Lag | Pause on zone creation, preserve both characters' positions, then navigate back and cross it to experience slowdown. |
| Turn the chase around | Learn that power clears Lag zones and suppresses Ping, Spam, and Lag abilities; collect the core at `(2,6)`, follow the Firewall highlight along its standard patrol behavior, eat it, and finish the intake animation. |

Each lesson and retry creates fresh practice with the lesson's enemies and collectibles, normal movement speeds, and real ability timings. Every lesson starts the Packet moving in an intended open direction as soon as practice resumes; it stops only when maze collision blocks that direction until the player steers. The practice camera fits the small demo maze to the viewport so the player can observe the staged enemies. Cyan target boxes render over maze walls so their locations remain visible. Explanations within a lesson freeze its current scene. Success advances immediately to the next lesson without an outro; dangerous contact or an expired required effect freezes play and offers unlimited retries. Manual pause and focus handling remain available, but shortcuts or focus return cannot dismiss a checkpoint. Exiting or cancelling loading returns to the main menu with Tutorial focused. Completion of the final lesson offers **Start game**, **Replay tutorial**, and **Back to main menu**.

## Controls and pause

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move | Arrow keys or WASD | Swipe in a direction |
| Pause | Space, Escape, HUD pause button, or click the game canvas | HUD pause button or tap the game canvas |
| Resume | Resume button or Space/Escape on the pause screen | Resume button |
| Menu navigation | Enter activates the highlighted action; Tab focuses controls; Enter/Space activates the focused control; Escape returns from a submenu | Tap labelled controls |

Pausing freezes movement and gameplay timers and places a dark scrim over the full-color scene. Menu backdrops do not resume play. Enter activates a menu's highlighted primary action when the panel itself has focus. Arrow navigation moves the highlighted action without showing a separate focus treatment; Tab-focused controls retain visible focus and their native Enter/Space behavior. Typing in the nickname field never triggers gameplay shortcuts. Menus contain keyboard focus and restore it on return, and gameplay/debug input is inactive while menus own control. Held keys and touch gestures are cleared across transitions.

Switching away from the window or tab pauses an active game; returning resumes it only if losing focus caused the pause and no explicit pause/menu interaction followed. A manually paused game stays paused. Completed runs cannot be resumed by controls or focus changes.

Development builds additionally support collision inspection and FPS/frame-time panels with `C`, copying diagnostic text with `Shift+C`, compounding gameplay speed and scoring by 25% in place with `F`, freezing simulation and animation without opening the pause menu with `Shift+F`, toggling persistent portal blinking and collision protection with `V` until it is pressed again, skipping directly to the next tutorial lesson with `N`, and toggling enemy scared state with `H` during normal play. Production excludes these tools and shortcuts. The guided tutorial remains available in both environments.

## Presentation

### Canonical HTML visual contract

Every new or changed HTML interface must match the 3D scene and reuse the shared CSS tokens and Tailwind 4 utilities and styles in `src/game/ui/gameUi.css`. Menu interfaces also reuse the React components and header/body/actions/footer slots in `src/game/ui/MenuPanel.tsx`. Apply this to menus, the HUD, loading/error states, and future changes to development tools.

- Use near-black surfaces (`#02040b`, `#050912`), muted pink (`#b579a1`), cyan (`#419da9`), and gold (`#b9a36b`). Reserve brighter cyan for primary actions and keyboard focus; keep body text readable against the dark surfaces.
- Use Orbitron headings with readable supporting text, square corners, thin outlines, and small corner-bracket details. Keep decoration restrained and controls clearly labelled.
- Use the same panel frame, spacing, and corner treatment throughout: standard panels have a maximum width of 640 pixels; How to play and Profile & records use the 1,040-pixel wide variant. The main and pause menus share one vertical stack of full-width buttons and left-aligned supporting text; keep the title wordmark centered. Help sections and profile record lists share the responsive column layout, stacking below 800 pixels. Submenu Back controls are 48-pixel icon buttons with an accessible label in the shared header's top-right corner.
- Keep the frozen scene visible behind pause and result panels under a dark scrim. Do not desaturate or filter the entire game mount, which would also alter HTML colors.
- Use brief, restrained entrances: a signal-break effect for loss and a gold accent sweep for success. Honor the menu motion preference and system reduced-motion setting.
- Menus stay gently animated with drifting maze lines, softly shifting panel shadows, pulsing corner outlines, and scattered 0/1 digits that drift, fade, and switch at staggered intervals like the Packet's glyphs. Keep the ambient background mounted across menu navigation so changing screens does not restart its animation. Leave decoration visible at the edges and gutters around wide panels, behind opaque content, hidden from assistive technology, and unable to intercept input. Reduced motion leaves it static. These CSS effects use no gameplay timers and disappear during play; the paused 3D scene remains frozen.
- Panels stay in place and fade in without vertical movement. Buttons lift 2 pixels on hover or keyboard focus and depress 1 pixel when pressed; the primary action's border brightens over 10 seconds and dims over the next 10 seconds while idle. Keep these responses subtle, with no repeated button movement while idle, and disable their motion with the reduced-motion setting.
- Every shared menu frame includes simultaneous faint sweeps along its top and bottom edges in opposite directions, plus a small pulse of square pixels in its bottom corner. Both sweeps share one animation so their movement and fading stay synchronized. Use the panel's shared accent for its corner brackets and signal decoration: cyan normally, pink for loss, and gold for a clear. Keep these effects outside the content, hidden from assistive technology, and static under reduced motion; reuse `MenuPanel` and CSS keyframes instead of creating timers for individual screens.
- Provide visible keyboard focus, focus containment/restoration for menus, touch targets of at least 44 pixels, mobile safe-area spacing, and scrolling on short viewports. Decoration must not block interaction or reduce text readability.

The development asset gallery keeps its library/inspector layout and controls while sharing the game palette, Orbitron headings, square corners, and accessible controls. Debug text panels use the same palette and outlines.

The HTML UI uses React and Tailwind 4 and requires Safari 16.4+, Chrome 111+, or Firefox 128+, alongside the existing WebGL 2 requirement.

### 3D scene

The camera follows the Packet smoothly and adapts to the viewport. Its orthographic view combines a 20-degree forward tilt with a fixed 5-degree lean from the right to reveal more wall faces. Maze rows and columns stay aligned with the screen, and the viewing angle stays constant as the Packet moves. Rendering interpolates movement between simulation updates, while portals and respawns show the destination immediately. The displayed camera aligns to physical pixels to stabilize the maze outlines; slow panning can advance in tiny pixel steps.

The maze walls, enemy prison, and PACKETLOSS logo share a 12-unit height, dark shaded faces, and crisp square outlines. Their outline colors distinguish them: muted pink for the maze, cyan for the prison, and gold for the logo. The lettering rises directly from the maze floor. The prison preserves its authored continuous rails with two rectangular openings per tile, extruded using the same geometry pipeline as the walls. The surrounding maze walls retain their faces and outer pink outlines; only pink edges touching the cyan prison bars are hidden. The prison retains its internal cyan bar outlines, without the outer cyan bounding box. Bars remain complete across enemy release paths; enemies retain their existing pass-through rules. All three use the same material finish and approximately 1.75-CSS-pixel outlines at the default zoom, with normal depth testing and antialiasing and no emission, brightness boosts, or bloom. Gameplay movement rules remain unchanged. Data bits are shallow silver eight-tip stars with four long cardinal points, four shorter diagonal points, and dark gray bevels, matching the original point sprite. Power cores have their own solid, faceted silver 3D star, with long points on all three axes and shorter diagonal points, so they retain volume from every side. They turn once every six seconds and gently hover up and down twice per turn, with offset phases between powerups. Their silver facets catch the scene lighting as they rotate; collecting one absorbs the same 3D shape from its current hover and orientation. Rotation and hovering freeze while paused. The HUD, pause UI, and debug panels remain HTML overlays. A WebGL 2-capable browser is required.

The Packet is a shallow near-black beveled block hovering above the floor, with closely matched fixed colors on its top and sides, cyan corner outlines on the top and all four sides, depth edges, square pixel accents, and bright rectangular eyes mounted in shaded dark sockets on the upper surface visible from the game camera. Its presentation is enlarged by 15% while retaining its gameplay collision size. Four binary digits sit directly on the upper face among additional square pixel marks, staying attached and readable while independently switching between 0 and 1 with a soft flicker. Both eyes blink periodically and look toward actual movement, returning to center at rest. Collecting either kind of point triggers a 300 ms absorption: the silver star turns, contracts toward a tiny cyan point, and rises into the center of the Packet’s upper face over 180 ms. Its cyan corner outlines then pulse briefly while the body keeps its shape. Consecutive stars animate independently; pausing freezes absorption, and death or a teleport cancels pending intake from the old location. Its body is stretched 20% wider and stays aligned with the maze walls without rotational rocking, while ten surrounding floating binary digits form a tighter cluster around its center, face the camera, drift and fade independently, and update their 0/1 values at staggered intervals. Its simple silhouette echoes the maze outlines, with soft glow limited to the eyes. Three short speed marks trail behind actual movement in any direction and fade out within 120 ms of stopping; portals and respawns clear them immediately. Firewall is a brick cube with red joints, Virus a smaller dark sphere with thin orange spikes and pale tip highlights, Ping an orb with green segmented rings, Spam a stepped body with purple trim, and Lag a dark core wrapped in its original slim yellow rings. Firewall, Ping, and Spam have near-black body fills matching the Packet and pale highlights; Virus and Lag retain their original dark shell color. Their separate GLBs share colored trim and gentle looping motion with periodic blinking. Eye shapes alone express their moods, without brow lines: Firewall, Virus, and Spam look angry, Ping has neutral upright eyes, and Lag has tired, half-closed eyes with a slight asymmetric droop. Edible enemies ease into wide, worried eyes and grey trim over 240 ms, and ease back when fear ends; the scared expression stays visible during both colors of the warning flashes. While enemies are edible, the Packet becomes a gold-outlined hunter with angular eyes, raised corner prongs, and a central intake. Its colors, eye shape, and raised details ease into and out of the hunter form over 320 ms. The gold outlines flicker as power is about to end. Eating an enemy opens the intake, draws in a stream of bright pixels while the enemy shell collapses, then snaps it shut; the shell’s shrink and spin ease in and out over this 420 ms animation, which finishes even when the last edible enemy is eaten. At the jail, the bug contracts while the original body eases back over 280 ms. The normal cyan form returns when no edible enemies remain and intake has finished. All character animation freezes when paused, while grounded shadows and existing collision sizes remain unchanged. The optimized enemy models load before gameplay starts; a missing enemy model produces a startup error.

## Maps

The default maze is `public/assets/mazes/default/maze.json`. Setting `VITE_GAME_ENV=DEMO` selects `public/assets/mazes/default/demo.json`; other values use the default maze.

Tiled map data defines walls, directional collision rules, portals, spawn locations, the enemy pen, and collectibles. The optional `enemyCount` selects up to five original enemies in roster order; its default is five. After editing `public/assets/mazes/default/demo.tmx` or `public/assets/mazes/tileset.tsx`, regenerate the demo JSON with `pnpm map:demo:convert`.

## Development asset gallery

The development-only Asset gallery link opens `dev/assets` relative to the application base (`/dev/assets` locally and at `dev.packetloss.hakimalai.com`), with static thumbnails and a live inspector. It includes the Packet's idle, four movement directions, eating, death/respawn, recovery, and portal states; each enemy in normal, scared, and warning states; data bits, power cores, and their pickup effects; wall pieces and connected examples; the prison, wordmark, floor, and contact shadow. The death/respawn preview includes the 900 ms death effect followed by 1,200 ms of recovery.

The enemy gallery includes all five archetypes in normal, scared, warning, eaten, and return-to-jail states, plus separate patrol, chase, detection, splitting, and slowdown demonstrations. The player gallery also includes the gold hunter, power-ending warning, and enemy intake animation. Return previews use an authored short route; gameplay navigation runs in the simulation. Preview copies are bounded and seeking does not create additional enemies.

Select an asset, then use play/pause, replay, seeking, and playback speed to inspect its animation. Switch between the game camera and an orbit camera to inspect its shape. Gallery playback does not start a game or change score, lives, or gameplay state. The gallery route and link are omitted from production builds.

## Current scope

The playable maze loop includes scoring, lives, enemy recovery, portals, compounding level progression, desktop/mobile controls, title and pause menus, clear checkpoints, terminal loss results, and device-local profiles and records. There is no audio, backend, authentication, cloud synchronization, or saved unfinished run. Development hotkeys still need a release review before public shipping.

Implementation details live in [Architecture](ARCHITECTURE.md); local checks and debugging shortcuts are in [Testing](TESTING.md).
