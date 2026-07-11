import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

const atLineStart = (
  _match: RegExpExecArray,
  context: { source: string; offset: number },
): boolean =>
  context.offset === 0 ||
  /[\r\n]/.test(context.source[context.offset - 1] ?? "");

/** Markdown grammar with fenced-code state handling. */
export const markdown: Grammar = {
  id: "markdown",
  aliases: ["md", "mdown"],
  states: {
    root: {
      rules: [
        {
          type: "meta",
          pattern: / {0,3}```[^\r\n]*(?:\r?\n|$)/,
          when: atLineStart,
          push: "fence",
        },
        {
          type: "heading",
          pattern: / {0,3}#{1,6}[ \t]+[^\r\n]*/,
          when: atLineStart,
        },
        {
          type: "heading",
          pattern: /[^\r\n]+\r?\n {0,3}(?:===+|---+)[ \t]*(?:\r?\n|$)/,
          when: atLineStart,
        },
        {
          type: "quote",
          pattern: / {0,3}>[ \t]?[^\r\n]*/,
          when: atLineStart,
        },
        {
          type: "list",
          pattern: / {0,3}(?:[-+*]|\d+[.)])[ \t]+/,
          when: atLineStart,
        },
        { type: "important", pattern: /!\[[^\]\r\n]*\]\([^\r\n)]*\)/ },
        { type: "link", pattern: /\[[^\]\r\n]+\]\([^\r\n)]*\)/ },
        { type: "url", pattern: /https?:\/\/[^\s<>()]+/ },
        { type: "code", pattern: /`[^`\r\n]*`?/ },
        { type: "strong", pattern: /(?:\*\*|__)(?=\S)[\s\S]*?(?:\*\*|__)/ },
        { type: "emphasis", pattern: /(?:\*|_)(?=\S)[^\r\n]*?(?:\*|_)/ },
        { type: "punctuation", pattern: /[*_~`#[\]()>!-]+/ },
        { type: "plain", pattern: /[^*_~`#[\]()>!\s-]+/ },
        whitespaceRule,
        { type: "plain", pattern: /./ },
      ],
    },
    fence: {
      fallbackType: "code",
      rules: [
        {
          type: "meta",
          pattern: / {0,3}```[ \t]*(?:\r?\n|$)/,
          when: atLineStart,
          pop: true,
        },
        { type: "code", pattern: /[^`]+/ },
        { type: "code", pattern: /`/ },
      ],
    },
  },
};
