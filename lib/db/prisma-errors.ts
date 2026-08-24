/**
 * P2002 = pelanggaran constraint unik.
 *
 * Ini penjaga TERAKHIR bentrok slug, bukan yang pertama: memeriksa
 * ketersediaan lalu menulis selalu menyisakan celah balapan, sekecil apa
 * pun pada aplikasi satu pemilik.
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

/**
 * P2025 = baris yang dicari sudah tidak ada.
 *
 * Muncul saat kirim-ganda dialog hapus, atau dua tab terbuka pada group
 * yang sama. Baris yang sudah hilang bukan galat yang perlu dijatuhkan ke
 * overlay error Next.js — pemanggilnya memutuskan itu no-op atau NOT_FOUND.
 */
export function isRecordNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2025"
  );
}
