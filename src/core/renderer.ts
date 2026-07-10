import { escapeHtml } from "./escape.js";
import { normalizeId } from "./grammar.js";
import type {
  RenderOptions,
  Theme,
  ThemeCssOptions,
  Token,
  TokenStyle,
} from "./types.js";

const SAFE_COLOR = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\([\d.%+\-,\s]+\)|[a-z]+)$/i;

function sanitizeColor(value: string | undefined): string | undefined {
  return value && SAFE_COLOR.test(value.trim()) ? value.trim() : undefined;
}

function sanitizeClassPart(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeClassList(value: string | undefined): string[] {
  if (!value) return [];
  return value.split(/\s+/).map(sanitizeClassPart).filter(Boolean);
}

function safeClassPrefix(prefix: string): string {
  return prefix.replace(/[^a-zA-Z0-9_-]+/g, "") || "tok-";
}

function classForToken(type: string, prefix: string): string {
  const safeType = sanitizeClassPart(type.replace(/\./g, "-")) || "plain";
  return `${safeClassPrefix(prefix)}${safeType}`;
}

function classForFallbackLine(index: number, prefix: string): string {
  return `${safeClassPrefix(prefix)}fallback-line-${index}`;
}

function styleToDeclarations(style: TokenStyle | undefined): string {
  if (!style) return "";
  const declarations: string[] = [];
  const color = sanitizeColor(style.color);
  const background = sanitizeColor(style.backgroundColor);
  if (color) declarations.push(`color:${color}`);
  if (background) declarations.push(`background-color:${background}`);
  if (style.fontStyle) declarations.push(`font-style:${style.fontStyle}`);
  if (style.fontWeight) {
    const weight = {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    }[style.fontWeight];
    declarations.push(`font-weight:${weight}`);
  }
  if (style.textDecoration)
    declarations.push(`text-decoration:${style.textDecoration}`);
  return declarations.join(";");
}

function resolveFallbackPalette(theme: Theme | undefined): readonly string[] {
  if (!theme) return [];

  const explicit = (theme.fallbackPalette ?? [])
    .map((color) => sanitizeColor(color))
    .filter((color): color is string => Boolean(color));
  if (explicit.length > 0) return [...new Set(explicit)];

  const inferred = Object.values(theme.tokens)
    .map((style) => sanitizeColor(style.color))
    .filter((color): color is string => Boolean(color));
  const colors = [...new Set(inferred)].slice(0, 8);
  if (colors.length > 0) return colors;

  const foreground = sanitizeColor(theme.foreground);
  return foreground ? [foreground] : [];
}

function hashSource(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function renderFallbackLine(
  value: string,
  lineIndex: number,
  seed: number,
  palette: readonly string[],
  mode: RenderOptions["mode"],
  prefix: string,
): string {
  const paletteIndex = (seed + lineIndex) % palette.length;
  const escaped = escapeHtml(value);

  if (mode === "classes") {
    const classes = [
      "yuirinx-line",
      classForFallbackLine(paletteIndex, prefix),
    ];
    return `<span class="${escapeHtml(classes.join(" "))}">${escaped}</span>`;
  }

  const color = palette[paletteIndex] ?? "";
  const declarations = styleToDeclarations({ color });
  return `<span class="yuirinx-line" style="${escapeHtml(declarations)}">${escaped}</span>`;
}

function renderFallbackBody(
  code: string,
  options: RenderOptions,
  theme: Theme | undefined,
): string {
  if (!code) return "";

  const palette = resolveFallbackPalette(theme);
  if (palette.length === 0) return escapeHtml(code);

  const mode = options.mode ?? "inline";
  const prefix = options.classPrefix ?? "tok-";
  const seed = hashSource(code) % palette.length;
  const newline = /\r\n|\r|\n/g;
  let lineStart = 0;
  let lineIndex = 0;
  let body = "";
  let match: RegExpExecArray | null;

  while ((match = newline.exec(code)) !== null) {
    body += renderFallbackLine(
      code.slice(lineStart, match.index),
      lineIndex,
      seed,
      palette,
      mode,
      prefix,
    );
    body += escapeHtml(match[0]);
    lineStart = newline.lastIndex;
    lineIndex += 1;
  }

  if (lineStart < code.length) {
    body += renderFallbackLine(
      code.slice(lineStart),
      lineIndex,
      seed,
      palette,
      mode,
      prefix,
    );
  }

  return body;
}

function wrapBody(
  body: string,
  options: RenderOptions,
  theme: Theme | undefined,
  fallbackLines: boolean,
): string {
  if (options.wrap === false) return body;

  const mode = options.mode ?? "inline";
  const normalizedThemeId = theme
    ? sanitizeClassPart(normalizeId(theme.id))
    : "";
  const themeId = normalizedThemeId.startsWith("yuirinx-")
    ? normalizedThemeId.slice("yuirinx-".length)
    : normalizedThemeId;
  const preClasses = [
    "yuirinx",
    themeId ? `yuirinx-theme-${themeId}` : "",
    fallbackLines ? "yuirinx-fallback-lines" : "",
    ...sanitizeClassList(options.preClass),
  ].filter(Boolean);
  const language =
    sanitizeClassPart(normalizeId(options.language ?? "plaintext")) ||
    "plaintext";
  const codeClasses = [
    `language-${language}`,
    ...sanitizeClassList(options.codeClass),
  ];
  const containerStyle =
    mode === "inline" && theme
      ? styleToDeclarations({
          color: theme.foreground,
          backgroundColor: theme.background,
        })
      : "";

  return `<pre class="${escapeHtml(preClasses.join(" "))}"${
    containerStyle ? ` style="${escapeHtml(containerStyle)}"` : ""
  }><code class="${escapeHtml(codeClasses.join(" "))}">${body}</code></pre>`;
}

export function resolveTokenStyle(
  theme: Theme | undefined,
  type: string,
): TokenStyle | undefined {
  if (!theme) return undefined;
  let current = type;
  while (current) {
    const style = theme.tokens[current];
    if (style) return style;
    const separator = current.lastIndexOf(".");
    if (separator < 0) break;
    current = current.slice(0, separator);
  }
  return undefined;
}

export function renderTokens(
  tokens: readonly Token[],
  options: RenderOptions,
  theme: Theme | undefined,
): string {
  const mode = options.mode ?? "inline";
  const prefix = options.classPrefix ?? "tok-";
  const body = tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);
      if (token.type === "plain") return escaped;
      if (mode === "classes") {
        return `<span class="${escapeHtml(classForToken(token.type, prefix))}">${escaped}</span>`;
      }
      const declarations = styleToDeclarations(
        resolveTokenStyle(theme, token.type),
      );
      return declarations
        ? `<span style="${escapeHtml(declarations)}">${escaped}</span>`
        : escaped;
    })
    .join("");

  return wrapBody(body, options, theme, false);
}

export function renderColorLines(
  code: string,
  options: RenderOptions,
  theme: Theme | undefined,
): string {
  const colored = code.length > 0 && resolveFallbackPalette(theme).length > 0;
  const body = renderFallbackBody(code, options, theme);
  return wrapBody(body, options, theme, colored);
}

/** Converts a theme object into CSS for class-based rendering. */
export function themeToCss(
  theme: Theme,
  options: ThemeCssOptions = {},
): string {
  const prefix = options.classPrefix ?? "tok-";
  const normalizedThemeId = sanitizeClassPart(normalizeId(theme.id));
  const themeId = normalizedThemeId.startsWith("yuirinx-")
    ? normalizedThemeId.slice("yuirinx-".length)
    : normalizedThemeId;
  const rawSelector =
    options.selector ?? `.yuirinx-theme-${themeId || "default"}`;
  const selector = rawSelector.replace(/[{}<>]/g, "").trim() || ".yuirinx";
  const lines: string[] = [];

  if (options.includeContainer !== false) {
    const foreground = sanitizeColor(theme.foreground);
    const background = sanitizeColor(theme.background);
    const declarations = [
      foreground ? `color:${foreground}` : "",
      background ? `background-color:${background}` : "",
    ].filter(Boolean);
    lines.push(`${selector}{${declarations.join(";")}}`);
  }

  for (const [type, style] of Object.entries(theme.tokens)) {
    const declarations = styleToDeclarations(style);
    if (declarations)
      lines.push(
        `${selector} .${classForToken(type, prefix)}{${declarations}}`,
      );
  }

  for (const [index, color] of resolveFallbackPalette(theme).entries()) {
    lines.push(
      `${selector} .${classForFallbackLine(index, prefix)}{color:${color}}`,
    );
  }

  return lines.join("\n");
}
