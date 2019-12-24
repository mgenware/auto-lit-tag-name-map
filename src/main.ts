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
      $ ${CMD} <pattern> [options]

    Inputs
      <pattern> File search pattern.
 
    Options
      --prettier   Prettier config file used to format the files to be rewritten.
      --dry-run    Do not rewrite any file, but show a list of files to be rewritten.
      --safe-mode 

    Examples
      $ ${CMD} ./src/components/**/*.ts --prettier ./.prettierrc.js
`,
  {
    flags: {
      inputFile: {
        type: 'string',
      },
      dryRun: {
        type: 'boolean',
      },
      safeMode: {
        type: 'boolean',
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
      console.log(`💄 Loaded prettier config: ${JSON.stringify(config)}`);
    }
  }
  const files = await fg([glob]);
  if (!files || !files.length) {
    console.warn(`No file matches the pattern "${glob}"`);
  }

  const { flags } = cli;
  await Promise.all(
    files.map(async file => {
      const contents = await mfs.readTextFileAsync(file);
      let converted = convert(
        contents,
        ts.ScriptTarget.ESNext,
        !!flags.safeMode,
      );
      // `convert` returns null if the current file doesn't need to be rewritten.
      if (converted !== null) {
        if (prettierConfig) {
          converted = prettier.format(converted, prettierConfig);
        }
        // Print the file to be rewritten.
        console.log(file);
        if (!flags.dryRun) {
          if (flags.safeMode) {
            // On safe mode, the result of `convert` is the code to be appended to
            // the original file.
            converted =
              contents + (contents.endsWith('\n') ? '' : '\n') + converted;
          }
          await mfs.writeFileAsync(file, converted);
        }
      }
    }),
  );
})();
