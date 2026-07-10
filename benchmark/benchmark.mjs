import { performance } from "node:perf_hooks";
import { createHighlighter } from "../dist/esm/core/index.js";
import { javascript } from "../dist/esm/languages/javascript.js";
import { json } from "../dist/esm/languages/json.js";
import { markdown } from "../dist/esm/languages/markdown.js";
import { yuirinxAurora } from "../dist/esm/themes/yuirinx-aurora.js";

const yuirinx = createHighlighter({
  languages: [javascript, json, markdown],
  themes: [yuirinxAurora],
});
const fixtures = [
  [
    "JavaScript 10k lines",
    Array.from(
      { length: 10_000 },
      (_, index) =>
        `export const value${index} = \`item-${index}: \${${index} * 2}\` // row ${index}`,
    ).join("\n"),
    "javascript",
  ],
  [
    "Long single line",
    `const values = [${Array.from({ length: 25_000 }, (_, index) => index).join(",")}];`,
    "javascript",
  ],
  [
    "Large JSON",
    JSON.stringify({
      items: Array.from({ length: 8_000 }, (_, id) => ({
        id,
        name: `Item ${id}`,
        enabled: id % 2 === 0,
      })),
    }),
    "json",
  ],
  [
    "Markdown fences",
    Array.from(
      { length: 2_000 },
      (_, index) =>
        `## Section ${index}\n\n\`\`\`ts\nconst value = ${index}\n\`\`\``,
    ).join("\n\n"),
    "markdown",
  ],
];

console.log("Yuirinx benchmark (warm synchronous tokenization)\n");
for (const [name, source, lang] of fixtures) {
  yuirinx.tokenize(source, lang);
  const started = performance.now();
  const tokens = yuirinx.tokenize(source, lang);
  const duration = performance.now() - started;
  const mb = Buffer.byteLength(source) / 1024 / 1024;
  const throughput = mb / (duration / 1000);
  console.log(
    `${name.padEnd(22)} ${mb.toFixed(2)} MB  ${duration.toFixed(2)} ms  ${throughput.toFixed(1)} MB/s  ${tokens.length} tokens`,
  );
}

const fallbackSource = Array.from(
  { length: 10_000 },
  (_, index) => `custom instruction ${index} <unsafe-${index}>`,
).join("\n");
yuirinx.highlight(fallbackSource, {
  lang: "benchmark-dsl",
  theme: "yuirinx-aurora",
  fallback: "color-lines",
});
const fallbackStarted = performance.now();
const fallbackHtml = yuirinx.highlight(fallbackSource, {
  lang: "benchmark-dsl",
  theme: "yuirinx-aurora",
  fallback: "color-lines",
});
const fallbackDuration = performance.now() - fallbackStarted;
const fallbackMb = Buffer.byteLength(fallbackSource) / 1024 / 1024;
console.log(
  `${"Fallback color 10k".padEnd(22)} ${fallbackMb.toFixed(2)} MB  ${fallbackDuration.toFixed(2)} ms  ${(fallbackMb / (fallbackDuration / 1000)).toFixed(1)} MB/s  ${fallbackHtml.length} HTML chars`,
);
