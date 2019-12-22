#!/usr/bin/env node

import * as parseArgs from 'meow';
import * as fg from 'fast-glob';
import * as mfs from 'm-fs';
import convert from './convert';
import * as ts from 'typescript';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');
const CMD = `npx ${pkg.name}@${parseInt(pkg.version.split('.')[0])}`;

const cli = parseArgs(
  `
    Usage
      $ ${CMD} <pattern>
    <pattern> File search pattern.
 
    Examples
      $ ${CMD} "./components/**/*.ts"
`,
  {
    flags: {},
  },
);

(async () => {
  // eslint-disable-next-line no-console
  console.info(`>>> ${CMD} ${pkg.version}`);
  const glob = cli.input[0];
  if (!glob) {
    throw new Error(
      `Missing required arguments. Please use "${CMD} --help" for help.`,
    );
  }
  const files = await fg([glob]);
  if (!files || !files.length) {
    console.warn(`No file matches the pattern "${glob}"`);
  }
  await Promise.all(
    files.map(async file => {
      const contents = await mfs.readTextFileAsync(file);
      const converted = convert(contents, ts.ScriptTarget.ES2015);
      await mfs.writeFileAsync(file, converted);
    }),
  );
})();
