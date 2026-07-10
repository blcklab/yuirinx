import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const src = path.join(root, "src");
const dist = path.join(root, "dist");
const sourceMap = process.argv.includes("--sourcemap");

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(full)));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts"))
      files.push(full);
  }
  return files;
}

await rm(dist, { recursive: true, force: true });

const allFiles = await filesIn(src);
const entryPoints = allFiles.filter((file) => {
  const relative = path.relative(src, file).replaceAll("\\", "/");
  return (
    relative === "index.ts" ||
    relative === "core/index.ts" ||
    relative === "themes/index.ts" ||
    (relative.startsWith("languages/") &&
      !relative.startsWith("languages/shared/")) ||
    (relative.startsWith("themes/") && relative !== "themes/index.ts")
  );
});

const common = {
  entryPoints,
  bundle: true,
  outbase: src,
  entryNames: "[dir]/[name]",
  sourcemap: sourceMap,
  target: "es2020",
  minify: false,
  legalComments: "none",
  logLevel: "info",
};

await build({
  ...common,
  format: "esm",
  platform: "neutral",
  outdir: path.join(dist, "esm"),
});

await build({
  ...common,
  format: "cjs",
  platform: "node",
  outdir: path.join(dist, "cjs"),
  outExtension: { ".js": ".cjs" },
});

const tsc = spawnSync(
  process.execPath,
  [
    path.join(root, "node_modules/typescript/bin/tsc"),
    "-p",
    path.join(root, "tsconfig.build.json"),
  ],
  { cwd: root, stdio: "inherit" },
);

if (tsc.status !== 0) process.exit(tsc.status ?? 1);

// Internal grammar helpers are implementation details, not public declaration entries.
await rm(path.join(dist, "types", "languages", "shared"), {
  recursive: true,
  force: true,
});

async function createCommonJsDeclarations(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await createCommonJsDeclarations(full);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;
    const target = full.replace(/\.d\.ts$/, ".d.cts");
    const declaration = await readFile(full, "utf8");
    await writeFile(
      target,
      declaration.replaceAll(/(from\s+['"][^'"]+)\.js(['"])/g, "$1.cjs$2"),
    );
  }
}

await createCommonJsDeclarations(path.join(dist, "types"));
