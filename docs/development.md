# Development and Release

## Install development dependencies

```bash
npm ci --no-audit --no-fund
```

Use `npm install` only when intentionally changing dependencies or regenerating the lockfile.

## Main commands

```bash
npm run test:types
npm test
npm run build
npm run check:exports
npm run check:tree-shaking
npm run size
npm run benchmark
npm run check:package
npm run check
```

## Complete verification

```bash
npm run check
```

This runs:

1. Strict TypeScript validation
2. Unit and security tests
3. Formatting validation
4. ESM, CommonJS, and declaration builds
5. Explicit export validation
6. Packed-package tree-shaking validation
7. Bundle-size budgets
8. Publint
9. Packed ESM and CommonJS runtime checks

## Explicit exports

Every public language and theme is listed individually in `package.json`.

When adding a language:

1. Add `src/languages/<name>.ts`
2. Add `./lang/<name>` to `package.json#exports`
3. Add tests and documentation
4. Run `npm run check`

`npm run check:exports` fails when a source language or theme has no exact export, when an export target is missing, or when a wildcard path is introduced.

Internal files under `src/languages/shared/` are not public package entry points.

## Build output

```text
dist/
  esm/       Preserved ESM runtime module graph
  cjs/       Self-contained CommonJS public entries
  types/     .d.ts and .d.cts declarations
```

The default production build omits source maps to keep the npm package compact. Use `npm run build:debug` when local source maps are useful.

The ESM build includes private internal runtime modules so related public
languages can share implementation code. Package exports still prevent consumers
from importing those private paths. CommonJS public entries remain self-contained.

The build script excludes internal shared grammar declarations from the published type tree.

## Tree-shaking test

The tree-shaking test:

1. Packs the real npm tarball
2. Installs it into a temporary consumer project
3. Bundles public imports from `@blcklab/yuirinx`
4. Verifies unrelated languages and themes are absent
5. Verifies JavaScript, TypeScript, JSX, and TSX share one preserved ECMAScript grammar module

This tests the published package contract rather than importing source files directly.

## Package contents

Preview the tarball:

```bash
npm pack --dry-run
```

The package whitelist publishes `dist`. npm also includes the required package metadata and standard files:

- `package.json`
- `README.md`
- `LICENSE`

Documentation, examples, source files, tests, scripts, source maps, local lockfiles, and development configuration are not included.

## Publishing

Confirm npm authentication and package availability:

```bash
npm whoami
npm view @blcklab/yuirinx
```

Run the release gate:

```bash
npm run check
npm pack --dry-run
```

Publish:

```bash
npm publish --access public
```

`prepublishOnly` automatically runs `npm run check`, and `publishConfig` forces publication to the public npm registry.

## Versioning

Before `1.0.0`:

- Patch: fixes that do not intentionally alter public behavior
- Minor: new languages, themes, APIs, or intentional pre-1.0 changes

After `1.0.0`, follow normal semantic versioning and treat exported paths, public types, error codes, language IDs, and theme IDs as public API.
