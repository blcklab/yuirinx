import { YuirinxError } from "./errors.js";
import type { CompiledGrammar, CompiledRule } from "./grammar.js";
import type {
  StateResolver,
  Token,
  TokenTypeResolver,
  TokenizerContext,
  TokenizerState,
} from "./types.js";

function resolveValue<T extends string>(
  resolver:
    T | ((match: RegExpExecArray, context: TokenizerContext) => T) | undefined,
  match: RegExpExecArray,
  context: TokenizerContext,
): T | undefined {
  return typeof resolver === "function" ? resolver(match, context) : resolver;
}

function appendToken(
  tokens: Token[],
  type: string,
  value: string,
  start: number,
): void {
  if (!value) return;
  const previous = tokens[tokens.length - 1];
  if (previous && previous.type === type && previous.end === start) {
    tokens[tokens.length - 1] = {
      type,
      value: previous.value + value,
      start: previous.start,
      end: start + value.length,
    };
    return;
  }
  tokens.push({ type, value, start, end: start + value.length });
}

function publicStack(
  grammarId: string,
  stack: readonly string[],
): readonly TokenizerState[] {
  return stack.map((name) => ({ name, language: grammarId }));
}

function applyTransition(
  rule: CompiledRule,
  match: RegExpExecArray,
  context: TokenizerContext,
  stack: string[],
  maxStateDepth: number,
): void {
  const popCount =
    rule.pop === true ? 1 : typeof rule.pop === "number" ? rule.pop : 0;
  if (popCount > 0) {
    const removable = Math.min(popCount, Math.max(0, stack.length - 1));
    stack.splice(stack.length - removable, removable);
  }

  const next = resolveValue(
    rule.next as StateResolver | undefined,
    match,
    context,
  );
  if (next) stack[stack.length - 1] = next;

  const push = resolveValue(
    rule.push as StateResolver | undefined,
    match,
    context,
  );
  if (push) {
    if (stack.length >= maxStateDepth) {
      throw new YuirinxError(
        "YUIRINX_STATE_DEPTH_EXCEEDED",
        `Tokenizer state depth exceeded the configured limit of ${maxStateDepth}.`,
      );
    }
    stack.push(push);
  }
}

export function tokenizeCompiled(
  code: string,
  grammar: CompiledGrammar,
  maxStateDepth: number,
): Token[] {
  if (!code) return [];

  const tokens: Token[] = [];
  const stack = [grammar.initialState];
  let offset = 0;

  while (offset < code.length) {
    const stateName = stack[stack.length - 1] ?? grammar.initialState;
    const rules = grammar.states[stateName];
    if (!rules) {
      throw new YuirinxError(
        "YUIRINX_UNKNOWN_STATE",
        `Grammar "${grammar.id}" entered missing state "${stateName}".`,
      );
    }

    let matched = false;
    for (const rule of rules) {
      rule.pattern.lastIndex = offset;
      const match = rule.pattern.exec(code);
      if (!match) continue;
      if (match[0].length === 0) {
        throw new YuirinxError(
          "YUIRINX_EMPTY_PATTERN",
          `Grammar "${grammar.id}" produced an empty match in state "${stateName}" from /${rule.source}/.`,
        );
      }

      const context: TokenizerContext = {
        language: grammar.id,
        state: stateName,
        stack: publicStack(grammar.id, stack),
        offset,
      };
      const tokenType =
        resolveValue(
          rule.type as TokenTypeResolver | undefined,
          match,
          context,
        ) ??
        grammar.fallbackTypes[stateName] ??
        "plain";

      appendToken(tokens, tokenType, match[0], offset);
      applyTransition(rule, match, context, stack, maxStateDepth);
      offset += match[0].length;
      matched = true;
      break;
    }

    if (!matched) {
      appendToken(
        tokens,
        grammar.fallbackTypes[stateName] ?? "plain",
        code[offset] ?? "",
        offset,
      );
      offset += 1;
    }
  }

  return tokens;
}
