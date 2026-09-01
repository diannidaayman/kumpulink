import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  GALAT_PENCATATAN,
  JALUR_GALAT_PENCATATAN,
  JALUR_TIDAK_TERSEDIA,
  TIDAK_TERSEDIA,
  dokumenKeadaan,
  responsKeadaan,
} from "@/lib/public/keadaan";

/**
 * TEMUAN 28 Agustus 2026 sebagai pengujian merah, bukan kewaspadaan.
 *
 * Ketiga permukaan galat mengirim DOM kosong tanpa JavaScript: Next
 * 15.5 tidak merender UI notFound() maupun error boundary ke HTML pada
 * render dinamis, ia mengirimnya sebagai data RSC untuk klien. Pengunjung
 * yang aksesnya gagal dicatat karena itu tidak diberi tahu apa pun.
 *
 * Permukaan keadaan sekarang route handler yang mengirim badan responsnya
 * sendiri, sejalan dengan preseden 429 dan 503 di gerbang item. Pengujian
 * ini menjaga bahwa kalimatnya benar-benar HTML dan bukan payload skrip.
 */

function tanpaSkrip(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/g, "");
}

describe("dokumen permukaan keadaan", () => {
  it.each([TIDAK_TERSEDIA, GALAT_PENCATATAN])(
    "menaruh judul %s di HTML, bukan di dalam <script>",
    (pesan) => {
      expect(tanpaSkrip(dokumenKeadaan(pesan))).toContain(pesan.judul);
    },
  );

  it.each([TIDAK_TERSEDIA, GALAT_PENCATATAN])(
    "menaruh penjelasan %s di HTML, bukan di dalam <script>",
    (pesan) => {
      expect(tanpaSkrip(dokumenKeadaan(pesan))).toContain(pesan.penjelasan);
    },
  );

  it("mengirim dokumen HTML utuh berbahasa Indonesia", () => {
    const html = dokumenKeadaan(TIDAK_TERSEDIA);
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain('lang="id"');
  });

  /**
   * Kekosongan halaman tidak tersedia adalah fiturnya: tanpa nama group,
   * tanpa baris kembali, tanpa tautan ke /g/ mana pun. Semua keramahan
   * semacam itu membocorkan keberadaan group.
   */
  it("halaman tidak tersedia tidak memuat satu pun tautan", () => {
    expect(dokumenKeadaan(TIDAK_TERSEDIA)).not.toContain("<a ");
    expect(dokumenKeadaan(TIDAK_TERSEDIA)).not.toContain("href=");
  });

  it("menyandikan karakter HTML supaya kalimat tidak dapat menyuntik markup", () => {
    const html = dokumenKeadaan({
      judul: "<script>jahat()</script>",
      penjelasan: "a & b",
    });
    expect(tanpaSkrip(html)).toContain("&lt;script&gt;");
    expect(tanpaSkrip(html)).toContain("a &amp; b");
  });

  it("bekerja tanpa JavaScript: seluruh kalimat ada di luar <script>", () => {
    const teks = tanpaSkrip(dokumenKeadaan(GALAT_PENCATATAN));
    expect(teks).toContain(GALAT_PENCATATAN.judul);
    expect(teks).toContain(GALAT_PENCATATAN.penjelasan);
  });
});

describe("respons permukaan keadaan", () => {
  it("mengirim 404 untuk halaman tidak tersedia", async () => {
    const respons = responsKeadaan(TIDAK_TERSEDIA, 404);
    expect(respons.status).toBe(404);
    expect(respons.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await respons.text()).toContain(TIDAK_TERSEDIA.judul);
  });

  it("mengirim 500 untuk galat pencatatan — 200 untuk kegagalan adalah kebohongan yang terbaca mesin", async () => {
    const respons = responsKeadaan(GALAT_PENCATATAN, 500);
    expect(respons.status).toBe(500);
    expect(await respons.text()).toContain(GALAT_PENCATATAN.judul);
  });

  it("tidak pernah menyimpan permukaan keadaan di cache bersama", () => {
    expect(responsKeadaan(TIDAK_TERSEDIA, 404).headers.get("Cache-Control")).toContain(
      "no-store",
    );
  });
});

/**
 * Harga yang dibayar arah ini adalah kalimat yang bisa hidup di dua
 * tempat. Pengujian berikut menolak harga itu: tiap kalimat keadaan
 * hanya boleh ditulis SEKALI di seluruh repositori.
 */
describe("satu sumber kebenaran untuk kalimat keadaan", () => {
  const BERKAS = [
    "app/(public)/tidak-tersedia/route.ts",
    "app/(public)/galat-pencatatan/route.ts",
    "app/(public)/not-found.tsx",
    "app/(public)/error.tsx",
    "components/public/unavailable-page.tsx",
    "lib/public/keadaan.ts",
  ];

  it.each([
    TIDAK_TERSEDIA.judul,
    TIDAK_TERSEDIA.penjelasan,
    GALAT_PENCATATAN.judul,
    GALAT_PENCATATAN.penjelasan,
  ])("kalimat %s hanya ditulis di lib/public/keadaan.ts", (kalimat) => {
    const penulis = BERKAS.filter((berkas) => {
      try {
        return readFileSync(berkas, "utf8").includes(kalimat);
      } catch {
        return false;
      }
    });
    expect(penulis).toEqual(["lib/public/keadaan.ts"]);
  });
});

/**
 * Jebakan yang ditemukan saat memutuskan arah ini: bila /tidak-tersedia
 * mengirim HTML sungguhan sedangkan /g/[slug] yang ditolak tetap
 * memanggil notFound() dan tetap kosong, keduanya berhenti identik — dan
 * keidentikan itu adalah kriteria sukses nomor 5. Halaman group karena
 * itu WAJIB mengalihkan ke jalur yang sama, bukan merender penolakannya
 * sendiri.
 */
describe("halaman group yang ditolak bermuara di permukaan yang sama", () => {
  const sumber = readFileSync("app/(public)/g/[slug]/page.tsx", "utf8");
  // Komentar di berkas itu MENYEBUT notFound() untuk menjelaskan mengapa
  // ia ditinggalkan. Yang diperiksa adalah kodenya, bukan penjelasannya.
  const kode = sumber.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");

  it("tidak lagi memanggil notFound()", () => {
    expect(kode).not.toContain("notFound");
  });

  it("mengalihkan ke jalur tidak tersedia yang sama dengan gerbang item", () => {
    expect(sumber).toContain("JALUR_TIDAK_TERSEDIA");
  });

  it("mengalihkan ke jalur galat pencatatan ketika PAGE_VIEW gagal ditulis", () => {
    expect(sumber).toContain("JALUR_GALAT_PENCATATAN");
  });

  it("kedua jalur itu adalah rute yang benar-benar ada", () => {
    expect(JALUR_TIDAK_TERSEDIA).toBe("/tidak-tersedia");
    expect(JALUR_GALAT_PENCATATAN).toBe("/galat-pencatatan");
  });
});
