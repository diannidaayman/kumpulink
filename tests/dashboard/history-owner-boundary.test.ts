import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync(
  "app/(dashboard)/dashboard/groups/[groupId]/riwayat/page.tsx",
  "utf8",
);
// Komentar boleh menyebut kata "redirect" atau "kanonik" dalam prosa;
// hanya kode yang dilarang menghilang tanpa membuat pengujian merah.
// Dibuang dulu supaya asersi di bawah menguji kode, bukan komentar yang
// bisa saja tertinggal sendirian setelah baris kodenya dihapus.
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

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

  it("meluruskan alamat ke bentuk kanonik saat parameter tidak sah", () => {
    // Tanpa perbandingan ini, alamat dengan parameter tidak sah tetap
    // tertulis di bilah alamat sementara halaman diam-diam menampilkan
    // hasil yang sudah dibersihkan — alamat dan isi layar bercerita
    // berbeda, padahal itulah yang dilarang komentar di atas kode ini.
    expect(CODE).toMatch(
      /if\s*\(\s*givenQueryString\(raw\)\s*!==\s*historyQueryString\(query\)\s*\)\s*\{\s*redirect\(historyHref\(groupId,\s*query\)\)/,
    );
  });

  it("membuang nilai ?item= yang tidak cocok dengan itemOptions", () => {
    // Perilaku ini lahir dari cacat yang ditemukan review task sebelumnya:
    // tanpa pemeriksaan ini, id item yang sudah tidak ada di itemOptions
    // (misalnya itemnya sudah dihapus) tetap lolos sebagai penyaring.
    // <select> penyaring lalu tidak menampilkan pilihan apa pun karena
    // tidak ada opsi yang cocok dengan nilainya, sementara tabel di
    // bawahnya tetap disaring oleh id itu — kontrol dan isi tabel
    // bercerita berbeda.
    expect(CODE).toMatch(
      /if\s*\(\s*query\.item\s*!==\s*null\s*&&\s*!itemOptions\.some\(\s*\(option\)\s*=>\s*option\.value\s*===\s*query\.item\s*\)\s*\)\s*\{\s*redirect\(historyHref\(groupId,\s*\{\s*\.\.\.query,\s*item:\s*null,\s*page:\s*1\s*\}\)\)/,
    );
  });

  it("menjepit ?hal= di luar jangkauan ke halaman hasil buildPagination", () => {
    // Tanpa penjepitan ini, ?hal=999 pada hasil yang hanya punya dua
    // halaman akan lolos apa adanya: tabel kosong ditampilkan sementara
    // alamat tetap mengaku halaman 999, dan HistoryPaginationBar yang
    // dibangun dari pagination.page tidak akan pernah cocok dengan itu.
    expect(CODE).toMatch(
      /if\s*\(\s*pagination\.page\s*!==\s*query\.page\s*\)\s*\{\s*redirect\(historyHref\(groupId,\s*\{\s*\.\.\.query,\s*page:\s*pagination\.page\s*\}\)\)/,
    );
  });
});
