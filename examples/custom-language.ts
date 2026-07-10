import { createHighlighter, type Grammar } from "@blcklab/yuirinx";

const mini: Grammar = {
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

const yuirinx = createHighlighter({ languages: [mini] });
console.log(yuirinx.tokenize("let answer = 42", "mn"));
