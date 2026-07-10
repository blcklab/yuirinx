import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** Markdown grammar with fenced-code state handling. */
export const markdown: Grammar = {
  id: "markdown",
  aliases: ["md", "mdown"],
  states: {
    root: {
      rules: [
        { type: "meta", pattern: /```[^\r\n]*(?:\r?\n|$)/, push: "fence" },
        { type: "heading", pattern: /#{1,6}[ \t]+[^\r\n]*/ },
        {
          type: "heading",
          pattern: /[^\r\n]+\r?\n(?:===+|---+)[ \t]*(?:\r?\n|$)/,
        },
        { type: "quote", pattern: />[ \t]?[^\r\n]*/ },
        { type: "list", pattern: /(?:[-+*]|\d+[.)])[ \t]+/ },
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
        { type: "meta", pattern: /```[ \t]*(?:\r?\n|$)/, pop: true },
        { type: "code", pattern: /[^`]+/ },
        { type: "code", pattern: /`/ },
      ],
    },
  },
};
