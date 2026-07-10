# Custom Themes

Themes are plain objects mapping semantic token types to safe visual styles.

## Create a theme

```ts
import type { Theme } from "@blcklab/yuirinx";

export const midnightInk: Theme = {
  id: "midnight-ink",
  name: "Midnight Ink",
  type: "dark",
  foreground: "#e6e9f2",
  background: "#090b12",
  fallbackPalette: ["#70d5e7", "#c2a2f2", "#8bd6aa", "#f0bd73", "#ff7da8"],
  tokens: {
    comment: { color: "#6f7890", fontStyle: "italic" },
    keyword: { color: "#ff7da8", fontWeight: "semibold" },
    string: { color: "#8bd6aa" },
    number: { color: "#f0bd73" },
    function: { color: "#70d5e7" },
    type: { color: "#c2a2f2" },
    operator: { color: "#a9b4c8" },
    punctuation: { color: "#7f8aa3" },
  },
};
```

## Register and use it

```ts
const yuirinx = createHighlighter({
  languages: [typescript],
  themes: [midnightInk],
});

const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "midnight-ink",
});
```

You can also pass the object directly without registration.

## Supported style properties

```ts
interface TokenStyle {
  color?: string;
  backgroundColor?: string;
  fontStyle?: "normal" | "italic";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textDecoration?: "none" | "underline" | "line-through";
}
```

Yuirinx serializes only this allowlisted set.

## Color formats

Use standard safe colors such as:

```text
#fff
#d7deea
rgb(20, 24, 34)
rgb(20 24 34)
hsl(220 20% 12%)
transparent
```

Invalid color strings are omitted during rendering.

## Specialized styles

```ts
tokens: {
  keyword: { color: "#ff7da8" },
  "keyword.control": { color: "#ff9b73" },
}
```

`keyword.control` uses the exact style. Other keyword subtypes fall back to `keyword`.

## Generate CSS

```ts
const css = themeToCss(midnightInk, {
  selector: ".midnight-code",
  classPrefix: "tok-",
});
```

Use the same prefix when highlighting in class mode.

## Unknown-language palette

`fallbackPalette` controls `fallback: "color-lines"`. Keep it curated, readable against the theme background, and preferably between four and eight colors.

When it is omitted, Yuirinx derives a small palette from valid token colors. If no usable colors exist, the fallback remains normal plaintext. Invalid color values are ignored.
