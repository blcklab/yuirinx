# API Reference

## `createHighlighter(options?)`

Creates an isolated highlighter instance.

```ts
import { createHighlighter } from "@blcklab/yuirinx";

const yuirinx = createHighlighter({
  languages: [],
  themes: [],
  defaultLanguage: "plaintext",
  defaultTheme: undefined,
  defaultFallback: "plaintext",
  maxStateDepth: 64,
});
```

### `HighlighterOptions`

| Option            | Type                           | Default     | Description                                             |
| ----------------- | ------------------------------ | ----------- | ------------------------------------------------------- |
| `languages`       | `readonly Grammar[]`           | `[]`        | Grammars registered at creation                         |
| `themes`          | `readonly Theme[]`             | `[]`        | Themes registered at creation                           |
| `defaultLanguage` | `string`                       | `plaintext` | Used when `highlight()` receives no `lang`              |
| `defaultTheme`    | `string`                       | none        | Used when `highlight()` or `render()` receives no theme |
| `defaultFallback` | `"plaintext" \| "color-lines"` | `plaintext` | Behavior used for unavailable language IDs              |
| `maxStateDepth`   | `number`                       | `64`        | Maximum tokenizer state-stack depth                     |

## `highlighter.highlight(code, options)`

Tokenizes source code and returns escaped HTML.

```ts
const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  fallback: "plaintext",
  mode: "inline",
  wrap: true,
  classPrefix: "tok-",
  preClass: "docs-code",
  codeClass: "source",
});
```

### `HighlightOptions`

| Option        | Type                           | Default                           | Description                                          |
| ------------- | ------------------------------ | --------------------------------- | ---------------------------------------------------- |
| `lang`        | `string \| Grammar`            | configured default or `plaintext` | Language ID, alias, or grammar object                |
| `theme`       | `string \| Theme`              | configured default                | Theme ID or object                                   |
| `fallback`    | `"plaintext" \| "color-lines"` | `plaintext`                       | Rendering used only when the language is unavailable |
| `mode`        | `"inline" \| "classes"`        | `inline`                          | Token rendering mode                                 |
| `wrap`        | `boolean`                      | `true`                            | Include `<pre><code>` wrappers                       |
| `classPrefix` | `string`                       | `tok-`                            | Prefix used for token classes                        |
| `preClass`    | `string`                       | none                              | Extra sanitized classes for `<pre>`                  |
| `codeClass`   | `string`                       | none                              | Extra sanitized classes for `<code>`                 |

## `highlighter.tokenize(code, language)`

Returns source tokens without rendering HTML.

```ts
const tokens = yuirinx.tokenize("const answer = 42", "javascript");
```

Each token contains:

```ts
interface Token {
  readonly type: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
}
```

Offsets use JavaScript UTF-16 string indices.

Yuirinx guarantees:

```ts
tokens.map((token) => token.value).join("") === code;
```

## `highlighter.render(tokens, options?)`

Renders an existing token array.

```ts
const html = yuirinx.render(tokens, {
  theme: "yuirinx-noir",
  mode: "classes",
  language: "javascript",
});
```

`RenderOptions` supports the rendering fields (`theme`, `mode`, `wrap`, class options), plus `language` for the wrapper class. Unknown-language fallback belongs to `highlight()` because `render()` receives tokens rather than a language lookup.

## Registration and inspection

```ts
yuirinx.registerLanguage(grammar);
yuirinx.registerTheme(theme);

yuirinx.hasLanguage("typescript");
yuirinx.hasTheme("yuirinx-noir");

yuirinx.getLanguage("ts");
yuirinx.getTheme("yuirinx-noir");

yuirinx.listLanguages();
yuirinx.listThemes();
```

`listLanguages()` returns canonical language IDs, not aliases.

## `themeToCss(theme, options?)`

Generates CSS for class rendering.

```ts
import { themeToCss } from "@blcklab/yuirinx";

const css = themeToCss(yuirinxNoir, {
  selector: ".docs-code",
  classPrefix: "tok-",
  includeContainer: true,
});
```

## `escapeHtml(value)`

Escapes `&`, `<`, `>`, double quotes, and single quotes.

```ts
import { escapeHtml } from "@blcklab/yuirinx/core";
```

Normal highlighting already escapes source code. Use this helper only for custom rendering.

## Convenience singleton

The root entry also exports a shared highlighter registry:

```ts
import {
  highlight,
  registerLanguage,
  registerTheme,
  render,
  tokenize,
} from "@blcklab/yuirinx";
```

Use it for small applications. Prefer `createHighlighter()` when state isolation matters.

## Errors

Invalid grammar configuration and duplicate registrations throw `YuirinxError`.

```ts
import { YuirinxError } from "@blcklab/yuirinx";

try {
  yuirinx.registerLanguage(grammar);
} catch (error) {
  if (error instanceof YuirinxError) {
    console.error(error.code, error.message);
  }
}
```

Public error codes include:

- `YUIRINX_INVALID_GRAMMAR`
- `YUIRINX_EMPTY_PATTERN`
- `YUIRINX_DUPLICATE_LANGUAGE`
- `YUIRINX_DUPLICATE_ALIAS`
- `YUIRINX_DUPLICATE_THEME`
- `YUIRINX_UNKNOWN_STATE`
- `YUIRINX_INCLUDE_CYCLE`
- `YUIRINX_STATE_DEPTH_EXCEEDED`
