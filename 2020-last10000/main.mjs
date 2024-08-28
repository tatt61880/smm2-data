/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import fs from 'fs';

const idsText = fs.readFileSync('./output/uncleared-levels.txt', 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const unixTimeForComparing = new Date('2020-03-21T00:00:00').getTime() / 1000 - 9 * 3600; // 比較用の Unix time (※ process.env.TZ = 'Asia/Tokyo' の環境で実行する前提で調整しています。)
// console.log(unixTimeForComparing);

const makerInfo = true;
const countryInfo = true;
const styleInfo = true;
const themeInfo = true;
const tagInfo = true;
const conditionInfo = true;

const makerLevelNums = new Map();
const makerCodeToName = new Map();
const countryLevelNums = new Map();
const styleLevelNums = new Map();
const themeLevelNums = new Map();
const tagLevelNums = new Map();
const conditionLevelNums = new Map();

let count = 0;
let totalClearCheckTime = 0;
let totalAttempts = 0;
for (const id of ids) {
  const idShort = id.replaceAll('-', '');
  const filename = `./json/${idShort}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const levelName = json.name;
    const description = json.description;
    const uploaded = json.uploaded; // 投稿日時の Unix Time

    const upload_time = json.upload_time; // 10000 = 10 seconds.
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
      if (makerInfo) {
        makerCodeToName.set(uploader_code, uploader_name);

        if (makerLevelNums.has(uploader_code)) {
          makerLevelNums.set(uploader_code, makerLevelNums.get(uploader_code) + 1);
        } else {
          makerLevelNums.set(uploader_code, 1);
        }
      }

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

    // if (/トロール/.test(levelName)) {
    // if (comments > 10) {
    // if (condition_name === 'Reach the goal without landing after leaving the ground.') {
    // if (tag1_name === 'Link' || tag2_name === 'Link') {
    // if (versus_rating > 6500) {
    // if (condition_name === 'Reach the goal after defeating at least/all (n) Piranha Creeper(s).') {
    if (uploader_code === 'V5QDJDMKG' || uploader_code === 'FCC5F831G' || uploader_code === '29BJC44TF') {
    // if (uploader_code === '0YKRH4JDG') {
      console.log(`${id}\t${versus_rating}\t${levelName}`);
      count++;
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

console.log(`count = ${count}`);

if (makerInfo) {
  console.log('----------------------------------------');
  console.log('Maker info');
  let count2 = 0;
  const nums = new Map();
  const threshold = 4;
  for (const uploader_code of [...makerLevelNums.keys()].sort((a, b) => makerLevelNums.get(b) - makerLevelNums.get(a))) {
    const name = makerCodeToName.get(uploader_code);
    const num = makerLevelNums.get(uploader_code);
    if (nums.has(num)) {
      nums.set(num, nums.get(num) + 1);
    } else {
      nums.set(num, 1);
    }
    if (num >= threshold) {
      console.log(`${uploader_code}: ${num} ${name}`);
      count2++;
    }
  }
  console.log(`Number of makers who have ${threshold}+ levels: ${count2}`);

  console.log('levels: makers');
  let sum = 0;
  for (const num of [...nums.keys()].sort((a, b) => nums.get(a) - nums.get(b))) {
    const count3 = nums.get(num);
    sum += count3;
    console.log(`${num}: ${count3}`);
  }
  console.log(`(1+: ${sum})`);
  console.log(`(2+: ${sum - nums.get(1)})`);
}

if (countryInfo) {
  console.log('----------------------------------------');
  console.log('Country info');

  for (const country of [...countryLevelNums.keys()].sort((a, b) => countryLevelNums.get(b) - countryLevelNums.get(a))) {
    const num = countryLevelNums.get(country);
    console.log(`${country}: ${num}`);
  }
}

if (styleInfo) {
  console.log('----------------------------------------');
  console.log('Style info');

  for (const style_name of [...styleLevelNums.keys()].sort((a, b) => styleLevelNums.get(b) - styleLevelNums.get(a))) {
    const num = styleLevelNums.get(style_name);
    console.log(`${style_name}: ${num}`);
  }
}

if (themeInfo) {
  console.log('----------------------------------------');
  console.log('Theme info');

  for (const theme_name of [...themeLevelNums.keys()].sort((a, b) => themeLevelNums.get(b) - themeLevelNums.get(a))) {
    const num = themeLevelNums.get(theme_name);
    console.log(`${theme_name}: ${num}`);
  }
}

if (tagInfo) {
  console.log('----------------------------------------');
  console.log('Tag info');

  for (const tag_name of [...tagLevelNums.keys()].sort((a, b) => tagLevelNums.get(b) - tagLevelNums.get(a))) {
    const num = tagLevelNums.get(tag_name);
    console.log(`${tag_name}: ${num}`);
  }
}

if (conditionInfo) {
  console.log('----------------------------------------');
  console.log('Condition info');

  let count3 = 0;
  for (const condition_name of [...conditionLevelNums.keys()].sort((a, b) => conditionLevelNums.get(b) - conditionLevelNums.get(a))) {
    if (condition_name === undefined) continue;
    count3++;
    const num = conditionLevelNums.get(condition_name);
    console.log(`${condition_name}: ${num}`);
  }
  console.log(`${count3} types of condition remaining.`);
}

console.log('----------------------------------------');
console.log(`Level nums: ${ids.length}`);
console.log(`Total Clear-check time: ${totalClearCheckTime / 1000} seconds (${ids.length} levels)`);
console.log(`Total Attempts (old data): ${totalAttempts} (${ids.length} levels)`);
