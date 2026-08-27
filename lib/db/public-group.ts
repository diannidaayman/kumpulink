import "server-only";

import type { AccessMode, ItemSource, ItemType, Visibility } from "@prisma/client";

import { prisma } from "@/lib/db/client";

/**
 * Kolom tujuan item TIDAK ADA di select ini, dan itu satu-satunya alasan
 * kriteria sukses nomor 3 dapat diperiksa dengan membaca sepuluh baris
 * alih-alih menelusuri setiap komponen. Pola yang sama dengan LIST_SELECT
 * di lib/db/items.ts, dan alasan yang sama pula: bukan karena
 * komponennya tidak memakainya, melainkan supaya nilainya tidak pernah
 * sampai ke berkas yang merender.
 *
 * Jangan menggantinya dengan `include`, dan jangan menambahkan kolom
 * sensitif "untuk pratinjau". Pratinjau pun melewati gerbang item.
 * Ditegakkan tests/db/public-select-boundary.test.ts.
 */
export type PublicItem = {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  accessMode: AccessMode;
};

export type PublicGroup = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
  items: PublicItem[];
};

export async function readPublicGroup(slug: string): Promise<PublicGroup | null> {
  return prisma.group.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      shareEnabled: true,
      expiresAt: true,
      visibility: true,
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          source: true,
          accessMode: true,
        },
      },
    },
  });
}
