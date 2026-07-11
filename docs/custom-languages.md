# Custom Languages

A Yuirinx grammar is a small object containing named lexical states and ordered rules.

## Basic grammar

```ts
import type { Grammar } from "@blcklab/yuirinx";

export const miniLanguage: Grammar = {
  id: "mini",
  aliases: ["mn"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "string", pattern: /"(?:\\.|[^"\\])*"?/ },
        { type: "number", pattern: /\b\d+(?:\.\d+)?\b/ },
        { type: "keyword", pattern: /\b(?:let|print|if|else|end)\b/ },
        { type: "variable", pattern: /\b[A-Za-z_]\w*\b/ },
        { type: "operator", pattern: /[=+\-*/]/ },
        { type: "punctuation", pattern: /[(),]/ },
        { type: "plain", pattern: /\s+/ },
      ],
    },
  },
};
```

Register it:

```ts
const yuirinx = createHighlighter({ languages: [miniLanguage] });
```

## Rule order

Rules are tested in declaration order at the current source offset. Put more specific patterns before more general patterns.

```ts
rules: [
  { type: "boolean", pattern: /\b(?:true|false)\b/ },
  { type: "variable", pattern: /\b[A-Za-z_]\w*\b/ },
];
```

If the variable rule came first, it would classify `true` as a variable.

## Sticky matching

Yuirinx clones grammar expressions internally and makes them sticky. A rule must match exactly at the tokenizer's current position.

Do not add manual `g` or `y` behavior. Yuirinx handles matching state independently for each tokenization call.

## Empty patterns are forbidden

A pattern that can match an empty string would prevent the tokenizer from advancing. Yuirinx rejects it during grammar compilation.

Avoid patterns such as:

```ts
/a*/
/(?:)/
```

## Lexical states

Use `push`, `pop`, or `next` for multiline and nested syntax.

```ts
export const quoted: Grammar = {
  id: "quoted",
  states: {
    root: {
      rules: [
        { type: "string", pattern: /"/, push: "doubleQuote" },
        { type: "plain", pattern: /[^"\s]+|\s+/ },
      ],
    },
    doubleQuote: {
      rules: [
        { type: "string.escape", pattern: /\\./ },
        { type: "string", pattern: /"/, pop: true },
        { type: "string", pattern: /[^"\\]+/ },
      ],
      fallbackType: "string",
    },
  },
};
```

Unterminated strings are allowed. The active state simply consumes through the end of the input.

## Include another state's rules

```ts
states: {
  root: {
    rules: [
      { include: "shared" },
      // root-only rules
    ],
  },
  shared: {
    rules: [
      { type: "number", pattern: /\b\d+\b/ },
    ],
  },
}
```

Include cycles are rejected.

## Dynamic token types and states

A rule may resolve its token type or target state from the current match.

```ts
{
  pattern: /\b[A-Za-z_]\w*\b/,
  type: (match) =>
    match[0][0] === match[0][0]?.toUpperCase() ? "type" : "variable",
}
```

Resolvers receive a read-only tokenizer context with the full source string,
language, active state, stack, and current offset.

## Conditional rules

Use `when` when a regex is valid only in a specific lexical context. The regex
must still match at the current offset; the predicate decides whether Yuirinx
accepts that match or continues to the next rule.

```ts
{
  type: "directive",
  pattern: /#[A-Za-z_]+/,
  when: (_match, context) =>
    context.offset === 0 ||
    /[\r\n]/.test(context.source[context.offset - 1] ?? ""),
}
```

Keep predicates small and local. Inspect characters near `context.offset` rather
than repeatedly rescanning the entire source.

## Recommended token names

Prefer general semantic types:

- `comment`
- `keyword`
- `keyword.control`
- `string`
- `string.escape`
- `number`
- `boolean`
- `null`
- `operator`
- `punctuation`
- `function`
- `variable`
- `property`
- `type`
- `class`
- `builtin`
- `tag`
- `attribute`

Dot-separated specialization works with theme fallback.

## Test a grammar

At minimum verify:

```ts
const tokens = yuirinx.tokenize(source, miniLanguage);

expect(tokens.map((token) => token.value).join("")).toBe(source);
```

Also assert important classifications, malformed input, unterminated syntax, Unicode, and long lines.

## Performance guidance

- Prefer negated character classes over broad backtracking patterns
- Avoid nested unbounded quantifiers
- Avoid rescanning the full remaining document in resolver callbacks
- Use lexical states instead of one very large expression
- Benchmark realistic and malformed input
