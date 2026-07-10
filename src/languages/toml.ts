import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** TOML grammar. */
export const toml: Grammar = {
  id: "toml",
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "heading", pattern: /\[\[?[^\]\r\n]+\]\]?/ },
        {
          type: "property",
          pattern: /(?:[A-Za-z0-9_-]+|"[^"\r\n]+"|'[^'\r\n]+')(?=\s*=)/,
        },
        { type: "string", pattern: /"""[\s\S]*?(?:"""|$)/ },
        { type: "string", pattern: /'''[\s\S]*?(?:'''|$)/ },
        { type: "string", pattern: /"(?:\\[\s\S]|[^"\\\r\n])*"?/ },
        { type: "string", pattern: /'[^'\r\n]*'?/ },
        { type: "boolean", pattern: /\b(?:true|false)\b/ },
        {
          type: "number",
          pattern:
            /[-+]?\b(?:0x[\da-f_]+|0o[0-7_]+|0b[01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:e[-+]?\d+)?)\b/i,
        },
        { type: "constant", pattern: /\b\d{4}-\d{2}-\d{2}(?:[Tt ][^\s#]+)?/ },
        { type: "operator", pattern: /=/ },
        { type: "punctuation", pattern: /[{}[\],.]/ },
        whitespaceRule,
        { type: "value", pattern: /[^\s=,\]}]+/ },
      ],
    },
  },
};
