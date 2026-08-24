import { describe, expect, it } from "vitest";
import { isRecordNotFoundError, isUniqueConstraintError } from "@/lib/db/prisma-errors";

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

describe("isRecordNotFoundError", () => {
  it("mengenali P2025", () => {
    expect(isRecordNotFoundError({ code: "P2025" })).toBe(true);
  });

  it.each([
    ["kode Prisma lain", { code: "P2002" }],
    ["objek tanpa kode", {}],
    ["null", null],
    ["undefined", undefined],
    ["string", "P2025"],
    ["Error biasa", new Error("gagal")],
  ])("menolak %s", (_label, value) => {
    expect(isRecordNotFoundError(value)).toBe(false);
  });
});
