import type { Grammar } from "../core/types.js";

/** Plain text fallback grammar. */
export const plaintext: Grammar = {
  id: "plaintext",
  aliases: ["text", "txt", "plain"],
  states: { root: { rules: [{ type: "plain", pattern: /[\s\S]+/ }] } },
};
