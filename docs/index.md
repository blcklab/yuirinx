# Yuirinx Documentation

Yuirinx is a synchronous, zero-runtime-dependency syntax highlighter for JavaScript and TypeScript applications.

It converts source code into either:

- Safe highlighted HTML
- A token array for custom rendering

Yuirinx is designed for documentation sites, blogs, static-site generators, code previews, server rendering, workers, and edge runtimes.

## Start here

1. [Install and create a highlighter](getting-started.md)
2. [Choose a rendering mode](rendering.md)
3. [Import supported languages](languages.md)
4. [Choose or create a theme](themes.md)

## Complete guides

| Guide                                               | Purpose                                                   |
| --------------------------------------------------- | --------------------------------------------------------- |
| [Getting started](getting-started.md)               | Installation and first highlighted block                  |
| [API reference](api.md)                             | Public functions, objects, and options                    |
| [Rendering and styling](rendering.md)               | Inline styles, CSS classes, wrappers, and token rendering |
| [Languages and aliases](languages.md)               | Every public language import and recognized alias         |
| [Themes](themes.md)                                 | Built-in themes and theme registration                    |
| [Custom languages](custom-languages.md)             | Create an original grammar with ordered rules and states  |
| [Custom themes](custom-themes.md)                   | Build and register a theme object                         |
| [Browser and frameworks](browser-and-frameworks.md) | Browser modules, Vue, React, SSR, and safe HTML insertion |
| [Security](security.md)                             | Escaping guarantees, trust boundaries, and safe usage     |
| [Limitations](limitations.md)                       | Honest lexical-highlighting tradeoffs                     |
| [Development](development.md)                       | Build, test, package, verify, and publish Yuirinx         |

## Main API

```ts
import { createHighlighter } from "@blcklab/yuirinx";
```

```ts
const yuirinx = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir],
});

const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
});
```

## Design principles

- No runtime dependencies
- No DOM access in the core
- No WASM or asynchronous initialization
- Explicit, tree-shakable language and theme imports
- Source code is preserved exactly by tokenization
- Source code is escaped before HTML rendering
- Unknown languages fall back to plaintext, with an optional deterministic color flow
- Grammars are lexical and intentionally smaller than TextMate grammars
