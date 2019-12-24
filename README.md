# auto-lit-tag-name-map

[![MEAN Module](https://img.shields.io/badge/MEAN%20Module-TypeScript-blue.svg?style=flat-square)](https://github.com/mgenware/MEAN-Module)
[![Build Status](https://img.shields.io/travis/mgenware/auto-lit-tag-name-map.svg?style=flat-square&label=Build+Status)](https://travis-ci.org/mgenware/auto-lit-tag-name-map)
[![npm version](https://img.shields.io/npm/v/auto-lit-tag-name-map.svg?style=flat-square)](https://npmjs.com/package/auto-lit-tag-name-map)
[![Node.js Version](http://img.shields.io/node/v/auto-lit-tag-name-map.svg?style=flat-square)](https://nodejs.org/en/)

Auto set TypeScript HTMLElementTagNameMap for lit-element.

## Limitations

auto-lit-tag-name-map has two modes:

### Default mode

- Pros:
  - Uses TypeScript AST to parse and write source code. Can handle all edge cases (e.g. `declare global` not declared, `HTMLElementTagNameMap` not declared, `HTMLElementTagNameMap` declared but does not contain the right custom element tags, etc).
- Cons:
  - TypeScript compiler emit API does not preserve empty lines between classes or functions. [issue](https://github.com/Microsoft/TypeScript/issues/843).
  - Prettier does not add lines if they were removed. [issue](https://github.com/prettier/prettier/issues/1603).

### Safe mode

- Pros:
  - To address the issue above, safe mode only uses TypeScript AST to analyze files, once it encounters an edge case mentioned above, it simply ignores the target file. Therefore, it can only handle one situation where there is no `declare global` declared in target file. In this case, it constructs a `declare global` block with `HTMLElementTagNameMap` inside and appends the block of code to the end of the target file.
- Cons:
  - Cannot handle edge cases mentioned above.

### Prettier

In both modes, auto-lit-tag-name-map will avoid rewriting files that look good. It's also recommended to use prettier (pass a prettier config file path via `--prettier` CLI option) to format rewritten files.

## Usage

```
Usage
  $ npx auto-lit-tag-name-map@1 "<glob>" [options]

Inputs
  <glob> Glob search patterns (always quote the glob to avoid misinterpretation by the shell).

Options
  --prettier   Prettier config file used to format the files to be rewritten.
  --dry-run    Do not rewrite any file, but show a list of files to be rewritten.
  --safe-mode  Enable safe mode, see repo README.md for details.

Examples
  $ npx auto-lit-tag-name-map@1 "./src/components/**/*.ts" --safe-mode --prettier ./.prettierrc.js
```
