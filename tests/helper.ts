import * as assert from 'assert';
import * as tw from 'temp-write';
import * as mfs from 'm-fs';
import * as util from 'util';
import { exec } from 'child_process';
import * as helper from './helper';
const execAsync = util.promisify(exec);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface TestCLIOption {
  prettier?: boolean;
  safeMode?: boolean;
}

export async function prettierConfigFile(): Promise<string> {
  const config = `module.exports = {
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
  };`;
  return await tw(config, '.prettier.js');
}

export async function testCLI(
  src: string,
  expected: string,
  options?: TestCLIOption,
) {
  const srcFile = await tw(src);
  let ptConfigFile: string | undefined;
  options = options || {};
  if (options.prettier) {
    ptConfigFile = await helper.prettierConfigFile();
  }

  let cmd = `node ./dist/main.js "${srcFile}"`;
  if (options.prettier) {
    cmd += ` --prettier "${ptConfigFile}"`;
  }
  if (options.safeMode) {
    cmd += ` --safe-mode`;
  }
  await execAsync(cmd);
  await sleep(50);
  const fileContents = await mfs.readTextFileAsync(srcFile);
  assert.equal(fileContents, expected);
}
