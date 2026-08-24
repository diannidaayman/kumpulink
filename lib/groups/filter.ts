import { resolveGroupStatus } from "@/lib/groups/status";
import type { GroupListItem, GroupSegment } from "@/lib/types/group";

/**
 * inactive berarti EXPIRED saja. UNSHARED (belum dibagikan) tetap dihitung
 * aktif: saklar berbagi yang mati adalah pilihan sadar pemilik, dan group
 * yang sengaja belum dibagikan tetap group yang sedang dikerjakannya —
 * berbeda dari EXPIRED, satu-satunya status yang berhenti bekerja tanpa
 * pemilik memutuskan apa pun. Ini pembedaan yang sama dengan nada lencana
 * di lib/groups/status.ts: netral untuk pilihan pemilik sendiri, waspada
 * untuk sesuatu yang terjadi PADA pemilik.
 *
 * `active` mengecualikan inactive; `inactive` mengecualikan active; lalu
 * dicocokkan dengan judul (tanpa peduli besar-kecil huruf, dan dipangkas
 * spasinya).
 *
 * Ditarik dari use-group-filter.ts (client) supaya predikatnya dapat diuji
 * di lingkungan test "node" — lib/ tidak boleh diimpor dari components/.
 */
export function filterGroups(
  groups: readonly GroupListItem[],
  options: { query: string; segment: GroupSegment },
  now: Date,
): GroupListItem[] {
  const query = options.query.trim().toLowerCase();

  return groups.filter((group) => {
    const status = resolveGroupStatus(group, now);
    const inactive = status === "EXPIRED";
    if (options.segment === "active" && inactive) return false;
    if (options.segment === "inactive" && !inactive) return false;
    return group.title.toLowerCase().includes(query);
  });
}
