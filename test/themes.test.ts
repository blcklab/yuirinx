import { describe, expect, it } from "vitest";
import { yuirinxAurora } from "../src/themes/yuirinx-aurora.js";
import { yuirinxNoir } from "../src/themes/yuirinx-noir.js";
import { yuirinxPearl } from "../src/themes/yuirinx-pearl.js";

const themes = [yuirinxNoir, yuirinxPearl, yuirinxAurora];

describe("built-in themes", () => {
  it.each(themes)("has a complete identity for $name", (theme) => {
    expect(theme.id).toBeTruthy();
    expect(theme.name).toBeTruthy();
    expect(["light", "dark"]).toContain(theme.type);
    expect(theme.foreground).toMatch(/^#/);
    expect(theme.background).toMatch(/^#/);
    expect(Object.keys(theme.tokens).length).toBeGreaterThan(20);
    expect(theme.fallbackPalette?.length).toBeGreaterThanOrEqual(4);
    expect(
      theme.fallbackPalette?.every((color) => /^#[\da-f]{6}$/i.test(color)),
    ).toBe(true);
  });

  it("uses unique ids and backgrounds", () => {
    expect(new Set(themes.map((theme) => theme.id)).size).toBe(themes.length);
    expect(new Set(themes.map((theme) => theme.background)).size).toBe(
      themes.length,
    );
  });
});
