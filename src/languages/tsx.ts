import { createEcmaGrammar } from "./shared/ecmascript.js";

/** TSX grammar. */
export const tsx = createEcmaGrammar({
  id: "tsx",
  aliases: ["typescriptreact"],
  typescript: true,
  jsx: true,
});
