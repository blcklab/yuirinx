import type { Grammar, GrammarRule } from "../../core/types.js";
import {
  blockCommentRule,
  doubleStringRule,
  operatorRule,
  punctuationRule,
  singleStringRule,
  whitespaceRule,
} from "./helpers.js";

interface CssOptions {
  readonly id: string;
  readonly aliases?: readonly string[];
  readonly scss?: boolean;
}

export function createCssGrammar(options: CssOptions): Grammar {
  const rules: GrammarRule[] = [
    blockCommentRule,
    ...(options.scss
      ? [{ type: "comment", pattern: /\/\/[^\r\n]*/ } as const]
      : []),
    doubleStringRule,
    singleStringRule,
    { type: "important", pattern: /!important\b/i },
    { type: "at-rule", pattern: /@[a-z-]+\b/i },
    { type: "constant", pattern: /#[\da-f]{3,8}\b/i },
    { type: "variable", pattern: /(?:\$|--)[\w-]+/ },
    { type: "number", pattern: /(?:\b\d*\.\d+|\b\d+)(?:e[+-]?\d+)?/i },
    {
      type: "unit",
      pattern:
        /(?:%|px|r?em|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|s|ms|deg|rad|turn)\b/i,
    },
    {
      type: "selector",
      pattern: /(?:[.#][\w-]+|::?[\w-]+|\[[^\]\r\n]+\])(?=\s*(?:[,>{+~]|$))/,
    },
    { type: "property.css", pattern: /-?[a-z][\w-]*(?=\s*:)/i },
    { type: "function.call", pattern: /[a-z-]+(?=\()/i },
    {
      type: "value",
      pattern:
        /\b(?:auto|none|inherit|initial|unset|solid|relative|absolute|fixed|sticky|flex|grid|block|inline|transparent|currentColor)\b/i,
    },
    operatorRule,
    punctuationRule,
    { type: "punctuation", pattern: /[>~]/ },
    { type: "value", pattern: /-?[a-z_][\w-]*/i },
    whitespaceRule,
  ];

  return {
    id: options.id,
    ...(options.aliases ? { aliases: options.aliases } : {}),
    states: { root: { rules } },
  };
}
