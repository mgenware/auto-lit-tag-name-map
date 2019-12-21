import * as assert from 'assert';
import convert from '../dist/convert';
import * as ts from 'typescript';

it('Add a member to HTMLElementTagNameMap', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
        interface HTMLElementTagNameMap {
        "foo-bar": FooBar;
    }
}`;

  const res = convert(src, ts.ScriptTarget.ES2015);
  assert.equal(
    res,
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
