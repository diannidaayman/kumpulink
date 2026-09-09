/**
 * Ukuran halaman riwayat. Keputusan U6-5, dan angka yang sudah dipakai
 * contoh "1–50 dari 214" di ui-context.md.
 *
 * Ditulis SATU KALI di sini. Angka 50 yang muncul kedua kalinya di
 * berkas lain adalah cacat, bukan pengulangan yang tidak berbahaya.
 */
export const HISTORY_PAGE_SIZE = 50;

export type HistoryPagination = {
  page: number;
  pageCount: number;
  skip: number;
  take: number;
  /** "1–50 dari 214", atau "Tidak ada baris" saat kosong. */
  summary: string;
};

/**
 * Nol baris tetap menghasilkan SATU halaman, bukan nol. Nol halaman
 * membuat penjepitan menghasilkan halaman 0, dan halaman 0 tidak dapat
 * dirujuk maupun ditampilkan.
 */
export function pageCountFor(total: number): number {
  return total === 0 ? 1 : Math.ceil(total / HISTORY_PAGE_SIZE);
}

export function clampPage(page: number, total: number): number {
  if (page < 1) return 1;
  const count = pageCountFor(total);
  return page > count ? count : page;
}

export function buildPagination(page: number, total: number): HistoryPagination {
  const clamped = clampPage(page, total);
  const skip = (clamped - 1) * HISTORY_PAGE_SIZE;
  const last = Math.min(skip + HISTORY_PAGE_SIZE, total);

  return {
    page: clamped,
    pageCount: pageCountFor(total),
    skip,
    take: HISTORY_PAGE_SIZE,
    // Tanda pisahnya en dash, mengikuti contoh di ui-context.md.
    summary: total === 0 ? "Tidak ada baris" : `${skip + 1}–${last} dari ${total}`,
  };
}
