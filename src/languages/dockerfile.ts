import type { Grammar } from "../core/types.js";
import { whitespaceRule, words } from "./shared/helpers.js";

const INSTRUCTIONS = [
  "ADD",
  "ARG",
  "CMD",
  "COPY",
  "ENTRYPOINT",
  "ENV",
  "EXPOSE",
  "FROM",
  "HEALTHCHECK",
  "LABEL",
  "MAINTAINER",
  "ONBUILD",
  "RUN",
  "SHELL",
  "STOPSIGNAL",
  "USER",
  "VOLUME",
  "WORKDIR",
] as const;

/** Dockerfile grammar. */
export const dockerfile: Grammar = {
  id: "dockerfile",
  aliases: ["docker"],
  states: {
    root: {
      rules: [
        { type: "comment", pattern: /#[^\r\n]*/ },
        { type: "keyword", pattern: words(INSTRUCTIONS, "i") },
        { type: "variable", pattern: /\$(?:\{[^}\r\n]*}?|[A-Za-z_]\w*)/ },
        { type: "string", pattern: /"(?:\\.|[^"\\\r\n])*"?/ },
        { type: "string", pattern: /'(?:\\.|[^'\\\r\n])*'?/ },
        { type: "operator", pattern: /(?:&&|\|\||\\|=)/ },
        { type: "punctuation", pattern: /[()[\]{}:,]/ },
        { type: "constant", pattern: /--[a-z-]+/i },
        { type: "value", pattern: /[^\s#"'&|\\=()[\]{}:,]+/ },
        whitespaceRule,
      ],
    },
  },
};
