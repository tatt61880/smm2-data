import https from 'https';
import fs from 'fs';
import { setTimeout } from 'node:timers/promises';

const outputDir = 'json';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const idsText = fs.readFileSync('./output/uncleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

let idsParam = '';

let count = 0;
let breakFlag = false;
let waitFlag = false;

for (let id of ids) {
  id = id.replaceAll('-', '');
  if (idsParam !== '') {
    idsParam += ',';
  }
  idsParam += id;

  count++;
  if (count % 200 !== 0 && count !== ids.length) continue;
  if (breakFlag) break;

  if (waitFlag) {
    await setTimeout(10000);
  } else {
    waitFlag = true;
  }

  console.log(`Fetching levels total: ${count}`);
  const url = `https://tgrcode.com/mm2/level_info_multiple/${idsParam}`;
  idsParam = '';

  https.get(url, (res) => {
    let body = '';

    res.on('data', function (d) {
      body += d;
    });

    res.on('end', function () {
      if (res.statusCode !== 200) {
        console.error(`Error: statusCode = ${res.statusCode}, ${body}`);
        breakFlag = true;
        process.exitCode = 1;
        return;
      }

      const jsons = JSON.parse(body).courses;
      for (const json of jsons) {
        const courseId = json.course_id;
        const outputFilename = `./${outputDir}/${courseId}.json`;
        fs.writeFileSync(outputFilename, JSON.stringify(json));
      }
    });
  }).on('error', (e) => {
    console.error(e);
  });
}
