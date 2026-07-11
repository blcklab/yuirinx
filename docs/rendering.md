# Rendering and Styling

Yuirinx supports inline styles and semantic CSS classes.

## Inline mode

Inline mode is the default. It requires no generated theme stylesheet.

```ts
const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  mode: "inline",
});
```

Tokens are rendered like:

```html
<span style="color:#ff7d9c;font-weight:600">const</span>
```

The wrapper receives the theme foreground and background colors.

## Class mode

Class mode emits semantic classes instead of token-level styles.

```ts
const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  mode: "classes",
});
```

```html
<span class="tok-function tok-function-call">log</span>
```

Dot-separated token types receive every class in their hierarchy. This lets a
`function.call` token inherit `.tok-function` styling while still allowing a
more specific `.tok-function-call` override.

Generate the matching CSS:

```ts
import { themeToCss } from "@blcklab/yuirinx";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";

const css = themeToCss(yuirinxNoir);
```

Use class mode when you want:

- A shared stylesheet
- Theme switching through container classes
- Content Security Policy rules that disallow inline styles
- Full control over token presentation

## Custom selector and prefix

```ts
const css = themeToCss(yuirinxNoir, {
  selector: ".article-code",
  classPrefix: "syntax-",
});

const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  mode: "classes",
  classPrefix: "syntax-",
  preClass: "article-code",
});
```

The `classPrefix` passed to both calls must match.

## Unknown-language color flow

Plaintext is the default fallback. For unsupported languages, custom DSLs, logs, or pseudocode, `color-lines` applies a deterministic palette from the active theme:

```ts
const html = yuirinx.highlight(code, {
  lang: "my-company-dsl",
  theme: "yuirinx-aurora",
  fallback: "color-lines",
});
```

This mode:

- Runs only when the requested language is unavailable
- Preserves and escapes every source character
- Uses no randomness, so SSR and client output match
- Works with inline and class rendering
- Falls back to normal plaintext when no usable theme palette exists

In class mode, `themeToCss()` automatically emits the matching `tok-fallback-line-*` rules. Configure an instance-wide default with `defaultFallback: "color-lines"`. Explicit `plaintext`, `text`, `txt`, and `plain` IDs are never decorated.

## Wrapper control

Set `wrap: false` to return only token spans and escaped text.

```ts
const fragment = yuirinx.highlight(code, {
  lang: "javascript",
  theme: "yuirinx-aurora",
  wrap: false,
});
```

This is useful when your component already owns the `<pre>` and `<code>` elements.

## Extra classes

```ts
const html = yuirinx.highlight(code, {
  lang: "json",
  theme: "yuirinx-pearl",
  preClass: "docs-code shadow-card",
  codeClass: "source-code",
});
```

Class values are sanitized before rendering.

## Recommended container CSS

```css
.yuirinx {
  position: relative;
  margin: 0;
  overflow-x: auto;
  border: 1px solid rgb(127 127 127 / 16%);
  border-radius: 16px;
  padding: 1.25rem 1.4rem;
  box-shadow: 0 18px 50px rgb(0 0 0 / 14%);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  white-space: pre;
  tab-size: 2;
}

.yuirinx code {
  font: inherit;
}
```

## Render tokens yourself

```ts
const tokens = yuirinx.tokenize(code, "typescript");
```

Use `escapeHtml()` before inserting token values into custom HTML. Frameworks that render token values as text nodes usually escape them automatically.
