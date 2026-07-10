# Changelog

All notable changes to Yuirinx are documented here.

## 0.1.0 - Initial Release

First public release of Yuirinx.

Yuirinx starts as a lightweight, synchronous syntax highlighter for JavaScript and TypeScript projects. It focuses on safe HTML output, themeable rendering, and independently importable languages and themes.

### Added

* Original state-machine tokenizer with ordered sticky rules
* Safe HTML renderer with inline-style and CSS-class rendering modes
* Isolated highlighter instances and optional singleton helpers
* Hierarchical token style fallback
* Optional deterministic, theme-aware line colors for unsupported languages
* Three original themes: Yuirinx Noir, Yuirinx Pearl, and Yuirinx Aurora
* 34 independently importable language modules
* Explicit package exports for every public language and theme
* ESM, CommonJS, `.d.ts`, and `.d.cts` builds
* Source preservation, security, package, tree-shaking, export, and bundle-size checks
* Packed-package validation through public ESM and CommonJS imports
* Examples for browser, Node ESM, Node CommonJS, custom grammars, and custom themes
* Complete documentation under `/docs`
