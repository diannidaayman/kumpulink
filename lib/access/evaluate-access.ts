import type {
  AccessDecision,
  AccessDenyReason,
  AccessGroup,
  AccessItem,
  AccessRequestRecord,
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

  switch (group.visibility) {
    case "PRIVATE":
      return denied("PRIVATE");
    case "REQUIRE_LOGIN":
      return session === null ? { kind: "NEEDS_LOGIN" } : granted(false);
    case "PUBLIC":
      return granted(false);
    default: {
      // Nilai `visibility` yang tidak dikenal menolak, bukan meloloskan:
      // ini satu-satunya sikap yang sejalan dengan bawaan-menolak di
      // seluruh berkas ini. Penjaga keterjangkauan berikut membuat
      // penambahan anggota enum baru gagal saat kompilasi, bukan
      // membocorkan group bertingkat baru itu ke publik secara senyap.
      const _exhaustive: never = group.visibility;
      void _exhaustive;
      return denied("NOT_FOUND");
    }
  }
}

/**
 * Tahap dua — gerbang item.
 *
 * Baris pertamanya menjalankan tahap satu dan mengembalikan hasilnya apa
 * adanya bila bukan `GRANTED`. Itulah invarian 6 — item tidak pernah
 * lebih permisif daripada group induknya — sebagai struktur kode, bukan
 * sebagai disiplin pemanggil. Gerbang item memanggil fungsi ini SAJA,
 * satu panggilan, bukan dua.
 *
 * `request` belum dibaca: cabang `APPROVAL` menolak lebih dulu selama
 * Unit 7 belum ada. Ia sudah ada di tanda tangan sejak sekarang supaya
 * Unit 7 mengubah isi fungsi, bukan setiap pemanggilnya.
 */
export function evaluateItemAccess(
  group: AccessGroup | null,
  item: AccessItem | null,
  session: AccessSession,
  request: AccessRequestRecord,
  now: Date,
): AccessDecision {
  const groupDecision = evaluateGroupAccess(group, session, now);
  if (groupDecision.kind !== "GRANTED") return groupDecision;

  // `group === null` sudah ditolak tahap satu sebagai NOT_FOUND; ia
  // disebut lagi di sini semata agar penyempitan tipenya terbaca compiler.
  if (group === null || item === null || item.groupId !== group.id) {
    return denied("NOT_FOUND");
  }

  if (!item.isActive) return denied("ITEM_INACTIVE");

  // Pemilik melewati aturan accessMode, yang memang ditujukan kepada
  // pengunjung. Letaknya sesudah kedua pemeriksaan di atas: kepemilikan
  // tidak memunculkan item yang tidak ada, dan tidak membatalkan
  // penonaktifan yang pemilik lakukan sendiri.
  if (session?.role === "OWNER") return granted(groupDecision.ownerPreview);

  return denied("NOT_FOUND");
}
