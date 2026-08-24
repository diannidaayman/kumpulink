import { describe, expect, it } from "vitest";
import { isUniqueConstraintError } from "@/lib/db/prisma-errors";

describe("isUniqueConstraintError", () => {
  it("mengenali P2002", () => {
    expect(isUniqueConstraintError({ code: "P2002" })).toBe(true);
  });

  it.each([
    ["kode Prisma lain", { code: "P2025" }],
    ["objek tanpa kode", {}],
    ["null", null],
    ["undefined", undefined],
    ["string", "P2002"],
    ["Error biasa", new Error("gagal")],
  ])("menolak %s", (_label, value) => {
    expect(isUniqueConstraintError(value)).toBe(false);
  });
});
