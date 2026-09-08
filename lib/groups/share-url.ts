/**
 * Domain hidup sebagai KONSTANTA di kode, bukan sebagai variabel
 * lingkungan. Keputusan U5-6.
 *
 * Alasannya kegagalan U5-1: sepuluh variabel tersimpan kosong di Vercel
 * selama empat belas hari tanpa dapat dibaca siapa pun, karena nilai
 * bertipe Sensitive memang tidak dapat dibaca ulang. Domain bukan
 * rahasia, dan nilai yang ikut masuk repositori terbaca mata di diff.
 *
 * QR yang sudah dicetak dan dibagikan tidak dapat ditarik kembali, jadi
 * alamat di dalamnya tidak boleh bergantung pada environment tempat ia
 * kebetulan dirender.
 */
export const APP_ORIGIN = "https://diandiandian.web.id";

export function shareUrl(slug: string): string {
  return `${APP_ORIGIN}/g/${slug}`;
}
