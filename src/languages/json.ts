import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** JSON grammar with property-name distinction. */
export const json: Grammar = {
  id: "json",
  aliases: ["jsonc"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /\/\*[\s\S]*?(?:\*\/|$)|\/\/[^\r\n]*/ },
        {
          type: (match) => {
            const remainder = match.input.slice(match.index + match[0].length);
            return /^\s*:/.test(remainder) ? "property" : "string";
          },
          pattern: /"(?:\\[\s\S]|[^"\\])*"?/,
        },
        {
          type: "number",
          pattern: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
        },
        { type: "boolean", pattern: /\b(?:true|false)\b/ },
        { type: "null", pattern: /\bnull\b/ },
        { type: "punctuation", pattern: /[{}[\],:]/ },
        whitespaceRule,
      ],
    },
  },
};
