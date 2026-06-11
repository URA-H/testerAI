import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "../config/load.js";

export type TestCase = {
  id: string;
  category: string;
  title: string;
  precondition: string;
  steps: string;
  expected: string;
  viewpoint: string;
  priority: "高" | "中" | "低";
};

export type GenerateOptions = {
  specHtml: string;
  config: Config;
  apiKey: string;
};

/**
 * 設計書 Markdown からテストケース一覧を生成する。
 * - viewpoint 列を必ず埋めさせる (差別化 #4)
 * - config の viewpoints と max_cases_per_feature を厳守させる
 *
 * 注: 現状は MVP 雛形。実プロンプトと structured output 制御は次コミットで詰める。
 */
export async function generateTestCases(opts: GenerateOptions): Promise<TestCase[]> {
  const { specHtml, config, apiKey } = opts;
  const client = new Anthropic({ apiKey });

  const system = buildSystemPrompt(config);
  const user = buildUserPrompt(specHtml, config);

  const response = await client.messages.create({
    model: process.env.TESTERAI_MODEL ?? config.generation.model,
    max_tokens: 8192,
    system,
    messages: [{ role: "user", content: user }],
  });

  // TODO: structured output (tool use) で JSON 強制取得に置き換える
  const text = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === "text")
    .map((c) => c.text)
    .join("\n");

  return parseLLMOutput(text, config);
}

function buildSystemPrompt(config: Config): string {
  return [
    "あなたは公共系SIerのテスト設計に精通したQAリードです。",
    "提示された機能仕様書から、現場のレビューに耐えるテストケースを生成します。",
    "",
    "## 厳守事項",
    `1. 各ケースに「観点」を必ず付与する。観点は次から選ぶ: ${config.viewpoints.join(" / ")}`,
    `2. 1機能あたり最大 ${config.generation.max_cases_per_feature} 件まで`,
    "3. 同値分割・境界値分析・異常系のバランスを取る",
    "4. 公共系の慣習 (申請、決裁、住民、条例 等の語彙) を踏まえて記述する",
    "",
    "## 出力形式",
    "純粋なJSON配列のみを返す。前置き・後置き・コードフェンス禁止。",
    "各要素のキーは id, category, title, precondition, steps, expected, viewpoint, priority。",
    "priority は 高/中/低 のいずれか。",
  ].join("\n");
}

function buildUserPrompt(specHtml: string, config: Config): string {
  return [
    "## 設計書 (HTML)",
    specHtml,
    "",
    "## 指示",
    `上記設計書から、${config.generation.language === "ja" ? "日本語で" : ""}テストケースをJSON配列で生成してください。`,
    `IDは ${config.naming.id_prefix}-${"0".repeat(config.naming.id_digits)} 形式で連番。`,
  ].join("\n");
}

function parseLLMOutput(text: string, _config: Config): TestCase[] {
  const trimmed = text
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/```$/, "");
  try {
    const data = JSON.parse(trimmed) as TestCase[];
    if (!Array.isArray(data)) throw new Error("LLM did not return an array");
    return data;
  } catch (err) {
    throw new Error(`Failed to parse LLM output as JSON: ${(err as Error).message}`);
  }
}
