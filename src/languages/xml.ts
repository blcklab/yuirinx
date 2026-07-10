import { createMarkupGrammar } from "./shared/markup.js";

/** XML grammar. */
export const xml = createMarkupGrammar({
  id: "xml",
  aliases: ["xhtml", "svg"],
});
