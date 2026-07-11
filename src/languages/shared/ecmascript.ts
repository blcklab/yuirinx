import type { Grammar, GrammarRule } from "../../core/types.js";
import {
  blockCommentRule,
  cLineCommentRule,
  doubleStringRule,
  numberRule,
  operatorRule,
  punctuationRule,
  singleStringRule,
  whitespaceRule,
  words,
} from "./helpers.js";

const JS_KEYWORDS = [
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "of",
  "return",
  "set",
  "static",
  "switch",
  "throw",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
] as const;

const TS_KEYWORDS = [
  "abstract",
  "any",
  "asserts",
  "bigint",
  "boolean",
  "declare",
  "enum",
  "implements",
  "infer",
  "interface",
  "is",
  "keyof",
  "module",
  "namespace",
  "never",
  "number",
  "object",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "require",
  "satisfies",
  "string",
  "symbol",
  "type",
  "undefined",
  "unique",
  "unknown",
  "using",
] as const;

const BUILTINS = [
  "Array",
  "BigInt",
  "Boolean",
  "Date",
  "Error",
  "JSON",
  "Map",
  "Math",
  "Number",
  "Object",
  "Promise",
  "Proxy",
  "Reflect",
  "RegExp",
  "Set",
  "String",
  "Symbol",
  "WeakMap",
  "WeakSet",
  "console",
  "document",
  "globalThis",
  "process",
  "window",
] as const;

function canStartRegex(source: string, offset: number): boolean {
  const before = source.slice(0, offset).trimEnd();
  if (!before) return true;

  const previous = before[before.length - 1] ?? "";
  if (/[([{,:;=!?&|+\-*%^~<>]/.test(previous)) return true;

  const word = /[A-Za-z_$][\w$]*$/.exec(before)?.[0];
  return Boolean(
    word &&
    /^(?:await|case|delete|do|else|in|instanceof|new|of|return|throw|typeof|void|yield)$/.test(
      word,
    ),
  );
}

interface EcmaOptions {
  readonly id: string;
  readonly aliases: readonly string[];
  readonly typescript?: boolean;
  readonly jsx?: boolean;
}

export function createEcmaGrammar(options: EcmaOptions): Grammar {
  const keywordValues = options.typescript
    ? [...JS_KEYWORDS, ...TS_KEYWORDS]
    : JS_KEYWORDS;
  const rootRules: GrammarRule[] = [
    cLineCommentRule,
    blockCommentRule,
    doubleStringRule,
    singleStringRule,
    { type: "string", pattern: /`/, push: "template" },
  ];

  if (options.jsx) {
    if (options.typescript) {
      rootRules.push({
        type: "operator",
        pattern: /<(?=[A-Za-z_$][\w$]*(?:\s+extends\s+[^>]+)?,?>\s*\()/,
      });
    }
    rootRules.push({
      type: "tag.punctuation",
      pattern: /<(?=[A-Za-z_$>])/,
      push: "jsxTagName",
    });
  }

  rootRules.push(
    {
      type: "regex",
      pattern:
        /\/(?![/*\s])(?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\r\n])+\/[dgimsuvy]*/,
      when: (_match, context) => canStartRegex(context.source, context.offset),
    },
    numberRule,
    { type: "boolean", pattern: /\b(?:true|false)\b/ },
    { type: "null", pattern: /\b(?:null|undefined)\b/ },
    { type: "keyword", pattern: words(keywordValues) },
    { type: "builtin", pattern: words(BUILTINS) },
    { type: "decorator", pattern: /@[A-Za-z_$][\w$]*/ },
    { type: "function.call", pattern: /\b[A-Za-z_$][\w$]*(?=\s*\()/ },
    {
      type: "type",
      pattern: /\b[A-Z][A-Za-z\d_$]*(?=\s*(?:<|\[|\||&|[,)>]|$))/,
    },
    { type: "property", pattern: /\b[A-Za-z_$][\w$]*(?=\s*:)/ },
    { type: "constant", pattern: /\b[A-Z][A-Z\d_]{2,}\b/ },
    { type: "variable", pattern: /\b[A-Za-z_$][\w$]*\b/ },
    operatorRule,
    punctuationRule,
    whitespaceRule,
  );

  return {
    id: options.id,
    aliases: options.aliases,
    states: {
      root: { rules: rootRules },
      template: {
        fallbackType: "string",
        rules: [
          { type: "string", pattern: /`/, pop: true },
          { type: "string.escape", pattern: /\\[\s\S]/ },
          {
            type: "string.interpolation",
            pattern: /\$\{/,
            push: "templateExpression",
          },
          { type: "string", pattern: /[^\\`$]+/ },
          { type: "string", pattern: /[$\\]/ },
        ],
      },
      templateExpression: {
        rules: [
          { type: "string.interpolation", pattern: /}/, pop: true },
          { type: "punctuation", pattern: /{/, push: "templateExpression" },
          { include: "root" },
        ],
      },
      jsxTagName: {
        rules: [
          { type: "tag.punctuation", pattern: />/, next: "jsxChildren" },
          { type: "tag.punctuation", pattern: /\/>/, pop: true },
          whitespaceRule,
          {
            type: "tag",
            pattern: /[A-Za-z_$][\w$.-]*/,
            next: "jsxAttributes",
          },
          punctuationRule,
        ],
      },
      jsxAttributes: {
        rules: [
          { type: "tag.punctuation", pattern: /\/>/, pop: true },
          { type: "tag.punctuation", pattern: />/, next: "jsxChildren" },
          whitespaceRule,
          { type: "attribute.value", pattern: /"(?:\\.|[^"\\])*"?/ },
          { type: "attribute.value", pattern: /'(?:\\.|[^'\\])*'?/ },
          { type: "punctuation", pattern: /{/, push: "jsxExpression" },
          { type: "operator", pattern: /=/ },
          { type: "attribute", pattern: /[A-Za-z_$][\w$.-]*/ },
          punctuationRule,
        ],
      },
      jsxChildren: {
        fallbackType: "plain",
        rules: [
          {
            type: "tag.punctuation",
            pattern: /<\/(?=[A-Za-z_$>])/,
            push: "jsxClosingTag",
          },
          {
            type: "tag.punctuation",
            pattern: /<(?=[A-Za-z_$>])/,
            push: "jsxTagName",
          },
          { type: "punctuation", pattern: /{/, push: "jsxExpression" },
          { type: "plain", pattern: /[^<{]+/ },
          { type: "plain", pattern: /[<{]/ },
        ],
      },
      jsxClosingTag: {
        rules: [
          { type: "tag.punctuation", pattern: />/, pop: 2 },
          whitespaceRule,
          { type: "tag", pattern: /[A-Za-z_$][\w$.-]*/ },
          punctuationRule,
        ],
      },
      jsxExpression: {
        rules: [
          { type: "punctuation", pattern: /}/, pop: true },
          { type: "punctuation", pattern: /{/, push: "jsxExpression" },
          { include: "root" },
        ],
      },
    },
  };
}
