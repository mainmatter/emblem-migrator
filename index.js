#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Emblem = require('emblem');
const prettier = require('prettier');
const ProgressBar = require('progress');

async function run() {
  let inputPath = process.argv[2];

  let paths, progressbar;
  if (inputPath && isFile(inputPath)) {
    paths = [inputPath];

    console.log(` ⚙️   Converting "${path.basename(inputPath)}" to Handlebars...`);
  } else {
    let cwd = path.resolve(inputPath ? inputPath : process.cwd());

    console.log(` 🔍  Looking for Emblem.js files in ${cwd}...`);
    let pattern = path.join(cwd, '**/*.{em,embl,emblem}');
    paths = await globby([pattern]);

    if (paths.length === 0) {
      console.log(' ⚠️   No Emblem.js files were found!');
      return;
    }

    console.log(` ⚙️   Converting ${paths.length} files to Handlebars...`);
    console.log();

    progressbar = new ProgressBar(' [:bar] :percent :etas ', { total: paths.length });
  }

  for (let oldPath of paths) {
    // convert path to `.hbs` extension
    let oldExtension = path.extname(oldPath);
    let newPath = oldPath.slice(0, oldPath.length - oldExtension.length) + '.hbs';

    // read old template file contents
    let emblem = fs.readFileSync(oldPath, 'utf8');

    // convert Emblem.js to Handlebars
    let hbs = Emblem.compile(emblem, { quiet: true });

    // run Handlebars template through `prettier`
    let prettyHbs = prettier.format(hbs, { parser: 'glimmer', useTabs: true });

    // write new Handlebars template file
    fs.writeFileSync(newPath, prettyHbs, 'utf8');

    // remove old Emblem.js template file
    fs.unlinkSync(oldPath);

    if (progressbar) {
      progressbar.tick();
    }
  }

  if (progressbar) {
    progressbar.terminate();
  }

  console.log(' ✅  Done!');
}

function isFile(path) {
  let stat = fs.statSync(path);
  return stat && stat.isFile();
}

run().catch(error => {
  console.error(error);
});
