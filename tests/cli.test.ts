import { testCLI } from './helper';

it('Default mode', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
        interface HTMLElementTagNameMap {
        "foo-bar": FooBar;//comment
    }
}`;
  const expected = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement {
}
declare global {
    interface HTMLElementTagNameMap {
        "foo-bar": FooBar; //comment
        "my-element": MyElement;
    }
}
`;
  await testCLI(src, expected);
});

it('Default mode + Prettier', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
        interface HTMLElementTagNameMap {
        "foo-bar": FooBar;//comment
    }
}`;
  const expected = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement {}
declare global {
  interface HTMLElementTagNameMap {
    'foo-bar': FooBar; //comment
    'my-element': MyElement;
  }
}
`;
  await testCLI(src, expected, { prettier: true });
});
