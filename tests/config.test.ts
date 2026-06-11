import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { type Config, loadConfig } from "../src/config/load.js";

const baseConfig: Config = {
  output_columns: [
    { key: "id", header: "No." },
    { key: "title", header: "テスト項目" },
    { key: "viewpoint", header: "観点" },
  ],
  viewpoints: ["同値分割", "境界値分析"],
  naming: { id_prefix: "TC", id_digits: 4 },
  generation: {
    max_cases_per_feature: 10,
    language: "ja",
    model: "claude-sonnet-4-6",
  },
};

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "testerai-config-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writeConfig(content: unknown): string {
  const path = join(dir, "config.yaml");
  const yaml = toYaml(content);
  writeFileSync(path, yaml);
  return path;
}

function toYaml(obj: unknown): string {
  // テストでは依存を増やさないため、最小の YAML 直列化のみ。
  // baseConfig 程度の単純構造しか扱わない前提。
  return JSON.stringify(obj, null, 2);
}

describe("loadConfig", () => {
  it("有効な設定を読み込める", () => {
    const path = writeConfig(baseConfig);
    const config = loadConfig(path);
    expect(config.output_columns).toHaveLength(3);
    expect(config.viewpoints).toContain("同値分割");
  });

  it("viewpoint 列が無いと拒否する (差別化 #4 をコードで担保)", () => {
    const noViewpoint = {
      ...baseConfig,
      output_columns: [
        { key: "id", header: "No." },
        { key: "title", header: "テスト項目" },
      ],
    };
    const path = writeConfig(noViewpoint);
    expect(() => loadConfig(path)).toThrow(/viewpoint/);
  });

  it("output_columns が空だと拒否する", () => {
    const empty = { ...baseConfig, output_columns: [] };
    const path = writeConfig(empty);
    expect(() => loadConfig(path)).toThrow(/output_columns/);
  });

  it("viewpoints が空だと拒否する", () => {
    const empty = { ...baseConfig, viewpoints: [] };
    const path = writeConfig(empty);
    expect(() => loadConfig(path)).toThrow(/viewpoints/);
  });
});
