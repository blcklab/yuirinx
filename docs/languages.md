# Languages and Aliases

Every grammar has an exact public import path. Yuirinx does not expose wildcard package paths or internal grammar helpers.

```ts
import { python } from "@blcklab/yuirinx/lang/python";
```

## Supported languages

| Language                  | Import path                        | Export       | Aliases                   |
| ------------------------- | ---------------------------------- | ------------ | ------------------------- |
| Bash                      | `@blcklab/yuirinx/lang/bash`       | `bash`       | `sh`, `shell`, `zsh`      |
| C                         | `@blcklab/yuirinx/lang/c`          | `c`          | `h`                       |
| C++                       | `@blcklab/yuirinx/lang/cpp`        | `cpp`        | `c++`, `cc`, `cxx`, `hpp` |
| C#                        | `@blcklab/yuirinx/lang/csharp`     | `csharp`     | `cs`, `c#`                |
| CSS                       | `@blcklab/yuirinx/lang/css`        | `css`        | —                         |
| Dart                      | `@blcklab/yuirinx/lang/dart`       | `dart`       | —                         |
| Dockerfile                | `@blcklab/yuirinx/lang/dockerfile` | `dockerfile` | `docker`                  |
| Go                        | `@blcklab/yuirinx/lang/go`         | `go`         | `golang`                  |
| GraphQL                   | `@blcklab/yuirinx/lang/graphql`    | `graphql`    | `gql`                     |
| HTML                      | `@blcklab/yuirinx/lang/html`       | `html`       | `htm`                     |
| INI / dotenv              | `@blcklab/yuirinx/lang/ini`        | `ini`        | `dotenv`, `properties`    |
| Java                      | `@blcklab/yuirinx/lang/java`       | `java`       | —                         |
| JavaScript                | `@blcklab/yuirinx/lang/javascript` | `javascript` | `js`, `mjs`, `cjs`        |
| JSON / JSONC              | `@blcklab/yuirinx/lang/json`       | `json`       | `jsonc`                   |
| JSX                       | `@blcklab/yuirinx/lang/jsx`        | `jsx`        | `react`                   |
| Kotlin                    | `@blcklab/yuirinx/lang/kotlin`     | `kotlin`     | `kt`, `kts`               |
| Markdown                  | `@blcklab/yuirinx/lang/markdown`   | `markdown`   | `md`, `mdown`             |
| Nginx                     | `@blcklab/yuirinx/lang/nginx`      | `nginx`      | —                         |
| PHP                       | `@blcklab/yuirinx/lang/php`        | `php`        | `php8`                    |
| Plaintext                 | `@blcklab/yuirinx/lang/plaintext`  | `plaintext`  | `text`, `txt`, `plain`    |
| Python                    | `@blcklab/yuirinx/lang/python`     | `python`     | `py`                      |
| Ruby                      | `@blcklab/yuirinx/lang/ruby`       | `ruby`       | `rb`                      |
| Rust                      | `@blcklab/yuirinx/lang/rust`       | `rust`       | `rs`                      |
| SCSS                      | `@blcklab/yuirinx/lang/scss`       | `scss`       | `sass`                    |
| Shell compatibility entry | `@blcklab/yuirinx/lang/shell`      | `shell`      | Uses the Bash grammar     |
| SQL                       | `@blcklab/yuirinx/lang/sql`        | `sql`        | —                         |
| Svelte                    | `@blcklab/yuirinx/lang/svelte`     | `svelte`     | —                         |
| Swift                     | `@blcklab/yuirinx/lang/swift`      | `swift`      | —                         |
| TOML                      | `@blcklab/yuirinx/lang/toml`       | `toml`       | —                         |
| TSX                       | `@blcklab/yuirinx/lang/tsx`        | `tsx`        | `typescriptreact`         |
| TypeScript                | `@blcklab/yuirinx/lang/typescript` | `typescript` | `ts`, `mts`, `cts`        |
| Vue SFC                   | `@blcklab/yuirinx/lang/vue`        | `vue`        | —                         |
| XML                       | `@blcklab/yuirinx/lang/xml`        | `xml`        | `xhtml`, `svg`            |
| YAML                      | `@blcklab/yuirinx/lang/yaml`       | `yaml`       | `yml`                     |

## Register multiple languages

```ts
import { createHighlighter } from "@blcklab/yuirinx";
import { html } from "@blcklab/yuirinx/lang/html";
import { javascript } from "@blcklab/yuirinx/lang/javascript";
import { typescript } from "@blcklab/yuirinx/lang/typescript";

const yuirinx = createHighlighter({
  languages: [html, javascript, typescript],
});
```

## Aliases

Aliases are case-insensitive after normalization.

```ts
yuirinx.tokenize(code, "TS");
yuirinx.tokenize(code, "typescript");
```

Both resolve to the TypeScript grammar.

## Unknown language behavior

Unknown IDs fall back to plaintext. This is intentional for documentation systems that may encounter a language identifier they do not support yet. Set `fallback: "color-lines"` to apply an optional deterministic, theme-aware color flow without pretending the language was parsed.

## Tree-shaking

Only import the languages your application uses. Avoid creating a local file that imports every grammar unless you intentionally want a complete language bundle.
