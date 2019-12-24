# auto-lit-tag-name-map

[![MEAN Module](https://img.shields.io/badge/MEAN%20Module-TypeScript-blue.svg?style=flat-square)](https://github.com/mgenware/MEAN-Module)
[![Build Status](https://img.shields.io/travis/mgenware/auto-lit-tag-name-map.svg?style=flat-square&label=Build+Status)](https://travis-ci.org/mgenware/auto-lit-tag-name-map)
[![npm version](https://img.shields.io/npm/v/auto-lit-tag-name-map.svg?style=flat-square)](https://npmjs.com/package/auto-lit-tag-name-map)
[![Node.js Version](http://img.shields.io/node/v/auto-lit-tag-name-map.svg?style=flat-square)](https://nodejs.org/en/)

Auto set TypeScript HTMLElementTagNameMap for lit-element.

## Limitations

### Empty lines are not preserved

- TypeScript compiler emit API does not preserve empty lines. [issue](https://github.com/Microsoft/TypeScript/issues/843).
- Prettier does not add lines if they were removed. [issue](https://github.com/prettier/prettier/issues/1603).

## Usage

```
Usage
  $ npx auto-lit-tag-name-map@1 <pattern> [options]

Inputs
  <pattern> File search pattern.

Options
  --prettier  Prettier config file used to format the files to be rewritten.
  --dry-run   Do not rewrite any file, but show a list of files to be rewritten.

Examples
  $ npx auto-lit-tag-name-map@1 ./src/components/**/*.ts --prettier ./.prettierrc.js
```
