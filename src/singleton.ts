import { createHighlighter } from "./core/create-highlighter.js";
import type {
  Grammar,
  HighlightOptions,
  RenderOptions,
  Theme,
  Token,
} from "./core/types.js";

const defaultHighlighter = createHighlighter();

/** Highlights code through Yuirinx's convenience singleton registry. */
export function highlight(code: string, options: HighlightOptions): string {
  return defaultHighlighter.highlight(code, options);
}

/** Tokenizes code through Yuirinx's convenience singleton registry. */
export function tokenize(code: string, language: string | Grammar): Token[] {
  return defaultHighlighter.tokenize(code, language);
}

/** Renders tokens through Yuirinx's convenience singleton registry. */
export function render(
  tokens: readonly Token[],
  options?: RenderOptions,
): string {
  return defaultHighlighter.render(tokens, options);
}

/** Registers a language in the convenience singleton registry. */
export function registerLanguage(grammar: Grammar): void {
  defaultHighlighter.registerLanguage(grammar);
}

/** Registers a theme in the convenience singleton registry. */
export function registerTheme(theme: Theme): void {
  defaultHighlighter.registerTheme(theme);
}
