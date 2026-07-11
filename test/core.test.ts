import { describe, expect, it } from "vitest";
import {
  YuirinxError,
  createHighlighter,
  escapeHtml,
  themeToCss,
  type Grammar,
} from "../src/core/index.js";
import { javascript } from "../src/languages/javascript.js";
import { yuirinxNoir } from "../src/themes/yuirinx-noir.js";

const sample = `const message = \`Hello, \${user.name}!\`\nconsole.log(message)`;

describe("core highlighter", () => {
  it("tokenizes JavaScript while preserving every source character", () => {
    const yuirinx = createHighlighter({ languages: [javascript] });
    const tokens = yuirinx.tokenize(sample, "js");

    expect(tokens.map((token) => token.value).join("")).toBe(sample);
    expect(tokens.some((token) => token.type === "keyword")).toBe(true);
    expect(tokens.some((token) => token.type === "string.interpolation")).toBe(
      true,
    );
    expect(tokens.some((token) => token.type === "function.call")).toBe(true);
  });

  it("uses plaintext for unknown language ids", () => {
    const yuirinx = createHighlighter();
    const source = "<not-a-language>&\"'";
    const tokens = yuirinx.tokenize(source, "unknown-language");

    expect(tokens).toEqual([
      { type: "plain", value: source, start: 0, end: source.length },
    ]);
    expect(yuirinx.highlight(source, { lang: "unknown-language" })).toContain(
      "&lt;not-a-language&gt;&amp;&quot;&#39;",
    );
  });

  it("renders deterministic theme-aware colors for unavailable languages", () => {
    const yuirinx = createHighlighter({ themes: [yuirinxNoir] });
    const source = "<first>\r\nsecond line\n😀 final";
    const options = {
      lang: "future-language",
      theme: "yuirinx-noir",
      fallback: "color-lines" as const,
    };

    const first = yuirinx.highlight(source, options);
    const second = yuirinx.highlight(source, options);

    expect(first).toBe(second);
    expect(first).toContain("yuirinx-fallback-lines");
    expect(first.match(/class=\"yuirinx-line\"/g)).toHaveLength(3);
    expect(first).toContain("&lt;first&gt;</span>\r\n");
    expect(first).toContain("😀 final");
    expect(first).not.toContain("<first>");
  });

  it("keeps plaintext as the default and for explicit plaintext ids", () => {
    const yuirinx = createHighlighter({
      themes: [yuirinxNoir],
      defaultFallback: "color-lines",
    });

    const unknown = yuirinx.highlight("one\ntwo", {
      lang: "missing",
      theme: "yuirinx-noir",
    });
    const plaintext = yuirinx.highlight("one\ntwo", {
      lang: "plaintext",
      theme: "yuirinx-noir",
      fallback: "color-lines",
    });

    expect(unknown).toContain("yuirinx-fallback-lines");
    expect(plaintext).not.toContain("yuirinx-fallback-lines");
    expect(plaintext).not.toContain('class="yuirinx-line"');
  });

  it("supports color-line fallback in class mode", () => {
    const yuirinx = createHighlighter({ themes: [yuirinxNoir] });
    const html = yuirinx.highlight("alpha\nbeta", {
      lang: "custom-dsl",
      theme: "yuirinx-noir",
      fallback: "color-lines",
      mode: "classes",
    });
    const css = themeToCss(yuirinxNoir);

    expect(html).toMatch(/tok-fallback-line-\d/);
    expect(css).toContain(".tok-fallback-line-0{color:#73d7e7}");
  });

  it("renders premium inline and class modes", () => {
    const yuirinx = createHighlighter({
      languages: [javascript],
      themes: [yuirinxNoir],
    });
    const inline = yuirinx.highlight("const x = 1", {
      lang: "javascript",
      theme: "yuirinx-noir",
    });
    const classes = yuirinx.highlight("const x = 1", {
      lang: "javascript",
      theme: "yuirinx-noir",
      mode: "classes",
    });

    expect(inline).toContain("background-color:#0a0d14");
    expect(inline).toContain("color:#f07f9f");
    expect(classes).toContain("tok-keyword");
    expect(classes).toContain("yuirinx-theme-noir");
  });

  it("emits parent and specific classes for hierarchical token types", () => {
    const yuirinx = createHighlighter({
      languages: [javascript],
      themes: [yuirinxNoir],
    });
    const html = yuirinx.highlight("console.log(value)", {
      lang: "javascript",
      theme: "yuirinx-noir",
      mode: "classes",
    });

    expect(html).toContain('class="tok-function tok-function-call"');
  });

  it("exposes plaintext as an always-available built-in language", () => {
    const yuirinx = createHighlighter();

    expect(yuirinx.hasLanguage("plaintext")).toBe(true);
    expect(yuirinx.hasLanguage("txt")).toBe(true);
    expect(yuirinx.getLanguage("plain")?.id).toBe("plaintext");
    expect(yuirinx.listLanguages()).toContain("plaintext");
  });

  it("allows highlight without an options object", () => {
    const yuirinx = createHighlighter();
    expect(yuirinx.highlight("<safe>")).toContain("&lt;safe&gt;");
  });

  it("rejects invalid state-depth options", () => {
    expect(() => createHighlighter({ maxStateDepth: Number.NaN })).toThrowError(
      expect.objectContaining({ code: "YUIRINX_INVALID_OPTION" }),
    );
    expect(() => createHighlighter({ maxStateDepth: 1 })).toThrowError(
      expect.objectContaining({ code: "YUIRINX_INVALID_OPTION" }),
    );
  });

  it("supports custom push/pop grammars and unterminated states", () => {
    const grammar: Grammar = {
      id: "mini-state",
      states: {
        root: {
          rules: [
            { type: "string", pattern: /"/, push: "string" },
            { type: "number", pattern: /\d+/ },
            { type: "plain", pattern: /[^"\d]+/ },
          ],
        },
        string: {
          fallbackType: "string",
          rules: [
            { type: "string", pattern: /"/, pop: true },
            { type: "string.escape", pattern: /\\./ },
            { type: "string", pattern: /[^"\\]+/ },
            { type: "string", pattern: /\\/ },
          ],
        },
      },
    };
    const yuirinx = createHighlighter({ languages: [grammar] });

    expect(
      yuirinx
        .tokenize('1 "two" 3', "mini-state")
        .map((token) => token.value)
        .join(""),
    ).toBe('1 "two" 3');
    const unterminated = yuirinx.tokenize('\"unterminated', "mini-state");
    expect(unterminated[unterminated.length - 1]?.type).toBe("string");
  });

  it("rejects empty patterns and state-depth abuse", () => {
    const empty: Grammar = {
      id: "empty",
      states: { root: { rules: [{ type: "plain", pattern: /(?:)/ }] } },
    };
    expect(() => createHighlighter({ languages: [empty] })).toThrowError(
      YuirinxError,
    );

    const nested: Grammar = {
      id: "nested",
      states: {
        root: {
          rules: [
            { type: "punctuation", pattern: /{/, push: "root" },
            { type: "punctuation", pattern: /}/, pop: true },
          ],
        },
      },
    };
    const yuirinx = createHighlighter({
      languages: [nested],
      maxStateDepth: 3,
    });
    expect(() => yuirinx.tokenize("{{{", "nested")).toThrowError(
      expect.objectContaining({ code: "YUIRINX_STATE_DEPTH_EXCEEDED" }),
    );
  });

  it("detects include cycles and duplicate ids", () => {
    const cycle: Grammar = {
      id: "cycle",
      states: {
        root: { rules: [{ include: "other" }] },
        other: { rules: [{ include: "root" }] },
      },
    };
    expect(() => createHighlighter({ languages: [cycle] })).toThrowError(
      expect.objectContaining({ code: "YUIRINX_INCLUDE_CYCLE" }),
    );

    const yuirinx = createHighlighter({ languages: [javascript] });
    expect(() => yuirinx.registerLanguage(javascript)).toThrowError(
      expect.objectContaining({ code: "YUIRINX_DUPLICATE_LANGUAGE" }),
    );
  });

  it("generates standalone class CSS with hierarchical theme styles", () => {
    const css = themeToCss(yuirinxNoir, { selector: ".docs-code" });
    expect(css).toContain(".docs-code{color:#d7deea;background-color:#0a0d14}");
    expect(css).toContain(
      ".docs-code .tok-keyword{color:#f07f9f;font-weight:600}",
    );
  });

  it("escapes HTML directly", () => {
    expect(escapeHtml("&<>\"'")).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});
