export type YuirinxErrorCode =
  | "YUIRINX_INVALID_OPTION"
  | "YUIRINX_INVALID_GRAMMAR"
  | "YUIRINX_EMPTY_PATTERN"
  | "YUIRINX_DUPLICATE_LANGUAGE"
  | "YUIRINX_DUPLICATE_ALIAS"
  | "YUIRINX_DUPLICATE_THEME"
  | "YUIRINX_UNKNOWN_STATE"
  | "YUIRINX_INCLUDE_CYCLE"
  | "YUIRINX_STATE_DEPTH_EXCEEDED";

/** Configuration or tokenizer error produced by Yuirinx. */
export class YuirinxError extends Error {
  readonly code: YuirinxErrorCode;

  constructor(code: YuirinxErrorCode, message: string) {
    super(message);
    this.name = "YuirinxError";
    this.code = code;
  }
}
