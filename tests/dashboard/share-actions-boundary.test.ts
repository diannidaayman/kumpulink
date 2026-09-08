import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/(dashboard)/dashboard/share-actions.ts", "utf8");

/**
 * Layout TIDAK melindungi server action: badan aksi berjalan sebelum
 * layout dirender ulang, sehingga tulisannya sudah terjadi sebelum
 * pengalihan sempat berlaku. Satu aksi yang lupa memanggil gerbangnya
 * sendiri adalah satu jalur menulis tanpa pemilik.
 */
describe("gerbang pemilik di share-actions.ts", () => {
  const segments = SOURCE.split("export async function").slice(1);

  it("menemukan kedua server action untuk diperiksa", () => {
    expect(segments).toHaveLength(2);
  });

  it.each(segments.map((segment) => [segment.split("(")[0].trim(), segment]))(
    "%s memanggil requireOwner()",
    (_name, segment) => {
      expect(segment).toContain("await requireOwner()");
    },
  );

  it("memanggil requireOwner sebelum menyentuh basis data", () => {
    for (const segment of segments) {
      const gate = segment.indexOf("await requireOwner()");
      const write = segment.search(/await (setShareEnabled|updateGroupSharing)\(/);
      expect(gate).toBeGreaterThanOrEqual(0);
      expect(write).toBeGreaterThan(gate);
    }
  });
});
