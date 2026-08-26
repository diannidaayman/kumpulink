import "server-only";

import type { AccessMode, ItemSource, ItemType } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { renumber } from "@/lib/order/move";
import type { ItemListEntry } from "@/lib/types/item";

/**
 * Lapisan ini TIDAK mengambil keputusan, sama seperti lib/db/groups.ts.
 *
 * `fileKey` TIDAK ADA di daftar select ini, dan itu satu-satunya alasan
 * invarian 3 dapat diperiksa dengan membaca sepuluh baris alih-alih
 * menelusuri setiap komponen. Jangan menggantinya dengan `include`, dan
 * jangan menambahkan `fileKey: true` "untuk sementara".
 */
const LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  type: true,
  source: true,
  targetUrl: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  accessMode: true,
  isActive: true,
  sortOrder: true,
} as const;

/**
 * SATU kueri untuk seluruh dashboard, lalu dikelompokkan di memori.
 *
 * Mengambil per group saat akordeonnya dibuka akan lebih hemat, tetapi
 * menuntut endpoint atau server action tersendiri beserta keadaan
 * memuatnya. Pada aplikasi satu pemilik dengan puluhan group berisi
 * belasan item, seluruhnya beberapa ratus baris tanpa kolom besar —
 * fileKey pun tidak ikut terbaca. Kesederhanaannya menang.
 */
export async function listItemsForDashboard(): Promise<Record<string, ItemListEntry[]>> {
  const rows = await prisma.item.findMany({
    orderBy: [{ groupId: "asc" }, { sortOrder: "asc" }],
    select: { ...LIST_SELECT, groupId: true },
  });

  const grouped: Record<string, ItemListEntry[]> = {};
  for (const { groupId, ...item } of rows) {
    (grouped[groupId] ??= []).push(item);
  }
  return grouped;
}

export type InsertItemInput = {
  groupId: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  accessMode: AccessMode;
  targetUrl?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
};

/**
 * Item baru duduk di DASAR daftar, berbeda dari group yang duduk di
 * puncak. Pemilik mengisi sebuah group dari atas ke bawah mengikuti
 * jalannya acara — absensi, rundown, materi — sehingga menyisipkan item
 * terbaru di puncak justru melawan urutan yang sedang ia bangun.
 */
export async function insertItem(input: InsertItemInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const count = await tx.item.count({ where: { groupId: input.groupId } });
    await tx.item.create({ data: { ...input, sortOrder: count } });
  });
}

export async function updateItemMetadata(input: {
  id: string;
  title: string;
  description: string | null;
  accessMode: AccessMode;
  // Absen berarti "tidak berubah", bukan "kosongkan" — dan item UPLOAD
  // tidak pernah mengirimnya sama sekali. Menulis `targetUrl` tanpa syarat
  // di sini akan menimpanya dengan `undefined`/`null` untuk item UPLOAD,
  // yang tidak boleh punya kolom ini disentuh sama sekali.
  targetUrl?: string;
}): Promise<void> {
  await prisma.item.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description,
      accessMode: input.accessMode,
      ...(input.targetUrl !== undefined ? { targetUrl: input.targetUrl } : {}),
    },
  });
}

export async function setItemActive(id: string, isActive: boolean): Promise<void> {
  await prisma.item.update({ where: { id }, data: { isActive } });
}

/**
 * Menghapus baris lalu MENGEMBALIKAN fileKey-nya, supaya pemanggil dapat
 * menghapus berkasnya sesudah itu.
 *
 * Urutannya disengaja: baris dulu, berkas sesudah. Setiap jalur menuju
 * konten berangkat dari baris Item, jadi begitu baris ini hilang
 * berkasnya sudah tidak terjangkau meski langkah berikutnya gagal
 * seluruhnya. Kebalikannya — berkas dulu — menukar sampah yang tidak
 * terlihat dengan item rusak yang terlihat.
 *
 * Mengembalikan null bila barisnya memang sudah tidak ada, atau bila ia
 * bersumber EXTERNAL dan tidak punya berkas.
 */
export async function deleteItemReturningFileKey(id: string): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id },
      select: { fileKey: true, groupId: true },
    });
    if (item === null) return null;

    await tx.item.delete({ where: { id } });

    const remaining = await tx.item.findMany({
      where: { groupId: item.groupId },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    // Berurutan, bukan Promise.all: transaksi interaktif Prisma memakai
    // satu koneksi, dan menembakkan pembaruan serentak ke dalamnya adalah
    // sumber kebuntuan yang muncul hanya sesekali.
    for (const entry of renumber(remaining)) {
      await tx.item.update({ where: { id: entry.id }, data: { sortOrder: entry.sortOrder } });
    }

    return item.fileKey;
  });
}

/**
 * Menerima urutan lengkap, bukan satu pemindahan, sehingga geser dan
 * tombol naik/turun memakai satu jalur yang sama.
 *
 * Harganya adalah risiko daftar basi: dua tab terbuka, atau satu
 * penghapusan yang mendahului, membuat klien mengirim urutan yang tidak
 * lagi menggambarkan keadaan. Ditutup dengan membandingkan HIMPUNAN id di
 * dalam transaksi — beda sedikit pun berarti daftar itu sudah basi, dan
 * pembatalan diam-diam lebih baik daripada menimpa urutan yang benar
 * dengan urutan yang usang.
 */
export async function reorderItemsInTransaction(
  groupId: string,
  orderedIds: string[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const current = await tx.item.findMany({ where: { groupId }, select: { id: true } });

    if (current.length !== orderedIds.length) return;
    if (new Set(orderedIds).size !== orderedIds.length) return;

    const currentIds = new Set(current.map((item) => item.id));
    if (!orderedIds.every((id) => currentIds.has(id))) return;

    for (const [index, id] of orderedIds.entries()) {
      await tx.item.update({ where: { id }, data: { sortOrder: index } });
    }
  });
}
