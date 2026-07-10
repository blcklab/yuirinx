import { createHighlighter } from "@blcklab/yuirinx";
import { typescript } from "@blcklab/yuirinx/lang/typescript";
import { yuirinxNoir } from "@blcklab/yuirinx/theme/yuirinx-noir";

const yuirinx = createHighlighter({
  languages: [typescript],
  themes: [yuirinxNoir],
});

const source = `interface User {
  readonly id: number
  name: string
}

const greet = (user: User) => \`Hello, \${user.name}!\``;

console.log(
  yuirinx.highlight(source, {
    lang: "typescript",
    theme: "yuirinx-noir",
  }),
);
