import fs from 'fs';
import path from 'path';
import tqdm from 'ntqdm';
import csv from 'csv-parser';

const threshold = 15;
const yearPots = ['1650-1679', '1680-1709', '1710-1739', '1740-1769',
  '1770-1799', '1800-1829', '1830-1859', '1860-1889', '1890-1920',
];

async function parseCsv(file) {
  const results = [];
  const p = new Promise((resolve) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
  return p;
}

function isInPot(y, pot) {
  const [start, end] = pot.split('-');
  return y >= parseInt(start) && y <= parseInt(end);
}

async function run() {
  const subset = [];

  let smellWords = fs.readFileSync('./smell_word/fr.txt', 'utf8');
  smellWords = smellWords.split(/\n|,/g);
  smellWords = smellWords.map((x) => x.trim()).filter((x) => x).map((x) => {
    if (x.length < 6 || !x.endsWith('er')) return x;
    return x.replace(/er$/, '[a-zA-Z]*');
  });

  const smellRegex = new RegExp(`(?<![a-z])(${smellWords.join('|')})s?(?![a-z])`, 'ig');

  console.log(smellRegex);
  const outFolder = './out';
  for (const dir of fs.readdirSync(outFolder)) {
    if (dir === '.DS_Store') continue;
    console.log(dir);
    // if (dir !== 'cyrus') continue;

    const metadataPath = path.join(outFolder, dir, 'metadata.csv');
    const metadata = await parseCsv(metadataPath);
    for (const x of tqdm(metadata)) {
      const { id } = x;
      const filePath = path.join(outFolder, dir, `${id}.txt`);
      const text = fs.readFileSync(filePath, 'utf-8');

      const count = (text.match(smellRegex) || []).length;
      x.count = count;
      x.dataset = dir;
      if (count > threshold) subset.push(x);
    }
  }

  for (const x of subset) console.log(x.id, x.count);
  console.log(subset.length);

  const pots = {};
  for (const p of yearPots) pots[p] = [];
  for (const x of subset) {
    const year = x.year || x.pub_date;
    for (const p of yearPots) {
      if (isInPot(parseInt(year), p)) pots[p].push(x);
    }
  }

  for (const p of yearPots) {
    console.log(p, pots[p].length);
    for (const x of pots[p]) {
      console.log('*', x.dataset, x.id, x.count, x.year || x.pub_date, x.pub_place);
      console.log(x.author, x.title);
    }
  }
}

run();
