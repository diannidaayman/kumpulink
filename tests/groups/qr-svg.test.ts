import { describe, expect, it } from "vitest";
import { QR_PHYSICAL_SIZE, withPhysicalSize } from "@/lib/groups/qr-svg";

// Bentuk keluaran paket qrcode saat opsi width tidak diberikan: tanpa
// width, tanpa height, dengan viewBox.
const TANPA_UKURAN =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" shape-rendering="crispEdges"><path d="M0 0h33v33H0z"/></svg>';

const SUDAH_BERUKURAN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 33 33"><path d="M0 0h33v33H0z"/></svg>';

describe("QR_PHYSICAL_SIZE", () => {
  it("adalah 80mm", () => {
    expect(QR_PHYSICAL_SIZE).toBe("80mm");
  });
});

describe("withPhysicalSize", () => {
  it("memasang lebar dan tinggi dalam milimeter", () => {
    const hasil = withPhysicalSize(TANPA_UKURAN);
    expect(hasil).toContain('width="80mm"');
    expect(hasil).toContain('height="80mm"');
  });

  // viewBox adalah satu-satunya yang membuat SVG tetap dapat diskalakan.
  // Kehilangannya berarti QR yang dibesarkan menjadi poster ikut pecah.
  it("mempertahankan viewBox", () => {
    expect(withPhysicalSize(TANPA_UKURAN)).toContain('viewBox="0 0 33 33"');
  });

  it("mengganti ukuran piksel yang sudah ada, bukan menambah yang kedua", () => {
    const hasil = withPhysicalSize(SUDAH_BERUKURAN);
    expect(hasil).not.toContain('width="128"');
    expect(hasil).not.toContain('height="128"');
    expect(hasil.match(/width=/g)).toHaveLength(1);
    expect(hasil.match(/height=/g)).toHaveLength(1);
  });

  it("tidak menyentuh isi di dalam elemen", () => {
    expect(withPhysicalSize(TANPA_UKURAN)).toContain('<path d="M0 0h33v33H0z"/>');
  });

  // Keadaan yang tidak dikenali berarti MENOLAK, bukan mengembalikan
  // masukan apa adanya. QR tanpa ukuran yang lolos diam-diam akan
  // tertempel seukuran sembarang di dokumen orang.
  it("melempar bila masukannya bukan SVG", () => {
    expect(() => withPhysicalSize("bukan svg")).toThrow();
    expect(() => withPhysicalSize("")).toThrow();
  });
});
