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

**Since we are using TypeScript AST to rewrite files, file formatting will be lost, so it's highly recommended that you use the `--prettier` CLI option to reformat the rewritten files in prettier.**

```
Usage
$ npx auto-lit-tag-name-map@1 <pattern>
  <pattern> File search pattern.

  Options
    --prettier  Prettier config file used to format the files to be rewritten.

  Examples
    $ npx auto-lit-tag-name-map@1 "./components/**/*.ts"
```
