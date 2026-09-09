import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { endOfDayWIT, startOfDayWIT } from "@/lib/time/expiry";
import type { HistoryLogRow } from "@/lib/types/history";
import { DELETED_ITEM_VALUE } from "@/lib/validation/history";

/**
 * Kolom yang dibaca riwayat.
 *
 * visitorName dan visitorEmail datang DARI BARIS INI. Tidak ada `include`
 * di berkas ini, tidak ada relasi yang diikuti, dan tidak ada kueri ke
 * tabel User di mana pun — data pengguna berubah kemudian, sedangkan
 * riwayat harus menunjukkan keadaan pada saat kejadian. Menambahkan join
 * "supaya namanya selalu terbaru" adalah pelanggaran garis merah, bukan
 * penyempurnaan, dan tests/db/access-log-select-boundary.test.ts akan
 * menangkapnya.
 *
 * Pengenal pengguna dan userAgent sengaja TIDAK dibaca: keduanya tidak
 * dipakai satu pun kolom di layar, dan yang pertama itulah satu-satunya
 * jembatan menuju tabel User yang harus tetap tertutup.
 */
const HISTORY_SELECT = {
  id: true,
  eventType: true,
  itemId: true,
  visitorName: true,
  visitorEmail: true,
  outcome: true,
  denyReason: true,
  ipAddress: true,
  createdAt: true,
} as const;

export type HistoryFilter = {
  groupId: string;
  /** Pengenal item, "dihapus", atau null untuk seluruh baris. */
  item: string | null;
  dari: string | null;
  sampai: string | null;
  deniedOnly: boolean;
};

function itemCondition(
  item: string | null,
  liveItemIds: string[],
): Prisma.AccessLogWhereInput["itemId"] | undefined {
  if (item === null) return undefined;
  // Baris PAGE_VIEW ber-itemId null otomatis terbuang oleh kedua cabang
  // di bawah — persis yang diminta U6-1 saat penyaring item dipakai.
  if (item === DELETED_ITEM_VALUE) return { not: null, notIn: liveItemIds };
  return item;
}

function createdAtCondition(
  dari: string | null,
  sampai: string | null,
): Prisma.DateTimeFilter | undefined {
  if (dari === null && sampai === null) return undefined;

  // Batas dihitung di Asia/Jayapura lalu diubah ke UTC. Batas tengah
  // malam UTC akan membuang setiap akses antara 00.00 dan 09.00 WIT ke
  // tanggal yang salah. Kedua ujung inklusif.
  const range: Prisma.DateTimeFilter = {};
  if (dari !== null) range.gte = startOfDayWIT(dari);
  if (sampai !== null) range.lte = endOfDayWIT(sampai);
  return range;
}

export function historyWhere(
  filter: HistoryFilter,
  liveItemIds: string[],
): Prisma.AccessLogWhereInput {
  const where: Prisma.AccessLogWhereInput = { groupId: filter.groupId };

  const itemId = itemCondition(filter.item, liveItemIds);
  if (itemId !== undefined) where.itemId = itemId;

  const createdAt = createdAtCondition(filter.dari, filter.sampai);
  if (createdAt !== undefined) where.createdAt = createdAt;

  if (filter.deniedOnly) where.outcome = "DENIED";

  return where;
}

/**
 * Pengurut kedua `id` WAJIB. Paginasi offset mengueri ulang untuk setiap
 * halaman; bila dua baris punya createdAt yang sama persis — dan tiga
 * puluh peserta yang mengklik dalam detik yang sama membuat itu wajar —
 * urutan di antara keduanya tidak ditentukan, sehingga satu baris dapat
 * muncul di dua halaman sekaligus sementara baris lain hilang.
 */
export async function listAccessLogs(
  filter: HistoryFilter,
  liveItemIds: string[],
  skip: number,
  take: number,
): Promise<{ rows: HistoryLogRow[]; total: number }> {
  const where = historyWhere(filter, liveItemIds);

  const [rows, total] = await Promise.all([
    prisma.accessLog.findMany({
      where,
      select: HISTORY_SELECT,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.accessLog.count({ where }),
  ]);

  return { rows, total };
}

/**
 * Menjawab satu pertanyaan saja: perlukah penyaring item memuat entri
 * "Item sudah dihapus". Satu baris sudah cukup menjawabnya, jadi ini
 * findFirst, bukan hitungan maupun groupBy.
 */
export async function hasDeletedItemLogs(
  groupId: string,
  liveItemIds: string[],
): Promise<boolean> {
  const row = await prisma.accessLog.findFirst({
    where: { groupId, itemId: { not: null, notIn: liveItemIds } },
    select: { id: true },
  });
  return row !== null;
}
