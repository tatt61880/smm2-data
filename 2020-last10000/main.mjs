/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import fs from 'fs';

const idsText = fs.readFileSync('./output/uncleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const unixTimeForComparing = new Date('2020-03-21T00:00:00').getTime() / 1000 - 9 * 3600; // 比較用の Unix time (※ process.env.TZ = 'Asia/Tokyo' の環境で実行する前提で調整しています。)
// console.log(unixTimeForComparing);

console.log(`ids.length = ${ids.length}`);

const countryInfo = true;
const styleInfo = true;
const themeInfo = true;
const makerInfo = true;
const dateInfo = true;
const timeInfo = true;
const tagInfo = true;
const conditionInfo = true;

const countryLevelNums = new Map();
const styleLevelNums = new Map();
const themeLevelNums = new Map();
const makerLevelNums = new Map();
const makerCodeToName = new Map();
const dateLevelNums = new Map();
const ccTimeNums = [];
const ccTimeIntervalSec = 10;
const tagLevelNums = new Map();
const conditionLevelNums = new Map();

const targetYear = 2020;

{
  const dt = new Date(targetYear, 0, 1);
  while (true) {
    const d = dt.getDate();
    const m = dt.getMonth() + 1;
    const yyyy = dt.getFullYear();
    if (yyyy !== targetYear) break;
    const dateStr = `${d}-${m}-${yyyy}`;
    dateLevelNums.set(dateStr, 0);
    dt.setDate(dt.getDate() + 1);
  }
}

let count = 0;
let totalClearCheckTime = 0;
let totalAttempts = 0;
let clearedNum = 0;
for (const id of ids) {
  const idShort = id.replaceAll('-', '');
  const filename = `./json/${idShort}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const levelName = json.name;
    const description = json.description;
    const uploaded = json.uploaded; // 投稿日時の Unix Time

    const date = json.uploaded_pretty.split(' ')[0];
    const upload_time = json.upload_time; // Clear-check time. 10000 = 10 seconds.
    const style_name = json.game_style_name; // 'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW'
    const theme_name = json.theme_name; // 'Castle', 'Ghost house', 'Airship', 'Overworld', 'Sky', 'Desert', 'Snow', 'Underground'

    const tags_name = json.tags_name;
    const tag1_name = tags_name[0];
    const tag2_name = tags_name[1];

    const condition_name = json.clear_condition_name;

    const clears = json.clears;
    const attempts = json.attempts;
    const plays = json.plays; // footprints
    const versus_matches = json.versus_matches;

    const comments = json.num_comments;

    const likes = json.likes;
    const boos = json.boos;

    const country = json.uploader.country; // 'US', 'JP', 'MX', ...
    const uploader_code = json.uploader.code; // MYP08K3NF
    const uploader_name = json.uploader.name;
    const versus_rank = json.uploader.versus_rank; // 3 => B
    const versus_rating = json.uploader.versus_rating;

    {
      if (countryInfo) {
        if (countryLevelNums.has(country)) {
          countryLevelNums.set(country, countryLevelNums.get(country) + 1);
        } else {
          countryLevelNums.set(country, 1);
        }
      }

      if (styleInfo) {
        if (styleLevelNums.has(style_name)) {
          styleLevelNums.set(style_name, styleLevelNums.get(style_name) + 1);
        } else {
          styleLevelNums.set(style_name, 1);
        }
      }

      if (themeInfo) {
        if (themeLevelNums.has(theme_name)) {
          themeLevelNums.set(theme_name, themeLevelNums.get(theme_name) + 1);
        } else {
          themeLevelNums.set(theme_name, 1);
        }
      }

      if (makerInfo) {
        makerCodeToName.set(uploader_code, uploader_name);

        if (makerLevelNums.has(uploader_code)) {
          makerLevelNums.set(uploader_code, makerLevelNums.get(uploader_code) + 1);
        } else {
          makerLevelNums.set(uploader_code, 1);
        }
      }

      {
        if (dateLevelNums.has(date)) {
          dateLevelNums.set(date, dateLevelNums.get(date) + 1);
        } else {
          dateLevelNums.set(date, 1);
        }
      }

      if (timeInfo) {
        const idx = Math.floor(upload_time / (ccTimeIntervalSec * 1000));
        if (ccTimeNums[idx] === undefined) {
          ccTimeNums[idx] = 1;
        } else {
          ccTimeNums[idx]++;
        }
      }

      if (tagInfo) {
        if (tagLevelNums.has(tag1_name)) {
          tagLevelNums.set(tag1_name, tagLevelNums.get(tag1_name) + 1);
        } else {
          tagLevelNums.set(tag1_name, 1);
        }

        if (tag1_name !== tag2_name) {
          if (tagLevelNums.has(tag2_name)) {
            tagLevelNums.set(tag2_name, tagLevelNums.get(tag2_name) + 1);
          } else {
            tagLevelNums.set(tag2_name, 1);
          }
        }
      }

      if (conditionInfo) {
        if (conditionLevelNums.has(condition_name)) {
          conditionLevelNums.set(condition_name, conditionLevelNums.get(condition_name) + 1);
        } else {
          conditionLevelNums.set(condition_name, 1);
        }
      }
    }

    totalClearCheckTime += upload_time;
    totalAttempts += attempts;

    if (clears !== 0) {
      clearedNum++;
      const filenameCleared = `./json_cleared/${idShort}.json`;
      if (!fs.existsSync(filenameCleared)) {
        fs.copyFileSync(filename, filenameCleared);
      }
    }

    // if (/トロール/.test(levelName)) {
    // if (comments > 10) {
    // if (condition_name === 'Reach the goal after defeating at least/all (n) Hammer Bro(s.).') {
    // if (condition_name === 'Reach the goal after defeating at least/all (n) Monty Mole(s).') {
    // if (condition_name === 'Reach the goal while holding a Trampoline.') {
    // if (tag1_name === 'Music' || tag2_name === 'Music') {
    // if (versus_rating > 6500) {
    if (clears !== 0) {
    // if (style_name === 'NSMBU') {
    // if (clears !== 0 && theme_name === 'Airship') {
    // if (condition_name === 'Reach the goal as Flying Squirrel Mario.') {
    // if (attempts < 10) {
    // if (attempts >= 1000) {
    // if (800 < attempts && attempts < 1000) {
    // if (tag1_name === 'Multiplayer versus') {
    // if (uploader_code === 'KVPCT605G') {
    // if (/K6D3YSTSF|WMM082L5G|1QGJNY0YF/.test(uploader_code)) {
    // if (upload_time > 330 * 1000) {
      // console.log(`${id}\tattempts=${attempts}\tvs-rating=${versus_rating}\tcc-time=${upload_time / 1000}\t${levelName}`);
      // console.log(`${id} ${levelName}`);
      console.log(`${id}`);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);
console.log(`levels which clears !== 0: ${clearedNum}`);

console.log('');
console.log(`# Info for last ${ids.length} levels in ${targetYear} :zeropercent:`);

if (countryInfo) {
  console.log('## Country info');

  for (const country of [...countryLevelNums.keys()].sort((a, b) => countryLevelNums.get(b) - countryLevelNums.get(a))) {
    const num = countryLevelNums.get(country);
    console.log(`${country}: ${num}`);
  }
}

if (styleInfo) {
  console.log('## Style info');

  for (const style_name of [...styleLevelNums.keys()].sort((a, b) => styleLevelNums.get(b) - styleLevelNums.get(a))) {
    const num = styleLevelNums.get(style_name);
    console.log(`${style_name}: ${num}`);
  }
}

if (themeInfo) {
  console.log('## Theme info');

  for (const theme_name of [...themeLevelNums.keys()].sort((a, b) => themeLevelNums.get(b) - themeLevelNums.get(a))) {
    const num = themeLevelNums.get(theme_name);
    console.log(`${theme_name}: ${num}`);
  }
}

console.log(`\nTotal Clear-check time: ${totalClearCheckTime / 1000} seconds! (${ids.length} levels)`);

if (makerInfo) {
  console.log('');
  let count2 = 0;
  const levelNumMap = new Map();
  const threshold = 4;
  let current = -1;
  for (const uploader_code of [...makerLevelNums.keys()].sort((a, b) => makerLevelNums.get(b) - makerLevelNums.get(a))) {
    const name = makerCodeToName.get(uploader_code);
    const num = makerLevelNums.get(uploader_code);
    if (levelNumMap.has(num)) {
      levelNumMap.set(num, levelNumMap.get(num) + 1);
    } else {
      levelNumMap.set(num, 1);
    }
    if (num >= threshold) {
      if (current !== num) {
        if (current === -1) {
          console.log(`## Maker info for last ${ids.length} levels in ${targetYear} :zeropercent:`);
        } else {
          console.log('```');
        }
        current = num;
        console.log(`### Makers with ${num} levels`);
        console.log('```');
      }
      console.log(`${uploader_code}: ${name}`);
      count2++;
    }
  }
  if (current !== -1) {
    console.log('```');
  }

  console.log(`### Levels: Makers (last ${ids.length} levels in ${targetYear})`);
  let sum = 0;
  for (const levelNum of [...levelNumMap.keys()].sort((a, b) => levelNumMap.get(a) - levelNumMap.get(b))) {
    const makerNum = levelNumMap.get(levelNum);
    sum += makerNum;
    if (sum === makerNum) {
      console.log(`${levelNum}: ${makerNum}`);
    } else {
      console.log(`${levelNum}: ${makerNum} (${levelNum}+: ${sum})`);
    }
  }
}

if (dateInfo) {
  console.log('');
  console.log(`## Date info for last ${ids.length} levels in ${targetYear} :zeropercent:`);

  for (const date of [...dateLevelNums.keys()].sort((a, b) => dateLevelNums.get(b) - dateLevelNums.get(a))) {
    const num = dateLevelNums.get(date);
    console.log(`${date}: ${num}`);
  }
}

{
  const outputFilename = 'output\\date-info.txt';
  const fd = fs.openSync(outputFilename, 'w');

  for (const date of [...dateLevelNums.keys()].sort((a, b) => dateLevelNums.get(b) - dateLevelNums.get(a))) {
    const num = dateLevelNums.get(date);
    fs.writeSync(fd, `${date}: ${num}\n`);
  }

  fs.closeSync(fd);
}

if (timeInfo) {
  console.log('');
  console.log(`## Clear-check time info for last ${ids.length} levels in ${targetYear} :zeropercent:`);
  console.log('```');

  let idx = 0;
  for (const num of ccTimeNums) {
    console.log(`${idx * ccTimeIntervalSec}.000 - ${(idx + 1) * ccTimeIntervalSec - 1}.999: ${num ?? 0}`);
    idx++;
  }
  console.log('```');
  console.log(`Total Clear-check time: ${totalClearCheckTime / 1000} seconds! (${ids.length} levels)`);
}

if (tagInfo) {
  console.log('');
  console.log(`## Tag info for last ${ids.length} levels in ${targetYear} :zeropercent:`);

  for (const tag_name of [...tagLevelNums.keys()].sort((a, b) => tagLevelNums.get(b) - tagLevelNums.get(a))) {
    const num = tagLevelNums.get(tag_name);
    console.log(`${tag_name}: ${num}`);
  }
}

if (conditionInfo) {
  console.log('');
  console.log(`## Clear-condition info for last ${ids.length} levels in ${targetYear} :zeropercent:`);

  let count3 = 0;
  let countCc = 0;
  for (const condition_name of [...conditionLevelNums.keys()].sort((a, b) => conditionLevelNums.get(b) - conditionLevelNums.get(a))) {
    if (condition_name === undefined) continue;
    count3++;
    const num = conditionLevelNums.get(condition_name);
    countCc += num;
    console.log(`${condition_name}: ${num}`);
  }
  console.log(`${count3} types of clear-condition remaining.`);
  console.log(`${countCc} uncleared levels have clear-condition in ${targetYear}`);
}

console.log('----------------------------------------');
console.log(`Level nums: ${ids.length}`);
console.log(`Total Clear-check time: ${totalClearCheckTime} ms (${ids.length} levels)`);
console.log(`Total Attempts (old data): ${totalAttempts} (${ids.length} levels)`);
