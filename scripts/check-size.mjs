import { gzipSync } from "node:zlib";
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);

const cases = [
  {
    name: "core",
    source: `export { createHighlighter, themeToCss } from './src/core/index.ts'`,
    budget: 5 * 1024,
  },
  {
    name: "core + json",
    source: `export { createHighlighter } from './src/core/index.ts'; export { json } from './src/languages/json.ts'`,
    budget: 7 * 1024,
  },
  {
    name: "core + typescript",
    source: `export { createHighlighter } from './src/core/index.ts'; export { typescript } from './src/languages/typescript.ts'`,
    budget: 9 * 1024,
  },
  {
    name: "theme/yuirinx-noir",
    source: `export { yuirinxNoir } from './src/themes/yuirinx-noir.ts'`,
    budget: 2 * 1024,
  },
];

let failed = false;
console.log("Yuirinx size report\n");
for (const item of cases) {
  const result = await build({
    stdin: {
      contents: item.source,
      resolveDir: root,
      sourcefile: `${item.name.replaceAll(/[^a-z]+/g, "-")}.ts`,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    minify: true,
    write: false,
  });
  const bytes = result.outputFiles[0]?.contents ?? new Uint8Array();
  const gzip = gzipSync(bytes).byteLength;
  const label = item.name.padEnd(24);
  console.log(
    `${label}${(gzip / 1024).toFixed(2)} KB gzip (budget ${(item.budget / 1024).toFixed(0)} KB)`,
  );
  if (gzip > item.budget) failed = true;
}
if (failed) {
  console.error("\nOne or more size budgets were exceeded.");
  process.exit(1);
}
