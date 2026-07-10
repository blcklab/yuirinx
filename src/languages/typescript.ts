import { createEcmaGrammar } from "./shared/ecmascript.js";

/** TypeScript grammar. */
export const typescript = createEcmaGrammar({
  id: "typescript",
  aliases: ["ts", "mts", "cts"],
  typescript: true,
});
