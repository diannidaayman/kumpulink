import { describe, expect, it } from "vitest";
import { resolveRole } from "@/lib/auth/role";

const OWNER_ADDRESS = "pemilik@contoh.com";

describe("resolveRole", () => {
  it("memberi OWNER pada alamat yang sama persis", () => {
    expect(resolveRole("pemilik@contoh.com", OWNER_ADDRESS)).toBe("OWNER");
  });

  // K9 — OWNER_EMAIL diketik tangan ke .env.local sedangkan alamatnya
  // datang dari Google. Beda huruf kapital mengunci pemilik di luar
  // dashboardnya sendiri, tanpa antarmuka untuk memperbaikinya.
  it.each([
    ["huruf besar di awal", "Pemilik@contoh.com"],
    ["huruf besar seluruhnya", "PEMILIK@CONTOH.COM"],
    ["spasi di depan", "  pemilik@contoh.com"],
    ["spasi di belakang", "pemilik@contoh.com  "],
  ])("memberi OWNER meski %s", (_label, email) => {
    expect(resolveRole(email, OWNER_ADDRESS)).toBe("OWNER");
  });

  it("memberi OWNER meski OWNER_EMAIL sendiri yang berbeda huruf besar-kecil", () => {
    expect(resolveRole("pemilik@contoh.com", "PeMiLiK@Contoh.Com")).toBe("OWNER");
  });

  it.each([
    ["alamat lain", "orang@contoh.com"],
    ["domain lain", "pemilik@lain.com"],
    ["subalamat plus", "pemilik+tag@contoh.com"],
  ])("memberi VIEWER pada %s", (_label, email) => {
    expect(resolveRole(email, OWNER_ADDRESS)).toBe("VIEWER");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["string kosong", ""],
  ])("memberi VIEWER ketika email %s", (_label, email) => {
    expect(resolveRole(email, OWNER_ADDRESS)).toBe("VIEWER");
  });
});
