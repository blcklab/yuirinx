import { createEcmaGrammar } from "./shared/ecmascript.js";

/** JSX grammar. */
export const jsx = createEcmaGrammar({
  id: "jsx",
  aliases: ["react"],
  jsx: true,
});
