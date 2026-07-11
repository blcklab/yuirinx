/** A registered language identifier or alias. */
export type LanguageId = string;

/** A registered theme identifier. */
export type ThemeId = string;

/** A semantic token classification such as `keyword` or `string.escape`. */
export type TokenType = string;

/** A named lexical state inside a grammar. */
export type StateName = string;

/** A source token. Offsets use JavaScript UTF-16 string indices. */
export interface Token {
  readonly type: TokenType;
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

/** One active lexical state exposed to rule resolver callbacks. */
export interface TokenizerState {
  readonly name: StateName;
  readonly language: LanguageId;
}

/** Read-only context passed to dynamic grammar rule resolvers. */
export interface TokenizerContext {
  readonly source: string;
  readonly language: LanguageId;
  readonly state: StateName;
  readonly stack: readonly TokenizerState[];
  readonly offset: number;
}

/** Optional condition evaluated after a rule matches at the current offset. */
export type MatchPredicate = (
  match: RegExpExecArray,
  context: TokenizerContext,
) => boolean;

/** Static token type or a resolver based on the current regex match. */
export type TokenTypeResolver =
  | TokenType
  | ((match: RegExpExecArray, context: TokenizerContext) => TokenType);

/** Static state name or a resolver based on the current regex match. */
export type StateResolver =
  | StateName
  | ((match: RegExpExecArray, context: TokenizerContext) => StateName);

/** A matching grammar rule. Patterns are automatically made sticky. */
export interface MatchRule {
  readonly pattern: RegExp;
  readonly when?: MatchPredicate;
  readonly type?: TokenTypeResolver;
  readonly push?: StateResolver;
  readonly next?: StateResolver;
  readonly pop?: boolean | number;
}

/** Includes another state’s rules at the current precedence position. */
export interface IncludeRule {
  readonly include: StateName;
}

/** One ordered grammar rule. */
export type GrammarRule = MatchRule | IncludeRule;

/** A lexical state and its ordered rules. */
export interface GrammarState {
  readonly rules: readonly GrammarRule[];
  readonly fallbackType?: TokenType;
}

/** A complete language grammar. */
export interface Grammar {
  readonly id: LanguageId;
  readonly aliases?: readonly LanguageId[];
  readonly initialState?: StateName;
  readonly states: Readonly<Record<StateName, GrammarState>>;
}

/** Allowed visual style fields for a token. */
export interface TokenStyle {
  readonly color?: string;
  readonly backgroundColor?: string;
  readonly fontStyle?: "normal" | "italic";
  readonly fontWeight?: "normal" | "medium" | "semibold" | "bold";
  readonly textDecoration?: "none" | "underline" | "line-through";
}

/** A serializable syntax highlighting theme. */
export interface Theme {
  readonly id: ThemeId;
  readonly name: string;
  readonly type: "light" | "dark";
  readonly foreground: string;
  readonly background: string;
  readonly selection?: string;
  readonly lineHighlight?: string;
  /** Curated colors used by the optional deterministic line-color fallback. */
  readonly fallbackPalette?: readonly string[];
  readonly tokens: Readonly<Record<TokenType, TokenStyle>>;
}

/** HTML rendering strategy. */
export type RenderMode = "inline" | "classes";

/** Behavior used when a requested language is unavailable. */
export type FallbackMode = "plaintext" | "color-lines";

/** Options for highlighting source code. */
export interface HighlightOptions {
  readonly lang?: LanguageId | Grammar;
  readonly theme?: ThemeId | Theme;
  /** Unknown-language behavior. Defaults to `plaintext`. */
  readonly fallback?: FallbackMode;
  readonly mode?: RenderMode;
  readonly wrap?: boolean;
  readonly classPrefix?: string;
  readonly preClass?: string;
  readonly codeClass?: string;
}

/** Options for rendering an existing token array. */
export interface RenderOptions {
  readonly theme?: ThemeId | Theme;
  readonly mode?: RenderMode;
  readonly wrap?: boolean;
  readonly classPrefix?: string;
  readonly language?: LanguageId;
  readonly preClass?: string;
  readonly codeClass?: string;
}

/** Options for converting a theme object to CSS classes. */
export interface ThemeCssOptions {
  readonly selector?: string;
  readonly classPrefix?: string;
  readonly includeContainer?: boolean;
}

/** Initial configuration for an isolated highlighter. */
export interface HighlighterOptions {
  readonly languages?: readonly Grammar[];
  readonly themes?: readonly Theme[];
  readonly defaultLanguage?: LanguageId;
  readonly defaultTheme?: ThemeId;
  /** Default behavior for unavailable language IDs. */
  readonly defaultFallback?: FallbackMode;
  readonly maxStateDepth?: number;
}

/** Isolated registry, tokenizer, and renderer facade. */
export interface Highlighter {
  highlight(code: string, options?: HighlightOptions): string;
  tokenize(code: string, language: LanguageId | Grammar): Token[];
  render(tokens: readonly Token[], options?: RenderOptions): string;
  registerLanguage(grammar: Grammar): void;
  registerTheme(theme: Theme): void;
  hasLanguage(language: LanguageId): boolean;
  hasTheme(theme: ThemeId): boolean;
  getLanguage(language: LanguageId): Grammar | undefined;
  getTheme(theme: ThemeId): Theme | undefined;
  listLanguages(): readonly LanguageId[];
  listThemes(): readonly ThemeId[];
}
