# Changelog

All notable changes to Yuirinx are documented here.

## 0.1.2 - Release hardening

### Fixed

- Preserved the ESM module graph so related languages share internal grammar factories instead of embedding duplicate copies
- Kept CommonJS public entries self-contained for reliable `require()` usage
- Fixed hierarchical token fallback in class mode by emitting parent and specific token classes
- Fixed operator rules that incorrectly merged adjacent unrelated operators
- Improved JavaScript regex-versus-division handling with contextual rule predicates
- Improved JSX tag, attribute, child-text, closing-tag, and TSX generic handling
- Restricted Markdown block syntax to line starts
- Fixed CSS percentage unit classification
- Made plaintext visible through language registry inspection
- Made `highlight(code)` valid without an options object
- Added strict validation for `maxStateDepth`
- Added formatting to the canonical release and prepublish gate

### Added

- Conditional grammar rules through the optional `when(match, context)` predicate
- Packed-package regression checks for shared ESM grammar modules
- Semantic regression tests for JavaScript, JSX, TSX, Markdown, CSS, class rendering, and plaintext behavior

## 0.1.0 - Initial Release

First public release of Yuirinx.

Yuirinx starts as a lightweight, synchronous syntax highlighter for JavaScript and TypeScript projects. It focuses on safe HTML output, themeable rendering, and independently importable languages and themes.

### Added

- Original state-machine tokenizer with ordered sticky rules
- Safe HTML renderer with inline-style and CSS-class rendering modes
- Isolated highlighter instances and optional singleton helpers
- Hierarchical token style fallback
- Optional deterministic, theme-aware line colors for unsupported languages
- Three original themes: Yuirinx Noir, Yuirinx Pearl, and Yuirinx Aurora
- 34 independently importable language modules
- Explicit package exports for every public language and theme
- ESM, CommonJS, `.d.ts`, and `.d.cts` builds
- Source preservation, security, package, tree-shaking, export, and bundle-size checks
- Packed-package validation through public ESM and CommonJS imports
- Examples for browser, Node ESM, Node CommonJS, custom grammars, and custom themes
- Complete documentation under `/docs`
