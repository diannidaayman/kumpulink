import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { RANDOM_SLUG_ALPHABET, RANDOM_SLUG_LENGTH, randomSlug } from "@/lib/groups/random-slug";

describe("randomSlug", () => {
  it("selalu sepanjang RANDOM_SLUG_LENGTH", () => {
    for (let i = 0; i < 200; i += 1) {
      expect(randomSlug()).toHaveLength(RANDOM_SLUG_LENGTH);
    }
  });

  it("hanya memakai karakter dari abjadnya", () => {
    const allowed = new Set(RANDOM_SLUG_ALPHABET.split(""));
    for (let i = 0; i < 200; i += 1) {
      for (const char of randomSlug()) {
        expect(allowed.has(char)).toBe(true);
      }
    }
  });

  // Abjadnya berukuran 32 supaya 256 habis dibagi rata. Sisa pembagian
  // pada ukuran lain membuat sebagian karakter lebih sering muncul.
  it("memakai abjad 32 karakter tanpa karakter kembar rupa", () => {
    expect(RANDOM_SLUG_ALPHABET).toHaveLength(32);
    expect(new Set(RANDOM_SLUG_ALPHABET.split("")).size).toBe(32);
    for (const ambiguous of ["0", "1", "i", "l", "O"]) {
      expect(RANDOM_SLUG_ALPHABET).not.toContain(ambiguous);
    }
  });

  it("tidak mengulang nilai dalam seribu penarikan", () => {
    const drawn = new Set<string>();
    for (let i = 0; i < 1000; i += 1) drawn.add(randomSlug());
    expect(drawn.size).toBe(1000);
  });

  // Penjaga regresi atas code-standards.md bagian Security Practices:
  // "Slug acak dibuat dari sumber acak kriptografis, bukan Math.random()".
  it("mengambil keacakan dari node:crypto, bukan Math.random", () => {
    const source = readFileSync("lib/groups/random-slug.ts", "utf8");
    expect(source).toContain("node:crypto");
    expect(source).not.toContain("Math.random");
  });
});
