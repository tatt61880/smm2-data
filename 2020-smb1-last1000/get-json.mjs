import https from "https";
import fs from 'fs';
import { setTimeout } from 'node:timers/promises';

const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

let count = 0;
let breakFlag = false;
let waitFlag = false;
for (let id of ids) {
  id = id.replaceAll('-', '');
  const url = `https://tgrcode.com/mm2/level_info/${id}`;
  const outputFilename = `./json/${id}.json`;

  ++count;

  if (breakFlag) break;
  if (fs.existsSync(outputFilename)) continue;

  console.log(`${count} ${id}`);

  if (waitFlag) {
    await setTimeout(10000);
  } else {
    waitFlag = true;
  }

  https.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`Error: ${id}`);
        breakFlag = true;
        return;
      }

      let body = '';

      res.on('data', function (d) {
        body += d;
      });
      
      res.on('end', function () {
        fs.writeFileSync(outputFilename, body);
      })
  })
  .on("error", (e) => {
      console.error(e);
  });
}
