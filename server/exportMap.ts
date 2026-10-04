import { readFile, writeFile } from 'node:fs/promises';
import { parseTiledMap, type TiledMap } from '../src/game/infrastructure/map/TiledParser';
import { createClassicRaceMap } from '../src/game/simulation/classicMap';
import { DataRace } from '../src/game/simulation/DataRace';

const raw = JSON.parse(await readFile('public/assets/mazes/default/maze.json', 'utf8')) as TiledMap;
const map = createClassicRaceMap(parseTiledMap(raw));
// Fail the build if the authored geometry cannot produce the required physical Firewall patrol.
new DataRace(map, 'map-validation', [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }], 1);
await writeFile('server-dist/map.json', JSON.stringify(map));
