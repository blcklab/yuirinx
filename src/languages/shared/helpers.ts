import type { GrammarRule } from "../../core/types.js";

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function words(values: readonly string[], flags = ""): RegExp {
  return new RegExp(`\\b(?:${values.map(escapeRegex).join("|")})\\b`, flags);
}

export const whitespaceRule: GrammarRule = { type: "plain", pattern: /\s+/ };

export const punctuationRule: GrammarRule = {
  type: "punctuation",
  pattern: /[()[\]{}.,;:]/,
};

export const operatorRule: GrammarRule = {
  type: "operator",
  pattern:
    /(?:===|!==|>>>|<<=|>>=|=>|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\+=|-=|\*=|\/=|%=|\*\*|<<|>>|[+\-*/%=&|!<>^~?])+/,
};

export const numberRule: GrammarRule = {
  type: "number",
  pattern:
    /\b(?:0[xX][\da-fA-F](?:_?[\da-fA-F])*|0[bB][01](?:_?[01])*|0[oO][0-7](?:_?[0-7])*|\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?)\b/,
};

export const doubleStringRule: GrammarRule = {
  type: "string",
  pattern: /"(?:\\[\s\S]|[^"\\\r\n])*"?/,
};

export const singleStringRule: GrammarRule = {
  type: "string",
  pattern: /'(?:\\[\s\S]|[^'\\\r\n])*'?/,
};

export const cLineCommentRule: GrammarRule = {
  type: "comment",
  pattern: /\/\/[^\r\n]*/,
};

export const hashCommentRule: GrammarRule = {
  type: "comment",
  pattern: /#[^\r\n]*/,
};

export const blockCommentRule: GrammarRule = {
  type: (match) =>
    match[0].startsWith("/**") ? "comment.documentation" : "comment",
  pattern: /\/\*[\s\S]*?(?:\*\/|$)/,
};
