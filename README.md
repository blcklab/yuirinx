<p align="center">
 <img
  src="https://cdn.jsdelivr.net/gh/blcklab/yuirinx@master/docs/logo.png"
  alt="Yuirinx logo"
  width="110"
/>
</p>

<h1 align="center">Yuirinx</h1>

<p align="center">
  A lightweight, synchronous syntax highlighter for modern JavaScript and TypeScript applications.
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/@blcklab/yuirinx?style=flat-square" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/@blcklab/yuirinx?style=flat-square" alt="downloads" />
  <img src="https://github.com/blcklab/yuirinx/actions/workflows/test.yml/badge.svg?style=flat-square" alt="tests" />
  <img src="https://img.shields.io/github/license/blcklab/yuirinx?style=flat-square" alt="license" />
</p>

Yuirinx gives you safe, themeable syntax highlighting with zero runtime dependencies. Languages and themes are imported separately, so your app only bundles what it actually uses.

## Installation

```bash
npm install @blcklab/yuirinx
```

## Quick Start

```ts
import { createHighlighter } from "@blcklab/yuirinx";
import { typescript } from "@blcklab/yuirinx/lang/typescript";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";

const highlighter = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir],
});

const html = highlighter.highlight(
  `const message: string = "Hello, Yuirinx!";`,
  {
    lang: "typescript",
    theme: "yuirinx-noir",
  },
);
```

Yuirinx returns safely escaped HTML wrapped in a `<pre><code>` block:

```html
<pre class="yuirinx yuirinx-theme-noir">
  <code class="language-typescript">...</code>
</pre>
```

Add your preferred layout styles:

```css
.yuirinx {
  margin: 0;
  overflow-x: auto;
  padding: 1.25rem;
  border-radius: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  tab-size: 2;
}
```

## Features

- Zero runtime dependencies
- Synchronous API with no setup step
- Safe HTML escaping
- Individually importable languages and themes
- ESM and CommonJS support
- Inline-style and CSS-class rendering
- Token API for custom renderers
- Custom language and theme registration
- Works in browsers, Node.js, workers, serverless, and edge runtimes
- Safe plaintext fallback for unsupported languages

## Tree-Shakable by Design

Each language has its own public entry point:

```ts
import { createHighlighter } from "@blcklab/yuirinx";
import { json } from "@blcklab/yuirinx/lang/json";

const highlighter = createHighlighter({
  languages: [json],
});
```

Importing JSON does not load JavaScript, TypeScript, Python, or any other grammar.

## Themes

Yuirinx includes three original themes:

```ts
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";
import { yuirinxPearl } from "@blcklab/yuirinx/theme/yuirinx-pearl";
import { yuirinxAurora } from "@blcklab/yuirinx/theme/yuirinx-aurora";
```

- **Yuirinx Noir** — a refined dark theme for documentation and long code samples
- **Yuirinx Pearl** — a warm light theme with comfortable contrast
- **Yuirinx Aurora** — an expressive dark theme for showcases and landing pages

Register more than one theme when your app supports theme switching:

```ts
const highlighter = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir, yuirinxPearl],
});
```

## Unsupported Languages

Unsupported or unregistered languages safely fall back to escaped plaintext:

```ts
const html = highlighter.highlight(code, {
  lang: "my-custom-language",
  theme: "yuirinx-noir",
});
```

For unsupported code that should still look expressive, enable deterministic color flow:

```ts
const html = highlighter.highlight(code, {
  lang: "my-custom-language",
  theme: "yuirinx-aurora",
  fallback: "color-lines",
});
```

The colors are deterministic, theme-aware, and stable across server and browser rendering.

## CSS-Class Rendering

Inline styles work without extra setup. If you want full control through your own stylesheet, use class mode:

```ts
import { createHighlighter, themeToCss } from "@blcklab/yuirinx";

const html = highlighter.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  mode: "classes",
});

const css = themeToCss(yuirinxNoir);
```

Class mode is useful for:

- Content Security Policies that restrict inline styles
- Automatic light and dark mode
- Shared application stylesheets
- Custom token styling

## Token API

Use the lower-level token API when rendering code through Vue, React, a terminal, or another custom interface:

```ts
const tokens = highlighter.tokenize(`const enabled = true;`, "typescript");

for (const token of tokens) {
  console.log(token.type, token.value);
}
```

Each token includes its type, source value, and original character offsets.

## Supported Languages

Yuirinx includes independently importable grammars for popular web, systems, application, and configuration languages, including:

- JavaScript, TypeScript, JSX, and TSX
- HTML, XML, CSS, and SCSS
- JSON, YAML, TOML, and INI
- Markdown
- Bash and shell scripts
- Python, PHP, Ruby, and SQL
- C, C++, C#, Java, Kotlin, Swift, Dart, Go, and Rust
- Vue and Svelte
- Dockerfile, Nginx, and GraphQL
- Plaintext

Each grammar also registers common aliases such as `js`, `ts`, `py`, `md`, `yml`, `sh`, and `c++`.

## Security

Yuirinx treats source code as untrusted text.

It:

- Escapes HTML-sensitive characters
- Never evaluates or executes source code
- Does not use `eval` or `new Function`
- Does not require DOM access
- Preserves malformed and unfinished source safely
- Falls back to escaped plaintext when a grammar is unavailable

The returned HTML is intended for normal HTML content contexts. Do not place it directly inside JavaScript, CSS, or URL contexts.

## Documentation

Complete guides and API documentation are available in the project repository:

- [Getting started](https://github.com/blcklab/yuirinx/blob/main/docs/getting-started.md)
- [API reference](https://github.com/blcklab/yuirinx/blob/main/docs/api.md)
- [Rendering and styling](https://github.com/blcklab/yuirinx/blob/main/docs/rendering.md)
- [Languages and aliases](https://github.com/blcklab/yuirinx/blob/main/docs/languages.md)
- [Themes](https://github.com/blcklab/yuirinx/blob/main/docs/themes.md)
- [Custom languages](https://github.com/blcklab/yuirinx/blob/main/docs/custom-languages.md)
- [Custom themes](https://github.com/blcklab/yuirinx/blob/main/docs/custom-themes.md)
- [Browser and framework usage](https://github.com/blcklab/yuirinx/blob/main/docs/browser-and-frameworks.md)
- [Security](https://github.com/blcklab/yuirinx/blob/main/docs/security.md)
- [Limitations](https://github.com/blcklab/yuirinx/blob/main/docs/limitations.md)

## Project Status

Yuirinx `0.1.x` is suitable for documentation sites, blogs, code previews, static rendering, and application interfaces.

The public API may receive small refinements before `1.0.0`.

Yuirinx performs lightweight lexical highlighting. It is not a compiler, AST parser, semantic analyzer, or language server.

## License

MIT BLCKLAB
