import { createCssGrammar } from "./shared/css.js";

/** SCSS grammar. */
export const scss = createCssGrammar({
  id: "scss",
  aliases: ["sass"],
  scss: true,
});
