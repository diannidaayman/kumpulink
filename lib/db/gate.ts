import "server-only";

import type { AccessMode, ItemSource, Visibility } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import type { AccessRequestRecord } from "@/lib/types/access";

/**
 * Kueri KEDUA di repositori ini yang membaca fileKey dan targetUrl; yang
 * pertama adalah pra-baca sesaat sebelum penghapusan. Keduanya hidup di
 * server dan hasilnya TIDAK PERNAH terserialisasi ke peramban —
 * kembalian fungsi ini hanya dibaca route handler gerbang, yang
 * memakainya untuk menyusun 302 atau mengalirkan byte, lalu membuangnya.
 *
 * Kueri halaman group ada di lib/db/public-group.ts dan sengaja TIDAK
 * memuat kedua kolom itu.
 */
export type GateGroup = {
  id: string;
  title: string;
  slug: string;
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: Visibility;
};

export type GateItem = {
  id: string;
  groupId: string;
  title: string;
  isActive: boolean;
  accessMode: AccessMode;
  source: ItemSource;
  targetUrl: string | null;
  fileKey: string | null;
  fileName: string | null;
  mimeType: string | null;
};

export type GateData = {
  group: GateGroup | null;
  item: GateItem | null;
  request: AccessRequestRecord;
};

/**
 * Catatan AccessRequest diambil DI SINI dan diberikan ke evaluator
 * sebagai argumen — evaluator tidak boleh mengambilnya sendiri, karena
 * itu menghancurkan kemurniannya. Ia diambil meski cabang APPROVAL masih
 * menolak sepanjang Unit 4, supaya Unit 7 mengubah isi evaluator dan
 * bukan pemanggilnya.
 */
export async function readGateData(
  slug: string,
  itemId: string,
  userId: string | null,
): Promise<GateData> {
  const [group, item] = await Promise.all([
    prisma.group.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        shareEnabled: true,
        expiresAt: true,
        visibility: true,
      },
    }),
    prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        groupId: true,
        title: true,
        isActive: true,
        accessMode: true,
        source: true,
        targetUrl: true,
        fileKey: true,
        fileName: true,
        mimeType: true,
      },
    }),
  ]);

  const request =
    userId === null
      ? null
      : await prisma.accessRequest.findUnique({
          where: { itemId_userId: { itemId, userId } },
          select: { status: true, expiresAt: true },
        });

  return { group, item, request };
}

export async function markItemBroken(itemId: string): Promise<void> {
  await prisma.item.update({ where: { id: itemId }, data: { isBroken: true } });
}

/**
 * Menerjemahkan slug URL menjadi id group sungguhan, dipakai jalur
 * RATE_LIMITED di gerbang item supaya `AccessLog.groupId` yang tertulis
 * di sana terjangkau riwayat per group — yang selalu menyaring lewat id,
 * bukan slug. `slug` sudah `@unique`, jadi kueri ini murah.
 */
export async function readGroupIdBySlug(slug: string): Promise<string | null> {
  const group = await prisma.group.findUnique({ where: { slug }, select: { id: true } });
  return group?.id ?? null;
}
