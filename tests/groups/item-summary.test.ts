import { describe, expect, it } from "vitest";

import { formatItemSummary, summarizeItems } from "@/lib/groups/item-summary";

describe("ringkasan item", () => {
  it("menghitung ketiga angkanya", () => {
    const summary = summarizeItems([
      { accessMode: "OPEN" },
      { accessMode: "OPEN" },
      { accessMode: "IDENTITY" },
      { accessMode: "IDENTITY" },
      { accessMode: "APPROVAL" },
    ]);
    expect(summary).toEqual({ total: 5, needsLogin: 2, needsApproval: 1 });
  });

  it("menyebut ketiganya bila ketiganya ada", () => {
    expect(
      formatItemSummary({ total: 8, needsLogin: 3, needsApproval: 2 }),
    ).toBe("8 item · 3 perlu masuk · 2 butuh persetujuan");
  });

  it("menghilangkan ruas yang bernilai nol, bukan menuliskannya", () => {
    expect(formatItemSummary({ total: 5, needsLogin: 0, needsApproval: 0 })).toBe("5 item");
    expect(formatItemSummary({ total: 5, needsLogin: 2, needsApproval: 0 })).toBe(
      "5 item · 2 perlu masuk",
    );
  });

  it("tetap menyebut jumlah total saat group tidak berisi item aktif", () => {
    expect(formatItemSummary(summarizeItems([]))).toBe("0 item");
  });
});
