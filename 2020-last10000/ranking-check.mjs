/* eslint-disable camelcase */

import fs from 'fs';

const style = process.argv[2];
const levelNum = process.argv[3];

{
  const levelsFile = `input\\level-ids-${style}-last-${levelNum}.txt`;
  const lines = fs.readFileSync(levelsFile, 'utf-8').split(/\r?\n/);

  for (const line of lines) {
    if (line === '') break;

    const levelId = line;
    const levelIdShort = levelId.replaceAll('-', '');
    const filename = `./json/${levelIdShort}.json`;

    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    const style_name = json.game_style_name; // 'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW'
    const theme_name = json.theme_name; // 'Castle', 'Ghost house', 'Airship', 'Overworld', 'Sky', 'Desert', 'Snow', 'Underground'
    console.log(`${levelId}\t${style_name}\t${theme_name}`);
  }
}
