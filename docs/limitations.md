# Limitations and Tradeoffs

Yuirinx performs lexical syntax highlighting with regular expressions and tokenizer states. It does not parse a complete language grammar or perform semantic analysis.

## Expected limitations

- JavaScript regular-expression literals use lexical context heuristics and may still be ambiguous in unusual expressions
- JSX tags and TypeScript generic-angle syntax use practical heuristics rather than a full parser
- Deep TypeScript type expressions may receive approximate classifications
- HTML embedded `<script>` and `<style>` content is handled conservatively
- Vue and Svelte highlighting is lexical rather than compiler-aware
- Markdown nesting and fenced-language delegation are intentionally limited
- Shell syntax is highly context-sensitive and may be approximated
- Python f-string nesting may be simplified
- PHP and HTML boundaries are lexical
- YAML scalar interpretation is approximate
- C++ templates and operators can be ambiguous
- Identifiers that need type information may remain plain variables

## What Yuirinx does not provide

- AST parsing
- Semantic tokens
- Type checking
- Language-server integration
- Incremental editor tokenization
- Code formatting
- Automatic DOM scanning
- Line-number or copy-button UI

## When to use Yuirinx

Yuirinx is a good fit for:

- Documentation pages
- Blogs and tutorials
- Static-site generation
- README previews
- Server-rendered code examples
- Small browser bundles
- Environments where synchronous initialization matters

## When to choose another tool

Use a TextMate-based or compiler-backed highlighter when you need editor-grade fidelity across highly ambiguous or deeply nested language syntax.

Yuirinx intentionally chooses a smaller synchronous runtime and zero dependencies over maximum grammar fidelity.
