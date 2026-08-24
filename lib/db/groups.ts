import "server-only";

import { prisma } from "@/lib/db/client";
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

export async function applyGroupOrder(
  entries: { id: string; sortOrder: number }[],
): Promise<void> {
  await prisma.$transaction(
    entries.map((entry) =>
      prisma.group.update({ where: { id: entry.id }, data: { sortOrder: entry.sortOrder } }),
    ),
  );
}

export async function countGroupItems(id: string): Promise<number> {
  return prisma.item.count({ where: { groupId: id } });
}
