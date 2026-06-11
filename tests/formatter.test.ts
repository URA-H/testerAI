import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Config } from "../src/config/load.js";
import { writeXlsx } from "../src/formatter/xlsx.js";
import type { TestCase } from "../src/generator/claude.js";

const sampleCases: TestCase[] = [
  {
    id: "TC-0001",
    category: "ログイン",
    title: "正常系: 正しいパスワード",
    precondition: "ユーザー登録済み",
    steps: "1. IDとパスワード入力",
    expected: "ログイン成功",
    viewpoint: "同値分割",
    priority: "高",
  },
  {
    id: "TC-0002",
    category: "ログイン",
    title: "異常系: パスワード桁数超過",
    precondition: "ユーザー登録済み",
    steps: "1. 51文字のパスワード入力",
    expected: "桁数エラー表示",
    viewpoint: "境界値分析",
    priority: "中",
  },
];

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "testerai-fmt-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

async function readBack(path: string): Promise<{ headers: string[]; rows: string[][] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(path);
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("no sheet");

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell((cell) => headers.push(String(cell.value ?? "")));

  const rows: string[][] = [];
  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => cells.push(String(cell.value ?? "")));
    rows.push(cells);
  }
  return { headers, rows };
}

function makeConfig(columns: { key: string; header: string }[]): Config {
  return {
    output_columns: columns,
    viewpoints: ["同値分割", "境界値分析"],
    naming: { id_prefix: "TC", id_digits: 4 },
    generation: {
      max_cases_per_feature: 10,
      language: "ja",
      model: "claude-sonnet-4-6",
    },
  };
}

describe("writeXlsx", () => {
  it("config.output_columns のヘッダ名で列を作る (差別化 #3 をコードで担保)", async () => {
    const customConfig = makeConfig([
      { key: "id", header: "ケース番号" },
      { key: "title", header: "やること" },
      { key: "viewpoint", header: "テスト戦略" },
    ]);
    const out = join(dir, "out.xlsx");
    await writeXlsx(sampleCases, customConfig, out);
    const { headers } = await readBack(out);
    expect(headers).toEqual(["ケース番号", "やること", "テスト戦略"]);
  });

  it("出力列の順序を config に従って入れ替える", async () => {
    const reordered = makeConfig([
      { key: "viewpoint", header: "観点" },
      { key: "id", header: "No." },
      { key: "title", header: "テスト項目" },
    ]);
    const out = join(dir, "out.xlsx");
    await writeXlsx(sampleCases, reordered, out);
    const { headers, rows } = await readBack(out);
    expect(headers).toEqual(["観点", "No.", "テスト項目"]);
    expect(rows[0]).toEqual(["同値分割", "TC-0001", "正常系: 正しいパスワード"]);
  });

  it("viewpoint 列に観点の値を書き出す (差別化 #4 をコードで担保)", async () => {
    const config = makeConfig([
      { key: "id", header: "No." },
      { key: "viewpoint", header: "観点" },
    ]);
    const out = join(dir, "out.xlsx");
    await writeXlsx(sampleCases, config, out);
    const { rows } = await readBack(out);
    expect(rows.map((r) => r[1])).toEqual(["同値分割", "境界値分析"]);
  });
});
