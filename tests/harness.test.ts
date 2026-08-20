import { describe, expect, it } from "vitest";

describe("harness pengujian", () => {
  it("menjalankan berkas TypeScript tanpa langkah transformasi tambahan", () => {
    const value: number = 1 + 1;
    expect(value).toBe(2);
  });
});
