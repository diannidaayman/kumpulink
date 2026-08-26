import type {
  AccessDecision,
  AccessDenyReason,
  AccessGroup,
  AccessSession,
} from "@/lib/types/access";

function denied(reason: AccessDenyReason): AccessDecision {
  return { kind: "DENIED", reason };
}

function granted(ownerPreview: boolean): AccessDecision {
  return { kind: "GRANTED", ownerPreview };
}

/**
 * Ambangnya `<=`, sama persis dengan `resolveGroupStatus()` di
 * `lib/groups/status.ts`. Keduanya sengaja TIDAK berbagi kode: yang di
 * sana fungsi tampilan yang cabang terakhirnya permisif, yang di sini
 * evaluator izin yang bawaannya menolak. Yang dibagi hanyalah ambang.
 */
function isExpired(group: AccessGroup, now: Date): boolean {
  return group.expiresAt !== null && group.expiresAt.getTime() <= now.getTime();
}

/**
 * Tahap satu — gerbang group. Dievaluasi berurutan, berhenti pada
 * kecocokan pertama. Urutannya adalah bagian dari aturannya dan tidak
 * boleh ditukar tanpa menukar pengujiannya juga.
 */
export function evaluateGroupAccess(
  group: AccessGroup | null,
  session: AccessSession,
  now: Date,
): AccessDecision {
  if (group === null) return denied("NOT_FOUND");

  // Pemilik selalu dapat membuka groupnya sendiri. Penanda ownerPreview
  // memberitahu halaman untuk memasang spanduk "link sedang tidak aktif".
  // Group PRIVATE tidak memicunya: linknya tidak mati, ia memang belum
  // dibagikan.
  if (session?.role === "OWNER") {
    return granted(!group.shareEnabled || isExpired(group, now));
  }

  if (!group.shareEnabled) return denied("REVOKED");
  if (isExpired(group, now)) return denied("EXPIRED");
  if (group.visibility === "PRIVATE") return denied("PRIVATE");
  if (group.visibility === "REQUIRE_LOGIN" && session === null) {
    return { kind: "NEEDS_LOGIN" };
  }

  return granted(false);
}
