import { describe, expect, it } from "vitest";
import { createHighlighter, type Grammar } from "../src/core/index.js";
import { html } from "../src/languages/html.js";
import { yuirinxAurora } from "../src/themes/yuirinx-aurora.js";

const attacks = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert(1)>",
  '\"><svg onload=alert(1)>',
  "&<>\"'",
];

describe("HTML output safety", () => {
  it.each(attacks)("escapes source input: %s", (attack) => {
    const yuirinx = createHighlighter({
      languages: [html],
      themes: [yuirinxAurora],
    });
    const output = yuirinx.highlight(attack, {
      lang: "html",
      theme: "yuirinx-aurora",
    });

    expect(output).not.toContain("<script>");
    expect(output).not.toContain("<img");
    expect(output).not.toContain("<svg");
    expect(output).not.toContain("onerror=");
    expect(output).not.toContain("onload=");
  });

  it("rejects unsafe colors in unknown-language fallback palettes", () => {
    const unsafeTheme = {
      id: "unsafe-theme",
      name: "Unsafe Theme",
      type: "dark" as const,
      foreground: "#ffffff",
      background: "#000000",
      fallbackPalette: [
        'red;background-image:url("javascript:alert(1)")',
        "#70d5e7",
      ],
      tokens: {},
    };
    const yuirinx = createHighlighter({ themes: [unsafeTheme] });
    const output = yuirinx.highlight("<script>alert(1)</script>", {
      lang: "missing-language",
      theme: "unsafe-theme",
      fallback: "color-lines",
    });

    expect(output).not.toContain("background-image");
    expect(output).not.toContain("javascript:");
    expect(output).not.toContain("<script>");
    expect(output).toContain("&lt;script&gt;");
  });

  it("sanitizes token types, language ids, and custom classes", () => {
    const hostile: Grammar = {
      id: 'hostile\"><img',
      states: {
        root: {
          rules: [{ type: '\"><script>alert(1)</script>', pattern: /[\s\S]+/ }],
        },
      },
    };
    const yuirinx = createHighlighter({ languages: [hostile] });
    const output = yuirinx.highlight("safe", {
      lang: hostile,
      mode: "classes",
      preClass: '\"><svg onload=alert(1)> premium',
      codeClass: '\"><img src=x>',
      classPrefix: '\"><bad-',
    });

    expect(output).not.toContain("<script>");
    expect(output).not.toContain("<svg");
    expect(output).not.toContain("<img");
    expect(output).toContain("safe");
  });
});
