import "server-only";

import { prisma } from "@/lib/db/client";
import { moveInList, renumber } from "@/lib/order/move";
import type { GroupListItem } from "@/lib/types/group";

/**
 * Lapisan ini TIDAK mengambil keputusan. Seluruh aturan slug, urutan, dan
 * status sudah diputuskan fungsi murni di lib/groups/ sebelum sampai ke
 * sini — itu yang membuat aturannya punya pengujian, karena proyek ini
 * tidak memiliki database uji.
 */
export async function listGroupsForDashboard(): Promise<GroupListItem[]> {
  const rows = await prisma.group.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      visibility: true,
      shareEnabled: true,
      expiresAt: true,
      sortOrder: true,
      _count: { select: { items: true } },
    },
  });

  return rows.map(({ _count, ...group }) => ({ ...group, itemCount: _count.items }));
}

export async function listAllSlugs(): Promise<string[]> {
  const rows = await prisma.group.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
}

export async function getGroupSlugById(id: string): Promise<string | null> {
  const row = await prisma.group.findUnique({ where: { id }, select: { slug: true } });
  return row?.slug ?? null;
}

/** Group baru duduk di puncak daftar, sejajar dengan baris sisipnya. */
export async function insertGroup(input: { title: string; slug: string }): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.group.updateMany({ data: { sortOrder: { increment: 1 } } });
    await tx.group.create({ data: { title: input.title, slug: input.slug, sortOrder: 0 } });
  });
}

export async function updateGroupTitleAndSlug(input: {
  id: string;
  title: string;
  slug: string;
}): Promise<void> {
  await prisma.group.update({
    where: { id: input.id },
    data: { title: input.title, slug: input.slug },
  });
}

export async function deleteGroupById(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.group.delete({ where: { id } });
    const remaining = await tx.group.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    // Berurutan, bukan Promise.all: transaksi interaktif Prisma memakai
    // satu koneksi, dan menembakkan pembaruan serentak ke dalamnya adalah
    // sumber kebuntuan yang muncul hanya sesekali — jenis kegagalan yang
    // paling mahal ditemukan belakangan.
    for (const [index, group] of remaining.entries()) {
      await tx.group.update({ where: { id: group.id }, data: { sortOrder: index } });
    }
  });
}

/**
 * Membaca urutan dan menuliskannya kembali dalam SATU transaksi. Membaca di
 * luar transaksi (seperti versi lama fungsi ini) membuka celah balapan:
 * dua klik cepat mengirim dua permintaan, dan permintaan kedua bisa membaca
 * urutan sebelum permintaan pertama selesai menulis, lalu menimpanya diam-
 * diam dengan urutan yang sudah basi. Membaca dan menulis dalam satu
 * transaksi interaktif membuat keduanya atomik terhadap pemindahan lain.
 */
export async function moveGroupInTransaction(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const groups = await tx.group.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    const reordered = renumber(moveInList(groups, id, direction));
    // Berurutan, bukan Promise.all: transaksi interaktif Prisma memakai
    // satu koneksi, dan menembakkan pembaruan serentak ke dalamnya adalah
    // sumber kebuntuan yang muncul hanya sesekali.
    for (const entry of reordered) {
      await tx.group.update({ where: { id: entry.id }, data: { sortOrder: entry.sortOrder } });
    }
  });
}

/**
 * Dipakai route handler unggahan untuk menolak groupId karangan SEBELUM
 * berkas apa pun naik ke object storage.
 */
export async function groupExists(id: string): Promise<boolean> {
  return (await prisma.group.count({ where: { id } })) > 0;
}
