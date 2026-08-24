import type { GroupStatusInput } from "@/lib/groups/status";

/**
 * Bentuk data yang menyeberang dari server component ke cangkang klien.
 * Sengaja tidak memuat kolom yang belum dipakai antarmuka Unit 2.
 */
export type GroupListItem = GroupStatusInput & {
  id: string;
  title: string;
  slug: string;
  sortOrder: number;
  itemCount: number;
};

/** Segmen penyaring bilah filter dashboard. */
export type GroupSegment = "active" | "inactive" | "all";
