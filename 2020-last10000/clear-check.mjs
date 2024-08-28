import fs from 'fs';

// クリア済みチェック
const idsText = fs.readFileSync('./output/cleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));
for (const id of ids) {
  const idShort = id.replaceAll('-', '');
  const filename = `./json_cleared/${idShort}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    const clears = json.clears;
    if (clears === undefined) continue;
    if (clears < 1) {
      console.log(`Warning: ${id} clears = ${clears}`);
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}
