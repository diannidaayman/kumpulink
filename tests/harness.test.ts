import { describe, expect, it } from "vitest";

describe("harness pengujian", () => {
  it("menjalankan berkas TypeScript tanpa langkah transformasi tambahan", () => {
    const nilai: number = 1 + 1;
    expect(nilai).toBe(2);
  });
});
