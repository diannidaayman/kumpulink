import type { AccessMode, ItemSource, ItemType } from "@prisma/client";

/**
 * Bentuk item yang menyeberang dari server component ke cangkang klien.
 *
 * `fileKey` TIDAK ADA di sini, dan ketiadaannya bukan kelalaian. Invarian
 * 3 melarangnya muncul di payload yang dikirim ke peramban mana pun,
 * termasuk CMS pemilik. Menambahkannya "sekadar untuk berjaga" akan
 * mengirim kunci object storage ke setiap tab dashboard yang terbuka.
 *
 * `targetUrl` ADA di sini, dan itu benar: pemilik menyuntingnya. Larangan
 * invarian 3 atasnya menyasar payload yang dikirim ke PENGUNJUNG.
 */
export type ItemListEntry = {
  id: string;
  title: string;
  description: string | null;
  type: ItemType;
  source: ItemSource;
  targetUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  accessMode: AccessMode;
  isActive: boolean;
  sortOrder: number;
};
