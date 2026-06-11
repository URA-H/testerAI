import { readFile } from "node:fs/promises";
import mammoth from "mammoth";

export type ParsedSpec = {
  /**
   * HTML 表現の本文。LLM への入力に使う。
   * 見出し階層 (h1/h2/...) と表 (<table>) が保持される。
   */
  html: string;
  /** mammoth が報告した警告 (画像未対応等)。 */
  warnings: string[];
};

/**
 * .docx ファイルを HTML に変換する。
 * LLM が表構造・見出し階層を理解できるよう、構造保持を優先する。
 */
export async function parseDocx(path: string): Promise<ParsedSpec> {
  const buffer = await readFile(path);
  const result = await mammoth.convertToHtml({ buffer });
  return {
    html: result.value,
    warnings: result.messages.map((m: { message: string }) => m.message),
  };
}
