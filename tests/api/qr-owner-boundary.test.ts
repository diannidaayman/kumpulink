import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/api/groups/[groupId]/qr/route.ts", "utf8");

/**
 * Route handler tidak pernah dibungkus layout, sehingga gerbangnya harus
 * berdiri di dalam berkas ini. Ia juga harus berdiri SEBELUM QR dibuat:
 * membuat QR lebih dulu berarti alamat berbagi sudah tersusun di memori
 * sebuah permintaan yang seharusnya ditolak.
 */
describe("gerbang pemilik di route QR", () => {
  it("memakai getOwnerSession, bukan requireOwner", () => {
    // requireOwner mengalihkan, dan <img> mengikuti pengalihan diam-diam:
    // hasilnya 200 berisi halaman masuk, bukan kegagalan yang terbaca.
    //
    // Yang dicari adalah PANGGILAN `await requireOwner(`, bukan kata
    // "requireOwner" di mana pun — komentar berkas itu menyebut namanya
    // untuk menjelaskan kenapa ia justru tidak dipakai.
    expect(SOURCE).toContain("await getOwnerSession()");
    expect(SOURCE).not.toMatch(/await\s+requireOwner\s*\(/);
  });

  it("menempatkan gerbang sebelum QR dibuat", () => {
    // Jangkarkan ke (await getOwnerSession()), bukan getOwnerSession() saja.
    // Identifier tanpa await juga muncul di JSDoc berkas untuk menjelaskan
    // kenapa ia tidak dipakai; itu akan menemukan komentar, bukan panggilan.
    // Anchor ini hanya muncul di call site — gagal jelas jika nama dirubah.
    const gate = SOURCE.indexOf("(await getOwnerSession())");
    const render = SOURCE.indexOf("QRCode.toString");
    expect(gate).toBeGreaterThanOrEqual(0);
    expect(render).toBeGreaterThan(gate);
  });

  it("dirender dinamis dan tidak pernah di-cache", () => {
    expect(SOURCE).toContain(`export const dynamic = "force-dynamic"`);
    expect(SOURCE).toContain("no-store");
  });
});
