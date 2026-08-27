import type { AccessMode } from "@prisma/client";

/**
 * Baris ringkasan bernada mono di bawah judul group: memberi bentuk
 * halaman sebelum digulir, dan gratis dihitung di server. Murni, tanpa
 * Prisma, karena proyek ini tidak memiliki database uji.
 */
export type ItemSummary = {
  total: number;
  needsLogin: number;
  needsApproval: number;
};

export function summarizeItems(items: { accessMode: AccessMode }[]): ItemSummary {
  return {
    total: items.length,
    needsLogin: items.filter((item) => item.accessMode === "IDENTITY").length,
    needsApproval: items.filter((item) => item.accessMode === "APPROVAL").length,
  };
}

/**
 * Ruas bernilai nol dihilangkan, bukan ditulis sebagai "0 perlu masuk":
 * baris ini dibaca sekilas, dan angka nol menuntut dibaca dulu untuk
 * kemudian diabaikan.
 */
export function formatItemSummary(summary: ItemSummary): string {
  const parts = [`${summary.total} item`];
  if (summary.needsLogin > 0) parts.push(`${summary.needsLogin} perlu masuk`);
  if (summary.needsApproval > 0) parts.push(`${summary.needsApproval} butuh persetujuan`);
  return parts.join(" · ");
}
