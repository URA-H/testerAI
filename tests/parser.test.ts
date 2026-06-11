import { describe, expect, it } from "vitest";
import { parseDocx } from "../src/parser/docx.js";

describe("parseDocx", () => {
  it.skip("converts .docx into markdown (requires sample fixture)", async () => {
    const result = await parseDocx("examples/sample-spec.docx");
    expect(result.markdown.length).toBeGreaterThan(0);
  });
});
