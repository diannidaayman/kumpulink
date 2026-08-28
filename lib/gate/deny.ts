import "server-only";

import type { DenyReason } from "@prisma/client";

import { logItemAccess, type Visitor } from "@/lib/audit/log-access";
import type { RequestContext } from "@/lib/audit/request-context";
import { markItemBroken } from "@/lib/db/gate";
import { ITEM_GATE_SCOPE, rateLimitKey } from "@/lib/ratelimit/window";
import { recordFailure } from "@/lib/ratelimit/counter";

/**
 * Penanganan penolakan gerbang item, dipisah dari route.ts supaya
 * berkas rute tetap di bawah ambang ±200 baris — modul ini mengerjakan
 * satu hal: menulis riwayat DENIED dan, bila relevan, menandai item
 * rusak serta menaikkan penghitung rate limit.
 *
 * Kegagalan menulis log pada PENOLAKAN dicatat ke konsol lalu ditelan:
 * pengunjung yang ditolak tidak sedang menerima apa pun, jadi tidak ada
 * yang perlu dibatalkan (U4-7). Kegagalan pada GRANTED tetap ditangani
 * langsung di route.ts dan MEMBATALKAN penerusan.
 */
export async function logDenied(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  denyReason: DenyReason;
  context: RequestContext;
}): Promise<void> {
  try {
    await logItemAccess({ ...input, outcome: "DENIED" });
  } catch (error) {
    console.error("Gagal mencatat penolakan akses item:", error);
  }
}

/**
 * Menandai item rusak, mencatat penolakannya, lalu menaikkan penghitung
 * rate limit. Penghitung naik tanpa syarat: alamat IP yang tidak diketahui
 * dikelompokkan ke ember "unknown" bersama oleh `rateLimitKey()`, karena
 * ember bersama yang lebih ketat lebih baik daripada tidak ada batas sama
 * sekali. Dipakai oleh kedua jalur "berkas
 * tidak dapat dilayani" di gerbang item: EXTERNAL tanpa targetUrl
 * (denyReason NOT_FOUND) dan UPLOAD tanpa berkas yang ditemukan di Blob
 * (denyReason FILE_MISSING). Keduanya berarti pemilik perlu memperbaiki
 * barisnya, karena itulah isBroken ditandai di kedua jalur.
 */
export async function denyBrokenItem(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  denyReason: DenyReason;
  context: RequestContext;
  now: Date;
}): Promise<void> {
  await markItemBroken(input.itemId);
  await logDenied({
    groupId: input.groupId,
    itemId: input.itemId,
    visitor: input.visitor,
    denyReason: input.denyReason,
    context: input.context,
  });
  await recordFailure(ITEM_GATE_SCOPE, rateLimitKey(input.context.ipAddress), input.now);
}
