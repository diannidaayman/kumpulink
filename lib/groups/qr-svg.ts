/**
 * Ukuran fisik pada berkas QR. Keputusan U5-9.
 *
 * Jarak pindai kira-kira SEPULUH KALI lebar QR, jadi 80 mm terbaca dari
 * sekitar 80 cm — jarak orang membaca kertas yang dipegang atau
 * tergeletak di meja rapat. Karena SVG tetap vektor, angka ini hanya
 * menentukan ukuran BAWAAN saat ditempel; membesarkannya menjadi poster
 * tidak merusak apa pun.
 */
export const QR_PHYSICAL_SIZE = "80mm";

const OPENING_TAG = /^<svg\b[^>]*>/;
const PIXEL_SIZE_ATTRS = /\s(?:width|height)="[^"]*"/g;

/**
 * Memasang ukuran fisik pada tag pembuka dan MEMPERTAHANKAN viewBox.
 * Melempar bila masukannya tidak dikenali: keluaran yang lolos tanpa
 * ukuran akan tertempel seukuran sembarang di dokumen orang, dan itu
 * kegagalan yang baru terlihat setelah dicetak.
 */
export function withPhysicalSize(svg: string): string {
  const match = OPENING_TAG.exec(svg);
  if (match === null) {
    throw new Error("Keluaran QR bukan SVG yang dikenali.");
  }

  const sized = match[0]
    .replace(PIXEL_SIZE_ATTRS, "")
    .replace(/^<svg/, `<svg width="${QR_PHYSICAL_SIZE}" height="${QR_PHYSICAL_SIZE}"`);

  return sized + svg.slice(match[0].length);
}
