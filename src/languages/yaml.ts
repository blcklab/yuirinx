import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** YAML grammar focused on configuration readability. */
export const yaml: Grammar = {
  id: "yaml",
  aliases: ["yml"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "meta", pattern: /(?:---|\.\.\.)(?=\s|$)/ },
        { type: "string", pattern: /"(?:\\[\s\S]|[^"\\\r\n])*"?/ },
        { type: "string", pattern: /'(?:''|[^'\r\n])*'?/ },
        {
          type: "property",
          pattern: /(?:[A-Za-z_][\w .-]*|"[^"\r\n]+"|'[^'\r\n]+')(?=\s*:)/,
        },
        { type: "important", pattern: /![A-Za-z_][\w:.-]*/ },
        { type: "constant", pattern: /[&*][A-Za-z_][\w.-]*/ },
        { type: "boolean", pattern: /\b(?:true|false|yes|no|on|off)\b/i },
        { type: "null", pattern: /(?:\bnull\b|~)/i },
        {
          type: "number",
          pattern:
            /[-+]?\b(?:0x[\da-f]+|0o[0-7]+|\d+(?:\.\d+)?(?:e[-+]?\d+)?)\b/i,
        },
        { type: "list", pattern: /-(?=\s)/ },
        { type: "operator", pattern: /[?:|>]/ },
        { type: "punctuation", pattern: /[{}[\],]/ },
        { type: "string", pattern: /[^\s:{}[\],#&*!|>'"%@`-][^\r\n:#]*/ },
        whitespaceRule,
      ],
    },
  },
};
