import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib", "tests"];
const ALLOWED = "lib/storage/blob.ts";

/**
 * Disusun dari potongan supaya nama paketnya TIDAK muncul utuh di berkas
 * ini. Kalau ditulis apa adanya, pengujian ini akan menemukan dirinya
 * sendiri dan gagal selamanya.
 */
const SDK = ["@vercel", "blob"].join("/");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe("batas impor SDK object storage", () => {
  it("hanya lib/storage/blob.ts yang mengimpor SDK Vercel Blob", () => {
    const offenders = ROOTS.flatMap(walk)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
      .filter((file) => readFileSync(file, "utf8").includes(SDK))
      .map((file) => file.split("\\").join("/"));

    expect(offenders).toEqual([ALLOWED]);
  });
});
