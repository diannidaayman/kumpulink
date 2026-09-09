import { denyReasonText } from "@/lib/history/deny-reason";
import { formatDateTimeWIT } from "@/lib/time/format";
import type { HistoryLogRow, HistoryRowView } from "@/lib/types/history";

export const ANONYMOUS_NAME = "Tanpa identitas";
export const PAGE_VIEW_ITEM = "Membuka halaman group";
export const DELETED_ITEM = "Item sudah dihapus";
// ITEM_ACCESS dengan itemId null tidak terjangkau hari ini, tapi ini
// tabel pertanggungjawaban: label ini tidak boleh menegaskan kunjungan
// halaman yang tidak pernah terjadi. Mengikuti preseden denyReasonText
// di bawah — alasan yang tidak dikenali dinyatakan "tidak diketahui",
// bukan ditebak sebagai cabang lain yang kebetulan mirip.
export const UNKNOWN_ITEM = "Item tidak diketahui";

function resolveItem(
  row: HistoryLogRow,
  itemTitles: Map<string, string>,
): { item: string; itemIsAbsent: boolean } {
  // PAGE_VIEW tidak menunjuk item mana pun menurut rancangan, bukan karena
  // datanya rusak. Keputusan U6-1: dinyatakan, bukan dikosongkan.
  if (row.eventType === "PAGE_VIEW") {
    return { item: PAGE_VIEW_ITEM, itemIsAbsent: true };
  }

  // ITEM_ACCESS dengan itemId null adalah keadaan berbeda dari PAGE_VIEW:
  // barisnya mengaku mengakses sebuah item, tapi itemId-nya sendiri
  // hilang. Menyatukannya dengan cabang PAGE_VIEW di atas akan membuat
  // baris ini berbunyi "Membuka halaman group" — menegaskan kunjungan
  // halaman yang tidak pernah terjadi.
  if (row.itemId === null) {
    return { item: UNKNOWN_ITEM, itemIsAbsent: true };
  }

  // AccessLog sengaja tanpa foreign key, sehingga baris ini bertahan
  // setelah itemnya dihapus dan judulnya tidak ada lagi di mana pun.
  // Keputusan U6-8.
  const title = itemTitles.get(row.itemId);
  if (title === undefined) return { item: DELETED_ITEM, itemIsAbsent: true };

  return { item: title, itemIsAbsent: false };
}

/**
 * Satu-satunya tempat teks baris riwayat lahir.
 *
 * DATA `User` BUKAN ARGUMEN FUNGSI INI, dan itu disengaja. Nama dan email
 * datang dari kolom visitorName dan visitorEmail pada barisnya sendiri —
 * salinan yang dibuat saat kejadian. Pengguna yang berganti nama besok
 * tidak punya satu pun saluran untuk menulis ulang baris hari ini.
 *
 * Menambahkan argumen ketiga berisi data pengguna adalah pelanggaran
 * garis merah unit ini, bukan penyempurnaan.
 */
export function toHistoryRow(
  row: HistoryLogRow,
  itemTitles: Map<string, string>,
): HistoryRowView {
  const anonymous = row.visitorName === null && row.visitorEmail === null;
  const granted = row.outcome === "GRANTED";
  const deny = granted ? null : denyReasonText(row.denyReason);

  return {
    id: row.id,
    time: formatDateTimeWIT(row.createdAt),
    timeIp: anonymous ? null : row.ipAddress,
    name: anonymous ? ANONYMOUS_NAME : (row.visitorName ?? row.visitorEmail ?? ANONYMOUS_NAME),
    isAnonymous: anonymous,
    // Email hanya menjadi baris kedua bila namanya memang ada. Bila hanya
    // email yang tersalin, ia sudah berdiri sebagai nama di atas.
    email: row.visitorName === null ? null : row.visitorEmail,
    nameIp: anonymous ? row.ipAddress : null,
    ...resolveItem(row, itemTitles),
    granted,
    outcomeLabel: granted ? "Diizinkan" : "Ditolak",
    denyLabel: deny?.label ?? null,
    denyDescription: deny?.description ?? null,
  };
}
