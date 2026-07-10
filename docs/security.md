# Security

Yuirinx is designed to render untrusted source text without executing it.

## Escaping guarantee

Before source values are placed into HTML, Yuirinx escapes:

```text
&  → &amp;
<  → &lt;
>  → &gt;
"  → &quot;
'  → &#39;
```

For example:

```html
<script>
  alert(1);
</script>
```

is rendered as visible source text rather than an executable element.

## No code execution

Yuirinx does not use:

- `eval`
- `new Function`
- Dynamic script execution
- Runtime network requests
- DOM parsing

The tokenizer reads strings and applies lexical rules only.

## Generated attributes

Language IDs, token types, class prefixes, and additional wrapper classes are sanitized before becoming class names.

Inline styles are generated only from an allowlisted set of theme fields. Invalid token colors and unknown-language fallback palette colors are omitted. The `color-lines` fallback still escapes source exactly like normal highlighting.

## Trust boundaries

Source code may be untrusted.

Grammars and themes should be treated as developer configuration. A grammar may contain resolver functions, so do not load arbitrary grammar objects from untrusted users and execute them in your application.

The `selector` passed to `themeToCss()` should also be developer-controlled configuration.

## Correct insertion context

The output is intended for normal HTML element content, such as:

```ts
element.innerHTML = yuirinx.highlight(code, options);
```

Do not place the returned string inside:

- A JavaScript string literal
- A CSS declaration
- A URL
- An existing HTML attribute

## Custom renderers

When building custom HTML from `tokenize()`, call `escapeHtml(token.value)` before concatenating source values into HTML.

Framework text nodes generally escape values automatically.

## Content Security Policy

Use class mode when your Content Security Policy disallows inline styles.

```ts
const html = yuirinx.highlight(code, {
  lang: "typescript",
  theme: "yuirinx-noir",
  mode: "classes",
});
```

Generate and serve the theme CSS as a normal stylesheet.

## Reporting a vulnerability

Do not publish exploit details in a public issue. Report suspected vulnerabilities privately to the maintainer with:

- Affected version
- Minimal reproduction
- Expected and actual output
- Security impact
- Suggested mitigation, when known
