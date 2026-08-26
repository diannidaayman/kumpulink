import type { ItemType } from "@prisma/client";

/**
 * Daftar PUTIH, bukan daftar hitam. Menambah tipe baru berarti menambah
 * satu baris di sini beserta tanda tangannya di bawah; apa pun yang tidak
 * cocok dengan salah satunya menghasilkan null, dan null berarti tolak.
 * Cabang terakhir fungsi ini tidak pernah meloloskan apa pun.
 *
 * SVG sengaja TIDAK ada di daftar ini: ia dokumen yang dapat menjalankan
 * skrip, bukan sekadar gambar.
 */
export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

const EXTENSIONS: Record<AcceptedMimeType, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP = [0x57, 0x45, 0x42, 0x50];

function matchesAt(bytes: Uint8Array, signature: readonly number[], offset: number): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

/**
 * Membaca tipe berkas dari ISINYA. Nama berkas dan Content-Type kiriman
 * peramban tidak pernah sampai ke sini, karena keduanya dikendalikan
 * pengunggah dan karena itu bukan bukti apa pun.
 *
 * Penanda wajib duduk TEPAT di offset yang ditentukan. Sebagian pembaca
 * PDF memaafkan sampah di depan %PDF-; fungsi ini tidak, karena keadaan
 * yang tidak pasti di aplikasi ini selalu berarti menolak.
 */
export function detectFileType(bytes: Uint8Array): AcceptedMimeType | null {
  if (matchesAt(bytes, PDF, 0)) return "application/pdf";
  if (matchesAt(bytes, PNG, 0)) return "image/png";
  if (matchesAt(bytes, JPEG, 0)) return "image/jpeg";
  if (matchesAt(bytes, RIFF, 0) && matchesAt(bytes, WEBP, 8)) return "image/webp";
  return null;
}

/** Ekstensi untuk pathname Blob. Diturunkan dari mime, bukan dari nama unggahan. */
export function extensionFor(mimeType: AcceptedMimeType): string {
  return EXTENSIONS[mimeType];
}

/**
 * Menurunkan `type` item dari mime terdeteksi. Untuk sumber UPLOAD,
 * pemilik TIDAK memilih tipe — sehingga tidak ada dua nilai yang dapat
 * saling menyimpang. LINK tidak pernah dihasilkan di sini: LINK selalu
 * EXTERNAL, dan EXTERNAL tidak pernah punya berkas.
 */
export function itemTypeFor(mimeType: AcceptedMimeType): ItemType {
  return mimeType === "application/pdf" ? "PDF" : "IMAGE";
}
