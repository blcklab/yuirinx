import { access, mkdtemp, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
await access(path.join(root, "dist/esm/index.js"));

const temp = await mkdtemp(path.join(os.tmpdir(), "yuirinx-tree-shaking-"));
try {
  const packed = spawnSync(
    "npm",
    ["pack", "--json", "--pack-destination", temp],
    { cwd: root, encoding: "utf8" },
  );
  if (packed.status !== 0) throw new Error(packed.stderr || "npm pack failed");

  const packResult = JSON.parse(packed.stdout);
  const filename = packResult[0]?.filename;
  if (!filename) throw new Error("npm pack returned no tarball filename.");

  const init = spawnSync("npm", ["init", "-y"], {
    cwd: temp,
    stdio: "ignore",
  });
  if (init.status !== 0) throw new Error("Could not create consumer fixture.");

  const install = spawnSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      path.join(temp, filename),
    ],
    { cwd: temp, stdio: "ignore" },
  );
  if (install.status !== 0)
    throw new Error("Could not install packed package.");

  const result = await build({
    stdin: {
      contents: `
        import { createHighlighter } from '@blcklab/yuirinx'
        import { json } from '@blcklab/yuirinx/lang/json'
        export const yuirinx = createHighlighter({ languages: [json] })
      `,
      resolveDir: temp,
      sourcefile: "consumer-entry.js",
      loader: "js",
    },
    absWorkingDir: temp,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    minify: true,
    metafile: true,
    write: false,
  });

  const inputs = Object.keys(result.metafile.inputs).map((value) =>
    value.replaceAll("\\", "/"),
  );
  const forbidden = [
    "/languages/javascript.js",
    "/languages/typescript.js",
    "/languages/html.js",
    "/languages/css.js",
    "/languages/python.js",
    "/languages/php.js",
    "/languages/markdown.js",
    "/themes/yuirinx-noir.js",
  ];
  const found = forbidden.filter((needle) =>
    inputs.some((input) => input.endsWith(needle)),
  );
  if (found.length > 0) {
    throw new Error(`Unrelated modules were bundled: ${found.join(", ")}`);
  }
  if (!inputs.some((input) => input.endsWith("/languages/json.js"))) {
    throw new Error("The JSON language entry was not included in the bundle.");
  }

  console.log(
    `Tree-shaking passed through packed public imports: ${inputs.length} package modules in core + JSON bundle.`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
