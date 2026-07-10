import type { Grammar } from "../core/types.js";
import {
  numberRule,
  punctuationRule,
  whitespaceRule,
  words,
} from "./shared/helpers.js";

const KEYWORDS = [
  "directive",
  "enum",
  "extend",
  "fragment",
  "implements",
  "input",
  "interface",
  "mutation",
  "on",
  "query",
  "repeatable",
  "scalar",
  "schema",
  "subscription",
  "type",
  "union",
] as const;

/** GraphQL schema and operation grammar. */
export const graphql: Grammar = {
  id: "graphql",
  aliases: ["gql"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "string", pattern: /"""[\s\S]*?(?:"""|$)/ },
        { type: "string", pattern: /"(?:\\.|[^"\\\r\n])*"?/ },
        { type: "variable", pattern: /\$[A-Za-z_]\w*/ },
        { type: "decorator", pattern: /@[A-Za-z_]\w*/ },
        numberRule,
        { type: "boolean", pattern: /\b(?:true|false)\b/ },
        { type: "null", pattern: /\bnull\b/ },
        { type: "keyword", pattern: words(KEYWORDS) },
        { type: "type", pattern: /\b[A-Z][A-Za-z\d_]*\b/ },
        { type: "property", pattern: /\b[A-Za-z_]\w*(?=\s*:)/ },
        { type: "variable", pattern: /\b[A-Za-z_]\w*\b/ },
        { type: "operator", pattern: /[!|=&]/ },
        punctuationRule,
        whitespaceRule,
      ],
    },
  },
};
