const { createHighlighter } = require("@blcklab/yuirinx");
const { json } = require("@blcklab/yuirinx/lang/json");
const { yuirinxPearl } = require("@blcklab/yuirinx/theme/yuirinx-pearl");

const yuirinx = createHighlighter({
  languages: [json],
  themes: [yuirinxPearl],
});

console.log(
  yuirinx.highlight('{"name":"Yuirinx","safe":"<script>"}', {
    lang: "json",
    theme: "yuirinx-pearl",
  }),
);
