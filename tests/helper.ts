import * as tw from 'temp-write';

export async function prettierConfigFile(): Promise<string> {
  const config = `module.exports = {
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
  };`;
  return await tw(config, '.prettier.js');
}
