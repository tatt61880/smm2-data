import fs from 'fs';

const levelsUser = {};
const levelsNum = {};
const userMinNum = {};

const style = process.argv[2];
const levelNum = process.argv[3];

{
  const lines = fs.readFileSync('input\\discord-log.txt', 'utf-8').split(/\r?\n/);

  let userName = '';
  let levelId = '';

  for (const line of lines) {
    if (line === '') continue;

    const result = /^(.*?) has cleared ".* \((...-...-...)\)! The clear rate is now \d+\/(\d+)+\. This is their (\d+)/.exec(line);
    if (result) {
      userName = result[1];
      levelId = result[2];
      continue;
    }

    const result2 = /^There are (\d*),?(\d+) uncleared 2020 courses!/.exec(line);
    if (result2) {
      const num = result2[1] + result2[2];

      if (levelsUser[levelId] !== undefined) {
        if (levelsUser[levelId] !== userName) {
          console.error(`There are multi result for one level (${levelId}) and their user name of the clears aren't same. ${levelsUser[levelId]} !== ${userName}`);
        }
        if (levelsNum[levelId] !== undefined && levelsNum[levelId] !== num) {
          console.error(`There are multi result for one level (${levelId}): ${levelsNum[levelId]} != ${num}`);
        }
      } else {
        levelsUser[levelId] = userName;
        levelsNum[levelId] = num;
      }
    }

    userName = '';
    levelId = '';
  }
}

const userNum = {};
const clearedLevels = [];
const unclearedLevels = [];

{
  const levelsFile = `input\\level-ids-${style}-last-${levelNum}.txt`;
  const lines = fs.readFileSync(levelsFile, 'utf-8').split(/\r?\n/);

  for (const line of lines) {
    if (line === '') break;

    const levelId = line;
    const userName = levelsUser[levelId];

    if (userName === undefined) {
      unclearedLevels.push(levelId);
      continue;
    }
    clearedLevels.push(levelId);

    const num = levelsNum[levelId];
    if (userMinNum[userName] === undefined) {
      userMinNum[userName] = num;
    } else if (num < userMinNum[userName]) {
      userMinNum[userName] = num;
    }

    if (userNum[userName] === undefined) {
      userNum[userName] = 1;
    } else {
      userNum[userName]++;
    }
  }
}

const totalNum = clearedLevels.length + unclearedLevels.length;
const unclearedNum = unclearedLevels.length;

{
  const outputFilename = `output\\ranking-${style}-${totalNum}.txt`;
  const fd = fs.openSync(outputFilename, 'w');

  fs.writeSync(fd, `Contributor ranking for last ${totalNum} levels of 2020 ${style}. :Toadette:\n`);
  fs.writeSync(fd, '```\n');

  for (const userName of Object.keys(userNum).sort((a, b) => {
    const res = userNum[b] - userNum[a];
    if (res !== 0) return res;
    return userMinNum[b] - userMinNum[a];
  })) {
    const num = userNum[userName];

    if (userMinNum[userName] === 0) {
      fs.writeSync(fd, `(${userName}: ${num})\n`);
    } else {
      fs.writeSync(fd, `${userName}: ${num}\n`);
    }
  }

  fs.writeSync(fd, '```\n');
  if (unclearedNum === 0) {
    fs.writeSync(fd, `Current uncleared levels: ${unclearedNum} :JuzHype:\n`);
  } else {
    fs.writeSync(fd, `Current uncleared levels: ${unclearedNum} :PeepoCheer:\n`);
  }

  fs.closeSync(fd);
}

{
  const outputFilename = 'output\\ranking-temp-uncleared-levels.txt';
  const fd = fs.openSync(outputFilename, 'w');

  for (const levelId of unclearedLevels) {
    fs.writeSync(fd, `${levelId}\n`);
  }

  fs.closeSync(fd);
}

{
  const outputFilename = 'output\\ranking-temp-cleared-levels.txt';
  const fd = fs.openSync(outputFilename, 'w');

  for (const levelId of clearedLevels.sort((a, b) => levelsNum[a] - levelsNum[b])) {
    const userName = levelsUser[levelId];
    const num = levelsNum[levelId];
    fs.writeSync(fd, `${levelId}\t${num}\t${userName}\n`);
  }

  fs.closeSync(fd);
}

{
  const nameId = {};
  for (const levelId of clearedLevels) {
    const levelIdShort = levelId.replaceAll('-', '');
    const filename = `./json_cleared/${levelIdShort}.json`;

    const jsonText = fs.readFileSync(filename, 'utf-8');
    const json = JSON.parse(jsonText);

    const userName = levelsUser[levelId];
    const code = json?.first_completer?.code;

    if (nameId[userName] === undefined) {
      nameId[userName] = code;
    } else {
      if (nameId[userName] !== code) {
        console.error(`Error: ${userName} code1 = ${nameId[userName]} code2 = ${code}`);
      }
    }
  }
}
