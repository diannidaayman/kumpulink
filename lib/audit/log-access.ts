import "server-only";

import type { DenyReason, Outcome } from "@prisma/client";

import type { RequestContext } from "@/lib/audit/request-context";
import { prisma } from "@/lib/db/client";

/**
 * SATU-SATUNYA berkas di repositori ini yang menyentuh prisma.accessLog.
 * Ditegakkan tests/audit/access-log-boundary.test.ts, bukan oleh
 * disiplin — batas yang hanya dijaga kebiasaan akan bocor pada unit
 * berikutnya.
 *
 * Kedua fungsi MELEMPAR saat gagal dan tidak menelan galat apa pun.
 * Konsekuensi kegagalan berbeda antara GRANTED dan DENIED, dan yang
 * berhak memutuskannya adalah pemanggil — bukan modul ini.
 */

/**
 * Nama dan email DISALIN ke baris log pada saat kejadian, bukan dirujuk.
 * Riwayat adalah catatan peristiwa, bukan pandangan atas keadaan
 * sekarang: data pengguna boleh berubah kemudian tanpa mengubah apa yang
 * tercatat pernah terjadi.
 */
export type Visitor = {
  userId: string | null;
  visitorName: string | null;
  visitorEmail: string | null;
};

/**
 * Dicatat bila DAN HANYA BILA pengunjung sedang masuk — berlaku sama
 * untuk ketiga nilai visibility. Kunjungan anonim tidak dicatat, karena
 * barisnya banyak dan tidak menjawab pertanyaan siapa pun. Pemanggil
 * yang memutuskan syarat itu; fungsi ini hanya menulis.
 */
export async function logPageView(input: {
  groupId: string;
  visitor: Visitor;
  context: RequestContext;
}): Promise<void> {
  await prisma.accessLog.create({
    data: {
      eventType: "PAGE_VIEW",
      groupId: input.groupId,
      outcome: "GRANTED",
      userId: input.visitor.userId,
      visitorName: input.visitor.visitorName,
      visitorEmail: input.visitor.visitorEmail,
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    },
  });
}

/**
 * SELALU dicatat, termasuk untuk pengunjung anonim pada item terbuka.
 * Barisnya tetap berguna sebagai hitungan klik meski kolom identitasnya
 * kosong.
 */
export async function logItemAccess(input: {
  groupId: string;
  itemId: string;
  visitor: Visitor;
  outcome: Outcome;
  denyReason?: DenyReason | null;
  context: RequestContext;
}): Promise<void> {
  await prisma.accessLog.create({
    data: {
      eventType: "ITEM_ACCESS",
      groupId: input.groupId,
      itemId: input.itemId,
      outcome: input.outcome,
      denyReason: input.denyReason ?? null,
      userId: input.visitor.userId,
      visitorName: input.visitor.visitorName,
      visitorEmail: input.visitor.visitorEmail,
      ipAddress: input.context.ipAddress,
      userAgent: input.context.userAgent,
    },
  });
}
