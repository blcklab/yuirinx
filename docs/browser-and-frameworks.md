# Browser and Framework Usage

The Yuirinx core does not access `document`, `window`, Node globals, or the network. It can run in browsers, workers, server rendering, and edge-style runtimes.

## Browser with a bundler

Use Yuirinx normally with Vite, Rollup, esbuild, webpack, or another modern bundler.

```ts
import { createHighlighter } from "@blcklab/yuirinx";
import { javascript } from "@blcklab/yuirinx/lang/javascript";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";
```

## Browser without a bundler

Browsers do not resolve npm package names by themselves. Use an import map, a CDN that provides ESM package resolution, or locally served build files.

```html
<div id="output"></div>

<script type="module">
  import { createHighlighter } from "./node_modules/@blcklab/yuirinx/dist/esm/index.js";
  import { javascript } from "./node_modules/@blcklab/yuirinx/dist/esm/languages/javascript.js";
  import { yuirinxNoir } from "./node_modules/@blcklab/yuirinx/dist/esm/themes/yuirinx-noir.js";

  const yuirinx = createHighlighter({
    languages: [javascript],
    themes: [yuirinxNoir],
  });

  document.querySelector("#output").innerHTML = yuirinx.highlight(
    `const ready = true`,
    { lang: "javascript", theme: "yuirinx-noir" },
  );
</script>
```

Serve this example over HTTP. Browser module imports are commonly blocked from `file://` URLs.

## Vue

```vue
<script setup lang="ts">
import { computed } from "vue";
import { createHighlighter } from "@blcklab/yuirinx";
import { typescript } from "@blcklab/yuirinx/lang/typescript";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";

const props = defineProps<{ code: string }>();

const yuirinx = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir],
});

const html = computed(() =>
  yuirinx.highlight(props.code, {
    lang: "typescript",
    theme: "yuirinx-noir",
  }),
);
</script>

<template>
  <div v-html="html" />
</template>
```

Yuirinx escapes the source before returning HTML. Keep grammars and themes under developer control.

For a component that avoids `v-html`, use `tokenize()` and render token values through normal Vue text interpolation.

## React

```tsx
import { useMemo } from "react";

export function CodeBlock({ code }: { code: string }) {
  const html = useMemo(
    () =>
      yuirinx.highlight(code, {
        lang: "typescript",
        theme: "yuirinx-noir",
      }),
    [code],
  );

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

For a renderer without `dangerouslySetInnerHTML`, tokenize and render each token as a React text child.

## Server rendering

Create one immutable configured instance per application module, or create isolated instances when registries differ.

```ts
export const docsHighlighter = createHighlighter({
  languages: [javascript, typescript, json],
  themes: [yuirinxNoir],
});
```

The core is synchronous, so no initialization promise is required.

## Web workers

Yuirinx can tokenize or render inside a worker because the core has no DOM dependency.

```ts
self.onmessage = (event) => {
  const html = yuirinx.highlight(event.data.code, {
    lang: event.data.lang,
    theme: "yuirinx-noir",
  });

  self.postMessage({ html });
};
```
