#!/usr/bin/env node

import * as parseArgs from 'meow';
import * as fg from 'fast-glob';
import * as mfs from 'm-fs';
import convert from './convert';
import * as ts from 'typescript';
import * as prettier from 'prettier';
import { cosmiconfig } from 'cosmiconfig';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');
const CMD = `npx ${pkg.name}@${parseInt(pkg.version.split('.')[0])}`;

const cli = parseArgs(
  `
    Usage
      $ ${CMD} <pattern>
    <pattern> File search pattern.
 
    Options
      --prettier  Prettier config file used to format the input file.

    Examples
      $ ${CMD} "./components/**/*.ts"
`,
  {
    flags: {
      inputFile: {
        type: 'string',
      },
    },
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
  let prettierConfig: prettier.Options | undefined;
  if (cli.flags.prettier) {
    const explorer = cosmiconfig('prettier');
    const rawConfig = await explorer.load(`${cli.flags.prettier}`);
    const config = rawConfig?.config;
    if (config) {
      config.parser = 'typescript';
      prettierConfig = config;
    }
  }
  const files = await fg([glob]);
  if (!files || !files.length) {
    console.warn(`No file matches the pattern "${glob}"`);
  }
  await Promise.all(
    files.map(async file => {
      const contents = await mfs.readTextFileAsync(file);
      let converted = convert(contents, ts.ScriptTarget.ESNext);
      // `convert` returns null if the current file doesn't need to be rewritten.
      if (converted !== null) {
        if (prettierConfig) {
          converted = prettier.format(converted, prettierConfig);
        }
        await mfs.writeFileAsync(file, converted);
      }
    }),
  );
})();
