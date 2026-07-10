import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** Nginx configuration grammar. */
export const nginx: Grammar = {
  id: "nginx",
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "string", pattern: /"(?:\\.|[^"\\\r\n])*"?/ },
        { type: "string", pattern: /'(?:\\.|[^'\\\r\n])*'?/ },
        { type: "variable", pattern: /\$[A-Za-z_]\w*/ },
        { type: "number", pattern: /\b\d+(?:\.\d+)?(?:k|m|g|ms|s|m|h|d)?\b/i },
        {
          type: "keyword",
          pattern:
            /\b(?:http|events|server|location|upstream|map|if|limit_except|types|geo|stream|mail)\b/,
        },
        { type: "property", pattern: /\b[a-z_][\w-]*(?=\s)/i },
        { type: "operator", pattern: /[=~^$*+?!-]+/ },
        { type: "punctuation", pattern: /[{}();:,]/ },
        { type: "value", pattern: /[^\s#"'$=~^*+?!{}();:,]+/ },
        whitespaceRule,
      ],
    },
  },
};
