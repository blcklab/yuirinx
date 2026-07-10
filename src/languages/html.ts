import { createMarkupGrammar } from "./shared/markup.js";

/** HTML grammar. Embedded script/style bodies remain safely lexical/plain. */
export const html = createMarkupGrammar({ id: "html", aliases: ["htm"] });
