# auto-lit-tag-name-map

[![MEAN Module](https://img.shields.io/badge/MEAN%20Module-TypeScript-blue.svg?style=flat-square)](https://github.com/mgenware/MEAN-Module)
[![Build Status](https://img.shields.io/travis/mgenware/auto-lit-tag-name-map.svg?style=flat-square&label=Build+Status)](https://travis-ci.org/mgenware/auto-lit-tag-name-map)
[![npm version](https://img.shields.io/npm/v/auto-lit-tag-name-map.svg?style=flat-square)](https://npmjs.com/package/auto-lit-tag-name-map)
[![Node.js Version](http://img.shields.io/node/v/auto-lit-tag-name-map.svg?style=flat-square)](https://nodejs.org/en/)

Auto set TypeScript HTMLElementTagNameMap for lit-element.

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
$ npx auto-lit-tag-name-map@1 <pattern> [options]
  <pattern> File search pattern.

  Options
    --prettier  Prettier config file used to format the files to be rewritten.

  Examples
      $ auto-lit-tag-name-map@1 ./src/components/**/*.ts --prettier ./.prettierrc.js
```
