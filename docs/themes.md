# Themes

Yuirinx ships three original themes as plain JavaScript objects.

## Yuirinx Noir

A restrained dark theme for documentation and long code samples.

```ts
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";
```

Theme ID: `yuirinx-noir`

## Yuirinx Pearl

A warm light theme for documentation and readable screenshots.

```ts
import { yuirinxPearl } from "@blcklab/yuirinx/theme/yuirinx-pearl";
```

Theme ID: `yuirinx-pearl`

## Yuirinx Aurora

A more expressive dark theme for showcases and landing pages.

```ts
import { yuirinxAurora } from "@blcklab/yuirinx/theme/yuirinx-aurora";
```

Theme ID: `yuirinx-aurora`

## Import all built-in themes

```ts
import {
  yuirinxAurora,
  yuirinxNoir,
  yuirinxPearl,
} from "@blcklab/yuirinx/themes";
```

Importing the theme index intentionally includes all built-in themes. Import individual theme paths for the smallest bundle.

## Register themes

```ts
const yuirinx = createHighlighter({
  themes: [yuirinxNoir, yuirinxPearl],
  defaultTheme: "yuirinx-noir",
});
```

## Use a theme object directly

A theme does not need to be registered when passed directly:

```ts
const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: yuirinxNoir,
});
```

## Token-style fallback

Yuirinx resolves specialized token types from most specific to least specific.

For example:

```text
keyword.control → keyword
comment.documentation → comment
string.escape → string
```

If no matching token style exists, the theme foreground color remains in effect.

## Class-mode CSS

```ts
import { themeToCss } from "@blcklab/yuirinx";

const css = themeToCss(yuirinxNoir, {
  selector: ".theme-noir",
});
```

See [Rendering and styling](rendering.md) for complete class-mode usage.
