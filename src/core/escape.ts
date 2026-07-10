const HTML_ESCAPE_RE = /[&<>"']/g;

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for safe HTML text or quoted attribute insertion. */
export function escapeHtml(value: string): string {
  return value.replace(
    HTML_ESCAPE_RE,
    (character) => HTML_ENTITIES[character] ?? character,
  );
}
