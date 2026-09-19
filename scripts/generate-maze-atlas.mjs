import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(root, 'src/game/domain/world/MazeFootprint.ts'), 'utf8');
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { TILE_FOOTPRINTS, buildMazeWallFootprint, extendMazeWallFootprint } = await import(
  `data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`
);

function rectangles(rows, x, y, scale, fill, extra = '') {
  let output = '';
  for (let row = 0; row < rows.length; row += 1) {
    const cells = rows[row];
    for (let start = 0; start < cells.length;) {
      if (cells[start] !== '#') { start += 1; continue; }
      let end = start + 1;
      while (cells[end] === '#') end += 1;
      output += `<rect x="${x + start * scale}" y="${y + row * scale}" width="${(end - start) * scale}" height="${scale}" fill="${fill}" ${extra}/>`;
      start = end;
    }
  }
  return output;
}

function svg(width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img">\n`
    + `<rect width="${width}" height="${height}" fill="#02040b"/>\n${content}\n</svg>\n`;
}

const ids = [0, 1, 2, 5, 6, 7, 10, 14, 15, 23, 16, 'sign', 'empty'];
const labels = {
  0: 'Single rail', 1: 'Parallel rails', 2: 'Top corner', 5: 'Top and lower notch',
  6: 'Notched corner', 7: 'Right return', 10: 'Right and bottom', 14: 'Four corner brackets',
  15: 'Lower tip', 23: 'Right corner tips', 16: 'Prison bars', sign: 'Sign marker', empty: 'Empty GID 0',
};
let atlas = '<text x="24" y="36" fill="#b579a1" font-size="23" font-family="monospace">MAZE TILE FOOTPRINTS · 16 × 16</text>\n';
ids.forEach((id, index) => {
  const column = index % 4;
  const row = Math.floor(index / 4);
  const x = 24 + column * 230;
  const y = 58 + row * 191;
  atlas += `<rect x="${x}" y="${y}" width="210" height="178" fill="#050912" stroke="#334252"/>`;
  atlas += `<text x="${x + 13}" y="${y + 24}" fill="#d9d7e2" font-size="14" font-family="monospace">${id === 'empty' ? 'GID 0' : id === 'sign' ? 'IDs 17–21' : `ID ${id}`}</text>`;
  atlas += `<text x="${x + 13}" y="${y + 43}" fill="#89a5b8" font-size="11" font-family="monospace">${labels[id]}</text>`;
  atlas += `<rect x="${x + 39}" y="${y + 49}" width="112" height="112" fill="#0d1823" stroke="#334252"/>`;
  if (typeof id === 'number') atlas += rectangles(TILE_FOOTPRINTS[id], x + 39, y + 49, 7, id === 16 ? '#419da9' : '#b579a1');
  if (id === 'sign') atlas += `<text x="${x + 45}" y="${y + 111}" fill="#b9a36b" font-size="11" font-family="monospace">GLYPH</text>`;
});
fs.writeFileSync(path.join(root, 'docs/maze-tiles.svg'), svg(956, 841, atlas));

function scenarioMap(ids) {
  return {
    width: ids.length, height: 1, tileWidth: 16, tileHeight: 16,
    tiles: [ids.map((id, x) => ({ x, y: 0, gid: id + 1, localId: id,
      rotation: Math.PI / 2, flipX: false, flipY: false }))],
  };
}

const examples = [
  { title: 'STRAIGHT · BEFORE', ids: [1, 1], edge: null },
  { title: 'STRAIGHT · EXTEND', ids: [1, 1], edge: { tile: { x: 0, y: 0 }, side: 'right' } },
  { title: 'OPENING · BEFORE', ids: [1, 1, 1], edge: null },
  { title: 'OPENING · CLOSED', ids: [1, 1, 1], edge: { tile: { x: 1, y: 0 }, side: 'right' } },
  { title: 'CORNER · BEFORE', ids: [2, 1], edge: null },
  { title: 'CORNER · JOIN', ids: [2, 1], edge: { tile: { x: 0, y: 0 }, side: 'right' } },
  { title: 'ACTIVE EXTENSION', ids: [1, 1], edge: { tile: { x: 0, y: 0 }, side: 'right' } },
  { title: 'AFTER EXPIRY', ids: [1, 1], edge: null },
];
let scenarios = '<text x="24" y="36" fill="#b846ff" font-size="23" font-family="monospace">QUARANTINE · CONNECTED WALL CHANGES</text>\n';
examples.forEach((example, index) => {
  const x = 24 + (index % 4) * 230;
  const y = 58 + Math.floor(index / 4) * 142;
  const map = scenarioMap(example.ids);
  const base = buildMazeWallFootprint(map);
  const joined = example.edge ? extendMazeWallFootprint(map, base, [example.edge]) : base;
  const originalRows = [];
  const addedRows = [];
  for (let row = 0; row < joined.height; row += 1) {
    let original = '';
    let added = '';
    for (let column = 0; column < joined.width; column += 1) {
      const pixel = row * joined.width + column;
      original += base.solid[pixel] ? '#' : '.';
      added += joined.solid[pixel] && !base.solid[pixel] ? '#' : '.';
    }
    originalRows.push(original);
    addedRows.push(added);
  }
  scenarios += `<rect x="${x}" y="${y}" width="210" height="126" fill="#050912" stroke="#334252"/>`;
  scenarios += `<text x="${x + 10}" y="${y + 23}" fill="#d9d7e2" font-size="11" font-family="monospace">${example.title}</text>`;
  scenarios += rectangles(originalRows, x + 9, y + 40, 4, '#b579a1');
  scenarios += rectangles(addedRows, x + 9, y + 40, 4, '#b846ff');
});
fs.writeFileSync(path.join(root, 'docs/maze-quarantine.svg'), svg(956, 358, scenarios));
