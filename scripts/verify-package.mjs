import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (Object.keys(pkg.dependencies ?? {}).length !== 0) {
  throw new Error("Runtime dependencies must remain empty.");
}

const required = [
  "dist/esm/index.js",
  "dist/cjs/index.cjs",
  "dist/types/index.d.ts",
  "dist/esm/languages/json.js",
  "dist/cjs/languages/json.cjs",
  "dist/types/languages/json.d.ts",
  "dist/esm/themes/yuirinx-noir.js",
];
await Promise.all(required.map((file) => access(path.join(root, file))));

const temp = await mkdtemp(path.join(os.tmpdir(), "yuirinx-package-"));
try {
  const packed = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", temp],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (packed.status !== 0) throw new Error(packed.stderr || "npm pack failed");
  const output = JSON.parse(packed.stdout);
  const filename = output[0]?.filename;
  if (!filename) throw new Error("npm pack did not return a tarball filename.");

  const fixture = path.join(temp, "fixture");
  const init = spawnSync("npm", ["init", "-y"], { cwd: temp, stdio: "ignore" });
  if (init.status !== 0)
    throw new Error("Could not initialize package fixture.");
  const install = spawnSync(
    "npm",
    ["install", "--ignore-scripts", path.join(temp, filename)],
    {
      cwd: temp,
      stdio: "inherit",
    },
  );
  if (install.status !== 0)
    throw new Error("Could not install packed Yuirinx tarball.");

  const esm = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import { createHighlighter } from '@blcklab/yuirinx'
    import { json } from '@blcklab/yuirinx/lang/json'
    import { yuirinxNoir } from '@blcklab/yuirinx/theme/yuirinx-noir'
    const yuirinx = createHighlighter({ languages: [json], themes: [yuirinxNoir] })
    const html = yuirinx.highlight('{"safe":"<tag>"}', { lang: 'json', theme: 'yuirinx-noir' })
    if (!html.includes('&lt;tag&gt;')) process.exit(2)
    const fallback = yuirinx.highlight('<one>\\ntwo', {
      lang: 'future-dsl',
      theme: 'yuirinx-noir',
      fallback: 'color-lines',
    })
    if (!fallback.includes('yuirinx-fallback-lines')) process.exit(3)
    if (fallback.includes('<one>')) process.exit(4)
  `,
    ],
    { cwd: temp, stdio: "inherit" },
  );
  if (esm.status !== 0) throw new Error("Packed ESM import failed.");

  const cjs = spawnSync(
    process.execPath,
    [
      "-e",
      `
    const { createHighlighter } = require('@blcklab/yuirinx')
    const { json } = require('@blcklab/yuirinx/lang/json')
    const yuirinx = createHighlighter({ languages: [json] })
    if (!yuirinx.highlight('{}', { lang: 'json' }).includes('<pre')) process.exit(2)
  `,
    ],
    { cwd: temp, stdio: "inherit" },
  );
  if (cjs.status !== 0) throw new Error("Packed CommonJS require failed.");

  const privatePath = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
      try {
        await import('@blcklab/yuirinx/lang/shared/helpers')
        process.exit(2)
      } catch (error) {
        if (error?.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') process.exit(3)
      }
    `,
    ],
    { cwd: temp, stdio: "inherit" },
  );
  if (privatePath.status !== 0) {
    throw new Error("Internal package paths are not properly encapsulated.");
  }

  await writeFile(
    path.join(temp, "consumer.mts"),
    `
      import { createHighlighter } from '@blcklab/yuirinx'
      import { json } from '@blcklab/yuirinx/lang/json'
      import { yuirinxNoir } from '@blcklab/yuirinx/theme/yuirinx-noir'
      const instance = createHighlighter({ languages: [json], themes: [yuirinxNoir] })
      instance.highlight('{}', { lang: 'json', theme: 'yuirinx-noir' })
    `,
  );
  await writeFile(
    path.join(temp, "consumer.cts"),
    `
      import yuirinx = require('@blcklab/yuirinx')
      import jsonLanguage = require('@blcklab/yuirinx/lang/json')
      const instance = yuirinx.createHighlighter({ languages: [jsonLanguage.json] })
      instance.highlight('{}', { lang: 'json' })
    `,
  );
  await writeFile(
    path.join(temp, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["consumer.mts", "consumer.cts"],
      },
      null,
      2,
    ),
  );

  const types = spawnSync(
    process.execPath,
    [
      path.join(root, "node_modules/typescript/bin/tsc"),
      "-p",
      path.join(temp, "tsconfig.json"),
    ],
    { cwd: temp, stdio: "inherit" },
  );
  if (types.status !== 0)
    throw new Error("Packed TypeScript declarations failed.");

  console.log(
    "Packed package passed ESM, CommonJS, TypeScript, explicit exports, encapsulation, and escaping checks.",
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
