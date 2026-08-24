export type GroupStatus =
  | "UNSHARED"
  | "EXPIRED"
  | "PRIVATE"
  | "REQUIRE_LOGIN"
  | "PUBLIC";

export type GroupStatusInput = {
  shareEnabled: boolean;
  expiresAt: Date | null;
  visibility: "PRIVATE" | "REQUIRE_LOGIN" | "PUBLIC";
};

/**
 * Satu baris akordeon selalu memuat TEPAT SATU lencana.
 *
 * Ketiga nilai visibility adalah SETELAN, sedangkan tidak-dibagikan dan
 * kedaluwarsa adalah KEADAAN yang membatalkan setelan itu — group yang
 * tidak dapat dicapai siapa pun tidak lagi punya tingkat akses yang
 * berarti. Karena itu keduanya menggantikan lencana visibilitas, bukan
 * menemaninya.
 */
export function resolveGroupStatus(group: GroupStatusInput, now: Date): GroupStatus {
  if (!group.shareEnabled) return "UNSHARED";
  if (group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime()) {
    return "EXPIRED";
  }
  return group.visibility;
}
