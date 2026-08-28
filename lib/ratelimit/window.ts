/**
 * Jendela tetap sepuluh menit, ambang dua puluh KEGAGALAN — bukan dua
 * puluh permintaan. Alasannya keputusan U4-5: dua ratus peserta di WiFi
 * ruang acara berbagi satu alamat IP, sehingga menghitung seluruh
 * permintaan akan mencekik satu ruangan penuh peserta sah alih-alih
 * penebak itemId. Akses yang berhasil tidak pernah menaikkan penghitung.
 *
 * Murni, tanpa Prisma, supaya batas jendelanya dapat diuji tanpa
 * database — alasan yang sama yang memisahkan lib/groups/ dan lib/access/.
 */
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_FAILURES = 20;

/** Baris berjendela lebih tua dari ini disapu saat penghitung naik. */
export const RETENTION_MS = 60 * 60 * 1000;

/** Kolom `scope` ada supaya rate limit kedua kelak tidak menuntut tabel kedua. */
export const ITEM_GATE_SCOPE = "item-gate";

export function resolveWindowStart(now: Date, windowMs: number = WINDOW_MS): Date {
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

export function isOverLimit(count: number, max: number = MAX_FAILURES): boolean {
  return count >= max;
}

/**
 * Alamat IP yang tidak diketahui dikelompokkan ke satu kunci "unknown"
 * bersama, bukan melewatkan rate limit sama sekali. Di Vercel proxy
 * selalu mengisi `x-forwarded-for`, jadi ember ini hanya terpakai saat
 * aplikasi diakses langsung tanpa proxy — dan menumpuk seluruh penebak
 * tanpa header itu ke satu ember bersama tetap lebih ketat daripada
 * membiarkan mereka tidak terbatas sama sekali. `AccessLog.ipAddress`
 * tetap mencatat nilai apa adanya (termasuk null); hanya penghitung yang
 * memakai kunci ini.
 */
export function rateLimitKey(ipAddress: string | null): string {
  return ipAddress ?? "unknown";
}
