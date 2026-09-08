export type PreviewReason = "REVOKED" | "EXPIRED";

export type PreviewReasonInput = {
  shareEnabled: boolean;
  expiresAt: Date | null;
};

/**
 * Sebab spanduk pratinjau pemilik. Keputusan U5-13.
 *
 * BUKAN keputusan izin: `evaluate-access.ts` sudah memutuskan bahwa
 * pemilik boleh masuk, dan `ownerPreview` sudah memberitahu bahwa
 * spanduknya harus muncul. Yang dijawab fungsi ini hanya kalimat mana
 * yang dibaca — itulah sebabnya ia berdiri di sini dan bukan di dalam
 * evaluator, yang matriksnya tidak perlu bertambah demi teks.
 *
 * Ambang `<=` dan urutan saklar-sebelum-tanggal sengaja sama dengan
 * `resolveGroupStatus()`. Yang dibagi hanyalah aturannya, bukan kodenya.
 */
export function resolvePreviewReason(
  group: PreviewReasonInput,
  now: Date,
): PreviewReason | null {
  if (!group.shareEnabled) return "REVOKED";
  if (group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime()) {
    return "EXPIRED";
  }
  return null;
}
