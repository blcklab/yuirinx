import { createEcmaGrammar } from "./shared/ecmascript.js";

/** JavaScript grammar. */
export const javascript = createEcmaGrammar({
  id: "javascript",
  aliases: ["js", "mjs", "cjs"],
});
