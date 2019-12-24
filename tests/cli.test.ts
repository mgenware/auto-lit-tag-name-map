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

it('Default mode, Prettier', async () => {
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

it('Default mode, ignored', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global {
    interface HTMLElementTagNameMap {
        "my-element": MyElement;//comment
        "foo-bar": FooBar;//comment
    }
}`;
  await testCLI(src, src, { prettier: true });
});

it('Safe mode, ignored', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { }
declare global { }`;
  await testCLI(src, src, { prettier: true, safeMode: true });
});

it('Safe mode, src not ending with newline', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { } //comment`;
  const expected = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { } //comment

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
`;
  await testCLI(src, expected, { prettier: true, safeMode: true });
});

it('Safe mode, src ending with newline', async () => {
  const src = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { } //comment
`;
  const expected = `import { html, customElement, property } from 'lit-element';
@customElement('my-element')
export class MyElement extends LitElement { } //comment

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
`;
  await testCLI(src, expected, { prettier: true, safeMode: true });
});
