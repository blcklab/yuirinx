import { YuirinxError } from "./errors.js";
import type { Grammar, GrammarRule, MatchRule, StateName } from "./types.js";

export interface CompiledRule extends Omit<MatchRule, "pattern"> {
  readonly pattern: RegExp;
  readonly source: string;
}

export interface CompiledGrammar {
  readonly source: Grammar;
  readonly id: string;
  readonly initialState: string;
  readonly states: Readonly<Record<string, readonly CompiledRule[]>>;
  readonly fallbackTypes: Readonly<Record<string, string>>;
}

export function normalizeId(value: string): string {
  return value.trim().toLowerCase();
}

function isIncludeRule(
  rule: GrammarRule,
): rule is { readonly include: StateName } {
  return "include" in rule;
}

function stickyPattern(pattern: RegExp): RegExp {
  const flags = [...pattern.flags]
    .filter((flag) => flag !== "g" && flag !== "y")
    .join("");
  return new RegExp(pattern.source, `${flags}y`);
}

function canMatchEmpty(pattern: RegExp): boolean {
  const candidates = ["", "x", " ", "\n", "0"];
  for (const candidate of candidates) {
    const probe = stickyPattern(pattern);
    probe.lastIndex = 0;
    const match = probe.exec(candidate);
    if (match && match[0].length === 0) return true;
  }
  return false;
}

export function compileGrammar(grammar: Grammar): CompiledGrammar {
  const id = normalizeId(grammar.id);
  if (!id) {
    throw new YuirinxError(
      "YUIRINX_INVALID_GRAMMAR",
      "A grammar must have a non-empty id.",
    );
  }

  const stateNames = Object.keys(grammar.states);
  if (stateNames.length === 0) {
    throw new YuirinxError(
      "YUIRINX_INVALID_GRAMMAR",
      `Grammar "${id}" must define at least one state.`,
    );
  }

  const initialState = grammar.initialState ?? "root";
  if (!grammar.states[initialState]) {
    throw new YuirinxError(
      "YUIRINX_UNKNOWN_STATE",
      `Grammar "${id}" uses missing initial state "${initialState}".`,
    );
  }

  const compiledStates: Record<string, readonly CompiledRule[]> = {};
  const fallbackTypes: Record<string, string> = {};

  const resolveRules = (
    stateName: string,
    ancestry: readonly string[],
  ): readonly CompiledRule[] => {
    const state = grammar.states[stateName];
    if (!state) {
      throw new YuirinxError(
        "YUIRINX_UNKNOWN_STATE",
        `Grammar "${id}" references missing state "${stateName}".`,
      );
    }
    if (ancestry.includes(stateName)) {
      throw new YuirinxError(
        "YUIRINX_INCLUDE_CYCLE",
        `Grammar "${id}" has an include cycle: ${[...ancestry, stateName].join(" -> ")}.`,
      );
    }

    const rules: CompiledRule[] = [];
    for (const [index, rule] of state.rules.entries()) {
      if (isIncludeRule(rule)) {
        rules.push(...resolveRules(rule.include, [...ancestry, stateName]));
        continue;
      }

      if (canMatchEmpty(rule.pattern)) {
        throw new YuirinxError(
          "YUIRINX_EMPTY_PATTERN",
          `Grammar "${id}", state "${stateName}", rule ${index} can match an empty string.`,
        );
      }

      for (const target of [rule.push, rule.next]) {
        if (typeof target === "string" && !grammar.states[target]) {
          throw new YuirinxError(
            "YUIRINX_UNKNOWN_STATE",
            `Grammar "${id}", state "${stateName}", rule ${index} references missing state "${target}".`,
          );
        }
      }

      rules.push({
        ...rule,
        pattern: stickyPattern(rule.pattern),
        source: rule.pattern.source,
      });
    }
    return rules;
  };

  for (const stateName of stateNames) {
    compiledStates[stateName] = resolveRules(stateName, []);
    fallbackTypes[stateName] =
      grammar.states[stateName]?.fallbackType ?? "plain";
  }

  return {
    source: grammar,
    id,
    initialState,
    states: compiledStates,
    fallbackTypes,
  };
}
