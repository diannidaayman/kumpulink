import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = [join("components", "public"), join("app", "(public)", "g")];
const FORBIDDEN = ["targetUrl", "fileKey"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/**
 * Kriteria sukses nomor 3: HTML yang dikirim ke pengunjung tidak memuat
 * URL tujuan item mana pun dan tidak memuat alamat penyimpanan berkas
 * mana pun. Cara termurah menjaganya adalah memastikan berkas yang
 * merender tidak pernah menyebut nama kolomnya sama sekali.
 *
 * Route handler gerbang di app/(public)/g/[slug]/i/[itemId]/route.ts
 * MEMBACA keduanya dan tidak merender apa pun; ia dikecualikan.
 */
const ALLOWED = "app/(public)/g/[slug]/i/[itemId]/route.ts";

describe("batas kolom tujuan di permukaan yang dirender", () => {
  it.each(FORBIDDEN)("tidak ada berkas perender yang menyebut %s", (column) => {
    const offenders = ROOTS.flatMap(walk)
      .map((file) => file.split("\\").join("/"))
      .filter((file) => file !== ALLOWED)
      .filter((file) => readFileSync(file, "utf8").includes(column));

    expect(offenders).toEqual([]);
  });
});
