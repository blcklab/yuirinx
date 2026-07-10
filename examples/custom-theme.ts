import { createHighlighter, type Theme } from "@blcklab/yuirinx";
import { javascript } from "@blcklab/yuirinx/lang/javascript";

const midnightInk: Theme = {
  id: "midnight-ink",
  name: "Midnight Ink",
  type: "dark",
  foreground: "#e6e9f2",
  background: "#090b12",
  tokens: {
    comment: { color: "#667085", fontStyle: "italic" },
    keyword: { color: "#ff7da8", fontWeight: "semibold" },
    string: { color: "#8bd6aa" },
    number: { color: "#f0bd73" },
    function: { color: "#70d5e7" },
    type: { color: "#c2a2f2" },
  },
};

const yuirinx = createHighlighter({
  languages: [javascript],
  themes: [midnightInk],
});
console.log(
  yuirinx.highlight("const answer = 42", {
    lang: "javascript",
    theme: "midnight-ink",
  }),
);
