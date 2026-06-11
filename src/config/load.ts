import { readFileSync } from "node:fs";
import { parse } from "yaml";

export type OutputColumn = {
  key: string;
  header: string;
};

export type Config = {
  output_columns: OutputColumn[];
  viewpoints: string[];
  naming: {
    id_prefix: string;
    id_digits: number;
  };
  generation: {
    max_cases_per_feature: number;
    language: string;
    model: string;
  };
};

export function loadConfig(path: string): Config {
  const raw = readFileSync(path, "utf-8");
  const parsed = parse(raw) as Config;
  validate(parsed);
  return parsed;
}

function validate(config: Config): void {
  if (!Array.isArray(config.output_columns) || config.output_columns.length === 0) {
    throw new Error("config.output_columns must be a non-empty array");
  }
  const hasViewpoint = config.output_columns.some((c) => c.key === "viewpoint");
  if (!hasViewpoint) {
    throw new Error(
      'config.output_columns must include a "viewpoint" column (testerAI requires per-case rationale).',
    );
  }
  if (!Array.isArray(config.viewpoints) || config.viewpoints.length === 0) {
    throw new Error("config.viewpoints must be a non-empty array");
  }
}
