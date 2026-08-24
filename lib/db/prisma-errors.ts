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
