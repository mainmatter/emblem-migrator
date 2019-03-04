#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Emblem = require('emblem');
const prettier = require('prettier');
const ProgressBar = require('progress');

async function run() {
  console.log(' 🔍  Looking for Emblem.js files...');
  let paths = await globby(['app/**/*.{em,embl,emblem}']);

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
