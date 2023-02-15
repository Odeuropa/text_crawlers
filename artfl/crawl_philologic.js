/* eslint no-await-in-loop: "off" */
/*  eslint no-loop-func : "off" */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import ObjectsToCsv from 'objects-to-csv';
import CommandLineArgs from 'command-line-args';

const baseUri = 'https://artflsrv03.uchicago.edu/philologic4/';
function getNavigation(code) {
  return `${baseUri + code}/reports/navigation.py`;
}

function clean(txt) {
  return txt.replace(/<[^>]*>/g, '')
    .replace(/\[page\s(\d+|na)?\]\s\[images\/.+\]/g, '')
    .replace(/\[page\s\[?(\d+|na|[vix]+)?\]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\n+/g, '\n\n')
    .trim();
}
async function run(code) {
  const dir = `./out/${code}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const uri = getNavigation(code);
  let i1 = 1;
  const metadata = [];

  let continue1 = true;
  while (continue1) {
    let i2 = 1;
    let continue2 = true;
    while (continue2) {
      let id = `${i1} ${i2}`;
      console.log(id);
      let params = {
        report: 'navigation',
        philo_id: id,
      };
      continue2 = await axios.get(uri, { params }).then((res) => {
        const m = res.data.metadata_fields;
        m.id = id;
        metadata.push(m);

        const text = clean(res.data.text);
        fs.writeFileSync(`${dir}/${id}.txt`, text);
        i2++;
        return true;
      }).catch(async () => {
        if (i2 === 1) { // third level?
          let continue3 = true;
          const i3 = 1;
          while (continue3) {
            id = `${i1} ${i2} ${i3}`;
            console.log(id);
            params = {
              report: 'navigation',
              philo_id: id,
            };
            continue3 = await axios.get(uri, { params }).then((res) => {
              const m = res.data.metadata_fields;
              m.id = id;
              metadata.push(m);

              const text = clean(res.data.text);
              fs.writeFileSync(`${dir}/${id}.txt`, text);
              i2++;
              return true;
            }).catch(async () => { continue3 = false; });
          }
          if (i3 === 1) {
            continue1 = false;
          }
        }

        i1++;
        return false;
      });
    }
  }

  const csv = new ObjectsToCsv(metadata);

  csv.toDisk(path.join(dir, 'metadata.csv'));
}

function parseArg() {
  return new CommandLineArgs([
    {
      name: 'code', alias: 'c', defaultOption: true,
    },
  ]);
}

const args = parseArg();
run(args.code);
