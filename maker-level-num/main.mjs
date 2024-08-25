import fs from 'fs';

const idsText = fs.readFileSync(`./input/maker-ids.txt`, 'utf-8');
const ids = idsText.split(/\r?\n/).filter((line) => /^\w{9}$/.test(line));

const unclearedLevelsCount = {};
const userNames = {};

for (const id of ids) {
  const filename = `./json/${id}.json`;

  try {
    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);
    const courses = json.courses;
    
    let count = 0;
    for (const course of courses) {
      const uploadedTime = course.uploaded_pretty;
      const ret = uploadedTime.match(/\d{4}/);
      const year = ret[0];
      if (userNames[id] !== undefined) {
        if (userNames[id] !== course.uploader.name) {
          console.warn(`Warning: ${id}\t${userNames[id]} !== ${course.uploader.name}`)
        }
      } else {
        userNames[id] = course.uploader.name;
      }

      if (year === '2020' && course.clears === 0) {
        count++;
      }
    }

    unclearedLevelsCount[id] = count;
  } catch (err) {
    console.error(`Error: ${err}`);
  }
}

for (const id of Object.keys(unclearedLevelsCount).sort((a, b) => unclearedLevelsCount[b] - unclearedLevelsCount[a])) {
  const num = unclearedLevelsCount[id];
  const name = userNames[id];
  console.log(`${id}\t${num}\t${name}`);
}
