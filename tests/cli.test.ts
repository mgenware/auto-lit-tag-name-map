import * as assert from 'assert';
import * as tw from 'temp-write';
import * as mfs from 'm-fs';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

it('CLI input file', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
        interface HTMLElementTagNameMap {
        "foo-bar": FooBar;
    }
}`;
  const tmpFile = await tw(src);
  await execAsync(`node ./dist/main.js "${tmpFile}"`);
  await sleep(50);
  const fileContents = await mfs.readTextFileAsync(tmpFile);
  assert.equal(
    fileContents,
    `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement {
}
declare global {
    interface HTMLElementTagNameMap {
        "foo-bar": FooBar;
        "my-element": MyElement;
    }
}
`,
  );
});

it('Prettier', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
        interface HTMLElementTagNameMap {
        "foo-bar": FooBar;
    }
}`;
  const config = `module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'lf',
};`;
  const srcFile = await tw(src);
  const configFile = await tw(config, '.prettier.js');
  console.log('🚒', configFile);
  await execAsync(
    `node ./dist/main.js "${srcFile}" --prettier "${configFile}"`,
  );
  await sleep(50);
  const fileContents = await mfs.readTextFileAsync(srcFile);
  assert.equal(
    fileContents,
    `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement {
}
declare global {
    interface HTMLElementTagNameMap {
        'foo-bar': FooBar;
        'my-element': MyElement;
    }
}
`,
  );
});
