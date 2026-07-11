import { describe, expect, it } from "vitest";
import { createHighlighter, type Grammar } from "../src/core/index.js";
import { bash } from "../src/languages/bash.js";
import { c } from "../src/languages/c.js";
import { cpp } from "../src/languages/cpp.js";
import { csharp } from "../src/languages/csharp.js";
import { css } from "../src/languages/css.js";
import { dart } from "../src/languages/dart.js";
import { dockerfile } from "../src/languages/dockerfile.js";
import { go } from "../src/languages/go.js";
import { graphql } from "../src/languages/graphql.js";
import { html } from "../src/languages/html.js";
import { ini } from "../src/languages/ini.js";
import { java } from "../src/languages/java.js";
import { javascript } from "../src/languages/javascript.js";
import { json } from "../src/languages/json.js";
import { jsx } from "../src/languages/jsx.js";
import { kotlin } from "../src/languages/kotlin.js";
import { markdown } from "../src/languages/markdown.js";
import { nginx } from "../src/languages/nginx.js";
import { php } from "../src/languages/php.js";
import { plaintext } from "../src/languages/plaintext.js";
import { python } from "../src/languages/python.js";
import { ruby } from "../src/languages/ruby.js";
import { rust } from "../src/languages/rust.js";
import { scss } from "../src/languages/scss.js";
import { sql } from "../src/languages/sql.js";
import { svelte } from "../src/languages/svelte.js";
import { swift } from "../src/languages/swift.js";
import { toml } from "../src/languages/toml.js";
import { tsx } from "../src/languages/tsx.js";
import { typescript } from "../src/languages/typescript.js";
import { vue } from "../src/languages/vue.js";
import { xml } from "../src/languages/xml.js";
import { yaml } from "../src/languages/yaml.js";

const fixtures: readonly [Grammar, string][] = [
  [plaintext, "plain 😀 text"],
  [javascript, "export const answer = /ok/i.test(`value ${42}`)"],
  [typescript, "interface User { readonly id: number }"],
  [jsx, 'const view = <Button title="Save">{label}</Button>'],
  [tsx, "const view: JSX.Element = <Box value={count} />"],
  [json, '{"name":"Yuirinx","safe":"<tag>","active":true}'],
  [html, '<article class="card"><h1>Yuirinx</h1></article>'],
  [xml, '<?xml version="1.0"?><note id="1">Hello</note>'],
  [css, ".card:hover { color: #73d7e7; padding: 1rem; }"],
  [scss, "$accent: #fff; .card { &:hover { color: $accent; } }"],
  [bash, '#!/usr/bin/env bash\nfor file in *.ts; do echo "$file"; done'],
  [python, '@cache\ndef greet(name: str):\n    return f"Hello {name}"'],
  [php, "<?php final class User { public function id(): int { return 1; } }"],
  [
    markdown,
    "# Yuirinx\n\n**Small**, `safe`, and [modern](https://example.com).",
  ],
  [sql, "SELECT id, name FROM users WHERE active = true ORDER BY name;"],
  [yaml, "service:\n  enabled: true\n  ports:\n    - 8080"],
  [java, '@Override public String toString() { return "Yuirinx"; }'],
  [c, "#include <stdio.h>\nint main(void) { return 0; }"],
  [cpp, "template <typename T> std::vector<T> values;"],
  [csharp, "public record User(int Id, string Name);"],
  [go, 'func main() { fmt.Println("Yuirinx") }'],
  [rust, "pub fn main() -> Result<(), Error> { Ok(()) }"],
  [
    ruby,
    'class Yuirinx\n  def call(name)\n    puts "Hello #{name}"\n  end\nend',
  ],
  [kotlin, "data class User(val id: Int, val name: String)"],
  [swift, "struct User: Codable { let id: Int }"],
  [dart, "final users = <User>[];"],
  [vue, '<template><button :disabled="busy">Save</button></template>'],
  [svelte, "<script>let count = 0;</script><button>{count}</button>"],
  [dockerfile, "FROM node:22-alpine\nWORKDIR /app\nRUN npm ci"],
  [toml, '[package]\nname = "yuirinx"\nversion = "0.1.0"'],
  [ini, "[server]\nport=8080\nenabled=true"],
  [nginx, "server { listen 80; location / { try_files $uri /index.html; } }"],
  [graphql, "query User($id: ID!) { user(id: $id) { id name } }"],
];

describe("shipped languages", () => {
  it.each(fixtures)("preserves source for $0.id", (grammar, source) => {
    const yuirinx = createHighlighter({ languages: [grammar] });
    const tokens = yuirinx.tokenize(source, grammar.id);

    expect(tokens.map((token) => token.value).join("")).toBe(source);
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("distinguishes JavaScript division from regex literals", () => {
    const yuirinx = createHighlighter({ languages: [javascript] });
    const tokens = yuirinx.tokenize(
      "const ratio=a/b/c; const valid=/yes/i;",
      "javascript",
    );

    expect(
      tokens
        .filter((token) => token.type === "regex")
        .map((token) => token.value),
    ).toEqual(["/yes/i"]);
    expect(
      tokens.filter(
        (token) => token.type === "operator" && token.value === "/",
      ),
    ).toHaveLength(2);
  });

  it("classifies JSX tag names, attributes, and children separately", () => {
    const yuirinx = createHighlighter({ languages: [jsx] });
    const tokens = yuirinx.tokenize(
      'const view=<Button title="Save">hello</Button>;',
      "jsx",
    );

    expect(
      tokens.some((token) => token.type === "tag" && token.value === "Button"),
    ).toBe(true);
    expect(
      tokens.some(
        (token) => token.type === "attribute" && token.value === "title",
      ),
    ).toBe(true);
    expect(
      tokens.some(
        (token) => token.type === "attribute.value" && token.value === '"Save"',
      ),
    ).toBe(true);
    expect(
      tokens.some(
        (token) => token.type === "plain" && token.value.includes("hello"),
      ),
    ).toBe(true);
  });

  it("keeps common TSX generic arrows out of JSX tag states", () => {
    const yuirinx = createHighlighter({ languages: [tsx] });
    const tokens = yuirinx.tokenize(
      "const identity = <T>(value: T): T => value;",
      "tsx",
    );

    expect(tokens.some((token) => token.type === "tag")).toBe(false);
  });

  it("restricts Markdown block syntax to line starts", () => {
    const yuirinx = createHighlighter({ languages: [markdown] });
    const tokens = yuirinx.tokenize(
      "text # not heading\n# Real heading\nfoo - not list\n- item",
      "markdown",
    );

    expect(
      tokens
        .filter((token) => token.type === "heading")
        .map((token) => token.value),
    ).toEqual(["# Real heading"]);
    expect(
      tokens
        .filter((token) => token.type === "list")
        .map((token) => token.value),
    ).toEqual(["- "]);
  });

  it("classifies CSS percentages as units", () => {
    const yuirinx = createHighlighter({ languages: [css] });
    const tokens = yuirinx.tokenize(".meter { width: 50%; }", "css");

    expect(
      tokens.some((token) => token.type === "unit" && token.value === "%"),
    ).toBe(true);
  });

  it("registers all canonical grammars without alias conflicts", () => {
    const grammars = fixtures.map(([grammar]) => grammar);
    const yuirinx = createHighlighter({ languages: grammars });

    expect(yuirinx.listLanguages()).toHaveLength(grammars.length);
    expect(yuirinx.hasLanguage("ts")).toBe(true);
    expect(yuirinx.hasLanguage("c++")).toBe(true);
    expect(yuirinx.hasLanguage("yml")).toBe(true);
    expect(yuirinx.hasLanguage("docker")).toBe(true);
  });

  it("handles empty, whitespace, unicode, CRLF, and unterminated input", () => {
    const yuirinx = createHighlighter({
      languages: [javascript, html, python],
    });
    for (const source of [
      "",
      "   \t\r\n",
      'const emoji = "✨🖋️"\r\n',
      '<div class="open',
      '"""open',
    ]) {
      const grammar = source.startsWith("<")
        ? "html"
        : source.startsWith('"')
          ? "python"
          : "javascript";
      expect(
        yuirinx
          .tokenize(source, grammar)
          .map((token) => token.value)
          .join(""),
      ).toBe(source);
    }
  });
});
