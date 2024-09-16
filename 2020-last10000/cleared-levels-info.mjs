/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import fs from 'fs';

const idsText = fs.readFileSync('./output/cleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

for (const id of ids) {
  const idShort = id.replaceAll('-', '');
  const filename = `./json_cleared/${idShort}.json`;

  if (!fs.existsSync(filename)) continue;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const courseID = idShort;
    const clearedBy = json?.first_completer?.name ?? '(deleted)';
    const title = json.name;

    console.log(`${courseID}\t${clearedBy}\t${title}`);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
