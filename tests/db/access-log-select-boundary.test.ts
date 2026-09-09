import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("lib/db/access-logs.ts", "utf8");
// Komentar boleh menyebut nama kolomnya terang-terangan; hanya kode yang
// dilarang menyentuhnya. Dibuang dulu supaya asersi menguji kode, bukan
// prosa yang menjelaskan garis merahnya.
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

/**
 * Lapis ketiga dari bukti bahwa riwayat dibaca dari kolom salinan.
 *
 * Dua lapis sebelumnya menguji perilaku hari ini; lapis ini menjaga hari
 * esok. Join ke tabel User yang ditambahkan kelak "supaya namanya selalu
 * terbaru" akan membuat berkas ini merah di CI sebelum sempat berjalan
 * satu kali pun. Preseden: tests/db/public-select-boundary.test.ts.
 */
describe("batas pembacaan riwayat", () => {
  it("tidak pernah memakai include", () => {
    // AccessLog memang tidak punya relasi Prisma sama sekali — foreign
    // key-nya sengaja ditiadakan supaya menghapus group tidak ikut
    // menghapus riwayatnya. `include` di sini berarti seseorang
    // menambahkan relasi itu kembali.
    expect(SOURCE).not.toMatch(/\binclude\s*:/);
  });

  it("tidak pernah mengueri tabel User", () => {
    expect(SOURCE).not.toContain("prisma.user");
  });

  it("tidak membaca kolom userId", () => {
    // Membacanya tidak salah dengan sendirinya, tetapi ia satu-satunya
    // jembatan menuju tabel User dan tidak dipakai satu pun kolom layar.
    expect(CODE).not.toMatch(/\buserId\b/);
  });

  it("membaca kedua kolom salinan identitas", () => {
    expect(SOURCE).toContain("visitorName: true");
    expect(SOURCE).toContain("visitorEmail: true");
  });

  it("tidak pernah membaca kolom yang dilarang invarian 3", () => {
    expect(SOURCE).not.toContain("targetUrl");
    expect(SOURCE).not.toContain("fileKey");
  });
});
