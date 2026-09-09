import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SOURCE = readFileSync("app/(dashboard)/layout.tsx", "utf8");

/**
 * Keputusan U6-3. Bilah atas dan <main> bersaudara, sehingga bilah tidak
 * dapat membaca lebar yang disetel halaman di bawahnya. Penanda data-wide
 * yang dibaca varian group-has-* menyelesaikannya tanpa satu pun komponen
 * klien di layout yang sekarang seluruhnya server.
 */
describe("lebar shell dashboard", () => {
  it("memberi pembungkus terluar nama group/shell", () => {
    // Dijangkarkan ke peran strukturalnya — div yang anak langsungnya
    // <header> — bukan ke urutan tekstual atau div pertama yang kebetulan
    // muncul. Urutan tekstual bisa berubah tanpa kesalahan (misalnya
    // penambahan spanduk atau pembungkus <Suspense>), dan pengujian akan
    // diam-diam mencocokkan elemen salah sambil tetap hijau.
    const outer = SOURCE.match(/<div className="([^"]*)">\s*<header/);
    expect(outer).not.toBeNull();
    expect(outer![1]).toContain("group/shell");
  });

  it("melebarkan <main> ketika halaman menandai dirinya lebar", () => {
    // Dijangkarkan ke elemennya, BUKAN ke hitungan kemunculan teks.
    // Hitungan akan merah karena penambahan sah yang tidak berhubungan,
    // dan yang memperbaikinya kelak harus menebak kenapa angkanya 2.
    const main = SOURCE.match(/<main[^>]*className="([^"]*)"/);
    expect(main).not.toBeNull();
    expect(main![1]).toContain("max-w-4xl");
    expect(main![1]).toContain("group-has-[[data-wide]]/shell:max-w-6xl");
  });

  it("melebarkan container bilah atas dengan aturan yang sama", () => {
    // Tepi kiri nama aplikasi harus lurus dengan isi di bawahnya, jadi
    // container di dalam <header> memikul kedua kelas yang sama.
    const header = SOURCE.match(/<header[\s\S]*?<div className="([^"]*)"/);
    expect(header).not.toBeNull();
    expect(header![1]).toContain("max-w-4xl");
    expect(header![1]).toContain("group-has-[[data-wide]]/shell:max-w-6xl");
  });

  it("tidak memakai komponen klien untuk memilih lebarnya", () => {
    expect(SOURCE).not.toContain("use client");
    expect(SOURCE).not.toContain("usePathname");
  });
});
