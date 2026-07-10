import { compileGrammar, normalizeId } from "./grammar.js";
import { YuirinxError } from "./errors.js";
import { renderColorLines, renderTokens } from "./renderer.js";
import { tokenizeCompiled } from "./tokenizer.js";
import type { CompiledGrammar } from "./grammar.js";
import type {
  Grammar,
  Highlighter,
  HighlighterOptions,
  HighlightOptions,
  RenderOptions,
  Theme,
  Token,
} from "./types.js";

const plaintextGrammar: Grammar = {
  id: "plaintext",
  aliases: ["text", "txt", "plain"],
  states: {
    root: {
      rules: [{ type: "plain", pattern: /[\s\S]+/ }],
    },
  },
};

function themeId(theme: Theme): string {
  return normalizeId(theme.id);
}

/** Creates an isolated Yuirinx highlighter with its own registries. */
export function createHighlighter(
  options: HighlighterOptions = {},
): Highlighter {
  const grammars = new Map<string, CompiledGrammar>();
  const canonicalIds = new Set<string>();
  const themes = new Map<string, Theme>();
  const maxStateDepth = Math.max(2, options.maxStateDepth ?? 64);
  const compiledPlaintext = compileGrammar(plaintextGrammar);
  const plaintextIds = new Set([
    normalizeId(plaintextGrammar.id),
    ...(plaintextGrammar.aliases ?? []).map(normalizeId),
  ]);

  const registerLanguage = (grammar: Grammar): void => {
    const compiled = compileGrammar(grammar);
    const id = compiled.id;
    if (grammars.has(id)) {
      throw new YuirinxError(
        "YUIRINX_DUPLICATE_LANGUAGE",
        `Language "${id}" is already registered.`,
      );
    }

    const aliases = (grammar.aliases ?? []).map(normalizeId).filter(Boolean);
    for (const alias of aliases) {
      if (alias === id || grammars.has(alias)) {
        throw new YuirinxError(
          "YUIRINX_DUPLICATE_ALIAS",
          `Alias "${alias}" for language "${id}" is already registered.`,
        );
      }
    }

    grammars.set(id, compiled);
    canonicalIds.add(id);
    for (const alias of aliases) grammars.set(alias, compiled);
  };

  const registerTheme = (theme: Theme): void => {
    const id = themeId(theme);
    if (!id)
      throw new YuirinxError(
        "YUIRINX_DUPLICATE_THEME",
        "A theme must have a non-empty id.",
      );
    if (themes.has(id)) {
      throw new YuirinxError(
        "YUIRINX_DUPLICATE_THEME",
        `Theme "${id}" is already registered.`,
      );
    }
    themes.set(id, theme);
  };

  for (const grammar of options.languages ?? []) registerLanguage(grammar);
  for (const theme of options.themes ?? []) registerTheme(theme);

  const resolveGrammar = (
    language: string | Grammar,
  ): { readonly grammar: CompiledGrammar; readonly unavailable: boolean } => {
    if (typeof language !== "string") {
      return { grammar: compileGrammar(language), unavailable: false };
    }

    const id = normalizeId(language);
    const registered = grammars.get(id);
    if (registered) return { grammar: registered, unavailable: false };
    return {
      grammar: compiledPlaintext,
      unavailable: !plaintextIds.has(id),
    };
  };

  const resolveTheme = (
    theme: string | Theme | undefined,
  ): Theme | undefined => {
    if (!theme)
      return options.defaultTheme
        ? themes.get(normalizeId(options.defaultTheme))
        : undefined;
    return typeof theme === "string" ? themes.get(normalizeId(theme)) : theme;
  };

  const tokenize = (code: string, language: string | Grammar): Token[] =>
    tokenizeCompiled(code, resolveGrammar(language).grammar, maxStateDepth);

  const render = (
    tokens: readonly Token[],
    renderOptions: RenderOptions = {},
  ): string =>
    renderTokens(tokens, renderOptions, resolveTheme(renderOptions.theme));

  const highlight = (
    code: string,
    highlightOptions: HighlightOptions,
  ): string => {
    const language =
      highlightOptions.lang ?? options.defaultLanguage ?? "plaintext";
    const resolved = resolveGrammar(language);
    const theme = resolveTheme(highlightOptions.theme);
    const renderOptions = {
      ...highlightOptions,
      language: typeof language === "string" ? language : language.id,
    };
    const fallback =
      highlightOptions.fallback ?? options.defaultFallback ?? "plaintext";

    if (resolved.unavailable && fallback === "color-lines") {
      return renderColorLines(code, renderOptions, theme);
    }

    const tokens = tokenizeCompiled(code, resolved.grammar, maxStateDepth);
    return renderTokens(tokens, renderOptions, theme);
  };

  return {
    highlight,
    tokenize,
    render,
    registerLanguage,
    registerTheme,
    hasLanguage: (language) => grammars.has(normalizeId(language)),
    hasTheme: (theme) => themes.has(normalizeId(theme)),
    getLanguage: (language) => grammars.get(normalizeId(language))?.source,
    getTheme: (theme) => themes.get(normalizeId(theme)),
    listLanguages: () => Object.freeze([...canonicalIds]),
    listThemes: () => Object.freeze([...themes.keys()]),
  };
}
