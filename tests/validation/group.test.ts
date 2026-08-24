import { describe, expect, it } from "vitest";
import { groupIdSchema, groupSlugSchema, groupTitleSchema, moveDirectionSchema } from "@/lib/validation/group";

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string {
  return result.error?.issues[0]?.message ?? "";
}

describe("groupTitleSchema", () => {
  it("menerima judul biasa", () => {
    expect(groupTitleSchema.safeParse("Rapat Kerja").success).toBe(true);
  });

  it.each([
    ["kosong", "", "Judul tidak boleh kosong."],
    ["spasi saja", "   ", "Judul tidak boleh kosong."],
    ["lebih dari 120 karakter", "a".repeat(121), "Judul maksimal 120 karakter."],
  ])("menolak judul %s", (_label, value, message) => {
    const result = groupTitleSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(message);
  });
});

describe("groupSlugSchema", () => {
  it.each([
    ["slug biasa", "rapat-kerja"],
    ["angka saja", "2026"],
    ["tiga karakter", "abc"],
    ["enam puluh karakter", "a".repeat(60)],
  ])("menerima %s", (_label, value) => {
    expect(groupSlugSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["kosong", "", "Slug tidak boleh kosong. Isi dengan huruf atau angka."],
    ["dua karakter", "ab", "Slug minimal 3 karakter."],
    ["lebih dari 60 karakter", "a".repeat(61), "Slug maksimal 60 karakter."],
    ["huruf besar", "Rapat-Kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["spasi", "rapat kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["tanda hubung di ujung", "rapat-", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
    ["tanda hubung berganda", "rapat--kerja", "Slug hanya boleh memuat huruf kecil, angka, dan tanda hubung."],
  ])("menolak slug %s dengan pesannya sendiri", (_label, value, message) => {
    const result = groupSlugSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe(message);
  });
});

describe("groupIdSchema", () => {
  it.each([
    ["id biasa", "clx123abc"],
    ["id dengan spasi di pinggir", "  clx123abc  "],
  ])("menerima %s", (_label, value) => {
    expect(groupIdSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["kosong", ""],
    ["spasi saja", "   "],
  ])("menolak id %s dengan pesan Group tidak ditemukan.", (_label, value) => {
    const result = groupIdSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toBe("Group tidak ditemukan.");
  });
});

describe("moveDirectionSchema", () => {
  it.each([
    ["up", "up"],
    ["down", "down"],
  ])("menerima %s", (_label, value) => {
    expect(moveDirectionSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ["string kosong", ""],
    ["nilai acak", "sideways"],
    ["huruf besar", "UP"],
    ["undefined", undefined],
    ["null", null],
  ])("menolak %s", (_label, value) => {
    expect(moveDirectionSchema.safeParse(value).success).toBe(false);
  });
});
