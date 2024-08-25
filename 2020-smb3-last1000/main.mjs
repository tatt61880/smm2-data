import fs from 'fs';

// const idsText = fs.readFileSync(`./input/level-ids.txt`, 'utf-8');
const idsText = fs.readFileSync(`./output/cleared-levels.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{3}-\w{3}-\w{3}$/.test(line));

const userCodeToName = {};
const clearsCount = {};

for (let id of ids) {
  id = id.replaceAll('-', '');
  if (id === 'Q20YYQXCG') continue;

  const filename = `./json/${id}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    // const attempts = json.attempts;
    const courseId = json.course_id;
    if (id !== courseId) {
      console.error(`${id} !== ${courseId}`);
    }
    const firstClearName = json.first_completer.name;
    const firstClearCode = json.first_completer.code;

    // console.log(`${id}\t${firstClearCode}\t${firstClearName}\t${attempts}`);
    if (userCodeToName[firstClearCode] === undefined) {
      userCodeToName[firstClearCode] = firstClearName;
    } else if (userCodeToName[firstClearCode] !== firstClearName) {
      console.error(`Username changed for ${firstClearCode}: ${userCodeToName[firstClearCode]} !== ${firstClearName}`);
    }

    if (clearsCount[firstClearCode] === undefined) {
      clearsCount[firstClearCode] = 1;
    } else {
      clearsCount[firstClearCode]++;
    }  
  } catch (err) {
    console.error(`Error: Failed to open ${filename}`);
  }
}

// let count = ids.length;

// console.log('Contributor ranking for 2020 SMB3');
for (const userCode of Object.keys(clearsCount).sort((a, b) => clearsCount[b] - clearsCount[a] )) {
  const userName = userCodeToName[userCode];
  const userCount = clearsCount[userCode];
  console.log(`${userName}: ${userCount}\r`);
  // count -= userCount;
}
// console.log(`Current uncleared levels: ${count}`);
