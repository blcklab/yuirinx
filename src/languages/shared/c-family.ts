import type { Grammar, GrammarRule } from "../../core/types.js";
import {
  blockCommentRule,
  cLineCommentRule,
  doubleStringRule,
  numberRule,
  operatorRule,
  punctuationRule,
  singleStringRule,
  whitespaceRule,
  words,
} from "./helpers.js";

interface CLikeOptions {
  readonly id: string;
  readonly aliases?: readonly string[];
  readonly keywords: readonly string[];
  readonly builtins?: readonly string[];
  readonly annotations?: boolean;
  readonly preprocessor?: boolean;
  readonly extraRules?: readonly GrammarRule[];
}

export function createCLikeGrammar(options: CLikeOptions): Grammar {
  const rules: GrammarRule[] = [
    cLineCommentRule,
    blockCommentRule,
    ...(options.extraRules ?? []),
    doubleStringRule,
    singleStringRule,
  ];

  if (options.preprocessor) {
    rules.push({ type: "meta", pattern: /#[ \t]*[A-Za-z_]\w*[^\r\n]*/ });
  }
  if (options.annotations) {
    rules.push({
      type: "annotation",
      pattern: /@[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*/,
    });
  }

  rules.push(
    numberRule,
    { type: "boolean", pattern: /\b(?:true|false)\b/ },
    { type: "null", pattern: /\b(?:null|nullptr|nil)\b/ },
    { type: "keyword", pattern: words(options.keywords) },
  );
  if (options.builtins?.length) {
    rules.push({ type: "builtin", pattern: words(options.builtins) });
  }
  rules.push(
    { type: "function.call", pattern: /\b[A-Za-z_]\w*(?=\s*\()/ },
    { type: "type", pattern: /\b[A-Z][A-Za-z\d_]*\b/ },
    { type: "constant", pattern: /\b[A-Z][A-Z\d_]{2,}\b/ },
    { type: "variable", pattern: /\b[A-Za-z_]\w*\b/ },
    operatorRule,
    punctuationRule,
    whitespaceRule,
  );

  return {
    id: options.id,
    ...(options.aliases ? { aliases: options.aliases } : {}),
    states: { root: { rules } },
  };
}
