import ExcelJS from "exceljs";
import type { Config } from "../config/load.js";
import type { TestCase } from "../generator/claude.js";

/**
 * テストケース配列を config に従って Excel に書き出す。
 * 列の順序・ヘッダ名は config.output_columns に従う (テンプレカスタマイズ = 差別化 #3)。
 */
export async function writeXlsx(
  cases: TestCase[],
  config: Config,
  outputPath: string,
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "testerAI";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("テストケース");

  sheet.columns = config.output_columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: defaultWidth(c.key),
  }));

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  for (const c of cases) {
    sheet.addRow(rowFromCase(c));
  }

  for (const row of sheet.getRows(2, sheet.rowCount) ?? []) {
    row.alignment = { vertical: "top", wrapText: true };
  }

  await workbook.xlsx.writeFile(outputPath);
}

function rowFromCase(c: TestCase): Record<string, string> {
  return {
    id: c.id,
    category: c.category,
    title: c.title,
    precondition: c.precondition,
    steps: c.steps,
    expected: c.expected,
    viewpoint: c.viewpoint,
    priority: c.priority,
    result: "",
  };
}

function defaultWidth(key: string): number {
  switch (key) {
    case "id":
    case "priority":
    case "viewpoint":
      return 12;
    case "category":
      return 18;
    case "title":
      return 30;
    case "steps":
    case "expected":
    case "precondition":
      return 40;
    case "result":
      return 16;
    default:
      return 20;
  }
}
