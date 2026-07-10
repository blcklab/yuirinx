import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(
  fileURLToPath(new URL("../package.json", import.meta.url)),
);
const packagePath = path.join(root, "package.json");
const pkg = JSON.parse(await readFile(packagePath, "utf8"));
const exportsMap = pkg.exports ?? {};

const sourceNames = async (directory, excluded = new Set()) =>
  (await readdir(path.join(root, directory), { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".ts") &&
        !entry.name.endsWith(".d.ts") &&
        !excluded.has(entry.name),
    )
    .map((entry) => entry.name.slice(0, -3))
    .sort();

const languages = await sourceNames("src/languages");
const themes = await sourceNames("src/themes", new Set(["index.ts"]));

const dualExport = (directory, name = "index") => ({
  import: {
    types: `./dist/types/${directory}${name}.d.ts`,
    default: `./dist/esm/${directory}${name}.js`,
  },
  require: {
    types: `./dist/types/${directory}${name}.d.cts`,
    default: `./dist/cjs/${directory}${name}.cjs`,
  },
});

const expected = {
  ".": dualExport(""),
  "./core": dualExport("core/"),
  "./themes": dualExport("themes/"),
};

for (const language of languages) {
  expected[`./lang/${language}`] = dualExport("languages/", language);
}
for (const theme of themes) {
  expected[`./theme/${theme}`] = dualExport("themes/", theme);
}
expected["./package.json"] = "./package.json";

const failures = [];
for (const key of Object.keys(exportsMap)) {
  if (key.includes("*"))
    failures.push(`Wildcard export is not allowed: ${key}`);
  if (!(key in expected)) failures.push(`Unexpected public export: ${key}`);
}
for (const [key, value] of Object.entries(expected)) {
  if (!(key in exportsMap)) {
    failures.push(`Missing public export: ${key}`);
    continue;
  }
  if (JSON.stringify(exportsMap[key]) !== JSON.stringify(value)) {
    failures.push(`Incorrect export mapping: ${key}`);
  }
}

const collectTargets = (value) => {
  if (typeof value === "string")
    return value.startsWith("./dist/") ? [value] : [];
  return Object.values(value).flatMap(collectTargets);
};

for (const value of Object.values(expected)) {
  for (const target of collectTargets(value)) {
    try {
      await access(path.join(root, target));
    } catch {
      failures.push(`Export target does not exist: ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Export validation failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Explicit exports passed: ${languages.length} languages, ${themes.length} themes, and no wildcard paths.`,
);
