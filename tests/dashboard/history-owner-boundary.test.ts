import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  "app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx",
  "utf8",
);

/**
 * Layout dashboard memang memanggil requireOwner(), tetapi jaminan itu
 * TIDAK berlaku pada navigasi lunak antar segmen bersaudara — komentar di
 * app/(dashboard)/layout.tsx sudah menjelaskannya, dan halaman dashboard
 * memanggil gerbangnya sendiri karena alasan yang sama.
 */
describe("gerbang pemilik di halaman Riwayat", () => {
  it("memanggil requireOwner sendiri", () => {
    expect(SOURCE).toMatch(/await\s+requireOwner\s*\(/);
  });

  it("tidak memanggil evaluateAccess", () => {
    // Halaman ini tidak menyajikan konten apa pun, jadi ia bukan jalur
    // menuju konten. Memanggil evaluator di sini berarti seseorang
    // membuat halaman ini menyajikan sesuatu.
    expect(SOURCE).not.toContain("evaluateAccess");
    expect(SOURCE).not.toContain("evaluateItemAccess");
  });

  it("tidak membaca kolom yang dilarang invarian 3", () => {
    expect(SOURCE).not.toContain("targetUrl");
    expect(SOURCE).not.toContain("fileKey");
  });

  it("menandai dirinya sebagai halaman lebar", () => {
    expect(SOURCE).toContain("data-wide");
  });
});
