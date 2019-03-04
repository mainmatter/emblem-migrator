#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Emblem = require('emblem');
const prettier = require('prettier');
const ProgressBar = require('progress');

async function run() {
  let cwd = path.resolve(process.argv[2] ? process.argv[2] : process.cwd());

  console.log(` 🔍  Looking for Emblem.js files in ${cwd}...`);
  let pattern = path.join(cwd, '**/*.{em,embl,emblem}');
  let paths = await globby([pattern]);

  if (paths.length === 0) {
    console.log(' ⚠️   No Emblem.js files were found!');
    return;
  }

  console.log(` ⚙️   Converting ${paths.length} files to Handlebars...`);
  console.log();

  let progressbar = new ProgressBar(' [:bar] :percent :etas ', { total: paths.length });
  for (let oldPath of paths) {
    // convert path to `.hbs` extension
    let oldExtension = path.extname(oldPath);
    let newPath = oldPath.slice(0, oldPath.length - oldExtension.length) + '.hbs';

    // read old template file contents
    let emblem = fs.readFileSync(oldPath, 'utf8');

    // convert Emblem.js to Handlebars
    let hbs = Emblem.compile(emblem, { quiet: true });

    // run Handlebars template through `prettier`
    let prettyHbs = prettier.format(hbs, { parser: 'glimmer' });

    // write new Handlebars template file
    fs.writeFileSync(newPath, prettyHbs, 'utf8');

    // remove old Emblem.js template file
    fs.unlinkSync(oldPath);

    progressbar.tick();
  }

  progressbar.terminate();
  console.log(' ✅  Done!');
}

run().catch(error => {
  console.error(error);
});
