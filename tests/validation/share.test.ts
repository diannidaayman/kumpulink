import { describe, expect, it } from "vitest";
import {
  shareEnabledSchema,
  shareSettingsSchema,
  visibilitySchema,
} from "@/lib/validation/share";

describe("visibilitySchema", () => {
  it.each(["PRIVATE", "REQUIRE_LOGIN", "PUBLIC"])("menerima %s", (value) => {
    expect(visibilitySchema.safeParse(value).success).toBe(true);
  });

  // Keadaan yang tidak pasti berarti MENOLAK. Nilai karangan tidak boleh
  // lolos menjadi tulisan basis data.
  it.each(["OPEN", "public", "", "SEMUA_ORANG"])("menolak %s", (value) => {
    expect(visibilitySchema.safeParse(value).success).toBe(false);
  });
});

describe("shareSettingsSchema", () => {
  it("menerima tanggal kosong sebagai tanpa batas waktu", () => {
    const parsed = shareSettingsSchema.safeParse({ visibility: "PUBLIC", expiresOn: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.expiresOn).toBe("");
  });

  it("menerima tanggal yang benar", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "REQUIRE_LOGIN",
      expiresOn: "2026-09-30",
    });
    expect(parsed.success).toBe(true);
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "PUBLIC",
      expiresOn: "2026-02-31",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe("Tanggal kedaluwarsa tidak ada di kalender.");
    }
  });

  it("menolak bentuk tanggal yang tidak dikenali", () => {
    const parsed = shareSettingsSchema.safeParse({
      visibility: "PUBLIC",
      expiresOn: "30 September 2026",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe("Tanggal kedaluwarsa tidak dikenali.");
    }
  });

  it("menolak nilai null yang datang dari FormData kosong", () => {
    expect(shareSettingsSchema.safeParse({ visibility: null, expiresOn: "" }).success).toBe(false);
  });
});

describe("shareEnabledSchema", () => {
  it("mengubah string menjadi boolean", () => {
    expect(shareEnabledSchema.parse("true")).toBe(true);
    expect(shareEnabledSchema.parse("false")).toBe(false);
  });

  // Bukan "selain 'true' berarti false": nilai yang tidak dikenali harus
  // membatalkan penulisan, bukan diam-diam mematikan link orang.
  it.each(["1", "on", "", "TRUE"])("menolak %s alih-alih menebak", (value) => {
    expect(shareEnabledSchema.safeParse(value).success).toBe(false);
  });
});
