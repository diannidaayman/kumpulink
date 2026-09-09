import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib"];
// lib/audit/log-access.ts menulis baris riwayat; lib/db/access-logs.ts
// (Unit 6) membacanya untuk halaman Riwayat Akses. Tidak ada berkas lain
// yang berhak menyentuh tabel ini.
//
// Peran penulis dan pembaca dipisah menjadi dua daftar, bukan digabung
// menjadi satu ALLOWED: menggabungkannya berarti berkas pembaca boleh
// melakukan operasi apa pun pada tabel, termasuk menulis, dan penjaga
// itu tidak akan pernah menangkapnya.
const WRITERS = ["lib/audit/log-access.ts"];
const READERS = ["lib/db/access-logs.ts"];
const ALLOWED = [...WRITERS, ...READERS];
const WRITE_OPS = /\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\b/;

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

describe("batas penulisan dan pembacaan AccessLog", () => {
  const offenders = ROOTS.flatMap(walk)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .filter((file) => readFileSync(file, "utf8").includes(TABLE_ACCESS))
    .map((file) => file.split("\\").join("/"));

  it("hanya berkas terdaftar yang menyentuh tabel AccessLog", () => {
    expect([...offenders].sort()).toEqual([...ALLOWED].sort());
  });

  it("berkas pembaca tidak pernah menulis ke tabel AccessLog", () => {
    for (const file of READERS) {
      const source = readFileSync(file, "utf8");
      for (const m of source.matchAll(new RegExp(`${TABLE_ACCESS}\\s*\\.\\s*\\w+`, "g"))) {
        expect(m[0]).not.toMatch(WRITE_OPS);
      }
    }
  });
});
