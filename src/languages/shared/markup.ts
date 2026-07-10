import type { Grammar } from "../../core/types.js";
import { whitespaceRule } from "./helpers.js";

interface MarkupOptions {
  readonly id: string;
  readonly aliases?: readonly string[];
}

export function createMarkupGrammar(options: MarkupOptions): Grammar {
  return {
    id: options.id,
    ...(options.aliases ? { aliases: options.aliases } : {}),
    states: {
      root: {
        rules: [
          { type: "comment", pattern: /<!--[\s\S]*?(?:-->|$)/ },
          { type: "meta", pattern: /<!DOCTYPE[^>]*>?/i },
          { type: "meta", pattern: /<\?[\s\S]*?(?:\?>|$)/ },
          { type: "tag.punctuation", pattern: /<\/?/, push: "tagName" },
          { type: "constant", pattern: /&(?:#\d+|#x[\da-f]+|[a-z][\w-]*);/i },
          { type: "plain", pattern: /[^<&]+/ },
          { type: "plain", pattern: /[<&]/ },
        ],
      },
      tagName: {
        rules: [
          whitespaceRule,
          { type: "tag.punctuation", pattern: /\/?>/, pop: true },
          { type: "tag", pattern: /[A-Za-z_][\w:.-]*/, next: "tag" },
        ],
      },
      tag: {
        rules: [
          { type: "tag.punctuation", pattern: /\/?>/, pop: true },
          whitespaceRule,
          { type: "attribute.value", pattern: /"(?:&[^;\s]+;|[^"&])*"?/ },
          { type: "attribute.value", pattern: /'(?:&[^;\s]+;|[^'&])*'?/ },
          { type: "punctuation", pattern: /[{[]/ },
          { type: "operator", pattern: /=/ },
          { type: "attribute", pattern: /[@:#A-Za-z_][\w:.-]*/ },
        ],
      },
    },
  };
}
