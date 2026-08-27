import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib"];
const ALLOWED = "lib/audit/log-access.ts";

/**
 * Disusun dari potongan supaya namanya TIDAK muncul utuh di berkas ini.
 * Kalau ditulis apa adanya, pengujian ini akan menemukan dirinya sendiri
 * dan gagal selamanya. Pola yang sama dengan blob-import-boundary.test.ts.
 */
const TABLE_ACCESS = ["prisma.access", "Log"].join("");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("batas penulisan AccessLog", () => {
  it("hanya lib/audit/log-access.ts yang menyentuh tabel AccessLog", () => {
    const offenders = ROOTS.flatMap(walk)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) => readFileSync(file, "utf8").includes(TABLE_ACCESS))
      .map((file) => file.split("\\").join("/"));

    expect(offenders).toEqual([ALLOWED]);
  });
});
