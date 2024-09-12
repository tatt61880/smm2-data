import https from 'https';
import fs from 'fs';
import { setTimeout } from 'node:timers/promises';

// const idsText = fs.readFileSync('./input/level-ids.txt', 'utf-8');
const idsText = fs.readFileSync('./output/cleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

let idsParam = '';

let count = 0;
let breakFlag = false;
let waitFlag = false;
let countAll = 0;

for (let id of ids) {
  id = id.replaceAll('-', '');
  const filename = `./json_cleared/${id}.json`;

  countAll++;
  if (fs.existsSync(filename)) {
    if (countAll !== ids.length || idsParam === '') {
      continue;
    }
  } else {
    if (idsParam !== '') {
      idsParam += ',';
    }
    idsParam += id;
  }

  count++;
  if (count % 100 !== 0 && countAll !== ids.length) continue;

  console.log(`Fetching levels total: ${count}`);
  console.log(`Fetching idsParam = ${idsParam}`);
  if (breakFlag) break;

  const url = `https://tgrcode.com/mm2/level_info_multiple/${idsParam}`;
  idsParam = '';

  if (waitFlag) {
    await setTimeout(20000);
  } else {
    waitFlag = true;
  }

  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error('Error');
      breakFlag = true;
      process.exitCode = 1;
      return;
    }

    let body = '';

    res.on('data', function (d) {
      body += d;
    });

    res.on('end', function () {
      const jsons = JSON.parse(body).courses;
      for (const json of jsons) {
        const courseId = json.course_id;
        const outputFilename = `./json_cleared/${courseId}.json`;
        fs.writeFileSync(outputFilename, JSON.stringify(json));
      }
    });
  }).on('error', (e) => {
    console.error(e);
  });
}
