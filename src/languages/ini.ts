import type { Grammar } from "../core/types.js";
import { whitespaceRule } from "./shared/helpers.js";

/** INI and dotenv-style configuration grammar. */
export const ini: Grammar = {
  id: "ini",
  aliases: ["dotenv", "properties"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /[;#][^\r\n]*/ },
        { type: "heading", pattern: /\[[^\]\r\n]+\]/ },
        { type: "property", pattern: /[A-Za-z_][\w.-]*(?=\s*[=:])/ },
        { type: "string", pattern: /"(?:\\.|[^"\\\r\n])*"?/ },
        { type: "string", pattern: /'(?:\\.|[^'\\\r\n])*'?/ },
        { type: "boolean", pattern: /\b(?:true|false|yes|no|on|off)\b/i },
        { type: "number", pattern: /[-+]?\b\d+(?:\.\d+)?\b/ },
        { type: "operator", pattern: /[=:]/ },
        whitespaceRule,
        { type: "value", pattern: /[^\s;#=:]+/ },
      ],
    },
  },
};
