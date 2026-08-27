import "server-only";

import { prisma } from "@/lib/db/client";
import { RETENTION_MS, resolveWindowStart } from "@/lib/ratelimit/window";

/**
 * Lapisan ini TIDAK mengambil keputusan — ambangnya diputuskan
 * isOverLimit() di lib/ratelimit/window.ts. Pola yang sama dengan
 * lib/db/: yang punya aturan adalah fungsi murni, yang menyentuh
 * database hanya menjalankan.
 */
export async function readFailureCount(
  scope: string,
  ipAddress: string,
  now: Date,
): Promise<number> {
  const row = await prisma.rateLimitCounter.findUnique({
    where: {
      scope_ipAddress_windowStart: {
        scope,
        ipAddress,
        windowStart: resolveWindowStart(now),
      },
    },
    select: { count: true },
  });

  return row?.count ?? 0;
}

/**
 * Menyapu baris kedaluwarsa dalam panggilan yang sama, bukan lewat
 * pekerjaan berjadwal: invarian 14 melarang route handler menjalankan
 * pekerjaan latar, dan kenaikan ini terjadi paling banyak dua puluh kali
 * per IP per sepuluh menit sehingga penyapuannya murah.
 */
export async function recordFailure(
  scope: string,
  ipAddress: string,
  now: Date,
): Promise<void> {
  const windowStart = resolveWindowStart(now);

  await prisma.rateLimitCounter.upsert({
    where: { scope_ipAddress_windowStart: { scope, ipAddress, windowStart } },
    create: { scope, ipAddress, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  await prisma.rateLimitCounter.deleteMany({
    where: { windowStart: { lt: new Date(now.getTime() - RETENTION_MS) } },
  });
}
