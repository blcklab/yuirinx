# Getting Started

## Requirements

Yuirinx supports Node.js 22 or newer for Node-based development and package consumption. The generated ESM code targets ES2020 and also works in modern browsers, workers, and compatible edge runtimes.

## Install

```bash
npm install @blcklab/yuirinx
```

Yuirinx has no runtime dependencies.

## Create a highlighter

Import the core function, the languages you need, and one or more themes.

```ts
import { createHighlighter } from "@blcklab/yuirinx";
import { javascript } from "@blcklab/yuirinx/lang/javascript";
import { typescript } from "@blcklab/yuirinx/lang/typescript";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";

const yuirinx = createHighlighter({
  languages: [javascript, typescript],
  themes: [yuirinxNoir],
});
```

The highlighter owns an isolated language and theme registry. Creating separate instances is recommended for servers, tests, edge functions, and applications with different configurations.

## Highlight code

```ts
const source = `
interface User {
  name: string;
}

const user: User = { name: "Yui" };
`.trim();

const html = yuirinx.highlight(source, {
  lang: "typescript",
  theme: "yuirinx-noir",
});
```

By default, Yuirinx returns a complete code block:

```html
<pre
  class="yuirinx yuirinx-theme-noir"
><code class="language-typescript">...</code></pre>
```

## Add the container styling

The theme colors tokens and the code-block background. Your application controls spacing, borders, fonts, and scrolling.

```css
.yuirinx {
  margin: 0;
  overflow-x: auto;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  tab-size: 2;
}
```

## Use a default language and theme

```ts
const yuirinx = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir],
  defaultLanguage: "typescript",
  defaultTheme: "yuirinx-noir",
});

const html = yuirinx.highlight(source, {});
```

## Register modules later

```ts
const yuirinx = createHighlighter();

yuirinx.registerLanguage(typescript);
yuirinx.registerTheme(yuirinxNoir);
```

Duplicate language IDs, aliases, and theme IDs throw a descriptive `YuirinxError`.

## Unknown languages

An unknown language does not throw. Yuirinx safely renders the source as plaintext by default.

```ts
const html = yuirinx.highlight(source, {
  lang: "future-language",
  theme: "yuirinx-noir",
});
```

For a decorative but still honest plaintext presentation, opt into deterministic theme-aware line colors:

```ts
const html = yuirinx.highlight(source, {
  lang: "future-language",
  theme: "yuirinx-aurora",
  fallback: "color-lines",
});
```

This does not guess tokens or pretend to understand the language. It only colors complete escaped lines, and the same source always produces the same sequence.

## Next steps

- [Rendering and styling](rendering.md)
- [Languages and aliases](languages.md)
- [API reference](api.md)
