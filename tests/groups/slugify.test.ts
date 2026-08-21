import { describe, expect, it } from "vitest";
import { MAX_SLUG_LENGTH, normalizeSlugInput, slugify } from "@/lib/groups/slugify";

describe("slugify", () => {
  it.each([
    ["judul biasa", "Rapat Kerja 2026", "rapat-kerja-2026"],
    ["titik dua dan ampersand", "Rapat Kerja: Sesi I & II", "rapat-kerja-sesi-i-ii"],
    ["tanda kurung", "Anggaran (Draf)", "anggaran-draf"],
    ["persen", "50% Selesai", "50-selesai"],
    ["spasi berlebih", "  Rapat   Kerja  ", "rapat-kerja"],
    ["diakritik", "Café Ramah", "cafe-ramah"],
    ["angka saja", "2026", "2026"],
  ])("mengubah %s", (_label, title, expected) => {
    expect(slugify(title)).toBe(expected);
  });

  // Apostrof sengaja DIHAPUS tanpa sisa, tidak diganti tanda hubung:
  // "qur-an" tidak terbaca, "quran" wajar.
  it.each([
    ["apostrof lurus", "Kajian Qur'an", "kajian-quran"],
    ["apostrof melengkung", "Kajian Qur’an", "kajian-quran"],
  ])("menghapus %s tanpa sisa", (_label, title, expected) => {
    expect(slugify(title)).toBe(expected);
  });

  it.each([
    ["emoji saja", "\u{1F389}\u{1F389}"],
    ["tanda baca saja", "---"],
    ["string kosong", ""],
    ["spasi saja", "   "],
  ])("mengembalikan string kosong untuk %s", (_label, title) => {
    expect(slugify(title)).toBe("");
  });

  it("memotong di batas tanda hubung, tidak di tengah kata", () => {
    const result = slugify("Rapat ".repeat(11));
    expect(result).toBe(Array(10).fill("rapat").join("-"));
    expect(result.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expect(result.endsWith("-")).toBe(false);
  });

  it("memotong keras bila tidak ada tanda hubung sebelum batas", () => {
    const result = slugify("a".repeat(80));
    expect(result).toBe("a".repeat(MAX_SLUG_LENGTH));
  });
});

describe("normalizeSlugInput", () => {
  // Ketikan yang BELUM selesai. Memangkas tanda hubung di ujung akan
  // membuat pemilik mustahil mengetik "rapat-kerja" — hurufnya hilang
  // seketika setelah ia menekan tanda hubung.
  it("mempertahankan satu tanda hubung di ujung", () => {
    expect(normalizeSlugInput("rapat-")).toBe("rapat-");
  });

  it("menciutkan tanda hubung berganda", () => {
    expect(normalizeSlugInput("rapat--kerja")).toBe("rapat-kerja");
  });

  it("membuang tanda hubung di awal", () => {
    expect(normalizeSlugInput("-rapat")).toBe("rapat");
  });

  it.each([
    ["huruf besar", "Rapat", "rapat"],
    ["spasi", "rapat kerja", "rapat-kerja"],
    ["diakritik", "café", "cafe"],
    ["apostrof", "qur'an", "quran"],
    ["karakter tak sah", "rapat@kerja", "rapat-kerja"],
  ])("menormalkan %s saat mengetik", (_label, typed, expected) => {
    expect(normalizeSlugInput(typed)).toBe(expected);
  });

  it("tidak pernah melewati batas panjang", () => {
    expect(normalizeSlugInput("a".repeat(80))).toHaveLength(MAX_SLUG_LENGTH);
  });
});
