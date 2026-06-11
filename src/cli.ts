#!/usr/bin/env node
import { resolve } from "node:path";
import { Command } from "commander";
import { config as loadEnv } from "dotenv";
import { loadConfig } from "./config/load.js";
import { writeXlsx } from "./formatter/xlsx.js";
import { generateTestCases } from "./generator/claude.js";
import { parseDocx } from "./parser/docx.js";

loadEnv();

const program = new Command();

program
  .name("testerai")
  .description("Generate test cases from Japanese functional spec documents (.docx) into Excel.")
  .version("0.0.1");

program
  .command("generate")
  .description("設計書からテストケースExcelを生成する")
  .argument("<input>", "入力する設計書 (.docx)")
  .option("-c, --config <path>", "設定ファイル (yaml)", "config.yaml")
  .option("-o, --output <path>", "出力Excel (.xlsx)", "testcases.xlsx")
  .action(async (input: string, options: { config: string; output: string }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[testerai] ANTHROPIC_API_KEY が設定されていません。.env を確認してください。");
      process.exit(1);
    }

    const inputPath = resolve(input);
    const configPath = resolve(options.config);
    const outputPath = resolve(options.output);

    console.error(`[testerai] 設計書を読み込み中: ${inputPath}`);
    const spec = await parseDocx(inputPath);
    if (spec.warnings.length > 0) {
      console.error(`[testerai] パース警告 ${spec.warnings.length} 件 (例: ${spec.warnings[0]})`);
    }

    console.error(`[testerai] 設定読込: ${configPath}`);
    const config = loadConfig(configPath);

    console.error("[testerai] テストケース生成中 (LLM呼び出し)...");
    const cases = await generateTestCases({
      specHtml: spec.html,
      config,
      apiKey,
    });

    console.error(`[testerai] ${cases.length} 件生成。Excel書き出し: ${outputPath}`);
    await writeXlsx(cases, config, outputPath);

    console.error("[testerai] 完了。");
  });

program.parseAsync().catch((err) => {
  console.error(`[testerai] エラー: ${(err as Error).message}`);
  process.exit(1);
});
