# auto-lit-tag-name-map

Auto set lit-element HTMLElementTagNameMap for TypeScript.

Before:

```ts
import { customElement, LitElement } from 'lit-element';

@customElement('button-view')
export class ButtonView extends LitElement {}

@customElement('progress-view')
export class ProgressView extends LitElement {}
```

After:

```ts
import { customElement, LitElement } from 'lit-element';

@customElement('button-view')
export class ButtonView extends LitElement {}

@customElement('progress-view')
export class ProgressView extends LitElement {}

declare global {
  interface HTMLElementTagNameMap {
    'button-view': ButtonView;
    'progress-view': ProgressView;
  }
}
```

## Usage

```
Usage
    $ npx auto-lit-tag-name-map@0 <pattern>
  <pattern> File search pattern.

  Examples
    $ npx auto-lit-tag-name-map@0 "./components/**/*.ts"
```
